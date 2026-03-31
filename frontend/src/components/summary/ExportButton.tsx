"use client";
import { exportTranscript } from "@/lib/exportTranscript";
import { useState } from "react";

type SummaryData = {
  session_id?: string;
  issue_category: string;
  severity: string;
  description: string;
  resolution_status: string;
  messages: { role: string; text: string; timestamp?: string }[];
  duration?: string;
} | null;

export default function ExportButton({ 
  data, 
  sessionId 
}: { 
  data: SummaryData; 
  sessionId: string; 
}) {
  const [exporting, setExporting] = useState(false);

  const handleExportTxt = () => {
    if (!data) return;
    setExporting(true);
    try {
      const content = exportTranscript(data, sessionId);
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transcript_${sessionId}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleExportTxt}
        disabled={!data || exporting}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-medium hover:bg-zinc-900 hover:text-zinc-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export as .txt
      </button>
    </div>
  );
}