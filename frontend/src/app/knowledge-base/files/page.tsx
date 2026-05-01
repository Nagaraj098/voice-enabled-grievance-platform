"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const API_BASE = "http://localhost:8000";

type Doc = {
  id: string;
  name: string;
  filename?: string;
  url?: string;
  file_url?: string;
  type: "url" | "file" | "json" | "db";
  size?: string | number;
  category?: string;
  policies_count?: number;
  createdAt: string;
  created_at?: string;
  uploadedAt?: string;
  source: "local" | "backend";
};

const Icons = {
  ArrowLeft: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>,
  Refresh: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
  Eye: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  Edit: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>,
  Download: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  File: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>,
  FileText: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  Braces: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" /><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" /></svg>,
  Table: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>,
};

export default function KnowledgeBaseFilesPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFileCategory, setActiveFileCategory] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Record<string, boolean>>({});
  const [deleteErrorById, setDeleteErrorById] = useState<Record<string, string>>({});

  const getFileType = (filename?: string) => {
    if (!filename) return "unknown";
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (ext === "json") return "json";
    if (ext === "txt") return "text";
    if (ext === "csv") return "csv";
    if (ext === "pdf") return "pdf";
    if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "image";
    return "unknown";
  };

  const formatSize = (size?: string | number) => {
    if (size === undefined || size === null) return "—";
    if (typeof size === "string" && /[a-zA-Z]/.test(size)) return size;
    const bytes = typeof size === "string" ? parseInt(size, 10) : size;
    if (isNaN(bytes) || bytes === 0) return "—";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileUrl = (file: Doc) => {
    return file.url || file.file_url || `${API_BASE}/knowledge/${file.filename || file.id}`;
  };

  const getDisplayDate = (file: Doc) => {
    const rawDate = file.created_at || file.uploadedAt || file.createdAt;
    return new Date(rawDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getFileTypeMeta = (fileType: string) => {
    if (fileType === "json") {
      return { label: "JSON", badgeClass: "text-muted-foreground bg-muted border-border", icon: <Icons.Braces /> };
    }
    if (fileType === "pdf") {
      return { label: "PDF", badgeClass: "text-muted-foreground bg-muted border-border", icon: <Icons.FileText /> };
    }
    if (fileType === "text") {
      return { label: "TXT", badgeClass: "text-muted-foreground bg-muted border-border", icon: <Icons.FileText /> };
    }
    if (fileType === "csv") {
      return { label: "CSV", badgeClass: "text-muted-foreground bg-muted border-border", icon: <Icons.Table /> };
    }
    return {
      label: fileType === "unknown" ? "OTHER" : fileType.toUpperCase(),
      badgeClass: "text-muted-foreground bg-muted border-border",
      icon: <Icons.File />,
    };
  };

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
        size: f.size,
        category: f.category,
        policies_count: f.policies_count,
        created_at: f.created_at || f.uploadedAt,
        createdAt: new Date().toLocaleDateString(),
        source: "backend",
      }));
      setDocs(backendDocs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const tabs = useMemo(() => {
    const getCount = (cat: string) => {
      if (cat === "All") return docs.length;
      return docs.filter((d) => {
        const type = getFileType(d.filename);
        if (cat === "Other") return !["pdf", "json", "text", "csv"].includes(type);
        if (cat === "TXT") return type === "text";
        return type === cat.toLowerCase();
      }).length;
    };
    return ["All", "PDF", "JSON", "TXT", "CSV", "Other"].map((cat) => ({
      id: cat,
      count: getCount(cat),
    }));
  }, [docs]);

  const filteredDocs = useMemo(() => {
    return docs.filter((d) => {
      if (activeFileCategory === "All") return true;
      const type = getFileType(d.filename);
      if (activeFileCategory === "Other") return !["pdf", "json", "text", "csv"].includes(type);
      if (activeFileCategory === "TXT") return type === "text";
      return type === activeFileCategory.toLowerCase();
    });
  }, [docs, activeFileCategory]);

  const handleDelete = async (file: Doc) => {
    setDeleteErrorById((prev) => ({ ...prev, [file.id]: "" }));
    setDeletingId(file.id);
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(file.id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setRemovingIds((prev) => ({ ...prev, [file.id]: true }));
      setTimeout(() => {
        setDocs((prev) => prev.filter((d) => d.id !== file.id));
        setRemovingIds((prev) => {
          const next = { ...prev };
          delete next[file.id];
          return next;
        });
        setConfirmDeleteId((curr) => (curr === file.id ? null : curr));
      }, 300);
    } catch {
      setDeleteErrorById((prev) => ({ ...prev, [file.id]: "Delete failed. Try again." }));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar activePage="knowledge-base" />
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-background rounded-tl-2xl border-l border-t border-border/60 mt-2 ml-2 p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Go back"
                >
                  <Icons.ArrowLeft />
                </button>
                <h1 className="text-2xl font-semibold text-foreground">Uploaded Files</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-2">All files uploaded to the knowledge base</p>
            </div>
            <button
              onClick={fetchDocs}
              disabled={loading}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-border transition-all"
              aria-label="Refresh files"
            >
              <span className={loading ? "animate-spin inline-block" : ""}><Icons.Refresh /></span>
            </button>
          </div>

          <div className="flex border-b border-border w-full mb-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFileCategory(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeFileCategory === tab.id ? "text-foreground border-primary -mb-px" : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {tab.id} ({tab.count})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="h-[50vh] flex items-center justify-center text-muted-foreground text-sm">Loading files...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground">
                <Icons.File />
              </div>
              <p className="text-muted-foreground font-medium">No files found</p>
            </div>
          ) : (
            <div>
              {filteredDocs.map((file) => {
                const type = getFileType(file.filename || file.name);
                const typeMeta = getFileTypeMeta(type);
                const fileUrl = `${API_BASE}/knowledge/${file.filename || file.id}`;
                const displayName = file.filename || file.name;
                const displayDate = getDisplayDate(file);
                return (
                  <div
                    key={file.id}
                    className={`rounded-xl px-6 py-4 mb-3 transition-opacity duration-300 ${
                      removingIds[file.id] ? "opacity-0" : "opacity-100"
                    } ${
                      confirmDeleteId === file.id
                        ? "bg-muted border border-primary"
                        : "bg-card border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-background border border-border text-muted-foreground flex-shrink-0">
                          {typeMeta.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{displayName}</p>
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium tracking-wider ${typeMeta.badgeClass}`}>
                              {typeMeta.label}
                            </span>
                            <span>{formatSize(file.size)}</span>
                            <span>• {displayDate}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/knowledge-base/preview?file=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(displayName)}&type=${type}&size=${encodeURIComponent(formatSize(file.size))}&date=${encodeURIComponent(displayDate)}`, "_blank");
                          }}
                          className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                        >
                          <Icons.Eye /> Preview
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/knowledge-base/files/edit?file=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(displayName)}&type=${type}&id=${encodeURIComponent(file.id)}`);
                          }}
                          className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                        >
                          <Icons.Edit /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const a = document.createElement("a");
                            a.href = fileUrl;
                            a.download = displayName;
                            a.target = "_blank";
                            a.click();
                          }}
                          className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                        >
                          <Icons.Download /> Download
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteErrorById((prev) => ({ ...prev, [file.id]: "" }));
                            setConfirmDeleteId((prev) => (prev === file.id ? null : file.id));
                          }}
                          title="Delete"
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {confirmDeleteId === file.id && (
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-foreground">Delete {displayName}? This cannot be undone.</p>
                          {deleteErrorById[file.id] && (
                            <p className="text-sm text-foreground mt-1">{deleteErrorById[file.id]}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                              setDeleteErrorById((prev) => ({ ...prev, [file.id]: "" }));
                            }}
                            className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(file);
                            }}
                            disabled={deletingId === file.id}
                            className="px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm disabled:opacity-50"
                          >
                            {deletingId === file.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
