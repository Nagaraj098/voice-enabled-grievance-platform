// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { Message } from "@/types/chat";

// const WS_URL = "ws://localhost:8000/ws/transcript";
// const RETRY_DELAY_MS = 3000;

// export function useTranscript() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isThinking, setIsThinking] = useState(false);
//   const [isConnected, setIsConnected] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [sessionId, setSessionId] = useState<string | null>(null);
//   const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

//   const wsRef = useRef<WebSocket | null>(null);
//   const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const router = useRouter();

//   const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

//   // ── Stop audio ───────────────────────────────────────────────────────────
//   const stopAudio = useCallback(() => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.src = "";
//       audioRef.current = null;
//       console.log("🔇 Audio stopped");
//     }
//     setIsAgentSpeaking(false);
//   }, []);

//   // ── Play base64 audio ────────────────────────────────────────────────────
//   const playAudio = useCallback((base64Audio: string) => {
//     try {
//       stopAudio();

//       const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
//       audioRef.current = audio;
//       setIsAgentSpeaking(true);

//       audio.play().catch((err) => {
//         console.warn("Audio play failed:", err);
//         setIsAgentSpeaking(false);
//       });

//       audio.onended = () => {
//         audioRef.current = null;
//         setIsAgentSpeaking(false);
//       };

//     } catch (err) {
//       console.error("Audio playback error:", err);
//       setIsAgentSpeaking(false);
//     }
//   }, [stopAudio]);

//   // ── Mock mode ────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!USE_MOCK) return;
//     setMessages([
//       { id: crypto.randomUUID(), role: "user",  text: "Hello", timestamp: Date.now() },
//       { id: crypto.randomUUID(), role: "agent", text: "Hi, how can I help?", timestamp: Date.now() },
//     ]);
//   }, [USE_MOCK]);

//   // ── WebSocket ─────────────────────────────────────────────────────────────
//   const connect = useCallback(() => {
//     if (USE_MOCK) return;
//     if (wsRef.current?.readyState === WebSocket.OPEN) return;

//     const ws = new WebSocket(WS_URL);
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("✅ WS connected");
//       setIsConnected(true);
//       setError(null);
//       if (retryRef.current) clearTimeout(retryRef.current);
//     };

//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log("📨 WS message:", data.type);

//         switch (data.type) {

//           case "session_id":
//             setSessionId(data.session_id);
//             console.log("📝 Session ID:", data.session_id);
//             break;

//           case "user_transcript":
//             // ✅ Stop AI audio the moment user speech is detected
//             stopAudio();
//             setMessages((prev) => [...prev, {
//               id: crypto.randomUUID(),
//               role: "user",
//               text: data.text,
//               timestamp: Date.now(),
//             }]);
//             break;

//           case "agent_thinking":
//             setIsThinking(true);
//             break;

//           case "ai_response":
//           case "agent_response":
//             setIsThinking(false);
//             setMessages((prev) => [...prev, {
//               id: crypto.randomUUID(),
//               role: "agent",
//               text: data.text,
//               timestamp: Date.now(),
//             }]);
//             break;

//           case "agent_audio":
//             if (data.audio) playAudio(data.audio);
//             break;

//           // ✅ THIS WAS MISSING — backend sends this on every new STT and on disconnect
//           case "stop_audio":
//             console.log("🛑 stop_audio received — stopping playback");
//             stopAudio();
//             break;

//           case "session_stopped":
//             console.log("🛑 Session stopped — stopping audio");
//             stopAudio();
//             break;

//           case "summary_ready":
//             console.log("📋 Summary ready, redirecting...");
//             stopAudio();
//             router.push(`/summary?sessionId=${data.session_id}`);
//             break;

//           default:
//             console.log("Unknown WS event:", data.type);
//         }
//       } catch (err) {
//         console.error("Invalid WS message:", err);
//       }
//     };

//     ws.onerror = () => {
//       setError("WebSocket connection failed — retrying...");
//       setIsConnected(false);
//     };

//     ws.onclose = () => {
//       console.log("WS closed — retrying in 3s");
//       setIsConnected(false);
//       wsRef.current = null;
//       retryRef.current = setTimeout(connect, RETRY_DELAY_MS);
//     };
//   }, [USE_MOCK, playAudio, stopAudio, router]);

//   useEffect(() => {
//     connect();
//     return () => {
//       wsRef.current?.close();
//       if (retryRef.current) clearTimeout(retryRef.current);
//       stopAudio();
//     };
//   }, [connect, stopAudio]);

//   return {
//     messages,
//     isThinking,
//     isConnected: USE_MOCK ? true : isConnected,
//     error,
//     sessionId,
//     stopAudio,
//     isAgentSpeaking,
//   };
// }

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Message } from "@/types/chat";

const WS_URL = "ws://localhost:8000/ws/transcript";
const RETRY_DELAY_MS = 3000;

export function useTranscript() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  const wsRef            = useRef<WebSocket | null>(null);
  const retryRef         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router           = useRouter();

  // MediaSource streaming refs
  const audioRef         = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef   = useRef<MediaSource | null>(null);
  const sourceBufferRef  = useRef<SourceBuffer | null>(null);
  const chunkQueueRef    = useRef<ArrayBuffer[]>([]);
  const isAppendingRef   = useRef(false);
  const streamActiveRef  = useRef(false);
  const streamEndedRef   = useRef(false);

  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  const stopAudio = useCallback(() => {
    streamActiveRef.current = false;
    streamEndedRef.current  = false;
    chunkQueueRef.current   = [];
    isAppendingRef.current  = false;

    if (mediaSourceRef.current) {
      try {
        if (mediaSourceRef.current.readyState === "open") {
          mediaSourceRef.current.endOfStream();
        }
      } catch (_) {}
      mediaSourceRef.current = null;
    }

    sourceBufferRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current     = null;
    }

    setIsAgentSpeaking(false);
    console.log("🔇 Audio stopped");
  }, []);

  const appendNextChunk = useCallback(() => {
    const sb = sourceBufferRef.current;
    const ms = mediaSourceRef.current;

    if (!sb || !ms || sb.updating) return;

    if (chunkQueueRef.current.length === 0) {
      if (streamEndedRef.current && ms.readyState === "open") {
        try { ms.endOfStream(); } catch (_) {}
        setIsAgentSpeaking(false);
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
  }, []);

  const openMediaSource = useCallback(() => {
    stopAudio();

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
        const sb = ms.addSourceBuffer("audio/mpeg");
        sourceBufferRef.current = sb;

        sb.addEventListener("updateend", () => {
          appendNextChunk();
          if (audio.paused && audio.readyState >= 2) {
            audio.play()
              .then(() => {
                console.log("🔊 Streaming audio started");
                setIsAgentSpeaking(true);
              })
              .catch((e) => console.warn("⚠️ Play blocked:", e));
          }
        });

        sb.addEventListener("error", (e) => {
          console.error("❌ SourceBuffer error:", e);
        });

        console.log("✅ MediaSource ready — waiting for chunks");
      } catch (e) {
        console.error("❌ addSourceBuffer failed:", e);
      }
    });

    audio.onended = () => {
      console.log("🔇 Stream finished playing");
      setIsAgentSpeaking(false);
    };

    audio.onerror = () => {
      console.error("❌ Audio element error");
      setIsAgentSpeaking(false);
    };
  }, [stopAudio, appendNextChunk]);

  const receiveChunk = useCallback((chunk: ArrayBuffer) => {
    if (!streamActiveRef.current) return;
    chunkQueueRef.current.push(chunk);
    if (!isAppendingRef.current) {
      isAppendingRef.current = true;
      appendNextChunk();
    }
  }, [appendNextChunk]);

  useEffect(() => {
    if (!USE_MOCK) return;
    setMessages([
      { id: crypto.randomUUID(), role: "user",  text: "Hello", timestamp: Date.now() },
      { id: crypto.randomUUID(), role: "agent", text: "Hi, how can I help?", timestamp: Date.now() },
    ]);
  }, [USE_MOCK]);

  const connect = useCallback(() => {
    if (USE_MOCK) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WS connected");
      setIsConnected(true);
      setError(null);
      if (retryRef.current) clearTimeout(retryRef.current);
    };

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        receiveChunk(event.data);
        return;
      }

      try {
        const data = JSON.parse(event.data);
        console.log("📨 WS message:", data.type);

        switch (data.type) {
          case "session_id":
            setSessionId(data.session_id);
            break;

          case "user_transcript":
            stopAudio();
            setMessages((prev) => [...prev, {
              id: crypto.randomUUID(),
              role: "user",
              text: data.text,
              timestamp: Date.now(),
            }]);
            break;

          case "agent_thinking":
            setIsThinking(true);
            break;

          case "ai_response":
          case "agent_response":
            setIsThinking(false);
            setMessages((prev) => [...prev, {
              id: crypto.randomUUID(),
              role: "agent",
              text: data.text,
              timestamp: Date.now(),
            }]);
            break;

          case "audio_stream_start":
            console.log("📡 Audio stream starting");
            openMediaSource();
            break;

          case "audio_stream_end":
            console.log("📡 Audio stream ended");
            streamEndedRef.current = true;
            if (chunkQueueRef.current.length === 0 && !isAppendingRef.current) {
              const ms = mediaSourceRef.current;
              if (ms && ms.readyState === "open") {
                try { ms.endOfStream(); } catch (_) {}
                setIsAgentSpeaking(false);
              }
            }
            break;

          case "stop_audio":
            stopAudio();
            break;

          case "session_stopped":
            stopAudio();
            break;

          case "summary_ready":
            stopAudio();
            router.push(`/summary?sessionId=${data.session_id}`);
            break;

          default:
            console.log("Unknown WS event:", data.type);
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    ws.onerror = () => {
      setError("WebSocket connection failed — retrying...");
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WS closed — retrying in 3s");
      setIsConnected(false);
      wsRef.current = null;
      retryRef.current = setTimeout(connect, RETRY_DELAY_MS);
    };
  }, [USE_MOCK, stopAudio, openMediaSource, receiveChunk, router]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
      stopAudio();
    };
  }, [connect, stopAudio]);

  return {
    messages,
    isThinking,
    isConnected: USE_MOCK ? true : isConnected,
    error,
    sessionId,
    stopAudio,
    isAgentSpeaking,
  };
}