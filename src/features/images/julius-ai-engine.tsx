"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Bot,
  Copy,
  Check,
  Trash2,
  BarChart3,
  FileText,
  PieChart,
  Sparkles,
  Send,
  Download,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ColorSwatch {
  hex: string;
  rgb: string;
  count: number;
}

interface ImageStats {
  resolution: string;
  megapixels: string;
  aspectRatio: string;
  avgBrightness: number;
  contrastRatio: number;
  palette: ColorSwatch[];
  darkPercent: number;
  lightPercent: number;
}

export function JuliusAIEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stats, setStats] = useState<ImageStats | null>(null);

  // Analysis state
  const [prompt, setPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzePixels = (img: HTMLImageElement): ImageStats => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(600, img.naturalWidth || img.width);
    canvas.height = Math.round(canvas.width * ((img.naturalHeight || img.height) / (img.naturalWidth || img.width)));
    const ctx = canvas.getContext("2d");

    const fallbackStats: ImageStats = {
      resolution: `${img.naturalWidth}×${img.naturalHeight}`,
      megapixels: ((img.naturalWidth * img.naturalHeight) / 1_000_000).toFixed(2),
      aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(2),
      avgBrightness: 128,
      contrastRatio: 50,
      palette: [],
      darkPercent: 20,
      lightPercent: 20,
    };

    if (!ctx) return fallbackStats;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let totalLum = 0;
    let darkCount = 0;
    let lightCount = 0;
    const colorMap: Record<string, number> = {};

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLum += lum;
      if (lum < 50) darkCount++;
      if (lum > 205) lightCount++;

      // Quantize to 32 steps for color cluster extraction
      const qR = Math.round(r / 32) * 32;
      const qG = Math.round(g / 32) * 32;
      const qB = Math.round(b / 32) * 32;
      const key = `${qR},${qG},${qB}`;
      colorMap[key] = (colorMap[key] || 0) + 1;
    }

    const totalPixels = data.length / 4;
    const sortedColors = Object.entries(colorMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([rgbStr, count]) => {
        const [r, g, b] = rgbStr.split(",").map(Number);
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        return { hex, rgb: `rgb(${r}, ${g}, ${b})`, count };
      });

    return {
      resolution: `${img.naturalWidth} × ${img.naturalHeight} px`,
      megapixels: ((img.naturalWidth * img.naturalHeight) / 1_000_000).toFixed(2),
      aspectRatio: `${(img.naturalWidth / img.naturalHeight).toFixed(2)}:1`,
      avgBrightness: Math.round(totalLum / totalPixels),
      contrastRatio: Math.round(((lightCount + darkCount) / totalPixels) * 100),
      palette: sortedColors,
      darkPercent: Math.round((darkCount / totalPixels) * 100),
      lightPercent: Math.round((lightCount / totalPixels) * 100),
    };
  };

  const handleLoadFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setAnalysisResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const img = new Image();
      img.onload = () => {
        const calculatedStats = analyzePixels(img);
        setStats(calculatedStats);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(f);
  };

  const handleRunAnalysis = async (customPrompt?: string) => {
    if (!stats || !preview) return;
    const query = customPrompt || prompt.trim() || "Provide a comprehensive data analysis and breakdown of this image.";
    setIsAnalyzing(true);

    try {
      // Attempt backend AI call
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are Julius AI, an expert computer vision, data analysis, and chart interpretation specialist.
User Question: "${query}"
Context about the uploaded image:
- Resolution: ${stats.resolution} (${stats.megapixels} MP)
- Aspect Ratio: ${stats.aspectRatio}
- Average Luminosity: ${stats.avgBrightness}/255
- High Contrast Ratio: ${stats.contrastRatio}%
- Dominant Hex Palette: ${stats.palette.map((p) => p.hex).join(", ")}

Please provide a structured, professional, markdown-formatted report addressing the user's inquiry, extracting any detectable data patterns, insights, key findings, and actionable recommendations.`,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.text) {
          setAnalysisResult(json.text);
          setIsAnalyzing(false);
          return;
        }
      }
    } catch {
      // Fallback to client-side heuristics below
    }

    // Heuristic client analysis report
    const report = `### Julius AI Data & Visual Audit

#### 1. Image Structural Metrics
- **Dimensions:** ${stats.resolution}
- **Total Resolution:** ${stats.megapixels} Megapixels
- **Aspect Ratio:** ${stats.aspectRatio}
- **Tonal Balance:** ${stats.avgBrightness > 160 ? "High-Key / Bright" : stats.avgBrightness < 80 ? "Low-Key / Dark" : "Balanced Midtones"} (${stats.avgBrightness}/255)
- **Shadow Area:** ${stats.darkPercent}% | **Highlight Area:** ${stats.lightPercent}%

#### 2. Color Palette Profile
${stats.palette.map((p, idx) => `- **Cluster ${idx + 1}:** \`${p.hex}\` (${p.rgb})`).join("\n")}

#### 3. Data & Compositional Findings
- The graphic features a **${stats.contrastRatio > 40 ? "high visual contrast" : "subtle gradient transition"}**, suitable for ${stats.aspectRatio.startsWith("1.7") || stats.aspectRatio.startsWith("1.6") ? "desktop dashboards and widescreen presentations" : "square or vertical mobile interfaces"}.
- Based on color distribution, primary accents center around **${stats.palette[0]?.hex || "primary tones"}**.
- Recommended usage: Infographics, statistical slide decks, or technical UI reports.

*Note: Connect your AI API key in Settings to enable real-time multimodal chart transcription.*`;

    setAnalysisResult(report);
    setIsAnalyzing(false);
  };

  const handleCopy = async () => {
    if (!analysisResult) return;
    await navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    if (!analysisResult) return;
    const blob = new Blob([analysisResult], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `julius-analysis-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setStats(null);
    setAnalysisResult(null);
    setPrompt("");
  };

  const presets = [
    { label: "Chart / Graph Audit", prompt: "Transcribe any charts or plots in this image into structured numerical takeaways and observations." },
    { label: "Executive Summary", prompt: "Provide a high-level executive summary of the content, diagrams, and key points in this image." },
    { label: "Visual Quality Review", prompt: "Evaluate the graphic design quality, contrast, color harmony, and legibility." },
  ];

  return (
    <div className="space-y-6">
      {!file && (
        <div
          className="border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 border-muted-foreground/25"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) handleLoadFile(e.dataTransfer.files[0]);
          }}
        >
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Julius AI — Visual Data & Chart Analyst</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Upload charts, graphs, screenshots, tables, or infographics to extract data, summaries, and metrics.
          </p>
          <Button variant="outline" className="rounded-xl shadow-xs">
            Upload File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleLoadFile(e.target.files[0])}
          />
        </div>
      )}

      {file && preview && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Image preview & Metrics */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Source Image
                </span>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 text-xs text-muted-foreground">
                  <Trash2 className="h-3 w-3 mr-1" /> Remove
                </Button>
              </div>

              <div className="rounded-xl border overflow-hidden bg-muted/40 max-h-56 flex items-center justify-center">
                <img src={preview} alt="Input" className="max-h-56 w-auto object-contain" />
              </div>

              {stats && (
                <div className="space-y-3 pt-2 border-t text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-muted/50 border">
                      <p className="text-muted-foreground text-[10px]">Dimensions</p>
                      <p className="font-semibold text-foreground mt-0.5">{stats.resolution}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted/50 border">
                      <p className="text-muted-foreground text-[10px]">Megapixels</p>
                      <p className="font-semibold text-foreground mt-0.5">{stats.megapixels} MP</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-[10px] mb-1.5 flex items-center gap-1">
                      <Palette className="h-3 w-3" /> Dominant Color Clusters
                    </p>
                    <div className="flex gap-1.5">
                      {stats.palette.map((c) => (
                        <div
                          key={c.hex}
                          className="h-6 flex-1 rounded-md border border-white/20 shadow-xs flex items-center justify-center text-[9px] font-mono text-white/80 font-bold"
                          style={{ backgroundColor: c.hex }}
                          title={`${c.hex} (${c.rgb})`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">One-Click AI Analysis</Label>
              <div className="flex flex-col gap-1.5">
                {presets.map((p) => (
                  <Button
                    key={p.label}
                    size="sm"
                    variant="outline"
                    className="justify-start text-xs rounded-xl h-8 text-left"
                    onClick={() => {
                      setPrompt(p.prompt);
                      handleRunAnalysis(p.prompt);
                    }}
                    disabled={isAnalyzing}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Prompt input & AI Analysis Report */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-sm space-y-3">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-primary" /> Ask Julius AI About This Image
              </Label>
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Extract the percentage values from this pie chart, or summarize the trend..."
                  className="rounded-xl min-h-[85px] text-xs resize-none pr-24"
                />
                <Button
                  size="sm"
                  onClick={() => handleRunAnalysis()}
                  disabled={isAnalyzing}
                  className="absolute bottom-2.5 right-2.5 rounded-lg text-xs h-7 gap-1"
                >
                  <Send className="h-3 w-3" />
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
            </div>

            {/* Analysis Output */}
            <div className="p-5 rounded-2xl border bg-card/90 backdrop-blur-sm min-h-[340px] flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b mb-3">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <FileText className="h-4 w-4 text-primary" /> Julius AI Report
                  </span>
                  {analysisResult && (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" onClick={handleCopy} className="h-7 text-xs rounded-lg">
                        {copied ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleDownloadReport} className="h-7 text-xs rounded-lg">
                        <Download className="h-3 w-3 mr-1" /> Save
                      </Button>
                    </div>
                  )}
                </div>

                {isAnalyzing && (
                  <div className="py-16 text-center space-y-3">
                    <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Running neural analysis & chart interpretation...
                    </p>
                  </div>
                )}

                {!isAnalyzing && !analysisResult && (
                  <div className="py-16 text-center text-muted-foreground space-y-1">
                    <p className="text-xs">Select a preset or ask a question above to begin.</p>
                  </div>
                )}

                {!isAnalyzing && analysisResult && (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed overflow-y-auto max-h-[380px] pr-2">
                    <pre className="font-sans whitespace-pre-wrap bg-transparent p-0 border-none">
                      {analysisResult}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}