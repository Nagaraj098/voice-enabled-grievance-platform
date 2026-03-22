import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

MODEL = "mistralai/mistral-7b-instruct"


class LLMService:

    def __init__(self):
        if not OPENROUTER_API_KEY:
            raise ValueError("OPENROUTER_API_KEY is missing in .env")

    def generate(self, messages: list):
        """
        messages format:
        [
            {"role": "user", "content": "..."},
            {"role": "assistant", "content": "..."}
        ]
        """

        try:
            url = f"{BASE_URL}/chat/completions"

            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            }

            payload = {
                "model": MODEL,
                "messages": messages,
            }

            response = requests.post(url, headers=headers, json=payload)

            if response.status_code != 200:
                print("OpenRouter Error:", response.text)
                return "Sorry, I am having trouble responding right now."

            data = response.json()

            return data["choices"][0]["message"]["content"]

        except Exception as e:
            print("LLM Error:", str(e))
            return "Error generating response."