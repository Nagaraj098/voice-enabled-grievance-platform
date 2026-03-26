"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Message } from "@/types/chat";

const WS_URL = "ws://localhost:8000/ws/transcript"; // ✅ localhost not 127.0.0.1
const RETRY_DELAY_MS = 3000;

export function useTranscript() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [audio, setAudio] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

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

  // ── WebSocket mode ────────────────────────────────────────────────────────
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

          // ✅ Fixed: backend sends "ai_response" not "agent_response"
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
            setAudio(data.audio);
            break;

          default:
            console.log("Unknown WS event:", data.type, data);
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
      // ✅ Auto reconnect
      retryRef.current = setTimeout(connect, RETRY_DELAY_MS);
    };
  }, [USE_MOCK]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [connect]);

  return {
    messages,
    isThinking,
    audio,
    isConnected: USE_MOCK ? true : isConnected,
    error,
  };
}