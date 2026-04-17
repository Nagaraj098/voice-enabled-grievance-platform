"use client";
import { useEffect, useState } from "react";

export default function VoiceOrb({
  variant = 'user',
  level = 0,
  active,
  isSpeaking = false,
  connectStatus = 'idle',
  isMuted = false,
}: {
  variant?: 'user' | 'agent';
  level?: number;
  active: boolean;
  isSpeaking?: boolean;
  connectStatus?: 'idle' | 'connecting' | 'connected' | 'error';
  isMuted?: boolean;
}) {
  const isConnecting = connectStatus === 'connecting';
  
  // Agent pulse/scale level logic (simulate volume)
  const [agentLevel, setAgentLevel] = useState(0);
  const [aiBars, setAiBars] = useState<number[]>([3,3,3,3,3,3,3,3,3]);

  // For visual scale
  const effectiveLevel = variant === 'user' ? level : agentLevel;
  const scale = 1 + effectiveLevel * 0.6;

  useEffect(() => {
    if (variant !== 'agent') return;
    if (!isSpeaking) {
      setAgentLevel(0);
      setAiBars([3,3,3,3,3,3,3,3,3]);
      return;
    }
    
    const interval = setInterval(() => {
      // random number between 0 and 0.4 for scale effects
      setAgentLevel(Math.random() * 0.4);
      setAiBars(() => Array.from({length: 9}, () => Math.random() * 28 + 4));
    }, 120);
    return () => clearInterval(interval);
  }, [isSpeaking, variant]);

  const isActuallySpeaking = isSpeaking && !isMuted;

  return (
    <div className="relative flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center">

        {/* Pulse rings */}
        {active && !isConnecting && (
          <>
            <div
              className="absolute rounded-full border-2 transition-all duration-200"
              style={{
                width: `${220 + effectiveLevel * 60 + (isActuallySpeaking ? 30 : 0)}px`,
                height: `${220 + effectiveLevel * 60 + (isActuallySpeaking ? 30 : 0)}px`,
                borderColor: variant === 'agent' 
                  ? (isActuallySpeaking ? 'rgba(34,211,238,0.4)' : 'rgba(34,211,238,0.1)')
                  : (isActuallySpeaking ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.1)'),
                animation: 'ping 2.5s cubic-bezier(0,0,0.2,1) infinite',
              }}
            />
            <div
              className="absolute rounded-full border transition-all duration-200"
              style={{
                width: `${265 + effectiveLevel * 70 + (isActuallySpeaking ? 40 : 0)}px`,
                height: `${265 + effectiveLevel * 70 + (isActuallySpeaking ? 40 : 0)}px`,
                borderColor: variant === 'agent'
                  ? (isActuallySpeaking ? 'rgba(34,211,238,0.15)' : 'rgba(34,211,238,0.05)')
                  : (isActuallySpeaking ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)'),
                animation: 'ping 3s cubic-bezier(0,0,0.2,1) infinite 0.8s',
              }}
            />
          </>
        )}

        {/* Glow layer */}
        <div
          className="absolute w-72 h-72 rounded-full blur-2xl opacity-60 transition-all duration-150 pointer-events-none"
          style={{
            transform: `scale(${1 + effectiveLevel})`,
            background: isConnecting
              ? 'radial-gradient(circle, #6366f1, transparent)'
              : variant === 'agent'
              ? (isActuallySpeaking ? 'radial-gradient(circle, #22d3ee, transparent)' : 'radial-gradient(circle, #0891b2, transparent)')
              : (isActuallySpeaking ? 'radial-gradient(circle, #3b82f6, transparent)' : 'radial-gradient(circle, #1d4ed8, transparent)'),
          }}
        />

        {/* Main orb */}
        <div
          className={`w-40 h-40 md:w-56 md:h-56 rounded-full transition-all duration-150 flex items-center justify-center ${
            isConnecting ? 'animate-pulse' : ''
          }`}
          style={{
            transform: `scale(${isConnecting ? 1 : scale})`,
             background: isConnecting
                ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
                : variant === 'agent'
                ? (isActuallySpeaking ? 'linear-gradient(135deg, #0ea5e9, #22d3ee)' : 'linear-gradient(135deg, #0284c7, #0ea5e9)')
                : (isActuallySpeaking ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)'),
              boxShadow: isConnecting
                ? '0 0 60px rgba(99,102,241,0.5)'
                : variant === 'agent'
                ? (isActuallySpeaking ? '0 0 100px rgba(14,165,233,0.9), 0 0 60px rgba(34,211,238,0.6)' : '0 0 40px rgba(14,165,233,0.4)')
                : (isActuallySpeaking ? '0 0 80px rgba(59,130,246,0.7)' : (active ? '0 0 60px rgba(59,130,246,0.6)' : '0 0 20px rgba(59,130,246,0.3)')),
          }}
        >
          {/* Inner content */}
          {isConnecting ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : variant === 'agent' ? (
            <div className="flex items-end gap-0.5">
              {aiBars.slice(0, 7).map((h, i) => (
                <div
                  key={i}
                  className="bg-white rounded-full"
                  style={{
                    width: '3px',
                    height: `${Math.min(h, 28)}px`,
                    transition: 'height 0.12s ease',
                    opacity: isActuallySpeaking ? 0.9 : 0.4
                  }}
                />
              ))}
            </div>
          ) : variant === 'user' ? (
            <svg className={`w-10 h-10 ${isActuallySpeaking ? 'text-white animate-pulse' : 'text-white/60'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ) : null}
        </div>
      </div>

      {/* Status label */}
      <div className={`text-xs font-medium transition-all duration-300 ${
        isConnecting ? 'text-violet-500 dark:text-violet-400' :
        isMuted && variant === 'user' ? 'text-red-500 dark:text-red-400' :
        isActuallySpeaking ? (variant === 'agent' ? 'text-cyan-600 dark:text-cyan-400' : 'text-blue-600 dark:text-blue-400') :
        active ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-500 dark:text-zinc-600'
      }`}>
        {isConnecting ? '⟳ Connecting...' :
         isMuted && variant === 'user' ? 'Muted' :
         isActuallySpeaking ? (variant === 'agent' ? '◉ AI Speaking' : '◉ Listening to you...') :
         active ? (variant === 'agent' ? '○ Agent idle' : '○ Mic on') : (variant === 'agent' ? 'AI Agent' : 'You')}
      </div>

    </div>
  );
}