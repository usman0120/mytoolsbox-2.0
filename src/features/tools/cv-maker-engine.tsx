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
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface CVData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  summary: string;
  skills: string[];
  languages: string[];
  experience: {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
    details: string;
  }[];
  certifications: string[];
  publications: string[];
  template: "professional" | "academic" | "creative";
}

const STORAGE_KEY = "mytoolsbox-cv-data";

const SAMPLE_CV: CVData = {
  fullName: "Dr. Elena Vance, Ph.D.",
  title: "Principal Research Scientist & AI Fellow",
  email: "elena.vance@mit.edu",
  phone: "+1 (617) 555-0199",
  location: "Cambridge, MA",
  website: "https://elenavance.org",
  linkedin: "https://linkedin.com/in/drelenavance",
  summary:
    "Computational Scientist and machine learning researcher with 10+ years leading multi-institutional AI research initiatives. Author of 18 peer-reviewed publications across NeurIPS, ICML, and Nature Machine Intelligence. Principal Investigator on $3.2M NSF grants.",
  skills: [
    "Machine Learning & LLMs",
    "Statistical Mechanics",
    "PyTorch & JAX",
    "Distributed Training",
    "Scientific Computing",
    "Algorithm Optimization",
  ],
  languages: ["English (Native)", "French (Fluent)", "German (Conversational)"],
  experience: [
    {
      title: "Principal Research Scientist",
      company: "MIT Center for Autonomous Systems",
      startDate: "2020",
      endDate: "Present",
      description:
        "Directing a laboratory of 14 postdoctoral fellows and PhD candidates. Developed novel attention sparse approximation architectures adopted in modern transformer foundations.",
    },
    {
      title: "Senior Postdoctoral Fellow",
      company: "Stanford Artificial Intelligence Laboratory (SAIL)",
      startDate: "2017",
      endDate: "2020",
      description:
        "Pioneered reinforcement learning formulations for real-world robotics control, reducing simulation-to-real transfer gap by 70%.",
    },
  ],
  education: [
    {
      degree: "Ph.D. in Computer Science & AI",
      school: "Stanford University",
      year: "2017",
      details: "Dissertation: Scalable Inductive Bias in Deep Neural Networks. Advised by Prof. J. Doe.",
    },
    {
      degree: "B.S. in Applied Mathematics (Summa Cum Laude)",
      school: "Princeton University",
      year: "2012",
      details: "Departmental Honors, GPA 3.96/4.0",
    },
  ],
  certifications: [
    "NSF Graduate Research Fellowship (GRFP) Awardee",
    "IEEE Senior Member Recognition",
    "Outstanding Reviewer Award (NeurIPS 2023)",
  ],
  publications: [
    "Vance, E. et al. 'Sparse Attention Dynamics in Foundation Models', Nature Machine Intelligence, 2024.",
    "Vance, E. & Smith, R. 'Provable Convergence in Distributed Policy Optimization', NeurIPS, 2022.",
    "Vance, E. 'Inductive Bias in Graph Representations', ICML, 2020.",
  ],
  template: "academic",
};

const DEFAULT_CV: CVData = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  summary: "",
  skills: ["", "", ""],
  languages: ["", ""],
  experience: [{ title: "", company: "", startDate: "", endDate: "", description: "" }],
  education: [{ degree: "", school: "", year: "", details: "" }],
  certifications: [""],
  publications: [""],
  template: "professional",
};

function loadCV(): CVData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCV(data: CVData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function CVMakerEngine() {
  const [data, setData] = useState<CVData>(() => loadCV() || SAMPLE_CV);
  const [activeTab, setActiveTab] = useState("edit");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = useCallback(
    <K extends keyof CVData>(field: K, value: CVData[K]) => {
      setData((prev) => {
        const updated = { ...prev, [field]: value };
        saveCV(updated);
        return updated;
      });
    },
    []
  );

  const updateArrayItem = useCallback(
    (field: "skills" | "languages" | "certifications" | "publications", index: number, value: string) => {
      setData((prev) => {
        const arr = [...prev[field]];
        arr[index] = value;
        const updated = { ...prev, [field]: arr };
        saveCV(updated);
        return updated;
      });
    },
    []
  );

  const addArrayItem = useCallback((field: "skills" | "languages" | "certifications" | "publications") => {
    setData((prev) => {
      const updated = { ...prev, [field]: [...prev[field], ""] };
      saveCV(updated);
      return updated;
    });
  }, []);

  const removeArrayItem = useCallback((field: "skills" | "languages" | "certifications" | "publications", index: number) => {
    setData((prev) => {
      const updated = { ...prev, [field]: prev[field].filter((_, i) => i !== index) };
      saveCV(updated);
      return updated;
    });
  }, []);

  const updateExperience = useCallback(
    (index: number, field: keyof CVData["experience"][0], value: string) => {
      setData((prev) => {
        const experience = [...prev.experience];
        experience[index] = { ...experience[index], [field]: value };
        const updated = { ...prev, experience };
        saveCV(updated);
        return updated;
      });
    },
    []
  );

  const addExperience = useCallback(() => {
    setData((prev) => {
      const updated = {
        ...prev,
        experience: [...prev.experience, { title: "", company: "", startDate: "", endDate: "", description: "" }],
      };
      saveCV(updated);
      return updated;
    });
  }, []);

  const removeExperience = useCallback((index: number) => {
    setData((prev) => {
      const updated = { ...prev, experience: prev.experience.filter((_, i) => i !== index) };
      saveCV(updated);
      return updated;
    });
  }, []);

  const updateEducation = useCallback(
    (index: number, field: keyof CVData["education"][0], value: string) => {
      setData((prev) => {
        const education = [...prev.education];
        education[index] = { ...education[index], [field]: value };
        const updated = { ...prev, education };
        saveCV(updated);
        return updated;
      });
    },
    []
  );

  const addEducation = useCallback(() => {
    setData((prev) => {
      const updated = { ...prev, education: [...prev.education, { degree: "", school: "", year: "", details: "" }] };
      saveCV(updated);
      return updated;
    });
  }, []);

  const removeEducation = useCallback((index: number) => {
    setData((prev) => {
      const updated = { ...prev, education: prev.education.filter((_, i) => i !== index) };
      saveCV(updated);
      return updated;
    });
  }, []);

  const generateCVHTML = useCallback((): string => {
    const {
      fullName,
      title,
      email,
      phone,
      location,
      website,
      linkedin,
      summary,
      skills,
      languages,
      experience,
      education,
      certifications,
      publications,
      template,
    } = data;

    const templateStyles: Record<string, string> = {
      professional: `
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .cv { padding: 0 !important; max-width: 100% !important; } }
        .cv { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 820px; margin: 0 auto; padding: 44px; color: #1e293b; background: #ffffff; }
        .header { margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
        .name { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
        .title { font-size: 16px; color: #4338ca; font-weight: 600; margin-bottom: 8px; }
        .contact { display: flex; gap: 14px; flex-wrap: wrap; font-size: 12px; color: #64748b; }
        .section { margin-bottom: 22px; }
        .section-title { font-size: 14px; font-weight: 700; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 12px; }
        .skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { background: #eef2ff; color: #3730a3; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .exp-item { margin-bottom: 14px; }
        .exp-title { font-weight: 700; font-size: 14px; color: #0f172a; }
        .exp-subtitle { color: #4338ca; font-size: 13px; font-weight: 500; }
        .exp-date { color: #94a3b8; font-size: 12px; }
        .exp-desc { margin-top: 4px; font-size: 12.5px; line-height: 1.6; color: #334155; }
        .two-col { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; }
      `,
      academic: `
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .cv { padding: 0 !important; max-width: 100% !important; } }
        .cv { font-family: Georgia, 'Times New Roman', serif; max-width: 820px; margin: 0 auto; padding: 44px; color: #1a1a1a; background: #ffffff; }
        .header { text-align: center; margin-bottom: 28px; }
        .name { font-size: 28px; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.5px; }
        .title { font-size: 15px; font-style: italic; color: #444; margin-bottom: 8px; }
        .contact { font-size: 12px; color: #555; }
        .section { margin-bottom: 22px; }
        .section-title { font-size: 13.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1.5px solid #1a1a1a; padding-bottom: 3px; margin-bottom: 12px; }
        .skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { font-size: 12px; }
        .exp-item { margin-bottom: 14px; }
        .exp-title { font-weight: 700; font-size: 14px; }
        .exp-subtitle { font-style: italic; font-size: 13px; }
        .exp-date { font-size: 12px; color: #555; }
        .exp-desc { margin-top: 4px; font-size: 12.5px; line-height: 1.6; }
        .two-col { display: block; }
      `,
      creative: `
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .cv { padding: 0 !important; max-width: 100% !important; } }
        .cv { font-family: -apple-system, system-ui, sans-serif; max-width: 820px; margin: 0 auto; padding: 44px; color: #18181b; background: #ffffff; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 3px solid #d97706; }
        .name { font-size: 32px; font-weight: 800; color: #d97706; margin-bottom: 2px; }
        .title { font-size: 15px; color: #52525b; font-weight: 500; }
        .contact { font-size: 12px; color: #71717a; text-align: right; line-height: 1.6; }
        .section { margin-bottom: 22px; }
        .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #d97706; margin-bottom: 12px; border-bottom: 1px solid #fed7aa; padding-bottom: 4px; }
        .skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { background: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .exp-item { margin-bottom: 14px; }
        .exp-title { font-weight: 700; font-size: 14px; }
        .exp-subtitle { color: #d97706; font-size: 13px; font-weight: 500; }
        .exp-date { font-size: 11px; color: #71717a; }
        .exp-desc { margin-top: 4px; font-size: 12.5px; line-height: 1.6; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
      `,
    };

    const contactParts = [email, phone, location, website, linkedin].filter(Boolean);

    const skillsHTML = skills.filter((s) => s.trim()).map((s) => `<span class="skill-tag">${s.trim()}</span>`).join("");
    const languagesHTML = languages.filter((l) => l.trim()).map((l) => `<span class="skill-tag">${l.trim()}</span>`).join("");
    const certsHTML = certifications.filter((c) => c.trim()).map((c) => `<li>${c.trim()}</li>`).join("");
    const pubsHTML = publications?.filter((p) => p.trim()).map((p) => `<li>${p.trim()}</li>`).join("");

    const experienceHTML = experience
      .filter((e) => e.title || e.company)
      .map((e) => `
      <div class="exp-item">
        <div class="exp-title">${e.title}</div>
        <div class="exp-subtitle">${e.company} <span class="exp-date">· ${e.startDate} ${e.endDate ? "– " + e.endDate : ""}</span></div>
        ${e.description ? `<div class="exp-desc">${e.description}</div>` : ""}
      </div>`).join("");

    const educationHTML = education
      .filter((e) => e.degree || e.school)
      .map((e) => `
      <div class="exp-item">
        <div class="exp-title">${e.degree}</div>
        <div class="exp-subtitle">${e.school}${e.year ? ` · ${e.year}` : ""}</div>
        ${e.details ? `<div class="exp-desc">${e.details}</div>` : ""}
      </div>`).join("");

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${fullName || "CV"}</title><style>${templateStyles[template] || templateStyles.professional}</style></head>
<body>
<div class="cv">
  <div class="header">
    <div>
      <div class="name">${fullName || "Your Name"}</div>
      <div class="title">${title || "Professional Title"}</div>
    </div>
    <div class="contact">${contactParts.join(" · ")}</div>
  </div>
  ${summary ? `<div class="section"><div class="section-title">Biography & Research Focus</div><p style="font-size:13px;line-height:1.65;color:#334155;">${summary}</p></div>` : ""}
  ${experienceHTML ? `<div class="section"><div class="section-title">Academic & Professional Appointments</div>${experienceHTML}</div>` : ""}
  ${educationHTML ? `<div class="section"><div class="section-title">Education & Credentials</div>${educationHTML}</div>` : ""}
  ${pubsHTML ? `<div class="section"><div class="section-title">Peer-Reviewed Publications</div><ol style="font-size:12.5px;line-height:1.8;padding-left:18px;">${pubsHTML}</ol></div>` : ""}
  ${certsHTML ? `<div class="section"><div class="section-title">Honors, Grants & Affiliations</div><ul style="font-size:12.5px;line-height:1.8;padding-left:18px;">${certsHTML}</ul></div>` : ""}
  <div style="display:flex;gap:30px;flex-wrap:wrap;margin-top:20px;">
    ${skillsHTML ? `<div class="section" style="flex:1;"><div class="section-title">Technical Expertise</div><div class="skills">${skillsHTML}</div></div>` : ""}
    ${languagesHTML ? `<div class="section" style="flex:1;"><div class="section-title">Languages</div><div class="skills">${languagesHTML}</div></div>` : ""}
  </div>
</div>
</body>
</html>`;
  }, [data]);

  const handlePrint = () => {
    const html = generateCVHTML();
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

  const handleDownload = useCallback(() => {
    const html = generateCVHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cv-${data.fullName?.replace(/\s+/g, "-").toLowerCase() || "untitled"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CV downloaded as HTML! (Open and Print to PDF)");
  }, [generateCVHTML, data.fullName]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generateCVHTML());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("HTML copied to clipboard!");
  }, [generateCVHTML]);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cv-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded CV JSON backup!");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setData(parsed);
        saveCV(parsed);
        toast.success("CV restored from JSON backup!");
      } catch {
        toast.error("Invalid JSON CV file.");
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setData(SAMPLE_CV);
    saveCV(SAMPLE_CV);
    toast.success("Loaded Academic CV sample!");
  };

  const handleReset = useCallback(() => {
    setData(DEFAULT_CV);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("CV reset.");
  }, []);

  return (
    <div className="space-y-5">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
          <TabsList>
            <TabsTrigger value="edit" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" /> CV Editor</TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5 text-xs"><User className="h-3.5 w-3.5" /> Preview</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleLoadSample} className="gap-1 h-8 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Sample
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1 h-8 text-xs">
              <Printer className="h-3.5 w-3.5 text-primary" /> Print / PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1 h-8 text-xs">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />} Copy HTML
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1 h-8 text-xs">
              <Download className="h-3.5 w-3.5" /> Download HTML
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExportJSON} className="gap-1 h-8 text-xs text-muted-foreground">
              Backup JSON
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1 h-8 text-xs text-muted-foreground">
              <Upload className="h-3.5 w-3.5" /> Restore
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 h-8 text-xs text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
        </div>

        <TabsContent value="edit" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">CV Style:</span>
            {(["professional", "academic", "creative"] as const).map((t) => (
              <Button key={t} variant={data.template === t ? "default" : "outline"} size="sm" onClick={() => updateField("template", t)} className="capitalize text-xs h-7">{t}</Button>
            ))}
          </div>

          <Card className="shadow-xs"><CardContent className="p-4 space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal & Academic Profile</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Full Name & Degrees (e.g. Dr. Jane Doe, Ph.D.)" value={data.fullName} onChange={(e) => updateField("fullName", e.target.value)} className="h-9 text-xs" />
              <Input placeholder="Academic Title / Designation" value={data.title} onChange={(e) => updateField("title", e.target.value)} className="h-9 text-xs" />
              <Input placeholder="Institution / Work Email" type="email" value={data.email} onChange={(e) => updateField("email", e.target.value)} className="h-9 text-xs" />
              <Input placeholder="Phone Number" value={data.phone} onChange={(e) => updateField("phone", e.target.value)} className="h-9 text-xs" />
              <Input placeholder="Location (City, Country)" value={data.location} onChange={(e) => updateField("location", e.target.value)} className="h-9 text-xs" />
              <Input placeholder="Lab / Faculty Website" value={data.website} onChange={(e) => updateField("website", e.target.value)} className="h-9 text-xs" />
              <Input placeholder="Google Scholar / LinkedIn / ORCID URL" value={data.linkedin} onChange={(e) => updateField("linkedin", e.target.value)} className="sm:col-span-2 h-9 text-xs" />
            </div>
            <Textarea placeholder="Research interests & summary statement..." className="min-h-20 text-xs leading-relaxed" value={data.summary} onChange={(e) => updateField("summary", e.target.value)} />
          </CardContent></Card>

          {/* Publications */}
          <Card className="shadow-xs"><CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> Publications ({data.publications?.length || 0})
              </Label>
              <Button variant="ghost" size="sm" onClick={() => addArrayItem("publications")} className="gap-1 h-7 text-xs"><Plus className="h-3.5 w-3.5" /> Add Citation</Button>
            </div>
            <div className="space-y-2">
              {data.publications?.map((pub, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input placeholder="e.g. Authors, 'Title', Journal, Year." value={pub} onChange={(e) => updateArrayItem("publications", i, e.target.value)} className="h-8 text-xs font-mono" />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeArrayItem("publications", i)}><X className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          </CardContent></Card>

          {/* Skills, Languages, Honors */}
          {(["skills", "languages", "certifications"] as const).map((field) => (
            <Card key={field} className="shadow-xs"><CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground capitalize">{field === "certifications" ? "Honors, Grants & Certifications" : field}</Label>
                <Button variant="ghost" size="sm" onClick={() => addArrayItem(field)} className="gap-1 h-7 text-xs"><Plus className="h-3.5 w-3.5" /> Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data[field].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Input placeholder={`${field.slice(0, -1)} ${i + 1}`} value={item} onChange={(e) => updateArrayItem(field, i, e.target.value)} className="w-44 h-8 text-xs font-medium" />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeArrayItem(field, i)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          ))}

          {/* Appointments & Experience */}
          <Card className="shadow-xs"><CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appointments & Experience</Label>
              <Button variant="ghost" size="sm" onClick={addExperience} className="gap-1 h-7 text-xs"><Plus className="h-3.5 w-3.5" /> Add Position</Button>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} className="space-y-2 p-3 border rounded-xl relative bg-card shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input placeholder="Role / Position" value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} className="h-8 text-xs font-semibold" />
                  <Input placeholder="Institution / Organization" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} className="h-8 text-xs" />
                  <Input placeholder="Start Year" value={exp.startDate} onChange={(e) => updateExperience(i, "startDate", e.target.value)} className="h-8 text-xs" />
                  <Input placeholder="End Year (or Present)" value={exp.endDate} onChange={(e) => updateExperience(i, "endDate", e.target.value)} className="h-8 text-xs" />
                </div>
                <Textarea placeholder="Research responsibilities, grant management, projects led..." className="min-h-16 text-xs leading-relaxed" value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} />
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeExperience(i)}><X className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </CardContent></Card>

          {/* Education */}
          <Card className="shadow-xs"><CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Education & Qualifications</Label>
              <Button variant="ghost" size="sm" onClick={addEducation} className="gap-1 h-7 text-xs"><Plus className="h-3.5 w-3.5" /> Add Education</Button>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} className="space-y-2 p-3 border rounded-xl relative bg-card shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} className="h-8 text-xs font-semibold" />
                  <Input placeholder="University / College" value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)} className="h-8 text-xs" />
                  <Input placeholder="Year" value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} className="h-8 text-xs" />
                </div>
                <Input placeholder="Dissertation topic, advisor, honors..." value={edu.details} onChange={(e) => updateEducation(i, "details", e.target.value)} className="h-8 text-xs" />
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeEducation(i)}><X className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card className="shadow-xs overflow-hidden border">
            <CardContent className="p-0 bg-muted/10">
              <iframe srcDoc={generateCVHTML()} className="w-full min-h-[700px] border-0 bg-white" title="CV Live Preview" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}