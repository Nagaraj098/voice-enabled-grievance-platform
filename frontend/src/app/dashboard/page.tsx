"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const API_BASE = "http://localhost:8000";

type Ticket = {
  session_id: string; user: string; initials: string;
  description: string; category: string; status: string;
  date: string; severity?: string;
};
type Call = {
  session_id: string; time: string; snippet: string; sentiment: string;
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
  return "text-muted-foreground bg-muted border border-border";
};
const getInitials = (name: string) =>
  (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  } catch { return iso || "—"; }
};

/* ── Analytics mock data ── */
const conversationData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (29 - i));
  const base = 60 + i * 0.8;
  const noise = Math.sin(i * 0.7) * 15 + Math.cos(i * 0.3) * 10;
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: Math.round(base + noise),
  };
});
const agentData = [
  { name: "Support Bot", conversations: 842 },
  { name: "Sales Agent", conversations: 631 },
  { name: "Onboarding", conversations: 489 },
  { name: "HR Assistant", conversations: 312 },
  { name: "Tech Help", conversations: 198 },
];
const responseTimeData = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (13 - i));
  const base = 2.2 - (i / 13) * 0.9;
  const noise = Math.sin(i * 1.1) * 0.3;
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: Math.round((base + noise) * 100) / 100,
  };
});
const fileTypeData = [
  { name: "PDF", value: 54, color: "#7c3aed" },
  { name: "JSON", value: 31, color: "#a78bfa" },
  { name: "TXT", value: 28, color: "#c4b5fd" },
  { name: "CSV", value: 17, color: "#6d28d9" },
  { name: "Other", value: 8, color: "#4c1d95" },
];
const analyticsStats = [
  { title: "Total Conversations", value: "2,847", change: "+12% vs last week", up: true },
  { title: "Active Agents", value: "14", change: "+3 this week", up: true },
  { title: "Knowledge Base Files", value: "138", change: "+9 added this week", up: true },
  { title: "Avg Response Time", value: "1.4s", change: "-0.2s improvement", up: false },
];
const ArrowUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />
  </svg>
);
const ArrowDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
  </svg>
);
const ttStyle = {
  backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))",
  borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))",
};
const tickStyle = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

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

  const fetchSessions = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const res = await fetch(`${API_BASE}/summaries`);
      if (!res.ok) throw new Error("no /summaries yet");
      const data = await res.json();
      applyData(data.summaries || data || []);
    } catch {
      try {
        const res = await fetch(`${API_BASE}/sessions`);
        if (!res.ok) throw new Error("no /sessions yet");
        const data = await res.json();
        const ids: string[] = data.session_ids || data.sessions || [];
        const results = await Promise.allSettled(
          ids.map(id => fetch(`${API_BASE}/summary/${id}`).then(r => r.json()))
        );
        applyData(results.filter(r => r.status === "fulfilled").map((r: any) => r.value));
      } catch {
        setError(true); setTickets([]); setCalls([]);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  useEffect(() => {
    const interval = setInterval(() => { if (!error) fetchSessions(); }, 30000);
    return () => clearInterval(interval);
  }, [error, fetchSessions]);

  const deleteCall = (session_id: string) => {
    setCalls(prev => prev.filter(c => c.session_id !== session_id));
    setTickets(prev => prev.filter(t => t.session_id !== session_id));
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
    <div className="flex h-screen overflow-hidden font-sans bg-background text-foreground">
      <Sidebar activePage="dashboard" />
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-background rounded-tl-2xl border-l border-t border-border mt-2 ml-2">
          <div className="flex flex-col gap-6 p-6">

            {/* ═══════════ SECTION 1 — Page Header ═══════════ */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Welcome back</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={fetchSessions} disabled={loading} title="Refresh"
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={loading ? "animate-spin" : ""}>
                    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">SYSTEM LIVE</span>
                </div>
              </div>
            </div>

            {/* ═══════════ SECTION 2 — Original Dashboard Content ═══════════ */}
            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Tickets", value: tickets.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: "🎫" },
                { label: "Recent Calls", value: calls.length, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: "📞" },
                { label: "Open Grievances", value: openGrievances, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: "🕐" },
              ].map((stat, i) => (
                <div key={i} className={`flex items-center gap-4 p-5 rounded-xl border bg-card border-border ${stat.bg}`}>
                  <div className={`text-2xl p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="animate-spin">
                  <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span className="text-sm">Loading call history...</span>
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-xl">📭</div>
                <p className="text-muted-foreground font-medium text-sm">Backend not connected yet</p>
                <p className="text-muted-foreground text-xs">Complete a voice call — it will appear here automatically</p>
                <button onClick={fetchSessions}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 px-4 py-1.5 rounded-lg transition-colors">
                  Try again
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && tickets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-xl">🎙️</div>
                <p className="text-muted-foreground font-medium text-sm">No calls yet</p>
                <p className="text-muted-foreground text-xs">Start a voice session — your call history will appear here</p>
                <button onClick={() => router.push('/call')}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 px-4 py-1.5 rounded-lg transition-colors">
                  Start Voice Call →
                </button>
              </div>
            )}

            {/* Data grid — Active Tickets + Recent Calls */}
            {!loading && !error && tickets.length > 0 && (
              <div className="grid grid-cols-5 gap-6">
                {/* Active Tickets */}
                <div className="col-span-3">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-foreground">🎫 Active Tickets</h2>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..."
                          className="bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 w-44" />
                      </div>
                      <span className="text-xs text-muted-foreground">{filtered.length} results</span>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border">
                      <div className="col-span-4">User</div><div className="col-span-3">Category</div>
                      <div className="col-span-2">Status</div><div className="col-span-2">Date</div><div className="col-span-1"></div>
                    </div>
                    {filtered.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground text-xs">No matching tickets</div>
                    ) : (
                      filtered.map((ticket) => (
                        <div key={ticket.session_id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors group">
                          <div className="col-span-4 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">{ticket.initials}</div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{ticket.user}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{ticket.description}</p>
                            </div>
                          </div>
                          <div className="col-span-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColor(ticket.category)}`}>{ticket.category}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">{ticket.status}</span>
                          </div>
                          <div className="col-span-2"><p className="text-[10px] text-muted-foreground">{ticket.date}</p></div>
                          <div className="col-span-1 flex justify-end">
                            <button onClick={() => router.push(`/summary?sessionId=${ticket.session_id}`)}
                              className="text-[10px] text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-all">View</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Calls */}
                <div className="col-span-2">
                  <h2 className="text-sm font-semibold text-foreground mb-4">📞 Recent Calls</h2>
                  <div className="space-y-3">
                    {calls.map((call) => (
                      <div key={call.session_id} className="bg-card border border-border rounded-xl p-4 hover:border-foreground/10 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-xs font-medium text-foreground">{call.time}</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sentimentColor(call.sentiment)}`}>{call.sentiment}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{call.snippet}</p>
                        <div className="flex items-center justify-end gap-3 mt-3">
                          <button onClick={() => router.push(`/summary?sessionId=${call.session_id}`)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors">👁 View</button>
                          <button onClick={() => deleteCall(call.session_id)}
                            className="text-[10px] text-red-400 hover:text-red-300 transition-colors">🗑 Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════ SECTION 3 — Analytics Divider ═══════════ */}
            <div className="border-t border-border my-6" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Analytics Overview</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Last 30 days performance</p>
            </div>

            {/* ═══════════ SECTION 4 — Analytics Stat Cards ═══════════ */}
            <div className="grid grid-cols-4 gap-4">
              {analyticsStats.map((s) => (
                <div key={s.title} className="bg-card border border-border rounded-xl p-6">
                  <p className="text-sm text-muted-foreground font-medium">{s.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{s.value}</p>
                  <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    {s.up ? <ArrowUp /> : <ArrowDown />}{s.change}
                  </div>
                </div>
              ))}
            </div>

            {/* ═══════════ SECTION 5 — Charts Row 1 ═══════════ */}
            <div className="grid grid-cols-12 gap-4">
              {/* Conversation Volume */}
              <div className="col-span-7 bg-card border border-border rounded-xl p-6">
                <p className="text-base font-semibold text-foreground">Conversation Volume</p>
                <p className="text-xs text-muted-foreground mb-4">Last 30 days</p>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={conversationData}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={tickStyle} interval={4} axisLine={false} tickLine={false} />
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={ttStyle} />
                    <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} fill="url(#colorGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Agent Usage */}
              <div className="col-span-5 bg-card border border-border rounded-xl p-6">
                <p className="text-base font-semibold text-foreground">Agent Usage</p>
                <p className="text-xs text-muted-foreground mb-4">Top agents by conversations</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={agentData} layout="vertical">
                    <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={90} tick={tickStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={ttStyle} />
                    <Bar dataKey="conversations" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ═══════════ SECTION 6 — Charts Row 2 ═══════════ */}
            <div className="grid grid-cols-12 gap-4">
              {/* Response Time Trend */}
              <div className="col-span-6 bg-card border border-border rounded-xl p-6">
                <p className="text-base font-semibold text-foreground">Response Time Trend</p>
                <p className="text-xs text-muted-foreground mb-4">Last 14 days (seconds)</p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={responseTimeData}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={tickStyle} interval={1} axisLine={false} tickLine={false} />
                    <YAxis domain={[0.8, 2.8]} tickFormatter={(v: number) => v + "s"} tick={tickStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={ttStyle} formatter={(v: number) => [v + "s", "Response Time"]} />
                    <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* File Types Donut */}
              <div className="col-span-6 bg-card border border-border rounded-xl p-6">
                <p className="text-base font-semibold text-foreground">File Types in Knowledge Base</p>
                <p className="text-xs text-muted-foreground mb-4">Distribution by type</p>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={fileTypeData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                      {fileTypeData.map((e) => (<Cell key={e.name} fill={e.color} />))}
                    </Pie>
                    <Tooltip contentStyle={ttStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
                  {fileTypeData.map((e) => (
                    <div key={e.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                      {e.name} <span className="text-foreground font-medium">{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}