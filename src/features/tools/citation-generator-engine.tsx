"use client";

import { useState, useCallback } from "react";
import { Copy, Check, BookOpen, Plus, Trash2, Download, Globe, BookMarked, GraduationCap, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  formatBibliography, formatInTextCitation, parseAuthorsString,
  type CitationItem, type CitationStyle, type SourceType,
} from "@/features/tools/citation-generator";

const STYLES: { value: CitationStyle; label: string }[] = [
  { value: "apa",     label: "APA 7th" },
  { value: "mla",     label: "MLA 9th" },
  { value: "chicago", label: "Chicago 17th" },
  { value: "harvard", label: "Harvard" },
  { value: "ieee",    label: "IEEE" },
  { value: "bibtex",  label: "BibTeX" },
];

const SOURCE_TYPES: { value: SourceType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "book",       label: "Book",           icon: BookOpen },
  { value: "journal",    label: "Journal Article", icon: BookMarked },
  { value: "website",    label: "Website",         icon: Globe },
  { value: "conference", label: "Conference Paper",icon: GraduationCap },
  { value: "chapter",    label: "Book Chapter",    icon: BookOpen },
  { value: "newspaper",  label: "Newspaper",       icon: Newspaper },
];

function newItem(sourceType: SourceType = "book"): CitationItem {
  return {
    id: `cit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sourceType,
    authors: [{ firstName: "", lastName: "" }],
    title: "",
  };
}

export function CitationGeneratorEngine() {
  const [style, setStyle] = useState<CitationStyle>("apa");
  const [item, setItem] = useState<CitationItem>(newItem("journal"));
  const [bibliography, setBibliography] = useState("");
  const [inTextParen, setInTextParen] = useState("");
  const [inTextNarr, setInTextNarr] = useState("");
  const [saved, setSaved] = useState<CitationItem[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const update = useCallback((field: keyof CitationItem, value: unknown) => {
    setItem(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateAuthorRaw = useCallback((raw: string) => {
    setItem(prev => ({ ...prev, authors: parseAuthorsString(raw) }));
  }, []);

  const authorsRaw = item.authors.map(a => a.firstName ? `${a.firstName} ${a.lastName}` : a.lastName).join(" and ");

  const generate = useCallback(() => {
    if (!item.title.trim()) { toast.error("Title is required."); return; }
    const bib = formatBibliography(item, style);
    const paren = formatInTextCitation(item, style, "parenthetical");
    const narr = formatInTextCitation(item, style, "narrative");
    setBibliography(bib);
    setInTextParen(paren);
    setInTextNarr(narr);
    toast.success("Citation generated!");
  }, [item, style]);

  const saveToList = useCallback(() => {
    if (!bibliography) { generate(); return; }
    setSaved(prev => [...prev, { ...item }]);
    toast.success("Citation saved to list!");
  }, [bibliography, item, generate]);

  const copyText = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const downloadBibTeX = useCallback(() => {
    if (saved.length === 0) { toast.error("Save at least one citation first."); return; }
    const { formatBibliography: fb } = require("@/features/tools/citation-generator");
    const content = saved.map(s => fb(s, "bibtex")).join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "references.bib"; a.click();
    URL.revokeObjectURL(url);
    toast.success("BibTeX file downloaded!");
  }, [saved]);

  const downloadText = useCallback(() => {
    if (saved.length === 0) { toast.error("Save at least one citation first."); return; }
    const { formatBibliography: fb } = require("@/features/tools/citation-generator");
    const content = `${STYLES.find(s => s.value === style)?.label} References\n\n` +
      saved.map((s, i) => `${i + 1}. ${fb(s, style)}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `references-${style}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success("References downloaded!");
  }, [saved, style]);

  return (
    <div className="space-y-4">
      {/* Style selector */}
      <div className="flex flex-wrap gap-2 items-center">
        <Label className="text-xs text-muted-foreground">Citation Style:</Label>
        {STYLES.map(s => (
          <Button
            key={s.value}
            variant={style === s.value ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setStyle(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <Tabs
        value={item.sourceType}
        onValueChange={(v) => setItem({ ...newItem(v as SourceType), authors: item.authors })}
      >
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          {SOURCE_TYPES.map(st => (
            <TabsTrigger key={st.value} value={st.value} className="text-xs h-8 gap-1.5">
              <st.icon className="h-3 w-3" />{st.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SOURCE_TYPES.map(st => (
          <TabsContent key={st.value} value={st.value} className="mt-4 space-y-3">
            {/* Authors */}
            <div>
              <Label className="text-xs mb-1 block">Author(s)</Label>
              <Input
                value={authorsRaw}
                onChange={e => updateAuthorRaw(e.target.value)}
                placeholder='e.g. John Smith and Jane Doe  OR  Smith, J., Doe, J.'
                className="h-8 text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Separate multiple authors with "and"</p>
            </div>

            {/* Title */}
            <div>
              <Label className="text-xs mb-1 block">Title *</Label>
              <Input
                value={item.title}
                onChange={e => update("title", e.target.value)}
                placeholder={st.value === "website" ? "Page or article title" : "Full title of the work"}
                className="h-8 text-sm"
              />
            </div>

            {/* Conditional fields by source type */}
            <div className="grid grid-cols-2 gap-2">
              {(st.value === "journal" || st.value === "newspaper") && (
                <>
                  <div className="col-span-2">
                    <Label className="text-xs mb-1 block">{st.value === "journal" ? "Journal Name" : "Newspaper Name"}</Label>
                    <Input value={item.containerTitle || ""} onChange={e => update("containerTitle", e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Volume</Label>
                    <Input value={item.volume || ""} onChange={e => update("volume", e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Issue / Number</Label>
                    <Input value={item.issue || ""} onChange={e => update("issue", e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Pages</Label>
                    <Input value={item.pages || ""} onChange={e => update("pages", e.target.value)} placeholder="e.g. 45-67" className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">DOI</Label>
                    <Input value={item.doi || ""} onChange={e => update("doi", e.target.value)} placeholder="10.xxxx/xxxxx" className="h-8 text-sm" />
                  </div>
                </>
              )}
              {(st.value === "book" || st.value === "chapter") && (
                <>
                  {st.value === "chapter" && (
                    <div className="col-span-2">
                      <Label className="text-xs mb-1 block">Book Title</Label>
                      <Input value={item.containerTitle || ""} onChange={e => update("containerTitle", e.target.value)} className="h-8 text-sm" />
                    </div>
                  )}
                  <div>
                    <Label className="text-xs mb-1 block">Publisher</Label>
                    <Input value={item.publisher || ""} onChange={e => update("publisher", e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Edition</Label>
                    <Input value={item.edition || ""} onChange={e => update("edition", e.target.value)} placeholder="e.g. 3rd" className="h-8 text-sm" />
                  </div>
                  {st.value === "chapter" && (
                    <div>
                      <Label className="text-xs mb-1 block">Pages</Label>
                      <Input value={item.pages || ""} onChange={e => update("pages", e.target.value)} placeholder="e.g. 45-67" className="h-8 text-sm" />
                    </div>
                  )}
                </>
              )}
              {st.value === "website" && (
                <>
                  <div className="col-span-2">
                    <Label className="text-xs mb-1 block">Website Name</Label>
                    <Input value={item.containerTitle || ""} onChange={e => update("containerTitle", e.target.value)} placeholder="e.g. Wikipedia" className="h-8 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs mb-1 block">URL</Label>
                    <Input value={item.url || ""} onChange={e => update("url", e.target.value)} placeholder="https://" className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Date Accessed</Label>
                    <Input value={item.accessedDate || ""} onChange={e => update("accessedDate", e.target.value)} placeholder="e.g. 15 January 2024" className="h-8 text-sm" />
                  </div>
                </>
              )}
              {st.value === "conference" && (
                <>
                  <div className="col-span-2">
                    <Label className="text-xs mb-1 block">Conference Name</Label>
                    <Input value={item.containerTitle || ""} onChange={e => update("containerTitle", e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Pages</Label>
                    <Input value={item.pages || ""} onChange={e => update("pages", e.target.value)} placeholder="e.g. 23-31" className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Publisher / Location</Label>
                    <Input value={item.publisher || ""} onChange={e => update("publisher", e.target.value)} className="h-8 text-sm" />
                  </div>
                </>
              )}
              {/* Year — all types */}
              <div>
                <Label className="text-xs mb-1 block">Year</Label>
                <Input value={item.year || ""} onChange={e => update("year", e.target.value)} placeholder="2024" className="h-8 text-sm" />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={generate} className="gap-1.5">
          <BookOpen className="h-4 w-4" /> Generate Citation
        </Button>
        <Button variant="outline" onClick={saveToList} className="gap-1.5">
          <Plus className="h-4 w-4" /> Save to List
        </Button>
      </div>

      {/* Citation output */}
      {bibliography && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-semibold">Bibliography Entry ({STYLES.find(s => s.value === style)?.label})</Label>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyText(bibliography, "bib")}>
                  {copied === "bib" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="bg-muted rounded p-3 font-mono text-xs whitespace-pre-wrap">{bibliography}</div>
            </div>

            {style !== "bibtex" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[10px] text-muted-foreground">Parenthetical In-Text</Label>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyText(inTextParen, "paren")}>
                      {copied === "paren" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">{inTextParen}</code>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[10px] text-muted-foreground">Narrative In-Text</Label>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyText(inTextNarr, "narr")}>
                      {copied === "narr" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">{inTextNarr}</code>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Saved bibliography list */}
      {saved.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Bibliography ({saved.length} sources)</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={downloadText}>
                  <Download className="h-3 w-3" /> TXT
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={downloadBibTeX}>
                  <Download className="h-3 w-3" /> BibTeX
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {saved.map((s, i) => (
              <div key={s.id} className="flex gap-2 items-start text-xs group">
                <span className="text-muted-foreground shrink-0 w-4">{i + 1}.</span>
                <span className="flex-1 font-mono text-[11px] leading-relaxed">{formatBibliography(s, style)}</span>
                <Button
                  variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={() => setSaved(prev => prev.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}