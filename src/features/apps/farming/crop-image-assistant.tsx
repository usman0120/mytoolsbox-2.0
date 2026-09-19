"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Image, Upload, Camera, ScanLine, AlertTriangle, Loader2, X, Leaf, Bug } from "lucide-react";

interface CropImageAssistantProps {
  onResult?: (text: string) => void;
}

export function CropImageAssistant({ onResult }: CropImageAssistantProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!image) return;
    setIsProcessing(true);
    // Simulate analysis — in production, send to vision AI (GPT-4V / Gemini Vision)
    await new Promise((r) => setTimeout(r, 2000));
    setResult(
      "Based on the image, this appears to be a crop leaf with signs of nutrient deficiency (yellowing between veins suggests magnesium deficiency). " +
      "Consider applying Epsom salt (magnesium sulfate) at 10 kg/ha as a foliar spray. " +
      "Also check for aphids on the underside of leaves."
    );
    setIsProcessing(false);
    onResult?.(result || "");
  };

  const clearImage = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <div className="space-y-4">
      {!image ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            isDragging ? "border-green-500 bg-green-500/5" : "border-border/50 hover:border-green-500/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("crop-image-input")?.click()}
        >
          <Camera className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Upload Crop Photo</p>
          <p className="text-xs text-muted-foreground mb-3">
            Drag & drop or click to upload a photo of your crop, leaf, or pest
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Bug className="h-3 w-3" /> Pest ID
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Leaf className="h-3 w-3" /> Disease Check
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <ScanLine className="h-3 w-3" /> Nutrient Deficiency
            </Badge>
          </div>
          <input
            id="crop-image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-border/50">
            <img src={image} alt="Crop" className="w-full max-h-64 object-contain bg-black/5" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 bg-background/80 hover:bg-background"
              onClick={clearImage}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isProcessing}
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              <><ScanLine className="h-4 w-4" /> Analyze Crop Image</>
            )}
          </Button>

          {result && (
            <div className="space-y-3 animate-fade-in-up">
              <Separator />
              <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                <p className="text-xs font-medium mb-2 text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Analysis Result
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{result}</p>
              </div>
              <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2">
                <p className="text-[10px] text-red-600 leading-relaxed">
                  ⚠️ This is an AI-assisted analysis. For accurate diagnosis, consult your local agricultural extension officer or plant pathologist. Do not apply treatments based solely on this analysis.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}