"use client";

import { useState, useCallback } from "react";
import {
  Presentation, Download, Copy, Check, Trash2, Loader2,
  Sparkles, Plus, X, GripVertical, Wand2, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Slide {
  id: string;
  title: string;
  content: string;
  type: "title" | "content" | "bullets" | "image" | "quote" | "summary";
}

interface PresentationData {
  topic: string;
  audience: string;
  tone: "professional" | "casual" | "academic" | "pitch";
  slideCount: number;
  slides: Slide[];
}

const STORAGE_KEY = "mytoolsbox-ai-presentation";

function loadData(): PresentationData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveData(data: PresentationData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateSlideId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function generatePresentationOutline(topic: string, audience: string, tone: string, count: number): Slide[] {
  const slides: Slide[] = [];

  // Title slide
  slides.push({
    id: generateSlideId(),
    title: topic || "Presentation Title",
    content: audience ? `Prepared for ${audience}` : "Presentation",
    type: "title",
  });

  // Agenda/Overview
  slides.push({
    id: generateSlideId(),
    title: "Agenda",
    content: "• Overview\n• Key Points\n• Analysis\n• Recommendations\n• Next Steps",
    type: "bullets",
  });

  // Introduction
  slides.push({
    id: generateSlideId(),
    title: "Introduction",
    content: `Welcome to this presentation on ${topic}. Today we'll explore the key aspects, challenges, and opportunities in this area.`,
    type: "content",
  });

  // Key content slides
  const contentTopics = [
    "Background & Context",
    "Current Landscape",
    "Key Challenges",
    "Opportunities & Solutions",
    "Case Studies & Examples",
    "Data & Analysis",
    "Strategic Recommendations",
  ];

  const remainingSlides = Math.max(1, count - slides.length - 1); // -1 for summary
  const contentSlideCount = Math.min(remainingSlides, contentTopics.length);

  for (let i = 0; i < contentSlideCount; i++) {
    const isBullets = i % 2 === 0;
    slides.push({
      id: generateSlideId(),
      title: contentTopics[i],
      content: isBullets
        ? `• Key point about ${contentTopics[i].toLowerCase()}\n• Important consideration for ${audience || "the audience"}\n• Relevant data and insights\n• Actionable takeaways`
        : `This section covers the essential aspects of ${contentTopics[i].toLowerCase()} as it relates to ${topic}. We'll examine the critical factors that influence outcomes and discuss practical approaches for success.`,
      type: isBullets ? "bullets" : "content",
    });
  }

  // Summary slide
  slides.push({
    id: generateSlideId(),
    title: "Summary & Next Steps",
    content: "• Recap of key findings\n• Recommended actions\n• Timeline & milestones\n• Q&A",
    type: "summary",
  });

  return slides;
}

function generatePresentationHTML(slides: Slide[], topic: string, tone: string): string {
  const toneStyles: Record<string, { bg: string; accent: string; text: string; font: string }> = {
    professional: { bg: "#f8fafc", accent: "#1e40af", text: "#1e293b", font: "system-ui, sans-serif" },
    casual: { bg: "#fefce8", accent: "#ca8a04", text: "#422006", font: "system-ui, sans-serif" },
    academic: { bg: "#f5f3ff", accent: "#6d28d9", text: "#1e1b4b", font: "Georgia, serif" },
    pitch: { bg: "#fdf2f8", accent: "#db2777", text: "#4c0519", font: "system-ui, sans-serif" },
  };

  const style = toneStyles[tone] || toneStyles.professional;

  const slidesHTML = slides
    .map(
      (slide, i) => `
    <div class="slide">
      <div class="slide-number">${i + 1} / ${slides.length}</div>
      <h1>${slide.title}</h1>
      <div class="content">${slide.content.replace(/\n/g, "<br>")}</div>
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${topic || "Presentation"}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${style.font}; background: #e2e8f0; }
  .slide {
    width: 960px; height: 540px; margin: 20px auto;
    background: ${style.bg}; color: ${style.text};
    padding: 60px 80px; position: relative;
    page-break-after: always; box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    border-radius: 8px;
  }
  .slide-number { position: absolute; bottom: 20px; right: 30px; font-size: 12px; color: #94a3b8; }
  h1 { font-size: 32px; font-weight: 700; color: ${style.accent}; margin-bottom: 24px; border-bottom: 3px solid ${style.accent}33; padding-bottom: 12px; }
  .content { font-size: 20px; line-height: 1.8; }
  @media print {
    body { background: white; }
    .slide { box-shadow: none; border-radius: 0; margin: 0; }
  }
</style>
</head>
<body>
${slidesHTML}
</body>
</html>`;
}

export function AIPresentationMakerEngine() {
  const [data, setData] = useState<PresentationData>(() => loadData() || {
    topic: "",
    audience: "",
    tone: "professional",
    slideCount: 8,
    slides: [],
  });
  const [activeTab, setActiveTab] = useState("edit");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const updateField = useCallback(
    <K extends keyof PresentationData>(field: K, value: PresentationData[K]) => {
      setData((prev) => {
        const updated = { ...prev, [field]: value };
        saveData(updated);
        return updated;
      });
    },
    []
  );

  const updateSlide = useCallback((id: string, field: "title" | "content", value: string) => {
    setData((prev) => {
      const slides = prev.slides.map((s) => (s.id === id ? { ...s, [field]: value } : s));
      const updated = { ...prev, slides };
      saveData(updated);
      return updated;
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!data.topic.trim()) {
      toast.error("Please enter a presentation topic.");
      return;
    }
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
    const slides = generatePresentationOutline(data.topic, data.audience, data.tone, data.slideCount);
    setData((prev) => {
      const updated = { ...prev, slides };
      saveData(updated);
      return updated;
    });
    setIsGenerating(false);
    setActiveTab("slides");
    toast.success(`Generated ${slides.length} slides!`);
  }, [data.topic, data.audience, data.tone, data.slideCount]);

  const handleDownload = useCallback(() => {
    const html = generatePresentationHTML(data.slides, data.topic, data.tone);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presentation-${data.topic?.replace(/\s+/g, "-").toLowerCase() || "untitled"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Presentation downloaded! Open in browser and print to PDF.");
  }, [data.slides, data.topic, data.tone]);

  const handleCopy = useCallback(async () => {
    const html = generatePresentationHTML(data.slides, data.topic, data.tone);
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("HTML copied!");
  }, [data.slides, data.topic, data.tone]);

  const handleReset = useCallback(() => {
    setData({ topic: "", audience: "", tone: "professional", slideCount: 8, slides: [] });
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Reset.");
  }, []);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="edit" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Setup</TabsTrigger>
            <TabsTrigger value="slides" className="gap-1.5" disabled={data.slides.length === 0}>
              <Presentation className="h-3.5 w-3.5" /> Slides ({data.slides.length})
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5" disabled={data.slides.length === 0}>
              <Sparkles className="h-3.5 w-3.5" /> Preview
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            {data.slides.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>

        <TabsContent value="edit" className="mt-4 space-y-4">
          <Card><CardContent className="p-4 space-y-3">
            <Label className="text-sm font-medium">Presentation Setup</Label>
            <Input placeholder="Presentation Topic *" value={data.topic} onChange={(e) => updateField("topic", e.target.value)} />
            <Input placeholder="Target Audience (e.g. executives, students, clients)" value={data.audience} onChange={(e) => updateField("audience", e.target.value)} />
            <div className="flex gap-2 items-center">
              <Label className="text-sm font-medium shrink-0">Tone:</Label>
              {(["professional", "casual", "academic", "pitch"] as const).map((t) => (
                <Button key={t} variant={data.tone === t ? "default" : "outline"} size="sm" onClick={() => updateField("tone", t)} className="capitalize">{t}</Button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <Label className="text-sm font-medium shrink-0">Slides:</Label>
              {[5, 8, 10, 12, 15].map((n) => (
                <Button key={n} variant={data.slideCount === n ? "default" : "outline"} size="sm" onClick={() => updateField("slideCount", n)}>{n}</Button>
              ))}
            </div>
          </CardContent></Card>

          <Button onClick={handleGenerate} disabled={isGenerating || !data.topic.trim()} className="w-full gap-2" size="lg">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {isGenerating ? "Generating..." : "Generate Presentation Outline"}
          </Button>
        </TabsContent>

        <TabsContent value="slides" className="mt-4 space-y-3">
          {data.slides.map((slide, i) => (
            <Card key={slide.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="shrink-0">Slide {i + 1}</Badge>
                  <Badge className="text-[10px] capitalize">{slide.type}</Badge>
                </div>
                <Input
                  value={slide.title}
                  onChange={(e) => updateSlide(slide.id, "title", e.target.value)}
                  className="font-semibold"
                  placeholder="Slide title"
                />
                <Textarea
                  value={slide.content}
                  onChange={(e) => updateSlide(slide.id, "content", e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Slide content"
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card><CardContent className="p-0">
            <iframe
              srcDoc={generatePresentationHTML(data.slides, data.topic, data.tone)}
              className="w-full min-h-[600px] border-0"
              title="Presentation Preview"
            />
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}