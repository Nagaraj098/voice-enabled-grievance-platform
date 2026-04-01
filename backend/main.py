# from fastapi import FastAPI, WebSocket, Request
# from fastapi.middleware.cors import CORSMiddleware
# from routes.token import router as token_router
# from sockets.connection_manager import manager

# app = FastAPI()

# # ✅ CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ✅ Routes
# app.include_router(token_router)

# # ✅ Internal endpoint — agent posts here → FastAPI broadcasts to frontend
# @app.post("/internal/broadcast")
# async def internal_broadcast(request: Request):
#     data = await request.json()
#     await manager.broadcast(data)
#     return {"ok": True}

# # ✅ WebSocket
# @app.websocket("/ws/transcript")
# async def websocket_endpoint(websocket: WebSocket):
#     await manager.connect(websocket)
#     try:
#         while True:
#             await websocket.receive_text()
#     except:
#         print("Transcript WebSocket closed")



# backend/main.py

from fastapi import FastAPI, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware
from routes.token import router as token_router
from routes.summary import router as summary_router
from sockets.connection_manager import manager
from sessions.session_store import store
from services.llm_service import generate_response
from agent.state_machine import Stage
import json, os

SUMMARIES_DIR = os.path.join(os.path.dirname(__file__), "summaries")
os.makedirs(SUMMARIES_DIR, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(token_router)
app.include_router(summary_router)


# ✅ Internal broadcast endpoint — agent posts here
@app.post("/internal/broadcast")
async def internal_broadcast(request: Request):
    data = await request.json()
    await manager.broadcast(data)
    return {"ok": True}


# ✅ WebSocket — generates session_id on connect
@app.websocket("/ws/transcript")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(websocket)

@app.post("/session/stop")
async def stop_session():
    """Called when user clicks End Call — stops processing."""
    await manager.broadcast({"type": "session_stopped"})
    return {"ok": True}