"use client";

import React, { useState } from "react";
import { connectToLiveKit } from "@/lib/livekit";

export default function MicRecorder() {
  const [room, setRoom] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startStreaming = async () => {
    try {
      console.log("Starting streaming...");

      // 🔴 IMPORTANT: Paste fresh token here
      const token = "eyJhbGciOiJIUzI1NiJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6InZvaWNlLXJvb20ifSwiaXNzIjoiZGV2a2V5IiwiZXhwIjoxNzczNzYyNzM4LCJuYmYiOjAsInN1YiI6InVzZXIxIn0.ox6TdhDGE7R_2N0a9xGblnZxm_i7u3Z1W1K1dqflvo0";

      const newRoom = await connectToLiveKit(token);

      setRoom(newRoom);
      setIsStreaming(true);

    } catch (err) {
      console.error("LiveKit Error:", err);
      alert("Failed to start streaming");
    }
  };

  const stopStreaming = async () => {
    try {
      if (room) {
        await room.disconnect();
        setRoom(null);
        setIsStreaming(false);
        console.log("Disconnected");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">

      {!isStreaming ? (
        <button
          onClick={startStreaming}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          🎤 Start Live Streaming
        </button>
      ) : (
        <button
          onClick={stopStreaming}
          className="px-6 py-3 bg-red-600 text-white rounded-lg"
        >
          ⏹ Stop Streaming
        </button>
      )}

      {isStreaming && (
        <p className="text-green-600">
          🎙️ Streaming via WebRTC (LiveKit)
        </p>
      )}
    </div>
  );
}
