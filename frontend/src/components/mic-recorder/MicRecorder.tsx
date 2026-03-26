"use client";

import React, { useState, useEffect, useRef } from "react";
import { connectToLiveKit } from "@/lib/livekit";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  type: "user_transcript" | "ai_response";
  text: string;
  timestamp: Date;
}

type ConnectionStatus =
  | "idle"
  | "fetching_token"
  | "connecting"
  | "live"
  | "stopped"
  | "ws_error"
  | "failed";

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND_URL = "http://localhost:8000";
const WS_URL = "ws://localhost:8000/ws/transcript";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function randomId() {
  return "user-" + Math.random().toString(36).slice(2, 7);
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<
  ConnectionStatus,
  { label: string; color: string; dot: string }
> = {
  idle:           { label: "Idle",             color: "text-gray-400",   dot: "bg-gray-400" },
  fetching_token: { label: "Fetching token…",  color: "text-yellow-400", dot: "bg-yellow-400 animate-pulse" },
  connecting:     { label: "Connecting…",      color: "text-yellow-400", dot: "bg-yellow-400 animate-pulse" },
  live:           { label: "Live",             color: "text-emerald-400", dot: "bg-emerald-400 animate-pulse" },
  stopped:        { label: "Stopped",          color: "text-gray-400",   dot: "bg-gray-400" },
  ws_error:       { label: "WS Error",         color: "text-red-400",    dot: "bg-red-400" },
  failed:         { label: "Connection Failed",color: "text-red-400",    dot: "bg-red-400" },
};

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const cfg = statusConfig[status];
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      <span className={`text-xs font-mono tracking-widest uppercase ${cfg.color}`}>
        {cfg.label}
      </span>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.type === "user_transcript";
  return (
    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      <span className="text-[10px] font-mono text-gray-500 px-1">
        {isUser ? "YOU" : "AI"} · {formatTime(msg.timestamp)}
      </span>
      <div
        className={`max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-indigo-600 text-white rounded-tr-sm"
            : "bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-sm"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MicRecorder() {
  const [room, setRoom] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const participantId = useRef(randomId());

  // ── WebSocket ────────────────────────────────────────────────────────────

  useEffect(() => {
    let ws: WebSocket;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setWsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as Omit<Message, "timestamp">;
          setMessages((prev) => [
            ...prev,
            { ...data, timestamp: new Date() },
          ]);
        } catch {
          console.warn("Failed to parse WS message:", event.data);
        }
      };

      ws.onclose = () => {
        console.warn("WebSocket closed — retrying in 3s");
        setWsConnected(false);
        retryTimeout = setTimeout(connect, 3000); // ✅ auto-reconnect
      };

      ws.onerror = () => {
        setStatus("ws_error");
        setWsConnected(false);
      };

      wsRef.current = ws;
    }

    connect();

    return () => {
      clearTimeout(retryTimeout);
      ws?.close();
    };
  }, []);

  // ── Auto scroll ──────────────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Start streaming ──────────────────────────────────────────────────────

  const startStreaming = async () => {
    setError(null);

    try {
      setStatus("fetching_token");

      const res = await fetch(
        `${BACKEND_URL}/token?participant_name=${participantId.current}`
      );

      if (!res.ok) {
        throw new Error(`Token fetch failed: ${res.status} ${res.statusText}`);
      }

      const { token, room: roomName } = await res.json();
      console.log(`🔐 Token received for room: ${roomName}`);

      setStatus("connecting");
      const newRoom = await connectToLiveKit(token);

      setRoom(newRoom);
      setIsStreaming(true);
      setStatus("live");

    } catch (err: any) {
      console.error("Streaming error:", err);
      setError(err.message || "Unknown error");
      setStatus("failed");
    }
  };

  // ── Stop streaming ───────────────────────────────────────────────────────

  const stopStreaming = async () => {
    try {
      if (room) {
        await room.disconnect();
        setRoom(null);
      }
      setIsStreaming(false);
      setStatus("stopped");
    } catch (err) {
      console.error("Stop error:", err);
    }
  };

  // ── Clear ────────────────────────────────────────────────────────────────

  const clearMessages = () => setMessages([]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Voice Grievance
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Speak your issue — AI will respond
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* WS indicator */}
        <div className="flex items-center gap-1.5 px-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              wsConnected ? "bg-emerald-500" : "bg-red-500 animate-pulse"
            }`}
          />
          <span className="text-[10px] text-gray-500 font-mono">
            {wsConnected ? "WebSocket connected" : "WebSocket disconnected — retrying…"}
          </span>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-xl px-4 py-3">
            ⚠️ {error}
          </div>
        )}

        {/* Transcript window */}
        <div className="h-96 overflow-y-auto bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-600 text-sm text-center">
                {isStreaming
                  ? "🎙️ Listening… start speaking"
                  : "Press Start to begin a session"}
              </p>
            </div>
          ) : (
            messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)
          )}
          <div ref={bottomRef} />
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isStreaming ? (
            <button
              onClick={startStreaming}
              disabled={status === "fetching_token" || status === "connecting"}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
            >
              {status === "fetching_token"
                ? "Fetching token…"
                : status === "connecting"
                ? "Connecting…"
                : "🎤 Start Streaming"}
            </button>
          ) : (
            <button
              onClick={stopStreaming}
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              ⏹ Stop Streaming
            </button>
          )}

          <button
            onClick={clearMessages}
            disabled={messages.length === 0}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 text-sm rounded-xl transition-colors"
          >
            🗑
          </button>
        </div>

        {/* Participant ID */}
        <p className="text-center text-[10px] text-gray-600 font-mono">
          session · {participantId.current}
        </p>

      </div>
    </div>
  );
}