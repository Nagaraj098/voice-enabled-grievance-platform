"use client";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-white dark:bg-[#000000] text-zinc-900 dark:text-zinc-100">

      <Sidebar activePage="home" />

      <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-[#0a0a0a]">
        <Topbar />

        <main className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-[#000000] rounded-tl-2xl border-l border-t border-zinc-200 dark:border-zinc-800/60 mt-2 ml-2">

          {/* Hero area */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
            <div className="w-full max-w-2xl space-y-10 text-center">

              {/* Animated icon */}
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500/10 to-violet-500/10 dark:from-blue-500/20 dark:to-violet-500/20 rounded-2xl border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] dark:shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]">
                  <span className="text-4xl">🎤</span>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Voice AI Agent
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-base font-light leading-relaxed max-w-md mx-auto">
                  Start an interactive voice session to experience next-generation conversational AI in real-time.
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => router.push("/call")}
                  className="relative group bg-gradient-to-r from-blue-600 to-violet-600 text-white px-10 py-3.5 rounded-xl text-sm font-semibold hover:scale-[1.03] transition-all shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] active:scale-95"
                >
                  <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    Start Voice Session
                  </span>
                </button>
              </div>

              {/* Feature pills */}
              <div className="flex items-center justify-center gap-6 pt-6 border-t border-zinc-200 dark:border-zinc-900">
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  Ultra Low Latency
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                  HD Audio
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                  Smart Transcript
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
