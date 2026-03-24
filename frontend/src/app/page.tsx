"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black text-white">
      <h1 className="text-3xl font-bold">Voice AI Platform</h1>

      <button
        onClick={() => router.push("/call")}
        className="px-6 py-2 bg-blue-500 rounded-lg"
      >
        Start Call
      </button>
    </div>
  );
}