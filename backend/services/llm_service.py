# import os
# import sys

# # Add backend/ to path
# BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# if BACKEND_DIR not in sys.path:
#     sys.path.insert(0, BACKEND_DIR)

# import requests
# from dotenv import load_dotenv
# from agent.state_machine import Stage, STAGE_PROMPTS
# # from rag_service import search_knowledge  # ✅ relative — both in services/
# from services.rag_service import search_knowledge


# load_dotenv()

# OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
# BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
# MODEL = os.getenv("MODEL_NAME", "mistralai/mistral-7b-instruct")


# def generate_response(
#     user_message: str,
#     history: list = None,
#     stage: Stage = Stage.GREETING
# ) -> str:
#     try:
#         url = f"{BASE_URL}/chat/completions"

#         headers = {
#             "Authorization": f"Bearer {OPENROUTER_API_KEY}",
#             "Content-Type": "application/json",
#         }

#         # ✅ Stage-aware system prompt
#         system_prompt = STAGE_PROMPTS.get(stage, STAGE_PROMPTS[Stage.GREETING])

#         # ✅ RAG — search knowledge base
#         kb_context = search_knowledge(user_message)
#         if kb_context:
#             system_prompt += f"""

# You have access to the following knowledge base information. Use it to give accurate, specific answers:

# {kb_context}

# Important: When you have knowledge base info, always mention specific resolution times, helpline numbers, and steps from it."""

#         # ✅ Full conversation history
#         messages = [{"role": "system", "content": system_prompt}]
#         if history:
#             messages.extend(history)
#         messages.append({"role": "user", "content": user_message})

#         payload = {
#             "model": MODEL,
#             "messages": messages,
#             "max_tokens": 200,
#             "temperature": 0.7,
#         }

#         response = requests.post(url, headers=headers, json=payload, timeout=15)
#         response.raise_for_status()

#         data = response.json()
#         text = data["choices"][0]["message"]["content"].strip()

#         print(f"✅ LLM [{stage.value}]: {text[:80]}...")
#         return text

#     except requests.Timeout:
#         print("⚠️ LLM timeout")
#         return "I'm taking too long to respond. Could you please repeat that?"

#     except requests.HTTPError as e:
#         print(f"❌ LLM HTTP error: {e.response.status_code}")
#         return "Sorry, I couldn't process that right now."

#     except Exception as e:
#         print(f"❌ LLM Error: {e}")
#         return "Sorry, I couldn't process that."



# backend/services/llm_service.py

import requests
import os
from dotenv import load_dotenv
from agent.state_machine import Stage, STAGE_PROMPTS
from services.rag_service import search_knowledge

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL  = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
MODEL     = os.getenv("MODEL_NAME", "mistralai/mistral-7b-instruct")


def generate_response(
    user_message: str,
    history:      list = None,
    stage:        Stage = Stage.GREETING,
    user_name:    str = None,
) -> str:
    try:
        url     = f"{BASE_URL}/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type":  "application/json",
        }

        # ✅ Stage-aware system prompt
        system_prompt = STAGE_PROMPTS.get(stage, STAGE_PROMPTS[Stage.GREETING])

        # ✅ Personalize with user name if captured
        if user_name:
            system_prompt += f"\n\nThe user's name is {user_name}. Address them by name naturally."

        # ✅ RAG — search knowledge base
        kb_context = search_knowledge(user_message)
        if kb_context:
            system_prompt += f"""

Relevant Knowledge Base:
{kb_context}

Use this info to give accurate answers with specific resolution times and helpline numbers."""

        # ✅ Build messages with full history
        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model":       MODEL,
            "messages":    messages,
            "max_tokens":  150,   # ✅ shorter = faster TTS
            "temperature": 0.7,
        }

        response = requests.post(url, headers=headers, json=payload, timeout=15)
        response.raise_for_status()

        data = response.json()
        text = data["choices"][0]["message"]["content"].strip()
        print(f"✅ LLM [{stage.value}]: {text[:80]}...")
        return text

    except requests.Timeout:
        print("⚠️ LLM timeout")
        return "I'm taking too long to respond. Could you please repeat that?"
    except requests.HTTPError as e:
        print(f"❌ LLM HTTP error: {e.response.status_code}")
        return "Sorry, I couldn't process that right now."
    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return "Sorry, I couldn't process that."