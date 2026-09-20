"use client";

import { useState, useCallback, useRef } from "react";
import {
  FileText, Download, Copy, Check, Trash2, Loader2,
  Sparkles, Briefcase, User, Plus, X, Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveData(data: ResumeData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

// AI-powered resume enhancement using pattern matching and templates
function enhanceResume(data: ResumeData): string {
  const { fullName, email, phone, location, linkedin, summary, skills, experience, education, jobDescription, targetRole } = data;

  const contactParts = [email, phone, location, linkedin].filter(Boolean);
  const skillsList = skills.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
  const expLines = experience.split(/\n/).filter(Boolean);
  const eduLines = education.split(/\n/).filter(Boolean);

  // Generate enhanced bullet points from experience
  const enhancedExperience = expLines.map((line) => {
    // Add action verbs and metrics if missing
    if (!/^(led|managed|developed|created|implemented|designed|built|launched|increased|reduced|improved|achieved|delivered|coordinated|spearheaded|orchestrated|engineered|optimized|transformed|streamlined|automated)/i.test(line.trim())) {
      return `• Successfully ${line.trim().replace(/^[•\-]\s*/, "").charAt(0).toLowerCase() + line.trim().replace(/^[•\-]\s*/, "").slice(1)}`;
    }
    return `• ${line.trim().replace(/^[•\-]\s*/, "")}`;
  });

  // Generate professional summary if not provided
  let enhancedSummary = summary;
  if (!summary.trim() && targetRole) {
    enhancedSummary = `Results-driven ${targetRole} with proven expertise in ${skillsList.slice(0, 3).join(", ")}. Demonstrated track record of delivering high-impact solutions and driving measurable outcomes. Seeking to leverage technical skills and industry experience to contribute to organizational success.`;
  }

  // Tailor skills to job description
  let tailoredSkills = skillsList;
  if (jobDescription.trim()) {
    const jdWords = jobDescription.toLowerCase().match(/\b\w+\b/g) || [];
    const jdKeywords = new Set(jdWords.filter((w) => w.length > 4));
    tailoredSkills = [
      ...skillsList.filter((s) => {
        const skillWords = s.toLowerCase().split(/\s+/);
        return skillWords.some((sw) => jdKeywords.has(sw));
      }),
      ...skillsList.filter((s) => {
        const skillWords = s.toLowerCase().split(/\s+/);
        return !skillWords.some((sw) => jdKeywords.has(sw));
      }),
    ];
  }

  const resumeHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${fullName || "Resume"}</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1e293b; }
  .header { text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 3px solid #6366f1; }
  .name { font-size: 32px; font-weight: 700; color: #6366f1; margin-bottom: 4px; }
  .contact { font-size: 13px; color: #64748b; }
  .section { margin-bottom: 22px; }
  .section-title { font-size: 16px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; }
  .summary-text { font-size: 14px; line-height: 1.7; color: #475569; }
  .skills-container { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-tag { background: #eef2ff; color: #4338ca; padding: 4px 14px; border-radius: 20px; font-size: 13px; }
  .exp-item { margin-bottom: 14px; font-size: 14px; line-height: 1.6; color: #475569; }
  .edu-item { margin-bottom: 8px; font-size: 14px; color: #475569; }
</style>
</head>
<body>
<div class="header">
  <div class="name">${fullName || "Your Name"}</div>
  <div class="contact">${contactParts.join(" · ")}</div>
</div>
${enhancedSummary ? `<div class="section"><div class="section-title">Professional Summary</div><div class="summary-text">${enhancedSummary}</div></div>` : ""}
${tailoredSkills.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div class="skills-container">${tailoredSkills.map((s) => `<span class="skill-tag">${s}</span>`).join("")}</div></div>` : ""}
${enhancedExperience.length > 0 ? `<div class="section"><div class="section-title">Experience</div>${enhancedExperience.map((e) => `<div class="exp-item">${e}</div>`).join("")}</div>` : ""}
${eduLines.length > 0 ? `<div class="section"><div class="section-title">Education</div>${eduLines.map((e) => `<div class="edu-item">• ${e.trim().replace(/^[•\-]\s*/, "")}</div>`).join("")}</div>` : ""}
</body>
</html>`;

  return resumeHTML;
}

export function AIResumeMakerEngine() {
  const [data, setData] = useState<ResumeData>(() => loadData() || DEFAULT_DATA);
  const [activeTab, setActiveTab] = useState("edit");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

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
    // Simulate AI processing
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1500));
    const resume = enhanceResume(data);
    setData((prev) => {
      const updated = { ...prev, generatedResume: resume };
      saveData(updated);
      return updated;
    });
    setIsGenerating(false);
    setActiveTab("preview");
    toast.success("AI-enhanced resume generated!");
  }, [data]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([data.generatedResume], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${data.fullName?.replace(/\s+/g, "-").toLowerCase() || "untitled"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded! Open in browser and print to PDF.");
  }, [data.generatedResume, data.fullName]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(data.generatedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("HTML copied!");
  }, [data.generatedResume]);

  const handleReset = useCallback(() => {
    setData(DEFAULT_DATA);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Reset.");
  }, []);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
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
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>

        <TabsContent value="edit" className="mt-4 space-y-4">
          <Card><CardContent className="p-4 space-y-3">
            <Label className="text-sm font-medium">Personal Information</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Full Name *" value={data.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
              <Input placeholder="Target Role" value={data.targetRole} onChange={(e) => updateField("targetRole", e.target.value)} />
              <Input placeholder="Email" type="email" value={data.email} onChange={(e) => updateField("email", e.target.value)} />
              <Input placeholder="Phone" value={data.phone} onChange={(e) => updateField("phone", e.target.value)} />
              <Input placeholder="Location" value={data.location} onChange={(e) => updateField("location", e.target.value)} />
              <Input placeholder="LinkedIn URL" value={data.linkedin} onChange={(e) => updateField("linkedin", e.target.value)} />
            </div>
          </CardContent></Card>

          <Card><CardContent className="p-4 space-y-3">
            <Label className="text-sm font-medium">Professional Summary (leave blank for AI-generated)</Label>
            <Textarea placeholder="Brief professional summary..." className="min-h-[80px]" value={data.summary} onChange={(e) => updateField("summary", e.target.value)} />
          </CardContent></Card>

          <Card><CardContent className="p-4 space-y-3">
            <Label className="text-sm font-medium">Skills (comma-separated)</Label>
            <Textarea placeholder="e.g. JavaScript, React, Node.js, Python, Project Management..." className="min-h-[60px]" value={data.skills} onChange={(e) => updateField("skills", e.target.value)} />
          </CardContent></Card>

          <Card><CardContent className="p-4 space-y-3">
            <Label className="text-sm font-medium">Experience (one per line)</Label>
            <Textarea placeholder="Led team of 5 developers to deliver...&#10;Increased revenue by 30% through...&#10;Developed and launched..." className="min-h-[120px]" value={data.experience} onChange={(e) => updateField("experience", e.target.value)} />
          </CardContent></Card>

          <Card><CardContent className="p-4 space-y-3">
            <Label className="text-sm font-medium">Education (one per line)</Label>
            <Textarea placeholder="Bachelor of Science in Computer Science, University of...&#10;Master of Business Administration, ..." className="min-h-[80px]" value={data.education} onChange={(e) => updateField("education", e.target.value)} />
          </CardContent></Card>

          <Card><CardContent className="p-4 space-y-3">
            <Label className="text-sm font-medium">Job Description (for AI tailoring, optional)</Label>
            <Textarea placeholder="Paste the job description here to tailor your resume..." className="min-h-[100px]" value={data.jobDescription} onChange={(e) => updateField("jobDescription", e.target.value)} />
          </CardContent></Card>

          <Button onClick={handleGenerate} disabled={isGenerating || !data.fullName.trim()} className="w-full gap-2" size="lg">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {isGenerating ? "Generating..." : "Generate AI-Enhanced Resume"}
          </Button>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          {data.generatedResume ? (
            <Card><CardContent className="p-0">
              <iframe srcDoc={data.generatedResume} className="w-full min-h-[600px] border-0" title="Resume Preview" />
            </CardContent></Card>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Fill in your details and click "Generate" to create your AI-enhanced resume.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}