# backend/services/rag_service.py

import json
import os

KNOWLEDGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge")


def search_knowledge(query: str, top_k: int = 3) -> str:
    """
    Search across all knowledge base JSONs.
    Handles: policies, common_grievances, faq, contact_info, services.
    Returns relevant content as context string for LLM.
    """
    if not os.path.exists(KNOWLEDGE_DIR):
        return ""

    query_words = [w.lower() for w in query.split() if len(w) > 2]
    if not query_words:
        return ""

    results = []

    for filename in os.listdir(KNOWLEDGE_DIR):
        if not filename.endswith(".json"):
            continue

        path = os.path.join(KNOWLEDGE_DIR, filename)
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            continue

        category = data.get("category", "")
        department = data.get("department", "")

        def matches(text: str) -> bool:
            text_lower = text.lower()
            return any(word in text_lower for word in query_words)

        # ── Search common_grievances ──────────────────────────────
        for g in data.get("common_grievances", []):
            issue = g.get("issue", "")
            resolution = g.get("resolution", "")
            if matches(issue) or matches(resolution):
                results.append({
                    "score": 3,  # highest priority
                    "text": (
                        f"[{category}] Issue: {issue}\n"
                        f"Resolution: {resolution}\n"
                        f"Resolution Time: {g.get('resolution_time', 'N/A')}\n"
                        f"Severity: {g.get('severity', 'N/A')}"
                    )
                })

        # ── Search FAQ ────────────────────────────────────────────
        for faq in data.get("faq", []):
            question = faq.get("question", "")
            answer = faq.get("answer", "")
            if matches(question) or matches(answer):
                results.append({
                    "score": 2,
                    "text": f"[{category}] Q: {question}\nA: {answer}"
                })

        # ── Search policies ───────────────────────────────────────
        for policy in data.get("policies", []):
            rule = policy.get("rule", "")
            if matches(rule):
                results.append({
                    "score": 1,
                    "text": f"[{category}] Policy: {rule}"
                })

        # ── Search contact info if asking about contact/helpline ──
        contact_keywords = ["contact", "helpline", "number", "call", "phone", "email", "website", "report"]
        if any(word in query.lower() for word in contact_keywords):
            contact = data.get("contact_info", {})
            if contact:
                results.append({
                    "score": 2,
                    "text": (
                        f"[{category}] Contact Info:\n"
                        f"Helpline: {contact.get('helpline', 'N/A')}\n"
                        f"Email: {contact.get('email', 'N/A')}\n"
                        f"Website: {contact.get('website', 'N/A')}\n"
                        f"Working Hours: {contact.get('working_hours', 'N/A')}\n"
                        f"Emergency: {contact.get('emergency', 'N/A')}"
                    )
                })

        # ── Search escalation matrix ──────────────────────────────
        escalation_keywords = ["escalate", "officer", "engineer", "commissioner", "no response"]
        if any(word in query.lower() for word in escalation_keywords):
            for level in data.get("escalation_matrix", []):
                results.append({
                    "score": 1,
                    "text": (
                        f"[{category}] Escalation Level {level.get('level')}: "
                        f"{level.get('role')} — {level.get('contact')} "
                        f"(Escalate if: {level.get('when_to_escalate')})"
                    )
                })

    if not results:
        return ""

    # Sort by score and take top_k
    results.sort(key=lambda x: x["score"], reverse=True)
    top_results = results[:top_k]

    context = "\n\n".join([r["text"] for r in top_results])
    print(f"🔍 RAG found {len(top_results)} relevant sections for: '{query}'")
    return context


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