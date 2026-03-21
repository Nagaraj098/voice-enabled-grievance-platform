# from fastapi import FastAPI, UploadFile, File
# from fastapi.responses import FileResponse
# from pydantic import BaseModel

# from services.stt_service import speech_to_text
# from services.llm_service import generate_response
# from services.tts_service import text_to_speech
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # ----------- REQUEST MODELS -----------

# class ChatRequest(BaseModel):
#     message: str


# class TTSRequest(BaseModel):
#     text: str


# # ----------- ROUTES -----------

# @app.get("/")
# def home():
#     return {"message": "Backend running successfully"}


# @app.get("/health")
# def health():
#     return {"status": "OK"}


# @app.post("/stt")
# async def stt(file: UploadFile = File(...)):
#     audio = await file.read()
#     result = speech_to_text((file.filename, audio, file.content_type))
#     return result


# @app.post("/chat")
# async def chat(request: ChatRequest):
#     ai_reply = generate_response(request.message)

#     return {
#         "user_message": request.message,
#         "ai_response": ai_reply
#     }


# @app.post("/tts")
# async def tts(request: TTSRequest):

#     audio_path = text_to_speech(request.text)

#     return FileResponse(
#         audio_path,
#         media_type="audio/mpeg",
#         filename="response.mp3"
#     )



from fastapi import FastAPI
from routes.token import router as token_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket
from sockets.websocket import websocket_endpoint



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(token_router)

from fastapi import WebSocket

@app.websocket("/ws/transcript")
async def ws_transcript(websocket: WebSocket):
    await websocket_endpoint(websocket)

@app.websocket("/ws/transcript")
async def ws_transcript(websocket: WebSocket):
    await websocket_endpoint(websocket)

@app.websocket("/ws/transcript")
async def transcript_socket(websocket: WebSocket):
    await websocket.accept()
    print("Transcript WebSocket connected")

    try:
        while True:
            data = await websocket.receive_text()
            print("Frontend message:", data)
            await websocket.send_text("processing...")
    except:
        print("Transcript WebSocket closed")