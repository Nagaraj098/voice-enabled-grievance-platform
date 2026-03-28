"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Message } from "@/types/chat";

const WS_URL = "ws://localhost:8000/ws/transcript";
const RETRY_DELAY_MS = 3000;

export function useTranscript() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  // ── Play base64 audio ────────────────────────────────────────────────────
  const playAudio = useCallback((base64Audio: string) => {
    try {
      // ✅ Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audioRef.current = audio;

      audio.play().catch((err) => {
        console.warn("Audio play failed:", err);
      });

      audio.onended = () => {
        audioRef.current = null;
        console.log("✅ Audio finished playing");
      };

    } catch (err) {
      console.error("Audio playback error:", err);
    }
  }, []);

  // ── Mock mode ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!USE_MOCK) return;

    setMessages([
      { id: crypto.randomUUID(), role: "user",  text: "Hello", timestamp: Date.now() },
      { id: crypto.randomUUID(), role: "agent", text: "Hi, how can I help you?", timestamp: Date.now() },
    ]);

    const t1 = setTimeout(() => setIsThinking(true), 2000);
    const t2 = setTimeout(() => {
      setIsThinking(false);
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "agent",
        text: "I'm processing your request...",
        timestamp: Date.now(),
      }]);
    }, 4000);

    return () => { clearTimeout(t1); clearTimeout(t2); };
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

          // ✅ handles both ai_response and agent_response
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

          // ✅ Play TTS audio from backend
          case "agent_audio":
            if (data.audio) {
              console.log("🔊 Playing TTS audio...");
              playAudio(data.audio);
            }
            break;

          default:
            console.log("Unknown WS event:", data.type);
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    ws.onerror = () => {
      console.log("WS error");
      setError("WebSocket connection failed — retrying...");
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WS closed — retrying in 3s");
      setIsConnected(false);
      wsRef.current = null;
      retryRef.current = setTimeout(connect, RETRY_DELAY_MS);
    };
  }, [USE_MOCK, playAudio]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
      // Stop audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [connect]);

  return {
    messages,
    isThinking,
    isConnected: USE_MOCK ? true : isConnected,
    error,
  };
}