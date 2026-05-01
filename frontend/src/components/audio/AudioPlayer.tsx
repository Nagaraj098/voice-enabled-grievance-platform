// "use client";

// import { useEffect, useRef } from "react";

// export default function AudioPlayer({
//   base64,
//   onStart,
//   onEnd,
// }: {
//   base64?: string;
//   onStart?: () => void;
//   onEnd?: () => void;
// }) {
//   const hasInteracted = useRef(true); // ✅ Always allow — user already clicked Start Call
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   useEffect(() => {
//     if (!base64) return;

//     // ✅ Stop any previous audio
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current = null;
//     }

//     const audio = new Audio(`data:audio/wav;base64,${base64}`);
//     audioRef.current = audio;

//     audio.onplay = () => {
//       console.log("🔊 AI audio started playing");
//       onStart?.();
//     };

//     audio.onended = () => {
//       console.log("🔇 AI audio finished");
//       onEnd?.();
//     };

//     audio.onerror = (err) => {
//       console.error("❌ Audio error:", err);
//       onEnd?.(); // ✅ Reset speaking state even on error
//     };

//     audio.play().catch((err) => {
//       console.warn("⚠️ Audio play blocked:", err);
//       onEnd?.(); // ✅ Reset speaking state if play is blocked
//     });

//     return () => {
//       audio.pause();
//       audio.onplay = null;
//       audio.onended = null;
//       audio.onerror = null;
//     };
//   }, [base64]);

//   return null;
// }

"use client";

import { useEffect, useRef } from "react";

export default function AudioPlayer({
  base64,
  stopSignal,
  onStart,
  onEnd,
}: {
  base64?: string;
  stopSignal?: number; // ✅ increment this from the call page whenever user_transcript arrives
  onStart?: () => void;
  onEnd?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✅ Stop immediately whenever stopSignal increments (user spoke)
  useEffect(() => {
    if (stopSignal === undefined) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      console.log("🛑 Audio stopped — user started speaking");
      onEnd?.();
    }
  }, [stopSignal]);

  // Play new audio whenever base64 changes
  useEffect(() => {
    if (!base64) return;

    // Stop any previous audio before starting new one
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
      onEnd?.();
    };

    audio.play().catch((err) => {
      console.warn("⚠️ Audio play blocked:", err);
      onEnd?.();
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