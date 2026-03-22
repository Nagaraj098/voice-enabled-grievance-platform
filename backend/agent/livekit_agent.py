import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import asyncio
import numpy as np

from livekit import rtc
from livekit.api import AccessToken, VideoGrants

from agent.audio_buffer import AudioBuffer
from services.stt_service import STTService
from services.llm_service import LLMService
from services.tts_service import TTSService
from sockets.connection_manager import manager

LIVEKIT_URL = "ws://localhost:7880"

API_KEY = "devkey"
API_SECRET = "supersecretkeysupersecretkey1234567890abcd"

ROOM_NAME = "voice-room"
IDENTITY = "ai-agent"

# ✅ Initialize services
buffer = AudioBuffer()
stt = STTService()
llm = LLMService()
tts = TTSService()

# ✅ Conversation memory
messages = [
    {"role": "system", "content": "You are a grievance assistant."}
]


async def process_audio(track):

    audio_stream = rtc.AudioStream(track)

    async for frame in audio_stream:

        # Convert frame → PCM
        pcm = np.frombuffer(frame.frame.data, dtype=np.int16)

        buffer.add_frame(pcm)

        # Wait until speech ends
        if not buffer.is_ready():
            continue

        audio_bytes = buffer.get_audio()

        # ✅ IMPORTANT FIX (prevents empty audio crash)
        if not audio_bytes:
            continue

        # ---------- STT ----------
        text = stt.transcribe(audio_bytes)

        if not text:
            continue

        print("User:", text)

        messages.append({
            "role": "user",
            "content": text
        })

        # ---------- THINKING ----------
        await manager.broadcast({
            "type": "agent_thinking"
        })

        # ---------- LLM ----------
        ai_text = llm.generate(messages)

        messages.append({
            "role": "assistant",
            "content": ai_text
        })

        print("AI:", ai_text)

        # ---------- SEND TEXT ----------
        await manager.broadcast({
            "type": "agent_response",
            "text": ai_text
        })

        # ---------- TTS ----------
        audio_base64 = tts.generate_audio_base64(ai_text)

        # ---------- SEND AUDIO ----------
        await manager.broadcast({
            "type": "agent_audio",
            "audio": audio_base64
        })


async def main():

    room = rtc.Room()

    token = (
        AccessToken(API_KEY, API_SECRET)
        .with_identity(IDENTITY)
        .with_grants(
            VideoGrants(
                room_join=True,
                room=ROOM_NAME,
                can_subscribe=True,
                can_publish=True,
            )
        )
        .to_jwt()
    )

    await room.connect(LIVEKIT_URL, token)

    print("✅ Agent connected to room")

    @room.on("track_published")
    def track_published(publication, participant):
        if publication.kind == rtc.TrackKind.KIND_AUDIO:
            print("🎤 Subscribing to audio...")
            publication.set_subscribed(True)

    @room.on("track_subscribed")
    def track_subscribed(track, publication, participant):
        print("Subscribed to:", participant.identity)

        if track.kind == rtc.TrackKind.KIND_AUDIO:
            asyncio.create_task(process_audio(track))


async def start():
    await main()
    print("🚀 Agent running...")
    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(start())