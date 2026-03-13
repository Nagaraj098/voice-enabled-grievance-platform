import requests
import os
from dotenv import load_dotenv

# load environment variables
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = os.getenv("OPENROUTER_BASE_URL")
MODEL = os.getenv("MODEL_NAME")


def generate_response(user_message):

    url = f"{BASE_URL}/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are an assistant helping users register grievances."
            },
            {
                "role": "user",
                "content": user_message
            }
        ]
    }

    response = requests.post(url, headers=headers, json=payload)

    data = response.json()

    return data["choices"][0]["message"]["content"]