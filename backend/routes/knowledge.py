from fastapi import APIRouter, UploadFile, File, HTTPException
import json
import os

router = APIRouter()

KNOWLEDGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge")
os.makedirs(KNOWLEDGE_DIR, exist_ok=True)


@router.get("/knowledge")
def list_knowledge():
    """List all uploaded knowledge base files."""
    files = []
    for f in os.listdir(KNOWLEDGE_DIR):
        if f.endswith(".json"):
            path = os.path.join(KNOWLEDGE_DIR, f)
            with open(path) as fp:
                data = json.load(fp)
            files.append({
                "filename": f,
                "category": data.get("category", "Unknown"),
                "policies_count": len(data.get("policies", []))
            })
    return {"knowledge_bases": files}


@router.post("/knowledge/upload")
async def upload_knowledge(file: UploadFile = File(...)):
    """Upload a new knowledge base JSON file."""
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Only JSON files allowed")

    content = await file.read()

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")

    path = os.path.join(KNOWLEDGE_DIR, file.filename)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

    return {"ok": True, "filename": file.filename, "category": data.get("category")}


@router.get("/knowledge/{filename}")
def get_knowledge(filename: str):
    """Get contents of a specific knowledge base file."""
    path = os.path.join(KNOWLEDGE_DIR, f"{filename}")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    with open(path) as f:
        return json.load(f)


@router.delete("/knowledge/{filename}")
def delete_knowledge(filename: str):
    """Delete a knowledge base file."""
    path = os.path.join(KNOWLEDGE_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(path)
    return {"ok": True, "deleted": filename}