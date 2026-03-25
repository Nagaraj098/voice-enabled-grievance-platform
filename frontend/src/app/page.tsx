"use client";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-[#000000] text-zinc-100 overflow-hidden font-sans selection:bg-zinc-800 selection:text-white">
      
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        
        {/* Top Navigation Bar Component */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 flex flex-col p-8 overflow-y-auto bg-[#000000] rounded-tl-2xl border-l border-t border-zinc-800 shadow-[-10px_-10px_30px_-15px_rgba(0,0,0,1)] relative mt-2 ml-2">
          
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-center items-center h-full pt-10 pb-20">
            {/* Minimalist Dashboard Welcome Content */}
            <div className="text-center w-full max-w-lg space-y-8 animate-in fade-in zoom-in duration-500">
              
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]">
                  <span className="text-3xl">🎤</span>
                </div>
                
                <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">
                  Voice AI Agent
                </h1>
                
                <p className="text-zinc-400 text-lg font-light leading-relaxed">
                  Start an interactive voice session to experience next-generation conversational AI in real-time.
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-4">
                <button
                  onClick={() => router.push("/call")}
                  className="bg-zinc-100 text-zinc-900 px-8 py-3.5 rounded-lg text-sm font-semibold hover:bg-white hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all active:scale-95"
                >
                  Start Call
                </button>
              </div>
              
              {/* Subtle decorative features list matching dashboard vibe */}
              <div className="mt-16 pt-12 border-t border-zinc-900 grid grid-cols-3 gap-6 text-sm text-zinc-500">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-emerald-500"></div>
                  <span>Ultra Low Latency</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-blue-500"></div>
                  <span>HD Audio</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-purple-500"></div>
                  <span>Smart Transcript</span>
                </div>
              </div>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}