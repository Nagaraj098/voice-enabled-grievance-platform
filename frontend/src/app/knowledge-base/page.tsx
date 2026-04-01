"use client";
import { useState, useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Globe, FileText, Search, X, File, Upload, Database } from "lucide-react";

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

  const addDoc = (doc: Omit<Doc, "id" | "createdAt">) => {
    setDocs(prev => [...prev, {
      ...doc,
      id: Math.random().toString(36).slice(2),
      createdAt: new Date().toLocaleDateString()
    }]);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      addDoc({
        name: file.name,
        type: "file",
        size: (file.size / 1024).toFixed(1) + " KB"
      });
    });
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {[
              { icon: <Globe size={20} className="text-blue-400" />, label: "Add URL", bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20", onClick: () => setShowUrlModal(true) },
              { icon: <Upload size={20} className="text-violet-400" />, label: "Add Files", bg: "bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20", onClick: () => fileRef.current?.click() },
              { icon: <Database size={20} className="text-emerald-400" />, label: "Connect to DB", bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20", onClick: () => setShowDbModal(true) },
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
                  <p className="text-zinc-600 text-sm mt-1">Drop files here or use the buttons above</p>
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
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

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

        </main>
      </div>
    </div>
  );
}
