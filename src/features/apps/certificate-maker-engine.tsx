"use client";

import { useState, useCallback, useRef } from "react";
import { Award, Download, Upload, Edit3, Eye, RefreshCw, FileText, User, Calendar, Star, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CertificateData {
  recipientName: string;
  title: string;
  description: string;
  issuedBy: string;
  date: string;
  certificateId: string;
  organization: string;
  template: "classic" | "modern" | "minimal";
  accentColor: string;
}

const TEMPLATES = [
  { id: "classic" as const, label: "Classic", description: "Traditional certificate design" },
  { id: "modern" as const, label: "Modern", description: "Clean, contemporary look" },
  { id: "minimal" as const, label: "Minimal", description: "Simple and elegant" },
];

const ACCENT_COLORS = ["#1a56db", "#7c3aed", "#059669", "#dc2626", "#d97706", "#0891b2", "#be185d", "#4f46e5"];

export function CertificateMakerEngine() {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [data, setData] = useState<CertificateData>({
    recipientName: "",
    title: "Certificate of Achievement",
    description: "This certificate is proudly presented to recognize outstanding performance and dedication.",
    issuedBy: "",
    date: new Date().toISOString().split("T")[0],
    certificateId: `CERT-${Date.now().toString(36).toUpperCase()}`,
    organization: "",
    template: "classic",
    accentColor: "#1a56db",
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateField = (field: keyof CertificateData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const renderCertificate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Border
    const borderWidth = data.template === "classic" ? 8 : data.template === "modern" ? 4 : 2;
    const borderMargin = data.template === "classic" ? 20 : data.template === "modern" ? 15 : 30;

    // Outer border
    ctx.strokeStyle = data.accentColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderMargin, borderMargin, width - borderMargin * 2, height - borderMargin * 2);

    if (data.template === "classic") {
      // Inner border for classic
      ctx.strokeStyle = data.accentColor + "40";
      ctx.lineWidth = 1;
      ctx.strokeRect(borderMargin + 15, borderMargin + 15, width - (borderMargin + 15) * 2, height - (borderMargin + 15) * 2);
    }

    // Organization
    if (data.organization) {
      ctx.fillStyle = data.accentColor;
      ctx.font = "bold 18px serif";
      ctx.textAlign = "center";
      ctx.fillText(data.organization.toUpperCase(), width / 2, data.template === "classic" ? 100 : 80);
    }

    // Title
    ctx.fillStyle = data.accentColor;
    ctx.font = `bold ${data.template === "minimal" ? 28 : 32}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(data.title, width / 2, data.template === "classic" ? 160 : 140);

    // Decorative line
    const lineY = data.template === "classic" ? 180 : 160;
    ctx.strokeStyle = data.accentColor + "60";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 4, lineY);
    ctx.lineTo((width * 3) / 4, lineY);
    ctx.stroke();

    // Description
    ctx.fillStyle = "#374151";
    ctx.font = "16px serif";
    ctx.textAlign = "center";
    const descLines = wrapText(ctx, data.description, width - 200);
    descLines.forEach((line, i) => {
      ctx.fillText(line, width / 2, 220 + i * 24);
    });

    // Recipient name
    const nameY = 220 + descLines.length * 24 + 30;
    ctx.fillStyle = data.accentColor;
    ctx.font = "bold 36px serif";
    ctx.textAlign = "center";
    ctx.fillText(data.recipientName || "[Recipient Name]", width / 2, nameY);

    // Underline recipient
    if (data.recipientName) {
      ctx.strokeStyle = data.accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 3, nameY + 15);
      ctx.lineTo((width * 2) / 3, nameY + 15);
      ctx.stroke();
    }

    // Footer
    const footerY = height - 100;
    ctx.fillStyle = "#6b7280";
    ctx.font = "14px serif";
    ctx.textAlign = "left";
    if (data.issuedBy) ctx.fillText(`Issued by: ${data.issuedBy}`, 80, footerY);
    ctx.textAlign = "right";
    ctx.fillText(`Date: ${data.date}`, width - 80, footerY);

    // Certificate ID
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Certificate ID: ${data.certificateId}`, width / 2, height - 30);

    // Modern accent bar
    if (data.template === "modern") {
      ctx.fillStyle = data.accentColor;
      ctx.fillRect(0, 0, width, 6);
      ctx.fillRect(0, height - 6, width, 6);
    }
  }, [data]);

  const handleDownload = () => {
    renderCertificate();
    // Use requestAnimationFrame to ensure canvas is rendered
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `certificate-${data.recipientName || "unnamed"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  const handlePreview = () => {
    renderCertificate();
    setActiveTab("preview");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
        <TabsList>
          <TabsTrigger value="edit" className="gap-1"><Edit3 className="h-3.5 w-3.5" /> Edit</TabsTrigger>
          <TabsTrigger value="preview" className="gap-1"><Eye className="h-3.5 w-3.5" /> Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4 mt-4">
          {/* Template selector */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Template</Label>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateField("template", t.id)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    data.template === t.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border/50 hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <Award className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-xs font-semibold">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Accent Color</Label>
            <div className="flex gap-1.5">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => updateField("accentColor", color)}
                  className="h-8 w-8 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: data.accentColor === color ? "#000" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Recipient Name</Label>
              <Input
                placeholder="John Doe"
                value={data.recipientName}
                onChange={(e) => updateField("recipientName", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Certificate Title</Label>
              <Input
                value={data.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={data.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Issued By</Label>
              <Input
                placeholder="Organization or person"
                value={data.issuedBy}
                onChange={(e) => updateField("issuedBy", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Organization</Label>
              <Input
                placeholder="Company name"
                value={data.organization}
                onChange={(e) => updateField("organization", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={data.date}
                onChange={(e) => updateField("date", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Certificate ID</Label>
              <Input
                value={data.certificateId}
                onChange={(e) => updateField("certificateId", e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <Button onClick={handlePreview} className="gap-2 w-full" size="lg">
            <Eye className="h-4 w-4" /> Generate Preview
          </Button>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={550}
                className="w-full h-auto border border-border rounded-lg"
              />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleDownload} className="gap-2 flex-1">
              <Download className="h-4 w-4" /> Download PNG
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setActiveTab("edit")}>
              <Edit3 className="h-4 w-4" /> Edit
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper: wrap text for canvas
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}