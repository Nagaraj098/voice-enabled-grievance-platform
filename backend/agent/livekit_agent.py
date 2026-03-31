import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import asyncio
import numpy as np
import requests
import json
import time

from livekit import rtc
from livekit.api import AccessToken, VideoGrants

from agent.audio_buffer import AudioBuffer
from agent.state_machine import Stage, get_next_stage
from services.stt_service import STTService
from services.llm_service import generate_response
from services.tts_service import TTSService
from sessions.session_store import store
from dotenv import load_dotenv

load_dotenv()

# 🔐 LiveKit Config
LIVEKIT_URL = "ws://localhost:7880"
API_KEY = "devkey"
API_SECRET = "supersecretkeysupersecretkey1234567890abcd"
ROOM_NAME = "voice-room"
IDENTITY = "ai-agent"

LIVEKIT_SAMPLE_RATE = 48000
WHISPER_SAMPLE_RATE = 16000
FASTAPI_URL = "http://localhost:8000"
SUMMARIES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "summaries")
os.makedirs(SUMMARIES_DIR, exist_ok=True)

JUNK_PHRASES = [
    "thanks for watching", "thank you for watching",
    "please subscribe", "like and subscribe",
    "bye bye", "see you next time",
    "don't forget to subscribe", "thank you for listening",
]

buffer = AudioBuffer()
stt = STTService()
tts = TTSService()


def broadcast(data: dict):
    try:
        requests.post(f"{FASTAPI_URL}/internal/broadcast", json=data, timeout=5)
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
    if not text or not text.strip():
        return False
    if len(text.split()) < 2:
        print(f"⚠️ Too short: {text}")
        return False
    text_lower = text.lower().strip()
    for junk in JUNK_PHRASES:
        if junk in text_lower:
            print(f"⚠️ Filtered junk: {text}")
            return False
    return True


def generate_summary(session, duration_seconds: int) -> dict:
    """Ask LLM to summarize the session — fields match frontend SummaryData type."""
    try:
        history_text = "\n".join(
            [f"{m['role'].upper()}: {m['content']}" for m in session.history]
        )

        prompt = f"""Based on this grievance conversation, return a JSON object with exactly these fields:
- issue_category: category of the issue (Water Supply / Electricity / Road / Sanitation / Network / Other)
- severity: one of "low", "medium", "high"
- description: one clear sentence describing the user's issue
- resolution_status: one of "Registered", "In Progress", "Resolved"
- user_name: the user's name if mentioned, else "Unknown"

Conversation:
{history_text}

Respond ONLY with valid JSON. No markdown, no explanation."""

        url = f"{os.getenv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": os.getenv("MODEL_NAME", "mistralai/mistral-7b-instruct"),
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 300,
            "temperature": 0.3,
        }

        response = requests.post(url, headers=headers, json=payload, timeout=15)
        data = response.json()
        text = data["choices"][0]["message"]["content"].strip()

        # Clean JSON fences if present
        text = text.replace("```json", "").replace("```", "").strip()
        summary = json.loads(text)

    except Exception as e:
        print(f"❌ Summary generation error: {e}")
        summary = {
            "issue_category": "Other",
            "severity": "medium",
            "description": "Grievance registered via voice call.",
            "resolution_status": "Registered",
            "user_name": "Unknown",
        }

    # ✅ Add fields frontend needs
    summary["session_id"] = session.session_id

    # ✅ Convert history to messages format frontend expects
    summary["messages"] = [
        {
            "role": "user" if m["role"] == "user" else "agent",
            "text": m["content"],
        }
        for m in session.history
    ]

    # ✅ Format duration as "X min Y sec"
    mins = duration_seconds // 60
    secs = duration_seconds % 60
    summary["duration"] = f"{mins}m {secs}s" if mins > 0 else f"{secs}s"

    return summary


def save_summary(session_id: str, summary: dict):
    path = os.path.join(SUMMARIES_DIR, f"{session_id}.json")
    with open(path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"✅ Summary saved: {path}")


async def process_audio(track, session_id: str):
    print("🎧 Processing audio stream...")
    audio_stream = rtc.AudioStream(track)

    async for frame in audio_stream:
        try:
            pcm = np.frombuffer(frame.frame.data, dtype=np.int16)
            pcm_16k = resample(pcm, LIVEKIT_SAMPLE_RATE, WHISPER_SAMPLE_RATE)
            buffer.add_frame(pcm_16k)

            if buffer.is_ready():
                audio_bytes = buffer.get_audio()

                # 🔥 STEP 1: STT
                text = stt.transcribe(audio_bytes, sample_rate=WHISPER_SAMPLE_RATE)
                if not is_valid_transcript(text):
                    continue

                print(f"🗣 User: {text}")

                session = store.get_session(session_id)
                if not session:
                    continue

                # ✅ Add to history
                session.add_message("user", text)
                broadcast({"type": "user_transcript", "text": text})

                # ✅ Advance stage
                session.stage = get_next_stage(session.stage, text)
                print(f"📍 Stage: {session.stage.value}")

                # 🔥 STEP 2: Thinking
                broadcast({"type": "agent_thinking"})

                # 🔥 STEP 3: LLM with full history + stage
                ai_response = generate_response(
                    user_message=text,
                    history=session.history[:-1],
                    stage=session.stage
                )
                print(f"🤖 AI: {ai_response}")

                session.add_message("assistant", ai_response)
                broadcast({"type": "ai_response", "text": ai_response})

                # 🔥 STEP 4: TTS
                audio_b64 = tts.synthesize(ai_response)
                if audio_b64:
                    broadcast({"type": "agent_audio", "audio": audio_b64})
                    print("✅ Audio sent")

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

    # Track session start times for duration calculation
    session_start_times = {}

    @room.on("track_subscribed")
    def on_track(track, publication, participant):
        print(f"📡 Track from: {participant.identity}")
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            session = store.create_session()
            session_start_times[participant.identity] = time.time()
            print(f"📝 Session: {session.session_id}")

            # ✅ Send session_id to frontend
            broadcast({"type": "session_id", "session_id": session.session_id})
            asyncio.create_task(process_audio(track, session.session_id))

    @room.on("participant_disconnected")
    def on_disconnect(participant):
        print(f"👋 Participant disconnected: {participant.identity}")

        # ✅ Find and summarize session on disconnect
        start_time = session_start_times.pop(participant.identity, None)
        duration_seconds = int(time.time() - start_time) if start_time else 0

        # Find the most recent session (simple approach)
        all_sessions = store.get_all_sessions()
        if all_sessions:
            latest = all_sessions[-1]
            session = store.get_session(latest["session_id"])
            if session and session.history:
                print("📋 Generating summary...")
                summary = generate_summary(session, duration_seconds)
                save_summary(session.session_id, summary)

                # ✅ Broadcast summary ready to frontend
                broadcast({
                    "type": "summary_ready",
                    "session_id": session.session_id
                })
                print(f"✅ Summary ready for session: {session.session_id}")


async def start():
    await main()
    while True:
        await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(start())