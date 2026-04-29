import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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

LIVEKIT_URL = "ws://localhost:7880"
API_KEY     = "devkey"
API_SECRET  = "supersecretkeysupersecretkey1234567890abcd"
ROOM_NAME   = "voice-room"
IDENTITY    = "ai-agent"

LIVEKIT_SAMPLE_RATE = 48000
WHISPER_SAMPLE_RATE = 16000
FASTAPI_URL         = "http://localhost:8000"
SUMMARIES_DIR       = os.path.join(os.path.dirname(os.path.dirname(__file__)), "summaries")
os.makedirs(SUMMARIES_DIR, exist_ok=True)

JUNK_PHRASES = [
    "thanks for watching", "thank you for watching",
    "please subscribe", "like and subscribe",
    "bye bye", "see you next time",
    "don't forget to subscribe", "thank you for listening",
]

CATEGORY_KEYWORDS = {
    "Water Supply": ["water", "supply", "pipe", "tap", "borewell", "tank", "sewage", "contaminated"],
    "Electricity":  ["electricity", "power", "light", "current", "voltage", "electric", "bescom", "transformer"],
    "Road":         ["road", "pothole", "street", "footpath", "pavement", "highway", "signal"],
    "Sanitation":   ["garbage", "waste", "drain", "sewer", "sanitation", "toilet", "cleaning", "dustbin"],
    "Network":      ["network", "internet", "wifi", "broadband", "signal", "mobile", "connectivity"],
}

GREETING_MESSAGE = (
    "Hello! Welcome to the Grievance Registration System. "
    "I am here to help you register your complaint today. "
    "May I know your full name please?"
)

buffer = AudioBuffer()
stt    = STTService()
tts    = TTSService()

# Track active TTS tasks per session so we can cancel them instantly on disconnect
active_tts_tasks: dict[str, asyncio.Task] = {}


def broadcast(data: dict):
    try:
        requests.post(f"{FASTAPI_URL}/internal/broadcast", json=data, timeout=5)
    except Exception as e:
        print(f"❌ Broadcast error: {e}")


def resample(pcm: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
    if orig_sr == target_sr:
        return pcm
    ratio   = target_sr / orig_sr
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


def extract_name(text: str) -> str | None:
    text = text.strip()
    for prefix in ["my name is", "i am", "i'm", "this is", "call me", "name is"]:
        if text.lower().startswith(prefix):
            text = text[len(prefix):].strip()
    words = text.split()
    if 1 <= len(words) <= 3:
        return " ".join(w.capitalize() for w in words)
    return None


def extract_category(text: str) -> str:
    text_lower = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return category
    return "Other"


async def safe_tts_and_broadcast(
    text: str,
    stop_event: asyncio.Event,
    session_id: str,
    label: str = ""
):
    """
    Cancellable TTS helper.
    - Stored as asyncio.Task so it can be cancelled instantly on disconnect
    - Checks stop_event BEFORE and AFTER generation
    - Never broadcasts audio if call has ended
    """

    # Check 1: before starting TTS
    if stop_event.is_set():
        print(f"🛑 [{label}] Skipping TTS — call already ended")
        return

    async def _run():
        try:
            audio_b64 = await tts.synthesize_async(text)

            # Check 2: after TTS finishes (call may have ended during await)
            if stop_event.is_set():
                print(f"🛑 [{label}] Call ended during TTS — not broadcasting")
                return

            if audio_b64:
                broadcast({"type": "agent_audio", "audio": audio_b64})
                print(f"✅ Audio sent [{label}]")
            else:
                print(f"⚠️ TTS returned empty [{label}]")

        except asyncio.CancelledError:
            print(f"🛑 [{label}] TTS cancelled mid-generation")
            raise

    task = asyncio.create_task(_run())
    active_tts_tasks[session_id] = task

    try:
        await task
    except asyncio.CancelledError:
        print(f"🛑 [{label}] TTS task was cancelled")
    finally:
        active_tts_tasks.pop(session_id, None)


def generate_summary(session, duration_seconds: int) -> dict:
    try:
        history_text = "\n".join(
            [f"{m['role'].upper()}: {m['content']}" for m in session.history]
        )
        prompt = f"""Based on this grievance conversation, return a JSON object:
- issue_category: Water Supply / Electricity / Road / Sanitation / Network / Other
- severity: "low" / "medium" / "high"
- description: one clear sentence describing the issue
- resolution_status: "Registered" / "In Progress" / "Resolved"
- user_name: the user name from conversation, else "Unknown"

Conversation:
{history_text}

Respond ONLY with valid JSON. No markdown."""

        url     = f"{os.getenv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
            "Content-Type":  "application/json",
        }
        payload = {
            "model":       os.getenv("MODEL_NAME", "mistralai/mistral-7b-instruct"),
            "messages":    [{"role": "user", "content": prompt}],
            "max_tokens":  300,
            "temperature": 0.3,
        }
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        data     = response.json()
        text     = data["choices"][0]["message"]["content"].strip()
        text     = text.replace("```json", "").replace("```", "").strip()
        summary  = json.loads(text)

    except Exception as e:
        print(f"❌ Summary error: {e}")
        summary = {
            "issue_category":    session.issue_category or "Other",
            "severity":          "medium",
            "description":       "Grievance registered via voice call.",
            "resolution_status": "Registered",
            "user_name":         session.user_name or "Unknown",
        }

    if session.user_name:
        summary["user_name"] = session.user_name
    if session.issue_category:
        summary["issue_category"] = session.issue_category

    summary["session_id"] = session.session_id
    summary["messages"]   = [
        {"role": "user" if m["role"] == "user" else "agent", "text": m["content"]}
        for m in session.history
    ]
    mins = duration_seconds // 60
    secs = duration_seconds % 60
    summary["duration"] = f"{mins}m {secs}s" if mins > 0 else f"{secs}s"
    return summary


def save_summary(session_id: str, summary: dict):
    path = os.path.join(SUMMARIES_DIR, f"{session_id}.json")
    with open(path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"✅ Summary saved: {path}")


async def send_greeting(session_id: str, stop_event: asyncio.Event):
    """Auto-send greeting when call starts."""
    await asyncio.sleep(1.5)

    if stop_event.is_set():
        print("🛑 Greeting cancelled — call already ended")
        return

    print("🤖 Sending greeting...")

    session = store.get_session(session_id)
    if session:
        session.add_message("assistant", GREETING_MESSAGE)

    broadcast({"type": "ai_response", "text": GREETING_MESSAGE})

    await safe_tts_and_broadcast(
        GREETING_MESSAGE, stop_event, session_id, label="greeting"
    )
    print("✅ Greeting done")


async def process_audio(track, session_id: str, stop_event: asyncio.Event):
    print("🎧 Processing audio stream...")
    audio_stream = rtc.AudioStream(track)

    async for frame in audio_stream:

        if stop_event.is_set():
            print("🛑 Stopping audio processing")
            break

        try:
            pcm     = np.frombuffer(frame.frame.data, dtype=np.int16)
            pcm_16k = resample(pcm, LIVEKIT_SAMPLE_RATE, WHISPER_SAMPLE_RATE)
            buffer.add_frame(pcm_16k)

            if buffer.is_ready():

                if stop_event.is_set():
                    print("🛑 Stop before buffer processing")
                    break

                audio_bytes = buffer.get_audio()

                # STEP 1: STT
                text = stt.transcribe(audio_bytes, sample_rate=WHISPER_SAMPLE_RATE)
                if not is_valid_transcript(text):
                    continue

                if stop_event.is_set():
                    print("🛑 Stop after STT")
                    break

                print(f"🗣 User: {text}")

                session = store.get_session(session_id)
                if not session:
                    continue

                if session.stage == Stage.GREETING and not session.user_name:
                    name = extract_name(text)
                    if name:
                        session.user_name = name
                        print(f"👤 Name captured: {name}")

                if session.stage == Stage.COLLECT_NAME and not session.issue_category:
                    category = extract_category(text)
                    session.issue_category = category
                    print(f"📂 Category captured: {category}")

                session.add_message("user", text)
                broadcast({"type": "user_transcript", "text": text})

                session.stage = get_next_stage(session.stage, text)
                print(f"📍 Stage: {session.stage.value}")

                if stop_event.is_set():
                    print("🛑 Stop before LLM")
                    break

                broadcast({"type": "agent_thinking"})

                # STEP 3: LLM
                ai_response = generate_response(
                    user_message=text,
                    history=session.history[:-1],
                    stage=session.stage,
                    user_name=session.user_name,
                )

                if stop_event.is_set():
                    print("🛑 Stop after LLM — skipping TTS")
                    break

                print(f"🤖 AI: {ai_response}")
                session.add_message("assistant", ai_response)
                broadcast({"type": "ai_response", "text": ai_response})

                # STEP 4: TTS — cancellable
                await safe_tts_and_broadcast(
                    ai_response, stop_event, session_id,
                    label=f"stage:{session.stage.value}"
                )

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

    session_start_times = {}
    stop_events         = {}

    @room.on("track_subscribed")
    def on_track(track, publication, participant):
        print(f"📡 Track from: {participant.identity}")
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            session    = store.create_session()
            stop_event = asyncio.Event()
            session_start_times[participant.identity] = time.time()
            stop_events[participant.identity]         = stop_event
            print(f"📝 Session: {session.session_id}")
            broadcast({"type": "session_id", "session_id": session.session_id})
            asyncio.create_task(send_greeting(session.session_id, stop_event))
            asyncio.create_task(process_audio(track, session.session_id, stop_event))

    @room.on("participant_disconnected")
    def on_disconnect(participant):
        print(f"👋 Participant disconnected: {participant.identity}")

        # STEP 1: Set stop event immediately
        if participant.identity in stop_events:
            stop_events[participant.identity].set()
            del stop_events[participant.identity]
            print(f"🛑 Stop event set")

        # STEP 2: Cancel any running TTS task immediately
        all_sessions = store.get_all_sessions()
        if all_sessions:
            latest_session_id = all_sessions[-1]["session_id"]
            task = active_tts_tasks.get(latest_session_id)
            if task and not task.done():
                task.cancel()
                print(f"🛑 TTS task cancelled immediately")

        # STEP 3: Tell frontend to stop playing audio
        broadcast({"type": "stop_audio"})
        print("📢 stop_audio sent to frontend")

        # STEP 4: Generate summary
        start_time       = session_start_times.pop(participant.identity, None)
        duration_seconds = int(time.time() - start_time) if start_time else 0

        if all_sessions:
            latest  = all_sessions[-1]
            session = store.get_session(latest["session_id"])
            if session and session.history:
                print("📋 Generating summary...")
                summary = generate_summary(session, duration_seconds)
                save_summary(session.session_id, summary)
                broadcast({"type": "summary_ready", "session_id": session.session_id})
                print(f"✅ Summary ready: {session.session_id}")


async def start():
    await main()
    while True:
        await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(start())