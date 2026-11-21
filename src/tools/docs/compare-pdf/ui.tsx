"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Download, Loader2, AlertCircle, GitCompare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function PDFCompareEngine() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [differences, setDifferences] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const file1Ref = useRef<HTMLInputElement>(null);
  const file2Ref = useRef<HTMLInputElement>(null);

  const extractText = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { getDocument } = await import("pdfjs-dist");
      const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        pages.push(textContent.items.map((item: { str?: string }) => item.str || "").join(" "));
      }
      return pages.join("\n");
    } catch {
      const text = await file.text();
      return text.replace(/[^\x20-\x7E\x0A\x0D\x09]/g, " ").replace(/\s+/g, " ").trim();
    }
  };

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    setIsProcessing(true);
    setError(null);
    setDifferences([]);

    try {
      const [text1, text2] = await Promise.all([extractText(file1), extractText(file2)]);
      const lines1 = text1.split("\n");
      const lines2 = text2.split("\n");
      const maxLen = Math.max(lines1.length, lines2.length);
      const diffs: string[] = [];

      for (let i = 0; i < maxLen; i++) {
        const l1 = (lines1[i] || "").trim();
        const l2 = (lines2[i] || "").trim();
        if (l1 !== l2) {
          if (!l1) diffs.push(`Line ${i + 1}: Added → "${l2.slice(0, 100)}${l2.length > 100 ? "..." : ""}"`);
          else if (!l2) diffs.push(`Line ${i + 1}: Removed → "${l1.slice(0, 100)}${l1.length > 100 ? "..." : ""}"`);
          else diffs.push(`Line ${i + 1}: Changed from "${l1.slice(0, 60)}${l1.length > 60 ? "..." : ""}" to "${l2.slice(0, 60)}${l2.length > 60 ? "..." : ""}"`);
        }
      }

      setDifferences(diffs);
      if (diffs.length === 0) {
        toast.success("The documents are identical.");
      } else {
        toast.info(`Found ${diffs.length} difference(s).`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">PDF Compare</Badge>
        <span className="text-xs text-muted-foreground">Find differences between two PDF documents</span>
      </div>

      <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <input ref={file1Ref} type="file" accept="application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile1(f); setError(null); setDifferences([]); } }} className="hidden" />
            <button type="button" onClick={() => file1Ref.current?.click()} className="w-full min-w-0 border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-primary/30 transition-colors">
              <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs font-medium break-all">{file1 ? file1.name : "Original PDF"}</p>
              <p className="text-[10px] text-muted-foreground">{file1 ? `${(file1.size / 1024).toFixed(1)} KB` : "Click to select"}</p>
            </button>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <input ref={file2Ref} type="file" accept="application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile2(f); setError(null); setDifferences([]); } }} className="hidden" />
            <button type="button" onClick={() => file2Ref.current?.click()} className="w-full min-w-0 border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-primary/30 transition-colors">
              <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs font-medium break-all">{file2 ? file2.name : "Modified PDF"}</p>
              <p className="text-[10px] text-muted-foreground">{file2 ? `${(file2.size / 1024).toFixed(1)} KB` : "Click to select"}</p>
            </button>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      <Button onClick={handleCompare} disabled={!file1 || !file2 || isProcessing} className="gap-2 rounded-xl w-full">
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompare className="h-4 w-4" />}
        {isProcessing ? "Comparing..." : "Compare Documents"}
      </Button>

      {differences.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{differences.length} difference(s) found</p>
          <div className="space-y-1 max-h-75 overflow-y-auto">
            {differences.map((diff, i) => (
              <div key={i} className="p-2 bg-muted/30 rounded-lg text-xs">
                <span className="text-muted-foreground">{diff}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}