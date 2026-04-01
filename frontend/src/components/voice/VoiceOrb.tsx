"use client";

export default function VoiceOrb({
  level,
  active,
  speaking = false,
  connectStatus = 'idle',
}: {
  level: number;
  active: boolean;
  speaking?: boolean;
  connectStatus?: 'idle' | 'connecting' | 'connected' | 'error';
}) {
  const scale = 1 + level * 0.6;
  const isConnecting = connectStatus === 'connecting';

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow layer */}
      <div
        className="absolute w-72 h-72 rounded-full blur-2xl opacity-60 transition-all duration-150"
        style={{
          transform: `scale(${1 + level})`,
          background: isConnecting
            ? 'radial-gradient(circle, #6366f1, transparent)'
            : speaking
            ? 'radial-gradient(circle, #22d3ee, transparent)'
            : 'radial-gradient(circle, #3b82f6, transparent)',
        }}
      />

      {/* Main orb */}
      <div
        className={`w-48 h-48 md:w-64 md:h-64 rounded-full transition-all duration-150 ${
          isConnecting ? 'animate-pulse' : ''
        }`}
        style={{
          transform: `scale(${isConnecting ? 1 : scale})`,
          background: isConnecting
            ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
            : speaking
            ? 'linear-gradient(135deg, #0ea5e9, #22d3ee)'
            : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
          boxShadow: isConnecting
            ? '0 0 60px rgba(99,102,241,0.5)'
            : speaking
            ? '0 0 80px rgba(14,165,233,0.7)'
            : active
            ? '0 0 60px rgba(59,130,246,0.6)'
            : '0 0 20px rgba(59,130,246,0.3)',
        }}
      />
    </div>
  );
}