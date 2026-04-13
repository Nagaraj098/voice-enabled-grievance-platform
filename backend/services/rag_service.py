# # backend/services/rag_service.py

# import json
# import os

# KNOWLEDGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge")


# def search_knowledge(query: str, top_k: int = 3) -> str:
#     """
#     Search across all knowledge base JSONs.
#     Handles: policies, common_grievances, faq, contact_info, services.
#     Returns relevant content as context string for LLM.
#     """
#     if not os.path.exists(KNOWLEDGE_DIR):
#         return ""

#     query_words = [w.lower() for w in query.split() if len(w) > 2]
#     if not query_words:
#         return ""

#     results = []

#     for filename in os.listdir(KNOWLEDGE_DIR):
#         if not filename.endswith(".json"):
#             continue

#         path = os.path.join(KNOWLEDGE_DIR, filename)
#         try:
#             with open(path, encoding="utf-8") as f:
#                 data = json.load(f)
#         except Exception:
#             continue

#         category = data.get("category", "")
#         department = data.get("department", "")

#         def matches(text: str) -> bool:
#             text_lower = text.lower()
#             return any(word in text_lower for word in query_words)

#         # ── Search common_grievances ──────────────────────────────
#         for g in data.get("common_grievances", []):
#             issue = g.get("issue", "")
#             resolution = g.get("resolution", "")
#             if matches(issue) or matches(resolution):
#                 results.append({
#                     "score": 3,  # highest priority
#                     "text": (
#                         f"[{category}] Issue: {issue}\n"
#                         f"Resolution: {resolution}\n"
#                         f"Resolution Time: {g.get('resolution_time', 'N/A')}\n"
#                         f"Severity: {g.get('severity', 'N/A')}"
#                     )
#                 })

#         # ── Search FAQ ────────────────────────────────────────────
#         for faq in data.get("faq", []):
#             question = faq.get("question", "")
#             answer = faq.get("answer", "")
#             if matches(question) or matches(answer):
#                 results.append({
#                     "score": 2,
#                     "text": f"[{category}] Q: {question}\nA: {answer}"
#                 })

#         # ── Search policies ───────────────────────────────────────
#         for policy in data.get("policies", []):
#             rule = policy.get("rule", "")
#             if matches(rule):
#                 results.append({
#                     "score": 1,
#                     "text": f"[{category}] Policy: {rule}"
#                 })

#         # ── Search contact info if asking about contact/helpline ──
#         contact_keywords = ["contact", "helpline", "number", "call", "phone", "email", "website", "report"]
#         if any(word in query.lower() for word in contact_keywords):
#             contact = data.get("contact_info", {})
#             if contact:
#                 results.append({
#                     "score": 2,
#                     "text": (
#                         f"[{category}] Contact Info:\n"
#                         f"Helpline: {contact.get('helpline', 'N/A')}\n"
#                         f"Email: {contact.get('email', 'N/A')}\n"
#                         f"Website: {contact.get('website', 'N/A')}\n"
#                         f"Working Hours: {contact.get('working_hours', 'N/A')}\n"
#                         f"Emergency: {contact.get('emergency', 'N/A')}"
#                     )
#                 })

#         # ── Search escalation matrix ──────────────────────────────
#         escalation_keywords = ["escalate", "officer", "engineer", "commissioner", "no response"]
#         if any(word in query.lower() for word in escalation_keywords):
#             for level in data.get("escalation_matrix", []):
#                 results.append({
#                     "score": 1,
#                     "text": (
#                         f"[{category}] Escalation Level {level.get('level')}: "
#                         f"{level.get('role')} — {level.get('contact')} "
#                         f"(Escalate if: {level.get('when_to_escalate')})"
#                     )
#                 })

#     if not results:
#         return ""

#     # Sort by score and take top_k
#     results.sort(key=lambda x: x["score"], reverse=True)
#     top_results = results[:top_k]

#     context = "\n\n".join([r["text"] for r in top_results])
#     print(f"🔍 RAG found {len(top_results)} relevant sections for: '{query}'")
#     return context


# def get_all_categories() -> list:
#     """Return list of all knowledge base categories."""
#     categories = []
#     if not os.path.exists(KNOWLEDGE_DIR):
#         return categories
#     for filename in os.listdir(KNOWLEDGE_DIR):
#         if filename.endswith(".json"):
#             try:
#                 with open(os.path.join(KNOWLEDGE_DIR, filename), encoding="utf-8") as f:
#                     data = json.load(f)
#                 categories.append(data.get("category", filename))
#             except Exception:
#                 pass
#     return categories

# backend/services/rag_service.py

import json
import os
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document

KNOWLEDGE_DIR    = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge")
FAISS_INDEX_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "faiss_index")

# ✅ Free local embeddings — no API key needed
# Downloads once (~90MB), runs locally after that
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True},
)

_vectorstore = None  # cached in memory


def _load_documents() -> list[Document]:
    """Parse all knowledge JSONs into LangChain Documents."""
    docs = []

    if not os.path.exists(KNOWLEDGE_DIR):
        return docs

    for filename in os.listdir(KNOWLEDGE_DIR):
        if not filename.endswith(".json"):
            continue

        path = os.path.join(KNOWLEDGE_DIR, filename)
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print(f"⚠️ Failed to load {filename}: {e}")
            continue

        category = data.get("category", filename)

        # ── Common grievances ─────────────────────────────────────
        for g in data.get("common_grievances", []):
            docs.append(Document(
                page_content=f"Issue: {g.get('issue', '')}\nResolution: {g.get('resolution', '')}",
                metadata={
                    "category":        category,
                    "type":            "grievance",
                    "severity":        g.get("severity", ""),
                    "resolution_time": g.get("resolution_time", ""),
                }
            ))

        # ── FAQ ───────────────────────────────────────────────────
        for faq in data.get("faq", []):
            docs.append(Document(
                page_content=f"Q: {faq.get('question', '')}\nA: {faq.get('answer', '')}",
                metadata={"category": category, "type": "faq"}
            ))

        # ── Policies ──────────────────────────────────────────────
        for policy in data.get("policies", []):
            docs.append(Document(
                page_content=f"Policy: {policy.get('rule', '')}",
                metadata={"category": category, "type": "policy"}
            ))

        # ── Contact info ──────────────────────────────────────────
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
                metadata={"category": category, "type": "contact"}
            ))

        # ── Escalation matrix ─────────────────────────────────────
        for level in data.get("escalation_matrix", []):
            docs.append(Document(
                page_content=(
                    f"Escalation Level {level.get('level')}: "
                    f"{level.get('role')} at {level.get('contact')}. "
                    f"Escalate if: {level.get('when_to_escalate')}"
                ),
                metadata={"category": category, "type": "escalation"}
            ))

    print(f"📄 Loaded {len(docs)} documents from knowledge base")
    return docs


def build_index():
    """Build and save FAISS index. Runs automatically if index missing."""
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
    """Call this after uploading new knowledge files."""
    global _vectorstore
    _vectorstore = None
    if os.path.exists(FAISS_INDEX_PATH):
        import shutil
        shutil.rmtree(FAISS_INDEX_PATH)
        print("🗑 Old index deleted")
    build_index()


def _get_vectorstore():
    """Load index from disk or build if missing."""
    global _vectorstore
    if _vectorstore is not None:
        return _vectorstore
    if os.path.exists(FAISS_INDEX_PATH):
        print("📂 Loading FAISS index from disk...")
        _vectorstore = FAISS.load_local(
            FAISS_INDEX_PATH,
            embeddings,
            allow_dangerous_deserialization=True
        )
        print("✅ FAISS index loaded")
    else:
        build_index()
    return _vectorstore


def search_knowledge(query: str, top_k: int = 3) -> str:
    """
    Semantic search across knowledge base.
    Returns context string for LLM.
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


def get_all_categories() -> list:
    """Return list of all knowledge base categories."""
    categories = []
    if not os.path.exists(KNOWLEDGE_DIR):
        return categories
    for filename in os.listdir(KNOWLEDGE_DIR):
        if filename.endswith(".json"):
            try:
                with open(os.path.join(KNOWLEDGE_DIR, filename), encoding="utf-8") as f:
                    data = json.load(f)
                categories.append(data.get("category", filename))
            except Exception:
                pass
    return categories