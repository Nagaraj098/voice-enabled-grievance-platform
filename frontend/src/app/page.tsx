"use client";

import { useState } from "react";
import CallControls from "@/components/call/CallControls";
import ChatTranscript from "@/components/chat/ChatTranscript";
import FullTranscript from "@/components/chat/FullTranscript";

export default function Home() {
  const [tab, setTab] = useState<"live" | "full">("live");

  return (
    <main className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 p-6 min-h-screen">
      
      {/* LEFT SIDE (Controls) */}
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold">Voice AI Platform</h1>

        <CallControls />

        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setTab("live")}
            className={`px-4 py-1 rounded ${
              tab === "live"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Live Chat
          </button>

          <button
            onClick={() => setTab("full")}
            className={`px-4 py-1 rounded ${
              tab === "full"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Full Transcript
          </button>
        </div>
      </div>

      {/* RIGHT SIDE (Chat Area) */}
      <div>
        {tab === "live" && <ChatTranscript />}
        {tab === "full" && <FullTranscript />}
      </div>
    </main>
  );
}