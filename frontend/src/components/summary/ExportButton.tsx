"use client";

import { exportTranscript } from "@/lib/exportTranscript";

export default function ExportButton() {
  const handleExport = () => {
    const content = exportTranscript();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.txt";
    a.click();
  };

  return (
    <button
      onClick={handleExport}
      className="bg-blue-500 px-4 py-2 rounded text-white"
    >
      Export Transcript
    </button>
  );
}