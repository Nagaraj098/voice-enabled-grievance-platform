import asyncio
import edge_tts
import io
import base64

async def test_tts():
    print("🔊 Testing Edge TTS...")

    text = "https://computing-fragrance-ripe-sequences.trycloudflare.com/transcribe"
    voice = "en-IN-NeerjaNeural"

    communicate = edge_tts.Communicate(text, voice)

    buf = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buf.write(chunk["data"])

    buf.seek(0)
    audio_bytes = buf.read()

    if not audio_bytes:
        print("❌ No audio generated — edge_tts failed")
        return

    encoded = base64.b64encode(audio_bytes).decode("utf-8")
    print(f"✅ TTS works! Audio bytes: {len(audio_bytes)}")
    print(f"✅ Base64 length: {len(encoded)} chars")

    # Save to file so you can hear it
    with open("tts_test_output.mp3", "wb") as f:
        f.write(audio_bytes)
    print("✅ Saved to tts_test_output.mp3 — open it to hear the voice!")


if __name__ == "__main__":
    asyncio.run(test_tts())