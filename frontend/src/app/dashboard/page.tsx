// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Sidebar from "@/components/layout/Sidebar";
// import Topbar from "@/components/layout/Topbar";

// const API_BASE = "http://localhost:8000";

// type Ticket = {
//   session_id: string;
//   user: string;
//   initials: string;
//   description: string;
//   category: string;
//   status: string;
//   date: string;
//   severity?: string;
// };

// type Call = {
//   session_id: string;
//   time: string;
//   snippet: string;
//   sentiment: string;
// };

// const categoryColor = (cat: string) => {
//   const c = (cat || "").toUpperCase();
//   if (c.includes("BILL") || c.includes("WATER")) return "text-blue-400 bg-blue-500/10 border border-blue-500/20";
//   if (c.includes("TECH") || c.includes("ELECTRIC")) return "text-amber-400 bg-amber-500/10 border border-amber-500/20";
//   if (c.includes("ROAD") || c.includes("SANIT")) return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
//   return "text-violet-400 bg-violet-500/10 border border-violet-500/20";
// };

// const sentimentColor = (s: string) => {
//   if ((s || "").toUpperCase() === "POSITIVE") return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
//   if ((s || "").toUpperCase() === "NEGATIVE") return "text-red-400 bg-red-500/10 border border-red-500/20";
//   return "text-zinc-400 bg-zinc-800/60 border border-zinc-700";
// };

// const getInitials = (name: string) =>
//   (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

// const formatDate = (iso: string) => {
//   try {
//     return new Date(iso).toLocaleString("en-IN", {
//       month: "short", day: "numeric",
//       hour: "2-digit", minute: "2-digit"
//     });
//   } catch { return iso; }
// };

// // ✅ FRONTEND ONLY — your friend will wire real API later
// // Shape your backend friend needs to return from GET /summaries:
// // { summaries: [ { session_id, citizen_name, description,
// //   issue_category, resolution_status, created_at, severity, sentiment } ] }

// export default function DashboardPage() {
//   const [tickets, setTickets] = useState<Ticket[]>([]);
//   const [calls, setCalls] = useState<Call[]>([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   // ✅ When your friend adds the backend endpoint, 
//   // just uncomment this and remove MOCK data above:
//   //
//   // useEffect(() => { fetchSessions(); }, []);
//   // const fetchSessions = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const res = await fetch(`${API_BASE}/summaries`);
//   //     const data = await res.json();
//   //     const summaries = data.summaries || [];
//   //     setTickets(summaries.map((s: any) => ({
//   //       session_id: s.session_id,
//   //       user: s.citizen_name || "Unknown",
//   //       initials: getInitials(s.citizen_name || "U"),
//   //       description: s.description || "",
//   //       category: s.issue_category || "GENERAL",
//   //       status: s.resolution_status || "OPEN",
//   //       date: formatDate(s.created_at),
//   //       severity: s.severity,
//   //     })));
//   //     setCalls(summaries.map((s: any) => ({
//   //       session_id: s.session_id,
//   //       time: formatDate(s.created_at),
//   //       snippet: s.description || "",
//   //       sentiment: s.sentiment || "NEUTRAL",
//   //     })));
//   //   } catch (err) { console.error(err); }
//   //   finally { setLoading(false); }
//   // };

//   const deleteCall = (session_id: string) => {
//     setCalls(prev => prev.filter(c => c.session_id !== session_id));
//     setTickets(prev => prev.filter(t => t.session_id !== session_id));
//   };

//   const filtered = tickets.filter(t =>
//     t.user.toLowerCase().includes(search.toLowerCase()) ||
//     t.description.toLowerCase().includes(search.toLowerCase()) ||
//     t.category.toLowerCase().includes(search.toLowerCase())
//   );

//   const openGrievances = tickets.filter(t =>
//     (t.status || "").toUpperCase() !== "RESOLVED"
//   ).length;

//   return (
//     <div className="flex h-screen bg-[#000000] text-zinc-100 overflow-hidden font-sans">
//       <Sidebar activePage="dashboard" />
//       <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
//         <Topbar />
//         <main className="flex-1 overflow-y-auto bg-[#000000] rounded-tl-2xl border-l border-t border-zinc-800/60 mt-2 ml-2 p-8">

//           {/* Header */}
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-2xl font-semibold text-zinc-50">Grievance Dashboard</h1>
//               <p className="text-xs text-zinc-500 mt-0.5">Monitor and manage AI-generated support tickets</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
//               <span className="text-xs text-emerald-400 font-medium">SYSTEM LIVE</span>
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-3 gap-4 mb-8">
//             {[
//               { label: "Total Tickets", value: tickets.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: "🎫" },
//               { label: "Recent Calls", value: calls.length, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: "📞" },
//               { label: "Open Grievances", value: openGrievances, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: "🕐" },
//             ].map((stat, i) => (
//               <div key={i} className={`flex items-center gap-4 p-5 rounded-xl border bg-zinc-900/40 ${stat.bg}`}>
//                 <div className={`text-2xl p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
//                 <div>
//                   <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
//                   <p className={`text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="grid grid-cols-5 gap-6">

//             {/* Active Tickets */}
//             <div className="col-span-3">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-sm font-semibold text-zinc-200">🎫 Active Tickets</h2>
//                 <div className="flex items-center gap-3">
//                   <div className="relative">
//                     <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
//                     <input
//                       value={search}
//                       onChange={e => setSearch(e.target.value)}
//                       placeholder="Search tickets..."
//                       className="bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 w-44"
//                     />
//                   </div>
//                   <span className="text-xs text-zinc-600">{filtered.length} results</span>
//                 </div>
//               </div>

//               <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-xl overflow-hidden">
//                 <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-[10px] text-zinc-600 uppercase tracking-wider border-b border-zinc-800/60">
//                   <div className="col-span-4">User</div>
//                   <div className="col-span-3">Category</div>
//                   <div className="col-span-2">Status</div>
//                   <div className="col-span-2">Date</div>
//                   <div className="col-span-1"></div>
//                 </div>
//                 {filtered.length === 0 ? (
//                   <div className="text-center py-16 text-zinc-600">
//                     <p className="text-sm">No tickets yet.</p>
//                   </div>
//                 ) : (
//                   filtered.map((ticket) => (
//                     <div key={ticket.session_id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors group">
//                       <div className="col-span-4 flex items-center gap-2.5">
//                         <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300 shrink-0">
//                           {ticket.initials}
//                         </div>
//                         <div className="min-w-0">
//                           <p className="text-xs font-medium text-zinc-200 truncate">{ticket.user}</p>
//                           <p className="text-[10px] text-zinc-600 truncate">{ticket.description}</p>
//                         </div>
//                       </div>
//                       <div className="col-span-3">
//                         <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColor(ticket.category)}`}>
//                           {ticket.category}
//                         </span>
//                       </div>
//                       <div className="col-span-2">
//                         <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
//                           {ticket.status}
//                         </span>
//                       </div>
//                       <div className="col-span-2">
//                         <p className="text-[10px] text-zinc-500">{ticket.date}</p>
//                       </div>
//                       <div className="col-span-1 flex justify-end">
//                         <button
//                           onClick={() => router.push(`/summary?sessionId=${ticket.session_id}`)}
//                           className="text-[10px] text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-all"
//                         >
//                           View
//                         </button>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>

//             {/* Recent Calls */}
//             <div className="col-span-2">
//               <h2 className="text-sm font-semibold text-zinc-200 mb-4">📞 Recent Calls</h2>
//               <div className="space-y-3">
//                 {calls.length === 0 ? (
//                   <div className="text-center py-8 text-zinc-600">
//                     <p className="text-sm">No recent calls.</p>
//                   </div>
//                 ) : (
//                   calls.map((call) => (
//                     <div key={call.session_id} className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 hover:border-zinc-700/60 transition-colors">
//                       <div className="flex items-center justify-between mb-2">
//                         <div className="flex items-center gap-2">
//                           <div className="w-2 h-2 rounded-full bg-emerald-400" />
//                           <span className="text-xs font-medium text-zinc-300">{call.time}</span>
//                         </div>
//                         <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sentimentColor(call.sentiment)}`}>
//                           {call.sentiment}
//                         </span>
//                       </div>
//                       <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-3">{call.snippet}</p>
//                       <div className="flex items-center justify-end gap-3 mt-3">
//                         <button
//                           onClick={() => router.push(`/summary?sessionId=${call.session_id}`)}
//                           className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
//                         >
//                           👁 View
//                         </button>
//                         <button
//                           onClick={() => deleteCall(call.session_id)}
//                           className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
//                         >
//                           🗑 Delete
//                         </button>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>

//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect, useCallback } from "react";
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
  duration?: string;
};

type Call = {
  session_id: string;
  time: string;
  snippet: string;
  sentiment: string;
  duration?: string;
};

const categoryColor = (cat: string) => {
  const c = (cat || "").toUpperCase();
  if (c.includes("BILL") || c.includes("WATER")) return "text-blue-400 bg-blue-500/10 border border-blue-500/20";
  if (c.includes("TECH") || c.includes("ELECTRIC")) return "text-amber-400 bg-amber-500/10 border border-amber-500/20";
  if (c.includes("ROAD") || c.includes("SANIT")) return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
  return "text-violet-400 bg-violet-500/10 border border-violet-500/20";
};

const severityColor = (s: string) => {
  const v = (s || "").toLowerCase();
  if (v === "high" || v === "critical") return "text-red-400 bg-red-500/10 border border-red-500/20";
  if (v === "medium") return "text-amber-400 bg-amber-500/10 border border-amber-500/20";
  return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
};

const statusColor = (s: string) => {
  const v = (s || "").toLowerCase();
  if (v === "resolved") return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
  if (v === "in progress") return "text-amber-400 bg-amber-500/10 border border-amber-500/20";
  return "text-blue-400 bg-blue-500/10 border border-blue-500/20";
};

const getInitials = (name: string) =>
  (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalOpen, setTotalOpen] = useState(0);
  const router = useRouter();

  // ✅ Fetch tickets from backend
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tickets`);
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();

      const allTickets = (data.tickets || []).map((t: any) => ({
        session_id: t.session_id,
        user: t.user_name || "Unknown",
        initials: getInitials(t.user_name || "U"),
        description: t.description || "No description",
        category: t.issue_category || "General",
        status: t.resolution_status || "Registered",
        date: t.duration ? `Duration: ${t.duration}` : "N/A",
        severity: t.severity || "low",
        duration: t.duration,
      }));

      const allCalls = (data.tickets || []).map((t: any) => ({
        session_id: t.session_id,
        time: t.duration ? `Duration: ${t.duration}` : "Recent",
        snippet: t.description || "No description",
        sentiment: t.severity === "high" ? "NEGATIVE" : t.severity === "low" ? "POSITIVE" : "NEUTRAL",
        duration: t.duration,
      }));

      setTickets(allTickets);
      setCalls(allCalls);
      setTotalOpen(data.open || 0);

    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch on mount
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // ✅ Auto-refresh every 10 seconds to catch new tickets
  useEffect(() => {
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const deleteCall = (session_id: string) => {
    setCalls(prev => prev.filter(c => c.session_id !== session_id));
    setTickets(prev => prev.filter(t => t.session_id !== session_id));
  };

  const filtered = tickets.filter(t =>
    t.user.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-white dark:bg-[#000000] text-zinc-900 dark:text-zinc-100">
      <Sidebar activePage="dashboard" />
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-[#0a0a0a]">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#000000] rounded-tl-2xl border-l border-t border-zinc-200 dark:border-zinc-800/60 mt-2 ml-2 p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Grievance Dashboard</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Monitor and manage AI-generated support tickets</p>
            </div>
            <div className="flex items-center gap-3">
              {/* ✅ Manual refresh button */}
              <button
                onClick={fetchTickets}
                disabled={loading}
                className="text-xs text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                {loading ? "⏳ Loading..." : "🔄 Refresh"}
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
              { label: "Total Tickets",    value: tickets.length, color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",   icon: "🎫" },
              { label: "Recent Calls",     value: calls.length,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: "📞" },
              { label: "Open Grievances",  value: totalOpen,      color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20",  icon: "🕐" },
            ].map((stat, i) => (
              <div key={i} className={`flex items-center gap-4 p-5 rounded-xl border bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/60 ${stat.bg}`}>
                <div className={`text-2xl p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-6">

            {/* Active Tickets */}
            <div className="col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">🎫 Active Tickets</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search tickets..."
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 w-44"
                    />
                  </div>
                  <span className="text-xs text-zinc-600">{filtered.length} results</span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/60 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-[10px] text-zinc-500 dark:text-zinc-600 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800/60">
                  <div className="col-span-3">User</div>
                  <div className="col-span-3">Category</div>
                  <div className="col-span-2">Severity</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2"></div>
                </div>

                {loading && tickets.length === 0 ? (
                  <div className="text-center py-16 text-zinc-600">
                    <div className="w-5 h-5 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading tickets...</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-16 text-zinc-600">
                    <p className="text-sm">No tickets yet.</p>
                    <p className="text-xs mt-1">Start a voice call to register a grievance</p>
                  </div>
                ) : (
                  filtered.map((ticket) => (
                    <div
                      key={ticket.session_id}
                      className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/summary?sessionId=${ticket.session_id}`)}
                    >
                      <div className="col-span-3 flex items-center gap-2">
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
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${severityColor(ticket.severity || "low")}`}>
                          {ticket.severity || "low"}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/summary?sessionId=${ticket.session_id}`); }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-all px-2 py-1 rounded border border-blue-500/20 hover:bg-blue-500/10"
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Calls */}
            <div className="col-span-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-4">📞 Recent Calls</h2>
              <div className="space-y-3">
                {calls.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600">
                    <p className="text-sm">No recent calls.</p>
                  </div>
                ) : (
                  calls.map((call) => (
                    <div key={call.session_id} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-xl p-4 hover:border-zinc-300 dark:hover:border-zinc-700/60 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-xs font-medium text-zinc-300">{call.time}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          call.sentiment === "NEGATIVE"
                            ? "text-red-400 bg-red-500/10 border border-red-500/20"
                            : call.sentiment === "POSITIVE"
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                            : "text-zinc-400 bg-zinc-800/60 border border-zinc-700"
                        }`}>
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
                  ))
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}