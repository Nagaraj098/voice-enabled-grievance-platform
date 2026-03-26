import requests
import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
MODEL = os.getenv("MODEL_NAME", "meta-llama/llama-3-8b-instruct")

# System prompt for grievance assistant
SYSTEM_PROMPT = """You are a helpful assistant for a grievance registration system.
Your job is to:
1. Listen to the user's complaint or issue
2. Ask clarifying questions if needed
3. Summarize the issue clearly
4. Be empathetic and professional

Keep responses concise and conversational since this is a voice interface."""


def generate_response(user_message: str) -> str:
    try:
        url = f"{BASE_URL}/chat/completions"

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            "max_tokens": 200,    # ✅ keep responses short for voice
            "temperature": 0.7,
        }

        # ✅ timeout prevents agent from hanging forever
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        response.raise_for_status()

        data = response.json()
        text = data["choices"][0]["message"]["content"].strip()

        print(f"✅ LLM response: {text[:80]}...")
        return text

    except requests.Timeout:
        print("⚠️ LLM timeout")
        return "I'm taking too long to respond. Could you please repeat that?"

    except requests.HTTPError as e:
        print(f"❌ LLM HTTP error: {e.response.status_code} {e.response.text}")
        return "Sorry, I couldn't process that right now."

    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return "Sorry, I couldn't process that."