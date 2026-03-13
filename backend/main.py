from fastapi import FastAPI, UploadFile, File
from services.stt_service import speech_to_text
from services.llm_service import generate_response
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Backend running successfully"}

@app.get("/health")
def health():
    return {"status": "OK"}

@app.post("/stt")
async def stt(file: UploadFile = File(...)):
    audio = await file.read()

    result = speech_to_text(
        (file.filename, audio, file.content_type)
    )

    return result

@app.post("/chat")
async def chat(request: ChatRequest):

    user_message = request.message

    ai_reply = generate_response(user_message)

    return {
        "user_message": user_message,
        "ai_response": ai_reply
    }