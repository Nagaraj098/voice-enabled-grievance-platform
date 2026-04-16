# from fastapi import APIRouter, UploadFile, File, HTTPException
# import json
# import os

# router = APIRouter()

# KNOWLEDGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge")
# os.makedirs(KNOWLEDGE_DIR, exist_ok=True)


# @router.get("/knowledge")
# def list_knowledge():
#     """List all uploaded knowledge base files."""
#     files = []
#     for f in os.listdir(KNOWLEDGE_DIR):
#         if f.endswith(".json"):
#             path = os.path.join(KNOWLEDGE_DIR, f)
#             with open(path) as fp:
#                 data = json.load(fp)
#             files.append({
#                 "filename": f,
#                 "category": data.get("category", "Unknown"),
#                 "policies_count": len(data.get("policies", []))
#             })
#     return {"knowledge_bases": files}


# @router.post("/knowledge/upload")
# async def upload_knowledge(file: UploadFile = File(...)):
#     """Upload a new knowledge base JSON file."""
#     if not file.filename.endswith(".json"):
#         raise HTTPException(status_code=400, detail="Only JSON files allowed")

#     content = await file.read()

#     try:
#         data = json.loads(content)
#     except json.JSONDecodeError:
#         raise HTTPException(status_code=400, detail="Invalid JSON file")

#     path = os.path.join(KNOWLEDGE_DIR, file.filename)
#     with open(path, "w") as f:
#         json.dump(data, f, indent=2)

#     return {"ok": True, "filename": file.filename, "category": data.get("category")}


# @router.get("/knowledge/{filename}")
# def get_knowledge(filename: str):
#     """Get contents of a specific knowledge base file."""
#     path = os.path.join(KNOWLEDGE_DIR, f"{filename}")
#     if not os.path.exists(path):
#         raise HTTPException(status_code=404, detail="Knowledge base not found")
#     with open(path) as f:
#         return json.load(f)


# @router.delete("/knowledge/{filename}")
# def delete_knowledge(filename: str):
#     """Delete a knowledge base file."""
#     path = os.path.join(KNOWLEDGE_DIR, filename)
#     if not os.path.exists(path):
#         raise HTTPException(status_code=404, detail="File not found")
#     os.remove(path)
#     return {"ok": True, "deleted": filename}

# backend/routes/knowledge.py

from fastapi import APIRouter, UploadFile, File, HTTPException, Request
import json
import os

router = APIRouter()

KNOWLEDGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge")
os.makedirs(KNOWLEDGE_DIR, exist_ok=True)


@router.get("/knowledge")
def list_knowledge():
    files = []
    for f in os.listdir(KNOWLEDGE_DIR):
        if f.endswith(".json"):
            path = os.path.join(KNOWLEDGE_DIR, f)
            with open(path, encoding="utf-8") as fp:
                data = json.load(fp)
            files.append({
                "filename":      f,
                "category":      data.get("category", "Unknown"),
                "policies_count": len(data.get("policies", []))
            })
    return {"knowledge_bases": files}


@router.post("/knowledge/upload")
async def upload_knowledge(file: UploadFile = File(...)):
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Only JSON files allowed")

    content = await file.read()

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")

    path = os.path.join(KNOWLEDGE_DIR, file.filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    # ✅ Rebuild FAISS index after upload
    try:
        from services.rag_service import rebuild_index
        rebuild_index()
        print(f"✅ FAISS index rebuilt after uploading {file.filename}")
    except Exception as e:
        print(f"⚠️ Index rebuild failed: {e}")

    return {"ok": True, "filename": file.filename, "category": data.get("category")}


@router.get("/knowledge/{filename}")
def get_knowledge(filename: str):
    path = os.path.join(KNOWLEDGE_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@router.put("/knowledge/{filename}")
async def update_knowledge(filename: str, request: Request):
    path = os.path.join(KNOWLEDGE_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    try:
        from services.rag_service import rebuild_index
        rebuild_index()
    except Exception as e:
        print(f"⚠️ Index rebuild failed: {e}")

    return {"ok": True, "updated": filename}


@router.delete("/knowledge/{filename}")
def delete_knowledge(filename: str):
    path = os.path.join(KNOWLEDGE_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(path)

    # ✅ Rebuild index after deletion
    try:
        from services.rag_service import rebuild_index
        rebuild_index()
    except Exception as e:
        print(f"⚠️ Index rebuild failed: {e}")

    return {"ok": True, "deleted": filename}