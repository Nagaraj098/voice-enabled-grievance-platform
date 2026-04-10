"use client";
import { useEffect, useState } from "react";

export default function VoiceOrb({
  level,
  active,
  speaking = false,
  connectStatus = 'idle',
  userSpeaking = false,
}: {
  level: number;
  active: boolean;
  speaking?: boolean;
  connectStatus?: 'idle' | 'connecting' | 'connected' | 'error';
  userSpeaking?: boolean;
}) {
  const scale = 1 + level * 0.6;
  const isConnecting = connectStatus === 'connecting';

  const [aiBars, setAiBars] = useState<number[]>([3,3,3,3,3,3,3,3,3]);
  const [userBars, setUserBars] = useState<number[]>([3,3,3,3,3,3,3,3,3]);

  useEffect(() => {
    if (!speaking) { setAiBars([3,3,3,3,3,3,3,3,3]); return; }
    const interval = setInterval(() => {
      setAiBars(() => Array.from({length: 9}, () => Math.random() * 28 + 4));
    }, 120);
    return () => clearInterval(interval);
  }, [speaking]);

  useEffect(() => {
    if (!userSpeaking) { setUserBars([3,3,3,3,3,3,3,3,3]); return; }
    const interval = setInterval(() => {
      setUserBars(() => Array.from({length: 9}, () => Math.random() * 24 * (1 + level * 2) + 3));
    }, 100);
    return () => clearInterval(interval);
  }, [userSpeaking, level]);

  return (
    <div className="relative flex flex-col items-center justify-center gap-6">

      {/* Speaking indicators row */}
      <div className="flex items-center gap-10">

        {/* USER waveform */}
        <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${
          userSpeaking ? 'opacity-100 scale-110' : 'opacity-25'
        }`}>
          <div className="flex items-end gap-0.5 h-10">
            {userBars.map((h, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: '3px',
                  height: `${Math.min(h, 36)}px`,
                  background: userSpeaking
                    ? `hsl(${210 + i * 5}, 90%, ${55 + i * 2}%)`
                    : '#3b82f6',
                  transition: 'height 0.1s ease',
                  boxShadow: userSpeaking ? '0 0 6px rgba(59,130,246,0.8)' : 'none'
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${userSpeaking ? 'bg-blue-400 animate-pulse' : 'bg-zinc-600'}`} />
            <span className={`text-xs font-medium ${userSpeaking ? 'text-blue-400' : 'text-zinc-600'}`}>You</span>
          </div>
        </div>

        {/* MAIN ORB */}
        <div className="relative flex items-center justify-center">

          {/* Pulse rings */}
          {active && !isConnecting && (
            <>
              <div
                className="absolute rounded-full border-2 transition-all duration-200"
                style={{
                  width: `${220 + level * 60 + (speaking ? 30 : 0)}px`,
                  height: `${220 + level * 60 + (speaking ? 30 : 0)}px`,
                  borderColor: speaking
                    ? 'rgba(34,211,238,0.4)'
                    : 'rgba(59,130,246,0.3)',
                  animation: 'ping 2.5s cubic-bezier(0,0,0.2,1) infinite',
                }}
              />
              <div
                className="absolute rounded-full border transition-all duration-200"
                style={{
                  width: `${265 + level * 70 + (speaking ? 40 : 0)}px`,
                  height: `${265 + level * 70 + (speaking ? 40 : 0)}px`,
                  borderColor: speaking
                    ? 'rgba(34,211,238,0.15)'
                    : 'rgba(59,130,246,0.1)',
                  animation: 'ping 3s cubic-bezier(0,0,0.2,1) infinite 0.8s',
                }}
              />
            </>
          )}

          {/* Glow layer */}
          <div
            className="absolute w-72 h-72 rounded-full blur-2xl opacity-60 transition-all duration-150"
            style={{
              transform: `scale(${1 + level})`,
              background: isConnecting
                ? 'radial-gradient(circle, #6366f1, transparent)'
                : speaking
                ? 'radial-gradient(circle, #22d3ee, transparent)'
                : userSpeaking
                ? 'radial-gradient(circle, #3b82f6, transparent)'
                : 'radial-gradient(circle, #1d4ed8, transparent)',
            }}
          />

          {/* Main orb */}
          <div
            className={`w-48 h-48 md:w-64 md:h-64 rounded-full transition-all duration-150 flex items-center justify-center ${
              isConnecting ? 'animate-pulse' : ''
            }`}
            style={{
              transform: `scale(${isConnecting ? 1 : scale})`,
              background: isConnecting
                ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
                : speaking
                ? 'linear-gradient(135deg, #0ea5e9, #22d3ee)'
                : userSpeaking
                ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
                : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              boxShadow: isConnecting
                ? '0 0 60px rgba(99,102,241,0.5)'
                : speaking
                ? '0 0 100px rgba(14,165,233,0.9), 0 0 60px rgba(34,211,238,0.6)'
                : userSpeaking
                ? '0 0 80px rgba(59,130,246,0.7)'
                : active
                ? '0 0 60px rgba(59,130,246,0.6)'
                : '0 0 20px rgba(59,130,246,0.3)',
            }}
          >
            {/* Inner content */}
            {isConnecting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : speaking ? (
              <div className="flex items-end gap-0.5">
                {aiBars.slice(0, 7).map((h, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-full"
                    style={{
                      width: '3px',
                      height: `${Math.min(h, 28)}px`,
                      transition: 'height 0.12s ease',
                      opacity: 0.9
                    }}
                  />
                ))}
              </div>
            ) : userSpeaking ? (
              <svg className="w-10 h-10 text-white/70 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            ) : active ? (
              <div className="flex items-center gap-1.5">
                {[0, 0.3, 0.6].map((delay, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* AI AGENT waveform */}
        <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${
          speaking ? 'opacity-100 scale-110' : 'opacity-25'
        }`}>
          <div className="flex items-end gap-0.5 h-10">
            {aiBars.map((h, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: '3px',
                  height: `${Math.min(h, 36)}px`,
                  background: speaking
                    ? `hsl(${185 + i * 5}, 90%, ${55 + i * 2}%)`
                    : '#22d3ee',
                  transition: 'height 0.12s ease',
                  boxShadow: speaking ? '0 0 6px rgba(34,211,238,0.8)' : 'none'
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${speaking ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'}`} />
            <span className={`text-xs font-medium ${speaking ? 'text-cyan-400' : 'text-zinc-600'}`}>AI Agent</span>
          </div>
        </div>

      </div>

      {/* Status label */}
      <div className={`text-xs font-medium transition-all duration-300 ${
        speaking ? 'text-cyan-400' :
        userSpeaking ? 'text-blue-400' :
        isConnecting ? 'text-violet-400' :
        active ? 'text-zinc-500' : 'text-zinc-700'
      }`}>
        {isConnecting ? '⟳ Connecting to agent...' :
         speaking ? '◉ AI Agent is responding' :
         userSpeaking ? '◉ Listening to you...' :
         active ? '○ Waiting...' : ''}
      </div>

    </div>
  );
}