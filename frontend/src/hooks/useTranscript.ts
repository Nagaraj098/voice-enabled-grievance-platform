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

  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  // ── Stop audio ───────────────────────────────────────────────────────────
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
      console.log("🔇 Audio stopped");
    }
    setIsAgentSpeaking(false);
  }, []);

  // ── Play base64 audio ────────────────────────────────────────────────────
  const playAudio = useCallback((base64Audio: string) => {
    try {
      // ✅ Stop current audio immediately before playing new one
      stopAudio();

      const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
      audioRef.current = audio;
      setIsAgentSpeaking(true);

      audio.play().catch((err) => {
        console.warn("Audio play failed:", err);
        setIsAgentSpeaking(false);
      });

      audio.onended = () => { 
        audioRef.current = null; 
        setIsAgentSpeaking(false);
      };

    } catch (err) {
      console.error("Audio playback error:", err);
      setIsAgentSpeaking(false);
    }
  }, [stopAudio]);

  // ── Mock mode ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!USE_MOCK) return;
    setMessages([
      { id: crypto.randomUUID(), role: "user",  text: "Hello", timestamp: Date.now() },
      { id: crypto.randomUUID(), role: "agent", text: "Hi, how can I help?", timestamp: Date.now() },
    ]);
  }, [USE_MOCK]);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (USE_MOCK) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WS connected");
      setIsConnected(true);
      setError(null);
      if (retryRef.current) clearTimeout(retryRef.current);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 WS message:", data.type);

        switch (data.type) {

          case "session_id":
            setSessionId(data.session_id);
            console.log("📝 Session ID:", data.session_id);
            break;

          case "user_transcript":
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

          case "agent_audio":
            if (data.audio) playAudio(data.audio);
            break;

          case "session_stopped":
            // ✅ Stop audio immediately when backend signals stop
            console.log("🛑 Session stopped — stopping audio");
            stopAudio();
            break;

          case "summary_ready":
            console.log("📋 Summary ready, redirecting...");
            stopAudio(); // ✅ Stop any playing audio before redirect
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
  }, [USE_MOCK, playAudio, stopAudio, router]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
      stopAudio(); // ✅ Stop audio on unmount
    };
  }, [connect, stopAudio]);

  return {
    messages,
    isThinking,
    isConnected: USE_MOCK ? true : isConnected,
    error,
    sessionId,
    stopAudio,  // ✅ exposed for VoiceLayout to call on end
    isAgentSpeaking,
  };
}

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
//   const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

//   const wsRef = useRef<WebSocket | null>(null);
//   const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const lastAgentMessageIdRef = useRef<string | null>(null);
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
//     setSpeakingMessageId(null);
//   }, []);

//   // ── Play base64 audio ────────────────────────────────────────────────────
//   const playAudio = useCallback((base64Audio: string) => {
//     try {
//       stopAudio();

//       const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
//       audioRef.current = audio;

//       // ✅ Highlight the last AI message while speaking
//       setSpeakingMessageId(lastAgentMessageIdRef.current);

//       audio.play().catch((err) => console.warn("Audio play failed:", err));

//       audio.onended = () => {
//         audioRef.current = null;
//         setSpeakingMessageId(null); // ✅ remove highlight when done
//       };

//     } catch (err) {
//       console.error("Audio playback error:", err);
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
//           case "agent_response": {
//             setIsThinking(false);
//             const newId = crypto.randomUUID();
//             lastAgentMessageIdRef.current = newId; // ✅ store latest AI message id
//             setMessages((prev) => [...prev, {
//               id: newId,
//               role: "agent",
//               text: data.text,
//               timestamp: Date.now(),
//             }]);
//             break;
//           }

//           case "agent_audio":
//             if (data.audio) playAudio(data.audio);
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
//     speakingMessageId, // ✅ exposed for ChatTranscript
//   };
// }