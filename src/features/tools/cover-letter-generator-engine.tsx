"use client";

import { useState, useCallback } from "react";
import {
  FileText, Download, Copy, Check, Trash2, Loader2,
  Sparkles, Briefcase, User, Building, Plus, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface CoverLetterData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  companyName: string;
  hiringManager: string;
  jobTitle: string;
  tone: "professional" | "enthusiastic" | "confident" | "creative";
  opening: string;
  body: string;
  closing: string;
}

const STORAGE_KEY = "mytoolsbox-cover-letter";

function loadData(): CoverLetterData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveData(data: CoverLetterData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const DEFAULT_DATA: CoverLetterData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  companyName: "",
  hiringManager: "",
  jobTitle: "",
  tone: "professional",
  opening: "",
  body: "",
  closing: "",
};

const TONE_TEMPLATES: Record<string, { opening: string; body: string; closing: string }> = {
  professional: {
    opening: "I am writing to express my strong interest in the [Job Title] position at [Company Name]. With my background and skills, I am confident I would be a valuable addition to your team.",
    body: "Throughout my career, I have developed expertise in [key skills/areas]. At my previous role, I successfully [key achievement]. I am particularly drawn to [Company Name] because of [reason], and I believe my experience in [relevant area] aligns perfectly with your team's goals.",
    closing: "I would welcome the opportunity to discuss how my skills and experience can contribute to [Company Name]'s continued success. Thank you for your time and consideration. I look forward to hearing from you.",
  },
  enthusiastic: {
    opening: "I am thrilled to apply for the [Job Title] role at [Company Name]! As a long-time admirer of your work in [industry/field], I can't think of a better place to contribute my skills and passion.",
    body: "What excites me most about this opportunity is [specific aspect]. I've spent the last [X years] honing my skills in [area], and I'm eager to bring that energy to your team. At [previous company], I [key achievement], and I'm ready to make an even bigger impact at [Company Name].",
    closing: "I would love the chance to bring my enthusiasm and skills to [Company Name]. I'm excited about the possibility of contributing to your amazing team. Thank you for considering my application!",
  },
  confident: {
    opening: "I am applying for the [Job Title] position at [Company Name] with the confidence that my track record of delivering results makes me an ideal candidate for this role.",
    body: "My experience speaks for itself: I have consistently [key achievement/metric]. At [previous company], I led initiatives that resulted in [quantifiable result]. I understand what it takes to succeed in [industry], and I'm ready to bring that same level of excellence to [Company Name].",
    closing: "I am ready to hit the ground running and deliver results for [Company Name]. I look forward to discussing how my proven track record can translate to success for your team. Thank you for your consideration.",
  },
  creative: {
    opening: "What if your next [Job Title] could bring not just skills, but a fresh perspective that transforms how your team approaches [key challenge]? That's exactly what I offer [Company Name].",
    body: "My journey in [field] has been anything but conventional. From [unique experience] to [creative achievement], I've learned that the best solutions come from thinking differently. At [Company Name], I see an opportunity to apply this creative approach to [specific challenge/goal].",
    closing: "Let's create something remarkable together. I'd love to share more about how my unique perspective can help [Company Name] stand out. Thank you for taking the time to review my application.",
  },
};

export function CoverLetterGeneratorEngine() {
  const [data, setData] = useState<CoverLetterData>(() => loadData() || DEFAULT_DATA);
  const [activeTab, setActiveTab] = useState("edit");
  const [copied, setCopied] = useState(false);

  const updateField = useCallback(
    <K extends keyof CoverLetterData>(field: K, value: CoverLetterData[K]) => {
      setData((prev) => {
        const updated = { ...prev, [field]: value };
        saveData(updated);
        return updated;
      });
    },
    []
  );

  const applyTemplate = useCallback((tone: CoverLetterData["tone"]) => {
    const template = TONE_TEMPLATES[tone];
    setData((prev) => {
      const updated = { ...prev, tone, ...template };
      saveData(updated);
      return updated;
    });
    toast.success(`${tone.charAt(0).toUpperCase() + tone.slice(1)} template applied!`);
  }, []);

  const generateLetter = useCallback((): string => {
    const { fullName, email, phone, location, companyName, hiringManager, jobTitle, opening, body, closing } = data;
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const salutation = hiringManager ? `Dear ${hiringManager},` : "Dear Hiring Manager,";

    const processedOpening = opening
      .replace(/\[Job Title\]/g, jobTitle || "[Job Title]")
      .replace(/\[Company Name\]/g, companyName || "[Company Name]");

    const processedBody = body
      .replace(/\[Job Title\]/g, jobTitle || "[Job Title]")
      .replace(/\[Company Name\]/g, companyName || "[Company Name]");

    const processedClosing = closing
      .replace(/\[Job Title\]/g, jobTitle || "[Job Title]")
      .replace(/\[Company Name\]/g, companyName || "[Company Name]");

    const contactInfo = [email, phone, location].filter(Boolean).join(" | ");

    return `${fullName || "[Your Name]"}
${contactInfo}

${date}

${salutation}

${processedOpening}

${processedBody}

${processedClosing}

Sincerely,
${fullName || "[Your Name]"}`;
  }, [data]);

  const handleDownload = useCallback(() => {
    const text = generateLetter();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${data.companyName?.replace(/\s+/g, "-").toLowerCase() || "untitled"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded!");
  }, [generateLetter, data.companyName]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generateLetter());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  }, [generateLetter]);

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
          {/* Tone selector */}
          <div className="flex gap-2 flex-wrap">
            <Label className="text-sm font-medium self-center mr-2">Tone:</Label>
            {(["professional", "enthusiastic", "confident", "creative"] as const).map((t) => (
              <Button
                key={t}
                variant={data.tone === t ? "default" : "outline"}
                size="sm"
                onClick={() => applyTemplate(t)}
                className="capitalize"
              >
                {t}
              </Button>
            ))}
          </div>

          {/* Personal Info */}
          <Card><CardContent className="p-4 space-y-3">
            <Label className="text-sm font-medium">Your Information</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Full Name" value={data.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
              <Input placeholder="Email" type="email" value={data.email} onChange={(e) => updateField("email", e.target.value)} />
              <Input placeholder="Phone" value={data.phone} onChange={(e) => updateField("phone", e.target.value)} />
              <Input placeholder="Location" value={data.location} onChange={(e) => updateField("location", e.target.value)} />
            </div>
          </CardContent></Card>

          {/* Job Info */}
          <Card><CardContent className="p-4 space-y-3">
            <Label className="text-sm font-medium">Job Details</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Company Name" value={data.companyName} onChange={(e) => updateField("companyName", e.target.value)} />
              <Input placeholder="Job Title" value={data.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} />
              <Input placeholder="Hiring Manager (optional)" value={data.hiringManager} onChange={(e) => updateField("hiringManager", e.target.value)} className="sm:col-span-2" />
            </div>
          </CardContent></Card>

          {/* Letter Content */}
          <Card><CardContent className="p-4 space-y-3">
            <Label className="text-sm font-medium">Opening Paragraph</Label>
            <Textarea
              placeholder="Write your opening paragraph..."
              className="min-h-[100px]"
              value={data.opening}
              onChange={(e) => updateField("opening", e.target.value)}
            />
          </CardContent></Card>

          <Card><CardContent className="p-4 space-y-3">
            <Label className="text-sm font-medium">Body Paragraph(s)</Label>
            <Textarea
              placeholder="Write the body of your letter..."
              className="min-h-[150px]"
              value={data.body}
              onChange={(e) => updateField("body", e.target.value)}
            />
          </CardContent></Card>

          <Card><CardContent className="p-4 space-y-3">
            <Label className="text-sm font-medium">Closing Paragraph</Label>
            <Textarea
              placeholder="Write your closing paragraph..."
              className="min-h-[100px]"
              value={data.closing}
              onChange={(e) => updateField("closing", e.target.value)}
            />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card><CardContent className="p-6">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{generateLetter()}</pre>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}