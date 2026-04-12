# backend/routes/tickets.py

import json
import os
from fastapi import APIRouter

router = APIRouter()

SUMMARIES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "summaries")


def load_all_summaries() -> list:
    """Load all saved session summaries as tickets."""
    tickets = []
    if not os.path.exists(SUMMARIES_DIR):
        return tickets

    for filename in sorted(os.listdir(SUMMARIES_DIR), reverse=True):
        if not filename.endswith(".json"):
            continue
        path = os.path.join(SUMMARIES_DIR, filename)
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            # ✅ Add ticket_id from filename
            data["ticket_id"] = filename.replace(".json", "")[:8].upper()
            tickets.append(data)
        except Exception as e:
            print(f"⚠️ Failed to load {filename}: {e}")

    return tickets


@router.get("/tickets")
def get_tickets():
    """Get all tickets for dashboard."""
    tickets = load_all_summaries()
    return {
        "total": len(tickets),
        "open": sum(1 for t in tickets if t.get("resolution_status") != "Resolved"),
        "recent_calls": len(tickets),
        "tickets": tickets
    }


@router.get("/tickets/{session_id}")
def get_ticket(session_id: str):
    """Get a specific ticket by session ID."""
    path = os.path.join(SUMMARIES_DIR, f"{session_id}.json")
    if not os.path.exists(path):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Ticket not found")
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    data["ticket_id"] = session_id[:8].upper()
    return data