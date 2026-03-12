from faster_whisper import WhisperModel
import tempfile

# Load model once when server starts
model = WhisperModel("base", device="cpu", compute_type="int8")

def speech_to_text(audio_file):

    filename, audio_bytes, content_type = audio_file

    # Save temporary audio file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp:
        temp.write(audio_bytes)
        temp_path = temp.name

    # Transcribe audio
    segments, info = model.transcribe(temp_path)

    text = ""
    for segment in segments:
        text += segment.text

    return {"text": text}