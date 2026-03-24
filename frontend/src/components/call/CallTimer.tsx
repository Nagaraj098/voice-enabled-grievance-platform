"use client";

export default function CallTimer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="text-sm text-white/70">
      {mins}:{secs.toString().padStart(2, "0")}
    </div>
  );
}