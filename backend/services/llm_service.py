import asyncio
import json
import os
import re
from collections.abc import AsyncIterator

import httpx
import requests
from dotenv import load_dotenv

from agent.state_machine import Stage, STAGE_PROMPTS
from services.rag_service import search_knowledge

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
MODEL = os.getenv("MODEL_NAME", "mistralai/mistral-7b-instruct")

# Set LLM_STREAMING=false to use one-shot generate_response + batch TTS (legacy path)
LLM_STREAMING = os.getenv("LLM_STREAMING", "true").lower() in ("1", "true", "yes")

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

# Sentence boundaries for streaming (same idea as TTS splitting)
_SENTENCE_BOUNDARY = re.compile(r"(?<=[.!?])(?:\s+|$)")


def _take_complete_sentences(buffer: str) -> tuple[list[str], str]:
    """Split buffer into finished sentences and trailing incomplete text."""
    sentences: list[str] = []
    last_end = 0
    for m in _SENTENCE_BOUNDARY.finditer(buffer):
        chunk = buffer[last_end : m.end()].strip()
        last_end = m.end()
        if chunk and len(chunk) > 2:
            sentences.append(chunk)
    remainder = buffer[last_end:]
    return sentences, remainder


def _build_system_prompt(
    stage: Stage,
    user_name: str | None,
    user_message: str,
) -> str:
    system_prompt = STAGE_PROMPTS.get(stage, STAGE_PROMPTS[Stage.GREETING]) + BREVITY_RULE

    if user_name:
        system_prompt += f"\n\nThe user's name is {user_name}. Address them by name naturally."

    if stage in RAG_STAGES:
        kb_context = search_knowledge(user_message, top_k=5)
        if kb_context:
            system_prompt += f"""

Relevant Knowledge Base:
{kb_context}

Use this info to give accurate answers with specific resolution times and helpline numbers.
If several numbers appear, prefer the one in the Issue/Resolution line that matches the user's exact issue (for example garbage vs drains vs general BBMP), not a generic FAQ unless no issue-specific line exists."""

    return system_prompt


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

        system_prompt = _build_system_prompt(stage, user_name, user_message)

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


async def stream_response_sentences(
    user_message: str,
    history: list | None,
    stage: Stage,
    user_name: str | None,
) -> AsyncIterator[str]:
    """
    Stream chat completions from OpenRouter-compatible API; yield each completed sentence.
    RAG runs in a thread pool so the event loop is not blocked by embeddings/FAISS.
    """
    if not LLM_STREAMING:
        full = await asyncio.to_thread(
            generate_response, user_message, history, stage, user_name
        )
        if full and full.strip():
            yield full.strip()
        return

    if not OPENROUTER_API_KEY:
        text = await asyncio.to_thread(
            generate_response, user_message, history, stage, user_name
        )
        if text and text.strip():
            yield text.strip()
        return

    system_prompt = await asyncio.to_thread(
        _build_system_prompt, stage, user_name, user_message
    )

    messages = [{"role": "system", "content": system_prompt}]
    if history:
        messages.extend(history[-MAX_HISTORY_MESSAGES:])
    messages.append({"role": "user", "content": user_message})

    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": MAX_TOKENS,
        "temperature": 0.6,
        "stream": True,
    }

    buf = ""

    try:
        timeout = httpx.Timeout(30.0, connect=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream("POST", url, headers=headers, json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line or not line.strip():
                        continue
                    if not line.startswith("data: "):
                        continue
                    data = line[6:].strip()
                    if data == "[DONE]":
                        break
                    try:
                        obj = json.loads(data)
                    except json.JSONDecodeError:
                        continue
                    choices = obj.get("choices") or []
                    if not choices:
                        continue
                    delta = choices[0].get("delta") or {}
                    piece = delta.get("content") or ""
                    if not piece:
                        continue
                    buf += piece
                    done_sents, buf = _take_complete_sentences(buf)
                    for s in done_sents:
                        yield s

        tail = buf.strip()
        if tail:
            yield tail

        print(f"✅ LLM stream done [{stage.value}]")

    except httpx.HTTPStatusError as e:
        print(f"❌ LLM stream HTTP error: {e.response.status_code}")
        text = await asyncio.to_thread(
            generate_response, user_message, history, stage, user_name
        )
        if text and text.strip():
            yield text.strip()
    except Exception as e:
        print(f"❌ LLM stream error: {e}")
        text = await asyncio.to_thread(
            generate_response, user_message, history, stage, user_name
        )
        if text and text.strip():
            yield text.strip()
