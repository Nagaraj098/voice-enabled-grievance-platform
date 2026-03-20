"use client";

import { useState } from "react";
import VoiceOrb from "./VoiceOrb";
import VoiceControls from "./VoiceControls";
import ChatTranscript from "@/components/chat/ChatTranscript";
import { useAudioLevel } from "@/hooks/useAudioLevel";

export default function VoiceLayout() {
  const [active, setActive] = useState(false);

  // ✅ CALL HOOK HERE (ONLY ONCE)
  const level = useAudioLevel(active);

  return (
    <div className="flex h-screen bg-gray-50">

      {/* LEFT */}
      <div className="w-1/5 border-r p-4">
        <h2 className="font-semibold mb-3">History</h2>
        <p className="text-sm text-gray-500">No chats yet</p>
      </div>

      {/* CENTER */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        {/* ✅ PASS LEVEL */}
        <VoiceOrb level={level} active={active} />

        <VoiceControls active={active} setActive={setActive} />
      </div>

      {/* RIGHT */}
      <div className="w-1/3 border-l p-4">
        <ChatTranscript />
      </div>
    </div>
  );
}