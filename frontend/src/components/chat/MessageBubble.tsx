"use client";

import { Message } from "@/types/chat";

export default function MessageBubble({
  message,
  isSpeaking,
}: {
  message: Message;
  isSpeaking?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-4 py-2 rounded-xl max-w-xs relative ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        {/* 🔥 Label */}
        {!isUser && (
          <div className="text-xs text-gray-500 mb-1">AI</div>
        )}

        <p>{message.text}</p>

        {/* 🔊 Speaking animation */}
        {!isUser && isSpeaking && (
          <div className="flex gap-1 mt-2">
            <span className="w-1 h-3 bg-blue-500 animate-bounce"></span>
            <span className="w-1 h-4 bg-blue-500 animate-bounce delay-75"></span>
            <span className="w-1 h-2 bg-blue-500 animate-bounce delay-150"></span>
          </div>
        )}
      </div>
    </div>
  );
}