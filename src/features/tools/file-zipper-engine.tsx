"use client";

import { useState, useRef } from "react";
import { Upload, Download, Loader2, AlertCircle, FileArchive, FileOutput, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function FileZipperEngine() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<"zip" | "unzip">("zip");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFiles, setResultFiles] = useState<{ name: string; blob: Blob }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setFiles(selected);
    setError(null);
    setResultBlob(null);
    setResultFiles([]);
  };

  const handleZip = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (const file of files) {
        zip.file(file.name, file);
      }

      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      setResultBlob(blob);
      toast.success(`Zipped ${files.length} file(s) successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Zip failed.");
      toast.error("Zip failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnzip = async () => {
    if (files.length === 0) return;
    const zipFile = files[0];
    if (!zipFile.name.endsWith(".zip")) {
      setError("Please select a .zip file to extract.");
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(zipFile);
      const extracted: { name: string; blob: Blob }[] = [];

      for (const [name, entry] of Object.entries(zip.files)) {
        if (entry.dir) continue;
        const blob = await entry.async("blob");
        extracted.push({ name, blob });
      }

      setResultFiles(extracted);
      toast.success(`Extracted ${extracted.length} file(s).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unzip failed.");
      toast.error("Unzip failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `archive-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExtracted = (name: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">{mode === "zip" ? "ZIP" : "UNZIP"}</Badge>
        <span className="text-xs text-muted-foreground">{mode === "zip" ? "Compress files into ZIP archive" : "Extract files from ZIP archive"}</span>
      </div>

      <div className="flex gap-2">
        <Button variant={mode === "zip" ? "default" : "outline"} size="sm" onClick={() => { setMode("zip"); setResultBlob(null); setResultFiles([]); }} className="rounded-xl text-xs">Compress (ZIP)</Button>
        <Button variant={mode === "unzip" ? "default" : "outline"} size="sm" onClick={() => { setMode("unzip"); setResultBlob(null); setResultFiles([]); }} className="rounded-xl text-xs">Extract (UNZIP)</Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <input ref={fileInputRef} type="file" multiple={mode === "zip"} accept={mode === "unzip" ? ".zip" : "*"} onChange={handleFilesSelected} className="hidden" />
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center cursor-pointer hover:border-primary/30 hover:bg-muted/30 transition-colors">
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-sm mb-1">{files.length > 0 ? `${files.length} file(s) selected` : mode === "zip" ? "Drop files to compress" : "Drop a ZIP file to extract"}</p>
            <p className="text-xs text-muted-foreground">{files.length > 0 ? files.map(f => f.name).join(", ") : "Click to browse"}</p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      <Button
        onClick={mode === "zip" ? handleZip : handleUnzip}
        disabled={files.length === 0 || isProcessing}
        className="gap-2 rounded-xl w-full"
      >
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "zip" ? <FileArchive className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />}
        {isProcessing ? "Processing..." : mode === "zip" ? `Compress ${files.length} File(s)` : "Extract Files"}
      </Button>

      {resultBlob && (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
          <span className="text-sm">archive.zip ({(resultBlob.size / 1024).toFixed(1)} KB)</span>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1 rounded-xl text-xs"><Download className="h-3 w-3" />Download</Button>
        </div>
      )}

      {resultFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{resultFiles.length} extracted file(s)</p>
          <div className="space-y-1 max-h-75 overflow-y-auto">
            {resultFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <span className="text-xs truncate flex-1">{f.name}</span>
                <Button variant="ghost" size="sm" onClick={() => downloadExtracted(f.name, f.blob)} className="gap-1 rounded-xl text-xs"><Download className="h-3 w-3" /></Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}