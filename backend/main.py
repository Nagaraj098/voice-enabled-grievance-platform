from fastapi import FastAPI, UploadFile, File
from services.stt_service import speech_to_text

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