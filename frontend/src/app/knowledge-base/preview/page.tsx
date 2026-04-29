"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

const Icons = {
  X: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Download: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  FileText: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Braces: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></svg>,
  Table: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>,
  File: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
};

function PreviewContent() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get("file");
  const fileName = searchParams.get("name") || "Document";
  const fileType = searchParams.get("type");
  const fileSize = searchParams.get("size");
  const uploadDate = searchParams.get("date");

  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileUrl) return;

    if (["json", "text", "csv"].includes(fileType || "")) {
      setLoading(true);
      fetch(fileUrl)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch file");
          return res.text();
        })
        .then((text) => {
          if (fileType === "json") {
            try {
              const parsed = JSON.parse(text);
              setTextContent(JSON.stringify(parsed, null, 2));
            } catch (e) {
              setTextContent(text); // fallback to raw
            }
          } else {
            setTextContent(text);
          }
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load file contents.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [fileUrl, fileType]);

  const handleDownload = () => {
    if (!fileUrl) return;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    a.target = "_blank";
    a.click();
  };

  const handleClose = () => {
    window.close();
  };

  if (!fileUrl) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">No file specified for preview.</p>
      </div>
    );
  }

  let IconComp = Icons.File;
  let iconColor = "text-muted-foreground";
  if (fileType === "pdf") { IconComp = Icons.FileText; iconColor = "text-red-400"; }
  else if (fileType === "json") { IconComp = Icons.Braces; iconColor = "text-amber-400"; }
  else if (fileType === "text") { IconComp = Icons.FileText; iconColor = "text-blue-400"; }
  else if (fileType === "csv") { IconComp = Icons.Table; iconColor = "text-emerald-400"; }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shadow-sm h-[56px] flex-shrink-0">
        <div className="flex items-center gap-3 w-1/3">
          <div className={`${iconColor}`}>
            <IconComp />
          </div>
          <h1 className="text-sm font-semibold text-foreground truncate">{fileName}</h1>
          {fileType && (
            <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium uppercase text-muted-foreground tracking-wider flex-shrink-0">
              {fileType === 'text' ? 'TXT' : fileType === 'image' ? 'IMG' : fileType}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-2 w-1/3 text-xs text-muted-foreground">
          {fileSize && fileSize !== "—" && (
            <span className="px-2.5 py-1 bg-muted/50 rounded-md border border-border/50">
              {fileSize}
            </span>
          )}
          {uploadDate && (
            <span className="px-2.5 py-1 bg-muted/50 rounded-md border border-border/50">
              Uploaded {uploadDate}
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 w-1/3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-background hover:bg-muted border border-border text-foreground rounded-lg transition-colors"
          >
            <Icons.Download />
            Download
          </button>
          <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
          <button
            onClick={handleClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            title="Close Preview"
          >
            <Icons.X />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-background">
        {fileType === "pdf" ? (
          <iframe src={fileUrl} className="w-full h-full border-none bg-muted/30" />
        ) : fileType === "image" ? (
          <div className="w-full h-full overflow-auto flex items-center justify-center bg-muted/10 p-8">
            <img src={fileUrl} alt={fileName} className="max-w-full max-h-full object-contain shadow-lg border border-border rounded-lg bg-card" />
          </div>
        ) : ["json", "text", "csv"].includes(fileType || "") ? (
          loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-6 h-6 border-2 border-border border-t-foreground rounded-full"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-red-400 text-sm font-medium">{error}</p>
              <button onClick={handleDownload} className="px-4 py-2 bg-card hover:bg-muted border border-border text-foreground rounded-lg text-sm font-medium transition-colors">
                Download File Instead
              </button>
            </div>
          ) : (
            <div className="h-full overflow-auto bg-muted">
              <div className="flex min-w-max font-mono text-sm">
                <div className="select-none border-r border-border bg-muted/80 px-3 py-4 text-right text-muted-foreground min-w-[48px] sticky left-0 flex-shrink-0">
                  {textContent?.split("\n").map((_, i) => (
                    <div key={i} className="leading-6">{i + 1}</div>
                  ))}
                </div>
                <pre className="px-4 py-4 text-foreground leading-6 whitespace-pre">
                  {textContent}
                </pre>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 bg-muted/10">
            <p className="text-muted-foreground text-sm">Preview not available for this file type</p>
            <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2.5 bg-card hover:bg-muted border border-border text-foreground rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Icons.Download />
              Download File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-border border-t-foreground rounded-full"></div></div>}>
      <PreviewContent />
    </Suspense>
  );
}
