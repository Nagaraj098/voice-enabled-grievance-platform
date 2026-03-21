from typing import List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)
        print("Frontend connected")

    def disconnect(self, websocket: WebSocket):
        self.connections.remove(websocket)
        print("Frontend disconnected")

    async def broadcast(self, message: str):
        for conn in self.connections:
            await conn.send_text(message)


# global instance
manager = ConnectionManager()