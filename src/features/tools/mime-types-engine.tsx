"use client";

import { useState, useMemo, useId } from "react";
import {
  Search,
  Copy,
  Check,
  ChevronRight,
  Upload,
  FileCode,
  FileText,
  FileQuestion,
  FileArchive,
  Image as ImageIcon,
  Music,
  Video,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  lookupMimeType,
  searchMimeTypes,
  MIME_TYPES,
  getMimeCategories,
  MimeEntry,
} from "@/features/tools/mime-types";
import { toast } from "sonner";

export function MimeTypesEngine() {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedEntry, setSelectedEntry] = useState<MimeEntry>(MIME_TYPES["json"]);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{ name: string; size: string; type: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputId = useId();

  // Instant live search & category filter
  const filteredList = useMemo(() => {
    const q = query.toLowerCase().trim();
    return Object.values(MIME_TYPES).filter((entry) => {
      const matchCat = selectedCat === "All" || entry.category === selectedCat;
      const matchQuery =
        !q ||
        entry.extension.toLowerCase().includes(q) ||
        entry.mimeType.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [query, selectedCat]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = (file.size / 1024).toFixed(1);
    setUploadedFileInfo({
      name: file.name,
      size: `${sizeKb} KB`,
      type: file.type || "application/octet-stream",
    });

    const res = lookupMimeType(file.name);
    if (res.status === "success" && res.data) {
      setSelectedEntry(res.data);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Image":
        return <ImageIcon className="h-4 w-4 text-emerald-500" />;
      case "Audio":
        return <Music className="h-4 w-4 text-violet-500" />;
      case "Video":
        return <Video className="h-4 w-4 text-rose-500" />;
      case "Archive":
        return <FileArchive className="h-4 w-4 text-amber-500" />;
      case "Code":
        return <Code2 className="h-4 w-4 text-cyan-500" />;
      case "Text":
      case "Document":
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <FileCode className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Search & Upload row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search extension (e.g. .pdf, .webp) or MIME type (image/png, json)..."
            className="pl-9 h-11 text-sm font-medium"
          />
        </div>

        <div className="md:col-span-4">
          <input
            id={fileInputId}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            className="w-full h-11 text-xs gap-1.5"
            onClick={() => document.getElementById(fileInputId)?.click()}
          >
            <Upload className="h-4 w-4 text-primary" /> Inspect File MIME
          </Button>
        </div>
      </div>

      {uploadedFileInfo && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{uploadedFileInfo.name}</span>
            <span className="text-muted-foreground">({uploadedFileInfo.size})</span>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {uploadedFileInfo.type}
          </Badge>
        </div>
      )}

      {/* Categories */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          variant={selectedCat === "All" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCat("All")}
          className="h-7 text-xs px-2.5 rounded-full"
        >
          All ({Object.keys(MIME_TYPES).length})
        </Button>
        {getMimeCategories().map((cat) => (
          <Button
            key={cat}
            variant={selectedCat === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCat(cat)}
            className="h-7 text-xs px-2.5 rounded-full"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Grid: Detail & Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Selected Entry Detail Card */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border flex items-center justify-center font-mono font-bold text-sm text-primary">
                    {selectedEntry.extension}
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-base text-foreground select-all">
                      {selectedEntry.mimeType}
                    </h3>
                    <p className="text-xs text-muted-foreground">{selectedEntry.description}</p>
                  </div>
                </div>

                <Badge variant="secondary" className="text-xs">
                  {selectedEntry.category}
                </Badge>
              </div>

              {/* Copy actions */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground">MIME Type</Label>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                    <span className="font-mono text-xs select-all">{selectedEntry.mimeType}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleCopy(selectedEntry.mimeType, "mime")}
                    >
                      {copiedKey === "mime" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground">HTTP Response Header</Label>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                    <span className="font-mono text-xs select-all text-primary">
                      Content-Type: {selectedEntry.mimeType}
                      {selectedEntry.category === "Text" || selectedEntry.category === "Code" ? "; charset=utf-8" : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() =>
                        handleCopy(
                          `Content-Type: ${selectedEntry.mimeType}${selectedEntry.category === "Text" || selectedEntry.category === "Code" ? "; charset=utf-8" : ""}`,
                          "header"
                        )
                      }
                    >
                      {copiedKey === "header" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scrollable list */}
        <div className="lg:col-span-6 space-y-1.5 max-h-130 overflow-y-auto pr-1">
          <Label className="text-xs font-semibold text-muted-foreground block mb-1">
            Matching Types ({filteredList.length})
          </Label>

          {filteredList.map((entry) => {
            const isSelected = selectedEntry.extension === entry.extension;
            return (
              <div
                key={entry.extension}
                onClick={() => setSelectedEntry(entry)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "bg-card hover:bg-muted/50 border-border"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="shrink-0">{getCategoryIcon(entry.category)}</div>
                  <Badge variant="outline" className="font-mono text-[11px] shrink-0">
                    {entry.extension}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-medium truncate text-foreground">
                      {entry.mimeType}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{entry.description}</p>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}