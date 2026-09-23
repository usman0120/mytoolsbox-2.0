"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Presentation, Plus, Trash2, Download, Eye, EyeOff, GripVertical,
  MoveUp, MoveDown, Type, ImagePlus, Palette, Layout, Play,
  ChevronLeft, ChevronRight, Monitor, FileText, Upload
} from "lucide-react";

interface Slide {
  id: string;
  type: "title" | "content" | "image" | "bullets" | "two-column" | "quote";
  title: string;
  content: string;
  imageUrl?: string;
  bullets?: string[];
}

interface PresentationData {
  title: string;
  subtitle: string;
  author: string;
  theme: string;
  slides: Slide[];
}

const THEMES = [
  { id: "modern", name: "Modern Blue", bg: "#f8fafc", accent: "#0891b2", text: "#1e293b" },
  { id: "dark", name: "Dark Mode", bg: "#0f172a", accent: "#38bdf8", text: "#e2e8f0" },
  { id: "warm", name: "Warm", bg: "#fffbeb", accent: "#d97706", text: "#292524" },
  { id: "minimal", name: "Minimal", bg: "#ffffff", accent: "#374151", text: "#111827" },
  { id: "vibrant", name: "Vibrant", bg: "#faf5ff", accent: "#7c3aed", text: "#1e1b4b" },
];

const SLIDE_TYPES = [
  { type: "title" as const, label: "Title Slide", icon: Type },
  { type: "content" as const, label: "Content", icon: FileText },
  { type: "bullets" as const, label: "Bullet Points", icon: Layout },
  { type: "two-column" as const, label: "Two Column", icon: Layout },
  { type: "image" as const, label: "Image Slide", icon: ImagePlus },
  { type: "quote" as const, label: "Quote", icon: Type },
];

const PRESET_DECKS: { name: string; data: PresentationData }[] = [
  {
    name: "🚀 Startup Pitch",
    data: {
      title: "HyperScale AI",
      subtitle: "The Next-Gen Autonomous Workflow Engine",
      author: "Founder & Team",
      theme: "modern",
      slides: [
        { id: "p1", type: "title", title: "HyperScale AI", content: "Empowering developers to build autonomous systems in minutes" },
        { id: "p2", type: "bullets", title: "The Problem", content: "", bullets: ["Developers spend 60% of time on boilerplate & config", "Fragmented API tooling causes delivery bottlenecks", "High latency across heterogeneous microservices"] },
        { id: "p3", type: "two-column", title: "Our Solution", content: "Unified AI-driven agent pipeline with automatic error correction and native credit-based billing infrastructure." },
        { id: "p4", type: "bullets", title: "Traction & Metrics", content: "", bullets: ["120,000+ Active Monthly Developers", "4.9/5 Average Developer Experience Rating", "99.98% System Availability SLA"] },
        { id: "p5", type: "quote", title: "TechCrunch Review", content: "HyperScale AI is revolutionizing how modern distributed teams ship software." },
      ],
    },
  },
  {
    name: "🏗️ Tech Architecture",
    data: {
      title: "Distributed Architecture",
      subtitle: "Cloud-Native Infrastructure & Resilience",
      author: "Principal Systems Architect",
      theme: "dark",
      slides: [
        { id: "a1", type: "title", title: "Distributed Cloud Architecture", content: "High-throughput, low-latency microservices with zero single points of failure" },
        { id: "a2", type: "bullets", title: "Key Tenets", content: "", bullets: ["Stateless compute nodes behind global anycast DNS", "Event-driven pub/sub for asynchronous task scheduling", "Multi-region fallback with automatic failover in <500ms"] },
        { id: "a3", type: "content", title: "Security & Zero Trust", content: "Mutual TLS on all internal service mesh calls, strict RBAC authorization policies, and cryptographic payload signing." },
        { id: "a4", type: "bullets", title: "Next Milestones", content: "", bullets: ["Zero-downtime database schema migrations", "Edge execution nodes deployed across 35 PoPs", "Real-time distributed tracing with OpenTelemetry"] },
      ],
    },
  },
];

export function PresentationMakerEngine() {
  const [data, setData] = useState<PresentationData>(PRESET_DECKS[0].data);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [presenterMode, setPresenterMode] = useState(false);
  const [showEditor, setShowEditor] = useState(true);

  const theme = THEMES.find((t) => t.id === data.theme) || THEMES[0];

  const addSlide = (type: Slide["type"]) => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      type,
      title: "New Slide",
      content: "",
      bullets: type === "bullets" ? ["Point 1", "Point 2"] : undefined,
    };
    const newSlides = [...data.slides];
    newSlides.splice(currentSlide + 1, 0, newSlide);
    setData((prev) => ({ ...prev, slides: newSlides }));
    setCurrentSlide(currentSlide + 1);
  };

  const removeSlide = (id: string) => {
    if (data.slides.length <= 1) return;
    const idx = data.slides.findIndex((s) => s.id === id);
    setData((prev) => ({ ...prev, slides: prev.slides.filter((s) => s.id !== id) }));
    if (currentSlide >= idx && currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const updateSlide = (id: string, field: keyof Slide, value: string | string[]) => {
    setData((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  };

  const updateBullet = (slideId: string, index: number, value: string) => {
    setData((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => {
        if (s.id !== slideId || !s.bullets) return s;
        const bullets = [...s.bullets];
        bullets[index] = value;
        return { ...s, bullets };
      }),
    }));
  };

  const addBullet = (slideId: string) => {
    setData((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => {
        if (s.id !== slideId) return s;
        return { ...s, bullets: [...(s.bullets || []), "New point"] };
      }),
    }));
  };

  const removeBullet = (slideId: string, index: number) => {
    setData((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => {
        if (s.id !== slideId || !s.bullets) return s;
        return { ...s, bullets: s.bullets.filter((_, i) => i !== index) };
      }),
    }));
  };

  const moveSlide = (id: string, direction: "up" | "down") => {
    const idx = data.slides.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= data.slides.length) return;
    const slides = [...data.slides];
    [slides[idx], slides[newIdx]] = [slides[newIdx], slides[idx]];
    setData((prev) => ({ ...prev, slides }));
    setCurrentSlide(newIdx);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const slidesHtml = data.slides
      .map((slide, i) => {
        let bodyHtml = "";
        switch (slide.type) {
          case "title":
            bodyHtml = `<h1 style="font-size:48px;margin:0;">${slide.title}</h1><p style="font-size:24px;color:#64748b;margin-top:16px;">${slide.content}</p>`;
            break;
          case "bullets":
            bodyHtml = `<h2 style="margin-bottom:24px;">${slide.title}</h2><ul style="font-size:20px;line-height:2;">${(slide.bullets || []).map((b) => `<li>${b}</li>`).join("")}</ul>`;
            break;
          case "quote":
            bodyHtml = `<blockquote style="font-size:32px;font-style:italic;border-left:4px solid ${theme.accent};padding-left:24px;margin:40px 0;">${slide.content}</blockquote><p style="color:#64748b;">— ${slide.title}</p>`;
            break;
          case "two-column":
            bodyHtml = `<h2 style="margin-bottom:24px;">${slide.title}</h2><div style="display:flex;gap:40px;"><div style="flex:1;font-size:18px;">${slide.content}</div><div style="flex:1;font-size:18px;">${slide.content}</div></div>`;
            break;
          default:
            bodyHtml = `<h2 style="margin-bottom:24px;">${slide.title}</h2><p style="font-size:20px;line-height:1.8;">${slide.content}</p>`;
        }
        return `<div class="slide" style="width:960px;height:540px;background:${theme.bg};color:${theme.text};display:flex;align-items:center;justify-content:center;padding:60px;box-sizing:border-box;page-break-after:always;text-align:center;"><div>${bodyHtml}</div><div style="position:absolute;bottom:20px;right:40px;font-size:12px;color:#94a3b8;">${i + 1} / ${data.slides.length}</div></div>`;
      })
      .join("");

    printWindow.document.write(`
      <html><head>
        <style>
          @page { size: 960px 540px; margin: 0; }
          body { margin: 0; font-family: Inter, sans-serif; }
          .slide { position: relative; }
        </style></head>
        <body>${slidesHtml}</body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const slide = data.slides[currentSlide];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium flex items-center gap-1.5"><Palette className="h-4 w-4" /> Theme:</span>
          <div className="flex gap-1">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`w-7 h-7 rounded-full border-2 transition-all ${data.theme === t.id ? "border-foreground scale-110" : "border-transparent"}`}
                style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.bg})` }}
                onClick={() => setData((prev) => ({ ...prev, theme: t.id }))}
                title={t.name}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Presets:</span>
          {PRESET_DECKS.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setData(preset.data);
                setCurrentSlide(0);
              }}
            >
              {preset.name}
            </Button>
          ))}
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => setShowEditor(!showEditor)}>
          {showEditor ? <EyeOff className="h-4 w-4 mr-1.5" /> : <Eye className="h-4 w-4 mr-1.5" />}
          {showEditor ? "Hide Editor" : "Show Editor"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPresenterMode(!presenterMode)}>
          <Monitor className="h-4 w-4 mr-1.5" /> {presenterMode ? "Exit Presenter" : "Present"}
        </Button>
        <Button size="sm" onClick={exportPDF} className="gap-1.5">
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      <div className={`grid gap-6 ${showEditor ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
        {/* Slide Navigator */}
        <div className="space-y-2 order-2 lg:order-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Slides ({data.slides.length})</span>
            <div className="flex gap-1">
              {SLIDE_TYPES.map((st) => (
                <Button key={st.type} variant="ghost" size="icon" className="h-7 w-7" onClick={() => addSlide(st.type)} title={st.label}>
                  <st.icon className="h-3.5 w-3.5" />
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5 max-h-125 overflow-y-auto">
            {data.slides.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                  i === currentSlide ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/50"
                }`}
                onClick={() => setCurrentSlide(i)}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="w-5 text-center text-muted-foreground">{i + 1}</span>
                <span className="flex-1 truncate">{s.title || "Untitled"}</span>
                <Badge variant="outline" className="text-[10px] shrink-0">{s.type}</Badge>
                <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 text-destructive" onClick={(e) => { e.stopPropagation(); removeSlide(s.id); }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Preview */}
        <div className={`${presenterMode ? "lg:col-span-3" : "lg:col-span-2"} order-1 lg:order-2`}>
          {presenterMode ? (
            <div
              className="w-full aspect-video rounded-xl flex flex-col items-center justify-center p-12 text-center relative"
              style={{ backgroundColor: theme.bg, color: theme.text }}
            >
              {slide.type === "title" && (
                <>
                  <h1 className="text-5xl font-bold mb-4">{slide.title}</h1>
                  <p className="text-2xl opacity-70">{slide.content}</p>
                </>
              )}
              {slide.type === "bullets" && (
                <div className="text-left w-full max-w-2xl">
                  <h2 className="text-3xl font-bold mb-8">{slide.title}</h2>
                  <ul className="space-y-4 text-xl">
                    {(slide.bullets || []).map((b, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: theme.accent }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {slide.type === "quote" && (
                <>
                  <blockquote className="text-4xl italic max-w-2xl leading-relaxed border-l-4 pl-8" style={{ borderColor: theme.accent }}>
                    {slide.content}
                  </blockquote>
                  <p className="text-xl mt-6 opacity-70">— {slide.title}</p>
                </>
              )}
              {slide.type === "two-column" && (
                <div className="w-full max-w-4xl">
                  <h2 className="text-3xl font-bold mb-8">{slide.title}</h2>
                  <div className="grid grid-cols-2 gap-8 text-left">
                    <div className="text-lg">{slide.content}</div>
                    <div className="text-lg">{slide.content}</div>
                  </div>
                </div>
              )}
              {slide.type === "content" && (
                <>
                  <h2 className="text-3xl font-bold mb-6">{slide.title}</h2>
                  <p className="text-xl max-w-2xl leading-relaxed opacity-80">{slide.content}</p>
                </>
              )}
              {slide.type === "image" && (
                <>
                  <h2 className="text-3xl font-bold mb-6">{slide.title}</h2>
                  <div className="w-64 h-48 rounded-lg border-2 border-dashed flex items-center justify-center opacity-50">
                    <ImagePlus className="h-12 w-12" />
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm opacity-60">{currentSlide + 1} / {data.slides.length}</span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentSlide(Math.min(data.slides.length - 1, currentSlide + 1))} disabled={currentSlide === data.slides.length - 1}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div
                  className="w-full aspect-video rounded-xl flex flex-col items-center justify-center p-8 text-center relative"
                  style={{ backgroundColor: theme.bg, color: theme.text }}
                >
                  {slide.type === "title" && (
                    <>
                      <h1 className="text-3xl font-bold mb-2">{slide.title}</h1>
                      <p className="text-lg opacity-70">{slide.content}</p>
                    </>
                  )}
                  {slide.type === "bullets" && (
                    <div className="text-left w-full max-w-lg">
                      <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
                      <ul className="space-y-2 text-sm">
                        {(slide.bullets || []).map((b, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: theme.accent }} />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {slide.type === "quote" && (
                    <>
                      <blockquote className="text-2xl italic max-w-lg leading-relaxed border-l-4 pl-6" style={{ borderColor: theme.accent }}>
                        {slide.content}
                      </blockquote>
                      <p className="text-sm mt-4 opacity-70">— {slide.title}</p>
                    </>
                  )}
                  {slide.type === "two-column" && (
                    <div className="w-full max-w-2xl">
                      <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
                      <div className="grid grid-cols-2 gap-6 text-left">
                        <div className="text-sm">{slide.content}</div>
                        <div className="text-sm">{slide.content}</div>
                      </div>
                    </div>
                  )}
                  {slide.type === "content" && (
                    <>
                      <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
                      <p className="text-sm max-w-lg leading-relaxed opacity-80">{slide.content}</p>
                    </>
                  )}
                  {slide.type === "image" && (
                    <>
                      <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
                      <div className="w-48 h-32 rounded-lg border-2 border-dashed flex items-center justify-center opacity-40">
                        <ImagePlus className="h-8 w-8" />
                      </div>
                    </>
                  )}

                  {/* Navigation */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs opacity-60">{currentSlide + 1} / {data.slides.length}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentSlide(Math.min(data.slides.length - 1, currentSlide + 1))} disabled={currentSlide === data.slides.length - 1}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Slide Editor */}
        {showEditor && !presenterMode && (
          <div className="space-y-3 order-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Slide Editor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Slide title"
                  value={slide.title}
                  onChange={(e) => updateSlide(slide.id, "title", e.target.value)}
                />
                {(slide.type === "content" || slide.type === "quote" || slide.type === "two-column") && (
                  <Textarea
                    placeholder="Slide content"
                    value={slide.content}
                    onChange={(e) => updateSlide(slide.id, "content", e.target.value)}
                    rows={4}
                  />
                )}
                {slide.type === "bullets" && (
                  <div className="space-y-2">
                    {(slide.bullets || []).map((bullet, i) => (
                      <div key={i} className="flex gap-1">
                        <Input
                          value={bullet}
                          onChange={(e) => updateBullet(slide.id, i, e.target.value)}
                          className="text-sm"
                        />
                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive" onClick={() => removeBullet(slide.id, i)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addBullet(slide.id)} className="w-full">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Bullet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => moveSlide(slide.id, "up")} disabled={currentSlide === 0} className="flex-1">
                <MoveUp className="h-3.5 w-3.5 mr-1" /> Move Up
              </Button>
              <Button variant="outline" size="sm" onClick={() => moveSlide(slide.id, "down")} disabled={currentSlide === data.slides.length - 1} className="flex-1">
                <MoveDown className="h-3.5 w-3.5 mr-1" /> Move Down
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}