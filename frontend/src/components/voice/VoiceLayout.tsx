// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import VoiceOrb from "./VoiceOrb";
// import VoiceControls from "./VoiceControls";
// import ChatTranscript from "@/components/chat/ChatTranscript";
// import { useAudioLevel } from "@/hooks/useAudioLevel";
// import CallTimer from "@/components/call/CallTimer";
// import { useSession } from "@/hooks/useSession";
// import EndCallModal from "@/components/call/EndCallModal";
// import { connectToLiveKit } from "@/lib/livekit";
// import { Room } from "livekit-client";

// export default function VoiceLayout() {
//   const [mounted, setMounted]     = useState(false);
//   const [active, setActive]       = useState(false);
//   const [speaking, setSpeaking]   = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [room, setRoom]           = useState<Room | null>(null);
//   const [livekitError, setLivekitError] = useState<string | null>(null);

//   const router = useRouter();

//   // ✅ Hooks always called unconditionally — no try/catch wrapper
//   const { level, error: micError } = useAudioLevel(active);
//   const { seconds, sessionId, startSession, endSession } = useSession();

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // ── Start / Stop LiveKit stream ────────────────────────────────────────
//   const handleToggle = async () => {
//     const newState = !active;

//     if (newState) {
//       // START
//       try {
//         setLivekitError(null);

//         const res = await fetch(
//           `http://localhost:8000/token?participant_name=user-${Date.now()}`
//         );

//         if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);

//         const { token } = await res.json();
//         const newRoom = await connectToLiveKit(token);

//         setRoom(newRoom);
//         setActive(true);
//         startSession?.();

//       } catch (err: any) {
//         console.error("LiveKit connect error:", err);
//         setLivekitError(err.message || "Failed to start call");
//       }

//     } else {
//       // STOP — show confirmation modal
//       setShowModal(true);
//     }
//   };

//   // const handleConfirmEnd = async () => {
//   //   setShowModal(false);

//   //   // ✅ Clean disconnect
//   //   if (room) {
//   //     await disconnectFromLiveKit(room);
//   //     setRoom(null);
//   //   }

//   //   setActive(false);
//   //   endSession?.();

//   //   if (sessionId) {
//   //     router.push(`/summary?sessionId=${sessionId}`);
//   //   } else {
//   //     router.push("/");
//   //   }
//   // };
//   const handleConfirmEnd = async () => {
//     setShowModal(false);

//     // ✅ Direct disconnect
//     if (room) {
//       await room.disconnect();
//       setRoom(null);
//     }

//     setActive(false);
//     endSession?.();

//     if (sessionId) {
//       router.push(`/summary?sessionId=${sessionId}`);
//     } else {
//       router.push("/");
//     }
//   };

//   const handleCancelEnd = () => {
//     setShowModal(false);
//     // active stays true — call continues
//   };

//   // ── Render ─────────────────────────────────────────────────────────────
//   if (!mounted) {
//     return (
//       <div className="flex h-screen bg-black text-white items-center justify-center">
//         <LoadingSkeleton />
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-black text-white">

//       {/* LEFT — History */}
//       <div className="w-1/5 border-r border-zinc-800 p-4 hidden md:block">
//         <h2 className="font-semibold mb-3">History</h2>
//         <p className="text-sm text-gray-500">No chats yet</p>
//       </div>

//       {/* CENTER — Orb + Controls */}
//       <div className="flex-1 flex flex-col items-center justify-center gap-6 relative">

//         {/* Mic error */}
//         {micError && (
//           <div className="absolute top-8 w-3/4 max-w-md bg-red-900/50 border border-red-800 text-red-100 text-sm p-3 rounded-md text-center z-10 shadow-lg">
//             ⚠️ {micError}
//           </div>
//         )}

//         {/* LiveKit error */}
//         {livekitError && (
//           <div className="absolute top-8 w-3/4 max-w-md bg-orange-900/50 border border-orange-800 text-orange-100 text-sm p-3 rounded-md text-center z-10 shadow-lg">
//             ⚠️ {livekitError}
//           </div>
//         )}

//         <VoiceOrb level={level} active={active} speaking={speaking} />

//         {active && <CallTimer seconds={seconds} />}

//         <VoiceControls active={active} setActive={handleToggle} />

//       </div>

//       {/* RIGHT — Transcript */}
//       <div className="w-full md:w-1/3 border-l border-zinc-800 p-4 flex flex-col bg-zinc-900">
//         <ChatTranscript setSpeaking={setSpeaking} />
//       </div>

//       {/* End Call Modal */}
//       {showModal && (
//         <EndCallModal
//           onConfirm={handleConfirmEnd}
//           onCancel={handleCancelEnd}
//         />
//       )}

//     </div>
//   );
// }

// // ── Loading skeleton ───────────────────────────────────────────────────────

// function LoadingSkeleton() {
//   return (
//     <div className="flex w-full h-full">
//       <div className="w-1/5 border-r border-zinc-800 p-4 hidden md:block animate-pulse">
//         <div className="h-6 w-24 bg-zinc-800 rounded mb-4"></div>
//         <div className="h-4 w-16 bg-zinc-800 rounded"></div>
//       </div>
//       <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-pulse">
//         <div className="w-32 h-32 rounded-full bg-zinc-800"></div>
//         <div className="w-48 h-12 rounded-full bg-zinc-800 mt-8"></div>
//       </div>
//       <div className="w-full md:w-1/3 border-l border-zinc-800 p-4 flex flex-col bg-zinc-900 animate-pulse">
//         <div className="flex-1 flex flex-col justify-end gap-4 pb-4">
//           <div className="self-start w-3/4 h-16 bg-zinc-800 rounded-lg"></div>
//           <div className="self-end w-3/4 h-16 bg-zinc-700 rounded-lg"></div>
//         </div>
//       </div>
//     </div>
//   );
// }


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
import { connectToLiveKit } from "@/lib/livekit";
import { useTranscript } from "@/hooks/useTranscript";
import { Room } from "livekit-client";

export default function VoiceLayout() {
  const [mounted, setMounted]           = useState(false);
  const [active, setActive]             = useState(false);
  const [speaking, setSpeaking]         = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [room, setRoom]                 = useState<Room | null>(null);
  const [livekitError, setLivekitError] = useState<string | null>(null);

  const [connectStatus, setConnectStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'error'
  >('idle');

  const [connectMsg, setConnectMsg] = useState(0);
  const connectMessages = [
    "Connecting with Agent...",
    "Setting up your session...",
    "Initializing voice pipeline...",
    "Almost ready...",
  ];

  const router = useRouter();

  const { level, error: micError }              = useAudioLevel(active);
  const { seconds, sessionId, startSession, endSession } = useSession();
  const { sessionId: wsSessionId }              = useTranscript(); // ✅ get session ID from WS

  useEffect(() => {
    setMounted(true);
  }, []);

<<<<<<< HEAD
  // ── Start streaming ──────────────────────────────────────────────────
=======
  useEffect(() => {
    if (connectStatus !== 'connecting') return;
    const interval = setInterval(() => {
      setConnectMsg(prev => (prev + 1) % connectMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [connectStatus]);

  // ── Start / Stop LiveKit stream ────────────────────────────────────────
>>>>>>> acc15cf9f43c07225830c61f62d33d9fd7a681a0
  const handleToggle = async () => {
    const newState = !active;

    if (newState) {
<<<<<<< HEAD
=======
      // Only allow starting if idle
      if (connectStatus === 'connecting') return;

>>>>>>> acc15cf9f43c07225830c61f62d33d9fd7a681a0
      try {
        setConnectStatus('connecting');
        setLivekitError(null);

        const res = await fetch(
          `http://localhost:8000/token?participant_name=user-${Date.now()}`
        );
        if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);

        const { token } = await res.json();
        const newRoom = await connectToLiveKit(token);

        setRoom(newRoom);
        setActive(true);
        setConnectStatus('connected');
        startSession?.();

      } catch (err: any) {
        console.error("LiveKit connect error:", err);
        setLivekitError(err.message || "Failed to start call");
        setConnectStatus('error');
      }

    } else {
<<<<<<< HEAD
=======
      // Only show end call modal if already connected
      if (connectStatus !== 'connected') return;
>>>>>>> acc15cf9f43c07225830c61f62d33d9fd7a681a0
      setShowModal(true);
    }
  };

  // ── End call ─────────────────────────────────────────────────────────
  const handleConfirmEnd = async () => {
    setShowModal(false);
<<<<<<< HEAD

    // ✅ Stop backend STT/TTS processing
    try {
      await fetch("http://localhost:8000/session/stop", { method: "POST" });
    } catch (err) {
      console.error("Failed to stop session:", err);
    }

    // ✅ Disconnect LiveKit — stops mic and audio stream to agent
=======
>>>>>>> acc15cf9f43c07225830c61f62d33d9fd7a681a0
    if (room) {
      await room.disconnect();
      setRoom(null);
    }
    setActive(false);
    setConnectStatus('idle');
    endSession?.();
<<<<<<< HEAD

    // ✅ Use wsSessionId from WebSocket (more reliable than useSession)
    const finalSessionId = wsSessionId || sessionId;
    if (finalSessionId) {
      router.push(`/summary?sessionId=${finalSessionId}`);
=======
    if (sessionId) {
      router.push(`/summary?sessionId=${sessionId}`);
>>>>>>> acc15cf9f43c07225830c61f62d33d9fd7a681a0
    } else {
      router.push("/");
    }
  };

  const handleCancelEnd = () => {
    setShowModal(false);
  };

  // ── Render ────────────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white">

      {/* LEFT — History */}
      <div className="w-1/5 border-r border-zinc-800 p-4 hidden md:block">
        <h2 className="font-semibold mb-3">History</h2>
        <p className="text-sm text-gray-500">No chats yet</p>
      </div>

      {/* CENTER — Orb + Controls */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 relative">

        {/* Mic error */}
        {micError && (
          <div className="absolute top-8 w-3/4 max-w-md bg-red-900/50 border border-red-800 text-red-100 text-sm p-3 rounded-md text-center z-10 shadow-lg">
            ⚠️ {micError}
          </div>
        )}

        {/* LiveKit error */}
        {livekitError && (
          <div className="absolute top-8 w-3/4 max-w-md bg-orange-900/50 border border-orange-800 text-orange-100 text-sm p-3 rounded-md text-center z-10 shadow-lg">
            ⚠️ {livekitError}
          </div>
        )}

        {connectStatus === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-sm rounded-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-zinc-200 text-sm font-medium animate-pulse">
                  {connectMessages[connectMsg]}
                </p>
                <p className="text-zinc-500 text-xs">
                  Please wait while we set up your session
                </p>
              </div>
            </div>
          </div>
        )}

        <VoiceOrb level={level} active={active} speaking={speaking} connectStatus={connectStatus} />

        {active && <CallTimer seconds={seconds} />}

        <VoiceControls active={active} setActive={handleToggle} connectStatus={connectStatus} />

      </div>

      {/* RIGHT — Transcript */}
      <div className="w-full md:w-1/3 border-l border-zinc-800 p-4 flex flex-col bg-zinc-900">
        <ChatTranscript setSpeaking={setSpeaking} />
      </div>

      {/* End Call Modal */}
      {showModal && (
        <EndCallModal
          onConfirm={handleConfirmEnd}
          onCancel={handleCancelEnd}
        />
      )}

    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────

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