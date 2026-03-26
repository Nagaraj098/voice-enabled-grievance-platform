from fastapi import WebSocket
from sockets.connection_manager import manager

async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()  # keep alive
    except:
        manager.disconnect(websocket)


# from fastapi import WebSocket

# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     print("✅ WebSocket connected")

#     try:
#         while True:
#             data = await websocket.receive_text()
#             print("📩 Received:", data)

#             await websocket.send_json({
#                 "type": "agent_response",
#                 "text": "Backend working 🎉"
#             })

#     except Exception as e:
#         print("❌ WebSocket closed", e)