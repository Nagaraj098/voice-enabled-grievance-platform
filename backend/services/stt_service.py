from dotenv import load_dotenv
import os
import requests

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL")
STT_MODEL = os.getenv("STT_MODEL")

def speech_to_text(audio_file):
    url = f"{OPENROUTER_BASE_URL}/audio/transcriptions"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}"
    }

    files = {
        "file": audio_file
    }

    data = {
        "model": "openai/whisper-1"
    }

    response = requests.post(url, headers=headers, files=files, data=data)

    return response.json()