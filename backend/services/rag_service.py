import json
import os
import shutil

from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document

load_dotenv()

KNOWLEDGE_DIR    = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge")
FAISS_INDEX_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "faiss_index")
KB_SOURCES_SIG   = "kb_sources.sig"

# Free local embeddings — downloads once (~90MB), runs locally after that
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True},
)

_vectorstore = None
_cached_kb_fp: str | None = None
_force_rebuild_used = False


def _knowledge_fingerprint() -> str:
    """Stable fingerprint of all knowledge sources (mtime + size per file)."""
    parts: list[str] = []
    if not os.path.isdir(KNOWLEDGE_DIR):
        return ""
    for name in sorted(os.listdir(KNOWLEDGE_DIR)):
        if not (name.endswith(".json") or name.endswith(".pdf")):
            continue
        path = os.path.join(KNOWLEDGE_DIR, name)
        if not os.path.isfile(path):
            continue
        st = os.stat(path)
        parts.append(f"{name}:{st.st_size}:{st.st_mtime_ns}")
    return "\n".join(parts)


def _read_index_fingerprint() -> str | None:
    sig_path = os.path.join(FAISS_INDEX_PATH, KB_SOURCES_SIG)
    if not os.path.isfile(sig_path):
        return None
    try:
        with open(sig_path, encoding="utf-8") as f:
            return f.read().strip()
    except OSError:
        return None


def _write_index_fingerprint() -> None:
    os.makedirs(FAISS_INDEX_PATH, exist_ok=True)
    sig_path = os.path.join(FAISS_INDEX_PATH, KB_SOURCES_SIG)
    with open(sig_path, "w", encoding="utf-8") as f:
        f.write(_knowledge_fingerprint())


def _env_force_rebuild() -> bool:
    return os.getenv("FORCE_REBUILD_FAISS", "").lower() in ("1", "true", "yes")


# ─────────────────────────────────────────────
# PDF LOADER
# ─────────────────────────────────────────────
def _load_pdf(path: str, filename: str) -> list[Document]:
    """Extract text from PDF and split into chunks."""
    docs: list[Document] = []
    try:
        from pypdf import PdfReader

        reader = PdfReader(path)
        full_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

        if not full_text.strip():
            print(f"[WARN] PDF {filename} has no extractable text (scanned image PDF?)")
            return docs

        chunk_size = 500
        overlap = 100
        words = full_text.split()
        chunks: list[str] = []
        current: list[str] = []
        current_len = 0

        for word in words:
            current.append(word)
            current_len += len(word) + 1
            if current_len >= chunk_size:
                chunks.append(" ".join(current))
                overlap_words = current[-int(overlap / 6) :]
                current = overlap_words
                current_len = sum(len(w) + 1 for w in overlap_words)

        if current:
            chunks.append(" ".join(current))

        category = os.path.splitext(filename)[0].replace("_", " ").title()

        for i, chunk in enumerate(chunks):
            docs.append(
                Document(
                    page_content=chunk,
                    metadata={
                        "category": category,
                        "type":     "pdf",
                        "source":   filename,
                        "chunk":    i + 1,
                    },
                )
            )

        print(f"[PDF] {filename}: extracted {len(chunks)} chunks")

    except ImportError:
        print("[ERR] pypdf not installed. Run: pip install pypdf")
    except Exception as e:
        print(f"[ERR] Failed to load PDF {filename}: {e}")

    return docs


# ─────────────────────────────────────────────
# JSON LOADER
# ─────────────────────────────────────────────
def _load_json(path: str, filename: str) -> list[Document]:
    """Parse structured knowledge JSON into LangChain Documents."""
    docs: list[Document] = []
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"[WARN] Failed to load {filename}: {e}")
        return docs

    category = data.get("category", filename)

    for g in data.get("common_grievances", []):
        docs.append(
            Document(
                page_content=(
                    f"Issue: {g.get('issue', '')}\nResolution: {g.get('resolution', '')}"
                ),
                metadata={
                    "category":        category,
                    "type":            "grievance",
                    "severity":        g.get("severity", ""),
                    "resolution_time": g.get("resolution_time", ""),
                    "source":          filename,
                },
            )
        )

    for faq in data.get("faq", []):
        docs.append(
            Document(
                page_content=f"Q: {faq.get('question', '')}\nA: {faq.get('answer', '')}",
                metadata={"category": category, "type": "faq", "source": filename},
            )
        )

    for policy in data.get("policies", []):
        docs.append(
            Document(
                page_content=f"Policy: {policy.get('rule', '')}",
                metadata={"category": category, "type": "policy", "source": filename},
            )
        )

    contact = data.get("contact_info", {})
    if contact:
        docs.append(
            Document(
                page_content=(
                    f"Contact for {category}:\n"
                    f"Helpline: {contact.get('helpline', 'N/A')}\n"
                    f"Email: {contact.get('email', 'N/A')}\n"
                    f"Website: {contact.get('website', 'N/A')}\n"
                    f"Hours: {contact.get('working_hours', 'N/A')}\n"
                    f"Emergency: {contact.get('emergency', 'N/A')}"
                ),
                metadata={"category": category, "type": "contact", "source": filename},
            )
        )

    for level in data.get("escalation_matrix", []):
        docs.append(
            Document(
                page_content=(
                    f"Escalation Level {level.get('level')}: "
                    f"{level.get('role')} at {level.get('contact')}. "
                    f"Escalate if: {level.get('when_to_escalate')}"
                ),
                metadata={"category": category, "type": "escalation", "source": filename},
            )
        )

    return docs


# ─────────────────────────────────────────────
# MAIN DOCUMENT LOADER — JSON + PDF
# ─────────────────────────────────────────────
def _load_documents() -> list[Document]:
    """Load all JSON and PDF files from knowledge directory."""
    docs: list[Document] = []

    if not os.path.exists(KNOWLEDGE_DIR):
        print(f"[WARN] Knowledge directory not found: {KNOWLEDGE_DIR}")
        return docs

    for filename in os.listdir(KNOWLEDGE_DIR):
        path = os.path.join(KNOWLEDGE_DIR, filename)

        if filename.endswith(".json"):
            json_docs = _load_json(path, filename)
            docs.extend(json_docs)
            print(f"[OK] JSON loaded: {filename} -> {len(json_docs)} docs")

        elif filename.endswith(".pdf"):
            pdf_docs = _load_pdf(path, filename)
            docs.extend(pdf_docs)
            print(f"[OK] PDF loaded: {filename} -> {len(pdf_docs)} chunks")

    print(f"[OK] Total documents loaded: {len(docs)}")
    return docs


# ─────────────────────────────────────────────
# INDEX MANAGEMENT
# ─────────────────────────────────────────────
def build_index():
    """Build and save FAISS index from all knowledge files."""
    global _vectorstore, _cached_kb_fp
    print("[RAG] Building FAISS index...")
    docs = _load_documents()
    if not docs:
        print("[WARN] No documents found — knowledge base is empty")
        _vectorstore = None
        _cached_kb_fp = None
        return
    _vectorstore = FAISS.from_documents(docs, embeddings)
    _vectorstore.save_local(FAISS_INDEX_PATH)
    _write_index_fingerprint()
    _cached_kb_fp = _knowledge_fingerprint()
    print(f"[OK] FAISS index built: {len(docs)} docs -> {FAISS_INDEX_PATH}")


def rebuild_index():
    """
    Call this after uploading new knowledge files (JSON or PDF).
    Deletes old index and rebuilds from scratch.
    """
    global _vectorstore, _cached_kb_fp
    _vectorstore = None
    _cached_kb_fp = None
    if os.path.exists(FAISS_INDEX_PATH):
        shutil.rmtree(FAISS_INDEX_PATH)
        print("[RAG] Old FAISS index deleted")
    build_index()


def _get_vectorstore():
    """
    Load FAISS from disk when it matches the current knowledge fingerprint;
    otherwise rebuild so edits to JSON/PDF are picked up automatically.
    Optional: set FORCE_REBUILD_FAISS=true once to force a rebuild at startup.
    """
    global _vectorstore, _cached_kb_fp, _force_rebuild_used

    if _env_force_rebuild() and not _force_rebuild_used:
        print("[RAG] FORCE_REBUILD_FAISS set — rebuilding index once")
        rebuild_index()
        _force_rebuild_used = True
        return _vectorstore

    fp = _knowledge_fingerprint()
    stored = _read_index_fingerprint()

    if _vectorstore is not None and _cached_kb_fp == fp and stored == fp:
        return _vectorstore

    _vectorstore = None

    if os.path.exists(FAISS_INDEX_PATH) and stored == fp:
        print("[RAG] Loading FAISS index from disk...")
        _vectorstore = FAISS.load_local(
            FAISS_INDEX_PATH,
            embeddings,
            allow_dangerous_deserialization=True,
        )
        _cached_kb_fp = fp
        print("[OK] FAISS index loaded")
        return _vectorstore

    if stored is not None and stored != fp:
        print("[RAG] Knowledge files changed — rebuilding FAISS index")
    rebuild_index()
    return _vectorstore


# ─────────────────────────────────────────────
# SEARCH
# ─────────────────────────────────────────────
def search_knowledge(query: str, top_k: int = 3) -> str:
    """
    Semantic search across all knowledge base files (JSON + PDF).
    Returns context string for LLM injection.
    """
    try:
        vs = _get_vectorstore()
        if vs is None:
            return ""

        results = vs.similarity_search(query, k=top_k)

        if not results:
            print(f"[WARN] No RAG results for: '{query}'")
            return ""

        context = "\n\n".join(
            [f"[{doc.metadata.get('category', 'General')}] {doc.page_content}" for doc in results]
        )
        print(f"[RAG] Found {len(results)} results for: '{query}'")
        return context

    except Exception as e:
        print(f"[ERR] RAG search error: {e}")
        return ""


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def get_all_categories() -> list:
    """Return list of all knowledge base categories."""
    categories = []
    if not os.path.exists(KNOWLEDGE_DIR):
        return categories
    for filename in os.listdir(KNOWLEDGE_DIR):
        path = os.path.join(KNOWLEDGE_DIR, filename)
        if filename.endswith(".json"):
            try:
                with open(path, encoding="utf-8") as f:
                    data = json.load(f)
                categories.append(data.get("category", filename))
            except Exception:
                pass
        elif filename.endswith(".pdf"):
            categories.append(os.path.splitext(filename)[0].replace("_", " ").title())
    return categories
