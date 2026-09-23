"use client";

import { useState } from "react";
import {
  FileText,
  Copy,
  Download,
  Trash2,
  Wand2,
  Check,
  ListChecks,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const RFP_SECTIONS = [
  { id: "Executive Summary", label: "Executive Summary" },
  { id: "Company Background", label: "Company Background" },
  { id: "Project Scope & Objectives", label: "Scope & Deliverables" },
  { id: "Technical Requirements", label: "Technical & Security" },
  { id: "Timeline & Milestones", label: "Timeline & Milestones" },
  { id: "Budget & Pricing", label: "Budget & Pricing Model" },
  { id: "Evaluation Criteria", label: "Vendor Evaluation Criteria" },
  { id: "Terms & Conditions", label: "Terms & SLA Commitments" },
  { id: "Submission Guidelines", label: "Submission Deadlines" },
  { id: "Appendices", label: "Appendices & Required Forms" },
];

export function RFPMonkeyEngine() {
  const [projectName, setProjectName] = useState("Enterprise Cloud Infrastructure Modernization");
  const [organization, setOrganization] = useState("Acme Global Technologies Inc.");
  const [industry, setIndustry] = useState("Information Technology & Software");
  const [budget, setBudget] = useState("$50,000 – $150,000 USD");
  const [deadline, setDeadline] = useState("30 days from RFP issuance");
  const [description, setDescription] = useState(
    "Seeking qualified vendors to architect, deploy, and support high-availability cloud infrastructure with enterprise-grade SLA, SOC2 compliance, and zero downtime migration."
  );
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "Executive Summary",
    "Company Background",
    "Project Scope & Objectives",
    "Technical Requirements",
    "Timeline & Milestones",
    "Budget & Pricing",
    "Evaluation Criteria",
    "Terms & Conditions",
    "Submission Guidelines",
  ]);
  const [generatedRFP, setGeneratedRFP] = useState("");
  const [copied, setCopied] = useState(false);

  const toggleSection = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleGenerate = () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name.");
      return;
    }
    if (selectedSections.length === 0) {
      toast.error("Please select at least one RFP section.");
      return;
    }

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const sectionBodies: Record<string, string> = {
      "Executive Summary":
        `### 1. Purpose & Strategic Intent\n` +
        `${organization} invites experienced and qualified vendors to submit comprehensive proposals for **${projectName}**.\n\n` +
        `The primary objective is to execute a rigorous, scalable, and cost-effective initiative that directly addresses our operational requirements.\n\n` +
        `**Key Focus:** ${description || "Comprehensive end-to-end execution and long-term support."}\n`,

      "Company Background":
        `### 2. About ${organization}\n` +
        `${organization} is an established organization operating in the **${industry}** sector.\n` +
        `Our team emphasizes high standards of quality, reliability, and security across all business operations. Vendors are expected to align with our corporate values of transparency, measurable accountability, and technical excellence.\n`,

      "Project Scope & Objectives":
        `### 3. Detailed Scope of Work & Deliverables\n` +
        `The successful respondent shall be responsible for full-lifecycle delivery, encompassing:\n\n` +
        `1. **Discovery & Architecture Planning:** Thorough analysis of existing dependencies, constraint analysis, and validated blueprint delivery.\n` +
        `2. **Implementation & Staging:** Phased rollout adhering to documented engineering standards and automated testing protocols.\n` +
        `3. **Quality Assurance & User Acceptance Testing (UAT):** Formal verification ensuring 100% adherence to agreed specification criteria.\n` +
        `4. **Deployment & Handover:** Zero-defect deployment alongside administrator runbooks, architecture diagrams, and knowledge transfer workshops.\n` +
        `5. **Post-Launch Warranty:** Minimum 90-day stabilization window with 24/7 critical issue resolution support.\n`,

      "Technical Requirements":
        `### 4. Technical Architecture, Security & Governance\n` +
        `Proposals must demonstrate compliance with the following mandatory specifications:\n\n` +
        `• **Security & Encryption:** End-to-end data encryption at rest (AES-256) and in transit (TLS 1.3). Role-Based Access Control (RBAC).\n` +
        `• **Compliance Frameworks:** Adherence to standard privacy and security benchmarks (e.g. SOC 2 Type II, ISO 27001, GDPR) where applicable.\n` +
        `• **Availability & Scalability:** Designed for 99.95%+ uptime with automated failover and geo-redundant disaster recovery mechanisms.\n` +
        `• **Audit & Logging:** Comprehensive immutable audit trail logging and alerting integrations.\n`,

      "Timeline & Milestones":
        `### 5. Schedule & Delivery Milestones\n` +
        `The anticipated execution roadmap is structured as follows:\n\n` +
        `| Milestone Stage | Target Horizon | Mandatory Output |\n` +
        `| :--- | :--- | :--- |\n` +
        `| RFP Questions & Clarifications | 7 Days from Issuance | Consolidated Vendor FAQ |\n` +
        `| Formal Submission Deadline | ${deadline} | Comprehensive Bid Package |\n` +
        `| Vendor Shortlist Presentations | 14 Days Post-Submission | Technical Demonstrations |\n` +
        `| Final Contract Award | 21 Days Post-Submission | Signed Master Services Agreement |\n` +
        `| Project Kick-off | 30 Days Post-Award | Approved Project Charter |\n`,

      "Budget & Pricing":
        `### 6. Commercial Structure & Budget Ceiling\n` +
        `• **Target Estimated Range:** ${budget}\n` +
        `• **Pricing Model:** Proposals must detail a milestone-based fixed-fee schedule or a blended rate card with guaranteed maximum price (GMP).\n` +
        `• **Transparency:** All software licenses, third-party subscriptions, hosting overheads, and potential contingency reserves must be explicitly line-itemed.\n`,

      "Evaluation Criteria":
        `### 7. Evaluation & Selection Weighting\n` +
        `Submissions will be objectively scored by the evaluation committee across five pillars:\n\n` +
        `• **Technical Capability & Architecture (30%):** Completeness of proposed solution and compliance with architectural requirements.\n` +
        `• **Vendor Track Record & Case Studies (25%):** Demonstrable success executing comparable scale projects for tier-1 organizations.\n` +
        `• **Commercial Value & Pricing (20%):** Cost predictability, competitive pricing, and overall return on investment (ROI).\n` +
        `• **Project Management & Methodology (15%):** Quality of delivery schedule, risk mitigation plans, and resource commitments.\n` +
        `• **References & Culture Fit (10%):** Verified client feedback and alignment with ${organization}'s operational workflow.\n`,

      "Terms & Conditions":
        `### 8. Legal, SLA & Contractual Terms\n` +
        `• **Confidentiality:** All proposal contents, pricing models, and client proprietary data are governed by mutual Non-Disclosure obligations.\n` +
        `• **Intellectual Property (IP):** All deliverables, custom code, documentation, and work products developed under the engagement shall belong exclusively to ${organization}.\n` +
        `• **Service Level Agreement (SLA):** Critical (Priority 1) incidents require response within 30 minutes and resolution plan within 2 hours.\n`,

      "Submission Guidelines":
        `### 9. Submission Guidelines & Contacts\n` +
        `• **Proposal Due Date:** ${deadline}\n` +
        `• **Submission Format:** Electronic PDF package accompanied by commercial spreadsheet.\n` +
        `• **Inquiries:** All formal questions regarding this RFP must be directed in writing to the Procurement Office at ${organization}.\n` +
        `• **Right of Rejection:** ${organization} reserves the right to accept or reject any proposal, waive informalities, and negotiate terms with any prospective vendor.\n`,

      "Appendices":
        `### 10. Appendices & Supplementary Materials\n` +
        `Vendors must complete and append the following schedules:\n\n` +
        `1. Appendix A: Company Profile, Financial Stability Statement & Executive Bios\n` +
        `2. Appendix B: Three (3) Verifiable Enterprise Client References\n` +
        `3. Appendix C: Detailed Pricing Matrix & Cost Breakdown Schedule\n` +
        `4. Appendix D: Signed Non-Collusion & Ethics Compliance Declaration\n`,
    };

    const renderedSections = selectedSections
      .filter((sec) => sectionBodies[sec])
      .map((sec) => `## ${sec}\n\n${sectionBodies[sec]}\n---\n`)
      .join("\n");

    const fullDocument =
      `# REQUEST FOR PROPOSAL (RFP)\n\n` +
      `**Project Title:** ${projectName}\n` +
      `**Issuing Organization:** ${organization}\n` +
      `**Industry Domain:** ${industry}\n` +
      `**Publication Date:** ${today}\n` +
      `**Submission Deadline:** ${deadline}\n` +
      `**Procurement Reference:** RFP-${Date.now().toString(36).toUpperCase()}\n\n` +
      `---\n\n` +
      renderedSections +
      `\n*Document issued by ${organization}. Prepared with RFP Monkey enterprise procurement suite.*`;

    setGeneratedRFP(fullDocument);
    toast.success("Enterprise RFP draft compiled successfully!");
  };

  const handleCopy = async () => {
    if (!generatedRFP) return;
    await navigator.clipboard.writeText(generatedRFP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied RFP markdown to clipboard!");
  };

  const handleDownload = () => {
    if (!generatedRFP) return;
    const blob = new Blob([generatedRFP], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RFP-${projectName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded RFP document (.md)!");
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header Card */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold mb-1 block">Project Title</Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="h-9"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1 block">Issuing Organization</Label>
            <Input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="h-9"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1 block">Industry Domain</Label>
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="h-9"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1 block">Budget Target / Ceiling</Label>
            <Input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="h-9"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1 block">Submission Deadline</Label>
            <Input
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="sm:col-span-3">
            <Label className="text-xs font-semibold mb-1 block">
              Core Objective & Problem Context
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-18 text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Section Checklist */}
        <div className="pt-2 border-t">
          <Label className="text-xs font-semibold mb-2 block text-muted-foreground uppercase tracking-wider">
            RFP Document Sections Included ({selectedSections.length}/{RFP_SECTIONS.length})
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {RFP_SECTIONS.map((sec) => {
              const active = selectedSections.includes(sec.id);
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  className={`p-2 rounded-lg border text-left text-xs font-medium transition-all ${
                    active
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <ListChecks className="h-3.5 w-3.5 inline mr-1.5" />
                  {sec.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button onClick={handleGenerate} className="w-full gap-2 font-medium">
          <Wand2 className="h-4 w-4" /> Generate Complete Enterprise RFP Document
        </Button>
      </div>

      {/* Generated Document Display */}
      {generatedRFP && (
        <Card className="shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Compiled Request for Proposal</span>
              <Badge variant="outline" className="text-xs ml-2">
                Markdown Ready
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 h-8 text-xs">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Document"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5 h-8 text-xs">
                <Download className="h-3.5 w-3.5" /> Download .md
              </Button>
            </div>
          </div>
          <CardContent className="p-5">
            <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed bg-muted/30 p-4 rounded-xl max-h-120 overflow-y-auto border">
              {generatedRFP}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}