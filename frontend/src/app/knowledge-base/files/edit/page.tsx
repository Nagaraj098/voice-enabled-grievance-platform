"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const Icons = {
  ArrowLeft: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>,
  Pdf: () => <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M8 13h2a1.5 1.5 0 1 1 0 3H8z" /><path d="M13 13v3" /><path d="M13 14.5h2a1 1 0 1 1 0 2h-2" /></svg>,
};

export default function EditKnowledgeBaseFilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get("file") || "";
  const fileName = searchParams.get("name") || "untitled";
  const fileType = (searchParams.get("type") || "unknown").toLowerCase();

  const [content, setContent] = useState("");
  const [language, setLanguage] = useState<"json" | "plain">("plain");
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading file...");
  const [jsonError, setJsonError] = useState("");
  const [saveToast, setSaveToast] = useState("");
  const [showPdfInfo, setShowPdfInfo] = useState(false);

  const isJson = fileType === "json";
  const isCsv = fileType === "csv";
  const isPdf = fileType === "pdf";

  const typeLabel = useMemo(() => {
    if (fileType === "text") return "TXT";
    if (fileType === "unknown") return "OTHER";
    return fileType.toUpperCase();
  }, [fileType]);

  const lineCount = useMemo(() => {
    if (!content) return 0;
    return content.split("\n").length;
  }, [content]);

  const parseJsonErrorLine = (value: string, errorMessage: string) => {
    const lineColMatch = /line\s+(\d+)\s+column\s+(\d+)/i.exec(errorMessage);
    if (lineColMatch) return Number(lineColMatch[1]);
    const posMatch = /position\s+(\d+)/i.exec(errorMessage);
    if (!posMatch) return 1;
    const pos = Number(posMatch[1]);
    return value.slice(0, pos).split("\n").length;
  };

  useEffect(() => {
    if (fileType !== "pdf") return;
    setLoading(false);
    setLanguage("plain");
    setJsonError("");
  }, [fileType]);

  useEffect(() => {
    if (fileType !== "json" || !fileUrl) return;
    const loadJson = async () => {
      setLoading(true);
      setLoadingMessage("Loading file...");
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error("Failed to load file");
        const text = await res.text();
        setLanguage("json");
        try {
          setContent(JSON.stringify(JSON.parse(text), null, 2));
          setJsonError("");
        } catch (error: any) {
          setContent(text);
          const line = parseJsonErrorLine(text, error?.message || "");
          setJsonError("Invalid JSON — line " + line);
        }
      } catch (err: any) {
        setContent("Failed to load file.\n\nError: " + (err?.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };
    loadJson();
  }, [fileUrl, fileType]);

  useEffect(() => {
    if (!fileUrl) {
      setLoading(false);
      return;
    }
    if (fileType === "pdf" || fileType === "json") return;
    const loadTextLike = async () => {
      setLoading(true);
      setLoadingMessage("Loading file...");
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error("Failed to load file");
        const text = await res.text();
        setContent(text);
        setLanguage("plain");
        setJsonError("");
      } catch (err: any) {
        setContent("Failed to load file.\n\nError: " + (err?.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };
    loadTextLike();
  }, [fileUrl, fileType]);

  const handleJsonChange = (value: string) => {
    setContent(value);
    try {
      JSON.parse(value);
      setJsonError("");
    } catch (error: any) {
      const line = parseJsonErrorLine(value, error?.message || "");
      setJsonError(`Invalid JSON — line ${line}`);
    }
  };

  const saveChanges = () => {
    if (loading) return;
    if (isJson) {
      try {
        JSON.parse(content);
      } catch {
        return;
      }
    }
    let outputFileName = fileName;
    let mimeType = "text/plain";
    if (isJson) {
      mimeType = "application/json";
    } else if (isCsv) {
      mimeType = "text/csv";
    }
    if (isPdf) {
      outputFileName = fileName.replace(/\.pdf$/i, "") + "_extracted.txt";
      mimeType = "text/plain";
      setShowPdfInfo(true);
    } else {
      setShowPdfInfo(false);
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outputFileName;
    a.click();
    URL.revokeObjectURL(url);
    setSaveToast("Saved & downloaded ✓");
    setTimeout(() => setSaveToast(""), 2000);
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const handleDownloadFile = async () => {
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error("Failed to download file");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName;
      a.target = "_blank";
      a.click();
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar activePage="knowledge-base" />
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Topbar />
        <main className="flex-1 bg-background rounded-tl-2xl border-l border-t border-border/60 mt-2 ml-2 overflow-hidden">
          <div className="h-14 bg-card border-b border-border px-6 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Icons.ArrowLeft />
              </button>
              <p className="font-semibold text-foreground truncate flex items-center gap-2">
                {fileName}
                {loading && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
              </p>
              <span className="px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground text-[10px] font-medium tracking-wider">
                {typeLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isPdf && (
                <button
                  onClick={saveChanges}
                  disabled={loading || (isJson && !!jsonError)}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                >
                  Save Changes
                </button>
              )}
              <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium border border-border"
              >
                Cancel
              </button>
            </div>
          </div>

          {showPdfInfo && (
            <div className="bg-muted border border-border text-muted-foreground text-sm px-4 py-2 mx-6 mt-3 rounded-lg">
              ℹ️ PDF text has been saved as a .txt file. To replace the original PDF, use the Re-upload option on the files page.
            </div>
          )}

          {isPdf ? (
            <div className="h-[calc(100vh-56px)] flex items-center justify-center px-6">
              <div className="w-full max-w-xl bg-card border border-border rounded-xl p-8 text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                  <Icons.Pdf />
                </div>
                <p className="mt-4 font-semibold text-foreground break-all">{fileName}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  PDF files cannot be edited directly. Please download the file, make your changes, and re-upload it to the Knowledge Base.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={handleDownloadFile}
                    className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                  >
                    Download File
                  </button>
                  <button
                    onClick={() => router.push("/knowledge-base")}
                    className="w-full px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium border border-border"
                  >
                    Go to Knowledge Base
                  </button>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-4 text-muted-foreground">
              <Loader2 className="animate-spin w-8 h-8" />
              <p className="text-sm">{loadingMessage}</p>
            </div>
          ) : (
            <>
              <textarea
                value={content}
                onChange={(e) => (isJson ? handleJsonChange(e.target.value) : setContent(e.target.value))}
                className="w-full h-[calc(100vh-56px-40px)] font-mono text-sm bg-muted text-foreground p-6 resize-none focus:outline-none border-0"
                spellCheck={false}
              />
              <div className="h-10 bg-card border-t border-border px-6 py-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {isJson ? "JSON" : isPdf ? "PDF Text" : fileType === "csv" ? "CSV" : "Plain Text"} • {lineCount} lines
                </span>
                {isJson && (
                  <span className="text-foreground">
                    {jsonError ? ("✗ " + jsonError) : "✓ Valid JSON"}
                  </span>
                )}
              </div>
            </>
          )}

          {saveToast && (
            <div className="fixed bottom-4 right-4 bg-card border border-border text-foreground text-sm px-4 py-2 rounded-lg">
              {saveToast}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
