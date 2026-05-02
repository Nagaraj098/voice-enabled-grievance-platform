import json
import os
import shutil

from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document

KNOWLEDGE_DIR    = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge")
FAISS_INDEX_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "faiss_index")

# ✅ Free local embeddings — downloads once (~90MB), runs locally after that
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True},
)

_vectorstore = None  # cached in memory


# ─────────────────────────────────────────────
# PDF LOADER
# ─────────────────────────────────────────────
def _load_pdf(path: str, filename: str) -> list[Document]:
    """Extract text from PDF and split into chunks."""
    docs = []
    try:
        from pypdf import PdfReader

        reader = PdfReader(path)
        full_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

        if not full_text.strip():
            print(f"⚠️ PDF {filename} has no extractable text (scanned image PDF?)")
            return docs

        # Split into ~500 char chunks with 100 char overlap for better retrieval
        chunk_size = 500
        overlap    = 100
        words      = full_text.split()
        chunks     = []
        current    = []
        current_len = 0

        for word in words:
            current.append(word)
            current_len += len(word) + 1
            if current_len >= chunk_size:
                chunks.append(" ".join(current))
                # keep last few words as overlap
                overlap_words = current[-int(overlap / 6):]
                current = overlap_words
                current_len = sum(len(w) + 1 for w in overlap_words)

        if current:
            chunks.append(" ".join(current))

        category = os.path.splitext(filename)[0].replace("_", " ").title()

        for i, chunk in enumerate(chunks):
            docs.append(Document(
                page_content=chunk,
                metadata={
                    "category": category,
                    "type":     "pdf",
                    "source":   filename,
                    "chunk":    i + 1,
                }
            ))

        print(f"📄 PDF {filename}: extracted {len(chunks)} chunks")

    except ImportError:
        print("❌ pypdf not installed. Run: pip install pypdf")
    except Exception as e:
        print(f"❌ Failed to load PDF {filename}: {e}")

    return docs


# ─────────────────────────────────────────────
# JSON LOADER
# ─────────────────────────────────────────────
def _load_json(path: str, filename: str) -> list[Document]:
    """Parse structured knowledge JSON into LangChain Documents."""
    docs = []
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"⚠️ Failed to load {filename}: {e}")
        return docs

    category = data.get("category", filename)

    # Common grievances
    for g in data.get("common_grievances", []):
        docs.append(Document(
            page_content=f"Issue: {g.get('issue', '')}\nResolution: {g.get('resolution', '')}",
            metadata={
                "category":        category,
                "type":            "grievance",
                "severity":        g.get("severity", ""),
                "resolution_time": g.get("resolution_time", ""),
                "source":          filename,
            }
        ))

    # FAQ
    for faq in data.get("faq", []):
        docs.append(Document(
            page_content=f"Q: {faq.get('question', '')}\nA: {faq.get('answer', '')}",
            metadata={"category": category, "type": "faq", "source": filename}
        ))

    # Policies
    for policy in data.get("policies", []):
        docs.append(Document(
            page_content=f"Policy: {policy.get('rule', '')}",
            metadata={"category": category, "type": "policy", "source": filename}
        ))

    # Contact info
    contact = data.get("contact_info", {})
    if contact:
        docs.append(Document(
            page_content=(
                f"Contact for {category}:\n"
                f"Helpline: {contact.get('helpline', 'N/A')}\n"
                f"Email: {contact.get('email', 'N/A')}\n"
                f"Website: {contact.get('website', 'N/A')}\n"
                f"Hours: {contact.get('working_hours', 'N/A')}\n"
                f"Emergency: {contact.get('emergency', 'N/A')}"
            ),
            metadata={"category": category, "type": "contact", "source": filename}
        ))

    # Escalation matrix
    for level in data.get("escalation_matrix", []):
        docs.append(Document(
            page_content=(
                f"Escalation Level {level.get('level')}: "
                f"{level.get('role')} at {level.get('contact')}. "
                f"Escalate if: {level.get('when_to_escalate')}"
            ),
            metadata={"category": category, "type": "escalation", "source": filename}
        ))

    return docs


# ─────────────────────────────────────────────
# MAIN DOCUMENT LOADER — JSON + PDF
# ─────────────────────────────────────────────
def _load_documents() -> list[Document]:
    """Load all JSON and PDF files from knowledge directory."""
    docs = []

    if not os.path.exists(KNOWLEDGE_DIR):
        print(f"⚠️ Knowledge directory not found: {KNOWLEDGE_DIR}")
        return docs

    for filename in os.listdir(KNOWLEDGE_DIR):
        path = os.path.join(KNOWLEDGE_DIR, filename)

        if filename.endswith(".json"):
            json_docs = _load_json(path, filename)
            docs.extend(json_docs)
            print(f"✅ JSON loaded: {filename} → {len(json_docs)} docs")

        elif filename.endswith(".pdf"):
            pdf_docs = _load_pdf(path, filename)
            docs.extend(pdf_docs)
            print(f"✅ PDF loaded: {filename} → {len(pdf_docs)} chunks")

        else:
            # Skip unsupported files silently
            continue

    print(f"📦 Total documents loaded: {len(docs)}")
    return docs


# ─────────────────────────────────────────────
# INDEX MANAGEMENT
# ─────────────────────────────────────────────
def build_index():
    """Build and save FAISS index from all knowledge files."""
    global _vectorstore
    print("🔨 Building FAISS index...")
    docs = _load_documents()
    if not docs:
        print("⚠️ No documents found — knowledge base is empty")
        return
    _vectorstore = FAISS.from_documents(docs, embeddings)
    _vectorstore.save_local(FAISS_INDEX_PATH)
    print(f"✅ FAISS index built: {len(docs)} docs → {FAISS_INDEX_PATH}")


def rebuild_index():
    """
    Call this after uploading new knowledge files (JSON or PDF).
    Deletes old index and rebuilds from scratch.
    """
    global _vectorstore
    _vectorstore = None
    if os.path.exists(FAISS_INDEX_PATH):
        shutil.rmtree(FAISS_INDEX_PATH)
        print("🗑 Old FAISS index deleted")
    build_index()


def _get_vectorstore():
    """Load index from disk or build fresh if missing."""
    global _vectorstore
    if _vectorstore is not None:
        return _vectorstore
    if os.path.exists(FAISS_INDEX_PATH):
        print("📂 Loading FAISS index from disk...")
        _vectorstore = FAISS.load_local(
            FAISS_INDEX_PATH,
            embeddings,
            allow_dangerous_deserialization=True,
        )
        print("✅ FAISS index loaded")
    else:
        build_index()
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
            print(f"⚠️ No RAG results for: '{query}'")
            return ""

        context = "\n\n".join([
            f"[{doc.metadata.get('category', 'General')}] {doc.page_content}"
            for doc in results
        ])
        print(f"🔍 RAG found {len(results)} results for: '{query}'")
        return context

    except Exception as e:
        print(f"❌ RAG search error: {e}")
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