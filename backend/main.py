# from fastapi import FastAPI, WebSocket, Request
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles          # NEW — for avatar serving
# from routes.token import router as token_router
# from routes.summary import router as summary_router
# from sockets.connection_manager import manager
# from sessions.session_store import store
# from services.llm_service import generate_response
# from agent.state_machine import Stage
# import json, os
# from routes.knowledge import router as knowledge_router
# from routes.tickets import router as tickets_router
# from routes.profile import router as profile_router


# SUMMARIES_DIR = os.path.join(os.path.dirname(__file__), "summaries")
# AVATAR_DIR    = os.path.join(os.path.dirname(__file__), "avatars")   # NEW
# os.makedirs(SUMMARIES_DIR, exist_ok=True)
# os.makedirs(AVATAR_DIR,    exist_ok=True)                             # NEW

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # NEW — serve avatar images as static files at /avatars/filename.jpg
# app.mount("/avatars", StaticFiles(directory=AVATAR_DIR), name="avatars")

# app.include_router(token_router)
# app.include_router(summary_router)
# app.include_router(knowledge_router)
# app.include_router(tickets_router)
# app.include_router(profile_router)


# # Internal broadcast endpoint — agent posts here (UNCHANGED)
# @app.post("/internal/broadcast")
# async def internal_broadcast(request: Request):
#     data = await request.json()
#     await manager.broadcast(data)
#     return {"ok": True}


# # WebSocket — UNCHANGED from your working version
# @app.websocket("/ws/transcript")
# async def websocket_endpoint(websocket: WebSocket):
#     await manager.connect(websocket)

#     try:
#         while True:
#             await websocket.receive_text()
#     except:
#         manager.disconnect(websocket)


# # UPDATED — also broadcasts stop_audio so frontend clears audio queue on end call
# @app.post("/session/stop")
# async def stop_session():
#     """Called when user clicks End Call — stops processing."""
#     await manager.broadcast({"type": "session_stopped"})
#     await manager.broadcast({"type": "stop_audio"})   # NEW — clears frontend audio queue
#     return {"ok": True}

from fastapi import FastAPI, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.token import router as token_router
from routes.summary import router as summary_router
from sockets.connection_manager import manager
from sessions.session_store import store
from services.llm_service import generate_response
from agent.state_machine import Stage
import json, os
from routes.knowledge import router as knowledge_router
from routes.tickets import router as tickets_router
from routes.profile import router as profile_router


SUMMARIES_DIR = os.path.join(os.path.dirname(__file__), "summaries")
AVATAR_DIR    = os.path.join(os.path.dirname(__file__), "avatars")
os.makedirs(SUMMARIES_DIR, exist_ok=True)
os.makedirs(AVATAR_DIR,    exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/avatars", StaticFiles(directory=AVATAR_DIR), name="avatars")

app.include_router(token_router)
app.include_router(summary_router)
app.include_router(knowledge_router)
app.include_router(tickets_router)
app.include_router(profile_router)


# ─── JSON broadcast (control messages) ───────────────────────────────────────
@app.post("/internal/broadcast")
async def internal_broadcast(request: Request):
    data = await request.json()
    await manager.broadcast(data)
    return {"ok": True}


# ─── NEW: Binary broadcast (raw MP3 chunks from TTS stream) ──────────────────
@app.post("/internal/broadcast_binary")
async def internal_broadcast_binary(request: Request):
    """
    Receives raw MP3 bytes from agent and forwards them as binary
    WebSocket frames to all connected frontends.
    Frontend MediaSource API plays bytes as they arrive.
    """
    chunk = await request.body()
    await manager.broadcast_binary(chunk)
    return {"ok": True}


# ─── WebSocket ────────────────────────────────────────────────────────────────
@app.websocket("/ws/transcript")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(websocket)


# ─── Session stop ─────────────────────────────────────────────────────────────
@app.post("/session/stop")
async def stop_session():
    """Called when user clicks End Call — stops processing."""
    await manager.broadcast({"type": "session_stopped"})
    await manager.broadcast({"type": "stop_audio"})
    return {"ok": True}