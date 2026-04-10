# backend/routes/summary.py

import json
import os
from fastapi import APIRouter, HTTPException

router = APIRouter()

SUMMARIES_DIR = os.path.join(os.path.dirname(os.path.dirname(file)), "summaries")
os.makedirs(SUMMARIES_DIR, exist_ok=True)


@router.get("/summary/{session_id}")
def get_summary(session_id: str):
    path = os.path.join(SUMMARIES_DIR, f"{session_id}.json")

    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Summary not found")

    with open(path, "r") as f:
        return json.load(f)