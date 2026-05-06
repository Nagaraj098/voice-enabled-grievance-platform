// "use client";

// import { useEffect, useRef } from "react";

// export default function AudioPlayer({
//   base64,
//   stopSignal,
//   onStart,
//   onEnd,
// }: {
//   base64?: string;
//   stopSignal?: number; // ✅ increment this from the call page whenever user_transcript arrives
//   onStart?: () => void;
//   onEnd?: () => void;
// }) {
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   // ✅ Stop immediately whenever stopSignal increments (user spoke)
//   useEffect(() => {
//     if (stopSignal === undefined) return;
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//       audioRef.current = null;
//       console.log("🛑 Audio stopped — user started speaking");
//       onEnd?.();
//     }
//   }, [stopSignal]);

//   // Play new audio whenever base64 changes
//   useEffect(() => {
//     if (!base64) return;

//     // Stop any previous audio before starting new one
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
//       onEnd?.();
//     };

//     audio.play().catch((err) => {
//       console.warn("⚠️ Audio play blocked:", err);
//       onEnd?.();
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

import { useEffect, useRef, useCallback } from "react";

/**
 * AudioPlayer — WebSocket streaming version
 *
 * Instead of playing base64 audio (old approach), this component:
 *   1. Listens for "audio_stream_start" JSON message → opens MediaSource
 *   2. Receives binary WebSocket frames (raw MP3 chunks) → appends to SourceBuffer
 *   3. Listens for "audio_stream_end" or "stop_audio" → ends/aborts stream
 *
 * Audio starts playing within ~200ms of TTS starting (first chunk),
 * instead of waiting for full sentence generation.
 *
 * Props:
 *   wsMessage    — latest JSON message object from WebSocket (replace base64 prop)
 *   binaryChunk  — latest binary chunk (ArrayBuffer) from WebSocket
 *   stopSignal   — increment to stop playback immediately (user speaking)
 *   onStart      — called when audio starts playing
 *   onEnd        — called when audio finishes
 */
export default function AudioPlayer({
  wsMessage,
  binaryChunk,
  stopSignal,
  onStart,
  onEnd,
}: {
  wsMessage?: { type: string } | null;
  binaryChunk?: ArrayBuffer | null;
  stopSignal?: number;
  onStart?: () => void;
  onEnd?: () => void;
}) {
  const audioRef         = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef   = useRef<MediaSource | null>(null);
  const sourceBufferRef  = useRef<SourceBuffer | null>(null);
  const chunkQueueRef    = useRef<ArrayBuffer[]>([]);
  const isAppendingRef   = useRef(false);
  const streamActiveRef  = useRef(false);
  const streamEndedRef   = useRef(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const stopPlayback = useCallback(() => {
    streamActiveRef.current = false;
    streamEndedRef.current  = false;
    chunkQueueRef.current   = [];
    isAppendingRef.current  = false;

    if (sourceBufferRef.current && mediaSourceRef.current) {
      try {
        if (mediaSourceRef.current.readyState === "open") {
          mediaSourceRef.current.endOfStream();
        }
      } catch (_) {}
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current     = null;
    }

    sourceBufferRef.current = null;
    mediaSourceRef.current  = null;

    console.log("🛑 Audio stopped");
    onEnd?.();
  }, [onEnd]);


  const appendNextChunk = useCallback(() => {
    const sb = sourceBufferRef.current;
    const ms = mediaSourceRef.current;

    if (!sb || !ms || sb.updating) return;
    if (chunkQueueRef.current.length === 0) {
      // Queue empty — check if stream is done
      if (streamEndedRef.current && ms.readyState === "open") {
        try {
          ms.endOfStream();
          console.log("✅ MediaSource stream ended cleanly");
        } catch (_) {}
        onEnd?.();
      }
      isAppendingRef.current = false;
      return;
    }

    const chunk = chunkQueueRef.current.shift()!;
    try {
      sb.appendBuffer(chunk);
    } catch (e) {
      console.warn("⚠️ appendBuffer error:", e);
      isAppendingRef.current = false;
    }
  }, [onEnd]);


  const openMediaSource = useCallback(() => {
    stopPlayback();   // Clean up any previous stream first

    streamActiveRef.current = true;
    streamEndedRef.current  = false;
    chunkQueueRef.current   = [];

    const ms    = new MediaSource();
    const audio = new Audio();
    audio.src   = URL.createObjectURL(ms);

    mediaSourceRef.current = ms;
    audioRef.current       = audio;

    ms.addEventListener("sourceopen", () => {
      try {
        // MP3 MIME type — works for edge-tts output
        const sb = ms.addSourceBuffer("audio/mpeg");
        sourceBufferRef.current = sb;

        sb.addEventListener("updateend", () => {
          appendNextChunk();

          // Start playing on first chunk
          if (audio.paused && audio.readyState >= 2) {
            audio.play()
              .then(() => {
                console.log("🔊 Streaming audio started");
                onStart?.();
              })
              .catch((e) => console.warn("⚠️ Play blocked:", e));
          }
        });

        sb.addEventListener("error", (e) => {
          console.error("❌ SourceBuffer error:", e);
        });

        console.log("✅ MediaSource opened — ready to receive chunks");
      } catch (e) {
        console.error("❌ Failed to add SourceBuffer:", e);
      }
    });

    audio.onended = () => {
      console.log("🔇 Audio stream finished playing");
      onEnd?.();
    };

    audio.onerror = (e) => {
      console.error("❌ Audio element error:", e);
      onEnd?.();
    };

  }, [stopPlayback, appendNextChunk, onStart, onEnd]);


  // ── React to JSON control messages ────────────────────────────────────────

  useEffect(() => {
    if (!wsMessage) return;

    if (wsMessage.type === "audio_stream_start") {
      console.log("📡 Stream starting — opening MediaSource");
      openMediaSource();
    }

    if (wsMessage.type === "audio_stream_end") {
      console.log("📡 Stream ended — finalizing playback");
      streamEndedRef.current = true;
      // Try to finalize if queue is already empty
      if (chunkQueueRef.current.length === 0 && !isAppendingRef.current) {
        const ms = mediaSourceRef.current;
        if (ms && ms.readyState === "open") {
          try { ms.endOfStream(); } catch (_) {}
          onEnd?.();
        }
      }
    }

    if (wsMessage.type === "stop_audio") {
      stopPlayback();
    }
  }, [wsMessage, openMediaSource, stopPlayback, onEnd]);


  // ── React to incoming binary chunks ───────────────────────────────────────

  useEffect(() => {
    if (!binaryChunk || !streamActiveRef.current) return;

    chunkQueueRef.current.push(binaryChunk);

    // Start draining queue if not already appending
    if (!isAppendingRef.current) {
      isAppendingRef.current = true;
      appendNextChunk();
    }
  }, [binaryChunk, appendNextChunk]);


  // ── Stop immediately when user starts speaking ─────────────────────────────

  useEffect(() => {
    if (stopSignal === undefined) return;
    console.log("🛑 Stop signal received — user is speaking");
    stopPlayback();
  }, [stopSignal, stopPlayback]);


  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  return null;
}