import numpy as np

class AudioBuffer:
    def __init__(self):
        self.buffer = np.array([], dtype=np.int16)
        self.silence_counter = 0

        # 🔥 tuning params
        self.VOLUME_THRESHOLD = 500
        self.MIN_AUDIO_LEN = 32000   # ~1 sec
        self.SILENCE_LIMIT = 10

    def is_speech(self, pcm):
        if len(pcm) == 0:
            return False

        volume = np.abs(pcm).mean()
        return volume > self.VOLUME_THRESHOLD

    def add_frame(self, pcm):

        if self.is_speech(pcm):
            self.buffer = np.concatenate((self.buffer, pcm))
            self.silence_counter = 0
        else:
            if len(self.buffer) > 0:
                self.silence_counter += 1

    def is_ready(self):
        return (
            len(self.buffer) > self.MIN_AUDIO_LEN
            and self.silence_counter > self.SILENCE_LIMIT
        )

    def get_audio(self):

        if len(self.buffer) == 0:
            return None

        audio_bytes = self.buffer.tobytes()

        # reset
        self.buffer = np.array([], dtype=np.int16)
        self.silence_counter = 0

        return audio_bytes