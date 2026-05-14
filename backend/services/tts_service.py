#may 07 2026
# import base64
# import io
# import asyncio
# import edge_tts
# import re
# from typing import AsyncGenerator


# class TTSService:
#     def __init__(self):
#         self.voice = "en-IN-NeerjaNeural"

#     def _clean_text(self, text: str) -> str:
#         """Remove markdown and limit length."""
#         text = re.sub(r'\*+', '', text)
#         text = re.sub(r'_+', '', text)
#         text = re.sub(r'^\s*[-•]\s*', '', text, flags=re.MULTILINE)
#         text = re.sub(r'\s+', ' ', text).strip()
#         return text

#     def _split_sentences(self, text: str) -> list[str]:
#         """Split text into sentences."""
#         sentences = re.split(r'(?<=[.!?])\s+', text.strip())
#         return [s.strip() for s in sentences if s.strip() and len(s.strip()) > 3]

#     async def _generate_audio(self, text: str) -> str:
#         """Generate audio for a single text chunk."""
#         communicate = edge_tts.Communicate(
#             text,
#             self.voice,
#             rate="+10%",
#         )
#         buf = io.BytesIO()
#         async for chunk in communicate.stream():
#             if chunk["type"] == "audio":
#                 buf.write(chunk["data"])
#         buf.seek(0)
#         audio_bytes = buf.read()
#         if not audio_bytes:
#             return ""
#         return base64.b64encode(audio_bytes).decode("utf-8")

#     async def synthesize_async(self, text: str) -> str:
#         """Full text TTS — for short responses."""
#         try:
#             text = self._clean_text(text)
#             if not text:
#                 return ""
#             print(f"🔊 TTS generating...")
#             result = await self._generate_audio(text)
#             print(f"✅ TTS done: {len(result)} chars")
#             return result
#         except Exception as e:
#             import traceback
#             print(f"❌ TTS Error: {e}")
#             traceback.print_exc()
#             return ""

#     async def synthesize_sentences(self, text: str) -> AsyncGenerator[str, None]:
#         """
#         ✅ Sentence-by-sentence TTS generator.
#         Yields base64 audio for each sentence as soon as it's ready.
#         Use this for fastest response.
#         """
#         text = self._clean_text(text)
#         sentences = self._split_sentences(text)

#         if not sentences:
#             return

#         print(f"🔊 TTS streaming {len(sentences)} sentences...")

#         for i, sentence in enumerate(sentences):
#             try:
#                 print(f"  🎙️ Sentence {i+1}/{len(sentences)}: '{sentence[:40]}...'")
#                 audio_b64 = await self._generate_audio(sentence)
#                 if audio_b64:
#                     print(f"  ✅ Sentence {i+1} ready: {len(audio_b64)} chars")
#                     yield audio_b64
#             except Exception as e:
#                 print(f"  ❌ Sentence {i+1} TTS error: {e}")
#                 continue


import base64
import io
import os
import re
import httpx
from typing import AsyncGenerator
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVEN_LABS_API_KEY")

# Good low-latency English (Indian accent) voice options:
# "Aria"  → natural, warm female  (ID: 9BWtsMINqrJLrRacOk9x)
# "Rachel"→ clear, neutral female (ID: 21m00Tcm4TlvDq8ikWAM)
# Change VOICE_ID to whichever fits your use-case best.
VOICE_ID = "9BWtsMINqrJLrRacOk9x"   # Aria — swap if preferred

BASE_URL = "https://api.elevenlabs.io/v1"

# Turbo v2.5 = lowest latency model ElevenLabs offers
MODEL_ID = "eleven_turbo_v2_5"


class TTSService:
    def __init__(self):
        self.voice_id = VOICE_ID
        self.headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
        }
        self.voice_settings = {
            "stability": 0.4,
            "similarity_boost": 0.75,
            "style": 0.0,
            "use_speaker_boost": True,
        }

    def _clean_text(self, text: str) -> str:
        """Remove markdown formatting."""
        text = re.sub(r'\*+', '', text)
        text = re.sub(r'_+', '', text)
        text = re.sub(r'^\s*[-•]\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def _split_sentences(self, text: str) -> list[str]:
        """Split text into sentences for sentence-level streaming."""
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        return [s.strip() for s in sentences if s.strip() and len(s.strip()) > 3]

    async def _generate_audio(self, text: str) -> str:
        """
        Call ElevenLabs /tts endpoint and return base64-encoded MP3.
        Uses httpx async for non-blocking I/O.
        """
        url = f"{BASE_URL}/text-to-speech/{self.voice_id}"
        payload = {
            "text": text,
            "model_id": MODEL_ID,
            "voice_settings": self.voice_settings,
        }

        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(url, headers=self.headers, json=payload)

        if response.status_code != 200:
            print(f"❌ ElevenLabs error {response.status_code}: {response.text[:200]}")
            return ""

        audio_bytes = response.content
        if not audio_bytes:
            return ""

        return base64.b64encode(audio_bytes).decode("utf-8")

    async def _stream_audio_chunks(self, text: str) -> AsyncGenerator[bytes, None]:
        """
        Use ElevenLabs /stream endpoint to get MP3 chunks as they arrive.
        Lowest possible latency — bytes start flowing before synthesis finishes.
        """
        url = f"{BASE_URL}/text-to-speech/{self.voice_id}/stream"
        payload = {
            "text": text,
            "model_id": MODEL_ID,
            "voice_settings": self.voice_settings,
        }

        async with httpx.AsyncClient(timeout=30) as client:
            async with client.stream("POST", url, headers=self.headers, json=payload) as response:
                if response.status_code != 200:
                    body = await response.aread()
                    print(f"❌ ElevenLabs stream error {response.status_code}: {body[:200]}")
                    return
                async for chunk in response.aiter_bytes(chunk_size=4096):
                    if chunk:
                        yield chunk

    async def synthesize_async(self, text: str) -> str:
        """Full text TTS — returns complete base64 audio. For short responses."""
        try:
            text = self._clean_text(text)
            if not text:
                return ""
            print(f"🔊 ElevenLabs TTS generating...")
            result = await self._generate_audio(text)
            print(f"✅ TTS done: {len(result)} chars")
            return result
        except Exception as e:
            import traceback
            print(f"❌ TTS Error: {e}")
            traceback.print_exc()
            return ""

    async def synthesize_sentences(self, text: str) -> AsyncGenerator[str, None]:
        """
        Sentence-by-sentence TTS generator.
        Yields base64-encoded MP3 per sentence as soon as each is ready.
        Best balance of latency and quality for conversational use.
        """
        text = self._clean_text(text)
        sentences = self._split_sentences(text)

        if not sentences:
            return

        print(f"🔊 ElevenLabs streaming {len(sentences)} sentences...")

        for i, sentence in enumerate(sentences):
            try:
                print(f"  🎙️ Sentence {i+1}/{len(sentences)}: '{sentence[:50]}'")
                audio_b64 = await self._generate_audio(sentence)
                if audio_b64:
                    print(f"  ✅ Sentence {i+1} ready: {len(audio_b64)} chars")
                    yield audio_b64
            except Exception as e:
                print(f"  ❌ Sentence {i+1} TTS error: {e}")
                continue

    async def synthesize_stream(self, text: str) -> AsyncGenerator[str, None]:
        """
        TRUE streaming TTS — yields base64 chunks as MP3 bytes arrive.
        Use this with main.py's /internal/broadcast_binary endpoint for
        the absolute lowest latency. Each chunk is a partial MP3 frame.

        Usage in your agent:
            async for chunk_b64 in tts.synthesize_stream(llm_text):
                await post_to_broadcast_binary(base64.b64decode(chunk_b64))
        """
        text = self._clean_text(text)
        if not text:
            return

        print(f"🔊 ElevenLabs true-stream starting...")
        chunk_count = 0

        async for mp3_chunk in self._stream_audio_chunks(text):
            chunk_b64 = base64.b64encode(mp3_chunk).decode("utf-8")
            chunk_count += 1
            yield chunk_b64

        print(f"✅ ElevenLabs stream done: {chunk_count} chunks")