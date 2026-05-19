import io
import os
import wave

import requests

# Remote Colab / tunnel endpoint — override with STT_URL for local faster-whisper HTTP service
DEFAULT_STT_URL = "https://scotia-collect-alter-elliott.trycloudflare.com/transcribe"


class STTService:
    def __init__(self, url: str | None = None):
        url = url or os.getenv("STT_URL", DEFAULT_STT_URL)
        self.url = url
        self._session = requests.Session()

    def _pcm_to_wav(self, pcm_bytes: bytes, sample_rate: int = 16000) -> bytes:
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sample_rate)
            wf.writeframes(pcm_bytes)
        return buf.getvalue()

    def transcribe(self, audio_bytes: bytes, sample_rate: int = 16000) -> str:
        if not audio_bytes:
            return ""

        try:
            wav_bytes = self._pcm_to_wav(audio_bytes, sample_rate)

            response = self._session.post(
                self.url,
                files={"audio": ("audio.wav", wav_bytes, "audio/wav")},
                timeout=(3, 12),
            )

            if response.status_code == 200:
                return response.json().get("text", "")
            print(f"STT Error {response.status_code}:", response.text[:200])
            return ""

        except requests.Timeout:
            print("STT timeout — endpoint may be busy")
            return ""
        except Exception as e:
            print("STT API Error:", e)
            return ""
