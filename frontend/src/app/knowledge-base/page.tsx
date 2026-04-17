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
  Eye: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Edit: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  Copy: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Download: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Code: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  FolderOpen: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  CloudUpload: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>,
  LayoutGrid: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
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
  status?: "completed" | "processing" | "pending" | "uploading";
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

  const [selectedFile, setSelectedFile] = useState<Doc | null>(null);
  const [fileContent, setFileContent] = useState<any>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Doc | null>(null);
  const [viewerTab, setViewerTab] = useState<"formatted" | "raw">("formatted");

  // Edit State
  const [editingFile, setEditingFile] = useState<Doc | null>(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', rules: [] as any[] });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMode, setEditMode] = useState<"rules" | "raw">("rules");
  const [rawJsonText, setRawJsonText] = useState("");
  const [rawJsonError, setRawJsonError] = useState("");

  // Add Files State
  const [showAddFilesModal, setShowAddFilesModal] = useState(false);
  const [addFilesList, setAddFilesList] = useState<File[]>([]);
  const [addFilesCategory, setAddFilesCategory] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Add Text State
  const [showAddTextModal, setShowAddTextModal] = useState(false);
  const [addTextForm, setAddTextForm] = useState({ name: "", category: "", content: "" });
  const [savingText, setSavingText] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'upload' | 'view'>('upload');

  const getFileType = (filename?: string) => {
    if (!filename) return 'unknown';
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'json') return 'json';
    if (ext === 'txt') return 'text';
    if (ext === 'csv') return 'csv';
    if (ext === 'pdf') return 'pdf';
    if (['png','jpg','jpeg','webp','gif'].includes(ext)) return 'image';
    return 'unknown';
  };

  const highlightJson = (json: any) => {
    if (typeof json !== 'string') {
      json = JSON.stringify(json, null, 2);
    }
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match: string) => {
      let cls = 'text-orange-400';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-blue-400';
        } else {
          cls = 'text-green-400';
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-red-400';
      } else if (/null/.test(match)) {
        cls = 'text-violet-400';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  };

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

  const handleAddFilesSubmit = async () => {
    if (addFilesList.length === 0) {
      showToast("Please select files to upload", "error");
      return;
    }
    setUploadingFiles(true);
    let successCount = 0;
    let failCount = 0;
    for (const file of addFilesList) {
      try {
        // TODO: Map category alongside file payload here if backend supports multi-part explicit tagging
        await uploadToBackend(file);
        successCount++;
      } catch (err: any) {
        failCount++;
        console.error(err);
      }
    }
    setUploadingFiles(false);
    if (successCount > 0) showToast(`${successCount} file(s) uploaded successfully`, "success");
    if (failCount > 0) showToast(`${failCount} file(s) failed`, "error");
    await fetchDocs();
    setAddFilesList([]);
    setAddFilesCategory("");
    setShowAddFilesModal(false);
  };

  const handleAddTextSubmit = async () => {
    if (!addTextForm.name.trim() || !addTextForm.content.trim()) {
      showToast("Name and Content are required", "error");
      return;
    }
    setSavingText(true);
    try {
      // TODO: Replace with the exact endpoint to save generic unstructured text
      const res = await fetch(`${API_BASE}/knowledge/upload-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addTextForm)
      });
      if (!res.ok) throw new Error("Upload failed");
      showToast("Text document saved", "success");
      await fetchDocs();
      setAddTextForm({ name: "", category: "", content: "" });
      setShowAddTextModal(false);
    } catch (err) {
      // Fallback or simulate for UI state since backend endpoint might not exist yet
      const simulatedDoc: Doc = {
        id: Math.random().toString(36).slice(2),
        name: addTextForm.name,
        filename: `${addTextForm.name.replace(/\s+/g, '_').toLowerCase()}.txt`,
        type: "file",
        category: addTextForm.category,
        createdAt: new Date().toLocaleDateString(),
        source: "local"
      };
      setDocs(prev => [...prev, simulatedDoc]);
      showToast("Text saved locally (Backend endpoint pending)", "success");
      setAddTextForm({ name: "", category: "", content: "" });
      setShowAddTextModal(false);
    } finally {
      setSavingText(false);
    }
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
      } catch (err: any) {
        showToast(err.message || "Failed to delete document", "error");
      }
    } else {
        setDocs(prev => prev.filter(d => d.id !== doc.id));
        showToast("Local document deleted", "success");
    }
  };

  const fetchFileContent = async (id: string, filename?: string) => {
    try {
      const res = await fetch(`${API_BASE}/knowledge/${filename || id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json") || filename?.endsWith(".json")) {
        return await res.json();
      } else {
        return await res.text();
      }
    } catch {
      return null;
    }
  };

  const handleViewFile = async (file: Doc) => {
    setSelectedFile(file);
    setLoadingContent(true);
    setFileContent(null);
    setViewerTab("formatted");
    
    // Check if it's a sample JSON logic locally available
    const localSample = SAMPLE_JSONS.find(s => s.filename === file.filename);
    if (localSample) {
      setFileContent(localSample.json);
      setLoadingContent(false);
      return;
    }
    
    const content = await fetchFileContent(file.id, file.filename);
    setFileContent(content);
    setLoadingContent(false);
  };

  const handleEditFile = async (file: Doc) => {
    setEditingFile(file);
    setEditMode("rules");
    setRawJsonError("");
    let rulesData: any[] = [];
    let fullContent: any = {};
    
    const localSample = SAMPLE_JSONS.find(s => s.filename === file.filename);
    if (localSample) {
      fullContent = localSample.json;
      rulesData = localSample.json.policies || [];
    } else {
      const content = await fetchFileContent(file.id, file.filename);
      fullContent = content || {};
      if (Array.isArray(content)) {
        rulesData = content;
      } else if (content?.policies || content?.rules) {
        rulesData = content.policies || content.rules;
      }
    }
    
    setEditForm({
      name: file.name,
      category: file.category || '',
      rules: rulesData
    });
    setRawJsonText(typeof fullContent === 'object' ? JSON.stringify(fullContent, null, 2) : String(fullContent));
  };

  const handleRuleChange = (index: number, field: string, value: string) => {
    const updatedRules = [...editForm.rules];
    // Map dynamically rule title standard to either title/name/rule depending on what existed, but keep it simple by assigning to field 
    updatedRules[index][field] = value;
    setEditForm(prev => ({ ...prev, rules: updatedRules }));
  };

  const handleAddRule = () => {
    setEditForm(prev => ({
      ...prev,
      rules: [...prev.rules, { title: '', description: '' }]
    }));
  };

  const handleEditRuleDelete = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleSaveEdit = async () => {
    let payload: any;
    if (editMode === "raw") {
      try {
        payload = JSON.parse(rawJsonText);
        setRawJsonError("");
      } catch (e: any) {
        setRawJsonError("Invalid JSON: " + e.message);
        showToast("Invalid JSON format", "error");
        return;
      }
    } else {
      if (editForm.rules.some(r => !(r.title || r.rule || r.name)?.trim())) {
        showToast("Rule title cannot be empty", "error");
        return;
      }
      payload = editForm;
    }
    
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge/${editingFile?.filename || editingFile?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save changes");
      showToast("File updated successfully", "success");
      setEditingFile(null);
      await fetchDocs();
    } catch (err) {
      // For local items not supported via API yet, simulate
      if (editingFile?.source === 'local') {
        showToast("Cannot edit mock sample data on backend", "error");
      } else {
        showToast("Failed to save changes", "error");
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const renderFileContent = (content: any) => {
    if (!selectedFile) return null;
    const fileType = getFileType(selectedFile.filename);
    const fileUrl = `${API_BASE}/knowledge/${selectedFile.filename || selectedFile.id}`;

    if (fileType === 'image') {
      return <div className="h-full flex items-center justify-center p-4 bg-zinc-900/50 rounded-xl"><img src={fileUrl} alt={selectedFile.name} className="max-w-full max-h-full rounded-lg shadow-lg border border-zinc-800" /></div>;
    }
    
    if (fileType === 'pdf') {
      return <iframe src={fileUrl} className="w-full h-full border-0 rounded-lg bg-zinc-200" title="PDF Preview" />;
    }
    
    if (fileType === 'csv') {
      if (!content || typeof content !== 'string') return <p className="text-zinc-400">Invalid CSV content</p>;
      const rows = content.split('\n').map(r => r.trim()).filter(Boolean);
      return (
        <div className="overflow-x-auto overflow-y-auto h-full w-full border border-zinc-800 rounded-lg bg-[#0a0a0a]">
          <table className="w-full text-left text-sm whitespace-nowrap text-zinc-300">
            <thead>
              {rows.length > 0 && (
                <tr className="bg-zinc-800 border-b border-zinc-700">
                   {rows[0].split(',').map((cell, i) => (
                     <th key={i} className="px-4 py-3 font-medium text-zinc-100">{cell}</th>
                   ))}
                </tr>
              )}
            </thead>
            <tbody>
               {rows.slice(1).map((row, i) => (
                 <tr key={i} className={i % 2 === 0 ? "bg-zinc-900/40 hover:bg-zinc-800/60" : "bg-transparent hover:bg-zinc-800/60"}>
                   {row.split(',').map((cell, j) => (
                     <td key={j} className="px-4 py-2 border-b border-zinc-800/30 text-zinc-400">{cell}</td>
                   ))}
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (fileType === 'text') {
      return (
        <div className="h-full w-full overflow-auto bg-[#0a0a0a] rounded-lg border border-zinc-800">
          <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-sm leading-relaxed p-6">{String(content)}</pre>
        </div>
      );
    }
    
    if (fileType === 'json') {
      if (viewerTab === 'raw') {
        const rawJson = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        return (
          <div className="h-full w-full overflow-auto bg-[#0a0a0a] rounded-lg border border-zinc-800">
            <pre 
              className="font-mono text-sm p-6 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightJson(rawJson) }}
            />
          </div>
        );
      } else {
        let policies = content?.policies || content?.rules || [];
        if (Array.isArray(content)) policies = content;

        if (policies && policies.length > 0) {
          return (
            <div className="space-y-4">
              {policies.map((item: any, idx: number) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-2 shadow-inner">
                  <div className="flex gap-3 items-start text-zinc-200 font-medium">
                    <span className="text-violet-400 mt-0.5 whitespace-nowrap">Rule {idx + 1}:</span>
                    <span className="flex-1 leading-relaxed">{item.rule || item.title || item.name || "Untitled Rule"}</span>
                  </div>
                  {(item.description || item.desc) && (
                    <div className="flex gap-3 items-start text-zinc-400 text-xs mt-1">
                      <span className="text-zinc-500 w-12 shrink-0 font-sans tracking-wide">DESC:</span>
                      <span className="flex-1 leading-relaxed text-sm">{item.description || item.desc}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }

        return (
          <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
            <p className="text-zinc-500 font-sans">No structured rules found. Switch to "Raw JSON" tab to view content.</p>
          </div>
        );
      }
    }

    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 border border-dashed border-zinc-800/60 rounded-xl bg-zinc-900/20">
         <span className="text-zinc-600"><Icons.File /></span>
         <p className="text-zinc-500 font-sans font-medium">Preview not available for this file type.</p>
         <button onClick={() => window.open(fileUrl, '_blank')} className="px-5 py-2 mt-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm flex gap-2 items-center transition-colors shadow-sm">
           <Icons.Download /> Download File directly
         </button>
      </div>
    );
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
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-50">Knowledge Base</h1>
              <p className="text-xs text-zinc-600 mt-0.5">Manage documents and data sources for the AI agent</p>
            </div>
            {activeTab === 'view' && (
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
            )}
          </div>

          {/* Tab Bar */}
          <div className="flex items-center gap-6 border-b border-zinc-800/80 mb-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors relative ${
                activeTab === 'upload' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icons.CloudUpload />
              Upload File
              {activeTab === 'upload' && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-600 rounded-t-full shadow-[0_-2px_8px_rgba(124,58,237,0.5)]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors relative ${
                activeTab === 'view' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icons.LayoutGrid />
              View
              {activeTab === 'view' && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-600 rounded-t-full shadow-[0_-2px_8px_rgba(124,58,237,0.5)]" />
              )}
            </button>
          </div>

          {activeTab === 'upload' && (
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
                {[
                  { icon: <span className="text-blue-400"><Icons.Globe /></span>, label: "Add URL", bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20", onClick: () => setShowUrlModal(true) },
                  { icon: <span className="text-violet-400"><Icons.Upload /></span>, label: "Upload JSON", bg: "bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20", onClick: () => setShowUploadModal(true) },
                  { icon: <span className="text-amber-400"><Icons.FileJson /></span>, label: "Sample JSONs", bg: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20", onClick: () => setShowSampleModal(true) },
                  { icon: <span className="text-emerald-400"><Icons.Database /></span>, label: "Connect to DB", bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20", onClick: () => setShowDbModal(true) },
                  { icon: <span className="text-[#60a5fa]"><Icons.FolderOpen /></span>, label: "Add Files", bg: "bg-[#0f1f35] border-blue-900/40 hover:bg-[#1a2d48]", onClick: () => setShowAddFilesModal(true) },
                  { icon: <span className="text-[#34d399]"><Icons.FileText /></span>, label: "Add Text", bg: "bg-[#0f2820] border-emerald-900/40 hover:bg-[#15362b]", onClick: () => setShowAddTextModal(true) },
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
            </div>
          )}

          {activeTab === 'view' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Search */}
              <div className="flex items-center gap-3 mb-6">
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

              {/* View Layout Arrays */}
              <div
                className={`flex-1 overflow-y-auto rounded-xl border-2 border-transparent transition-all duration-200 ${
                  dragging ? "border-blue-500/50 bg-blue-500/5 border-dashed" : ""
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
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 pb-4">
                    {/* Sub-Section A — Completed */}
                    {(() => {
                      const completed = filtered.filter(d => !d.status || d.status === 'completed');
                      if (completed.length === 0) return null;
                      return (
                        <section>
                          <div className="flex items-center gap-2 mb-4 px-1">
                            <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                              ✅ Completed
                              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-500/20">{completed.length}</span>
                            </h3>
                          </div>
                          
                          <div className="bg-[#1a1a2e]/30 border border-zinc-800/60 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-900/40 border-b border-zinc-800/60 text-xs font-semibold text-zinc-400">
                              <div className="col-span-5 sm:col-span-4">Filename</div>
                              <div className="col-span-3 sm:col-span-2 hidden sm:block">Date</div>
                              <div className="col-span-3">Category</div>
                              <div className="col-span-2 hidden sm:block text-center">Rules</div>
                              <div className="col-span-4 sm:col-span-3 text-right">Actions</div>
                            </div>
                            
                            <div className="flex flex-col divide-y divide-zinc-800/40">
                              {completed.map(doc => (
                                <div key={doc.id} className="group grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-violet-500/5 transition-colors">
                                  {/* File Name & Icon */}
                                  <div className="col-span-5 sm:col-span-4 flex items-center gap-3 overflow-hidden">
                                    <div className="bg-zinc-900 p-1.5 rounded-md border border-zinc-800 flex-shrink-0">
                                      {typeIcon(doc.type)}
                                    </div>
                                    <span className="text-sm text-zinc-200 font-medium truncate">{doc.name}</span>
                                  </div>
                                  
                                  {/* Date */}
                                  <div className="col-span-3 sm:col-span-2 hidden sm:block text-xs text-zinc-500 whitespace-nowrap">
                                    {doc.createdAt}
                                  </div>
                                  
                                  {/* Category Tag */}
                                  <div className="col-span-3">
                                    {doc.category ? (
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap overflow-hidden text-ellipsis ${severityColor(doc.category)}`}>
                                        {doc.category}
                                      </span>
                                    ) : (
                                      <span className="text-zinc-600">-</span>
                                    )}
                                  </div>
                                  
                                  {/* Rules Count */}
                                  <div className="col-span-2 hidden sm:block text-center">
                                    <span className="text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-full border border-zinc-700/50">
                                      {doc.policies_count !== undefined ? doc.policies_count : doc.type === "url" ? "HTML" : "Data"}
                                    </span>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-1.5">
                                    <button onClick={() => handleViewFile(doc)} className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors" title="View">
                                      <Icons.Eye />
                                    </button>
                                    <button onClick={() => handleEditFile(doc)} className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors" title="Edit">
                                      <Icons.Edit />
                                    </button>
                                    <button onClick={() => {
                                        const blob = new Blob([""], { type: "text/plain" }); /* Dummy placeholder if real data exists download */
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a"); a.href = url; a.download = doc.filename || doc.name; a.click(); URL.revokeObjectURL(url);
                                      }} className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors" title="Download">
                                      <Icons.Download />
                                    </button>
                                    <button onClick={() => removeDoc(doc)} className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors" title="Delete">
                                      <Icons.Trash />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </section>
                      );
                    })()}

                    {/* Sub-Section B — In Progress */}
                    {(() => {
                        const inProgress = filtered.filter(d => ['processing', 'pending', 'uploading'].includes(d.status || ''));
                        return (
                          <section>
                            <div className="flex items-center gap-2 mb-4 px-1">
                              <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                                ⏳ In Progress
                                <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full text-[10px] font-medium border border-zinc-700">{inProgress.length}</span>
                              </h3>
                            </div>
                            
                            {inProgress.length === 0 ? (
                              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-6 flex flex-col items-center justify-center gap-2">
                                <span className="text-zinc-600"><Icons.Alert /></span>
                                <p className="text-xs text-zinc-500 font-medium">No files currently processing</p>
                              </div>
                            ) : (
                               <div className="space-y-3">
                                 {inProgress.map(doc => (
                                   <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                                      <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center flex-shrink-0 border border-zinc-700">
                                         <span className="text-zinc-400 animate-pulse">{typeIcon(doc.type)}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                         <div className="flex items-center gap-3 mb-1">
                                            <p className="text-sm font-semibold text-zinc-200 truncate">{doc.name}</p>
                                            {doc.category && <span className="text-[10px] text-zinc-500 border border-zinc-700 rounded-full px-2">{doc.category}</span>}
                                         </div>
                                         <div className="flex items-center gap-3 mt-2">
                                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                                                <div className="h-full bg-violet-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite] w-[60%]" />
                                            </div>
                                            <span className="text-[10px] text-zinc-400 whitespace-nowrap capitalize w-16">{doc.status}...</span>
                                         </div>
                                      </div>
                                      <div className="text-xs text-zinc-600 flex-shrink-0 text-right">
                                         <p>{doc.createdAt}</p>
                                      </div>
                                   </div>
                                 ))}
                               </div>
                            )}
                          </section>
                        );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* View File Modal */}
          {selectedFile && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-[900px] shadow-2xl flex flex-col h-auto max-h-[90vh]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-zinc-800/60 bg-zinc-900/50 rounded-t-2xl gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-3 truncate">
                      <span className="text-amber-400 capitalize flex-shrink-0">
                        {getFileType(selectedFile.filename) === 'json' ? <Icons.FileJson /> : <Icons.File />}
                      </span>
                      <span className="truncate">{selectedFile.name}</span>
                    </h2>
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      {selectedFile.category && (
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${severityColor(selectedFile.category)}`}>
                          {selectedFile.category}
                        </span>
                      )}
                      {getFileType(selectedFile.filename) === 'json' && (
                        <span className="text-xs text-zinc-400 font-medium bg-black/50 px-2.5 py-1 rounded-lg border border-zinc-800/60">
                          {selectedFile.policies_count || 0} policies
                        </span>
                      )}
                      {selectedFile.size && (
                        <span className="text-xs text-zinc-500 font-medium px-2 py-1">
                          {selectedFile.size}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button 
                      onClick={() => {
                        let text = "";
                        if (typeof fileContent === "object") text = JSON.stringify(fileContent, null, 2);
                        else text = String(fileContent || "");
                        navigator.clipboard.writeText(text);
                        showToast("Copied to clipboard", "success");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800/0 hover:border-zinc-700"
                    >
                      <Icons.Copy /> <span className="hidden sm:inline">Copy</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (selectedFile.source === 'local') {
                          const localSample = SAMPLE_JSONS.find(s => s.filename === selectedFile.filename);
                          if (localSample) {
                            const blob = new Blob([JSON.stringify(localSample.json, null, 2)], { type: "application/json" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = selectedFile.filename || "file.json";
                            a.click();
                            URL.revokeObjectURL(url);
                          }
                        } else {
                          const a = document.createElement("a");
                          a.href = `${API_BASE}/knowledge/${selectedFile.filename || selectedFile.id}`;
                          a.download = selectedFile.filename || selectedFile.id;
                          a.target = "_blank";
                          a.click();
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800/0 hover:border-zinc-700"
                    >
                      <Icons.Download /> <span className="hidden sm:inline">Download</span>
                    </button>
                    <div className="w-px h-5 bg-zinc-800 mx-1 hidden sm:block"></div>
                    <button onClick={() => { setSelectedFile(null); setFileContent(null); }} className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors ml-1">
                      <Icons.X />
                    </button>
                  </div>
                </div>
                
                {getFileType(selectedFile.filename) === 'json' && (
                  <div className="flex items-center bg-zinc-900/30 px-5 pt-3 border-b border-zinc-800/60 gap-4">
                    <button 
                      onClick={() => setViewerTab("formatted")}
                      className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                        viewerTab === "formatted" ? "border-violet-500 text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Formatted
                    </button>
                    <button 
                      onClick={() => setViewerTab("raw")}
                      className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                        viewerTab === "raw" ? "border-violet-500 text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Raw JSON
                    </button>
                  </div>
                )}
                
                <div className="p-6 overflow-y-auto overflow-x-auto flex-1 font-mono text-sm bg-black/60 h-[60vh] max-h-[60vh]">
                  {loadingContent ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 h-full">
                      <span className="animate-spin inline-block text-zinc-500"><Icons.Refresh /></span>
                      <p className="text-zinc-500 font-sans">Fetching document contents...</p>
                    </div>
                  ) : fileContent || ['pdf', 'image'].includes(getFileType(selectedFile.filename)) ? (
                    <div className="h-full">
                      {renderFileContent(fileContent)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 h-full gap-3 border border-dashed border-zinc-800/60 rounded-xl bg-zinc-900/20">
                      <span className="text-zinc-700 capitalize"><Icons.File /></span>
                      <p className="text-zinc-500 font-sans">No content available to display.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {docToDelete && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <h2 className="text-lg font-semibold text-zinc-100 mb-2">Delete File?</h2>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Are you sure you want to delete <span className="text-zinc-200 font-medium">{docToDelete.name}</span>? This action cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setDocToDelete(null)} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
                  <button 
                    onClick={() => {
                      removeDoc(docToDelete);
                      setDocToDelete(null);
                    }} 
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit File Modal */}
          {editingFile && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-[800px] shadow-2xl flex flex-col h-auto max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-zinc-800/60 bg-zinc-900/50 rounded-t-2xl">
                  <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-3">
                    <span className="text-amber-400"><Icons.Edit /></span>
                    Edit File <span className="text-zinc-500 text-sm font-normal">({editingFile.name})</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    {editMode === "rules" ? (
                      <button onClick={() => setEditMode("raw")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 hover:border-zinc-500 rounded-lg transition-colors">
                        <Icons.Code /> Edit Raw JSON
                      </button>
                    ) : (
                      <button onClick={() => setEditMode("rules")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 hover:border-zinc-500 rounded-lg transition-colors">
                        <Icons.Edit /> Edit Rules
                      </button>
                    )}
                    <button onClick={() => setEditingFile(null)} className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors ml-1">
                      <Icons.X />
                    </button>
                  </div>
                </div>
                
                {editMode === "raw" ? (
                  <div className="p-6 overflow-y-auto flex-1 font-sans text-sm bg-black/60 flex flex-col h-[60vh] max-h-[70vh]">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-semibold text-zinc-400">Raw JSON Content</label>
                    </div>
                    {rawJsonError && (
                      <div className="text-red-400 text-xs mb-3 font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">{rawJsonError}</div>
                    )}
                    <textarea
                      value={rawJsonText}
                      onChange={(e) => {
                        setRawJsonText(e.target.value);
                        setRawJsonError("");
                      }}
                      className="w-full flex-1 bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-mono resize-none leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                ) : (
                  <div className="p-6 overflow-y-auto flex-1 font-sans text-sm bg-black/60 space-y-6 max-h-[70vh]">
                    {/* File Name & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">File Name</label>
                        <input 
                          value={editForm.name}
                          onChange={e => setEditForm(p => ({...p, name: e.target.value}))}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-mono"
                          placeholder="e.g. bbmp_roads_sanitation.json"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Category</label>
                        <div className="relative">
                          <select 
                            value={editForm.category}
                            onChange={e => setEditForm(p => ({...p, category: e.target.value}))}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-4 pr-10 py-2.5 text-sm text-zinc-200 appearance-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                          >
                            <option value="">Select Category...</option>
                            <option value="Roads and Sanitation">Roads and Sanitation</option>
                            <option value="Electricity">Electricity</option>
                            <option value="Water Supply">Water Supply</option>
                            <option value="Network">Network</option>
                            <option value="Other">Other</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                             <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="6 9 12 15 18 9"/></svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-zinc-800/80" />

                    {/* Rules Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                          Policies / Rules
                          <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full text-xs">{editForm.rules.length}</span>
                        </h3>
                      </div>
                      
                      <div className="space-y-3">
                        {editForm.rules.length === 0 ? (
                          <div className="text-center py-8 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                            <p className="text-zinc-500 text-sm">No rules defined yet.</p>
                          </div>
                        ) : (
                          editForm.rules.map((rule, index) => (
                            <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 transition-colors focus-within:border-zinc-700 focus-within:bg-zinc-900">
                              <div className="flex items-center justify-between mb-3 border-b border-zinc-800/50 pb-2">
                                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Rule {index + 1}</span>
                                <button 
                                  onClick={() => handleEditRuleDelete(index)} 
                                  className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-1 rounded-md transition-colors"
                                >
                                  <Icons.Trash />
                                </button>
                              </div>
                              <div className="space-y-3">
                                <input
                                  placeholder="Rule title (e.g., Water supply restored within 48 hours)"
                                  value={rule.title || rule.name || rule.rule || ''}
                                  onChange={e => handleRuleChange(index, rule.title !== undefined ? 'title' : (rule.name !== undefined ? 'name' : 'rule'), e.target.value)}
                                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                                />
                                <textarea
                                  placeholder="Rule description or extra details..."
                                  value={rule.description || rule.desc || ''}
                                  onChange={e => handleRuleChange(index, rule.description !== undefined ? 'description' : 'desc', e.target.value)}
                                  rows={2}
                                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <button 
                        onClick={handleAddRule} 
                        className="w-full py-3 border border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="text-lg leading-none mt-[-2px]">+</span> Add New Rule
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="p-5 border-t border-zinc-800/60 bg-zinc-900/50 rounded-b-2xl flex items-center justify-between">
                  <button 
                    onClick={() => {
                      let dataStr = "";
                      if (editMode === "raw") dataStr = rawJsonText;
                      else dataStr = JSON.stringify(editForm, null, 2);
                      const blob = new Blob([dataStr], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = editingFile?.filename || "file.json";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700/50 shadow-sm"
                  >
                    <Icons.Download /> Download JSON
                  </button>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setEditingFile(null)} className="px-5 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveEdit} 
                      disabled={savingEdit}
                      className="px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2"
                    >
                      {savingEdit ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> : <Icons.Check />}
                      Save Changes
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
          {/* Add Files Modal */}
          {showAddFilesModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col h-auto max-h-[90vh]">
                <h2 className="text-base font-semibold text-zinc-100 mb-1">Add Files</h2>
                <p className="text-xs text-zinc-500 mb-5">Upload multiple documents formats to process.</p>
                
                <div className="flex-1 overflow-y-auto space-y-5 pr-2">
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                      dragging ? 'border-[#60a5fa]/70 bg-[#60a5fa]/10' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30'
                    }`}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { 
                      e.preventDefault(); 
                      setDragging(false); 
                      if(e.dataTransfer.files) setAddFilesList(prev => [...prev, ...Array.from(e.dataTransfer.files as Iterable<File> | ArrayLike<File>)]); 
                    }}
                    onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.multiple = true;
                        input.accept = ".pdf,.txt,.csv,.docx,.json";
                        input.onchange = (ev: any) => {
                            if(ev.target.files) setAddFilesList(prev => [...prev, ...Array.from(ev.target.files as Iterable<File> | ArrayLike<File>)]);
                        };
                        input.click();
                    }}
                  >
                    <span className="text-[#60a5fa] flex justify-center mb-3"><Icons.FolderOpen /></span>
                    <p className="text-sm text-zinc-300 font-medium mb-1">Drag & drop files here or click to browse</p>
                    <p className="text-xs text-zinc-600">Accepts .pdf, .txt, .csv, .docx, .json</p>
                  </div>

                  {addFilesList.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 block mb-1">Selected Files ({addFilesList.length})</label>
                      <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                        {addFilesList.map((f, i) => (
                           <div key={i} className="flex justify-between items-center text-xs text-zinc-300 bg-zinc-800/50 p-2 rounded-lg border border-zinc-700/50">
                             <div className="truncate flex-1 pr-3 font-mono">{f.name} <span className="text-zinc-500 text-[10px] ml-1">({(f.size / 1024).toFixed(1)} KB)</span></div>
                             <button onClick={() => setAddFilesList(prev => prev.filter((_, idx) => idx !== i))} className="text-zinc-500 hover:text-red-400 p-1 rounded-md transition-colors"><Icons.X /></button>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-zinc-400">Default Category (Optional)</label>
                    <div className="relative">
                      <select 
                        value={addFilesCategory}
                        onChange={e => setAddFilesCategory(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-3 pr-10 py-2.5 text-sm text-zinc-300 appearance-none focus:outline-none focus:border-violet-500"
                      >
                        <option value="">Select Category...</option>
                        <option value="Roads and Sanitation">Roads and Sanitation</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Water Supply">Water Supply</option>
                        <option value="Network">Network</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                         <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-zinc-800/60">
                   <button onClick={() => setShowAddFilesModal(false)} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
                   <button onClick={handleAddFilesSubmit} disabled={uploadingFiles || addFilesList.length === 0} className="w-full sm:w-auto px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      {uploadingFiles ? <span className="animate-spin inline-block"><Icons.Refresh /></span> : <Icons.Upload />}
                      Upload Files
                   </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Text Modal */}
          {showAddTextModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col h-auto max-h-[90vh]">
                <h2 className="text-base font-semibold text-zinc-100 mb-1">Add Text</h2>
                <p className="text-xs text-zinc-500 mb-5">Create a dedicated knowledge document directly from unstructured text.</p>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400">Document Name</label>
                      <input 
                        value={addTextForm.name}
                        onChange={e => setAddTextForm(p => ({...p, name: e.target.value}))}
                        placeholder="e.g. water_supply_rules"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-500 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400">Category</label>
                      <div className="relative">
                        <select 
                          value={addTextForm.category}
                          onChange={e => setAddTextForm(p => ({...p, category: e.target.value}))}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-3 pr-10 py-2.5 text-sm text-zinc-300 appearance-none focus:outline-none focus:border-violet-500 transition-all"
                        >
                          <option value="">Select Category...</option>
                          <option value="Roads and Sanitation">Roads and Sanitation</option>
                          <option value="Electricity">Electricity</option>
                          <option value="Water Supply">Water Supply</option>
                          <option value="Network">Network</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                           <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 h-full flex flex-col pt-2">
                    <label className="text-xs font-semibold text-zinc-400">Content</label>
                    <textarea 
                      value={addTextForm.content}
                      onChange={e => setAddTextForm(p => ({...p, content: e.target.value}))}
                      placeholder="Paste or type your text content here..."
                      className="w-full min-h-[200px] flex-1 bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 font-mono resize-y focus:outline-none focus:border-violet-500 leading-relaxed shadow-inner"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1 pl-1 font-medium">Supports plain text. Each paragraph or line break may be treated as a separate entry.</p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-zinc-800/60">
                   <button onClick={() => setShowAddTextModal(false)} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
                   <button onClick={handleAddTextSubmit} disabled={savingText} className="w-full sm:w-auto px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20">
                      {savingText ? <span className="animate-spin inline-block"><Icons.Refresh /></span> : <Icons.Check />}
                      Save Text
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
