"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/types/chat";

export function useTranscript() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [audio, setAudio] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // 🔥 control mode from env (BEST PRACTICE)
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  // =========================
  // 🧪 MOCK MODE
  // =========================
  useEffect(() => {
    if (!USE_MOCK) return;

    setMessages([
      {
        id: crypto.randomUUID(),
        role: "user",
        text: "Hello",
        timestamp: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        role: "agent",
        text: "Hi, how can I help you?",
        timestamp: Date.now(),
      },
    ]);

    const t1 = setTimeout(() => setIsThinking(true), 2000);

    const t2 = setTimeout(() => {
      setIsThinking(false);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          text: "I'm processing your request...",
          timestamp: Date.now(),
        },
      ]);

      // 🔊 mock audio
      setAudio(
        "UklGRigAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
      );
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [USE_MOCK]);

  // =========================
  // 🔌 WEBSOCKET MODE
  // =========================
  useEffect(() => {
    if (USE_MOCK) return;

    // ✅ prevent multiple connections
    if (wsRef.current) return;

    const ws = new WebSocket("ws://localhost:8000/ws/transcript");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WS connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "user_transcript":
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "user",
                text: data.text,
                timestamp: Date.now(),
              },
            ]);
            break;

          case "agent_thinking":
            setIsThinking(true);
            break;

          case "agent_response":
            setIsThinking(false);

            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "agent",
                text: data.text,
                timestamp: Date.now(),
              },
            ]);
            break;

          case "agent_audio":
            setAudio(data.audio);
            break;

          default:
            console.log("⚠️ Unknown event:", data);
        }
      } catch (err) {
        console.error("❌ Invalid WS message", err);
      }
    };

    ws.onerror = (err) => {
      console.log("❌ WS error", err);
    };

    ws.onclose = () => {
      console.log("🔌 WS closed");
      wsRef.current = null;
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [USE_MOCK]);

  return { messages, isThinking, audio };
}