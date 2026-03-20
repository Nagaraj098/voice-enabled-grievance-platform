"use client";

export default function VoiceOrb({
  level,
  active,
}: {
  level: number;
  active: boolean;
}) {
  const scale = 1 + level * 0.6;

  return (
    <div className="relative flex items-center justify-center">

      <div
        className="absolute w-72 h-72 rounded-full blur-2xl opacity-60"
        style={{
          transform: `scale(${1 + level})`,
          background: "radial-gradient(circle, #3b82f6, transparent)",
        }}
      />

      <div
        className="w-64 h-64 rounded-full transition-all duration-150"
        style={{
          transform: `scale(${scale})`,
          background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
          boxShadow: active
            ? "0 0 60px rgba(59,130,246,0.6)"
            : "0 0 20px rgba(59,130,246,0.3)",
        }}
      />
    </div>
  );
}