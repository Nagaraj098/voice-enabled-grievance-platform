# Complete Project Handoff & Session Changelog

**Project:** Voice-Enabled Grievance Registration System (GRS)  
**Path:** `D:\Internship\grievance project\Voice_enabled_grievance_platform`  
**Session date:** May 2026  
**Purpose of this file:** One place for everything — project explanation, all markdown docs, every code change from this chat, and plain-language notes for the next developer.

---

## Table of contents

1. [What this project does (plain English)](#1-what-this-project-does-plain-english)
2. [Markdown files in this repo](#2-markdown-files-in-this-repo)
3. [How to run everything](#3-how-to-run-everything)
4. [Session conversation summary](#4-session-conversation-summary)
5. [All code changes (detailed)](#5-all-code-changes-detailed)
6. [Files created vs modified](#6-files-created-vs-modified)
7. [Dashboard bug fix](#7-dashboard-bug-fix)
8. [Voice & TTS performance improvements](#8-voice--tts-performance-improvements)
9. [RAG — status and recommendations](#9-rag--status-and-recommendations)
10. [Docker & LiveKit (FAQ from session)](#10-docker--livekit-faq-from-session)
11. [Known issues & next steps](#11-known-issues--next-steps)
12. [Quick reference — which file to edit](#12-quick-reference--which-file-to-edit)

---

## 1. What this project does (plain English)

Imagine a citizen calling a government helpline, but instead of waiting on hold, they **talk to an AI agent in the browser**. The system:

1. **Listens** to their voice (microphone → LiveKit → Python agent).
2. **Converts speech to text** (Whisper via a remote URL).
3. **Thinks** using an LLM (OpenRouter) with a fixed conversation flow: name → category → issue → empathy → resolution.
4. **Looks up department rules** from uploaded JSON/PDF files (RAG with FAISS) when the issue is being discussed.
5. **Speaks back** using Indian English TTS (Microsoft Edge TTS).
6. **Shows live text** on the call screen via WebSocket.
7. **Saves a JSON summary** when the call ends — that summary becomes a **ticket on the dashboard**.

There is **no real database** for tickets yet — everything is stored as `.json` files in `backend/summaries/`.

---

## 2. Markdown files in this repo

| File | What it contains |
|------|------------------|
| **`COMPLETE_HANDOFF_AND_CHANGELOG.md`** | **This file** — full session history, all changes, human explanations. |
| **`HANDOFF.md`** | Technical project handoff: folder map, architecture, API list, env vars, run instructions. |
| **`README.md`** (root) | One-paragraph project description only (very short). |
| **`frontend/README.md`** | Default Next.js boilerplate readme (not project-specific). |

**Recommendation:** Start with this file for “what changed in our session”; use `HANDOFF.md` for day-to-day development reference.

---

## 3. How to run everything

You need **four things running** for a full voice call + dashboard:

| # | What | Command | Port |
|---|------|---------|------|
| 1 | **LiveKit server** (usually Docker) | `docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp livekit/livekit-server --dev --keys "devkey: supersecretkeysupersecretkey1234567890abcd"` | 7880 |
| 2 | **FastAPI backend** | `cd backend` → `venv\Scripts\activate` → `uvicorn main:app --reload --port 8000` | 8000 |
| 3 | **Voice agent** | `cd backend` → `venv\Scripts\activate` → `python agent/livekit_agent.py` | — |
| 4 | **Frontend** | `cd frontend` → `npm run dev` | 3000 or 3001 |

**Important:**

- `python agent/livekit_agent.py` does **not** replace Docker. Docker/LiveKit must stay up for audio routing.
- Always activate **`backend\venv`** before running the agent (needs `langchain_community`, `livekit`, `edge-tts`, etc.).
- Dashboard reads from **`GET http://localhost:8000/tickets`** — backend must be running.

---

## 4. Session conversation summary

Everything below happened across this Cursor chat session, in order.

| Step | User asked | What we did |
|------|------------|-------------|
| 1 | Handoff / summary file for the project | No `HANDOFF.md` existed. Explored codebase and created **`HANDOFF.md`** (~500 lines) with folders, architecture, APIs, run guide. |
| 2 | “hi” | Short greeting. |
| 3 | Detailed `.md` with folders and project explanation | Created/expanded **`HANDOFF.md`** (already done in step 1). |
| 4 | Improve voice call speed and TTS | Optimized TTS, LLM, STT, audio buffer, agent async, frontend audio queue (see [§8](#8-voice--tts-performance-improvements)). |
| 5 | Must Docker keep running for `livekit_agent.py`? | Explained: **Yes** — LiveKit server (Docker) + uvicorn + agent + frontend all required. |
| 6 | Dashboard not working; is RAG correct? | Found dashboard called wrong APIs (`/summaries`, `/sessions`). Fixed to use **`/tickets`**. Confirmed RAG works; noted missing BESCOM file in `knowledge/`. |
| 7 | Total MD with all changes (this request) | Created **`COMPLETE_HANDOFF_AND_CHANGELOG.md`** (this file). |

---

## 5. All code changes (detailed)

Below is every file touched in this session, **why** it changed, and **what** changed — in human terms.

---

### 5.1 `backend/services/tts_service.py` — faster speech, smarter TTS pipeline

**Problem:** The agent waited until the **entire** AI reply was converted to audio before the user heard anything. That felt slow.

**What we changed:**

| Before | After |
|--------|--------|
| Speech rate `+10%` | Speech rate **`+25%`** (faster voice) |
| One big `synthesize_async()` for full text | **`synthesize_sentences()`** — first sentence plays ASAP |
| All sentences generated one after another | Sentences 2+ generated **in parallel** while sentence 1 plays |
| Agent used full-text TTS only | Agent loops over `synthesize_sentences()` and sends each chunk |

**In simple terms:** The user hears the first part of the answer much sooner, and longer answers don’t block on generating all audio upfront.

---

### 5.2 `backend/agent/livekit_agent.py` — streaming TTS + non-blocking AI

**Problem:** STT and LLM calls blocked the audio loop; greeting had a long delay; summaries had no timestamp.

**What we changed:**

| Area | Change |
|------|--------|
| **`safe_tts_and_broadcast()`** | Uses `synthesize_sentences()` and broadcasts **each audio chunk** as it’s ready (not one blob at the end). |
| **STT** | Wrapped in `asyncio.to_thread()` so waiting on Whisper doesn’t freeze the agent. |
| **LLM** | Wrapped in `asyncio.to_thread()` for the same reason. |
| **Greeting delay** | Reduced from **1.5 seconds** to **0.4 seconds** after call connect. |
| **Summary JSON** | Added **`created_at`** (ISO timestamp) when saving after a call. |
| **Imports** | Added `from datetime import datetime, timezone`. |

---

### 5.3 `backend/services/llm_service.py` — faster, shorter, smarter RAG usage

**Problem:** LLM was slow (long replies, RAG on every turn, full history every time).

**What we changed:**

| Setting | Before | After |
|---------|--------|--------|
| `max_tokens` | 150 | **90** |
| RAG search | Every conversation stage | Only **`collect_issue`**, **`empathy`**, **`resolution`** |
| RAG results | `top_k=3` | **`top_k=2`** |
| History sent to API | Full history | **Last 8 messages only** |
| HTTP client | New request each time | **`requests.Session()`** (connection reuse) |
| System prompt | Stage prompt only | Stage prompt + **brevity rule** (“max 2 short sentences”) |
| `temperature` | 0.7 | **0.6** |

**In simple terms:** The AI talks less, searches the knowledge base only when it matters, and responds faster.

---

### 5.4 `backend/services/stt_service.py` — slightly faster STT requests

**What we changed:**

- Uses **`requests.Session()`** to reuse TCP connections to the Whisper URL.
- Timeout set to **`(3, 12)`** seconds (connect, read) instead of a flat 15s.

---

### 5.5 `backend/agent/audio_buffer.py` — quicker “user finished speaking” detection

**Problem:** Too much `print` logging on every audio frame slowed processing; silence detection was conservative.

**What we changed:**

| Setting | Before | After |
|---------|--------|--------|
| `SILENCE_LIMIT` | 8 frames | **6 frames** (faster end-of-utterance) |
| `MIN_SPEECH_FRAMES` | 3 | **2** |
| `MIN_AUDIO_LEN` | 0.5 sec | **~0.33 sec** (`sample_rate // 3`) |
| Logging | Every frame printed volume | Only if **`DEBUG_AUDIO=true`** env var set |

---

### 5.6 `frontend/src/hooks/useTranscript.ts` — audio queue for streaming TTS

**Problem:** Each new `agent_audio` message **stopped** the previous audio. Multi-chunk / multi-sentence TTS only played the last chunk.

**What we changed:**

- Added **`audioQueueRef`** and **`enqueueAudio()`**.
- Chunks play **one after another** in order.
- **`stopAudio()`** clears the queue (used when user speaks or call ends).

**In simple terms:** Sentence-by-sentence TTS from the backend now plays correctly on the frontend.

---

### 5.7 `frontend/src/app/dashboard/page.tsx` — dashboard actually loads tickets

**Problem:** Dashboard showed **“Backend not connected yet”** even with 20+ saved calls and uvicorn running.

**Root cause:** Frontend called **`GET /summaries`** and **`GET /sessions`** — those routes **do not exist**. Backend only has **`GET /tickets`**.

**What we changed:**

| Before | After |
|--------|--------|
| `fetch('/summaries')` then fallback `/sessions` | **`fetch('/tickets')`** |
| User field: `citizen_name \|\| user` | **`user_name \|\| citizen_name \|\| user`** |
| Misleading error: “Complete a voice call…” | **“Cannot reach backend”** + hint to start uvicorn |
| No cache control | **`cache: 'no-store'`** on fetch |

**Data mapping:** Backend returns `{ tickets: [...], total, open, recent_calls }`. Each ticket is a summary JSON with `session_id`, `user_name`, `issue_category`, `description`, `resolution_status`, etc.

---

### 5.8 `backend/routes/tickets.py` — dates for dashboard sorting

**What we changed:**

- When loading summaries from disk, if **`created_at`** is missing, set it from the **file’s last modified time**.
- Older summaries without `created_at` still show a sensible date on the dashboard.

---

### 5.9 `backend/agent/state_machine.py` — minor prompt tweak

**What we changed:**

- Small wording change on **GREETING** stage prompt (one short sentence emphasis).

---

### 5.10 Files NOT changed (but discussed)

| Topic | Status |
|-------|--------|
| `rag_service.py` | Already correct — FAISS + JSON/PDF loaders. No code change in session. |
| `HANDOFF.md` | Created earlier in session; not modified during performance/dashboard fixes. |
| Docker / LiveKit config | Documented only; no compose file added. |

---

## 6. Files created vs modified

### Created (new files)

| File | Description |
|------|-------------|
| `HANDOFF.md` | Main technical handoff document |
| `COMPLETE_HANDOFF_AND_CHANGELOG.md` | This file — full session + changelog |

### Modified (code)

| File | Session topics |
|------|----------------|
| `backend/services/tts_service.py` | Performance |
| `backend/services/llm_service.py` | Performance |
| `backend/services/stt_service.py` | Performance |
| `backend/agent/livekit_agent.py` | Performance + `created_at` on summary |
| `backend/agent/audio_buffer.py` | Performance |
| `backend/agent/state_machine.py` | Minor prompt |
| `backend/routes/tickets.py` | Dashboard dates |
| `frontend/src/hooks/useTranscript.ts` | Audio queue |
| `frontend/src/app/dashboard/page.tsx` | Dashboard API fix |

---

## 7. Dashboard bug fix

### Symptoms you saw

- Total Tickets: **0**
- Recent Calls: **0**
- Message: **“Backend not connected yet”**
- Green **“SYSTEM LIVE”** still showing (misleading — only means UI loaded, not that API worked)

### Reality

- Backend **was** running (`uvicorn` on 8000).
- **21+ summary files** existed in `backend/summaries/`.
- Frontend asked for the **wrong URL**.

### Fix

```text
OLD:  GET http://localhost:8000/summaries  → 404
      GET http://localhost:8000/sessions   → 404

NEW:  GET http://localhost:8000/tickets    → 200 + { tickets: [...] }
```

### After fix

Click **Try again** or refresh the dashboard. You should see all saved calls as tickets.

---

## 8. Voice & TTS performance improvements

### End-to-end latency (conceptual)

```text
BEFORE one user turn:
  User stops speaking → STT (blocking) → LLM (blocking) → FULL TTS → one audio blob → play

AFTER one user turn:
  User stops speaking → STT (background thread) → LLM (background thread)
    → TTS sentence 1 → play immediately
    → TTS sentences 2..N in parallel → queue plays each on frontend
```

### Expected improvements

| Area | Improvement |
|------|-------------|
| Time to first spoken word | Much lower (first sentence only, not full reply) |
| Long AI answers | Rest of sentences generate while first plays |
| LLM round-trip | Shorter tokens, less history, RAG only when needed |
| End-of-speech detection | ~2 frames faster silence detection |
| Greeting | 1.1s faster start |

### Still slow if…

- **STT Cloudflare/Colab URL** is down or far away — biggest external bottleneck.
- **OpenRouter model** is slow — try a faster model in `.env` `MODEL_NAME`.
- **First RAG load** — HuggingFace embeddings download once (~90MB).

---

## 9. RAG — status and recommendations

### Is RAG implemented correctly?

**Yes.** Architecture is sound:

```text
backend/knowledge/*.json, *.pdf
        ↓
rag_service.build_index() → FAISS on disk (faiss_index/)
        ↓
search_knowledge(query) on LLM turns (issue / empathy / resolution)
        ↓
Context injected into OpenRouter system prompt
```

Your agent logs confirmed it works:

```text
📂 Loading FAISS index from disk...
✅ FAISS index loaded
🔍 RAG found 2 results for: 'I have electricity issue.'
```

### Why answers can still feel generic

| Issue | Fix |
|-------|-----|
| `bescom_electricity_department.json` is at **repo root**, not in `backend/knowledge/` | Copy or upload into Knowledge Base UI |
| Query doesn’t match indexed text (e.g. “role issue”) | Expected — retrieval returns weak matches |
| LLM ignores KB context sometimes | Prompt already instructs to use KB; shorter replies help |

### Recommended action

```powershell
Copy-Item "bescom_electricity_department.json" "backend\knowledge\"
Copy-Item "bbmp_roads_sanitation.json" "backend\knowledge\"   # if missing
Copy-Item "bwssb_water_department.json" "backend\knowledge\"  # if missing
```

Then re-upload one file in the UI or delete `backend/faiss_index/` and restart the agent to rebuild the index.

---

## 10. Docker & LiveKit FAQ from session

**Question:** Do I need Docker running for `python agent/livekit_agent.py`?

**Answer:** **Yes**, if LiveKit runs in Docker (typical setup).

| Component | Role |
|-----------|------|
| **Docker + LiveKit** | Audio “phone switch” between browser and Python agent (`ws://localhost:7880`) |
| **`livekit_agent.py`** | AI worker that joins room `voice-room` and runs STT/LLM/TTS |
| **`uvicorn main.py`** | REST API, WebSocket transcript, `/tickets`, `/token` |
| **`npm run dev`** | Web UI |

**Common mistake:** Running the agent from the wrong folder.

```text
WRONG:  Voice_enabled_grievance_platform\agent\livekit_agent.py  (does not exist)
RIGHT:  Voice_enabled_grievance_platform\backend\agent\livekit_agent.py
```

**Common mistake:** Python without venv → `ModuleNotFoundError: langchain_community`.

```powershell
cd backend
.\venv\Scripts\activate
python agent\livekit_agent.py
```

---

## 11. Known issues & next steps

| Priority | Issue | Action |
|----------|-------|--------|
| High | STT tunnel URL expires | Host Whisper locally or stable server; update `stt_service.py` |
| High | `requirements.txt` incomplete | Run `pip freeze` from venv and update |
| Medium | BESCOM JSON not in `knowledge/` | Copy file + rebuild FAISS |
| Medium | Hardcoded LiveKit dev keys | Move to `.env` for production |
| Low | `src/` duplicate at repo root | Use `frontend/` only; archive `src/` |
| Low | PostgreSQL mentioned but unused | Add DB later or remove from README |

---

## 12. Quick reference — which file to edit

| If you want to change… | Edit this file |
|------------------------|----------------|
| How fast the AI speaks | `backend/services/tts_service.py` → `TTS_RATE` |
| When RAG runs | `backend/services/llm_service.py` → `RAG_STAGES` |
| Conversation flow / prompts | `backend/agent/state_machine.py` |
| Voice pipeline logic | `backend/agent/livekit_agent.py` |
| Dashboard data source | `frontend/src/app/dashboard/page.tsx` |
| Audio playback behavior | `frontend/src/hooks/useTranscript.ts` |
| Ticket API | `backend/routes/tickets.py` |
| Knowledge base / FAISS | `backend/services/rag_service.py` |
| Upload KB files | `backend/routes/knowledge.py` + UI `knowledge-base/` |

---

## Appendix A — Summary JSON shape (after a call)

Saved to: `backend/summaries/{session_id}.json`

```json
{
  "issue_category": "Electricity",
  "severity": "low",
  "description": "Electricity issue",
  "resolution_status": "Registered",
  "user_name": "Team Effort",
  "session_id": "691c5c61-26de-4f4e-9c5c-df4789293ca7",
  "created_at": "2026-05-16T08:00:00+00:00",
  "duration": "4m 32s",
  "messages": [
    { "role": "user", "text": "..." },
    { "role": "agent", "text": "..." }
  ]
}
```

---

## Appendix B — API endpoints the frontend should use

| Endpoint | Used by | Returns |
|----------|---------|---------|
| `GET /tickets` | **Dashboard** | All tickets / summaries |
| `GET /summary/{session_id}` | Summary page | One call summary |
| `GET /token` | Call page | LiveKit JWT |
| `WS /ws/transcript` | Call page | Live events |
| `POST /session/stop` | End call button | Stops agent audio |
| `GET /knowledge` | Knowledge base UI | List of KB files |

**Do not use** `/summaries` or `/sessions` — they are not implemented.

---

## Appendix C — Environment variables

**Backend (`backend/.env` or root `.env`):**

```env
OPENROUTER_API_KEY=your_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
MODEL_NAME=mistralai/mistral-7b-instruct
DEBUG_AUDIO=false
```

**Frontend (`frontend/.env.local`):**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

---

*End of complete handoff. For architecture diagrams and folder tree, see `HANDOFF.md`.*
