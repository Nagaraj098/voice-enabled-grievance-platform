from faster_whisper import WhisperModel
import numpy as np


class STTService:
    def __init__(self):
        print("Loading Whisper model...")

        # ✅ CPU optimized + better accuracy
        self.model = WhisperModel(
            "small",              # you can upgrade to "small" later
            device="cpu",
            compute_type="int8"
        )

        print("Whisper model loaded")

    def transcribe(self, audio_bytes: bytes) -> str:
        if not audio_bytes:
            return ""

        # 🔥 Convert PCM → float32
        audio_np = (
            np.frombuffer(audio_bytes, dtype=np.int16)
            .astype(np.float32) / 32768.0
        )

        try:
            segments, _ = self.model.transcribe(
                audio_np,
                beam_size=5,          # 🔥 improves accuracy
                language="en",        # 🔥 avoid wrong language detection
                vad_filter=True,      # 🔥 removes silence/noise
                vad_parameters=dict(
                    min_silence_duration_ms=500
                )
            )

            text = " ".join([seg.text for seg in segments]).strip()

            return text

        except Exception as e:
            print("STT Error:", e)
            return ""