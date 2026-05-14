import base64
import io
import asyncio
import edge_tts
import re
from typing import AsyncGenerator


class TTSService:
    def __init__(self):
        self.voice = "en-IN-NeerjaNeural"

    def _clean_text(self, text: str) -> str:
        """Remove markdown and limit length."""
        text = re.sub(r'\*+', '', text)
        text = re.sub(r'_+', '', text)
        text = re.sub(r'^\s*[-•]\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def _split_sentences(self, text: str) -> list[str]:
        """Split text into sentences."""
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        return [s.strip() for s in sentences if s.strip() and len(s.strip()) > 3]

    async def _generate_audio(self, text: str) -> str:
        """Generate audio for a single text chunk."""
        communicate = edge_tts.Communicate(
            text,
            self.voice,
            rate="+10%",
        )
        buf = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        buf.seek(0)
        audio_bytes = buf.read()
        if not audio_bytes:
            return ""
        return base64.b64encode(audio_bytes).decode("utf-8")

    async def synthesize_async(self, text: str) -> str:
        """Full text TTS — for short responses."""
        try:
            text = self._clean_text(text)
            if not text:
                return ""
            print(f"🔊 TTS generating...")
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
        ✅ Sentence-by-sentence TTS generator.
        Yields base64 audio for each sentence as soon as it's ready.
        Use this for fastest response.
        """
        text = self._clean_text(text)
        sentences = self._split_sentences(text)

        if not sentences:
            return

        print(f"🔊 TTS streaming {len(sentences)} sentences...")

        for i, sentence in enumerate(sentences):
            try:
                print(f"  🎙️ Sentence {i+1}/{len(sentences)}: '{sentence[:40]}...'")
                audio_b64 = await self._generate_audio(sentence)
                if audio_b64:
                    print(f"  ✅ Sentence {i+1} ready: {len(audio_b64)} chars")
                    yield audio_b64
            except Exception as e:
                print(f"  ❌ Sentence {i+1} TTS error: {e}")
                continue
