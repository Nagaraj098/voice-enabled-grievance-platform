from fastapi import WebSocket
from sockets.connection_manager import manager

async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()  # keep alive
    except:
        manager.disconnect(websocket)