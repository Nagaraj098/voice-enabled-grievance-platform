"use client";

import { useState } from "react";
import { useRoom } from "@/hooks/useRoom";

export default function CallControls() {
  const { connectRoom, disconnectRoom } = useRoom();

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    try {
      setError("");
      await connectRoom();
      setConnected(true);
    } catch (err) {
      setError("Failed to connect. Check backend or LiveKit.");
    }
  };

  const handleEnd = async () => {
    await disconnectRoom();
    setConnected(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Button */}
      <button
        onClick={connected ? handleEnd : handleStart}
        className={`px-6 py-2 rounded text-white ${
          connected ? "bg-red-500" : "bg-green-500"
        }`}
      >
        {connected ? "End Call" : "Start Call"}
      </button>

      {/* Mic Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            connected ? "bg-green-400 animate-pulse" : "bg-gray-400"
          }`}
        />
        <span>{connected ? "Mic Active" : "Mic Off"}</span>
      </div>

      {/* Error */}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}