"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { useTranscript } from "@/hooks/useTranscript";
import AudioPlayer from "@/components/audio/AudioPlayer";

export default function ChatTranscript({
  setSpeaking,
}: {
  setSpeaking: (v: boolean) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  let transcriptData;
  try {
    transcriptData = useTranscript();
  } catch (err) {
    transcriptData = null;
  }

  const {
    messages = [],
    isThinking = false,
    audio = null,
    isConnected = false,
    error = null,
  } = transcriptData || {};

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  if (!mounted) {
    return <div className="h-full flex items-center justify-center text-zinc-500">Loading chat...</div>;
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col gap-2 relative">
      {!isConnected && !error && messages.length === 0 && (
        <div className="text-zinc-500 text-sm italic text-center mt-4">Connecting to backend...</div>
      )}

      {error && (
        <div className="bg-red-900/50 text-red-100 text-sm p-3 rounded border border-red-800/50 mb-2 whitespace-pre-wrap">
          ⚠️ {error}
        </div>
      )}

      {messages.length === 0 && isConnected && !error && (
        <div className="text-zinc-500 text-sm italic text-center mt-4">Waiting for messages...</div>
      )}

      {messages.map((msg: any, index: number) => {
        const isLastAgent = msg.role === "agent" && index === messages.length - 1;

        return (
          <MessageBubble
            key={msg.id || index}
            message={msg}
            isSpeaking={isLastAgent && !!audio}
          />
        );
      })}

      {isThinking && <TypingIndicator />}

      <div ref={bottomRef} />

      {/* 🔊 Audio */}
      {audio && (
        <AudioPlayer
          base64={audio}
          onStart={() => setSpeaking?.(true)}
          onEnd={() => setSpeaking?.(false)}
        />
      )}
    </div>
  );
}