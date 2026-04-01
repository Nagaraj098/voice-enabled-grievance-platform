"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Message } from "@/types/chat";

const WS_URL = "ws://localhost:8000/ws/transcript";
const RETRY_DELAY_MS = 3000;

export function useTranscript() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  // ── Play base64 audio ────────────────────────────────────────────────────
  const playAudio = useCallback((base64Audio: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audioRef.current = audio;
      audio.play().catch((err) => console.warn("Audio play failed:", err));
      audio.onended = () => { audioRef.current = null; };
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  }, []);

  // ── Mock mode ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!USE_MOCK) return;
    setMessages([
      { id: crypto.randomUUID(), role: "user",  text: "Hello", timestamp: Date.now() },
      { id: crypto.randomUUID(), role: "agent", text: "Hi, how can I help?", timestamp: Date.now() },
    ]);
  }, [USE_MOCK]);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (USE_MOCK) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WS connected");
      setIsConnected(true);
      setError(null);
      if (retryRef.current) clearTimeout(retryRef.current);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 WS message:", data.type);

        switch (data.type) {

          case "session_id":
            // ✅ Store session ID for summary redirect
            setSessionId(data.session_id);
            console.log("📝 Session ID:", data.session_id);
            break;

          case "user_transcript":
            setMessages((prev) => [...prev, {
              id: crypto.randomUUID(),
              role: "user",
              text: data.text,
              timestamp: Date.now(),
            }]);
            break;

          case "agent_thinking":
            setIsThinking(true);
            break;

          case "ai_response":
          case "agent_response":
            setIsThinking(false);
            setMessages((prev) => [...prev, {
              id: crypto.randomUUID(),
              role: "agent",
              text: data.text,
              timestamp: Date.now(),
            }]);
            break;

          case "agent_audio":
            if (data.audio) playAudio(data.audio);
            break;

          case "summary_ready":
            // ✅ Auto redirect to summary page when call ends
            console.log("📋 Summary ready, redirecting...");
            router.push(`/summary?sessionId=${data.session_id}`);
            break;

          default:
            console.log("Unknown WS event:", data.type);
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    ws.onerror = () => {
      setError("WebSocket connection failed — retrying...");
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WS closed — retrying in 3s");
      setIsConnected(false);
      wsRef.current = null;
      retryRef.current = setTimeout(connect, RETRY_DELAY_MS);
    };
  }, [USE_MOCK, playAudio, router]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, [connect]);

  return {
    messages,
    isThinking,
    isConnected: USE_MOCK ? true : isConnected,
    error,
    sessionId,
  };
}