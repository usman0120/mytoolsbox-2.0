"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Image, Upload, X, Camera, Loader2, ScanLine } from "lucide-react";

interface MathImageUploadProps {
  onTextExtracted: (text: string) => void;
  isProcessing: boolean;
}

export function MathImageUpload({ onTextExtracted, isProcessing }: MathImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateOCR = useCallback(async (_dataUrl: string) => {
    // In production: send to vision model (GPT-4V, Gemini Vision, Claude Vision)
    // For now, show a prompt for the user to type what they see
    setExtractedText(null);
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      // Simulate OCR extraction (in production, use a vision AI API)
      simulateOCR(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [simulateOCR]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    setExtractedText(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const useExtractedText = () => {
    if (extractedText) {
      onTextExtracted(extractedText);
      clearImage();
    }
  };

  return (
    <div className="space-y-3">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-950/20"
              : "border-border hover:border-cyan-300 hover:bg-muted/30"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
              <Camera className="h-7 w-7 text-cyan-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Upload a photo of your math problem</p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag & drop an image, or click to browse
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ScanLine className="h-3 w-3" />
              <span>Supports: handwritten equations, textbook photos, screenshots</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Uploaded math problem"
            className="w-full max-h-64 object-contain bg-gray-100 dark:bg-gray-900"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 gap-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm"
              onClick={clearImage}
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
          {isProcessing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg px-4 py-2 shadow-lg">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                <span className="text-sm font-medium">Analyzing image...</span>
              </div>
            </div>
          )}
          {extractedText && (
            <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 border-t border-cyan-200 dark:border-cyan-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300 mb-1">Detected equation:</p>
                  <p className="text-sm font-mono">{extractedText}</p>
                </div>
                <Button size="sm" className="h-7 text-xs gap-1 shrink-0" onClick={useExtractedText}>
                  <Upload className="h-3 w-3" />
                  Use this
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual input hint when image is uploaded */}
      {preview && !extractedText && !isProcessing && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <Image className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Type the equation you see in the image above into the input field, then click Solve.
          </p>
        </div>
      )}
    </div>
  );
}