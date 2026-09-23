"use client";

import { useState } from "react";
import { ScrollText, Download, Copy, Check, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ContractClause,
  CONTRACT_TEMPLATES,
  generateContractDocument,
} from "@/features/tools/contract-generator";

export function ContractGeneratorEngine() {
  const [template, setTemplate] = useState("Service Agreement");
  const [partyA, setPartyA] = useState("");
  const [partyB, setPartyB] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [clauses, setClauses] = useState<ContractClause[]>(CONTRACT_TEMPLATES["Service Agreement"].clauses);
  const [enabledClauses, setEnabledClauses] = useState<Set<string>>(
    new Set(CONTRACT_TEMPLATES["Service Agreement"].clauses.filter((c) => !c.optional).map((c) => c.id))
  );
  const [viewTab, setViewTab] = useState<"edit" | "preview">("edit");
  const [copied, setCopied] = useState(false);

  const handleTemplateChange = (v: string | null) => {
    const t = v || "Service Agreement";
    setTemplate(t);
    const newClauses = CONTRACT_TEMPLATES[t].clauses;
    setClauses(newClauses);
    setEnabledClauses(new Set(newClauses.filter((c) => !c.optional).map((c) => c.id)));
  };

  const toggleClause = (id: string) => {
    const next = new Set(enabledClauses);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setEnabledClauses(next);
  };

  const updateClause = (id: string, content: string) => {
    setClauses(clauses.map((c) => (c.id === id ? { ...c, content } : c)));
  };

  const getFullContractText = (): string => {
    const activeClauses = clauses.filter((c) => enabledClauses.has(c.id));
    return generateContractDocument(
      CONTRACT_TEMPLATES[template].title,
      partyA,
      partyB,
      effectiveDate,
      activeClauses
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getFullContractText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Contract copied to clipboard!");
  };

  const handleDownload = () => {
    const text = getFullContractText();
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Contract downloaded as Markdown!");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" /> Contract Generator
          </h2>
          <p className="text-sm text-muted-foreground">Draft legally sound business contracts with customizable clauses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />} Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Contract Template</Label>
          <Select value={template} onValueChange={handleTemplateChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(CONTRACT_TEMPLATES).map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Effective Date</Label>
          <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Party A (Disclosing / Provider / Client)</Label>
          <Input placeholder="Company / Individual Name" value={partyA} onChange={(e) => setPartyA(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Party B (Receiving / Recipient / Contractor)</Label>
          <Input placeholder="Partner / Client Name" value={partyB} onChange={(e) => setPartyB(e.target.value)} />
        </div>
      </div>

      <Separator />

      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as "edit" | "preview")}>
        <TabsList>
          <TabsTrigger value="edit" className="gap-1.5 text-xs">
            <Edit3 className="h-3.5 w-3.5" /> Edit Clauses ({enabledClauses.size}/{clauses.length})
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5 text-xs">
            <Eye className="h-3.5 w-3.5" /> Document Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-3 mt-4">
          {clauses.map((clause) => (
            <Card key={clause.id} className={!enabledClauses.has(clause.id) ? "opacity-50" : ""}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  {clause.title}
                  {clause.optional && <span className="text-xs font-normal text-muted-foreground">(optional)</span>}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`switch-${clause.id}`} className="text-xs text-muted-foreground cursor-pointer">
                    {enabledClauses.has(clause.id) ? "Included" : "Excluded"}
                  </Label>
                  <Switch
                    id={`switch-${clause.id}`}
                    checked={enabledClauses.has(clause.id)}
                    onCheckedChange={() => toggleClause(clause.id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={3}
                  value={clause.content}
                  onChange={(e) => updateClause(clause.id, e.target.value)}
                  disabled={!enabledClauses.has(clause.id)}
                  className="font-mono text-xs"
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed bg-muted/30 p-6 rounded-lg border border-border">
                {getFullContractText()}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}