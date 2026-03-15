from gtts import gTTS
import tempfile

def text_to_speech(text):

    # create temporary audio file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp:
        file_path = temp.name

    # generate speech
    tts = gTTS(text=text, lang="en")
    tts.save(file_path)

    return file_path