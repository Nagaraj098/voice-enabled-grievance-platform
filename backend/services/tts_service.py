import base64
import io
import asyncio
import edge_tts


class TTSService:
    def __init__(self):
        self.voice = "en-IN-NeerjaNeural"

    def synthesize(self, text: str) -> str:
        """Sync version — do not use inside async functions."""
        try:
            print(f"🔊 Generating TTS...")
            result = asyncio.run(self._edge_tts(text))
            if result:
                print(f"✅ TTS generated: {len(result)} chars")
            else:
                print("⚠️ TTS returned empty")
            return result
        except Exception as e:
            import traceback
            print(f"❌ TTS Error: {e}")
            traceback.print_exc()
            return ""

    async def synthesize_async(self, text: str) -> str:
        """✅ Async version — use this inside async functions like process_audio."""
        try:
            print(f"🔊 Generating TTS (async)...")
            result = await self._edge_tts(text)
            if result:
                print(f"✅ TTS generated: {len(result)} chars")
            else:
                print("⚠️ TTS returned empty")
            return result
        except Exception as e:
            import traceback
            print(f"❌ TTS Error: {e}")
            traceback.print_exc()
            return ""

    async def _edge_tts(self, text: str) -> str:
        communicate = edge_tts.Communicate(text, self.voice)
        buf = io.BytesIO()

        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])

        buf.seek(0)
        audio_bytes = buf.read()

        if not audio_bytes:
            print("⚠️ No audio bytes generated")
            return ""

        return base64.b64encode(audio_bytes).decode("utf-8")