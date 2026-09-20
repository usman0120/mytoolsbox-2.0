"use client";

import { useState, useCallback, useRef } from "react";
import {
  FolderOpen, FileArchive, FileOutput, Download, Upload,
  Trash2, File as FileLucide, FileText, Image, Music, Video, File as FileIcon,
  RefreshCw, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import JSZip from "jszip";

interface FileItem {
  id: string;
  file: File;
  newName?: string;
  status: "pending" | "processing" | "done" | "error";
  outputUrl?: string;
  outputName?: string;
  error?: string;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type.startsWith("text/")) return FileText;
  if (type.startsWith("audio/")) return Music;
  if (type.startsWith("video/")) return Video;
  if (type.includes("zip") || type.includes("compressed")) return FileArchive;
  return FileIcon;
}

export function FileOrganizerEngine() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [mode, setMode] = useState<"rename" | "zip" | "unzip">("rename");
  const [renamePattern, setRenamePattern] = useState("");
  const [startNumber, setStartNumber] = useState(1);
  const [zipName, setZipName] = useState("archive");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length === 0) return;

      const newFiles: FileItem[] = selectedFiles.map((file) => ({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        file,
        status: "pending" as const,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;
    const newFiles: FileItem[] = droppedFiles.map((file) => ({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      file,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    toast.success("All files cleared.");
  }, []);

  const handleRename = useCallback(async () => {
    if (files.length === 0) {
      toast.error("No files to rename.");
      return;
    }
    setIsProcessing(true);
    try {
      const updated = await Promise.all(
        files.map(async (item, index) => {
          try {
            const ext = item.file.name.split(".").pop() || "";
            const baseName = renamePattern || "file";
            const num = (startNumber + index).toString().padStart(3, "0");
            const newName = `${baseName}_${num}.${ext}`;
            const renamedFile = new File([item.file], newName, {
              type: item.file.type,
            });
            const url = URL.createObjectURL(renamedFile);
            return {
              ...item,
              newName,
              outputUrl: url,
              outputName: newName,
              status: "done" as const,
            };
          } catch {
            return { ...item, status: "error" as const, error: "Rename failed" };
          }
        })
      );
      setFiles(updated);
      toast.success(`Renamed ${updated.length} file(s)!`);
    } catch {
      toast.error("Rename failed.");
    } finally {
      setIsProcessing(false);
    }
  }, [files, renamePattern, startNumber]);

  const handleZip = useCallback(async () => {
    if (files.length === 0) {
      toast.error("No files to zip.");
      return;
    }
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      for (const item of files) {
        zip.file(item.file.name, item.file);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const updated = files.map((f) => ({
        ...f,
        status: "done" as const,
      }));
      // Add the zip as a result
      const zipItem: FileItem = {
        id: "zip-result",
        file: new File([blob], `${zipName}.zip`, { type: "application/zip" }),
        newName: `${zipName}.zip`,
        outputUrl: url,
        outputName: `${zipName}.zip`,
        status: "done" as const,
      };
      setFiles([...updated, zipItem]);
      toast.success("ZIP archive created!");
    } catch {
      toast.error("Failed to create ZIP.");
    } finally {
      setIsProcessing(false);
    }
  }, [files, zipName]);

  const handleUnzip = useCallback(async () => {
    if (files.length === 0) {
      toast.error("No ZIP file to extract.");
      return;
    }
    const zipFile = files.find((f) =>
      f.file.name.endsWith(".zip") || f.file.type.includes("zip")
    );
    if (!zipFile) {
      toast.error("Please add a .zip file to extract.");
      return;
    }
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipFile.file);
      const extracted: FileItem[] = [];

      for (const [filename, zipEntry] of Object.entries(contents.files)) {
        if (zipEntry.dir) continue;
        const blob = await zipEntry.async("blob");
        const url = URL.createObjectURL(blob);
        extracted.push({
          id: `extracted-${filename}`,
          file: new File([blob], filename, { type: blob.type || "application/octet-stream" }),
          newName: filename,
          outputUrl: url,
          outputName: filename,
          status: "done" as const,
        });
      }

      setFiles((prev) => [
        ...prev.map((f) =>
          f.id === zipFile.id ? { ...f, status: "done" as const } : f
        ),
        ...extracted,
      ]);
      toast.success(`Extracted ${extracted.length} file(s)!`);
    } catch {
      toast.error("Failed to extract ZIP.");
    } finally {
      setIsProcessing(false);
    }
  }, [files]);

  const handleProcess = useCallback(async () => {
    switch (mode) {
      case "rename":
        await handleRename();
        break;
      case "zip":
        await handleZip();
        break;
      case "unzip":
        await handleUnzip();
        break;
    }
  }, [mode, handleRename, handleZip, handleUnzip]);

  const handleDownload = useCallback((item: FileItem) => {
    if (!item.outputUrl) return;
    const a = document.createElement("a");
    a.href = item.outputUrl;
    a.download = item.outputName || item.file.name;
    a.click();
    toast.success(`Downloaded: ${item.outputName || item.file.name}`);
  }, []);

  const handleDownloadAll = useCallback(() => {
    const doneFiles = files.filter((f) => f.status === "done" && f.outputUrl);
    for (const f of doneFiles) {
      handleDownload(f);
    }
  }, [files, handleDownload]);

  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2 flex-wrap">
        {([
          { id: "rename", label: "Rename", icon: RefreshCw },
          { id: "zip", label: "Zip", icon: FileArchive },
          { id: "unzip", label: "Unzip", icon: FileOutput },
        ] as const).map((m) => (
          <Button
            key={m.id}
            variant={mode === m.id ? "default" : "outline"}
            size="sm"
            onClick={() => { setMode(m.id); setFiles([]); }}
            className="gap-1.5"
          >
            <m.icon className="h-3.5 w-3.5" /> {m.label}
          </Button>
        ))}
      </div>

      {/* Options based on mode */}
      {mode === "rename" && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Pattern</Label>
                <Input
                  placeholder="e.g. vacation"
                  value={renamePattern}
                  onChange={(e) => setRenamePattern(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Start Number</Label>
                <Input
                  type="number"
                  min={1}
                  value={startNumber}
                  onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Files will be renamed as: {renamePattern || "file"}_{String(startNumber).padStart(3, "0")}.ext
            </p>
          </CardContent>
        </Card>
      )}

      {mode === "zip" && (
        <Card>
          <CardContent className="p-4">
            <div>
              <Label className="text-xs mb-1 block">Archive Name</Label>
              <Input
                placeholder="archive"
                value={zipName}
                onChange={(e) => setZipName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                className="h-8 text-sm"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          Drag & drop files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          {mode === "unzip" ? "Select a .zip file" : "Select any files"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple={mode !== "unzip"}
          accept={mode === "unzip" ? ".zip,application/zip" : undefined}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {files.length} file(s) · {doneCount} processed
            </span>
            <div className="flex gap-2">
              {doneCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleDownloadAll} className="gap-1.5 h-7">
                  <Download className="h-3.5 w-3.5" /> Download All
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="gap-1.5 h-7 text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          </div>

          {files.map((item) => {
            const Icon = getFileIcon(item.file.type);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20"
              >
                <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.newName || item.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(item.file.size / 1024).toFixed(1)} KB
                    {item.newName && item.newName !== item.file.name && (
                      <span className="ml-2 text-primary">
                        ← {item.file.name}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {item.status === "done" && (
                    <>
                      <Badge className="bg-green-500/10 text-green-600 text-[10px] h-5 gap-1">
                        <Check className="h-3 w-3" /> Done
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDownload(item)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                  {item.status === "error" && (
                    <Badge className="bg-red-500/10 text-red-600 text-[10px] h-5 gap-1">
                      <X className="h-3 w-3" /> Error
                    </Badge>
                  )}
                  {item.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleRemoveFile(item.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Process button */}
      {files.length > 0 && files.some((f) => f.status === "pending") && (
        <Button
          onClick={handleProcess}
          className="w-full gap-2"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            <>
              {mode === "rename" && <RefreshCw className="h-4 w-4" />}
              {mode === "zip" && <FileArchive className="h-4 w-4" />}
              {mode === "unzip" && <FileOutput className="h-4 w-4" />}
              {mode === "rename" ? "Rename Files" : mode === "zip" ? "Create ZIP" : "Extract ZIP"}
            </>
          )}
        </Button>
      )}
    </div>
  );
}