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

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  skills: string[];
  experience: { title: string; company: string; startDate: string; endDate: string; description: string }[];
  education: { degree: string; school: string; year: string }[];
  template: "modern" | "classic" | "minimal";
}

const STORAGE_KEY = "mytoolsbox-resume-data";

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

export function ResumeBuilderEngine() {
  const [data, setData] = useState<ResumeData>(() => loadResume() || DEFAULT_RESUME);
  const [activeTab, setActiveTab] = useState("edit");
  const [copied, setCopied] = useState(false);

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
        experience: [...prev.experience, { title: "", company: "", startDate: "", endDate: "", description: "" }],
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
      const updated = { ...prev, education: [...prev.education, { degree: "", school: "", year: "" }] };
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
        .resume { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a2e; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #6366f1; }
        .name { font-size: 32px; font-weight: 700; color: #6366f1; margin-bottom: 8px; }
        .contact { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-size: 14px; color: #64748b; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 18px; font-weight: 600; color: #6366f1; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
        .skills { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { background: #eef2ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-size: 13px; }
        .exp-item { margin-bottom: 16px; }
        .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
        .exp-title { font-weight: 600; font-size: 16px; }
        .exp-company { color: #6366f1; font-weight: 500; }
        .exp-date { color: #94a3b8; font-size: 13px; }
        .exp-desc { margin-top: 6px; font-size: 14px; line-height: 1.6; color: #475569; }
      `,
      classic: `
        .resume { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; }
        .header { text-align: center; margin-bottom: 30px; }
        .name { font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
        .contact { font-size: 13px; color: #555; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 4px; margin-bottom: 12px; }
        .skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { font-size: 13px; }
        .exp-item { margin-bottom: 16px; }
        .exp-title { font-weight: 700; font-size: 15px; }
        .exp-company { font-style: italic; }
        .exp-date { font-size: 13px; color: #666; }
        .exp-desc { margin-top: 4px; font-size: 13px; line-height: 1.6; }
      `,
      minimal: `
        .resume { font-family: 'Inter', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #18181b; }
        .header { margin-bottom: 30px; }
        .name { font-size: 36px; font-weight: 300; margin-bottom: 4px; }
        .contact { font-size: 13px; color: #71717a; display: flex; gap: 16px; flex-wrap: wrap; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #a1a1aa; margin-bottom: 12px; }
        .skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { font-size: 13px; color: #52525b; }
        .exp-item { margin-bottom: 16px; }
        .exp-title { font-weight: 500; font-size: 15px; }
        .exp-company { color: #71717a; }
        .exp-date { font-size: 12px; color: #a1a1aa; }
        .exp-desc { margin-top: 4px; font-size: 13px; line-height: 1.6; color: #52525b; }
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
<head><meta charset="UTF-8"><title>${fullName || "Resume"}</title><style>${templateStyles[template] || templateStyles.modern}</style></head>
<body>
<div class="resume">
  <div class="header">
    <div class="name">${fullName || "Your Name"}</div>
    <div class="contact">${contactParts.join(" · ")}</div>
  </div>
  ${summary ? `<div class="section"><div class="section-title">Summary</div><p style="font-size:14px;line-height:1.6;">${summary}</p></div>` : ""}
  ${skillsHTML ? `<div class="section"><div class="section-title">Skills</div><div class="skills">${skillsHTML}</div></div>` : ""}
  ${experienceHTML ? `<div class="section"><div class="section-title">Experience</div>${experienceHTML}</div>` : ""}
  ${educationHTML ? `<div class="section"><div class="section-title">Education</div>${educationHTML}</div>` : ""}
</div>
</body>
</html>`;
  }, [data]);

  const handleDownload = useCallback(() => {
    const html = generateResumeHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${data.fullName?.replace(/\s+/g, "-").toLowerCase() || "untitled"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded as HTML! Open in browser and print to PDF.");
  }, [generateResumeHTML, data.fullName]);

  const handleCopy = useCallback(async () => {
    const html = generateResumeHTML();
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("HTML copied to clipboard!");
  }, [generateResumeHTML]);

  const handleReset = useCallback(() => {
    setData(DEFAULT_RESUME);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Resume reset.");
  }, []);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="edit" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5">
              <User className="h-3.5 w-3.5" /> Preview
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              Copy HTML
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
          {/* Template selector */}
          <div className="flex gap-2">
            {(["modern", "classic", "minimal"] as const).map((t) => (
              <Button
                key={t}
                variant={data.template === t ? "default" : "outline"}
                size="sm"
                onClick={() => updateField("template", t)}
                className="capitalize"
              >
                {t}
              </Button>
            ))}
          </div>

          {/* Personal Info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Label className="text-sm font-medium">Personal Information</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Full Name" value={data.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
                <Input placeholder="Email" type="email" value={data.email} onChange={(e) => updateField("email", e.target.value)} />
                <Input placeholder="Phone" value={data.phone} onChange={(e) => updateField("phone", e.target.value)} />
                <Input placeholder="Location" value={data.location} onChange={(e) => updateField("location", e.target.value)} />
                <Input placeholder="Website / LinkedIn" value={data.website} onChange={(e) => updateField("website", e.target.value)} className="sm:col-span-2" />
              </div>
              <Textarea
                placeholder="Professional summary..."
                className="min-h-20"
                value={data.summary}
                onChange={(e) => updateField("summary", e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Skills</Label>
                <Button variant="ghost" size="sm" onClick={addSkill} className="gap-1 h-7">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Input
                      placeholder={`Skill ${i + 1}`}
                      value={skill}
                      onChange={(e) => updateSkill(i, e.target.value)}
                      className="w-32 h-8 text-sm"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeSkill(i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Experience</Label>
                <Button variant="ghost" size="sm" onClick={addExperience} className="gap-1 h-7">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} className="space-y-2 p-3 border rounded-lg relative">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Job Title" value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} className="h-8 text-sm" />
                    <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} className="h-8 text-sm" />
                    <Input placeholder="Start Date" value={exp.startDate} onChange={(e) => updateExperience(i, "startDate", e.target.value)} className="h-8 text-sm" />
                    <Input placeholder="End Date" value={exp.endDate} onChange={(e) => updateExperience(i, "endDate", e.target.value)} className="h-8 text-sm" />
                  </div>
                  <Textarea
                    placeholder="Description..."
                    className="min-h-15 text-sm"
                    value={exp.description}
                    onChange={(e) => updateExperience(i, "description", e.target.value)}
                  />
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeExperience(i)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Education</Label>
                <Button variant="ghost" size="sm" onClick={addEducation} className="gap-1 h-7">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
              {data.education.map((edu, i) => (
                <div key={i} className="space-y-2 p-3 border rounded-lg relative">
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} className="h-8 text-sm" />
                    <Input placeholder="School" value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)} className="h-8 text-sm" />
                    <Input placeholder="Year" value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} className="h-8 text-sm" />
                  </div>
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeEducation(i)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <iframe
                srcDoc={generateResumeHTML()}
                className="w-full min-h-[600px] border-0"
                title="Resume Preview"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}