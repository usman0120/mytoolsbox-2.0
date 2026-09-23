"use client";

import { useState, useCallback, useRef } from "react";
import {
  FolderOpen, FileArchive, Download, Upload, Trash2,
  FolderTree, FileText, Check, Sparkles, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import JSZip from "jszip";
import {
  FileCategory,
  classifyFile,
  formatFileSize,
  generateNewFilename,
  RenameOptions,
} from "@/features/tools/file-organizer";

interface FileEntry {
  id: string;
  file: File;
  category: FileCategory;
  renamedName?: string;
}

export function FileOrganizerEngine() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"organize" | "rename">("organize");
  const [renamePattern, setRenamePattern] = useState("file_{nnn}");
  const [startNumber, setStartNumber] = useState(1);
  const [caseTransform, setCaseTransform] = useState<"lowercase" | "uppercase" | "keep">("keep");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [isZipping, setIsZipping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const newEntries: FileEntry[] = selected.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      file,
      category: classifyFile(file.name),
    }));

    setFiles((prev) => [...prev, ...newEntries]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success(`Added ${selected.length} file(s)!`);
  }, []);

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    setFiles([]);
    toast.success("Files cleared.");
  };

  // Compute category statistics
  const categoryCounts = files.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {} as Record<FileCategory, number>);

  const renameOptions: RenameOptions = {
    pattern: renamePattern,
    startNumber,
    caseTransform,
    replaceFind: findText || undefined,
    replaceWith: replaceText,
  };

  // Create ZIP with organized category folders
  const handleDownloadOrganizedZip = async () => {
    if (files.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();

      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        const targetFilename =
          activeTab === "rename"
            ? generateNewFilename(item.file.name, i, renameOptions)
            : item.file.name;

        // Folder path: e.g. "images/photo.jpg"
        const folderPath = `${item.category}/${targetFilename}`;
        zip.file(folderPath, item.file);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `organized-files-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Organized ZIP archive downloaded!");
    } catch {
      toast.error("Failed to generate zip file.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" /> File Organizer & Batch Renamer
          </h2>
          <p className="text-sm text-muted-foreground">Classify files into subfolders by type and batch rename with smart patterns</p>
        </div>
        {files.length > 0 && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs text-muted-foreground hover:text-destructive">
              Clear All
            </Button>
            <Button onClick={handleDownloadOrganizedZip} disabled={isZipping} size="sm" className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              {isZipping ? "Archiving..." : "Download Organized ZIP"}
            </Button>
          </div>
        )}
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-8 text-center cursor-pointer bg-muted/20 hover:bg-muted/30"
      >
        <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-semibold">Drop files here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">Select multiple documents, photos, audio, videos, or archives</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          {/* Category Summary Badges */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Categories:</span>
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <Badge key={cat} variant="secondary" className="text-xs capitalize gap-1">
                {cat}: <span className="font-mono font-bold">{count}</span>
              </Badge>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "organize" | "rename")}>
            <TabsList>
              <TabsTrigger value="organize" className="text-xs gap-1.5">
                <FolderOpen className="h-3.5 w-3.5" /> Organize by Category ({files.length})
              </TabsTrigger>
              <TabsTrigger value="rename" className="text-xs gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Batch Renamer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rename" className="space-y-3 mt-3">
              <Card className="p-4 bg-muted/20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <Label className="text-[11px] mb-1 block">Pattern: &#123;name&#125;, &#123;n&#125;, &#123;nnn&#125;, &#123;date&#125;</Label>
                    <Input
                      value={renamePattern}
                      onChange={(e) => setRenamePattern(e.target.value)}
                      placeholder="e.g. document_{nnn}"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] mb-1 block">Start Number</Label>
                    <Input
                      type="number"
                      min="1"
                      value={startNumber}
                      onChange={(e) => setStartNumber(parseInt(e.target.value, 10) || 1)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] mb-1 block">Case Transform</Label>
                    <div className="flex gap-1 pt-0.5">
                      {(["keep", "lowercase", "uppercase"] as const).map((mode) => (
                        <Button
                          key={mode}
                          variant={caseTransform === mode ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCaseTransform(mode)}
                          className="h-7 text-[10px] capitalize flex-1"
                        >
                          {mode}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] mb-1 block">Find in filename</Label>
                    <Input
                      value={findText}
                      onChange={(e) => setFindText(e.target.value)}
                      placeholder="Search string..."
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] mb-1 block">Replace with</Label>
                    <Input
                      value={replaceText}
                      onChange={(e) => setReplaceText(e.target.value)}
                      placeholder="Replacement..."
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="organize" className="mt-2">
              <p className="text-xs text-muted-foreground pb-2">
                Files will be categorized into distinct folders inside the generated ZIP archive.
              </p>
            </TabsContent>
          </Tabs>

          {/* File Preview Table */}
          <Card>
            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground border-b sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Original File</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Size</th>
                      {activeTab === "rename" && <th className="py-2.5 px-3">New Name Preview</th>}
                      <th className="py-2.5 px-2 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {files.map((item, idx) => {
                      const newName = generateNewFilename(item.file.name, idx, renameOptions);

                      return (
                        <tr key={item.id} className="hover:bg-muted/20">
                          <td className="py-2 px-3 font-medium truncate max-w-xs">{item.file.name}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-[10px] capitalize font-mono">
                              {item.category}/
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-muted-foreground font-mono">
                            {formatFileSize(item.file.size)}
                          </td>
                          {activeTab === "rename" && (
                            <td className="py-2 px-3 font-mono text-primary font-medium truncate max-w-xs">
                              {newName}
                            </td>
                          )}
                          <td className="py-2 px-2 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFile(item.id)}
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}