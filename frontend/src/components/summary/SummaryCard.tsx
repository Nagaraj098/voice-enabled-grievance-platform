"use client";

export default function SummaryCard() {
  return (
    <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md shadow">
      <h2 className="text-lg font-semibold mb-4">Issue Summary</h2>

      <div className="space-y-2 text-sm text-gray-300">
        <p><strong>Category:</strong> Network Issue</p>
        <p><strong>Severity:</strong> Medium</p>
        <p><strong>Description:</strong> User facing slow internet connection</p>
        <p><strong>Status:</strong> In Progress</p>
      </div>
    </div>
  );
}