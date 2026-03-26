from fastapi import FastAPI, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware
from routes.token import router as token_router
from sockets.connection_manager import manager

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routes
app.include_router(token_router)

# ✅ Internal endpoint — agent posts here → FastAPI broadcasts to frontend
@app.post("/internal/broadcast")
async def internal_broadcast(request: Request):
    data = await request.json()
    await manager.broadcast(data)
    return {"ok": True}

# ✅ WebSocket
@app.websocket("/ws/transcript")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(websocket)