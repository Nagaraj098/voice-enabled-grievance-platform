# backend/sessions/session_store.py

import uuid
from typing import Optional
from agent.state_machine import Stage


class Session:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.stage = Stage.GREETING
        self.history = []        # full conversation history
        self.user_name = None
        self.issue_category = None
        self.issue_severity = None
        self.issue_description = None

    def add_message(self, role: str, content: str):
        """role: 'user' or 'assistant'"""
        self.history.append({"role": role, "content": content})

    def to_dict(self):
        return {
            "session_id": self.session_id,
            "stage": self.stage.value,
            "history": self.history,
            "user_name": self.user_name,
            "issue_category": self.issue_category,
            "issue_severity": self.issue_severity,
            "issue_description": self.issue_description,
        }


class SessionStore:
    def __init__(self):
        # In-memory store keyed by session_id
        self._sessions: dict[str, Session] = {}

    def create_session(self) -> Session:
        session_id = str(uuid.uuid4())
        session = Session(session_id)
        self._sessions[session_id] = session
        print(f"✅ Session created: {session_id}")
        return session

    def get_session(self, session_id: str) -> Optional[Session]:
        return self._sessions.get(session_id)

    def delete_session(self, session_id: str):
        if session_id in self._sessions:
            del self._sessions[session_id]
            print(f"🗑 Session deleted: {session_id}")

    def get_all_sessions(self) -> list:
        return [s.to_dict() for s in self._sessions.values()]


# ✅ Global singleton — shared across the app
store = SessionStore()