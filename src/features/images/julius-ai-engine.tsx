"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Bot, Download, Copy, Check, Trash2, ImageIcon, Video, FileText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProcessing } from "@/hooks/use-processing";
import type { ProcessingResult } from "@/lib/processing/types";

// AI analysis simulation with real image analysis
async function analyzeImage(imageDataUrl: string, mode: string): Promise<ProcessingResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve({ status: "error", error: "Unable to analyze image." }); return; }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;

      // Analyze image properties
      let totalBrightness = 0;
      let totalSaturation = 0;
      const colorHistogram: Record<string, number> = {};
      let darkPixels = 0;
      let lightPixels = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Brightness
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;
        if (brightness < 50) darkPixels++;
        if (brightness > 200) lightPixels++;

        // Saturation
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        totalSaturation += max === 0 ? 0 : (max - min) / max;

        // Color histogram (quantized)
        const colorKey = `${Math.round(r / 32) * 32},${Math.round(g / 32) * 32},${Math.round(b / 32) * 32}`;
        colorHistogram[colorKey] = (colorHistogram[colorKey] || 0) + 1;
      }

      const pixelCount = data.length / 4;
      const avgBrightness = totalBrightness / pixelCount;
      const avgSaturation = totalSaturation / pixelCount;
      const darkRatio = darkPixels / pixelCount;
      const lightRatio = lightPixels / pixelCount;

      // Find dominant colors
      const sortedColors = Object.entries(colorHistogram)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([color]) => {
          const [r, g, b] = color.split(",").map(Number);
          return `rgb(${r}, ${g}, ${b})`;
        });

      // Determine image characteristics
      const isDark = avgBrightness < 85;
      const isBright = avgBrightness > 170;
      const isHighContrast = darkRatio > 0.2 && lightRatio > 0.2;
      const isLowContrast = Math.abs(darkRatio - lightRatio) > 0.7;
      const isColorful = avgSaturation > 0.3;
      const isMuted = avgSaturation < 0.1;

      const aspectRatio = img.width / img.height;
      const isLandscape = aspectRatio > 1.2;
      const isPortrait = aspectRatio < 0.8;
      const isSquare = Math.abs(aspectRatio - 1) < 0.1;

      const resolution = `${img.width}×${img.height}`;
      const megapixels = ((img.width * img.height) / 1000000).toFixed(1);

      let analysis = "";

      switch (mode) {
        case "describe":
          analysis = `## Image Analysis\n\n`;
          analysis += `**Resolution:** ${resolution} (${megapixels} MP)\n`;
          analysis += `**Orientation:** ${isSquare ? "Square" : isLandscape ? "Landscape" : "Portrait"}\n`;
          analysis += `**Brightness:** ${isDark ? "Dark" : isBright ? "Bright" : "Balanced"} (avg: ${avgBrightness.toFixed(0)}/255)\n`;
          analysis += `**Contrast:** ${isHighContrast ? "High contrast" : isLowContrast ? "Low contrast" : "Moderate contrast"}\n`;
          analysis += `**Color Profile:** ${isColorful ? "Vibrant & colorful" : isMuted ? "Muted & subtle" : "Moderately colorful"}\n\n`;
          analysis += `**Dominant Colors:**\n`;
          sortedColors.forEach((color, i) => {
            analysis += `- Color ${i + 1}: ${color}\n`;
          });
          analysis += `\n**Composition Notes:**\n`;
          analysis += `- The image has a ${isDark ? "dark, moody atmosphere" : isBright ? "bright, airy feel" : "balanced tonal range"}\n`;
          analysis += `- ${isHighContrast ? "Strong contrast creates visual impact" : "Gentle tonal transitions throughout"}\n`;
          analysis += `- ${isColorful ? "Rich color palette adds visual interest" : "Subdued colors create a calm aesthetic"}\n`;
          break;

        case "objects":
          analysis = `## Object Detection Analysis\n\n`;
          analysis += `**Image:** ${resolution}, ${megapixels} MP\n\n`;
          analysis += `**Detected Elements:**\n`;
          analysis += `- Primary subject area: ${isHighContrast ? "Well-defined with clear edges" : "Blended with background"}\n`;
          analysis += `- ${darkPixels > pixelCount * 0.3 ? "Significant shadow/dark regions detected" : "Limited dark regions"}\n`;
          analysis += `- ${lightPixels > pixelCount * 0.3 ? "Bright highlight areas present" : "Few bright regions"}\n`;
          analysis += `- ${isColorful ? "Multiple distinct color regions suggest several objects" : "Uniform color suggests fewer distinct objects"}\n\n`;
          analysis += `**Recommendation:** For precise object detection, use a dedicated ML model like YOLO or TensorFlow.js with pre-trained weights.\n`;
          break;

        case "data":
          analysis = `## Data Extraction\n\n`;
          analysis += `**Image Statistics:**\n`;
          analysis += `| Metric | Value |\n|--------|-------|\n`;
          analysis += `| Resolution | ${resolution} |\n`;
          analysis += `| Megapixels | ${megapixels} MP |\n`;
          analysis += `| Avg Brightness | ${avgBrightness.toFixed(1)} / 255 |\n`;
          analysis += `| Avg Saturation | ${(avgSaturation * 100).toFixed(1)}% |\n`;
          analysis += `| Dark Pixel Ratio | ${(darkRatio * 100).toFixed(1)}% |\n`;
          analysis += `| Light Pixel Ratio | ${(lightRatio * 100).toFixed(1)}% |\n`;
          analysis += `| Aspect Ratio | ${aspectRatio.toFixed(2)}:1 |\n`;
          analysis += `| Dominant Colors | ${sortedColors.length} unique clusters |\n`;
          break;

        default:
          analysis = `Analysis mode "${mode}" selected. Image: ${resolution}, ${megapixels} MP.`;
      }

      resolve({
        status: "success",
        message: `Analysis complete (${mode} mode)`,
        data: analysis,
      });
    };
    img.src = imageDataUrl;
  });
}

export function JuliusAIEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState("describe");
  const [question, setQuestion] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, result, error, process, reset: resetProcessing } = useProcessing();

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) return;
    setFile(f);
    resetProcessing();
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, [resetProcessing]);

  const handleAnalyze = async () => {
    if (!preview) return;
    await process(() => analyzeImage(preview, mode));
  };

  const handleCopy = async () => {
    if (result?.data) {
      await navigator.clipboard.writeText(result.data as string);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    resetProcessing();
    setFile(null);
    setPreview(null);
    setQuestion("");
  };

  return (
    <div className="space-y-4">
      {status === "idle" && !file && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Bot className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop an image to analyze</p>
          <p className="text-sm text-muted-foreground">AI-powered image description, object detection, and data extraction</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
        </div>
      )}

      {status === "idle" && file && preview && (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {file.type.startsWith("video/") ? (
              <video src={preview} className="w-32 h-32 object-cover rounded-lg border" />
            ) : (
              <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={handleReset}>
                <Trash2 className="h-3 w-3 mr-1" /> Remove
              </Button>
            </div>
          </div>

          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="describe" className="gap-1"><ImageIcon className="h-3.5 w-3.5" /> Describe</TabsTrigger>
              <TabsTrigger value="objects" className="gap-1"><Bot className="h-3.5 w-3.5" /> Objects</TabsTrigger>
              <TabsTrigger value="data" className="gap-1"><BarChart3 className="h-3.5 w-3.5" /> Data</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={handleAnalyze} className="w-full gap-2">
            <Bot className="h-4 w-4" /> Analyze Image
          </Button>
        </div>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">AI analyzing your image...</p>
        </div>
      )}

      {status === "success" && result?.data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Bot className="h-4 w-4" /> Analysis Results
            </h3>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <div className="border rounded-lg p-4 bg-muted/30 max-h-[400px] overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-sans">{String(result.data)}</pre>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>Analyze Another</Button>
        </div>
      )}

      {status === "error" && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">{error || "Analysis failed"}</p>
          <Button variant="outline" size="sm" onClick={handleReset}>Try Again</Button>
        </div>
      )}
    </div>
  );
}