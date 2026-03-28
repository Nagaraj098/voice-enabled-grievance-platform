import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import asyncio
import numpy as np
import requests

from livekit import rtc
from livekit.api import AccessToken, VideoGrants

from agent.audio_buffer import AudioBuffer
from services.stt_service import STTService
from services.llm_service import generate_response

# 🔐 LiveKit Config
LIVEKIT_URL = "ws://localhost:7880"
API_KEY = "devkey"
API_SECRET = "supersecretkeysupersecretkey1234567890abcd"
ROOM_NAME = "voice-room"
IDENTITY = "ai-agent"

LIVEKIT_SAMPLE_RATE = 48000
WHISPER_SAMPLE_RATE = 16000

FASTAPI_URL = "http://localhost:8000"

# ✅ Junk phrases Whisper hallucinates during silence
JUNK_PHRASES = [
    "thanks for watching",
    "thank you for watching",
    "please subscribe",
    "like and subscribe",
    "bye bye",
    "see you next time",
    "don't forget to subscribe",
    "thank you for listening",
]

buffer = AudioBuffer()
stt = STTService()


def broadcast(data: dict):
    try:
        requests.post(
            f"{FASTAPI_URL}/internal/broadcast",
            json=data,
            timeout=5
        )
    except Exception as e:
        print(f"❌ Broadcast error: {e}")


def resample(pcm: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
    if orig_sr == target_sr:
        return pcm
    ratio = target_sr / orig_sr
    new_len = int(len(pcm) * ratio)
    return np.interp(
        np.linspace(0, len(pcm) - 1, new_len),
        np.arange(len(pcm)),
        pcm
    ).astype(np.int16)


def is_valid_transcript(text: str) -> bool:
    """Filter out junk Whisper hallucinations."""
    if not text or not text.strip():
        return False

    # ✅ Ignore single word responses
    if len(text.split()) < 2:
        print(f"⚠️ Too short, ignoring: {text}")
        return False

    # ✅ Ignore known hallucinated phrases
    text_lower = text.lower().strip()
    for junk in JUNK_PHRASES:
        if junk in text_lower:
            print(f"⚠️ Filtered junk: {text}")
            return False

    return True


async def process_audio(track):
    print("🎧 Processing audio stream...")
    audio_stream = rtc.AudioStream(track)

    async for frame in audio_stream:
        try:
            pcm = np.frombuffer(frame.frame.data, dtype=np.int16)

            # ✅ Resample 48kHz → 16kHz for Whisper
            pcm_16k = resample(pcm, LIVEKIT_SAMPLE_RATE, WHISPER_SAMPLE_RATE)

            buffer.add_frame(pcm_16k)

            if buffer.is_ready():
                audio_bytes = buffer.get_audio()

                # 🔥 STT
                text = stt.transcribe(audio_bytes, sample_rate=WHISPER_SAMPLE_RATE)

                # ✅ Validate transcript before sending
                if not is_valid_transcript(text):
                    continue

                print(f"🗣 User: {text}")
                broadcast({"type": "user_transcript", "text": text})

                # ✅ Tell frontend AI is thinking
                broadcast({"type": "agent_thinking"})

                # 🔥 LLM
                ai_response = generate_response(text)
                print(f"🤖 AI: {ai_response}")
                broadcast({"type": "ai_response", "text": ai_response})

        except Exception as e:
            print("❌ Audio Processing Error:", e)
            import traceback
            traceback.print_exc()


async def main():
    room = rtc.Room()

    token = (
        AccessToken(API_KEY, API_SECRET)
        .with_identity(IDENTITY)
        .with_grants(VideoGrants(
            room_join=True,
            room=ROOM_NAME,
            can_subscribe=True,
            can_publish=True,
        ))
        .to_jwt()
    )

    await room.connect(LIVEKIT_URL, token)
    print(f"✅ Agent connected to LiveKit room: {ROOM_NAME}")

    @room.on("track_subscribed")
    def on_track(track, publication, participant):
        print(f"📡 Track from: {participant.identity}")
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            asyncio.create_task(process_audio(track))


async def start():
    await main()
    while True:
        await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(start())