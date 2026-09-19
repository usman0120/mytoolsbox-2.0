"use client";

import { useState } from "react";
import { FileText, Download, Copy, Check, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ProposalSection,
  PROPOSAL_TEMPLATES,
  generateProposalId,
  formatProposalDate,
} from "@/features/tools/proposal-generator";

export function ProposalGeneratorEngine() {
  const [template, setTemplate] = useState("General");
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sections, setSections] = useState<ProposalSection[]>(PROPOSAL_TEMPLATES["General"]);
  const [copied, setCopied] = useState(false);

  const handleTemplateChange = (v: string) => {
    const t = v || "General";
    setTemplate(t);
    setSections(PROPOSAL_TEMPLATES[t].map(s => ({ ...s, content: "" })));
  };

  const updateSection = (id: string, content: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, content } : s));
  };

  const generateFullProposal = (): string => {
    const date = formatProposalDate();
    const lines = [
      `# ${title || "Business Proposal"}`,
      `**Proposal #:** ${generateProposalId()}`,
      `**Date:** ${date}`,
      `**Prepared for:** ${clientName}${clientCompany ? `, ${clientCompany}` : ""}`,
      `**Prepared by:** ${preparedBy}${companyName ? `, ${companyName}` : ""}`,
      "",
    ];
    for (const section of sections) {
      lines.push(`## ${section.title}`);
      lines.push(section.content || "*[Content to be filled]*");
      lines.push("");
    }
    return lines.join("\n");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateFullProposal());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateFullProposal()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proposal-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Proposal Generator</h2>
          <p className="text-sm text-muted-foreground">Create professional business proposals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />} Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-3 w-3 mr-1" /> Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Template</Label>
          <Select value={template} onValueChange={handleTemplateChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(PROPOSAL_TEMPLATES).map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Proposal Title</Label>
          <Input placeholder="Business Proposal" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Client Name</Label>
          <Input placeholder="John Doe" value={clientName} onChange={e => setClientName(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Client Company</Label>
          <Input placeholder="Acme Corp" value={clientCompany} onChange={e => setClientCompany(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Prepared By</Label>
          <Input placeholder="Your name" value={preparedBy} onChange={e => setPreparedBy(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Your Company</Label>
          <Input placeholder="Your company" value={companyName} onChange={e => setCompanyName(e.target.value)} />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        {sections.map(section => (
          <Card key={section.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`Write your ${section.title.toLowerCase()}...`}
                rows={3}
                value={section.content}
                onChange={e => updateSection(section.id, e.target.value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}