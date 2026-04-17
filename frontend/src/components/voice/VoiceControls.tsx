"use client";

export default function VoiceControls({
  active,
  setActive,
  connectStatus,
  isMuted,
  onToggleMute,
}: {
  active: boolean;
  setActive: () => void;
  connectStatus: 'idle' | 'connecting' | 'connected' | 'error';
  isMuted?: boolean;
  onToggleMute?: () => void;
}) {
  const isConnecting = connectStatus === 'connecting';
  const isConnected = connectStatus === 'connected';
  const isIdle = connectStatus === 'idle' || connectStatus === 'error';

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => {
          // Block all clicks while connecting
          if (isConnecting) return;
          setActive();
        }}
        disabled={isConnecting}
        className={`w-16 h-16 rounded-full text-white text-xl transition-all duration-200 ${
          isConnecting
            ? 'bg-zinc-700 cursor-not-allowed opacity-60'
            : isConnected
            ? 'bg-red-500 hover:bg-red-600 hover:scale-105'
            : 'bg-green-500 hover:bg-green-600 hover:scale-105'
        }`}
        title={
          isConnecting ? 'Connecting...' :
          isConnected ? 'End Call' :
          'Start Call'
        }
      >
        {isConnecting ? (
          <span className="text-sm">⏳</span>
        ) : isConnected ? (
          '⏹'
        ) : (
          '🎤'
        )}
      </button>

      {/* Status label */}
      <span className="text-xs text-zinc-500">
        {isConnecting ? 'Connecting...' :
         isConnected ? 'Tap to end call' :
         'Tap to start call'}
      </span>

      {/* Mute only shown when connected */}
      {isConnected && (
        <button 
          onClick={onToggleMute}
          className={`px-4 py-1 border rounded text-sm transition-colors ${
             isMuted ? 'text-red-500 dark:text-red-400 border-red-300 dark:border-red-800 bg-red-50 dark:bg-transparent' : 'text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-transparent'
          }`}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
      )}
    </div>
  );
}