"use client";

export default function VoiceControls({
  active,
  setActive,
}: {
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => setActive((prev) => !prev)} // ✅ now valid
        className={`w-16 h-16 rounded-full text-white text-xl ${
          active ? "bg-red-500" : "bg-green-500"
        }`}
      >
        {active ? "⏹" : "🎤"}
      </button>

      <button className="px-4 py-1 border rounded text-sm">
        Mute
      </button>
    </div>
  );
}