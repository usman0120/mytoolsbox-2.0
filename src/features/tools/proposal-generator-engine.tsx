"use client";

import { useState } from "react";
import { FileText, Download, Copy, Check, Printer, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ProposalSection,
  ProposalData,
  PROPOSAL_TEMPLATES,
  generateProposalId,
  formatProposalDate,
  fillProposalVariables,
  exportProposalDocument,
} from "@/features/tools/proposal-generator";

export function ProposalGeneratorEngine() {
  const [template, setTemplate] = useState("Web Development");
  const [title, setTitle] = useState("Platform Re-Architecture Proposal");
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [budget, setBudget] = useState("$24,000");
  const [timeline, setTimeline] = useState("8 weeks");
  const [sections, setSections] = useState<ProposalSection[]>(PROPOSAL_TEMPLATES["Web Development"]);
  const [viewTab, setViewTab] = useState<"edit" | "preview">("edit");
  const [copied, setCopied] = useState(false);

  const handleTemplateChange = (v: string | null) => {
    const t = v || "General";
    setTemplate(t);
    setSections(PROPOSAL_TEMPLATES[t]);
  };

  const updateSection = (id: string, content: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, content } : s)));
  };

  const getProposalData = (): ProposalData => ({
    title: title || "Business Proposal",
    clientName: clientName || "Valued Client",
    clientCompany: clientCompany || "Client Organization",
    date: formatProposalDate(),
    preparedBy: preparedBy || "Project Lead",
    companyName: companyName || "Our Agency",
    budget,
    timeline,
    sections,
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportProposalDocument(getProposalData()));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Proposal copied to clipboard!");
  };

  const handleDownload = () => {
    const md = exportProposalDocument(getProposalData());
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proposal-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Proposal downloaded as Markdown!");
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Proposal Generator
          </h2>
          <p className="text-sm text-muted-foreground">Draft winning client project proposals with variable templating</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />} Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Markdown
          </Button>
          <Button variant="default" size="sm" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print / PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Proposal Template</Label>
          <Select value={template} onValueChange={handleTemplateChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(PROPOSAL_TEMPLATES).map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Proposal Title</Label>
          <Input placeholder="Project Proposal Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Estimated Budget / Fee</Label>
          <Input placeholder="e.g. $15,000" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Estimated Timeline</Label>
          <Input placeholder="e.g. 6 weeks" value={timeline} onChange={(e) => setTimeline(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Client Contact Name</Label>
          <Input placeholder="Jane Doe" value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Client Organization</Label>
          <Input placeholder="Client Company Inc." value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Prepared By (Lead)</Label>
          <Input placeholder="Your Name" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs mb-1 block">Your Company / Agency Name</Label>
          <Input placeholder="Agency LLC" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
      </div>

      <Separator />

      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as "edit" | "preview")}>
        <TabsList>
          <TabsTrigger value="edit" className="gap-1.5 text-xs">
            <Edit3 className="h-3.5 w-3.5" /> Edit Proposal Sections ({sections.length})
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5 text-xs">
            <Eye className="h-3.5 w-3.5" /> Document Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4 mt-4">
          <p className="text-xs text-muted-foreground">
            Use variables like <code>&#123;clientCompany&#125;</code>, <code>&#123;budget&#125;</code>, and <code>&#123;timeline&#125;</code> for automatic substitution.
          </p>
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  value={section.content}
                  onChange={(e) => updateSection(section.id, e.target.value)}
                  placeholder={`Write the ${section.title.toLowerCase()}...`}
                  className="text-xs leading-relaxed"
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card className="max-w-3xl mx-auto p-6 bg-white dark:bg-card text-foreground shadow-sm border print:border-none print:shadow-none">
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h1 className="text-2xl font-bold uppercase tracking-tight text-primary">{title || "Business Proposal"}</h1>
                <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-muted-foreground">
                  <div>
                    <p><strong>Prepared For:</strong> {clientName || "[Client]"} ({clientCompany || "[Company]"})</p>
                    <p><strong>Prepared By:</strong> {preparedBy || "[Lead]"} ({companyName || "[Agency]"})</p>
                  </div>
                  <div className="text-right">
                    <p><strong>Date:</strong> {formatProposalDate()}</p>
                    <p><strong>Est. Investment:</strong> {budget}</p>
                    <p><strong>Timeline:</strong> {timeline}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {sections.map((sec, i) => (
                  <div key={sec.id} className="space-y-1">
                    <h2 className="text-sm font-semibold text-foreground border-b pb-1">
                      {i + 1}. {sec.title}
                    </h2>
                    <p className="whitespace-pre-line text-muted-foreground leading-relaxed pt-1">
                      {fillProposalVariables(sec.content, getProposalData()) || "*[Details pending]*"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}