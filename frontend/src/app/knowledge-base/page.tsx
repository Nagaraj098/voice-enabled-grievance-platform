"use client";
import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const Icons = {
  Globe: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Upload: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  FileJson: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>,
  Database: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  Search: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  X: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  File: () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
  FileText: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Refresh: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Check: () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12"/></svg>,
  Alert: () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Trash: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
};

const API_BASE = "http://localhost:8000";

type Doc = {
  id: string;
  name: string;
  filename?: string;
  type: "url" | "file" | "json" | "db";
  size?: string;
  category?: string;
  policies_count?: number;
  createdAt: string;
  source: "local" | "backend";
};

const SAMPLE_JSONS = [
  {
    title: "Water Supply Grievance",
    tag: "Infrastructure",
    filename: "water_supply_grievance.json",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    json: {
      grievance_id: "GRS-2024-001",
      category: "Water Supply",
      severity: "High",
      citizen_name: "Ramesh Kumar",
      location: "Ward 12, Block B, Bengaluru",
      description: "No water supply for the past 5 days in our area. Multiple complaints filed but no action taken.",
      status: "Pending",
      filed_date: "2024-03-15",
      expected_resolution: "2024-03-22",
      assigned_officer: "BWSSB Water Department",
      contact: "9876543210",
      policies: [
        { rule: "Water supply must be restored within 48 hours of complaint" },
        { rule: "Compensation applicable if delay exceeds 72 hours" }
      ]
    }
  },
  {
    title: "Road Damage Grievance",
    tag: "Public Works",
    filename: "road_damage_grievance.json",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    json: {
      grievance_id: "GRS-2024-002",
      category: "Road & Infrastructure",
      severity: "Medium",
      citizen_name: "Priya Sharma",
      location: "Main Street, Sector 4, Bengaluru",
      description: "Large potholes on main road causing accidents. Two-wheelers have fallen multiple times.",
      status: "In Progress",
      filed_date: "2024-03-10",
      expected_resolution: "2024-03-25",
      assigned_officer: "BBMP Roads Division",
      contact: "9123456789",
      policies: [
        { rule: "Road repair must begin within 7 days of complaint" },
        { rule: "Temporary patching required within 24 hours for critical roads" }
      ]
    }
  },
  {
    title: "Electricity Outage Grievance",
    tag: "Utilities",
    filename: "electricity_outage_grievance.json",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    json: {
      grievance_id: "GRS-2024-003",
      category: "Electricity",
      severity: "Critical",
      citizen_name: "Suresh Patel",
      location: "Colony 7, JP Nagar, Bengaluru",
      description: "Frequent power cuts lasting 8-10 hours daily for 2 weeks. Affecting medical equipment at home.",
      status: "Escalated",
      filed_date: "2024-03-12",
      expected_resolution: "2024-03-18",
      assigned_officer: "BESCOM Grievance Cell",
      contact: "9988776655",
      policies: [
        { rule: "Power outage exceeding 4 hours must be escalated to senior engineer" },
        { rule: "Medical emergency cases get priority resolution within 12 hours" }
      ]
    }
  }
];

export default function KnowledgeBase() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [dbConfig, setDbConfig] = useState({ host: "", port: "", name: "", user: "", password: "" });
  const [urlInput, setUrlInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch docs from backend
  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const backendDocs: Doc[] = (data.knowledge_bases || []).map((f: any) => ({
        id: f.filename,
        name: f.filename,
        filename: f.filename,
        type: "json",
        category: f.category,
        policies_count: f.policies_count,
        createdAt: new Date().toLocaleDateString(),
        source: "backend"
      }));
      setDocs(backendDocs);
    } catch (err) {
      showToast("Failed to connect to backend", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Upload file to backend
  const uploadToBackend = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/knowledge/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    let successCount = 0;
    let failCount = 0;
    for (const file of Array.from(files)) {
      try {
        await uploadToBackend(file);
        successCount++;
      } catch (err: any) {
        failCount++;
        console.error(err);
      }
    }
    setUploading(false);
    if (successCount > 0) showToast(`${successCount} file(s) uploaded successfully`, "success");
    if (failCount > 0) showToast(`${failCount} file(s) failed — only JSON allowed`, "error");
    await fetchDocs();
    setShowUploadModal(false);
  };

  // Upload sample JSON to backend
  const uploadSampleJson = async (sample: typeof SAMPLE_JSONS[0]) => {
    setUploading(true);
    try {
      const blob = new Blob([JSON.stringify(sample.json, null, 2)], { type: "application/json" });
      const file = new File([blob], sample.filename, { type: "application/json" });
      await uploadToBackend(file);
      showToast(`${sample.title} added to Knowledge Base`, "success");
      await fetchDocs();
      setShowSampleModal(false);
    } catch (err: any) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  // Delete from backend
  const removeDoc = async (doc: Doc) => {
    if (doc.source === "backend" && doc.filename) {
      try {
        const res = await fetch(`${API_BASE}/knowledge/${doc.filename}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        showToast("Document deleted", "success");
        await fetchDocs();
      } catch {
        showToast("Failed to delete document", "error");
      }
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setDocs(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      name: urlInput,
      type: "url",
      createdAt: new Date().toLocaleDateString(),
      source: "local"
    }]);
    setUrlInput("");
    setShowUrlModal(false);
    showToast("URL added", "success");
  };

  const filtered = docs.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const typeIcon = (type: Doc["type"]) => {
    if (type === "url") return <span className="text-blue-400"><Icons.Globe /></span>;
    if (type === "json") return <span className="text-amber-400"><Icons.FileJson /></span>;
    if (type === "db") return <span className="text-emerald-400"><Icons.Database /></span>;
    return <span className="text-violet-400"><Icons.File /></span>;
  };

  const severityColor = (category?: string) => {
    if (!category) return "text-zinc-500 bg-zinc-800 border-zinc-700";
    const c = category.toLowerCase();
    if (c.includes("water")) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    if (c.includes("road")) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    if (c.includes("electric")) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    return "text-violet-400 bg-violet-500/10 border-violet-500/20";
  };

  return (
    <div className="flex h-screen bg-[#000000] text-zinc-100 overflow-hidden font-sans">
      <Sidebar activePage="knowledge-base" />
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        <Topbar />
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#000000] rounded-tl-2xl border-l border-t border-zinc-800/60 mt-2 ml-2 p-8">

          {/* Toast */}
          {toast && (
            <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium transition-all ${
              toast.type === "success"
                ? "bg-emerald-950 border-emerald-800 text-emerald-300"
                : "bg-red-950 border-red-800 text-red-300"
            }`}
            >
              {toast.type === "success"
                ? <Icons.Check />
                : <Icons.Alert />
              }
              {toast.msg}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-50">Knowledge Base</h1>
              <p className="text-xs text-zinc-600 mt-0.5">Manage documents and data sources for the AI agent</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDocs}
                disabled={loading}
                className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all"
              >
                <span className={loading ? "animate-spin inline-block" : ""}><Icons.Refresh /></span>
              </button>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                {docs.length} documents
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: <span className="text-blue-400"><Icons.Globe /></span>, label: "Add URL", bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20", onClick: () => setShowUrlModal(true) },
              { icon: <span className="text-violet-400"><Icons.Upload /></span>, label: "Upload JSON", bg: "bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20", onClick: () => setShowUploadModal(true) },
              { icon: <span className="text-amber-400"><Icons.FileJson /></span>, label: "Sample JSONs", bg: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20", onClick: () => setShowSampleModal(true) },
              { icon: <span className="text-emerald-400"><Icons.Database /></span>, label: "Connect to DB", bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20", onClick: () => setShowDbModal(true) },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-95 ${item.bg}`}
              >
                {item.icon}
                <span className="text-sm font-medium text-zinc-300">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"><Icons.Search /></span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search knowledge base..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
          </div>

          {/* Document List */}
          <div
            className={`flex-1 rounded-xl border-2 border-dashed transition-all duration-200 ${
              dragging ? "border-blue-500/50 bg-blue-500/5" : "border-zinc-800/40"
            }`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-20 gap-3">
                <span className="animate-spin inline-block text-zinc-600"><Icons.Refresh /></span>
                <p className="text-zinc-600 text-sm">Loading knowledge base...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <span className="text-zinc-600"><Icons.FileText /></span>
                </div>
                <div className="text-center">
                  <p className="text-zinc-400 font-medium">No documents found</p>
                  <p className="text-zinc-600 text-sm mt-1">Upload JSON files or add sample grievance data</p>
                </div>
              </div>
            ) : (
              <div className="p-4">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-zinc-600 uppercase tracking-wider border-b border-zinc-800/60 mb-2">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-3">Category</div>
                  <div className="col-span-2">Policies</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="space-y-1">
                  {filtered.map(doc => (
                    <div key={doc.id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg hover:bg-zinc-900/50 transition-colors group">
                      <div className="col-span-5 flex items-center gap-3">
                        {typeIcon(doc.type)}
                        <div className="min-w-0">
                          <p className="text-sm text-zinc-200 font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-zinc-600">{doc.createdAt}</p>
                        </div>
                      </div>
                      <div className="col-span-3">
                        {doc.category ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${severityColor(doc.category)}`}>
                            {doc.category}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs text-zinc-500">
                          {doc.policies_count !== undefined ? `${doc.policies_count} rules` : "—"}
                        </span>
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          onClick={() => removeDoc(doc)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".json"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h2 className="text-base font-semibold text-zinc-100 mb-1">Upload JSON File</h2>
                <p className="text-xs text-zinc-500 mb-5">Upload grievance JSON files to the knowledge base</p>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                    dragging ? 'border-violet-500/70 bg-violet-500/10' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30'
                  }`}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                  onClick={() => fileRef.current?.click()}
                >
                  <span className="text-zinc-500 flex justify-center mb-3"><Icons.Upload /></span>
                  <p className="text-sm text-zinc-300 font-medium mb-1">Click to browse or drag JSON files here</p>
                  <p className="text-xs text-zinc-600">Only .json files are supported</p>
                </div>
                {uploading && (
                  <div className="flex items-center gap-2 mt-4 text-xs text-zinc-400">
                    <span className="animate-spin inline-block"><Icons.Refresh /></span>
                    Uploading to backend...
                  </div>
                )}
                <div className="flex gap-3 justify-end mt-5">
                  <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Close</button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Icons.Upload />
                    Browse Files
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sample JSON Modal */}
          {showSampleModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
                <h2 className="text-base font-semibold text-zinc-100 mb-1">Sample Grievance JSONs</h2>
                <p className="text-xs text-zinc-500 mb-5">Pre-built templates — click Upload to add directly to your backend knowledge base</p>
                <div className="space-y-4">
                  {SAMPLE_JSONS.map((sample, i) => (
                    <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400"><Icons.FileJson /></span>
                          <span className="text-sm font-medium text-zinc-200">{sample.title}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sample.color}`}>
                            {sample.tag}
                          </span>
                        </div>
                        <button
                          onClick={() => uploadSampleJson(sample)}
                          disabled={uploading}
                          className="text-xs px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5"
                        >
                          {uploading ? <span className="animate-spin inline-block"><Icons.Refresh /></span> : <Icons.Upload />}
                          Upload to KB
                        </button>
                      </div>
                      <pre className="text-xs text-zinc-400 bg-zinc-900 rounded-lg p-3 overflow-x-auto max-h-36 overflow-y-auto border border-zinc-800">
                        {JSON.stringify(sample.json, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-5">
                  <button onClick={() => setShowSampleModal(false)} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Close</button>
                </div>
              </div>
            </div>
          )}

          {/* URL Modal */}
          {showUrlModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h2 className="text-base font-semibold text-zinc-100 mb-4">Add URL</h2>
                <input
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 mb-4"
                />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowUrlModal(false)} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
                  <button onClick={handleAddUrl} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-medium transition-colors">Add</button>
                </div>
              </div>
            </div>
          )}

          {/* DB Modal */}
          {showDbModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h2 className="text-base font-semibold text-zinc-100 mb-1">Connect to Database</h2>
                <p className="text-xs text-zinc-500 mb-5">Enter your database connection details</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Host</label>
                      <input value={dbConfig.host} onChange={e => setDbConfig(p => ({...p, host: e.target.value}))} placeholder="localhost" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Port</label>
                      <input value={dbConfig.port} onChange={e => setDbConfig(p => ({...p, port: e.target.value}))} placeholder="5432" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Database Name</label>
                    <input value={dbConfig.name} onChange={e => setDbConfig(p => ({...p, name: e.target.value}))} placeholder="my_database" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Username</label>
                    <input value={dbConfig.user} onChange={e => setDbConfig(p => ({...p, user: e.target.value}))} placeholder="postgres" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Password</label>
                    <input type="password" value={dbConfig.password} onChange={e => setDbConfig(p => ({...p, password: e.target.value}))} placeholder="••••••••" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-5">
                  <button onClick={() => setShowDbModal(false)} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
                  <button
                    onClick={() => {
                      if (!dbConfig.host || !dbConfig.name) return;
                      showToast(`Connected to ${dbConfig.name}`, "success");
                      setDbConfig({ host: "", port: "", name: "", user: "", password: "" });
                      setShowDbModal(false);
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg font-medium transition-colors"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
