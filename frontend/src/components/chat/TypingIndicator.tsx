"use client";

export default function TypingIndicator() {
  return (
    <div className="flex gap-1 p-2">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
    </div>
  );
}