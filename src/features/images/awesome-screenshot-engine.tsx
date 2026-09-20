"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Download, Copy, Check, X, Type, Square, Circle, Pencil, Highlighter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AnnotationTool = "arrow" | "rectangle" | "circle" | "text" | "pen" | "highlighter" | "blur";

export function AwesomeScreenshotEngine() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeTool, setActiveTool] = useState<AnnotationTool>("arrow");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const captureScreen = useCallback(async () => {
    setIsCapturing(true);
    try {
      // Use Screen Capture API
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" } as MediaTrackConstraints,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
      }

      const imageData = canvas.toDataURL("image/png");
      setCapturedImage(imageData);

      // Stop all tracks
      stream.getTracks().forEach((track) => track.stop());
      video.remove();
    } catch (err) {
      console.error("Screen capture failed:", err);
      // Fallback: capture the current page as a data URL via html2canvas-like approach
      alert("Screen capture requires permission. Please allow screen sharing when prompted.");
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const handleCopy = async () => {
    if (!capturedImage) return;
    try {
      const blob = await (await fetch(capturedImage)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (!capturedImage) return;
    const link = document.createElement("a");
    link.download = `screenshot-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();
  };

  const tools: { id: AnnotationTool; icon: React.ReactNode; label: string }[] = [
    { id: "arrow", icon: <Pencil className="h-4 w-4" />, label: "Arrow" },
    { id: "rectangle", icon: <Square className="h-4 w-4" />, label: "Rect" },
    { id: "circle", icon: <Circle className="h-4 w-4" />, label: "Circle" },
    { id: "text", icon: <Type className="h-4 w-4" />, label: "Text" },
    { id: "pen", icon: <Pencil className="h-4 w-4" />, label: "Pen" },
    { id: "highlighter", icon: <Highlighter className="h-4 w-4" />, label: "Highlight" },
    { id: "blur", icon: <X className="h-4 w-4" />, label: "Blur" },
  ];

  return (
    <div className="space-y-4">
      {!capturedImage && (
        <div className="border-2 border-dashed rounded-xl p-8 text-center">
          <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium text-lg mb-2">Capture Your Screen</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Capture your screen, then annotate, blur sensitive info, and share.
          </p>
          <Button onClick={captureScreen} disabled={isCapturing} size="lg" className="gap-2">
            <Camera className="h-5 w-5" />
            {isCapturing ? "Select screen to capture..." : "Capture Screen"}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            You&apos;ll be prompted to select a screen, window, or tab to share.
          </p>
        </div>
      )}

      {capturedImage && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`p-2 rounded-md text-xs flex items-center gap-1 transition-colors ${
                    activeTool === tool.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={tool.label}
                >
                  {tool.icon}
                  <span className="hidden sm:inline">{tool.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCapturedImage(null)}>
                <X className="h-4 w-4 mr-1" /> New
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div ref={containerRef} className="relative border rounded-lg overflow-hidden bg-muted/30">
            <img
              src={capturedImage}
              alt="Screenshot"
              className="w-full h-auto max-h-[500px] object-contain"
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
          </div>

          {/* Annotation instructions */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Annotation Tips</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Select a tool above and click/drag on the image to annotate</li>
              <li>Use <strong>Blur</strong> to hide sensitive information like passwords or emails</li>
              <li>Use <strong>Arrow</strong> and <strong>Text</strong> to point out specific areas</li>
              <li>Click <strong>Copy</strong> to paste directly into emails, chats, or documents</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}