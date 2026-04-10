"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const API_BASE = "http://localhost:8000";

type Ticket = {
  session_id: string;
  user: string;
  initials: string;
  description: string;
  category: string;
  status: string;
  date: string;
  severity?: string;
};

type Call = {
  session_id: string;
  time: string;
  snippet: string;
  sentiment: string;
};

const categoryColor = (cat: string) => {
  const c = (cat || "").toUpperCase();
  if (c.includes("BILL") || c.includes("WATER")) return "text-blue-400 bg-blue-500/10 border border-blue-500/20";
  if (c.includes("TECH") || c.includes("ELECTRIC")) return "text-amber-400 bg-amber-500/10 border border-amber-500/20";
  if (c.includes("ROAD") || c.includes("SANIT")) return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
  return "text-violet-400 bg-violet-500/10 border border-violet-500/20";
};

const sentimentColor = (s: string) => {
  if ((s || "").toUpperCase() === "POSITIVE") return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
  if ((s || "").toUpperCase() === "NEGATIVE") return "text-red-400 bg-red-500/10 border border-red-500/20";
  return "text-zinc-400 bg-zinc-800/60 border border-zinc-700";
};

const getInitials = (name: string) =>
  (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch { return iso || "—"; }
};

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Dashboard starts empty — data loads when backend is ready
    // Auto-refresh every 30 seconds once backend is connected
    const interval = setInterval(() => {
      if (!error) fetchSessions();
    }, 30000);
    return () => clearInterval(interval);
  }, [error]);

  const fetchSessions = async () => {
    setLoading(true);
    setError(false);
    try {
      // Step 1 — try GET /summaries (your friend will add this)
      const res = await fetch(`${API_BASE}/summaries`);
      if (!res.ok) throw new Error("no /summaries yet");
      const data = await res.json();
      const summaries = data.summaries || data || [];
      applyData(summaries);
    } catch {
      try {
        // Step 2 — fallback: GET /sessions → GET /summary/:id each
        const res = await fetch(`${API_BASE}/sessions`);
        if (!res.ok) throw new Error("no /sessions yet");
        const data = await res.json();
        const ids: string[] = data.session_ids || data.sessions || [];
        const results = await Promise.allSettled(
          ids.map(id => fetch(`${API_BASE}/summary/${id}`).then(r => r.json()))
        );
        const summaries = results
          .filter(r => r.status === "fulfilled")
          .map((r: any) => r.value);
        applyData(summaries);
      } catch {
        setError(true);
        setTickets([]);
        setCalls([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyData = (summaries: any[]) => {
    const sorted = [...summaries].sort((a, b) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    setTickets(sorted.map((s: any) => ({
      session_id: s.session_id || s.id || "",
      user: s.citizen_name || s.user || "Unknown Citizen",
      initials: getInitials(s.citizen_name || s.user || "U"),
      description: s.description || s.issue_summary || s.summary || "No description",
      category: s.issue_category || s.category || "GENERAL",
      status: s.resolution_status || s.status || "OPEN",
      date: formatDate(s.created_at || s.date || ""),
      severity: s.severity || "",
    })));
    setCalls(sorted.map((s: any) => ({
      session_id: s.session_id || s.id || "",
      time: formatDate(s.created_at || s.date || ""),
      snippet: s.description || s.issue_summary || s.summary || "Call completed.",
      sentiment: s.sentiment || "NEUTRAL",
    })));
  };

  const deleteCall = async (session_id: string) => {
    // Optimistic UI update — remove immediately
    setCalls(prev => prev.filter(c => c.session_id !== session_id));
    setTickets(prev => prev.filter(t => t.session_id !== session_id));
    // Your friend can wire DELETE /summary/:id here later
  };

  const filtered = tickets.filter(t =>
    t.user.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const openGrievances = tickets.filter(t =>
    (t.status || "").toUpperCase() !== "RESOLVED"
  ).length;

  return (
    <div className="flex h-screen bg-[#000000] text-zinc-100 overflow-hidden font-sans">
      <Sidebar activePage="dashboard" />
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[#000000] rounded-tl-2xl border-l border-t border-zinc-800/60 mt-2 ml-2 p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-50">Grievance Dashboard</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Monitor and manage AI-generated support tickets</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchSessions}
                disabled={loading}
                title="Refresh"
                className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={loading ? "animate-spin" : ""}>
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">SYSTEM LIVE</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Tickets", value: tickets.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: "🎫" },
              { label: "Recent Calls", value: calls.length, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: "📞" },
              { label: "Open Grievances", value: openGrievances, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: "🕐" },
            ].map((stat, i) => (
              <div key={i} className={`flex items-center gap-4 p-5 rounded-xl border bg-zinc-900/40 ${stat.bg}`}>
                <div className={`text-2xl p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16 gap-3 text-zinc-500">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="animate-spin">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              <span className="text-sm">Loading call history...</span>
            </div>
          )}

          {/* Error — backend not ready yet */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl">📭</div>
              <p className="text-zinc-400 font-medium text-sm">Backend not connected yet</p>
              <p className="text-zinc-600 text-xs">Complete a voice call — it will appear here automatically</p>
              <button
                onClick={fetchSessions}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 px-4 py-1.5 rounded-lg transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty — backend connected but no calls yet */}
          {!loading && !error && tickets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl">🎙️</div>
              <p className="text-zinc-400 font-medium text-sm">No calls yet</p>
              <p className="text-zinc-600 text-xs">Start a voice session — your call history will appear here</p>
              <button
                onClick={() => router.push('/call')}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 px-4 py-1.5 rounded-lg transition-colors"
              >
                Start Voice Call →
              </button>
            </div>
          )}

          {/* Data grid */}
          {!loading && !error && tickets.length > 0 && (
            <div className="grid grid-cols-5 gap-6">

              {/* Active Tickets */}
              <div className="col-span-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-zinc-200">🎫 Active Tickets</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search tickets..."
                        className="bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 w-44"
                      />
                    </div>
                    <span className="text-xs text-zinc-600">{filtered.length} results</span>
                  </div>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-[10px] text-zinc-600 uppercase tracking-wider border-b border-zinc-800/60">
                    <div className="col-span-4">User</div>
                    <div className="col-span-3">Category</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-1"></div>
                  </div>
                  {filtered.length === 0 ? (
                    <div className="text-center py-10 text-zinc-600 text-xs">No matching tickets</div>
                  ) : (
                    filtered.map((ticket) => (
                      <div key={ticket.session_id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors group">
                        <div className="col-span-4 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300 shrink-0">
                            {ticket.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-zinc-200 truncate">{ticket.user}</p>
                            <p className="text-[10px] text-zinc-600 truncate">{ticket.description}</p>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColor(ticket.category)}`}>
                            {ticket.category}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                            {ticket.status}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-zinc-500">{ticket.date}</p>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => router.push(`/summary?sessionId=${ticket.session_id}`)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Calls */}
              <div className="col-span-2">
                <h2 className="text-sm font-semibold text-zinc-200 mb-4">📞 Recent Calls</h2>
                <div className="space-y-3">
                  {calls.map((call) => (
                    <div key={call.session_id} className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 hover:border-zinc-700/60 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-xs font-medium text-zinc-300">{call.time}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sentimentColor(call.sentiment)}`}>
                          {call.sentiment}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-3">{call.snippet}</p>
                      <div className="flex items-center justify-end gap-3 mt-3">
                        <button
                          onClick={() => router.push(`/summary?sessionId=${call.session_id}`)}
                          className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          👁 View
                        </button>
                        <button
                          onClick={() => deleteCall(call.session_id)}
                          className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
