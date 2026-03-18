"use client";

import { useTranscript } from "@/hooks/useTranscript";

export default function FullTranscript() {
  const { messages } = useTranscript();

  return (
    <div className="w-full max-w-xl h-96 border p-4 overflow-y-auto bg-white">
      {messages.map((msg) => (
        <p key={msg.id}>
          <strong>{msg.role}:</strong> {msg.text}
        </p>
      ))}
    </div>
  );
}