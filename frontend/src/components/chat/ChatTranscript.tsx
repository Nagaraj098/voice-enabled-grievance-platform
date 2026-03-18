"use client";

import { useEffect, useRef } from "react";
import { useTranscript } from "@/hooks/useTranscript";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function ChatTranscript() {
  const { messages, isThinking } = useTranscript();
  const bottomRef = useRef<HTMLDivElement>(null);

  // ✅ Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <div className="w-full max-w-xl h-96 border p-4 overflow-y-auto flex flex-col gap-2">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isThinking && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}