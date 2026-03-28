import base64
import io
import requests

# Kokoro TTS via OpenRouter-compatible API (free)
# Alternative: use kokoro python package directly

class TTSService:
    def __init__(self):
        # We'll use Kokoro via huggingface inference API
        # or fallback to gTTS which is always free
        self.use_gtts = True  # reliable fallback

    def synthesize(self, text: str) -> str:
        """Convert text to speech, return base64 encoded audio string."""
        try:
            if self.use_gtts:
                return self._gtts(text)
        except Exception as e:
            print(f"❌ TTS Error: {e}")
            return ""

    def _gtts(self, text: str) -> str:
        """Use gTTS (Google Text to Speech) — free, no API key needed."""
        from gtts import gTTS

        tts = gTTS(text=text, lang="en", slow=False)

        buf = io.BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)

        audio_bytes = buf.read()
        encoded = base64.b64encode(audio_bytes).decode("utf-8")

        print(f"✅ TTS generated: {len(audio_bytes)} bytes")
        return encoded