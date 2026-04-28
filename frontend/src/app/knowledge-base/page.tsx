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
  Braces: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></svg>,
  Table: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>,
};

const API_BASE = "http://localhost:8000";

type Doc = {
  id: string;
  name: string;
  filename?: string;
  type: "url" | "file" | "json" | "db";
  size?: string | number;
  category?: string;
  policies_count?: number;
  createdAt: string;
  created_at?: string;
  uploadedAt?: string;
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
  const [dbConfig, setDbConfig] = useState({ host: "", port: "", name: "", user: "", password: "" });
  const [urlInput, setUrlInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<Doc | null>(null);
  const [fileContent, setFileContent] = useState<any>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Doc | null>(null);


  // Edit State
  const [editingFile, setEditingFile] = useState<Doc | null>(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', rules: [] as any[] });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMode, setEditMode] = useState<"rules" | "raw">("rules");
  const [rawJsonText, setRawJsonText] = useState("");
  const [rawJsonError, setRawJsonError] = useState("");

  // Add Files State
  const [addFilesList, setAddFilesList] = useState<File[]>([]);
  const [addFilesCategory, setAddFilesCategory] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Add Text State
  const [addTextForm, setAddTextForm] = useState({ name: "", category: "", content: "" });
  const [savingText, setSavingText] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<string>('add-url');
  const [copied, setCopied] = useState(false);

  // File Browser State
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [activeFileCategory, setActiveFileCategory] = useState("All");

  // Edit Modal State
  const [editContent, setEditContent] = useState<string>('');
  const [editError, setEditError] = useState<string>('');

  const formatSize = (size?: string | number) => {
    if (size === undefined || size === null) return "—";
    if (typeof size === 'string' && /[a-zA-Z]/.test(size)) return size;
    const bytes = typeof size === 'string' ? parseInt(size, 10) : size;
    if (isNaN(bytes) || bytes === 0) return "—";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getRawContent = (filename: string = '', rawData: any) => {
    if (typeof rawData === 'object') {
      return JSON.stringify(rawData, null, 2);
    }
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (ext === 'json') {
      try {
        return JSON.stringify(JSON.parse(rawData), null, 2);
      } catch {
        return rawData;
      }
    }
    
    return String(rawData || '');
  };

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
        size: f.size,
        category: f.category,
        policies_count: f.policies_count,
        created_at: f.created_at || f.uploadedAt,
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
    if (!category) return "text-muted-foreground bg-card border-border";
    const c = category.toLowerCase();
    if (c.includes("water")) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    if (c.includes("road")) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    if (c.includes("electric")) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    return "text-violet-400 bg-violet-500/10 border-violet-500/20";
  };

  const rawContentStr = selectedFile && fileContent !== null ? getRawContent(selectedFile.filename || '', fileContent) : '';

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar activePage="knowledge-base" />
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Topbar />
        <main className="flex-1 flex flex-col overflow-y-auto bg-background rounded-tl-2xl border-l border-t border-border/60 mt-2 ml-2 p-8">

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
              <h1 className="text-2xl font-semibold text-foreground">Knowledge Base</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Manage documents and data sources for the AI agent</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDocs}
                disabled={loading}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-border transition-all"
              >
                <span className={loading ? "animate-spin inline-block" : ""}><Icons.Refresh /></span>
              </button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                {docs.length} documents
              </div>
              <button
                onClick={() => setShowFileBrowser(true)}
                className="bg-card border border-border text-foreground hover:bg-muted px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 ml-2 transition-colors"
              >
                <Icons.FolderOpen />
                View Files
              </button>
            </div>
          </div>

          {/* New Tab Bar */}
          <div className="flex border-b border-border w-full mt-4">
            {[
              { id: 'add-url', label: 'Add URL', icon: <span className="text-blue-400"><Icons.Globe /></span> },
              { id: 'upload-json', label: 'Upload JSON', icon: <span className="text-violet-400"><Icons.Upload /></span> },
              { id: 'sample-jsons', label: 'Sample JSONs', icon: <span className="text-amber-400"><Icons.FileJson /></span> },
              { id: 'connect-db', label: 'Connect to DB', icon: <span className="text-emerald-400"><Icons.Database /></span> },
              { id: 'add-files', label: 'Add Files', icon: <span className="text-[#60a5fa]"><Icons.FolderOpen /></span> },
              { id: 'add-text', label: 'Add Text', icon: <span className="text-[#34d399]"><Icons.FileText /></span> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === tab.id 
                    ? 'text-foreground border-b-2 border-primary -mb-px' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          {activeTab === 'add-url' && (
            <div className="bg-card border border-border rounded-xl p-6 mt-4">
              <h2 className="text-base font-semibold text-foreground mb-4">Add URL</h2>
              <input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-zinc-500 mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button onClick={handleAddUrl} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-foreground text-sm rounded-lg font-medium transition-colors">Add</button>
              </div>
            </div>
          )}

          {activeTab === 'upload-json' && (
            <div className="bg-card border border-border rounded-xl p-6 mt-4">
              <h2 className="text-base font-semibold text-foreground mb-1">Upload JSON File</h2>
              <p className="text-xs text-muted-foreground mb-5">Upload grievance JSON files to the knowledge base</p>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  dragging ? 'border-violet-500/70 bg-violet-500/10' : 'border-border hover:border-zinc-500 hover:bg-background/50'
                }`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
              >
                <span className="text-muted-foreground flex justify-center mb-3"><Icons.Upload /></span>
                <p className="text-sm text-foreground font-medium mb-1">Click to browse or drag JSON files here</p>
                <p className="text-xs text-muted-foreground">Only .json files are supported</p>
              </div>
              {uploading && (
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <span className="animate-spin inline-block"><Icons.Refresh /></span>
                  Uploading to backend...
                </div>
              )}
              <div className="flex gap-3 justify-end mt-5">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-foreground text-sm rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Icons.Upload />
                  Browse Files
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sample-jsons' && (
            <div className="bg-card border border-border rounded-xl p-6 mt-4 max-h-[60vh] overflow-y-auto">
              <h2 className="text-base font-semibold text-foreground mb-1">Sample Grievance JSONs</h2>
              <p className="text-xs text-muted-foreground mb-5">Pre-built templates — click Upload to add directly to your backend knowledge base</p>
              <div className="space-y-4">
                {SAMPLE_JSONS.map((sample, i) => (
                  <div key={i} className="bg-background border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400"><Icons.FileJson /></span>
                        <span className="text-sm font-medium text-foreground">{sample.title}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sample.color}`}>
                          {sample.tag}
                        </span>
                      </div>
                      <button
                        onClick={() => uploadSampleJson(sample)}
                        disabled={uploading}
                        className="text-xs px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-foreground rounded-lg font-medium transition-colors flex items-center gap-1.5"
                      >
                        {uploading ? <span className="animate-spin inline-block"><Icons.Refresh /></span> : <Icons.Upload />}
                        Upload to KB
                      </button>
                    </div>
                    <pre className="text-xs text-muted-foreground bg-background/50 rounded-lg p-3 overflow-x-auto max-h-36 overflow-y-auto border border-border">
                      {JSON.stringify(sample.json, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'connect-db' && (
            <div className="bg-card border border-border rounded-xl p-6 mt-4">
              <h2 className="text-base font-semibold text-foreground mb-1">Connect to Database</h2>
              <p className="text-xs text-muted-foreground mb-5">Enter your database connection details</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Host</label>
                    <input value={dbConfig.host} onChange={e => setDbConfig(p => ({...p, host: e.target.value}))} placeholder="localhost" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-zinc-500" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Port</label>
                    <input value={dbConfig.port} onChange={e => setDbConfig(p => ({...p, port: e.target.value}))} placeholder="5432" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-zinc-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Database Name</label>
                  <input value={dbConfig.name} onChange={e => setDbConfig(p => ({...p, name: e.target.value}))} placeholder="my_database" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-zinc-500" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Username</label>
                  <input value={dbConfig.user} onChange={e => setDbConfig(p => ({...p, user: e.target.value}))} placeholder="postgres" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-zinc-500" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Password</label>
                  <input type="password" value={dbConfig.password} onChange={e => setDbConfig(p => ({...p, password: e.target.value}))} placeholder="••••••••" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-zinc-500" />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-5">
                <button
                  onClick={() => {
                    if (!dbConfig.host || !dbConfig.name) return;
                    showToast(`Connected to ${dbConfig.name}`, "success");
                    setDbConfig({ host: "", port: "", name: "", user: "", password: "" });
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-foreground text-sm rounded-lg font-medium transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
          )}

          {activeTab === 'add-files' && (
            <div className="bg-card border border-border rounded-xl p-6 mt-4">
              <h2 className="text-base font-semibold text-foreground mb-1">Add Files</h2>
              <p className="text-xs text-muted-foreground mb-5">Upload multiple documents formats to process.</p>
              
              <div className="flex-1 space-y-5 pr-2">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                    dragging ? 'border-[#60a5fa]/70 bg-[#60a5fa]/10' : 'border-border hover:border-zinc-500 hover:bg-background/50'
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
                  <p className="text-sm text-foreground font-medium mb-1">Drag & drop files here or click to browse</p>
                  <p className="text-xs text-muted-foreground">Accepts .pdf, .txt, .csv, .docx, .json</p>
                </div>

                {addFilesList.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Selected Files ({addFilesList.length})</label>
                    <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                      {addFilesList.map((f, i) => (
                         <div key={i} className="flex justify-between items-center text-xs text-foreground bg-background p-2 rounded-lg border border-border">
                           <div className="truncate flex-1 pr-3 font-mono">{f.name} <span className="text-muted-foreground text-[10px] ml-1">({(f.size / 1024).toFixed(1)} KB)</span></div>
                           <button onClick={() => setAddFilesList(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-400 p-1 rounded-md transition-colors"><Icons.X /></button>
                         </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-muted-foreground">Default Category (Optional)</label>
                  <div className="relative">
                    <select 
                      value={addFilesCategory}
                      onChange={e => setAddFilesCategory(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg pl-3 pr-10 py-2.5 text-sm text-foreground appearance-none focus:outline-none focus:border-violet-500"
                    >
                      <option value="">Select Category...</option>
                      <option value="Roads and Sanitation">Roads and Sanitation</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Water Supply">Water Supply</option>
                      <option value="Network">Network</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                       <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-border/60">
                 <button onClick={handleAddFilesSubmit} disabled={uploadingFiles || addFilesList.length === 0} className="w-full sm:w-auto px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-foreground text-sm rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    {uploadingFiles ? <span className="animate-spin inline-block"><Icons.Refresh /></span> : <Icons.Upload />}
                    Upload Files
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'add-text' && (
            <div className="bg-card border border-border rounded-xl p-6 mt-4">
              <h2 className="text-base font-semibold text-foreground mb-1">Add Text</h2>
              <p className="text-xs text-muted-foreground mb-5">Create a dedicated knowledge document directly from unstructured text.</p>
              
              <div className="flex-1 space-y-4 pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Document Name</label>
                    <input 
                      value={addTextForm.name}
                      onChange={e => setAddTextForm(p => ({...p, name: e.target.value}))}
                      placeholder="e.g. water_supply_rules"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Category</label>
                    <div className="relative">
                      <select 
                        value={addTextForm.category}
                        onChange={e => setAddTextForm(p => ({...p, category: e.target.value}))}
                        className="w-full bg-background border border-border rounded-lg pl-3 pr-10 py-2.5 text-sm text-foreground appearance-none focus:outline-none focus:border-violet-500 transition-all"
                      >
                        <option value="">Select Category...</option>
                        <option value="Roads and Sanitation">Roads and Sanitation</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Water Supply">Water Supply</option>
                        <option value="Network">Network</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                         <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 h-full flex flex-col pt-2">
                  <label className="text-xs font-semibold text-muted-foreground">Content</label>
                  <textarea 
                    value={addTextForm.content}
                    onChange={e => setAddTextForm(p => ({...p, content: e.target.value}))}
                    placeholder="Paste or type your text content here..."
                    className="w-full min-h-[200px] flex-1 bg-background border border-border rounded-lg p-4 text-sm text-foreground font-mono resize-y focus:outline-none focus:border-violet-500 leading-relaxed shadow-inner"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 pl-1 font-medium">Supports plain text. Each paragraph or line break may be treated as a separate entry.</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-border/60">
                 <button onClick={handleAddTextSubmit} disabled={savingText} className="w-full sm:w-auto px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-foreground text-sm rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20">
                    {savingText ? <span className="animate-spin inline-block"><Icons.Refresh /></span> : <Icons.Check />}
                    Save Text
                 </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex-1 flex flex-col min-h-0">
              {/* Search */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Icons.Search /></span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search knowledge base..."
                    className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border transition-colors"
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
                    <span className="animate-spin inline-block text-muted-foreground"><Icons.Refresh /></span>
                    <p className="text-muted-foreground text-sm">Loading knowledge base...</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
                    <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center">
                      <span className="text-muted-foreground"><Icons.FileText /></span>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground font-medium">No documents found</p>
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
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              ✅ Completed
                              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-500/20">{completed.length}</span>
                            </h3>
                          </div>
                          
                          <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-background/40 border-b border-border/60 text-xs font-semibold text-muted-foreground">
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
                                    <div className="bg-background p-1.5 rounded-md border border-border flex-shrink-0">
                                      {typeIcon(doc.type)}
                                    </div>
                                    <span className="text-sm text-foreground font-medium truncate">{doc.name}</span>
                                  </div>
                                  
                                  {/* Date */}
                                  <div className="col-span-3 sm:col-span-2 hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
                                    {doc.createdAt}
                                  </div>
                                  
                                  {/* Category Tag */}
                                  <div className="col-span-3">
                                    {doc.category ? (
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap overflow-hidden text-ellipsis ${severityColor(doc.category)}`}>
                                        {doc.category}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </div>
                                  
                                  {/* Rules Count */}
                                  <div className="col-span-2 hidden sm:block text-center">
                                    <span className="text-[10px] text-muted-foreground bg-card/50 px-2 py-0.5 rounded-full border border-border/50">
                                      {doc.policies_count !== undefined ? doc.policies_count : doc.type === "url" ? "HTML" : "Data"}
                                    </span>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-1.5">
                                    <button onClick={() => handleViewFile(doc)} className="p-1.5 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors" title="View">
                                      <Icons.Eye />
                                    </button>
                                    <button onClick={() => handleEditFile(doc)} className="p-1.5 text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors" title="Edit">
                                      <Icons.Edit />
                                    </button>
                                    <button onClick={() => {
                                        const blob = new Blob([""], { type: "text/plain" }); /* Dummy placeholder if real data exists download */
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a"); a.href = url; a.download = doc.filename || doc.name; a.click(); URL.revokeObjectURL(url);
                                      }} className="p-1.5 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors" title="Download">
                                      <Icons.Download />
                                    </button>
                                    <button onClick={() => removeDoc(doc)} className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors" title="Delete">
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
                              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                ⏳ In Progress
                                <span className="bg-card text-foreground px-2 py-0.5 rounded-full text-[10px] font-medium border border-border">{inProgress.length}</span>
                              </h3>
                            </div>
                            
                            {inProgress.length === 0 ? (
                              <div className="rounded-xl border border-dashed border-border bg-background/30 p-6 flex flex-col items-center justify-center gap-2">
                                <span className="text-muted-foreground"><Icons.Alert /></span>
                                <p className="text-xs text-muted-foreground font-medium">No files currently processing</p>
                              </div>
                            ) : (
                               <div className="space-y-3">
                                 {inProgress.map(doc => (
                                   <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-background/60 border border-border rounded-xl p-4">
                                      <div className="w-10 h-10 rounded-lg bg-card/80 flex items-center justify-center flex-shrink-0 border border-border">
                                         <span className="text-muted-foreground animate-pulse">{typeIcon(doc.type)}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                         <div className="flex items-center gap-3 mb-1">
                                            <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                                            {doc.category && <span className="text-[10px] text-muted-foreground border border-border rounded-full px-2">{doc.category}</span>}
                                         </div>
                                         <div className="flex items-center gap-3 mt-2">
                                            <div className="flex-1 h-1.5 bg-card rounded-full overflow-hidden relative">
                                                <div className="h-full bg-violet-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite] w-[60%]" />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap capitalize w-16">{doc.status}...</span>
                                         </div>
                                      </div>
                                      <div className="text-xs text-muted-foreground flex-shrink-0 text-right">
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

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".json"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          {/* File Browser Drawer */}
          {showFileBrowser && (
            <>
              <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40" onClick={() => setShowFileBrowser(false)} />
              <div className="fixed inset-y-0 right-0 w-[480px] bg-background border-l border-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Icons.FolderOpen />
                    Uploaded Files
                  </h2>
                  <button onClick={() => setShowFileBrowser(false)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                    <Icons.X />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 px-6 border-b border-border overflow-x-auto no-scrollbar">
                  {["All", "PDF", "JSON", "TXT", "CSV", "Other"].map(cat => {
                    let count = docs.length;
                    if (cat !== "All") {
                      count = docs.filter(d => {
                        const type = getFileType(d.filename);
                        if (cat === "Other") return !["pdf", "json", "text", "csv"].includes(type);
                        if (cat === "TXT") return type === "text";
                        return type === cat.toLowerCase();
                      }).length;
                    }
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveFileCategory(cat)}
                        className={`py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                          activeFileCategory === cat 
                            ? 'text-foreground border-primary' 
                            : 'text-muted-foreground border-transparent hover:text-foreground'
                        }`}
                      >
                        {cat} <span className="text-xs opacity-60 ml-1">({count})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {docs.filter(d => {
                    if (activeFileCategory === "All") return true;
                    const type = getFileType(d.filename);
                    if (activeFileCategory === "Other") return !["pdf", "json", "text", "csv"].includes(type);
                    if (activeFileCategory === "TXT") return type === "text";
                    return type === activeFileCategory.toLowerCase();
                  }).map((file) => {
                    const type = getFileType(file.filename);
                    let IconComp = Icons.File;
                    let iconColor = "text-muted-foreground";
                    if (type === "pdf") { IconComp = Icons.FileText; iconColor = "text-red-400"; }
                    else if (type === "json") { IconComp = Icons.Braces; iconColor = "text-amber-400"; }
                    else if (type === "text") { IconComp = Icons.FileText; iconColor = "text-blue-400"; }
                    else if (type === "csv") { IconComp = Icons.Table; iconColor = "text-emerald-400"; }
                    
                    return (
                      <div key={file.id} className="flex items-center justify-between px-6 py-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors group">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={`p-2 rounded-lg bg-card border border-border flex-shrink-0 ${iconColor}`}>
                            <IconComp />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-foreground truncate">{file.filename || file.name}</p>
                              <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium uppercase tracking-wider flex-shrink-0">
                                {type === 'text' ? 'TXT' : type === 'image' ? 'IMG' : type}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatSize(file.size)} • {file.created_at || file.uploadedAt ? new Date(file.created_at || file.uploadedAt || file.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(file.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4 flex-shrink-0">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const fileUrl = `${API_BASE}/knowledge/${file.filename || file.id}`;
                              const formattedDate = file.created_at || file.uploadedAt ? new Date(file.created_at || file.uploadedAt || file.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(file.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                              window.open(`/knowledge-base/preview?file=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(file.filename || file.name)}&type=${type}&size=${encodeURIComponent(formatSize(file.size))}&date=${encodeURIComponent(formattedDate)}`, '_blank');
                            }}
                            className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                            title="Preview"
                          >
                            <Icons.Eye />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              setEditingFile(file);
                              setEditError('');
                              setEditContent('');
                              if (["pdf", "image", "unknown"].includes(type)) return;
                              try {
                                const res = await fetch(`${API_BASE}/knowledge/${file.filename || file.id}`);
                                const text = await res.text();
                                if (type === 'json') {
                                  try { setEditContent(JSON.stringify(JSON.parse(text), null, 2)); }
                                  catch { setEditContent(text); }
                                } else { setEditContent(text); }
                              } catch (err) { setEditError('Failed to fetch file content'); }
                            }}
                            className="p-2 text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Icons.Edit />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const a = document.createElement("a");
                              a.href = `${API_BASE}/knowledge/${file.filename || file.id}`;
                              a.download = file.filename || file.name;
                              a.target = "_blank";
                              a.click();
                            }}
                            className="p-2 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
                            title="Download"
                          >
                            <Icons.Download />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {docs.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No files found for this category.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Edit File Modal */}
          {editingFile && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-xl p-6 w-[560px] max-h-[80vh] flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Edit File — {editingFile.filename || editingFile.name}</h2>
                  <button onClick={() => setEditingFile(null)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                    <Icons.X />
                  </button>
                </div>
                
                {["pdf", "image", "unknown"].includes(getFileType(editingFile.filename)) ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-muted/30 rounded-full mb-4">
                      <Icons.FileText />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">Editing not supported</p>
                    <p className="text-xs text-muted-foreground mb-6">PDF and image files cannot be edited directly.</p>
                    <button onClick={() => setEditingFile(null)} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                      Re-upload
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 relative">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={`font-mono text-sm bg-muted border rounded-lg p-3 w-full h-[400px] resize-none text-foreground focus:outline-none focus:ring-1 focus:ring-primary ${editError ? 'border-red-500' : 'border-border'}`}
                        placeholder="Loading content..."
                      />
                      {editError && (
                        <div className="absolute bottom-3 left-3 right-3 text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded border border-red-500/20">
                          {editError}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-3 mt-2">
                      <button 
                        onClick={() => setEditingFile(null)}
                        className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={async () => {
                          const type = getFileType(editingFile.filename);
                          if (type === 'json') {
                            try {
                              JSON.parse(editContent);
                              setEditError('');
                            } catch (e: any) {
                              setEditError(`Invalid JSON: ${e.message}`);
                              return;
                            }
                          }
                          setSavingEdit(true);
                          try {
                            const res = await fetch(`${API_BASE}/knowledge/${editingFile.id || editingFile.filename}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ content: editContent })
                            });
                            if (!res.ok) throw new Error('Failed to save');
                            showToast("File updated successfully", "success");
                            setEditingFile(null);
                            fetchDocs();
                          } catch (err) {
                            setEditError("Failed to save changes.");
                          } finally {
                            setSavingEdit(false);
                          }
                        }}
                        disabled={savingEdit}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        {savingEdit && <span className="animate-spin inline-block"><Icons.Refresh /></span>}
                        Save Changes
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
