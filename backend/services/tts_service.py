from gtts import gTTS
import tempfile
import base64

class TTSService:

    def generate_audio_base64(self, text: str):

        # create temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp:
            file_path = temp.name

        # generate speech
        tts = gTTS(text=text, lang="en")
        tts.save(file_path)

        # read file
        with open(file_path, "rb") as f:
            audio_bytes = f.read()

        # convert to base64
        return base64.b64encode(audio_bytes).decode("utf-8")