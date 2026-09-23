"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileUser, Download, Plus, Trash2, Eye, EyeOff,
  MoveUp, MoveDown, Palette, Check, Briefcase, GraduationCap,
  Sparkles, Layout, Type, ShieldCheck, RefreshCw, Copy, UploadCloud
} from "lucide-react";
import { toast } from "sonner";

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string;
}

interface EducationItem {
  id: string;
  degree: string;
  school: string;
  year: string;
  details: string;
}

interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  experiences: ExperienceItem[];
  educations: EducationItem[];
  skills: string[];
}

interface Template {
  id: string;
  name: string;
  primaryColor: string;
  font: string;
  accentBg: string;
}

const TEMPLATES: Template[] = [
  { id: "modern", name: "Modern Cyan", primaryColor: "#0891b2", font: "Inter", accentBg: "bg-cyan-50 dark:bg-cyan-950/20" },
  { id: "classic", name: "Executive Slate", primaryColor: "#1e3a5f", font: "Georgia", accentBg: "bg-slate-50 dark:bg-slate-900/40" },
  { id: "emerald", name: "Emerald Pro", primaryColor: "#059669", font: "Inter", accentBg: "bg-emerald-50 dark:bg-emerald-950/20" },
  { id: "violet", name: "Creative Violet", primaryColor: "#7c3aed", font: "Inter", accentBg: "bg-violet-50 dark:bg-violet-950/20" },
  { id: "minimal", name: "Minimalist Mono", primaryColor: "#18181b", font: "Courier New", accentBg: "bg-muted/30" },
];

const SAMPLE_PROFILE: ResumeData = {
  name: "Alex Morgan",
  title: "Senior Full Stack Engineer & Cloud Architect",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 234-5678",
  location: "San Francisco, CA (Open to Remote)",
  website: "https://github.com/alexmorgan",
  summary:
    "High-impact Full Stack Engineer with 7+ years of experience leading engineering teams in designing, deploying, and scaling enterprise distributed web platforms. Reduced server latency by 42% and supported over 2.5M monthly active users.",
  experiences: [
    {
      id: "exp-1",
      role: "Lead Full Stack Engineer",
      company: "Apex Cloud Systems",
      location: "San Francisco, CA",
      startDate: "2022",
      endDate: "Present",
      highlights:
        "• Architected scalable microservices handling 12,000 requests/sec with 99.99% uptime SLA.\n• Reduced infrastructure cloud expenses by 35% through container auto-scaling and Redis caching.\n• Mentored team of 8 junior and mid-level engineers in test-driven development and CI/CD best practices.",
    },
    {
      id: "exp-2",
      role: "Senior Frontend Engineer",
      company: "Velocity Interactive",
      location: "Austin, TX",
      startDate: "2019",
      endDate: "2022",
      highlights:
        "• Spearheaded rewrite of core client dashboard in Next.js & TypeScript, boosting Lighthouse performance scores from 58 to 96.\n• Implemented end-to-end automated testing pipelines with Vitest and Playwright.",
    },
  ],
  educations: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science",
      school: "University of California, Berkeley",
      year: "2019",
      details: "Magna Cum Laude · Dean's Honors List · Chair of ACM Student Chapter",
    },
  ],
  skills: [
    "TypeScript", "React", "Next.js", "Node.js", "Go", "Docker", "Kubernetes",
    "PostgreSQL", "Redis", "AWS Cloud", "GraphQL", "CI/CD Pipelines", "System Design"
  ],
};

export function ResumeBuilderEngine() {
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [showPreview, setShowPreview] = useState(true);
  const [newSkill, setNewSkill] = useState("");
  const [data, setData] = useState<ResumeData>(SAMPLE_PROFILE);
  const resumeRef = useRef<HTMLDivElement>(null);

  const updateField = (field: keyof ResumeData, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const addExperience = () => {
    const item: ExperienceItem = {
      id: `exp_${Date.now()}`,
      role: "Software Engineer",
      company: "Company Name",
      location: "City, State",
      startDate: "2023",
      endDate: "Present",
      highlights: "• Key accomplishment or project responsibility.\n• Quantifiable business metric or technical improvement.",
    };
    setData((prev) => ({ ...prev, experiences: [item, ...prev.experiences] }));
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: string) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  const deleteExperience = (id: string) => {
    setData((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== id) }));
  };

  const addEducation = () => {
    const item: EducationItem = {
      id: `edu_${Date.now()}`,
      degree: "Degree Name",
      school: "University / Institution",
      year: "2023",
      details: "Honors or relevant coursework",
    };
    setData((prev) => ({ ...prev, educations: [...prev.educations, item] }));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setData((prev) => ({
      ...prev,
      educations: prev.educations.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  const deleteEducation = (id: string) => {
    setData((prev) => ({ ...prev, educations: prev.educations.filter((e) => e.id !== id) }));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (!data.skills.includes(newSkill.trim())) {
      setData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  // ATS Score Calculation
  const atsMetrics = useMemo(() => {
    let score = 0;
    const checks: { label: string; passed: boolean }[] = [];

    // Contact completeness
    const hasContact = Boolean(data.name && data.email && data.phone && data.location);
    if (hasContact) score += 20;
    checks.push({ label: "Full Contact Information", passed: hasContact });

    // Summary length & quality
    const summaryWords = data.summary.trim().split(/\s+/).filter(Boolean).length;
    const goodSummary = summaryWords >= 20 && summaryWords <= 100;
    if (goodSummary) score += 20;
    checks.push({ label: "Concise Summary (20-100 words)", passed: goodSummary });

    // Experience completeness
    const hasExp = data.experiences.length >= 1;
    if (hasExp) score += 25;
    checks.push({ label: "Detailed Work Experience", passed: hasExp });

    // Quantifiable metrics in highlights
    const allHighlights = data.experiences.map((e) => e.highlights).join(" ");
    const hasMetrics = /%|\$|\b\d{1,4}\b/.test(allHighlights);
    if (hasMetrics) score += 20;
    checks.push({ label: "Quantified Impact Metrics (%, $, numbers)", passed: hasMetrics });

    // Technical skills count
    const hasSkills = data.skills.length >= 5;
    if (hasSkills) score += 15;
    checks.push({ label: "5+ Targeted Keywords / Skills", passed: hasSkills });

    return { score, checks };
  }, [data]);

  const exportPDF = useCallback(() => {
    const content = resumeRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const styles = `
      <style>
        body { font-family: ${template.font}, system-ui, sans-serif; color: #1e293b; line-height: 1.5; max-width: 850px; margin: 0 auto; padding: 32px; }
        .header { border-bottom: 2px solid ${template.primaryColor}; padding-bottom: 12px; margin-bottom: 16px; }
        .name { font-size: 26px; font-weight: 800; color: ${template.primaryColor}; margin: 0; }
        .title { font-size: 14px; font-weight: 600; color: #475569; margin-top: 2px; }
        .contact { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 6px; font-size: 12px; color: #64748b; }
        .section { margin-bottom: 16px; }
        .section-title { font-size: 13px; font-weight: 700; color: ${template.primaryColor}; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .item-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 13px; }
        .item-sub { color: #64748b; font-size: 12px; margin-bottom: 4px; }
        .item-desc { font-size: 12px; white-space: pre-line; color: #334155; }
        .skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-chip { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
        @media print { body { padding: 0; } }
      </style>
    `;

    const contactHtml = [data.email, data.phone, data.location, data.website]
      .filter(Boolean)
      .map((c) => `<span>${c}</span>`)
      .join(" • ");

    const expHtml = data.experiences
      .map(
        (e) => `
        <div style="margin-bottom: 12px;">
          <div class="item-header"><span>${e.role}</span><span>${e.startDate} – ${e.endDate}</span></div>
          <div class="item-sub">${e.company} • ${e.location}</div>
          <div class="item-desc">${e.highlights}</div>
        </div>
      `
      )
      .join("");

    const eduHtml = data.educations
      .map(
        (e) => `
        <div style="margin-bottom: 8px;">
          <div class="item-header"><span>${e.degree}</span><span>${e.year}</span></div>
          <div class="item-sub">${e.school}</div>
          ${e.details ? `<div class="item-desc">${e.details}</div>` : ""}
        </div>
      `
      )
      .join("");

    const skillsHtml = data.skills
      .map((s) => `<span class="skill-chip">${s}</span>`)
      .join("");

    printWindow.document.write(`
      <html>
        <head><title>${data.name || "Resume"} - CV</title>${styles}</head>
        <body>
          <div class="header">
            <h1 class="name">${data.name || "Your Name"}</h1>
            <div class="title">${data.title || "Professional Title"}</div>
            <div class="contact">${contactHtml}</div>
          </div>
          ${data.summary ? `<div class="section"><div class="section-title">Professional Summary</div><div class="item-desc">${data.summary}</div></div>` : ""}
          ${expHtml ? `<div class="section"><div class="section-title">Professional Experience</div>${expHtml}</div>` : ""}
          ${eduHtml ? `<div class="section"><div class="section-title">Education</div>${eduHtml}</div>` : ""}
          ${skillsHtml ? `<div class="section"><div class="section-title">Skills & Competencies</div><div class="skills-wrap">${skillsHtml}</div></div>` : ""}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }, [data, template]);

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
            <Palette className="h-3.5 w-3.5 text-cyan-500" /> Style:
          </span>
          {TEMPLATES.map((t) => (
            <Badge
              key={t.id}
              variant={template.id === t.id ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setTemplate(t)}
            >
              {t.name}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={() => {
              setData(SAMPLE_PROFILE);
              toast.success("Loaded sample professional profile!");
            }}
          >
            <RefreshCw className="h-3 w-3" /> Load Sample
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>

          <Button size="sm" onClick={exportPDF} className="text-xs h-8 gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white">
            <Download className="h-3.5 w-3.5" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Grid: Editor + Preview & ATS Gauge */}
      <div className={`grid gap-6 ${showPreview ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}>
        {/* Editor Form Column */}
        <div className={`space-y-6 ${showPreview ? "lg:col-span-6" : "col-span-1"}`}>
          {/* Personal Info */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileUser className="h-4 w-4 text-cyan-500" />
                Contact & Header Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Full Name</label>
                  <Input value={data.name} onChange={(e) => updateField("name", e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Professional Title</label>
                  <Input value={data.title} onChange={(e) => updateField("title", e.target.value)} className="h-8 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Email Address</label>
                  <Input type="email" value={data.email} onChange={(e) => updateField("email", e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Phone Number</label>
                  <Input value={data.phone} onChange={(e) => updateField("phone", e.target.value)} className="h-8 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Location / Relocation</label>
                  <Input value={data.location} onChange={(e) => updateField("location", e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Website / GitHub / LinkedIn</label>
                  <Input value={data.website} onChange={(e) => updateField("website", e.target.value)} className="h-8 text-xs" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Executive Summary</label>
                <Textarea
                  value={data.summary}
                  onChange={(e) => updateField("summary", e.target.value)}
                  rows={3}
                  className="text-xs"
                  placeholder="3-4 sentences outlining your core value proposition and career milestones"
                />
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" />
                Work Experience ({data.experiences.length})
              </CardTitle>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addExperience}>
                <Plus className="h-3 w-3" /> Add Role
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="p-3 rounded-lg border border-border/50 bg-card space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground">{exp.role || "Untitled Role"}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteExperience(exp.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                      className="h-7 text-xs"
                    />
                    <Input
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Start (e.g. 2021)"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                      className="h-7 text-xs"
                    />
                    <Input
                      placeholder="End (e.g. Present)"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>

                  <Textarea
                    placeholder="Key accomplishments with metrics (one bullet per line starting with •)"
                    value={exp.highlights}
                    onChange={(e) => updateExperience(exp.id, "highlights", e.target.value)}
                    rows={3}
                    className="text-xs font-mono"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-500" />
                Education ({data.educations.length})
              </CardTitle>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addEducation}>
                <Plus className="h-3 w-3" /> Add Degree
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.educations.map((edu) => (
                <div key={edu.id} className="p-3 rounded-lg border border-border/50 bg-card space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold">{edu.degree || "Untitled Degree"}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteEducation(edu.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                      className="h-7 text-xs"
                    />
                    <Input
                      placeholder="School"
                      value={edu.school}
                      onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                      className="h-7 text-xs"
                    />
                    <Input
                      placeholder="Honors / GPA"
                      value={edu.details}
                      onChange={(e) => updateEducation(edu.id, "details", e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Check className="h-4 w-4 text-violet-500" />
                Technical & Soft Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add skill (e.g. Next.js, Financial Modeling)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  className="h-8 text-xs"
                />
                <Button size="sm" onClick={addSkill} className="h-8 text-xs">
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 text-xs py-1 px-2.5">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview & ATS Meter Column */}
        {showPreview && (
          <div className="lg:col-span-6 space-y-4">
            {/* ATS Score Meter */}
            <Card className="border-border/60 bg-muted/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">ATS Optimization Score</h4>
                      <p className="text-[10px] text-muted-foreground">Automated Applicant Tracking System screening simulation</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {atsMetrics.score}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {atsMetrics.checks.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5">
                      <span className={c.passed ? "text-emerald-500 font-bold" : "text-muted-foreground"}>
                        {c.passed ? "✓" : "○"}
                      </span>
                      <span className={c.passed ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Document Sheet Preview */}
            <Card className="border-border/60 shadow-lg overflow-hidden bg-card">
              <div
                ref={resumeRef}
                className="p-6 md:p-8 space-y-5 text-xs text-foreground bg-background"
                style={{ fontFamily: template.font }}
              >
                {/* Header */}
                <div className="border-b-2 pb-3" style={{ borderColor: template.primaryColor }}>
                  <h2 className="text-xl font-extrabold tracking-tight" style={{ color: template.primaryColor }}>
                    {data.name || "Your Name"}
                  </h2>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">{data.title || "Your Title"}</p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground mt-2">
                    {data.email && <span>{data.email}</span>}
                    {data.phone && <span>• {data.phone}</span>}
                    {data.location && <span>• {data.location}</span>}
                    {data.website && <span>• {data.website}</span>}
                  </div>
                </div>

                {/* Summary */}
                {data.summary && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: template.primaryColor }}>
                      Professional Summary
                    </h3>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">{data.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {data.experiences.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: template.primaryColor }}>
                      Experience
                    </h3>
                    <div className="space-y-3">
                      {data.experiences.map((exp) => (
                        <div key={exp.id} className="space-y-0.5">
                          <div className="flex justify-between font-semibold text-[11px]">
                            <span>{exp.role}</span>
                            <span className="text-muted-foreground text-[10px]">{exp.startDate} – {exp.endDate}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">{exp.company} • {exp.location}</div>
                          <div className="text-[11px] whitespace-pre-line text-foreground/90 mt-1 leading-relaxed">
                            {exp.highlights}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {data.educations.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: template.primaryColor }}>
                      Education
                    </h3>
                    <div className="space-y-2">
                      {data.educations.map((edu) => (
                        <div key={edu.id}>
                          <div className="flex justify-between font-semibold text-[11px]">
                            <span>{edu.degree}</span>
                            <span className="text-muted-foreground text-[10px]">{edu.year}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">{edu.school}</div>
                          {edu.details && <div className="text-[10px] italic text-muted-foreground">{edu.details}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {data.skills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: template.primaryColor }}>
                      Skills & Technologies
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {data.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-sm bg-muted text-[10px] font-mono border border-border/40">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}