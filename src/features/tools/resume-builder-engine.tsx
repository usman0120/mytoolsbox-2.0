"use client";

import { useState, useCallback, useRef } from "react";
import {
  FileText,
  Download,
  Copy,
  Check,
  Trash2,
  User,
  Plus,
  X,
  Printer,
  Upload,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: { degree: string; school: string; year: string }[];
  template: "modern" | "classic" | "minimal";
}

const STORAGE_KEY = "mytoolsbox-resume-data";

const SAMPLE_RESUME: ResumeData = {
  fullName: "Alex Morgan",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 234-5678",
  location: "San Francisco, CA",
  website: "https://github.com/alexmorgan",
  summary:
    "Senior Full-Stack Software Engineer with 7+ years of experience architecting resilient cloud systems, microservices, and modern web applications. Proven track record leading engineering squads to scale applications to millions of active users.",
  skills: [
    "TypeScript",
    "React / Next.js",
    "Node.js",
    "Go",
    "PostgreSQL",
    "AWS & Docker",
    "System Design",
    "GraphQL",
  ],
  experience: [
    {
      title: "Staff Software Engineer",
      company: "Apex Cloud Technologies",
      startDate: "2021",
      endDate: "Present",
      description:
        "Architected distributed event-driven processing pipeline reducing data latency by 45%. Mentored 8 junior engineers and established zero-downtime CI/CD deployment pipelines.",
    },
    {
      title: "Senior Full-Stack Developer",
      company: "Horizon Innovations",
      startDate: "2018",
      endDate: "2021",
      description:
        "Built customer analytics dashboard in React/Next.js and FastAPI used by 250k+ daily users. Optimized database query performance by 60%.",
    },
  ],
  education: [
    {
      degree: "B.S. in Computer Science",
      school: "University of California, Berkeley",
      year: "2014 – 2018",
    },
  ],
  template: "modern",
};

const DEFAULT_RESUME: ResumeData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  summary: "",
  skills: ["", "", ""],
  experience: [{ title: "", company: "", startDate: "", endDate: "", description: "" }],
  education: [{ degree: "", school: "", year: "" }],
  template: "modern",
};

function loadResume(): ResumeData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveResume(data: ResumeData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function ResumeBuilderEngine() {
  const [data, setData] = useState<ResumeData>(() => loadResume() || SAMPLE_RESUME);
  const [activeTab, setActiveTab] = useState("edit");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = useCallback(
    <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
      setData((prev) => {
        const updated = { ...prev, [field]: value };
        saveResume(updated);
        return updated;
      });
    },
    []
  );

  const updateSkill = useCallback((index: number, value: string) => {
    setData((prev) => {
      const skills = [...prev.skills];
      skills[index] = value;
      const updated = { ...prev, skills };
      saveResume(updated);
      return updated;
    });
  }, []);

  const addSkill = useCallback(() => {
    setData((prev) => {
      const updated = { ...prev, skills: [...prev.skills, ""] };
      saveResume(updated);
      return updated;
    });
  }, []);

  const removeSkill = useCallback((index: number) => {
    setData((prev) => {
      const updated = { ...prev, skills: prev.skills.filter((_, i) => i !== index) };
      saveResume(updated);
      return updated;
    });
  }, []);

  const updateExperience = useCallback(
    (index: number, field: keyof ResumeData["experience"][0], value: string) => {
      setData((prev) => {
        const experience = [...prev.experience];
        experience[index] = { ...experience[index], [field]: value };
        const updated = { ...prev, experience };
        saveResume(updated);
        return updated;
      });
    },
    []
  );

  const addExperience = useCallback(() => {
    setData((prev) => {
      const updated = {
        ...prev,
        experience: [
          ...prev.experience,
          { title: "", company: "", startDate: "", endDate: "", description: "" },
        ],
      };
      saveResume(updated);
      return updated;
    });
  }, []);

  const removeExperience = useCallback((index: number) => {
    setData((prev) => {
      const updated = { ...prev, experience: prev.experience.filter((_, i) => i !== index) };
      saveResume(updated);
      return updated;
    });
  }, []);

  const updateEducation = useCallback(
    (index: number, field: keyof ResumeData["education"][0], value: string) => {
      setData((prev) => {
        const education = [...prev.education];
        education[index] = { ...education[index], [field]: value };
        const updated = { ...prev, education };
        saveResume(updated);
        return updated;
      });
    },
    []
  );

  const addEducation = useCallback(() => {
    setData((prev) => {
      const updated = {
        ...prev,
        education: [...prev.education, { degree: "", school: "", year: "" }],
      };
      saveResume(updated);
      return updated;
    });
  }, []);

  const removeEducation = useCallback((index: number) => {
    setData((prev) => {
      const updated = { ...prev, education: prev.education.filter((_, i) => i !== index) };
      saveResume(updated);
      return updated;
    });
  }, []);

  const generateResumeHTML = useCallback((): string => {
    const { fullName, email, phone, location, website, summary, skills, experience, education, template } = data;

    const templateStyles: Record<string, string> = {
      modern: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .resume { padding: 0 !important; max-width: 100% !important; }
        }
        .resume { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1e293b; background: #ffffff; }
        .header { text-align: left; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #2563eb; }
        .name { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.5px; }
        .contact { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; color: #475569; }
        .section { margin-bottom: 22px; }
        .section-title { font-size: 15px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 12px; }
        .skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
        .exp-item { margin-bottom: 16px; }
        .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
        .exp-title { font-weight: 700; font-size: 15px; color: #0f172a; }
        .exp-company { color: #2563eb; font-weight: 600; font-size: 13px; }
        .exp-date { color: #64748b; font-size: 12px; font-weight: 500; }
        .exp-desc { margin-top: 4px; font-size: 13px; line-height: 1.6; color: #334155; }
      `,
      classic: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .resume { padding: 0 !important; max-width: 100% !important; }
        }
        .resume { font-family: Georgia, 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; background: #ffffff; }
        .header { text-align: center; margin-bottom: 24px; }
        .name { font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
        .contact { font-size: 12px; color: #555; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 10px; }
        .skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { font-size: 12px; }
        .exp-item { margin-bottom: 14px; }
        .exp-title { font-weight: 700; font-size: 14px; }
        .exp-company { font-style: italic; }
        .exp-date { font-size: 12px; color: #666; }
        .exp-desc { margin-top: 4px; font-size: 12.5px; line-height: 1.6; }
      `,
      minimal: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .resume { padding: 0 !important; max-width: 100% !important; }
        }
        .resume { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #18181b; background: #ffffff; }
        .header { margin-bottom: 24px; }
        .name { font-size: 32px; font-weight: 300; margin-bottom: 4px; }
        .contact { font-size: 12px; color: #71717a; display: flex; gap: 14px; flex-wrap: wrap; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #a1a1aa; margin-bottom: 10px; }
        .skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { font-size: 12px; color: #52525b; }
        .exp-item { margin-bottom: 14px; }
        .exp-title { font-weight: 600; font-size: 14px; }
        .exp-company { color: #71717a; }
        .exp-date { font-size: 11px; color: #a1a1aa; }
        .exp-desc { margin-top: 4px; font-size: 12.5px; line-height: 1.6; color: #52525b; }
      `,
    };

    const contactParts = [email, phone, location, website].filter(Boolean);

    const skillsHTML = skills
      .filter((s) => s.trim())
      .map((s) => `<span class="skill-tag">${s.trim()}</span>`)
      .join("");

    const experienceHTML = experience
      .filter((e) => e.title || e.company)
      .map(
        (e) => `
      <div class="exp-item">
        <div class="exp-header">
          <span class="exp-title">${e.title}</span>
          <span class="exp-date">${e.startDate} ${e.endDate ? "– " + e.endDate : ""}</span>
        </div>
        <div class="exp-company">${e.company}</div>
        ${e.description ? `<div class="exp-desc">${e.description}</div>` : ""}
      </div>`
      )
      .join("");

    const educationHTML = education
      .filter((e) => e.degree || e.school)
      .map(
        (e) => `
      <div class="exp-item">
        <div class="exp-title">${e.degree}</div>
        <div class="exp-company">${e.school}${e.year ? ` · ${e.year}` : ""}</div>
      </div>`
      )
      .join("");

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${fullName || "Resume"}</title><style>${
      templateStyles[template] || templateStyles.modern
    }</style></head>
<body>
<div class="resume">
  <div class="header">
    <div class="name">${fullName || "Your Name"}</div>
    <div class="contact">${contactParts.join(" · ")}</div>
  </div>
  ${
    summary
      ? `<div class="section"><div class="section-title">Summary</div><p style="font-size:13.5px;line-height:1.6;color:#334155;">${summary}</p></div>`
      : ""
  }
  ${
    skillsHTML
      ? `<div class="section"><div class="section-title">Technical Skills</div><div class="skills">${skillsHTML}</div></div>`
      : ""
  }
  ${
    experienceHTML
      ? `<div class="section"><div class="section-title">Professional Experience</div>${experienceHTML}</div>`
      : ""
  }
  ${
    educationHTML
      ? `<div class="section"><div class="section-title">Education & Credentials</div>${educationHTML}</div>`
      : ""
  }
</div>
</body>
</html>`;
  }, [data]);

  const handlePrint = () => {
    const html = generateResumeHTML();
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 300);
    }
  };

  const handleDownloadHTML = useCallback(() => {
    const html = generateResumeHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${data.fullName?.replace(/\s+/g, "-").toLowerCase() || "untitled"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded as HTML! (Open in browser and Print to PDF)");
  }, [generateResumeHTML, data.fullName]);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded resume JSON backup!");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setData(parsed);
        saveResume(parsed);
        toast.success("Resume restored from JSON backup!");
      } catch {
        toast.error("Invalid JSON resume file.");
      }
    };
    reader.readAsText(file);
  };

  const handleCopyHTML = useCallback(async () => {
    const html = generateResumeHTML();
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Resume HTML copied to clipboard!");
  }, [generateResumeHTML]);

  const handleLoadSample = () => {
    setData(SAMPLE_RESUME);
    saveResume(SAMPLE_RESUME);
    toast.success("Loaded Software Engineer sample data!");
  };

  const handleReset = useCallback(() => {
    setData(DEFAULT_RESUME);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Resume cleared.");
  }, []);

  return (
    <div className="space-y-5">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
          <TabsList>
            <TabsTrigger value="edit" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" /> Resume Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5 text-xs">
              <User className="h-3.5 w-3.5" /> Live Preview
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleLoadSample} className="gap-1 h-8 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Sample
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1 h-8 text-xs">
              <Printer className="h-3.5 w-3.5 text-primary" /> Print / PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyHTML} className="gap-1 h-8 text-xs">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              Copy HTML
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadHTML} className="gap-1 h-8 text-xs">
              <Download className="h-3.5 w-3.5" /> Save HTML
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExportJSON} className="gap-1 h-8 text-xs text-muted-foreground">
              Backup JSON
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1 h-8 text-xs text-muted-foreground"
            >
              <Upload className="h-3.5 w-3.5" /> Restore
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 h-8 text-xs text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
        </div>

        <TabsContent value="edit" className="mt-4 space-y-4">
          {/* Template Style Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Resume Style:</span>
            {(["modern", "classic", "minimal"] as const).map((t) => (
              <Button
                key={t}
                variant={data.template === t ? "default" : "outline"}
                size="sm"
                onClick={() => updateField("template", t)}
                className="capitalize text-xs h-7"
              >
                {t}
              </Button>
            ))}
          </div>

          {/* Contact & Personal Info */}
          <Card className="shadow-xs">
            <CardContent className="p-4 space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Personal Information
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Full Name (e.g. Alex Morgan)" value={data.fullName} onChange={(e) => updateField("fullName", e.target.value)} className="h-9 text-xs" />
                <Input placeholder="Email (e.g. alex@example.com)" type="email" value={data.email} onChange={(e) => updateField("email", e.target.value)} className="h-9 text-xs" />
                <Input placeholder="Phone (e.g. +1 555 123 4567)" value={data.phone} onChange={(e) => updateField("phone", e.target.value)} className="h-9 text-xs" />
                <Input placeholder="Location (e.g. San Francisco, CA)" value={data.location} onChange={(e) => updateField("location", e.target.value)} className="h-9 text-xs" />
                <Input placeholder="Website / Portfolio / LinkedIn URL" value={data.website} onChange={(e) => updateField("website", e.target.value)} className="sm:col-span-2 h-9 text-xs" />
              </div>
              <Textarea
                placeholder="Professional executive summary..."
                className="min-h-20 text-xs font-sans leading-relaxed"
                value={data.summary}
                onChange={(e) => updateField("summary", e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="shadow-xs">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Skills & Proficiencies ({data.skills.filter(Boolean).length})
                </Label>
                <Button variant="ghost" size="sm" onClick={addSkill} className="gap-1 h-7 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Skill
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Input
                      placeholder={`Skill ${i + 1}`}
                      value={skill}
                      onChange={(e) => updateSkill(i, e.target.value)}
                      className="w-36 h-8 text-xs font-medium"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeSkill(i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card className="shadow-xs">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Work Experience
                </Label>
                <Button variant="ghost" size="sm" onClick={addExperience} className="gap-1 h-7 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Position
                </Button>
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} className="space-y-2 p-3 border rounded-xl relative bg-card shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input placeholder="Job Title (e.g. Senior Software Engineer)" value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} className="h-8 text-xs font-semibold" />
                    <Input placeholder="Company Name (e.g. Google, Stripe)" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} className="h-8 text-xs" />
                    <Input placeholder="Start Date (e.g. Jan 2021)" value={exp.startDate} onChange={(e) => updateExperience(i, "startDate", e.target.value)} className="h-8 text-xs" />
                    <Input placeholder="End Date (e.g. Present)" value={exp.endDate} onChange={(e) => updateExperience(i, "endDate", e.target.value)} className="h-8 text-xs" />
                  </div>
                  <Textarea
                    placeholder="Key achievements, responsibilities, quantifiable impact..."
                    className="min-h-16 text-xs leading-relaxed"
                    value={exp.description}
                    onChange={(e) => updateExperience(i, "description", e.target.value)}
                  />
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeExperience(i)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="shadow-xs">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Education & Degrees
                </Label>
                <Button variant="ghost" size="sm" onClick={addEducation} className="gap-1 h-7 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Degree
                </Button>
              </div>
              {data.education.map((edu, i) => (
                <div key={i} className="space-y-2 p-3 border rounded-xl relative bg-card shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input placeholder="Degree (e.g. B.S. in Computer Science)" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} className="h-8 text-xs font-semibold" />
                    <Input placeholder="University / School" value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)} className="h-8 text-xs" />
                    <Input placeholder="Year (e.g. 2018 – 2022)" value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} className="h-8 text-xs" />
                  </div>
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeEducation(i)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card className="shadow-xs overflow-hidden border">
            <CardContent className="p-0 bg-muted/10">
              <iframe
                srcDoc={generateResumeHTML()}
                className="w-full min-h-[700px] border-0 bg-white"
                title="Resume Live Preview"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}