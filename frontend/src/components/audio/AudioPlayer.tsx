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
  const hasInteracted = useRef(false);

  useEffect(() => {
    const unlock = () => {
      hasInteracted.current = true;
      window.removeEventListener("click", unlock);
    };

    window.addEventListener("click", unlock);

    return () => window.removeEventListener("click", unlock);
  }, []);

  useEffect(() => {
    if (!base64 || !hasInteracted.current) return;

    const audio = new Audio(`data:audio/wav;base64,${base64}`);

    audio.onplay = () => onStart?.();
    audio.onended = () => onEnd?.();

    audio.play().catch((err) => {
      console.log("Audio play blocked:", err);
    });

    return () => {
      audio.pause();
    };
  }, [base64]);

  return null;
}