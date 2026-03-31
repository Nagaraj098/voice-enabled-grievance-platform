"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import SummaryCard from "@/components/summary/SummaryCard";
import ExportButton from "@/components/summary/ExportButton";

type SummaryData = {
  session_id: string;
  issue_category: string;
  severity: string;
  description: string;
  resolution_status: string;
  messages: { role: string; text: string; timestamp?: string }[];
  duration?: string;
};

// ✅ Retry fetching summary — backend may take a few seconds to save
async function fetchWithRetry(
  url: string,
  retries: number = 8,
  delayMs: number = 1500
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.ok) return res;

    console.log(`⏳ Summary not ready yet, retrying... (${i + 1}/${retries})`);
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error("Summary not available after multiple retries");
}

function SummaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");

  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Wait 2 seconds first — give backend time to save
        await new Promise((r) => setTimeout(r, 2000));

        const res = await fetchWithRetry(
          `http://localhost:8000/summary/${sessionId}`,
          8,    // retry up to 8 times
          1500  // 1.5 seconds between retries
        );

        const json = await res.json();
        setData(json);

      } catch (err: any) {
        console.error(err);
        setError("Summary is still being generated. Please wait a moment and refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm">Generating your summary...</p>
          <p className="text-zinc-600 text-xs">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors"
        >
          🔄 Retry
        </button>
        <button
          onClick={() => router.push("/home")}
          className="px-5 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans flex flex-col items-center py-16 px-4">

      {/* Header */}
      <div className="w-full max-w-2xl mb-10 text-center space-y-3">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]">
          <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Call Summary</h1>
        <p className="text-zinc-600 text-xs">Session: {sessionId}</p>
      </div>

      {/* Stats */}
      <div className="w-full max-w-2xl grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Duration",  value: data?.duration || "—",                color: "text-blue-400"    },
          { label: "Messages",  value: data?.messages?.length || 0,          color: "text-violet-400"  },
          { label: "Status",    value: data?.resolution_status || "—",       color: "text-emerald-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-zinc-600 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <div className="w-full max-w-2xl mb-6">
        <SummaryCard data={data} />
      </div>

      {/* Export Button */}
      <div className="w-full max-w-2xl mb-8">
        <ExportButton data={data} sessionId={sessionId || ""} />
      </div>

      {/* Actions */}
      <div className="w-full max-w-2xl flex gap-4">
        <button
          onClick={() => router.push("/call")}
          className="flex-1 py-3 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-medium hover:bg-zinc-900 hover:text-zinc-200 transition-all"
        >
          Start New Call
        </button>
        <button
          onClick={() => router.push("/home")}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold hover:scale-[1.02] transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]"
        >
          Go to Dashboard
        </button>
      </div>

    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SummaryContent />
    </Suspense>
  );
}