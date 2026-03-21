import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import asyncio
import numpy as np

from livekit import rtc
from livekit.api import AccessToken, VideoGrants

# NEW imports
from agent.audio_buffer import AudioBuffer
from services.stt_service import STTService
from sockets.connection_manager import manager


LIVEKIT_URL = "ws://localhost:7880"

API_KEY = "devkey"
API_SECRET = "supersecretkeysupersecretkey1234567890abcd"

ROOM_NAME = "testroom"
IDENTITY = "ai-agent"


# ✅ Initialize services
buffer = AudioBuffer()
stt = STTService()


async def process_audio(track):

    audio_stream = rtc.AudioStream(track)

    async for frame in audio_stream:

        # Convert frame → PCM
        pcm = np.frombuffer(frame.frame.data, dtype=np.int16)

        # Add to buffer (with VAD inside)
        buffer.add_frame(pcm)

        # Process when enough audio collected
        if buffer.is_ready():

            audio_bytes = buffer.get_audio()

            text = stt.transcribe(audio_bytes)

            if text:
                print("User said:", text)

                # ✅ send to frontend
                await manager.broadcast({
                    "type": "user_transcript",
                    "text": text
                })


async def main():

    room = rtc.Room()

    # Create token
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

    # Connect to LiveKit
    await room.connect(LIVEKIT_URL, token)

    print("Agent connected to room")

    @room.on("track_subscribed")
    def track_subscribed(track, publication, participant):

        print("Subscribed to:", participant.identity)

        if track.kind == rtc.TrackKind.KIND_AUDIO:
            asyncio.create_task(process_audio(track))


async def start():
    await main()

    while True:
        await asyncio.sleep(1)


asyncio.run(start())