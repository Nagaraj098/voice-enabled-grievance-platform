"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VoiceOrb from "./VoiceOrb";
import VoiceControls from "./VoiceControls";
import ChatTranscript from "@/components/chat/ChatTranscript";
import { useAudioLevel } from "@/hooks/useAudioLevel";
import CallTimer from "@/components/call/CallTimer";
import { useSession } from "@/hooks/useSession";
import EndCallModal from "@/components/call/EndCallModal";

export default function VoiceLayout() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();

  let audioRefData;
  try {
    audioRefData = useAudioLevel(active);
  } catch (err) {
    audioRefData = null;
  }

  let sessionData;
  try {
    sessionData = useSession();
  } catch (err) {
    sessionData = null;
  }

  const { level = 0, error: micError = null } = audioRefData || {};

  const {
    seconds = 0,
    sessionId = null,
    startSession = () => console.warn("startSession not available"),
    endSession = () => console.warn("endSession not available"),
  } = sessionData || {};

  const handleToggle = () => {
    const newState = !active;
    setActive(newState);

    if (newState) {
      if (startSession) startSession();
    } else {
      setShowModal(true); // 🔥 open modal instead
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* LEFT */}
      <div className="w-1/5 border-r border-zinc-800 p-4 hidden md:block">
        <h2 className="font-semibold mb-3">History</h2>
        <p className="text-sm text-gray-500">No chats yet</p>
      </div>

      {/* CENTER */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 relative">
        {micError && (
          <div className="absolute top-8 w-3/4 max-w-md bg-red-900/50 border border-red-800 text-red-100 text-sm p-3 rounded-md text-center z-10 shadow-lg">
            ⚠️ {micError}
          </div>
        )}

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
            if (endSession) endSession();
            if (sessionId) {
              router.push(`/summary?sessionId=${sessionId}`);
            } else {
              router.push("/");
            }
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

function LoadingSkeleton() {
  return (
    <div className="flex w-full h-full">
      <div className="w-1/5 border-r border-zinc-800 p-4 hidden md:block animate-pulse">
        <div className="h-6 w-24 bg-zinc-800 rounded mb-4"></div>
        <div className="h-4 w-16 bg-zinc-800 rounded"></div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-pulse">
        <div className="w-32 h-32 rounded-full bg-zinc-800"></div>
        <div className="w-48 h-12 rounded-full bg-zinc-800 mt-8"></div>
      </div>
      <div className="w-full md:w-1/3 border-l border-zinc-800 p-4 flex flex-col bg-zinc-900 animate-pulse">
        <div className="flex-1 flex flex-col justify-end gap-4 pb-4">
          <div className="self-start w-3/4 h-16 bg-zinc-800 rounded-lg"></div>
          <div className="self-end w-3/4 h-16 bg-zinc-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}