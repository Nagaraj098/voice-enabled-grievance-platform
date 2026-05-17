import os

import requests
from dotenv import load_dotenv

from agent.state_machine import Stage, STAGE_PROMPTS
from services.rag_service import search_knowledge

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
MODEL = os.getenv("MODEL_NAME", "mistralai/mistral-7b-instruct")

# Shorter replies = faster TTS and lower latency
MAX_TOKENS = 90
MAX_HISTORY_MESSAGES = 8

BREVITY_RULE = (
    "\n\nIMPORTANT: Reply in at most 2 short spoken sentences. "
    "No bullet points, lists, or markdown. Be direct and conversational."
)

# RAG only when department facts help — skips slow embedding search on early turns
RAG_STAGES = {Stage.COLLECT_ISSUE, Stage.EMPATHY, Stage.RESOLUTION}

_llm_session = requests.Session()


def generate_response(
    user_message: str,
    history: list = None,
    stage: Stage = Stage.GREETING,
    user_name: str = None,
) -> str:
    try:
        url = f"{BASE_URL}/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }

        system_prompt = STAGE_PROMPTS.get(stage, STAGE_PROMPTS[Stage.GREETING]) + BREVITY_RULE

        if user_name:
            system_prompt += f"\n\nThe user's name is {user_name}. Address them by name naturally."

        if stage in RAG_STAGES:
            kb_context = search_knowledge(user_message, top_k=2)
            if kb_context:
                system_prompt += f"""

Relevant Knowledge Base:
{kb_context}

Use this info to give accurate answers with specific resolution times and helpline numbers."""

        messages = [{"role": "system", "content": system_prompt}]
        if history:
            trimmed = history[-MAX_HISTORY_MESSAGES:]
            messages.extend(trimmed)
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": MODEL,
            "messages": messages,
            "max_tokens": MAX_TOKENS,
            "temperature": 0.6,
        }

        response = _llm_session.post(url, headers=headers, json=payload, timeout=12)
        response.raise_for_status()

        data = response.json()
        text = data["choices"][0]["message"]["content"].strip()
        print(f"✅ LLM [{stage.value}]: {text[:80]}...")
        return text

    except requests.Timeout:
        print("⚠️ LLM timeout")
        return "Could you repeat that briefly?"
    except requests.HTTPError as e:
        print(f"❌ LLM HTTP error: {e.response.status_code}")
        return "Sorry, I couldn't process that right now."
    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return "Sorry, I couldn't process that."
