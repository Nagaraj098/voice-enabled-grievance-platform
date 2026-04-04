"use client";
import { useState, useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Globe, FileText, Search, X, File, Upload, Database, FileJson } from "lucide-react";

type Doc = {
  id: string;
  name: string;
  type: "url" | "file" | "text" | "folder";
  size?: string;
  createdAt: string;
};

export default function KnowledgeBase() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [search, setSearch] = useState("");
  const [showUrlModal, setShowUrlModal] = useState(false);
  
  const [showDbModal, setShowDbModal] = useState(false);
  const [dbConfig, setDbConfig] = useState({ host: "", port: "", name: "", user: "", password: "" });
  
  const [urlInput, setUrlInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [recentFiles, setRecentFiles] = useState<Doc[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);

  const addDoc = (doc: Omit<Doc, "id" | "createdAt">) => {
    setDocs(prev => [...prev, {
      ...doc,
      id: Math.random().toString(36).slice(2),
      createdAt: new Date().toLocaleDateString()
    }]);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newDocs: Doc[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).slice(2),
      name: file.name,
      type: "file" as const,
      size: file.size < 1024
        ? file.size + " B"
        : file.size < 1024 * 1024
        ? (file.size / 1024).toFixed(1) + " KB"
        : (file.size / (1024 * 1024)).toFixed(1) + " MB",
      createdAt: new Date().toLocaleDateString()
    }));
    setDocs(prev => [...prev, ...newDocs]);
    setRecentFiles(prev => [...newDocs, ...prev].slice(0, 5));
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    addDoc({ name: urlInput, type: "url" });
    setUrlInput("");
    setShowUrlModal(false);
  };

  const removeDoc = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  const filtered = docs.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const typeIcon = (type: Doc["type"]) => {
    if (type === "url") return <Globe size={16} className="text-blue-400" />;
    if (type === "file") return <File size={16} className="text-violet-400" />;
    return <Database size={16} className="text-emerald-400" />;
  };

  return (
    <div className="flex h-screen bg-[#000000] text-zinc-100 overflow-hidden font-sans">
      <Sidebar activePage="knowledge-base" />
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        <Topbar />
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#000000] rounded-tl-2xl border-l border-t border-zinc-800/60 mt-2 ml-2 p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-zinc-50">Knowledge Base</h1>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              RAG Storage: {docs.length} docs
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: <Globe size={20} className="text-blue-400" />, label: "Add URL", bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20", onClick: () => setShowUrlModal(true) },
              { icon: <Upload size={20} className="text-violet-400" />, label: "Add Files", bg: "bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20", onClick: () => setShowUploadModal(true) },
              { icon: <Database size={20} className="text-emerald-400" />, label: "Connect to DB", bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20", onClick: () => setShowDbModal(true) },
              { icon: <FileJson size={20} className="text-amber-400" />, label: "Sample JSONs", bg: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20", onClick: () => setShowSampleModal(true) },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-95 ${item.bg}`}
              >
                {item.icon}
                <span className="text-sm font-medium text-zinc-300">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Knowledge Base..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
          </div>

          {recentFiles.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2 px-1">
                Recently Uploaded
              </p>
              <div className="flex gap-2 flex-wrap">
                {recentFiles.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-300"
                  >
                    <File size={12} />
                    <span className="max-w-[120px] truncate">{doc.name}</span>
                    <span className="text-violet-500">{doc.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drop Zone + Document List */}
          <div
            className={`flex-1 rounded-xl border-2 border-dashed transition-all duration-200 ${
              dragging ? "border-blue-500/50 bg-blue-500/5" : "border-zinc-800/60"
            }`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <FileText size={20} className="text-zinc-600" />
                </div>
                <div className="text-center">
                  <p className="text-zinc-400 font-medium">No documents found</p>
                  <p className="text-zinc-600 text-sm mt-1">
                    Drop files here or click "Add Files" above
                  </p>
                  <p className="text-zinc-700 text-xs mt-1">
                    Supports PDF, DOC, TXT, CSV, JSON, XLSX, images
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-1">
                {filtered.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-zinc-900/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      {typeIcon(doc.type)}
                      <div>
                        <p className="text-sm text-zinc-300 font-medium">{doc.name}</p>
                        <p className="text-xs text-zinc-600">{doc.createdAt}{doc.size ? ` · ${doc.size}` : ""}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeDoc(doc.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="*/*"
            className="hidden"
            onChange={e => {
              handleFiles(e.target.files);
              setShowUploadModal(false);
            }}
          />

          {showUploadModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h2 className="text-base font-semibold text-zinc-100 mb-1">Upload Files</h2>
                <p className="text-xs text-zinc-500 mb-5">Select files from your computer to add to the knowledge base</p>

                {/* Drag & Drop zone inside modal */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                    dragging
                      ? 'border-violet-500/70 bg-violet-500/10'
                      : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30'
                  }`}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragging(false);
                    handleFiles(e.dataTransfer.files);
                    setShowUploadModal(false);
                  }}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={28} className="text-zinc-500 mx-auto mb-3" />
                  <p className="text-sm text-zinc-300 font-medium mb-1">
                    Click to browse or drag files here
                  </p>
                  <p className="text-xs text-zinc-600">
                    Supports PDF, DOC, TXT, CSV, JSON, XLSX, images and more
                  </p>
                </div>

                {/* Recently uploaded in modal */}
                {recentFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2">
                      Recently Uploaded
                    </p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {recentFiles.map(doc => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg"
                        >
                          <File size={13} className="text-violet-400 shrink-0" />
                          <span className="text-xs text-zinc-300 truncate flex-1">{doc.name}</span>
                          <span className="text-xs text-zinc-600 shrink-0">{doc.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end mt-5">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Upload size={14} />
                    Browse Files
                  </button>
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
                      <input
                        value={dbConfig.host}
                        onChange={e => setDbConfig(prev => ({ ...prev, host: e.target.value }))}
                        placeholder="localhost"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Port</label>
                      <input
                        value={dbConfig.port}
                        onChange={e => setDbConfig(prev => ({ ...prev, port: e.target.value }))}
                        placeholder="5432"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Database Name</label>
                    <input
                      value={dbConfig.name}
                      onChange={e => setDbConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="my_database"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Username</label>
                    <input
                      value={dbConfig.user}
                      onChange={e => setDbConfig(prev => ({ ...prev, user: e.target.value }))}
                      placeholder="postgres"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Password</label>
                    <input
                      type="password"
                      value={dbConfig.password}
                      onChange={e => setDbConfig(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-5">
                  <button 
                    onClick={() => setShowDbModal(false)} 
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!dbConfig.host || !dbConfig.name) return;
                      addDoc({ name: `DB: ${dbConfig.name} @ ${dbConfig.host}`, type: "url" });
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

          {showSampleModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
                <h2 className="text-base font-semibold text-zinc-100 mb-1">Sample JSON Templates</h2>
                <p className="text-xs text-zinc-500 mb-5">Pre-built grievance data templates — click to add to knowledge base</p>

                <div className="space-y-4">
                  {[
                    {
                      title: "Water Supply Grievance",
                      tag: "Infrastructure",
                      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                      json: {
                        grievance_id: "GRS-2024-001",
                        category: "Water Supply",
                        severity: "High",
                        citizen_name: "Ramesh Kumar",
                        location: "Ward 12, Block B",
                        description: "No water supply for the past 5 days in our area. Multiple complaints filed but no action taken.",
                        status: "Pending",
                        filed_date: "2024-03-15",
                        expected_resolution: "2024-03-22",
                        assigned_officer: "Water Department",
                        contact: "9876543210"
                      }
                    },
                    {
                      title: "Road Damage Grievance",
                      tag: "Public Works",
                      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                      json: {
                        grievance_id: "GRS-2024-002",
                        category: "Road & Infrastructure",
                        severity: "Medium",
                        citizen_name: "Priya Sharma",
                        location: "Main Street, Sector 4",
                        description: "Large potholes on main road causing accidents. Two-wheelers have fallen multiple times.",
                        status: "In Progress",
                        filed_date: "2024-03-10",
                        expected_resolution: "2024-03-25",
                        assigned_officer: "PWD Department",
                        contact: "9123456789"
                      }
                    },
                    {
                      title: "Electricity Outage Grievance",
                      tag: "Utilities",
                      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                      json: {
                        grievance_id: "GRS-2024-003",
                        category: "Electricity",
                        severity: "Critical",
                        citizen_name: "Suresh Patel",
                        location: "Colony 7, Near School",
                        description: "Frequent power cuts lasting 8-10 hours daily. Affecting students and medical equipment at home.",
                        status: "Escalated",
                        filed_date: "2024-03-12",
                        expected_resolution: "2024-03-18",
                        assigned_officer: "Electricity Board",
                        contact: "9988776655"
                      }
                    }
                  ].map((sample, i) => (
                    <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileJson size={16} className="text-amber-400" />
                          <span className="text-sm font-medium text-zinc-200">{sample.title}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sample.color}`}>
                            {sample.tag}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            addDoc({
                              name: `${sample.title}.json`,
                              type: "file",
                              size: `${JSON.stringify(sample.json, null, 2).length} B`
                            });
                            setShowSampleModal(false);
                          }}
                          className="text-xs px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
                        >
                          + Add to KB
                        </button>
                      </div>
                      <pre className="text-xs text-zinc-400 bg-zinc-900 rounded-lg p-3 overflow-x-auto max-h-40 overflow-y-auto border border-zinc-800">
                        {JSON.stringify(sample.json, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-5">
                  <button
                    onClick={() => setShowSampleModal(false)}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Close
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
