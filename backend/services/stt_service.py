import requests
import wave
import io
import numpy as np

COLAB_WHISPER_URL = "https://advanced-appears-wav-images.trycloudflare.com/transcribe"

class STTService:
    def __init__(self, url: str = COLAB_WHISPER_URL):
        self.url = url

    def _pcm_to_wav(self, pcm_bytes: bytes, sample_rate: int = 16000) -> bytes:
        """Wrap raw PCM int16 bytes into a proper WAV file."""
        buf = io.BytesIO()
        with wave.open(buf, 'wb') as wf:
            wf.setnchannels(1)       # mono
            wf.setsampwidth(2)       # 16-bit
            wf.setframerate(sample_rate)
            wf.writeframes(pcm_bytes)
        return buf.getvalue()

    def transcribe(self, audio_bytes: bytes, sample_rate: int = 16000) -> str:
        if not audio_bytes:
            return ""

        try:
            wav_bytes = self._pcm_to_wav(audio_bytes, sample_rate)

            response = requests.post(
                self.url,
                files={"audio": ("audio.wav", wav_bytes, "audio/wav")},
                timeout=15  # avoid hanging forever
            )

            if response.status_code == 200:
                return response.json().get("text", "")
            else:
                print(f"STT Error {response.status_code}:", response.text)
                return ""

        except requests.Timeout:
            print("STT timeout — Colab may be busy")
            return ""
        except Exception as e:
            print("STT API Error:", e)
            return ""