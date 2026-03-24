"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VoiceOrb from "./VoiceOrb";
import VoiceControls from "./VoiceControls";
import ChatTranscript from "@/components/chat/ChatTranscript";
import { useAudioLevel } from "@/hooks/useAudioLevel";
import CallTimer from "@/components/call/CallTimer";
import { useSession } from "@/hooks/useSession";
import EndCallModal from "@/components/call/EndCallModal";

export default function VoiceLayout() {
  const [active, setActive] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const level = useAudioLevel(active);
  const router = useRouter();

  const { seconds, sessionId, startSession, endSession } = useSession();

  const handleToggle = () => {
    const newState = !active;
    setActive(newState);

    if (newState) {
      startSession();
    } else {
      setShowModal(true); // 🔥 open modal instead
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* LEFT */}
      <div className="w-1/5 border-r border-zinc-800 p-4 hidden md:block">
        <h2 className="font-semibold mb-3">History</h2>
        <p className="text-sm text-gray-500">No chats yet</p>
      </div>

      {/* CENTER */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <VoiceOrb level={level} active={active} speaking={speaking} />

        {active && <CallTimer seconds={seconds} />}

        <VoiceControls active={active} setActive={handleToggle} />
      </div>

      {/* RIGHT */}
      <div className="w-full md:w-1/3 border-l border-zinc-800 p-4 flex flex-col bg-zinc-900">
        <ChatTranscript setSpeaking={setSpeaking} />
      </div>

      {/* 🔥 MODAL */}
      {showModal && (
        <EndCallModal
          onConfirm={() => {
            setShowModal(false);
            endSession();
            router.push(`/summary?sessionId=${sessionId}`);
          }}
          onCancel={() => {
            setShowModal(false);
            setActive(true);
          }}
        />
      )}
    </div>
  );
}