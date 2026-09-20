"use client";

import { useState } from "react";
import { ScrollText, Download, Copy, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  ContractClause,
  CONTRACT_TEMPLATES,
  generateContractId,
  fillTemplate,
} from "@/features/tools/contract-generator";

export function ContractGeneratorEngine() {
  const [template, setTemplate] = useState("Service Agreement");
  const [partyA, setPartyA] = useState("");
  const [partyB, setPartyB] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [clauses, setClauses] = useState<ContractClause[]>(CONTRACT_TEMPLATES["Service Agreement"].clauses);
  const [enabledClauses, setEnabledClauses] = useState<Set<string>>(
    new Set(CONTRACT_TEMPLATES["Service Agreement"].clauses.filter(c => !c.optional).map(c => c.id))
  );
  const [copied, setCopied] = useState(false);

  const handleTemplateChange = (v: string | null) => {
    const t = v || "Service Agreement";
    setTemplate(t);
    const newClauses = CONTRACT_TEMPLATES[t].clauses;
    setClauses(newClauses);
    setEnabledClauses(new Set(newClauses.filter(c => !c.optional).map(c => c.id)));
  };

  const toggleClause = (id: string) => {
    const next = new Set(enabledClauses);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setEnabledClauses(next);
  };

  const updateClause = (id: string, content: string) => {
    setClauses(clauses.map(c => c.id === id ? { ...c, content } : c));
  };

  const generateFullContract = (): string => {
    const data = { "Party A": partyA || "[Party A]", "Party B": partyB || "[Party B]", "Effective Date": effectiveDate };
    const lines = [
      `# ${CONTRACT_TEMPLATES[template].title}`,
      `**Contract #:** ${generateContractId()}`,
      `**Date:** ${new Date().toLocaleDateString()}`,
      `**Effective Date:** ${effectiveDate}`,
      `**Between:** ${partyA || "[Party A]"} and ${partyB || "[Party B]"}`,
      "",
    ];
    for (const clause of clauses) {
      if (!enabledClauses.has(clause.id)) continue;
      lines.push(`## ${clause.title}`);
      lines.push(fillTemplate(clause.content || clause.content, data));
      lines.push("");
    }
    return lines.join("\n");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateFullContract());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateFullContract()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contract-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Contract Generator</h2>
          <p className="text-sm text-muted-foreground">Create legal document templates</p>
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
              {Object.keys(CONTRACT_TEMPLATES).map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Effective Date</Label>
          <Input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Party A (Provider)</Label>
          <Input placeholder="Company name" value={partyA} onChange={e => setPartyA(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Party B (Client)</Label>
          <Input placeholder="Client name" value={partyB} onChange={e => setPartyB(e.target.value)} />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        {clauses.map(clause => (
          <Card key={clause.id} className={!enabledClauses.has(clause.id) ? "opacity-50" : ""}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                {clause.title}
                {clause.optional && <span className="text-xs text-muted-foreground">(optional)</span>}
              </CardTitle>
              {clause.optional && (
                <Switch checked={enabledClauses.has(clause.id)} onCheckedChange={() => toggleClause(clause.id)} />
              )}
            </CardHeader>
            <CardContent>
              <Textarea
                rows={2}
                value={clause.content}
                onChange={e => updateClause(clause.id, e.target.value)}
                disabled={!enabledClauses.has(clause.id)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}