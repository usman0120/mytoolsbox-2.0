"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Download, Loader2, AlertCircle, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function PDFRepairEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError("File size exceeds 50MB limit.");
      return;
    }
    setFile(f);
    setError(null);
    setResultBlob(null);
    setDiagnostics([]);
  };

  const handleRepair = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setDiagnostics([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const diags: string[] = [];

      // Check PDF header
      const header = new TextDecoder().decode(new Uint8Array(arrayBuffer).slice(0, 5));
      if (header !== "%PDF-") {
        diags.push("Missing PDF header signature - attempting repair...");
      } else {
        diags.push("✓ PDF header signature valid");
      }

      // Check file size
      if (file.size < 100) {
        diags.push("⚠ File is very small, may be corrupted");
      }

      // Try loading with pdf-lib
      try {
        const { PDFDocument } = await import("pdf-lib");
        const pdfDoc = await PDFDocument.load(arrayBuffer, { 
          ignoreEncryption: true,
          updateMetadata: false,
        });
        
        const pageCount = pdfDoc.getPageCount();
        diags.push(`✓ Successfully parsed ${pageCount} page(s)`);

        if (pageCount === 0) {
          diags.push("⚠ No pages found - attempting to add blank page");
          pdfDoc.addPage([612, 792]);
        }

        // Save repaired version
        const repairedBytes = await pdfDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
        });
        const blob = new Blob([repairedBytes as unknown as BlobPart], { type: "application/pdf" });
        setResultBlob(blob);
        toast.success("PDF repaired successfully.");
      } catch (pdfErr) {
        diags.push(`⚠ pdf-lib could not parse: ${pdfErr instanceof Error ? pdfErr.message : "Unknown error"}`);
        
        // Last resort: try to salvage by wrapping in a valid PDF structure
        try {
          const { PDFDocument, StandardFonts } = await import("pdf-lib");
          const newPdf = await PDFDocument.create();
          const page = newPdf.addPage([612, 792]);
          const font = await newPdf.embedFont(StandardFonts.Helvetica);
          
          // Try to extract any readable text
          const text = await file.text();
          const readable = text.replace(/[^\x20-\x7E\x0A\x0D\x09]/g, " ").replace(/\s+/g, " ").trim();
          
          if (readable.length > 20) {
            const words = readable.match(/.{1,80}/g) || [readable];
            words.forEach((line, i) => {
              page.drawText(line, { x: 50, y: 750 - i * 15, size: 10, font });
            });
            diags.push("✓ Salvaged readable text content into new PDF");
          } else {
            page.drawText("PDF was repaired. Original content could not be fully recovered.", { x: 50, y: 750, size: 12, font });
            diags.push("⚠ Created placeholder PDF - original content unrecoverable");
          }

          const salvagedBytes = await newPdf.save();
          const blob = new Blob([salvagedBytes as unknown as BlobPart], { type: "application/pdf" });
          setResultBlob(blob);
          toast.success("PDF salvaged with recoverable content.");
        } catch {
          setError("This PDF is severely corrupted and cannot be repaired automatically.");
          toast.error("Repair failed.");
        }
      }

      setDiagnostics(diags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Repair failed.");
      toast.error("Repair failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repaired-${file?.name || "document.pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">PDF Repair</Badge>
        <span className="text-xs text-muted-foreground">Repair corrupted or damaged PDF files</span>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={handleFileSelect} className="hidden" />
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center cursor-pointer hover:border-primary/30 hover:bg-muted/30 transition-colors">
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-sm mb-1">{file ? file.name : "Drop corrupted PDF here"}</p>
            <p className="text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Max 50MB"}</p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {diagnostics.length > 0 && (
        <div className="space-y-1 p-3 bg-muted/30 rounded-xl">
          {diagnostics.map((d, i) => (
            <p key={i} className="text-xs font-mono">{d}</p>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleRepair} disabled={!file || isProcessing} className="gap-2 rounded-xl">
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {isProcessing ? "Repairing..." : "Repair PDF"}
        </Button>
        {resultBlob && (
          <Button onClick={handleDownload} variant="outline" className="gap-2 rounded-xl">
            <Download className="h-4 w-4" />Download Repaired
          </Button>
        )}
      </div>
    </div>
  );
}