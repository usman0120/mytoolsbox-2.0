"use client";

import { useState, useCallback } from "react";
import {
  FileText,
  Download,
  Copy,
  Check,
  Trash2,
  User,
  Building,
  Sparkles,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

const SAMPLE_DATA: CoverLetterData = {
  fullName: "Jordan Lee",
  email: "jordan.lee@example.com",
  phone: "+1 (415) 555-8921",
  location: "San Francisco, CA",
  companyName: "Stripe",
  hiringManager: "Engineering Leadership Team",
  jobTitle: "Staff Software Engineer",
  tone: "professional",
  opening:
    "I am writing to express my strong interest in the [Job Title] role at [Company Name]. Having followed [Company Name]'s relentless pursuit of infrastructure elegance and developer productivity, I am eager to contribute my experience in high-throughput payment architectures and reliable distributed systems.",
  body:
    "Over the past seven years, I have specialized in building mission-critical services that process millions of transactions with strict consistency guarantees. At my previous company, I led the core checkout rewrite that increased checkout conversion by 4.2% while reducing 99th percentile API latency from 450ms to 85ms. I pride myself on establishing collaborative engineering cultures, authoring thorough design documents, and mentoring engineers to take autonomous ownership of scalable architectures.",
  closing:
    "I am enthusiastic about the opportunity to bring my architectural rigor and execution velocity to [Company Name]. Thank you for your time and thoughtful consideration. I look forward to the opportunity to discuss how my background aligns with your team's upcoming roadmaps.",
};

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
    opening:
      "I am writing to submit my application for the [Job Title] position at [Company Name]. With a proven track record in technical leadership and scalable execution, I am confident in my ability to immediately deliver tangible value to your organization.",
    body:
      "Throughout my career, I have focused on solving high-impact operational and architectural challenges. In my recent roles, I have spearheaded cross-functional initiatives that directly increased system efficiency and reduced customer friction. I deeply admire [Company Name]'s market position and believe my background aligns directly with your strategic goals.",
    closing:
      "I would appreciate the opportunity to discuss how my skill set and experience can support [Company Name]'s continued expansion. Thank you for your time and review. I look forward to speaking with you.",
  },
  enthusiastic: {
    opening:
      "I was thrilled to discover the [Job Title] opening at [Company Name]! As an avid user and genuine admirer of your team's mission, I could not imagine a more exciting opportunity to dedicate my passion and craft.",
    body:
      "What excites me most about [Company Name] is your commitment to exceptional product craft. Over the past several years, I have honed my capabilities in building beloved user experiences and robust backend workflows. I thrive in energetic environments where high autonomy and creative problem-solving are valued.",
    closing:
      "I would love the chance to channel my energy and dedication into [Company Name]'s mission. Thank you so much for reviewing my application, and I can't wait for the chance to connect!",
  },
  confident: {
    opening:
      "I am applying for the [Job Title] position at [Company Name] with a demonstrable record of delivering measurable commercial and engineering outcomes under tight constraints.",
    body:
      "My approach is rooted in accountability, quantitative metrics, and rapid iteration. In my prior engagements, I have repeatedly turned ambiguous briefs into high-performing systems that cut costs and boosted annual revenues. I understand exactly what this role demands and possess the expertise to hit the ground running from day one.",
    closing:
      "I am ready to deliver immediate results for [Company Name]. Let's arrange a time to discuss how my track record will translate into quantifiable success for your team.",
  },
  creative: {
    opening:
      "What if your next [Job Title] could bring not only deep technical execution, but an entirely fresh vantage point on how [Company Name] tackles its biggest milestones?",
    body:
      "My career path has been defined by questioning standard assumptions and finding elegant, unconventional solutions. Where others see friction, I see opportunities to craft delightful experiences that surprise and engage customers. Joining [Company Name] offers the perfect canvas to push those boundaries even further.",
    closing:
      "Let's build something truly memorable together. I look forward to exploring how my creative perspective and technical rigor can elevate [Company Name].",
  },
};

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

export function CoverLetterGeneratorEngine() {
  const [data, setData] = useState<CoverLetterData>(() => loadData() || SAMPLE_DATA);
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
    toast.success(`Applied ${tone} tone template!`);
  }, []);

  const generateLetter = useCallback((): string => {
    const {
      fullName,
      email,
      phone,
      location,
      companyName,
      hiringManager,
      jobTitle,
      opening,
      body,
      closing,
    } = data;
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const salutation = hiringManager ? `Dear ${hiringManager},` : "Dear Hiring Team,";

    const replacePlaceholders = (text: string) =>
      text
        .replace(/\[Job Title\]/g, jobTitle || "[Job Title]")
        .replace(/\[Company Name\]/g, companyName || "[Company Name]");

    const processedOpening = replacePlaceholders(opening);
    const processedBody = replacePlaceholders(body);
    const processedClosing = replacePlaceholders(closing);

    const contactInfo = [email, phone, location].filter(Boolean).join("  •  ");

    return `${fullName || "[Your Name]"}
${contactInfo}

${date}

To: The Hiring Team
${companyName || "[Company Name]"}

${salutation}

${processedOpening}

${processedBody}

${processedClosing}

Sincerely,

${fullName || "[Your Name]"}`;
  }, [data]);

  const handlePrint = () => {
    const letter = generateLetter();
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"><title>Cover Letter - ${data.fullName}</title>
<style>
@media print { body { padding: 0; } }
body { font-family: -apple-system, system-ui, Georgia, serif; max-width: 720px; margin: 40px auto; padding: 20px; line-height: 1.7; font-size: 14px; color: #1e293b; }
pre { white-space: pre-wrap; font-family: inherit; }
</style>
</head>
<body><pre>${letter}</pre></body>
</html>`);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 300);
    }
  };

  const handleDownload = useCallback(() => {
    const text = generateLetter();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${data.companyName?.replace(/\s+/g, "-").toLowerCase() || "untitled"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded cover letter!");
  }, [generateLetter, data.companyName]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generateLetter());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  }, [generateLetter]);

  const handleLoadSample = () => {
    setData(SAMPLE_DATA);
    saveData(SAMPLE_DATA);
    toast.success("Loaded sample cover letter!");
  };

  const handleReset = useCallback(() => {
    setData(DEFAULT_DATA);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Cover letter cleared.");
  }, []);

  return (
    <div className="space-y-5">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
          <TabsList>
            <TabsTrigger value="edit" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" /> Letter Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5 text-xs">
              <User className="h-3.5 w-3.5" /> Formatted Preview
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleLoadSample} className="gap-1 h-8 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Sample
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1 h-8 text-xs">
              <Printer className="h-3.5 w-3.5 text-primary" /> Print / PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1 h-8 text-xs">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />} Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1 h-8 text-xs">
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 h-8 text-xs text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
        </div>

        <TabsContent value="edit" className="mt-4 space-y-4">
          {/* Tone Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Voice & Tone:</span>
            {(["professional", "enthusiastic", "confident", "creative"] as const).map((t) => (
              <Button
                key={t}
                variant={data.tone === t ? "default" : "outline"}
                size="sm"
                onClick={() => applyTemplate(t)}
                className="capitalize text-xs h-7"
              >
                {t}
              </Button>
            ))}
          </div>

          {/* Applicant & Job Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-xs">
              <CardContent className="p-4 space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Information
                </Label>
                <div className="space-y-2">
                  <Input placeholder="Full Name" value={data.fullName} onChange={(e) => updateField("fullName", e.target.value)} className="h-8 text-xs" />
                  <Input placeholder="Email Address" type="email" value={data.email} onChange={(e) => updateField("email", e.target.value)} className="h-8 text-xs" />
                  <Input placeholder="Phone Number" value={data.phone} onChange={(e) => updateField("phone", e.target.value)} className="h-8 text-xs" />
                  <Input placeholder="Location (City, State)" value={data.location} onChange={(e) => updateField("location", e.target.value)} className="h-8 text-xs" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardContent className="p-4 space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Company & Role
                </Label>
                <div className="space-y-2">
                  <Input placeholder="Company Name (e.g. Stripe, Apple)" value={data.companyName} onChange={(e) => updateField("companyName", e.target.value)} className="h-8 text-xs font-semibold" />
                  <Input placeholder="Target Job Title (e.g. Staff Engineer)" value={data.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} className="h-8 text-xs font-semibold" />
                  <Input placeholder="Hiring Manager / Team (optional)" value={data.hiringManager} onChange={(e) => updateField("hiringManager", e.target.value)} className="h-8 text-xs" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Letter Body Sections */}
          <Card className="shadow-xs">
            <CardContent className="p-4 space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Opening Paragraph (Hook & Core Interest)
              </Label>
              <Textarea
                placeholder="Hook the hiring manager and state the role you are targeting..."
                className="min-h-20 text-xs leading-relaxed"
                value={data.opening}
                onChange={(e) => updateField("opening", e.target.value)}
              />
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardContent className="p-4 space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Core Body Paragraphs (Achievements & Value Add)
              </Label>
              <Textarea
                placeholder="Highlight 2-3 specific accomplishments with metrics, experience, and cultural alignment..."
                className="min-h-32 text-xs leading-relaxed"
                value={data.body}
                onChange={(e) => updateField("body", e.target.value)}
              />
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardContent className="p-4 space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Closing Paragraph & Call-to-Action
              </Label>
              <Textarea
                placeholder="Reiterate interest and suggest next discussion steps..."
                className="min-h-20 text-xs leading-relaxed"
                value={data.closing}
                onChange={(e) => updateField("closing", e.target.value)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card className="shadow-xs border">
            <CardContent className="p-8 bg-card text-foreground">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed border p-6 rounded-xl bg-muted/20">
                {generateLetter()}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}