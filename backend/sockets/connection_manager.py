# from typing import List
# from fastapi import WebSocket
# import json

# class ConnectionManager:
#     def __init__(self):
#         self.connections: List[WebSocket] = []

#     async def connect(self, websocket: WebSocket):
#         await websocket.accept()
#         self.connections.append(websocket)
#         print(f"✅ Frontend connected — total: {len(self.connections)}")

#     def disconnect(self, websocket: WebSocket):
#         if websocket in self.connections:
#             self.connections.remove(websocket)
#         print(f"🔌 Frontend disconnected — total: {len(self.connections)}")

#     async def broadcast(self, message: dict):
#         if not self.connections:
#             return

#         data = json.dumps(message)
#         dead = []

#         for conn in self.connections:
#             try:
#                 await conn.send_text(data)
#             except Exception as e:
#                 print(f"❌ WebSocket send failed: {e}")
#                 dead.append(conn)  # ✅ mark dead connections

#         # ✅ Clean up dead connections
#         for conn in dead:
#             self.connections.remove(conn)

# manager = ConnectionManager()

from typing import List
from fastapi import WebSocket
import json


class ConnectionManager:
    def __init__(self):
        self.connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)
        print(f"✅ Frontend connected — total: {len(self.connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.connections:
            self.connections.remove(websocket)
        print(f"🔌 Frontend disconnected — total: {len(self.connections)}")

    async def broadcast(self, message: dict):
        """Send JSON control messages to all connected frontends."""
        if not self.connections:
            return

        data = json.dumps(message)
        dead = []

        for conn in self.connections:
            try:
                await conn.send_text(data)
            except Exception as e:
                print(f"❌ WebSocket send failed: {e}")
                dead.append(conn)

        for conn in dead:
            self.connections.remove(conn)

    async def broadcast_binary(self, data: bytes):
        """
        Send raw binary (MP3 chunk) to all connected frontends.
        Frontend receives this as a Blob/ArrayBuffer and feeds it
        into MediaSource API for seamless streaming playback.
        """
        if not self.connections:
            return

        dead = []

        for conn in self.connections:
            try:
                await conn.send_bytes(data)
            except Exception as e:
                print(f"❌ Binary WebSocket send failed: {e}")
                dead.append(conn)

        for conn in dead:
            self.connections.remove(conn)


manager = ConnectionManager()