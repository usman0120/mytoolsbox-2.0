"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Download, Loader2, AlertCircle, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PDFSignEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signatureText, setSignatureText] = useState("");
  const [signatureMode, setSignatureMode] = useState<"text" | "draw">("text");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setError("Please select a valid PDF file."); return; }
    if (f.size > 30 * 1024 * 1024) { setError("File size exceeds 30MB limit."); return; }
    setFile(f); setError(null); setResultBlob(null);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawing(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  };

  const handleSign = async () => {
    if (!file) return;
    if (signatureMode === "text" && !signatureText.trim()) {
      setError("Please enter a signature text.");
      return;
    }
    if (signatureMode === "draw" && !hasDrawing) {
      setError("Please draw your signature.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();

      if (signatureMode === "text") {
        const font = await pdfDoc.embedFont(await import("pdf-lib").then(m => m.StandardFonts.HelveticaBold));
        lastPage.drawText(signatureText, {
          x: width - 200, y: 50, size: 16, font, color: rgb(0, 0, 0.5),
        });
        lastPage.drawText(new Date().toLocaleDateString(), {
          x: width - 200, y: 35, size: 10, font: await pdfDoc.embedFont(await import("pdf-lib").then(m => m.StandardFonts.Helvetica)), color: rgb(0.4, 0.4, 0.4),
        });
      } else {
        const sigDataUrl = drawCanvasRef.current?.toDataURL("image/png");
        if (sigDataUrl) {
          const sigBytes = Uint8Array.from(atob(sigDataUrl.split(",")[1]), c => c.charCodeAt(0));
          const sigImage = await pdfDoc.embedPng(sigBytes);
          lastPage.drawImage(sigImage, {
            x: width - 220, y: 20, width: 200, height: 60,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
      toast.success("Document signed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signing failed.");
      toast.error("Signing failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url; a.download = `signed-${file?.name || "document.pdf"}`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      <h3 className="text-base font-semibold">PDF Sign</h3>

      <section aria-label="PDF selection">
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileSelect} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-primary/30 hover:bg-muted/30 transition-colors">
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-sm mb-1 break-all">{file ? file.name : "Select PDF to sign"}</p>
            <p className="text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Max 30MB"}</p>
          </button>
      </section>

      <div className="flex gap-2">
        <Button variant={signatureMode === "text" ? "default" : "outline"} size="sm" onClick={() => setSignatureMode("text")} className="rounded-xl text-xs">Text Signature</Button>
        <Button variant={signatureMode === "draw" ? "default" : "outline"} size="sm" onClick={() => setSignatureMode("draw")} className="rounded-xl text-xs">Draw Signature</Button>
      </div>

      {signatureMode === "text" ? (
        <input type="text" value={signatureText} onChange={(e) => setSignatureText(e.target.value)} placeholder="Type your signature..." className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
      ) : (
        <div className="space-y-2">
          <canvas
            ref={drawCanvasRef}
            width={400} height={120}
            onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
            onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
            aria-label="Signature drawing canvas"
            className="w-full border border-border/50 rounded-lg bg-white cursor-crosshair touch-none"
          />
          <Button variant="ghost" size="sm" onClick={clearDrawing} className="text-xs rounded-xl">Clear Drawing</Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSign} disabled={!file || isProcessing} className="gap-2 rounded-xl">
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenTool className="h-4 w-4" />}
          {isProcessing ? "Signing..." : "Sign Document"}
        </Button>
        {resultBlob && (
          <Button onClick={handleDownload} variant="outline" className="gap-2 rounded-xl">
            <Download className="h-4 w-4" />Download Signed
          </Button>
        )}
      </div>
    </div>
  );
}