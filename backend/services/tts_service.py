import asyncio
import base64
import io
import re
from typing import AsyncGenerator

import edge_tts

# Faster speech; edge-tts rate is percentage offset
TTS_RATE = "+25%"
TTS_VOICE = "en-IN-NeerjaNeural"


class TTSService:
    def __init__(self):
        self.voice = TTS_VOICE
        self._rate = TTS_RATE

    def _clean_text(self, text: str) -> str:
        text = re.sub(r"\*+", "", text)
        text = re.sub(r"_+", "", text)
        text = re.sub(r"^\s*[-•]\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _split_sentences(self, text: str) -> list[str]:
        sentences = re.split(r"(?<=[.!?])\s+", text.strip())
        return [s.strip() for s in sentences if s.strip() and len(s.strip()) > 3]

    async def _generate_audio(self, text: str) -> str:
        communicate = edge_tts.Communicate(text, self.voice, rate=self._rate)
        buf = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        audio_bytes = buf.getvalue()
        if not audio_bytes:
            return ""
        return base64.b64encode(audio_bytes).decode("utf-8")

    async def synthesize_async(self, text: str) -> str:
        text = self._clean_text(text)
        if not text:
            return ""
        return await self._generate_audio(text)

    async def synthesize_sentences(self, text: str) -> AsyncGenerator[str, None]:
        """
        Optimized sentence TTS:
        - First sentence: generated and sent immediately (time-to-first-audio)
        - Remaining sentences: generated in parallel while first plays on client
        """
        text = self._clean_text(text)
        sentences = self._split_sentences(text)
        if not sentences:
            return

        first = await self._generate_audio(sentences[0])
        if first:
            yield first

        if len(sentences) == 1:
            return

        rest_audio = await asyncio.gather(
            *[self._generate_audio(s) for s in sentences[1:]],
            return_exceptions=True,
        )
        for audio in rest_audio:
            if isinstance(audio, str) and audio:
                yield audio



