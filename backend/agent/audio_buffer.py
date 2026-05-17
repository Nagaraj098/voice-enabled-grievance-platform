import os

import numpy as np

DEBUG_AUDIO = os.getenv("DEBUG_AUDIO", "").lower() in ("1", "true", "yes")


class AudioBuffer:
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        self.buffer = []
        self.silence_counter = 0
        self.speech_started = False

        self.VOLUME_THRESHOLD = 15
        self.MIN_SPEECH_FRAMES = 2
        self.SILENCE_LIMIT = 6
        self.MIN_AUDIO_LEN = sample_rate // 3
        self.MAX_AUDIO_LEN = sample_rate * 10

        self.speech_frame_count = 0

    def rms(self, pcm: np.ndarray) -> float:
        return float(np.sqrt(np.mean(pcm.astype(np.float32) ** 2)))

    def is_speech(self, pcm: np.ndarray) -> bool:
        volume = self.rms(pcm)
        if DEBUG_AUDIO:
            print(f"🔊 Volume: {volume:.2f}")
        return volume > self.VOLUME_THRESHOLD

    def add_frame(self, pcm: np.ndarray):
        if self.is_speech(pcm):
            self.speech_frame_count += 1

            if self.speech_frame_count >= self.MIN_SPEECH_FRAMES:
                if not self.speech_started:
                    if DEBUG_AUDIO:
                        print("🎤 Speech started")
                    self.speech_started = True
                self.buffer.extend(pcm)
                self.silence_counter = 0

                if len(self.buffer) > self.MAX_AUDIO_LEN:
                    self.silence_counter = self.SILENCE_LIMIT + 1
        else:
            self.speech_frame_count = 0
            if len(self.buffer) > 0:
                self.silence_counter += 1

    def is_ready(self) -> bool:
        return (
            self.speech_started
            and len(self.buffer) > self.MIN_AUDIO_LEN
            and self.silence_counter >= self.SILENCE_LIMIT
        )

    def get_audio(self) -> bytes:
        audio = np.array(self.buffer, dtype=np.int16)
        self.buffer = []
        self.silence_counter = 0
        self.speech_started = False
        self.speech_frame_count = 0
        return audio.tobytes()

    def reset(self):
        self.buffer = []
        self.silence_counter = 0
        self.speech_started = False
        self.speech_frame_count = 0
