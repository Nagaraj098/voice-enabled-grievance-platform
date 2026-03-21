import numpy as np

class AudioBuffer:
    def __init__(self):
        self.buffer = []
        self.silence_counter = 0

        # 🔥 tuning params
        self.VOLUME_THRESHOLD = 500
        self.MIN_AUDIO_LEN = 64000        # ~2 sec (16kHz)
        self.SILENCE_LIMIT = 15           # frames of silence before flush

    def is_speech(self, pcm):
        volume = np.abs(pcm).mean()
        return volume > self.VOLUME_THRESHOLD

    def add_frame(self, pcm):
        if self.is_speech(pcm):
            self.buffer.extend(pcm)
            self.silence_counter = 0
        else:
            # count silence
            if len(self.buffer) > 0:
                self.silence_counter += 1

    def is_ready(self):
        # ✅ only process when:
        # enough audio + silence detected (end of sentence)
        return (
            len(self.buffer) > self.MIN_AUDIO_LEN
            and self.silence_counter > self.SILENCE_LIMIT
        )

    def get_audio(self):
        audio = np.array(self.buffer, dtype=np.int16)

        # reset buffer
        self.buffer = []
        self.silence_counter = 0

        return audio.tobytes()