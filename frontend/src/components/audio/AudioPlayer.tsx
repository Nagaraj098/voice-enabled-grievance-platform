"use client";

import { useEffect, useRef } from "react";

export default function AudioPlayer({
  base64,
  onStart,
  onEnd,
}: {
  base64?: string;
  onStart?: () => void;
  onEnd?: () => void;
}) {
  const hasInteracted = useRef(true); // ✅ Always allow — user already clicked Start Call
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!base64) return;

    // ✅ Stop any previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(`data:audio/wav;base64,${base64}`);
    audioRef.current = audio;

    audio.onplay = () => {
      console.log("🔊 AI audio started playing");
      onStart?.();
    };

    audio.onended = () => {
      console.log("🔇 AI audio finished");
      onEnd?.();
    };

    audio.onerror = (err) => {
      console.error("❌ Audio error:", err);
      onEnd?.(); // ✅ Reset speaking state even on error
    };

    audio.play().catch((err) => {
      console.warn("⚠️ Audio play blocked:", err);
      onEnd?.(); // ✅ Reset speaking state if play is blocked
    });

    return () => {
      audio.pause();
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;
    };
  }, [base64]);

  return null;
}