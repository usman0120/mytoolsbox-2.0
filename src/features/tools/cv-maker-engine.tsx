"use client";

import { useState, useCallback } from "react";
import {
  FileText, Download, Copy, Check, Trash2, Loader2,
  Sparkles, User, Briefcase, GraduationCap, Mail, Phone,
  MapPin, Globe, Plus, X, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  experience: { title: string; company: string; startDate: string; endDate: string; description: string }[];
  education: { degree: string; school: string; year: string; details: string }[];
  certifications: string[];
  template: "professional" | "academic" | "creative";
}

const STORAGE_KEY = "mytoolsbox-cv-data";

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
  template: "professional",
};

export function CVMakerEngine() {
  const [data, setData] = useState<CVData>(() => loadCV() || DEFAULT_CV);
  const [activeTab, setActiveTab] = useState("edit");
  const [copied, setCopied] = useState(false);

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
    (field: "skills" | "languages" | "certifications", index: number, value: string) => {
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

  const addArrayItem = useCallback((field: "skills" | "languages" | "certifications") => {
    setData((prev) => {
      const updated = { ...prev, [field]: [...prev[field], ""] };
      saveCV(updated);
      return updated;
    });
  }, []);

  const removeArrayItem = useCallback((field: "skills" | "languages" | "certifications", index: number) => {
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
    const { fullName, title, email, phone, location, website, linkedin, summary, skills, languages, experience, education, certifications, template } = data;

    const templateStyles: Record<string, string> = {
      professional: `
        .cv { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 48px; color: #1e293b; }
        .header { margin-bottom: 32px; }
        .name { font-size: 36px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .title { font-size: 18px; color: #6366f1; font-weight: 500; margin-bottom: 12px; }
        .contact { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; color: #64748b; }
        .section { margin-bottom: 28px; }
        .section-title { font-size: 16px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 14px; }
        .skills { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { background: #eef2ff; color: #4338ca; padding: 5px 14px; border-radius: 6px; font-size: 13px; }
        .exp-item { margin-bottom: 18px; }
        .exp-title { font-weight: 600; font-size: 15px; }
        .exp-subtitle { color: #6366f1; font-size: 14px; }
        .exp-date { color: #94a3b8; font-size: 12px; }
        .exp-desc { margin-top: 6px; font-size: 13px; line-height: 1.7; color: #475569; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
      `,
      academic: `
        .cv { font-family: Georgia, 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 48px; color: #1a1a1a; }
        .header { text-align: center; margin-bottom: 32px; }
        .name { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
        .title { font-size: 16px; font-style: italic; color: #555; margin-bottom: 10px; }
        .contact { font-size: 12px; color: #666; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #333; padding-bottom: 4px; margin-bottom: 12px; }
        .skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { font-size: 13px; }
        .exp-item { margin-bottom: 16px; }
        .exp-title { font-weight: 700; font-size: 14px; }
        .exp-subtitle { font-style: italic; font-size: 13px; }
        .exp-date { font-size: 12px; color: #666; }
        .exp-desc { margin-top: 4px; font-size: 13px; line-height: 1.6; }
      `,
      creative: `
        .cv { font-family: 'Inter', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 48px; color: #18181b; background: #fafafa; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 4px solid #f59e0b; }
        .name { font-size: 40px; font-weight: 800; color: #f59e0b; margin-bottom: 2px; }
        .title { font-size: 16px; color: #78716c; font-weight: 500; }
        .contact { font-size: 12px; color: #a8a29e; text-align: right; }
        .section { margin-bottom: 28px; }
        .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #f59e0b; margin-bottom: 14px; }
        .skills { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .exp-item { margin-bottom: 18px; }
        .exp-title { font-weight: 600; font-size: 15px; }
        .exp-subtitle { color: #78716c; font-size: 13px; }
        .exp-date { font-size: 11px; color: #d6d3d1; }
        .exp-desc { margin-top: 6px; font-size: 13px; line-height: 1.7; }
      `,
    };

    const contactParts = [email, phone, location, website, linkedin].filter(Boolean);

    const skillsHTML = skills.filter((s) => s.trim()).map((s) => `<span class="skill-tag">${s.trim()}</span>`).join("");
    const languagesHTML = languages.filter((l) => l.trim()).map((l) => `<span class="skill-tag">${l.trim()}</span>`).join("");
    const certsHTML = certifications.filter((c) => c.trim()).map((c) => `<li>${c.trim()}</li>`).join("");

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
    <div class="contact">${contactParts.join("<br>")}</div>
  </div>
  ${summary ? `<div class="section"><div class="section-title">Professional Summary</div><p style="font-size:13px;line-height:1.7;">${summary}</p></div>` : ""}
  <div class="two-col">
    <div>
      ${experienceHTML ? `<div class="section"><div class="section-title">Experience</div>${experienceHTML}</div>` : ""}
      ${educationHTML ? `<div class="section"><div class="section-title">Education</div>${educationHTML}</div>` : ""}
    </div>
    <div>
      ${skillsHTML ? `<div class="section"><div class="section-title">Skills</div><div class="skills">${skillsHTML}</div></div>` : ""}
      ${languagesHTML ? `<div class="section"><div class="section-title">Languages</div><div class="skills">${languagesHTML}</div></div>` : ""}
      ${certsHTML ? `<div class="section"><div class="section-title">Certifications</div><ul style="font-size:13px;line-height:1.8;padding-left:18px;">${certsHTML}</ul></div>` : ""}
    </div>
  </div>
</div>
</body>
</html>`;
  }, [data]);

  const handleDownload = useCallback(() => {
    const html = generateCVHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cv-${data.fullName?.replace(/\s+/g, "-").toLowerCase() || "untitled"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CV downloaded as HTML! Open in browser and print to PDF.");
  }, [generateCVHTML, data.fullName]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generateCVHTML());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("HTML copied!");
  }, [generateCVHTML]);

  const handleReset = useCallback(() => {
    setData(DEFAULT_CV);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("CV reset.");
  }, []);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="edit" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Edit</TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5"><User className="h-3.5 w-3.5" /> Preview</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>

        <TabsContent value="edit" className="mt-4 space-y-4">
          <div className="flex gap-2">
            {(["professional", "academic", "creative"] as const).map((t) => (
              <Button key={t} variant={data.template === t ? "default" : "outline"} size="sm" onClick={() => updateField("template", t)} className="capitalize">{t}</Button>
            ))}
          </div>

          <Card><CardContent className="p-4 space-y-3">
            <Label className="text-sm font-medium">Personal Information</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Full Name" value={data.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
              <Input placeholder="Professional Title" value={data.title} onChange={(e) => updateField("title", e.target.value)} />
              <Input placeholder="Email" type="email" value={data.email} onChange={(e) => updateField("email", e.target.value)} />
              <Input placeholder="Phone" value={data.phone} onChange={(e) => updateField("phone", e.target.value)} />
              <Input placeholder="Location" value={data.location} onChange={(e) => updateField("location", e.target.value)} />
              <Input placeholder="Website" value={data.website} onChange={(e) => updateField("website", e.target.value)} />
              <Input placeholder="LinkedIn URL" value={data.linkedin} onChange={(e) => updateField("linkedin", e.target.value)} className="sm:col-span-2" />
            </div>
            <Textarea placeholder="Professional summary..." className="min-h-20" value={data.summary} onChange={(e) => updateField("summary", e.target.value)} />
          </CardContent></Card>

          {(["skills", "languages", "certifications"] as const).map((field) => (
            <Card key={field}><CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium capitalize">{field}</Label>
                <Button variant="ghost" size="sm" onClick={() => addArrayItem(field)} className="gap-1 h-7"><Plus className="h-3.5 w-3.5" /> Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data[field].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Input placeholder={`${field.slice(0, -1)} ${i + 1}`} value={item} onChange={(e) => updateArrayItem(field, i, e.target.value)} className="w-40 h-8 text-sm" />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeArrayItem(field, i)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          ))}

          <Card><CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Experience</Label>
              <Button variant="ghost" size="sm" onClick={addExperience} className="gap-1 h-7"><Plus className="h-3.5 w-3.5" /> Add</Button>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} className="space-y-2 p-3 border rounded-lg relative">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Job Title" value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} className="h-8 text-sm" />
                  <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} className="h-8 text-sm" />
                  <Input placeholder="Start Date" value={exp.startDate} onChange={(e) => updateExperience(i, "startDate", e.target.value)} className="h-8 text-sm" />
                  <Input placeholder="End Date" value={exp.endDate} onChange={(e) => updateExperience(i, "endDate", e.target.value)} className="h-8 text-sm" />
                </div>
                <Textarea placeholder="Description..." className="min-h-15 text-sm" value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} />
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeExperience(i)}><X className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </CardContent></Card>

          <Card><CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Education</Label>
              <Button variant="ghost" size="sm" onClick={addEducation} className="gap-1 h-7"><Plus className="h-3.5 w-3.5" /> Add</Button>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} className="space-y-2 p-3 border rounded-lg relative">
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} className="h-8 text-sm" />
                  <Input placeholder="School" value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)} className="h-8 text-sm" />
                  <Input placeholder="Year" value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} className="h-8 text-sm" />
                </div>
                <Input placeholder="Details (GPA, honors, etc.)" value={edu.details} onChange={(e) => updateEducation(i, "details", e.target.value)} className="h-8 text-sm" />
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeEducation(i)}><X className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card><CardContent className="p-0">
            <iframe srcDoc={generateCVHTML()} className="w-full min-h-[600px] border-0" title="CV Preview" />
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}