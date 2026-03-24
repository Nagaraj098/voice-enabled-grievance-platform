"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { useTranscript } from "@/hooks/useTranscript";
import AudioPlayer from "@/components/audio/AudioPlayer";

export default function ChatTranscript({
  setSpeaking,
}: {
  setSpeaking: (v: boolean) => void;
}) {
  const { messages, isThinking, audio } = useTranscript();

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <div className="h-full overflow-y-auto flex flex-col gap-2">
      {messages.map((msg, index) => {
        const isLastAgent =
          msg.role === "agent" && index === messages.length - 1;

        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            isSpeaking={isLastAgent && !!audio}
          />
        );
      })}

      {isThinking && <TypingIndicator />}

      <div ref={bottomRef} />

      {/* 🔊 Audio */}
      <AudioPlayer
        base64={audio}
        onStart={() => setSpeaking(true)}
        onEnd={() => setSpeaking(false)}
      />
    </div>
  );
}