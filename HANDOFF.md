# Voice-Enabled Grievance System — Project Handoff

> **Full session changelog & all code changes (plain English):** see [`COMPLETE_HANDOFF_AND_CHANGELOG.md`](./COMPLETE_HANDOFF_AND_CHANGELOG.md)

**Location:** `D:\Internship\grievance project\Voice_enabled_grievance_platform`  
**Repository:** [voice-enabled-grievance-platform](https://github.com/Nagaraj098/voice-enabled-grievance-platform)  
**Last updated:** May 2026

---

## 1. Executive Summary

This project is a **Voice-Enabled Grievance Registration System (GRS)**. Citizens describe complaints by speaking; an AI voice agent guides them through registration, pulls answers from a **department knowledge base (RAG)**, and saves a structured **call summary** that appears as a ticket on the dashboard.

### Core capabilities

| Feature | Description |
|---------|-------------|
| Voice calls | Real-time audio via **LiveKit** (browser ↔ agent) |
| Speech-to-text | **Whisper** (hosted via external tunnel/Colab endpoint) |
| Reasoning | **OpenRouter** LLM with stage-based conversation flow |
| Text-to-speech | **Microsoft Edge TTS** (`en-IN-NeerjaNeural`) |
| Knowledge base | JSON/PDF uploads, **FAISS** vector search (RAG) |
| Live transcript | **WebSocket** pushes user/agent text + audio to UI |
| Post-call summary | JSON file per session; exportable from UI |
| Auth | **Clerk** (Next.js frontend) |
| Dashboard | Lists tickets from saved summaries |

### What is NOT fully implemented

- **PostgreSQL** is mentioned in the root README but **not connected** — data is stored as JSON files on disk.
- **STT URL** points to a Cloudflare tunnel (Colab Whisper) — expires and must be updated.
- **LiveKit credentials** are hardcoded dev keys — not production-ready.
- Root `src/` folder is a **legacy duplicate** of dashboard code; use `frontend/` only.

---

## 2. Folder Structure (Complete Map)

```
Voice_enabled_grievance_platform/
│
├── HANDOFF.md                          ← This document
├── README.md                           ← Short project description
├── package.json                        ← Root npm metadata (repo link)
│
├── bbmp_roads_sanitation.json          ← Sample BBMP knowledge base
├── bescom_electricity_department.json  ← Sample BESCOM knowledge base
├── bwssb_water_department.json         ← Sample BWSSB knowledge base
│
├── backend/                            ← Python FastAPI + LiveKit agent
│   ├── main.py                         ← FastAPI app entry point
│   ├── config.py                       ← Loads OpenRouter env vars
│   ├── requirements.txt                ← Python deps (partial — see §8)
│   ├── profile.json                    ← User profile (file-based)
│   │
│   ├── agent/                          ← Voice AI pipeline
│   │   ├── livekit_agent.py            ← Main agent: STT → LLM → TTS loop
│   │   ├── state_machine.py            ← Conversation stages + prompts
│   │   └── audio_buffer.py             ← Buffers mic audio before STT
│   │
│   ├── routes/                         ← REST API routers
│   │   ├── token.py                    ← LiveKit JWT for browser
│   │   ├── summary.py                  ← GET /summary/{session_id}
│   │   ├── tickets.py                  ← GET /tickets (dashboard data)
│   │   ├── knowledge.py                ← KB upload/list/edit/delete
│   │   └── profile.py                  ← Profile + avatar upload
│   │
│   ├── services/                       ← External AI services
│   │   ├── stt_service.py              ← Whisper via HTTP POST
│   │   ├── tts_service.py              ← edge-tts audio generation
│   │   ├── llm_service.py              ← OpenRouter chat + RAG injection
│   │   └── rag_service.py              ← FAISS index build + search
│   │
│   ├── sessions/
│   │   └── session_store.py            ← In-memory session state per call
│   │
│   ├── sockets/
│   │   └── connection_manager.py       ← WebSocket broadcast to all clients
│   │
│   ├── knowledge/                      ← Uploaded KB files (.json, .pdf)
│   ├── faiss_index/                    ← Persisted vector index (auto-built)
│   ├── summaries/                      ← Post-call JSON summaries (= tickets)
│   ├── avatars/                        ← Profile avatar images
│   └── venv/                           ← Python virtual environment
│
├── frontend/                           ← Next.js 16 web application (PRIMARY UI)
│   ├── package.json
│   ├── .env.local                      ← Clerk keys, optional mock flags
│   ├── next.config.ts
│   │
│   ├── public/                         ← Static assets
│   │
│   └── src/
│       ├── app/                        ← Next.js App Router pages
│       │   ├── page.tsx                ← Landing (redirects if signed in)
│       │   ├── home/                   ← Post-login home
│       │   ├── call/                   ← Voice call screen
│       │   ├── summary/                ← Post-call summary view
│       │   ├── dashboard/              ← Tickets & recent calls
│       │   ├── knowledge-base/         ← KB management UI
│       │   ├── profile/                ← User settings
│       │   ├── sign-in/                ← Clerk sign-in
│       │   └── sign-up/                ← Clerk sign-up
│       │
│       ├── components/
│       │   ├── voice/                  ← VoiceLayout (main call UI)
│       │   ├── summary/                ← SummaryCard, ExportButton
│       │   ├── layout/                 ← Sidebar, ThemeToggle, Navbar
│       │   ├── chat/                   ← Transcript display
│       │   ├── audio/                  ← Audio playback helpers
│       │   └── mic-recorder/           ← Mic UI components
│       │
│       ├── hooks/
│       │   └── useTranscript.ts        ← WebSocket + audio playback hook
│       │
│       ├── lib/
│       │   ├── livekit.ts              ← connectToLiveKit()
│       │   └── exportTranscript.ts     ← Export summary as text file
│       │
│       └── types/
│           └── chat.ts                 ← Message type definitions
│
└── src/                                ← ⚠️ LEGACY — duplicate dashboard only
    └── app/dashboard/                  ← Do not use; edit frontend/ instead
```

---

## 3. System Architecture

### High-level flow

```
┌─────────────────┐     WebSocket          ┌──────────────────┐
│  Next.js UI     │◄──────────────────────►│  FastAPI :8000   │
│  (frontend)     │   /ws/transcript       │  main.py         │
└────────┬────────┘                        └────────▲─────────┘
         │                                              │
         │ LiveKit audio                     POST /internal/broadcast
         ▼                                              │
┌─────────────────┐                        ┌──────────┴─────────┐
│  LiveKit Server │◄────── audio ─────────►│  livekit_agent.py  │
│  :7880          │      voice-room        │  (Python agent)    │
└─────────────────┘                        └──────────┬─────────┘
                                                      │
                              ┌───────────────────────┼───────────────────────┐
                              ▼                       ▼                       ▼
                         STT (Whisper)          LLM (OpenRouter)         TTS (edge-tts)
                              │                       │                       │
                              └───────────────────────┴───────────────────────┘
                                                      │
                                              RAG (FAISS + embeddings)
```

### Conversation pipeline (per user utterance)

1. User speaks into microphone → audio streams to LiveKit room `voice-room`.
2. `livekit_agent.py` receives audio frames, resamples 48kHz → 16kHz.
3. `AudioBuffer` accumulates speech; when user pauses, audio goes to **STT**.
4. Valid transcript is broadcast as `user_transcript` via FastAPI WebSocket.
5. **State machine** advances stage (`greeting` → … → `summary`).
6. **LLM** generates response (stage prompt + optional RAG context).
7. **TTS** converts response to MP3 chunks; broadcast as `agent_audio` + `agent_response`.
8. On call end → **summary JSON** saved → `summary_ready` event → UI redirects.

---

## 4. Backend — Detailed Breakdown

### 4.1 `main.py` — FastAPI application

| Route | Method | Purpose |
|-------|--------|---------|
| `/token` | GET | Issue LiveKit JWT for browser participant |
| `/summary/{session_id}` | GET | Return saved summary JSON |
| `/tickets` | GET | List all summaries as dashboard tickets |
| `/tickets/{session_id}` | GET | Single ticket by session ID |
| `/knowledge` | GET | List knowledge base files |
| `/knowledge/upload` | POST | Upload JSON or PDF, rebuild FAISS |
| `/knowledge/{filename}` | GET/PUT/DELETE | Read, update, delete KB file |
| `/profile` | GET/PUT | User profile from `profile.json` |
| `/profile/avatar` | POST | Upload avatar image |
| `/internal/broadcast` | POST | Agent pushes events to WebSocket clients |
| `/session/stop` | POST | End call; broadcast `session_stopped` + `stop_audio` |
| `/ws/transcript` | WebSocket | Real-time events to frontend |
| `/avatars/{file}` | Static | Serve uploaded avatar images |

**CORS:** Enabled for all origins (`*`) — tighten for production.

### 4.2 `agent/livekit_agent.py` — Voice agent

**Constants (dev):**

| Setting | Value |
|---------|-------|
| LiveKit URL | `ws://localhost:7880` |
| API Key / Secret | `devkey` / `supersecretkeysupersecretkey1234567890abcd` |
| Room | `voice-room` |
| Agent identity | `ai-agent` |
| FastAPI | `http://localhost:8000` |

**Key functions:**

- `broadcast(data)` — POSTs events to `/internal/broadcast`.
- `extract_name()` / `extract_category()` — Parse user metadata from speech.
- `safe_tts_and_broadcast()` — TTS with cancel-on-interrupt support.
- `generate_summary()` — LLM creates JSON summary after call ends.
- `save_summary()` — Writes `summaries/{session_id}.json`.

**Issue categories (keyword detection):**

- Water Supply, Electricity, Road, Sanitation, Network, Other

### 4.3 `agent/state_machine.py` — Conversation stages

| Stage | Agent behavior |
|-------|----------------|
| `greeting` | Welcome user, ask for full name |
| `collect_name` | Acknowledge name, ask issue category |
| `collect_issue` | Collect problem details (what, when, severity) |
| `empathy` | Show empathy, confirm understanding (uses RAG if available) |
| `resolution` | Confirm registration, mention 3–5 day resolution |
| `summary` | Thank user and close call |

`get_next_stage()` uses keyword heuristics on user text to advance stages.

### 4.4 `services/` — AI integrations

| File | Technology | Notes |
|------|------------|-------|
| `stt_service.py` | Whisper (HTTP) | `COLAB_WHISPER_URL` — **update when tunnel dies** |
| `tts_service.py` | edge-tts | Voice: `en-IN-NeerjaNeural`, streams MP3 base64 |
| `llm_service.py` | OpenRouter API | Model from `MODEL_NAME` env, max 150 tokens |
| `rag_service.py` | FAISS + HuggingFace | Model: `all-MiniLM-L6-v2`, indexes JSON + PDF chunks |

### 4.5 `sessions/session_store.py`

In-memory store per active call:

- `session_id` (UUID)
- `stage`, `history[]`, `user_name`, `issue_category`, `issue_severity`, `issue_description`

**Lost on server restart** — not persisted until summary is saved.

### 4.6 Data directories

| Folder | Contents |
|--------|----------|
| `knowledge/` | Department JSON/PDF files for RAG |
| `faiss_index/` | Built vector index (rebuilt on upload/delete) |
| `summaries/` | One `{session_id}.json` per completed call |
| `avatars/` | User profile images |

### 4.7 Summary JSON schema (example)

```json
{
  "session_id": "uuid-here",
  "user_name": "Rahul Kumar",
  "issue_category": "Water Supply",
  "severity": "high",
  "description": "No water supply for 3 days in Sector 4.",
  "resolution_status": "Registered",
  "duration": "4m 32s",
  "messages": [
    { "role": "user", "text": "..." },
    { "role": "agent", "text": "..." }
  ]
}
```

---

## 5. Frontend — Detailed Breakdown

### 5.1 Tech stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **Clerk** — authentication
- **livekit-client** — browser audio room
- **recharts** — dashboard charts
- **pdf-parse / pdfjs-dist** — knowledge base PDF preview

### 5.2 Pages (`frontend/src/app/`)

| Route | File | Description |
|-------|------|-------------|
| `/` | `page.tsx` | Marketing landing; signed-in users → `/home` |
| `/home` | `home/page.tsx` | Main hub after login |
| `/call` | `call/page.tsx` | Voice call — renders `VoiceLayout` |
| `/summary` | `summary/page.tsx` | Fetches `GET /summary/{sessionId}`, export |
| `/dashboard` | `dashboard/page.tsx` | Tickets from `/tickets`, links to summaries |
| `/knowledge-base` | `knowledge-base/page.tsx` | Upload & manage KB files |
| `/knowledge-base/files` | `files/page.tsx` | File list |
| `/knowledge-base/files/edit` | `files/edit/page.tsx` | Edit JSON rules |
| `/knowledge-base/preview` | `preview/page.tsx` | PDF/JSON preview |
| `/profile` | `profile/page.tsx` | Profile + notification prefs |
| `/sign-in`, `/sign-up` | Clerk pages | Auth |

### 5.3 Key components

| Component | Role |
|-----------|------|
| `VoiceLayout.tsx` | Fetches LiveKit token, connects room, shows transcript, End Call |
| `useTranscript.ts` | WebSocket hook: messages, TTS playback, summary redirect |
| `SummaryCard.tsx` | Displays post-call summary fields |
| `ExportButton.tsx` | Downloads transcript as `.txt` |
| `Sidebar.tsx` | Navigation between app sections |

### 5.4 WebSocket events (frontend ↔ backend)

| Event `type` | Direction | Action |
|--------------|-----------|--------|
| `session_id` | Server → UI | Store session ID for summary URL |
| `user_transcript` | Server → UI | Add user message; stop agent audio |
| `agent_thinking` | Server → UI | Show thinking indicator |
| `agent_response` / `ai_response` | Server → UI | Add agent text to transcript |
| `agent_audio` | Server → UI | Play base64 MP3 |
| `stop_audio` | Server → UI | Stop current TTS playback |
| `session_stopped` | Server → UI | Call ended |
| `summary_ready` | Server → UI | Redirect to `/summary?sessionId=...` |

### 5.5 LiveKit connection

`frontend/src/lib/livekit.ts` connects to `ws://127.0.0.1:7880` with token from `GET http://localhost:8000/token`.

---

## 6. Knowledge Base (RAG)

### Sample department files (repo root)

Copy these into `backend/knowledge/` or upload via UI:

| File | Department |
|------|------------|
| `bbmp_roads_sanitation.json` | BBMP — Roads & Sanitation |
| `bescom_electricity_department.json` | BESCOM — Electricity |
| `bwssb_water_department.json` | BWSSB — Water |

### JSON structure (expected)

```json
{
  "category": "Roads and Sanitation",
  "department": "BBMP - ...",
  "policies": [{ "rule": "..." }],
  "contact_info": { "helpline": "1533", ... },
  "common_grievances": [...],
  "faq": [...]
}
```

### How RAG is used

1. On upload/delete, `rebuild_index()` scans `knowledge/` and rebuilds FAISS.
2. During each LLM call, `search_knowledge(user_message)` retrieves top chunks.
3. Chunks are appended to the system prompt so the agent cites helplines, SLAs, and policies.

---

## 7. Environment Variables

### Backend (`.env` in `backend/` or project root)

```env
OPENROUTER_API_KEY=your_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
MODEL_NAME=mistralai/mistral-7b-instruct
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
# Optional: NEXT_PUBLIC_USE_MOCK=true  (skip WebSocket for UI-only testing)
```

### Hardcoded (change before production)

- LiveKit API key/secret in `backend/routes/token.py` and `livekit_agent.py`
- STT URL in `backend/services/stt_service.py`
- LiveKit WebSocket URL in `frontend/src/lib/livekit.ts`

---

## 8. How to Run (Development)

### Prerequisites

- Node.js 18+
- Python 3.10+
- LiveKit server running locally on port **7880**
- OpenRouter API key
- Working STT endpoint (update `stt_service.py` URL)

### Terminal 1 — LiveKit

Run LiveKit server with dev credentials matching `devkey` / secret in code.

### Terminal 2 — FastAPI backend

```bash
cd backend
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
# Also install: livekit livekit-api edge-tts numpy langchain-community faiss-cpu pypdf

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 3 — LiveKit voice agent

```bash
cd backend
venv\Scripts\activate
python agent/livekit_agent.py
```

### Terminal 4 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** → Sign in → **Call** → speak → **End Call** → view **Summary** / **Dashboard**.

---

## 9. API Quick Reference

| Endpoint | Example |
|----------|---------|
| LiveKit token | `GET http://localhost:8000/token?participant_name=User` |
| Summary | `GET http://localhost:8000/summary/{session_id}` |
| All tickets | `GET http://localhost:8000/tickets` |
| List KB | `GET http://localhost:8000/knowledge` |
| Upload KB | `POST http://localhost:8000/knowledge/upload` (multipart file) |
| Stop session | `POST http://localhost:8000/session/stop` |
| WebSocket | `ws://localhost:8000/ws/transcript` |

---

## 10. Known Issues & Next Steps

| Priority | Issue | Suggested fix |
|----------|-------|---------------|
| High | STT tunnel URL expires | Host Whisper locally or on stable server |
| High | `requirements.txt` incomplete | `pip freeze` full agent dependencies |
| High | Dev LiveKit keys hardcoded | Move to `.env`, use production keys |
| Medium | No PostgreSQL | Add DB for sessions, tickets, KB metadata |
| Medium | Sessions in-memory only | Persist active sessions or recover on restart |
| Medium | `/call` auth disabled | Re-enable Clerk guard in `call/page.tsx` |
| Low | Duplicate `src/` at root | Delete or archive after confirming unused |
| Low | KB UI TODOs | Category tagging, unstructured text endpoint |

---

## 11. File Ownership Guide (for new developers)

| If you need to change… | Edit this file |
|------------------------|----------------|
| Voice call UI | `frontend/src/components/voice/VoiceLayout.tsx` |
| Transcript / audio events | `frontend/src/hooks/useTranscript.ts` |
| Agent conversation logic | `backend/agent/livekit_agent.py` |
| Stage prompts & flow | `backend/agent/state_machine.py` |
| LLM prompts / RAG injection | `backend/services/llm_service.py` |
| Knowledge search | `backend/services/rag_service.py` |
| REST APIs | `backend/routes/*.py` |
| Summary display | `frontend/src/app/summary/page.tsx` |
| Dashboard tickets | `frontend/src/app/dashboard/page.tsx` |

---

## 12. Contact & Handoff Checklist

Before taking over the project, verify:

- [ ] LiveKit server runs and agent connects to `voice-room`
- [ ] FastAPI responds at `http://localhost:8000/docs`
- [ ] OpenRouter key works (test LLM in Swagger or agent logs)
- [ ] STT URL returns transcripts (update if 404/timeout)
- [ ] Frontend connects WebSocket (no errors in browser console)
- [ ] End-to-end call produces file in `backend/summaries/`
- [ ] Dashboard shows new ticket after call
- [ ] Knowledge base upload rebuilds FAISS without errors

---

*For questions about this codebase, start with `backend/agent/livekit_agent.py` (voice pipeline) and `frontend/src/components/voice/VoiceLayout.tsx` (user-facing call UI).*
