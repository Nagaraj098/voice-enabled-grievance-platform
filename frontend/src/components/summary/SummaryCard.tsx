"use client";

type SummaryData = {
  issue_category: string;
  severity: string;
  description: string;
  resolution_status: string;
  messages: { role: string; text: string; timestamp?: string }[];
} | null;

const severityColor = (s: string) => {
  const val = s?.toLowerCase();
  if (val === "high" || val === "critical") return "text-red-400 bg-red-500/10 border-red-500/20";
  if (val === "medium") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
};

const statusColor = (s: string) => {
  const val = s?.toLowerCase();
  if (val === "resolved") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (val === "pending") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-blue-400 bg-blue-500/10 border-blue-500/20";
};

export default function SummaryCard({ data }: { data: SummaryData }) {
  if (!data) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-300">Issue Details</h2>
      </div>
      <div className="p-5 space-y-4">

        {/* Category */}
        <div className="flex items-start justify-between">
          <span className="text-xs text-zinc-600 uppercase tracking-wider">Category</span>
          <span className="text-sm font-medium text-zinc-200">{data.issue_category || "—"}</span>
        </div>

        {/* Severity */}
        <div className="flex items-start justify-between">
          <span className="text-xs text-zinc-600 uppercase tracking-wider">Severity</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${severityColor(data.severity)}`}>
            {data.severity || "—"}
          </span>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <span className="text-xs text-zinc-600 uppercase tracking-wider">Description</span>
          <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-800/50 rounded-lg p-3 border border-zinc-800">
            {data.description || "No description available"}
          </p>
        </div>

        {/* Resolution Status */}
        <div className="flex items-start justify-between">
          <span className="text-xs text-zinc-600 uppercase tracking-wider">Resolution</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor(data.resolution_status)}`}>
            {data.resolution_status || "—"}
          </span>
        </div>

        {/* Transcript */}
        {data.messages && data.messages.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-zinc-800">
            <span className="text-xs text-zinc-600 uppercase tracking-wider">Transcript</span>
            <div className="space-y-2 max-h-48 overflow-y-auto mt-2">
              {data.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-xl text-xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}