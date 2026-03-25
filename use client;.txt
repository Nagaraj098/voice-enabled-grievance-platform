"use client";

import { useEffect, useState } from "react";
import { Message } from "@/types/chat";

export function useTranscript() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // 🔥 MOCK DATA (for UI testing now)
  useEffect(() => {
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

    // simulate agent thinking after 2s
    setTimeout(() => {
      setIsThinking(true);
    }, 2000);

    // simulate agent response after 4s
    setTimeout(() => {
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
    }, 4000);
  }, []);

  // 🔌 REAL WEBSOCKET (will work when backend is ready)
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/transcript");

    ws.onopen = () => {
      console.log("WebSocket connected");
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

          case "agent_thinking":
            setIsThinking(true);
            break;

          default:
            console.log("Unknown event:", data);
        }
      } catch (err) {
        console.error("Invalid WS message", err);
      }
    };

    ws.onerror = () => {
      console.log("WebSocket error (backend not running yet)");
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => ws.close();
  }, []);

  return { messages, isThinking };
}