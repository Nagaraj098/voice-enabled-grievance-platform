# import numpy as np

# class AudioBuffer:
#     def __init__(self, sample_rate: int = 16000):
#         self.sample_rate = sample_rate
#         self.buffer = []
#         self.silence_counter = 0

#         # Tunable thresholds
#         self.VOLUME_THRESHOLD = 20       # adjust per mic environment
#         self.MIN_AUDIO_LEN = sample_rate    # 1 sec minimum speech
#         self.SILENCE_LIMIT = 10           # frames of silence before triggering
#         self.MAX_AUDIO_LEN = sample_rate * 15   # ✅ 15 sec max — prevent memory bloat

#     def is_speech(self, pcm: np.ndarray) -> bool:
#         volume = np.abs(pcm).mean()
#         print(f"🔊 Volume: {volume:.2f}")
#         return volume > self.VOLUME_THRESHOLD

#     def add_frame(self, pcm: np.ndarray):
#         if self.is_speech(pcm):
#             print("🎤 Speech detected")
#             self.buffer.extend(pcm)
#             self.silence_counter = 0

#             # ✅ Force flush if too long (avoids sending huge chunks)
#             if len(self.buffer) > self.MAX_AUDIO_LEN:
#                 print("⚠️ Buffer max reached — force flushing")
#                 self.silence_counter = self.SILENCE_LIMIT + 1
#         else:
#             if len(self.buffer) > 0:
#                 self.silence_counter += 1

#     def is_ready(self) -> bool:
#         ready = (
#             len(self.buffer) > self.MIN_AUDIO_LEN
#             and self.silence_counter > self.SILENCE_LIMIT
#         )
#         if ready:
#             print("🧠 Sentence complete — processing...")
#         return ready

#     def get_audio(self) -> bytes:
#         audio = np.array(self.buffer, dtype=np.int16)
#         self.buffer = []
#         self.silence_counter = 0
#         return audio.tobytes()

#     def reset(self):
#         """Call this if agent restarts mid-session."""
#         self.buffer = []
#         self.silence_counter = 0

# backend/agent/audio_buffer.py

import numpy as np

class AudioBuffer:
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        self.buffer = []
        self.silence_counter = 0
        self.speech_started = False

        # ✅ Tuned thresholds for faster response
        self.VOLUME_THRESHOLD = 15       # lower = more sensitive
        self.MIN_SPEECH_FRAMES = 3       # minimum frames before considering speech started
        self.SILENCE_LIMIT = 8           # frames of silence before sending (was 10)
        self.MIN_AUDIO_LEN = sample_rate // 2   # 0.5 sec minimum
        self.MAX_AUDIO_LEN = sample_rate * 10   # 10 sec max (was 15)

        self.speech_frame_count = 0

    def rms(self, pcm: np.ndarray) -> float:
        """RMS volume — more accurate than mean absolute."""
        return float(np.sqrt(np.mean(pcm.astype(np.float32) ** 2)))

    def is_speech(self, pcm: np.ndarray) -> bool:
        volume = self.rms(pcm)
        print(f"🔊 Volume: {volume:.2f}")
        return volume > self.VOLUME_THRESHOLD

    def add_frame(self, pcm: np.ndarray):
        if self.is_speech(pcm):
            self.speech_frame_count += 1

            # ✅ Only start buffering after MIN_SPEECH_FRAMES to avoid noise spikes
            if self.speech_frame_count >= self.MIN_SPEECH_FRAMES:
                if not self.speech_started:
                    print("🎤 Speech started")
                    self.speech_started = True
                self.buffer.extend(pcm)
                self.silence_counter = 0

                # ✅ Force flush if too long
                if len(self.buffer) > self.MAX_AUDIO_LEN:
                    print("⚠️ Buffer max reached — force flushing")
                    self.silence_counter = self.SILENCE_LIMIT + 1
        else:
            self.speech_frame_count = 0  # reset on silence
            if len(self.buffer) > 0:
                self.silence_counter += 1

    def is_ready(self) -> bool:
        ready = (
            self.speech_started
            and len(self.buffer) > self.MIN_AUDIO_LEN
            and self.silence_counter >= self.SILENCE_LIMIT
        )
        if ready:
            print("🧠 Sentence complete — processing...")
        return ready

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