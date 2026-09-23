"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Award,
  Download,
  Upload,
  Eye,
  RefreshCw,
  FileText,
  User,
  Calendar,
  Star,
  Medal,
  Sparkles,
  Printer,
  ShieldCheck,
  Check,
  Sliders,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export interface CertificateData {
  recipientName: string;
  title: string;
  description: string;
  issuedBy: string;
  signatoryTitle: string;
  date: string;
  certificateId: string;
  organization: string;
  template: "classic" | "modern" | "gold" | "tech" | "diploma";
  accentColor: string;
}

const TEMPLATES = [
  { id: "classic" as const, label: "Classic Formal", desc: "Ornate borders & traditional seals" },
  { id: "modern" as const, label: "Modern Minimal", desc: "Clean geometric accents & typography" },
  { id: "gold" as const, label: "Executive Luxury", desc: "Dark obsidian canvas with gold highlights" },
  { id: "tech" as const, label: "Tech Bootcamp", desc: "Modern gradient with digital cryptographic badge" },
  { id: "diploma" as const, label: "Academic Diploma", desc: "Traditional university honors certificate" },
];

const ACCENT_COLORS = [
  "#1e3a8a", // Navy
  "#0f766e", // Teal
  "#b45309", // Amber Gold
  "#7e22ce", // Purple
  "#be123c", // Crimson
  "#0f172a", // Obsidian
];

const CERTIFICATE_PRESETS: Record<string, { label: string; data: Partial<CertificateData> }> = {
  employee: {
    label: "Employee of the Month",
    data: {
      title: "Certificate of Outstanding Achievement",
      recipientName: "Alexander Vance",
      description: "In recognition of exceptional leadership, dedication, and exceeding operational milestones for the enterprise.",
      issuedBy: "Elena Rostova",
      signatoryTitle: "Chief Executive Officer",
      organization: "Apex Enterprise Solutions",
      template: "classic",
      accentColor: "#1e3a8a",
    },
  },
  bootcamp: {
    label: "Software Engineering Bootcamp",
    data: {
      title: "Full-Stack Software Engineer Credential",
      recipientName: "Sophia Chen",
      description: "Successfully completed 480 hours of intensive engineering in distributed systems, Next.js, TypeScript, and microservice architecture.",
      issuedBy: "Marcus Thorne",
      signatoryTitle: "Head of Engineering Curriculum",
      organization: "CodeMatrix Academy of Engineering",
      template: "tech",
      accentColor: "#0f766e",
    },
  },
  hackathon: {
    label: "Global Hackathon 1st Place Winner",
    data: {
      title: "First Place Grand Champion Award",
      recipientName: "Team NeuralSynth",
      description: "Awarded for the most groundbreaking artificial intelligence application and architectural excellence.",
      issuedBy: "Dr. Rachel Green",
      signatoryTitle: "Hackathon Chairperson",
      organization: "Global AI Innovators Consortium",
      template: "gold",
      accentColor: "#b45309",
    },
  },
  diploma: {
    label: "University Academic Honor Roll",
    data: {
      title: "Dean's Distinguished Honor Roll",
      recipientName: "David K. Miller",
      description: "Conferred for maintaining highest academic standing with Summa Cum Laude distinction in the College of Computing.",
      issuedBy: "Dean Robert Sterling",
      signatoryTitle: "Dean of Academic Affairs",
      organization: "St. Jude University of Technology",
      template: "diploma",
      accentColor: "#be123c",
    },
  },
};

export function CertificateMakerEngine() {
  const [data, setData] = useState<CertificateData>(() => ({
    recipientName: "Alexander Vance",
    title: "Certificate of Outstanding Achievement",
    description: "In recognition of exceptional leadership, dedication, and exceeding operational milestones for the enterprise.",
    issuedBy: "Elena Rostova",
    signatoryTitle: "Chief Executive Officer",
    date: new Date().toISOString().split("T")[0],
    certificateId: `CERT-${Date.now().toString(36).toUpperCase()}`,
    organization: "Apex Enterprise Solutions",
    template: "classic",
    accentColor: "#1e3a8a",
  }));

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateField = (field: keyof CertificateData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const loadPreset = (key: string) => {
    const preset = CERTIFICATE_PRESETS[key];
    if (!preset) return;
    setData((prev) => ({
      ...prev,
      ...preset.data,
      date: new Date().toISOString().split("T")[0],
      certificateId: `CERT-${Date.now().toString(36).toUpperCase()}`,
    }));
    toast.success(`Loaded preset: ${preset.label}`);
  };

  // High-Resolution 1600x1100 Canvas Renderer
  const renderCertificate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Background color
    if (data.template === "gold") {
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
    }

    // Outer & Inner Borders
    if (data.template === "classic") {
      // Classic Ornamental Dual Border
      ctx.strokeStyle = data.accentColor;
      ctx.lineWidth = 14;
      ctx.strokeRect(40, 40, W - 80, H - 80);

      ctx.strokeStyle = "#d4af37"; // Gold pinstripe
      ctx.lineWidth = 3;
      ctx.strokeRect(55, 55, W - 110, H - 110);

      ctx.strokeStyle = data.accentColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(62, 62, W - 124, H - 124);
    } else if (data.template === "gold") {
      // Dark Obsidian + Metallic Gold Border
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, W - 80, H - 80);

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(52, 52, W - 104, H - 104);
    } else if (data.template === "tech") {
      // Tech Geometric Border with Cut Corners
      ctx.strokeStyle = data.accentColor;
      ctx.lineWidth = 6;
      ctx.strokeRect(35, 35, W - 70, H - 70);

      // Top corner decorations
      ctx.fillStyle = data.accentColor;
      ctx.fillRect(35, 35, 30, 8);
      ctx.fillRect(35, 35, 8, 30);
      ctx.fillRect(W - 65, 35, 30, 8);
      ctx.fillRect(W - 43, 35, 8, 30);
    } else if (data.template === "diploma") {
      // Formal Academic Dual Border
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 10;
      ctx.strokeRect(35, 35, W - 70, H - 70);
      ctx.strokeStyle = data.accentColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, W - 96, H - 96);
    } else {
      // Modern Minimal
      ctx.strokeStyle = data.accentColor;
      ctx.lineWidth = 8;
      ctx.strokeRect(30, 30, W - 60, H - 60);
    }

    // Organization Header
    ctx.textAlign = "center";
    ctx.fillStyle = data.template === "gold" ? "#94a3b8" : "#475569";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText((data.organization || "ACADEMIC & PROFESSIONAL CREDENTIAL").toUpperCase(), W / 2, 140);
    ctx.letterSpacing = "0px";

    // Certificate Title
    ctx.fillStyle = data.template === "gold" ? "#f8fafc" : data.accentColor;
    ctx.font = "bold 44px Georgia, serif";
    ctx.fillText(data.title || "Certificate of Achievement", W / 2, 220);

    // Subtitle Line
    ctx.fillStyle = data.template === "gold" ? "#cbd5e1" : "#64748b";
    ctx.font = "italic 20px Georgia, serif";
    ctx.fillText("This official credential is proudly presented to", W / 2, 290);

    // Recipient Name
    ctx.fillStyle = data.template === "gold" ? "#fbbf24" : "#0f172a";
    ctx.font = "bold 58px Georgia, serif";
    ctx.fillText(data.recipientName || "Recipient Full Name", W / 2, 380);

    // Decorative underline beneath name
    ctx.strokeStyle = data.template === "gold" ? "#d4af37" : data.accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 240, 410);
    ctx.lineTo(W / 2 + 240, 410);
    ctx.stroke();

    // Citation / Description
    ctx.fillStyle = data.template === "gold" ? "#94a3b8" : "#334155";
    ctx.font = "20px system-ui, sans-serif";
    const desc = data.description || "For exemplary achievement and dedication.";
    // Simple wrap
    const words = desc.split(" ");
    let line1 = "";
    let line2 = "";
    for (const w of words) {
      if ((line1 + w).length < 65) line1 += w + " ";
      else line2 += w + " ";
    }
    ctx.fillText(line1.trim(), W / 2, 480);
    if (line2.trim()) ctx.fillText(line2.trim(), W / 2, 515);

    // Ornamental Seal in Center
    ctx.beginPath();
    ctx.arc(W / 2, 630, 44, 0, Math.PI * 2);
    ctx.fillStyle = data.template === "gold" ? "#d4af37" : data.accentColor;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(W / 2, 630, 36, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillText("★", W / 2, 637);

    // Signature 1 (Issuer)
    ctx.fillStyle = data.template === "gold" ? "#f1f5f9" : "#0f172a";
    ctx.font = "italic 26px 'Brush Script MT', cursive, Georgia";
    ctx.fillText(data.issuedBy || "Official Signatory", 340, 800);

    ctx.strokeStyle = data.template === "gold" ? "#475569" : "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(220, 815);
    ctx.lineTo(460, 815);
    ctx.stroke();

    ctx.fillStyle = data.template === "gold" ? "#94a3b8" : "#64748b";
    ctx.font = "bold 15px system-ui, sans-serif";
    ctx.fillText(data.signatoryTitle || "Executive Signatory", 340, 840);
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText(data.organization || "Issuing Body", 340, 860);

    // Signature 2 (Date & Credential ID)
    ctx.fillStyle = data.template === "gold" ? "#f1f5f9" : "#0f172a";
    ctx.font = "18px monospace";
    ctx.fillText(data.date, W - 340, 800);

    ctx.strokeStyle = data.template === "gold" ? "#475569" : "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W - 460, 815);
    ctx.lineTo(W - 220, 815);
    ctx.stroke();

    ctx.fillStyle = data.template === "gold" ? "#94a3b8" : "#64748b";
    ctx.font = "bold 15px system-ui, sans-serif";
    ctx.fillText("DATE OF CONFERRAL", W - 340, 840);

    // Credential ID footer
    ctx.font = "12px monospace";
    ctx.fillText(`Verification ID: ${data.certificateId}`, W / 2, 940);
  }, [data]);

  useEffect(() => {
    renderCertificate();
  }, [renderCertificate]);

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${data.recipientName.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
    toast.success("Certificate PNG downloaded in high resolution!");
  };

  return (
    <div className="space-y-6">
      {/* Top Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">Professional Credential & Certificate Studio</h2>
              <Badge variant="outline" className="text-[10px] uppercase font-semibold text-blue-600 border-blue-500/30">
                Vector High-Res
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Design certificates of achievement, diplomas, and awards with vector seals, signatures, and instant export.
            </p>
          </div>
        </div>

        {/* Preset Selector & Downloads */}
        <div className="flex flex-wrap items-center gap-2">
          <Select onValueChange={(v: any) => v && loadPreset(String(v))}>
            <SelectTrigger className="h-8 w-44 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-blue-500" />
              <span>Load Certificate Preset</span>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CERTIFICATE_PRESETS).map(([k, p]) => (
                <SelectItem key={k} value={k} className="text-xs">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" onClick={downloadPNG} className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-3.5 w-3.5" />
            Download PNG (1600x1100)
          </Button>

          <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8 text-xs gap-1.5">
            <Printer className="h-3.5 w-3.5 text-muted-foreground" />
            Print Certificate
          </Button>
        </div>
      </div>

      {/* Editor & Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-600" />
                Certificate Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {/* Template Style */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Visual Template Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => updateField("template", tpl.id)}
                      className={`text-left p-2 rounded-lg border text-xs transition-all ${
                        data.template === tpl.id
                          ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="font-medium truncate">{tpl.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{tpl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color Palette */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Accent Theme Color</Label>
                <div className="flex items-center gap-2 h-7">
                  {ACCENT_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => updateField("accentColor", col)}
                      className={`h-5 w-5 rounded-full border transition-transform ${
                        data.accentColor === col ? "scale-125 border-foreground shadow-xs" : "border-transparent"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Organization */}
              <div className="space-y-1">
                <Label className="text-xs">Issuing Organization / Institution</Label>
                <Input
                  value={data.organization}
                  onChange={(e) => updateField("organization", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Certificate Title */}
              <div className="space-y-1">
                <Label className="text-xs">Certificate Title</Label>
                <Input
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="h-8 text-xs font-semibold"
                />
              </div>

              {/* Recipient Name */}
              <div className="space-y-1">
                <Label className="text-xs">Recipient Full Name</Label>
                <Input
                  value={data.recipientName}
                  onChange={(e) => updateField("recipientName", e.target.value)}
                  className="h-8 text-xs font-bold"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label className="text-xs">Citation / Commendation Text</Label>
                <Textarea
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="min-h-16 text-xs"
                />
              </div>

              {/* Signatures Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Signatory Name</Label>
                  <Input
                    value={data.issuedBy}
                    onChange={(e) => updateField("issuedBy", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Signatory Title</Label>
                  <Input
                    value={data.signatoryTitle}
                    onChange={(e) => updateField("signatoryTitle", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Date & ID */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Conferral Date</Label>
                  <Input
                    type="date"
                    value={data.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Credential ID</Label>
                  <Input
                    value={data.certificateId}
                    onChange={(e) => updateField("certificateId", e.target.value)}
                    className="h-8 text-xs font-mono text-[11px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: High-Res Interactive Canvas Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/60 overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-blue-500" />
                  Live Credential Render
                </CardTitle>
                <CardDescription className="text-xs">
                  Pixel-perfect high-DPI canvas preview (auto-adjusts for print)
                </CardDescription>
              </div>
              <Button size="sm" variant="ghost" onClick={renderCertificate} className="h-7 text-xs gap-1">
                <RefreshCw className="h-3 w-3" />
                Redraw
              </Button>
            </CardHeader>
            <CardContent className="p-4 bg-muted/20 flex items-center justify-center">
              <div className="w-full max-w-[700px] shadow-2xl rounded-lg overflow-hidden border border-border/80">
                <canvas
                  ref={canvasRef}
                  width={1600}
                  height={1100}
                  className="w-full h-auto block"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}