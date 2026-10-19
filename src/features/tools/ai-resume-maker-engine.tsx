"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  FileText, Download, Copy, Check, Trash2, Loader2,
  User, Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { escapeResumeText, generateResumeContent } from "@/features/ai/resume-generation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
  jobDescription: string;
  targetRole: string;
  generatedResume: string;
}

const STORAGE_KEY = "mytoolsbox-ai-resume";

function loadData(): ResumeData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return null;
    return Object.fromEntries(Object.entries(DEFAULT_DATA).map(([key, fallback]) => [key, typeof saved[key] === "string" ? saved[key] : fallback])) as unknown as ResumeData;
  } catch {
    return null;
  }
}

function saveData(data: ResumeData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    toast.error("Browser storage is unavailable. Your resume is kept for this session only.");
  }
}

const DEFAULT_DATA: ResumeData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  summary: "",
  skills: "",
  experience: "",
  education: "",
  jobDescription: "",
  targetRole: "",
  generatedResume: "",
};

function renderResume(data: ResumeData): string {
  const { fullName, email, phone, location, linkedin, summary, skills, experience, education } = data;

  const contactParts = [email, phone, location, linkedin].filter(Boolean);
  const skillsList = skills.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
  const expLines = experience.split(/\n/).filter(Boolean);
  const eduLines = education.split(/\n/).filter(Boolean);

  const experienceItems = expLines.map((line) => `• ${line.trim().replace(/^[•\-]\s*/, "")}`);

  const resumeHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${fullName || "Resume"}</title>
<style>
  body { font-family: Archivo, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1e293b; overflow-wrap: anywhere; }
  .header { text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 3px solid #6366f1; }
  .name { font-size: 32px; font-weight: 700; color: #6366f1; margin-bottom: 4px; }
  .contact { font-size: 13px; color: #64748b; }
  .section { margin-bottom: 22px; }
  .section-title { font-size: 16px; font-weight: 600; color: #6366f1; letter-spacing: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; }
  .summary-text { font-size: 14px; line-height: 1.7; color: #475569; }
  .skills-container { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-tag { background: #eef2ff; color: #4338ca; padding: 4px 8px; border-radius: 4px; font-size: 13px; }
  .exp-item { margin-bottom: 14px; font-size: 14px; line-height: 1.6; color: #475569; }
  .edu-item { margin-bottom: 8px; font-size: 14px; color: #475569; }
</style>
</head>
<body>
<div class="header">
  <div class="name">${fullName || "Your Name"}</div>
  <div class="contact">${contactParts.join(" · ")}</div>
</div>
${summary ? `<div class="section"><div class="section-title">Professional Summary</div><div class="summary-text">${summary}</div></div>` : ""}
${skillsList.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div class="skills-container">${skillsList.map((skill) => `<span class="skill-tag">${skill}</span>`).join("")}</div></div>` : ""}
${experienceItems.length > 0 ? `<div class="section"><div class="section-title">Experience</div>${experienceItems.map((item) => `<div class="exp-item">${item}</div>`).join("")}</div>` : ""}
${eduLines.length > 0 ? `<div class="section"><div class="section-title">Education</div>${eduLines.map((e) => `<div class="edu-item">• ${e.trim().replace(/^[•\-]\s*/, "")}</div>`).join("")}</div>` : ""}
</body>
</html>`;

  return resumeHTML;
}

export function AIResumeMakerEngine() {
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  const [data, setData] = useState<ResumeData>(() => loadData() || DEFAULT_DATA);
  const [activeTab, setActiveTab] = useState("edit");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const safeResumeDocument = data.generatedResume
    ? `<!DOCTYPE html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">${data.generatedResume}`
    : "";

  const updateField = useCallback(
    <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
      setData((prev) => {
        const updated = { ...prev, [field]: value };
        saveData(updated);
        return updated;
      });
    },
    []
  );

  const handleGenerate = useCallback(async () => {
    if (!data.fullName.trim()) {
      toast.error("Please enter at least your full name.");
      return;
    }
    setIsGenerating(true);
    setError("");
    try {
    const { generatedResume: previousResume, ...input } = data;
    void previousResume;
    const content = await generateResumeContent(input);
    if (!mountedRef.current) return;
    const safeData = Object.fromEntries(Object.entries({
      ...input,
      summary: content.summary,
      skills: content.skills.join(", "),
      experience: content.experience.join("\n"),
      education: content.education.join("\n"),
      jobDescription: "",
      generatedResume: "",
    }).map(([key, value]) => [key, escapeResumeText(value)])) as unknown as ResumeData;
    const resume = renderResume(safeData);
    setData((prev) => {
      const updated = { ...prev, generatedResume: resume };
      saveData(updated);
      return updated;
    });
    setActiveTab("preview");
    toast.success("AI-enhanced resume generated!");
    } catch (failure) {
      if (!mountedRef.current) return;
      const message = failure instanceof Error ? failure.message : "Resume generation failed.";
      setError(message);
      toast.error(message);
    } finally {
      if (mountedRef.current) setIsGenerating(false);
    }
  }, [data]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([safeResumeDocument], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${data.fullName?.replace(/\s+/g, "-").toLowerCase() || "untitled"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [safeResumeDocument, data.fullName]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(safeResumeDocument);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("HTML copied!");
    } catch {
      setError("Your browser could not copy the resume.");
      toast.error("Your browser could not copy the resume.");
    }
  }, [safeResumeDocument]);

  const handleReset = useCallback(() => {
    setData(DEFAULT_DATA);
    setError("");
    try { localStorage.removeItem(STORAGE_KEY); } catch { toast.error("Browser storage could not be cleared."); }
    toast.success("Reset.");
  }, []);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="edit" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Input</TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5" disabled={!data.generatedResume}>
              <User className="h-3.5 w-3.5" /> Preview
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            {data.generatedResume && (
              <>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleReset} disabled={isGenerating} className="gap-1.5 text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>

        <TabsContent value="edit" className="mt-4">
          <fieldset disabled={isGenerating} className="space-y-4 min-w-0">
          <section className="space-y-3">
            <h2 className="text-sm font-medium">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                ["fullName", "Full name", "text"], ["targetRole", "Target role", "text"],
                ["email", "Email", "email"], ["phone", "Phone", "tel"],
                ["location", "Location", "text"], ["linkedin", "LinkedIn URL", "url"],
              ] as const).map(([field, label, type]) => <div key={field} className="space-y-1.5">
                <Label htmlFor={`resume-${field}`}>{label}{field === "fullName" ? " *" : ""}</Label>
                <Input id={`resume-${field}`} type={type} required={field === "fullName"} value={data[field]} onChange={(event) => updateField(field, event.target.value)} />
              </div>)}
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="resume-summary">Professional summary (optional)</Label>
            <Textarea id="resume-summary" placeholder="Brief professional summary..." className="min-h-20" value={data.summary} onChange={(e) => updateField("summary", e.target.value)} />
          </section>

          <section className="space-y-2">
            <Label htmlFor="resume-skills">Skills (comma-separated)</Label>
            <Textarea id="resume-skills" placeholder="e.g. JavaScript, React, Node.js, Python, Project Management..." className="min-h-15" value={data.skills} onChange={(e) => updateField("skills", e.target.value)} />
          </section>

          <section className="space-y-2">
            <Label htmlFor="resume-experience">Experience (one per line)</Label>
            <Textarea id="resume-experience" placeholder="Your roles, dates and achievements" className="min-h-30" value={data.experience} onChange={(e) => updateField("experience", e.target.value)} />
          </section>

          <section className="space-y-2">
            <Label htmlFor="resume-education">Education (one per line)</Label>
            <Textarea id="resume-education" placeholder="Your qualifications, institutions and dates" className="min-h-20" value={data.education} onChange={(e) => updateField("education", e.target.value)} />
          </section>

          <section className="space-y-2">
            <Label htmlFor="resume-job">Job description (optional)</Label>
            <Textarea id="resume-job" placeholder="Paste the job description here to tailor your resume..." className="min-h-25" value={data.jobDescription} onChange={(e) => updateField("jobDescription", e.target.value)} />
          </section>

          <p className="text-sm text-muted-foreground">Resume details are sent to the configured AI provider. Sign-in and document-generation credits are required.</p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleGenerate} disabled={isGenerating || !data.fullName.trim()} className="w-full gap-2" size="lg">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {isGenerating ? "Generating..." : "Generate resume"}
          </Button>
          </fieldset>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          {data.generatedResume ? (
            <iframe sandbox="" srcDoc={safeResumeDocument} className="w-full min-h-150 border border-border rounded-md bg-background" title="Resume Preview" />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto opacity-30" />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}