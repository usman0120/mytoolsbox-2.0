"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  FileUser, Download, Plus, Trash2, GripVertical, Eye, EyeOff,
  MoveUp, MoveDown, Upload, Palette, Check, Briefcase, GraduationCap,
  Mail, Phone, MapPin, Globe, Sparkles, Layout, Type
} from "lucide-react";

interface ResumeSection {
  id: string;
  type: "summary" | "experience" | "education" | "skills" | "projects" | "custom";
  title: string;
  content: string;
}

interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  sections: ResumeSection[];
}

interface Template {
  id: string;
  name: string;
  primaryColor: string;
  font: string;
  layout: "single" | "two-column";
}

const TEMPLATES: Template[] = [
  { id: "modern", name: "Modern", primaryColor: "#0891b2", font: "Inter", layout: "single" },
  { id: "classic", name: "Classic", primaryColor: "#1e3a5f", font: "Georgia", layout: "single" },
  { id: "minimal", name: "Minimal", primaryColor: "#374151", font: "Inter", layout: "single" },
  { id: "creative", name: "Creative", primaryColor: "#7c3aed", font: "Inter", layout: "two-column" },
  { id: "executive", name: "Executive", primaryColor: "#0f172a", font: "Georgia", layout: "single" },
];

const SECTION_TYPES = [
  { type: "summary" as const, label: "Professional Summary", icon: FileUser },
  { type: "experience" as const, label: "Work Experience", icon: Briefcase },
  { type: "education" as const, label: "Education", icon: GraduationCap },
  { type: "skills" as const, label: "Skills", icon: Check },
  { type: "projects" as const, label: "Projects", icon: Layout },
  { type: "custom" as const, label: "Custom Section", icon: Type },
];

export function ResumeBuilderEngine() {
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [showPreview, setShowPreview] = useState(true);
  const [data, setData] = useState<ResumeData>({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    summary: "",
    sections: [
      { id: "1", type: "experience", title: "Work Experience", content: "" },
      { id: "2", type: "education", title: "Education", content: "" },
      { id: "3", type: "skills", title: "Skills", content: "" },
    ],
  });
  const resumeRef = useRef<HTMLDivElement>(null);

  const updateField = (field: keyof ResumeData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const addSection = (type: ResumeSection["type"]) => {
    const sectionType = SECTION_TYPES.find((s) => s.type === type)!;
    const newSection: ResumeSection = {
      id: crypto.randomUUID(),
      type,
      title: sectionType.label,
      content: "",
    };
    setData((prev) => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  const updateSection = (id: string, field: "title" | "content", value: string) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  };

  const removeSection = (id: string) => {
    setData((prev) => ({ ...prev, sections: prev.sections.filter((s) => s.id !== id) }));
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    setData((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.sections.length) return prev;
      const sections = [...prev.sections];
      [sections[idx], sections[newIdx]] = [sections[newIdx], sections[idx]];
      return { ...prev, sections };
    });
  };

  const exportPDF = useCallback(() => {
    const content = resumeRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const styles = `
      <style>
        body { font-family: ${template.font}, sans-serif; color: #1f2937; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid ${template.primaryColor}; padding-bottom: 16px; }
        .name { font-size: 28px; font-weight: 700; color: ${template.primaryColor}; margin: 0; }
        .title { font-size: 16px; color: #6b7280; margin: 4px 0 0; }
        .contact { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-top: 8px; font-size: 13px; color: #4b5563; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 16px; font-weight: 600; color: ${template.primaryColor}; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .section-content { font-size: 14px; white-space: pre-wrap; }
        @media print { body { padding: 0; } }
      </style>
    `;

    const contactHtml = [data.email, data.phone, data.location, data.website]
      .filter(Boolean)
      .map((c) => `<span>${c}</span>`)
      .join(" · ");

    const sectionsHtml = data.sections
      .map(
        (s) => `
      <div class="section">
        <div class="section-title">${s.title}</div>
        <div class="section-content">${s.content || "(Empty)"}</div>
      </div>`
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>${styles}</head>
        <body>
          <div class="header">
            <h1 class="name">${data.name || "Your Name"}</h1>
            <p class="title">${data.title || "Your Title"}</p>
            <div class="contact">${contactHtml}</div>
          </div>
          ${data.summary ? `<div class="section"><div class="section-title">Professional Summary</div><div class="section-content">${data.summary}</div></div>` : ""}
          ${sectionsHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }, [data, template]);

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <Palette className="h-4 w-4" /> Template:
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {TEMPLATES.map((t) => (
            <Badge
              key={t.id}
              variant={template.id === t.id ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => setTemplate(t)}
            >
              {t.name}
            </Badge>
          ))}
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? <EyeOff className="h-4 w-4 mr-1.5" /> : <Eye className="h-4 w-4 mr-1.5" />}
          {showPreview ? "Hide Preview" : "Show Preview"}
        </Button>
        <Button size="sm" onClick={exportPDF} className="gap-1.5">
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      <div className={`grid gap-6 ${showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Personal Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Full Name" value={data.name} onChange={(e) => updateField("name", e.target.value)} />
                <Input placeholder="Professional Title" value={data.title} onChange={(e) => updateField("title", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Email" type="email" value={data.email} onChange={(e) => updateField("email", e.target.value)} />
                <Input placeholder="Phone" value={data.phone} onChange={(e) => updateField("phone", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Location" value={data.location} onChange={(e) => updateField("location", e.target.value)} />
                <Input placeholder="Website / LinkedIn" value={data.website} onChange={(e) => updateField("website", e.target.value)} />
              </div>
              <Textarea
                placeholder="Professional summary (2-3 sentences about your career highlights)"
                value={data.summary}
                onChange={(e) => updateField("summary", e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Sections */}
          {data.sections.map((section, idx) => (
            <Card key={section.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, "title", e.target.value)}
                      className="h-8 text-sm font-medium border-none px-0 focus-visible:ring-0 w-48"
                    />
                    <Badge variant="secondary" className="text-xs capitalize">{section.type}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSection(section.id, "up")} disabled={idx === 0}>
                      <MoveUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSection(section.id, "down")} disabled={idx === data.sections.length - 1}>
                      <MoveDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeSection(section.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={`Enter ${section.title.toLowerCase()} details...`}
                  value={section.content}
                  onChange={(e) => updateSection(section.id, "content", e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          ))}

          {/* Add Section */}
          <div className="flex flex-wrap gap-2">
            {SECTION_TYPES.map((st) => (
              <Button key={st.type} variant="outline" size="sm" onClick={() => addSection(st.type)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> {st.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-4 h-fit">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-muted/30">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  ref={resumeRef}
                  className="p-6 text-sm"
                  style={{ fontFamily: template.font }}
                >
                  {/* Header */}
                  <div className="text-center mb-5 pb-4 border-b-2" style={{ borderColor: template.primaryColor }}>
                    <h2 className="text-2xl font-bold" style={{ color: template.primaryColor }}>
                      {data.name || "Your Name"}
                    </h2>
                    <p className="text-muted-foreground mt-0.5">{data.title || "Your Title"}</p>
                    <div className="flex justify-center gap-3 flex-wrap mt-2 text-xs text-muted-foreground">
                      {data.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{data.email}</span>}
                      {data.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{data.phone}</span>}
                      {data.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{data.location}</span>}
                      {data.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{data.website}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {data.summary && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider mb-1.5" style={{ color: template.primaryColor }}>
                        Professional Summary
                      </h3>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{data.summary}</p>
                    </div>
                  )}

                  {/* Sections */}
                  {data.sections.map((section) => (
                    <div key={section.id} className="mb-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider mb-1.5 border-b pb-1" style={{ color: template.primaryColor, borderColor: template.primaryColor + "30" }}>
                        {section.title}
                      </h3>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {section.content || "(No content yet)"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}