"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, BookOpen, Globe, User, Calendar } from "lucide-react";

type CitationStyle = "apa" | "mla" | "chicago";

interface CitationFields {
  author: string;
  title: string;
  year: string;
  publisher: string;
  url: string;
  journal: string;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  accessedDate: string;
}

function formatAPA(fields: CitationFields): string {
  const { author, title, year, publisher, journal, volume, issue, pages, doi, url } = fields;
  const authorFormatted = author ? `${author} ` : "";
  const yearFormatted = year ? `(${year}). ` : "(n.d.). ";
  const titleFormatted = title ? `${title}. ` : "";

  if (journal) {
    const journalFormatted = `${journal}, `;
    const volumeFormatted = volume ? `${volume}` : "";
    const issueFormatted = issue ? `(${issue})` : "";
    const pagesFormatted = pages ? `, ${pages}` : "";
    const doiFormatted = doi ? ` https://doi.org/${doi}` : url ? ` ${url}` : "";
    return `${authorFormatted}${yearFormatted}${titleFormatted}${journalFormatted}${volumeFormatted}${issueFormatted}${pagesFormatted}.${doiFormatted}`;
  }

  const publisherFormatted = publisher ? `${publisher}. ` : "";
  const urlFormatted = url ? url : doi ? `https://doi.org/${doi}` : "";
  return `${authorFormatted}${yearFormatted}${titleFormatted}${publisherFormatted}${urlFormatted}`;
}

function formatMLA(fields: CitationFields): string {
  const { author, title, year, publisher, journal, volume, issue, pages, doi, url, accessedDate } = fields;
  const authorFormatted = author ? `${author}. ` : "";
  const titleFormatted = title ? `"${title}." ` : "";

  if (journal) {
    const journalFormatted = `${journal}, `;
    const volumeFormatted = volume ? `vol. ${volume}` : "";
    const issueFormatted = issue ? `, no. ${issue}` : "";
    const yearFormatted = year ? `, ${year}` : "";
    const pagesFormatted = pages ? `, pp. ${pages}` : "";
    return `${authorFormatted}${titleFormatted}${journalFormatted}${volumeFormatted}${issueFormatted}${yearFormatted}${pagesFormatted}.`;
  }

  const publisherFormatted = publisher ? `${publisher}, ` : "";
  const yearFormatted = year ? `${year}. ` : "n.d. ";
  const urlFormatted = url ? url : doi ? `https://doi.org/${doi}` : "";
  const accessedFormatted = accessedDate ? ` Accessed ${accessedDate}.` : "";
  return `${authorFormatted}${titleFormatted}${publisherFormatted}${yearFormatted}${urlFormatted}${accessedFormatted}`;
}

function formatChicago(fields: CitationFields): string {
  const { author, title, year, publisher, journal, volume, issue, pages, doi, url } = fields;
  const authorFormatted = author ? `${author}. ` : "";
  const titleFormatted = title ? `"${title}." ` : "";

  if (journal) {
    const journalFormatted = `${journal} `;
    const volumeFormatted = volume ? `${volume}` : "";
    const issueFormatted = issue ? `, no. ${issue}` : "";
    const yearFormatted = year ? ` (${year})` : "";
    const pagesFormatted = pages ? `: ${pages}` : "";
    const doiFormatted = doi ? `. https://doi.org/${doi}` : url ? `. ${url}` : "";
    return `${authorFormatted}${titleFormatted}${journalFormatted}${volumeFormatted}${issueFormatted}${yearFormatted}${pagesFormatted}${doiFormatted}.`;
  }

  const publisherFormatted = publisher ? `${publisher}, ` : "";
  const yearFormatted = year ? `${year}` : "n.d.";
  const urlFormatted = url ? `. ${url}` : doi ? `. https://doi.org/${doi}` : "";
  return `${authorFormatted}${titleFormatted}${publisherFormatted}${yearFormatted}${urlFormatted}.`;
}

function formatCitation(fields: CitationFields, style: CitationStyle): string {
  switch (style) {
    case "apa": return formatAPA(fields);
    case "mla": return formatMLA(fields);
    case "chicago": return formatChicago(fields);
  }
}

const EMPTY_FIELDS: CitationFields = {
  author: "", title: "", year: "", publisher: "", url: "",
  journal: "", volume: "", issue: "", pages: "", doi: "", accessedDate: "",
};

function FieldRow({ field, label, icon: Icon, placeholder, fields, updateField }: {
  field: keyof CitationFields;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  fields: CitationFields;
  updateField: (field: keyof CitationFields, value: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs mb-1 flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </Label>
      <Input
        value={fields[field]}
        onChange={e => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </div>
  );
}

export function CitationGeneratorEngine() {
  const [style, setStyle] = useState<CitationStyle>("apa");
  const [fields, setFields] = useState<CitationFields>(EMPTY_FIELDS);
  const [citation, setCitation] = useState("");
  const [copied, setCopied] = useState(false);

  const updateField = (field: keyof CitationFields, value: string) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  const generateCitation = () => {
    if (!fields.title) return;
    setCitation(formatCitation(fields, style));
  };

  const copyCitation = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clearFields = () => {
    setFields(EMPTY_FIELDS);
    setCitation("");
  };

  return (
    <div className="space-y-4">
      {/* Style selector */}
      <div className="flex items-center gap-3">
        <Label className="text-xs">Style:</Label>
        <Tabs value={style} onValueChange={v => setStyle(v as CitationStyle)}>
          <TabsList>
            <TabsTrigger value="apa">APA 7</TabsTrigger>
            <TabsTrigger value="mla">MLA 9</TabsTrigger>
            <TabsTrigger value="chicago">Chicago</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-3">
        <FieldRow field="author" label="Author(s)" icon={User} placeholder="e.g. Smith, J." fields={fields} updateField={updateField} />
        <FieldRow field="year" label="Year" icon={Calendar} placeholder="e.g. 2024" fields={fields} updateField={updateField} />
        <FieldRow field="title" label="Title" icon={BookOpen} placeholder="Article or book title" fields={fields} updateField={updateField} />
        <FieldRow field="journal" label="Journal" placeholder="Journal name" fields={fields} updateField={updateField} />
        <FieldRow field="volume" label="Volume" placeholder="e.g. 15" fields={fields} updateField={updateField} />
        <FieldRow field="issue" label="Issue" placeholder="e.g. 3" fields={fields} updateField={updateField} />
        <FieldRow field="pages" label="Pages" placeholder="e.g. 45-67" fields={fields} updateField={updateField} />
        <FieldRow field="publisher" label="Publisher" placeholder="Publisher name" fields={fields} updateField={updateField} />
        <FieldRow field="doi" label="DOI" placeholder="e.g. 10.1000/xyz" fields={fields} updateField={updateField} />
        <FieldRow field="url" label="URL" icon={Globe} placeholder="https://..." fields={fields} updateField={updateField} />
        <FieldRow field="accessedDate" label="Accessed" icon={Calendar} placeholder="e.g. Jan 15, 2024" fields={fields} updateField={updateField} />
      </div>

      <div className="flex gap-2">
        <Button onClick={generateCitation} className="gap-2">
          <BookOpen className="h-4 w-4" /> Generate Citation
        </Button>
        <Button onClick={clearFields} variant="outline">
          Clear
        </Button>
      </div>

      {citation && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Generated Citation</CardTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyCitation}>
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed" style={{ wordBreak: "break-word" }}>
              {citation}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}