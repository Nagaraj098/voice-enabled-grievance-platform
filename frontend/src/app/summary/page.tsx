"use client";

import { useSearchParams } from "next/navigation";
import SummaryCard from "@/components/summary/SummaryCard";
import ExportButton from "@/components/summary/ExportButton";

export default function SummaryPage() {
  const params = useSearchParams();
  const sessionId = params.get("sessionId");

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center gap-6">
      <h1 className="text-2xl font-semibold">Session Summary</h1>

      <p className="text-gray-400 text-sm">
        Session ID: {sessionId}
      </p>

      <SummaryCard />

      <ExportButton />
    </div>
  );
}