# from fastapi import APIRouter, UploadFile, File, HTTPException, Request
# import json
# import os

# router = APIRouter()

# KNOWLEDGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge")
# os.makedirs(KNOWLEDGE_DIR, exist_ok=True)

# ALLOWED_EXTENSIONS = {".json", ".pdf"}


# def _rebuild():
#     try:
#         from services.rag_service import rebuild_index
#         rebuild_index()
#         print("✅ FAISS index rebuilt")
#     except Exception as e:
#         print(f"⚠️ Index rebuild failed: {e}")


# @router.get("/knowledge")
# def list_knowledge():
#     files = []
#     for f in os.listdir(KNOWLEDGE_DIR):
#         ext = os.path.splitext(f)[1].lower()
#         if ext not in ALLOWED_EXTENSIONS:
#             continue

#         path = os.path.join(KNOWLEDGE_DIR, f)
#         entry = {"filename": f, "type": ext.lstrip(".")}

#         if ext == ".json":
#             try:
#                 with open(path, encoding="utf-8") as fp:
#                     data = json.load(fp)
#                 entry["category"]         = data.get("category", "Unknown")
#                 entry["policies_count"]   = len(data.get("policies", []))
#                 entry["grievances_count"] = len(data.get("common_grievances", []))
#                 entry["faq_count"]        = len(data.get("faq", []))
#             except Exception:
#                 entry["category"] = "Unknown"
#         elif ext == ".pdf":
#             entry["category"] = os.path.splitext(f)[0].replace("_", " ").title()
#             entry["size_kb"]   = round(os.path.getsize(path) / 1024, 1)

#         files.append(entry)

#     return {"knowledge_bases": files, "total": len(files)}


# @router.post("/knowledge/upload")
# async def upload_knowledge(file: UploadFile = File(...)):
#     ext = os.path.splitext(file.filename)[1].lower()

#     if ext not in ALLOWED_EXTENSIONS:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Only JSON and PDF files allowed. Got: {ext}"
#         )

#     content = await file.read()

#     if ext == ".json":
#         try:
#             data = json.loads(content)
#         except json.JSONDecodeError:
#             raise HTTPException(status_code=400, detail="Invalid JSON file")
#         category = data.get("category", "Unknown")
#     else:
#         data     = None
#         category = os.path.splitext(file.filename)[0].replace("_", " ").title()

#     path = os.path.join(KNOWLEDGE_DIR, file.filename)
#     with open(path, "wb") as f:
#         f.write(content)

#     print(f"📁 Saved: {file.filename}")
#     _rebuild()

#     return {
#         "ok":       True,
#         "filename": file.filename,
#         "type":     ext.lstrip("."),
#         "category": category,
#         "message":  f"Uploaded and indexed {file.filename}"
#     }


# @router.get("/knowledge/{filename}")
# def get_knowledge(filename: str):
#     path = os.path.join(KNOWLEDGE_DIR, filename)
#     if not os.path.exists(path):
#         raise HTTPException(status_code=404, detail="File not found")

#     ext = os.path.splitext(filename)[1].lower()
#     if ext == ".json":
#         with open(path, encoding="utf-8") as f:
#             return json.load(f)
#     elif ext == ".pdf":
#         return {
#             "filename": filename,
#             "type":     "pdf",
#             "size_kb":  round(os.path.getsize(path) / 1024, 1),
#             "message":  "PDF is indexed in FAISS for RAG search"
#         }
#     raise HTTPException(status_code=400, detail="Unsupported file type")


# @router.put("/knowledge/{filename}")
# async def update_knowledge(filename: str, request: Request):
#     path = os.path.join(KNOWLEDGE_DIR, filename)
#     if not os.path.exists(path):
#         raise HTTPException(status_code=404, detail="File not found")
#     try:
#         data = await request.json()
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid JSON payload")
#     with open(path, "w", encoding="utf-8") as f:
#         json.dump(data, f, indent=2)
#     _rebuild()
#     return {"ok": True, "updated": filename}


# @router.delete("/knowledge/{filename}")
# def delete_knowledge(filename: str):
#     path = os.path.join(KNOWLEDGE_DIR, filename)
#     if not os.path.exists(path):
#         raise HTTPException(status_code=404, detail="File not found")
#     os.remove(path)
#     print(f"🗑 Deleted: {filename}")
#     _rebuild()
#     return {"ok": True, "deleted": filename, "message": "File deleted and index updated"}

# backend/routes/knowledge.py

from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi.responses import FileResponse
import json
import os

router = APIRouter()

KNOWLEDGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge")
os.makedirs(KNOWLEDGE_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".json", ".pdf"}


def _rebuild():
    try:
        from services.rag_service import rebuild_index
        rebuild_index()
        print("✅ FAISS index rebuilt")
    except Exception as e:
        print(f"⚠️ Index rebuild failed: {e}")


@router.get("/knowledge")
def list_knowledge():
    files = []
    for f in os.listdir(KNOWLEDGE_DIR):
        ext = os.path.splitext(f)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            continue

        path = os.path.join(KNOWLEDGE_DIR, f)
        entry = {"filename": f, "type": ext.lstrip(".")}

        if ext == ".json":
            try:
                with open(path, encoding="utf-8") as fp:
                    data = json.load(fp)
                entry["category"]         = data.get("category", "Unknown")
                entry["policies_count"]   = len(data.get("policies", []))
                entry["grievances_count"] = len(data.get("common_grievances", []))
                entry["faq_count"]        = len(data.get("faq", []))
            except Exception:
                entry["category"] = "Unknown"
        elif ext == ".pdf":
            entry["category"] = os.path.splitext(f)[0].replace("_", " ").title()
            entry["size_kb"]   = round(os.path.getsize(path) / 1024, 1)

        files.append(entry)

    return {"knowledge_bases": files, "total": len(files)}


@router.post("/knowledge/upload")
async def upload_knowledge(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Only JSON and PDF files allowed. Got: {ext}"
        )

    content = await file.read()

    if ext == ".json":
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON file")
        category = data.get("category", "Unknown")
    else:
        category = os.path.splitext(file.filename)[0].replace("_", " ").title()

    path = os.path.join(KNOWLEDGE_DIR, file.filename)
    with open(path, "wb") as f:
        f.write(content)

    print(f"📁 Saved: {file.filename}")
    _rebuild()

    return {
        "ok":       True,
        "filename": file.filename,
        "type":     ext.lstrip("."),
        "category": category,
        "message":  f"Uploaded and indexed {file.filename}"
    }


@router.get("/knowledge/{filename}")
def get_knowledge(filename: str):
    path = os.path.join(KNOWLEDGE_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")

    ext = os.path.splitext(filename)[1].lower()

    # ✅ Serve PDF as actual file for browser preview
    if ext == ".pdf":
        return FileResponse(
            path,
            media_type="application/pdf",
            filename=filename,
            headers={"Content-Disposition": f"inline; filename={filename}"}
        )

    # ✅ Serve JSON as parsed data
    if ext == ".json":
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    raise HTTPException(status_code=400, detail="Unsupported file type")


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
    _rebuild()
    return {"ok": True, "updated": filename}


@router.delete("/knowledge/{filename}")
def delete_knowledge(filename: str):
    path = os.path.join(KNOWLEDGE_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(path)
    print(f"🗑 Deleted: {filename}")
    _rebuild()
    return {"ok": True, "deleted": filename}