"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles, Copy, Check, Download, FileText, BookOpen,
  ListChecks, Lightbulb, RotateCcw, Brain, PenLine,
} from "lucide-react";

interface GeneratedNote {
  id: string;
  title: string;
  topic: string;
  format: string;
  content: string;
  keyPoints: string[];
  summary: string;
  createdAt: string;
}

const NOTE_FORMATS = [
  { value: "bullet", label: "Bullet Points", icon: ListChecks },
  { value: "outline", label: "Outline", icon: BookOpen },
  { value: "summary", label: "Summary", icon: FileText },
  { value: "detailed", label: "Detailed Notes", icon: PenLine },
];

const SAMPLE_TOPICS = [
  "Photosynthesis Process",
  "French Revolution Causes",
  "Newton's Laws of Motion",
  "Machine Learning Basics",
  "World War II Timeline",
  "Cell Division: Mitosis & Meiosis",
  "Shakespeare's Hamlet Analysis",
  "Database Normalization",
];

function generateId(): string {
  return `note_${Math.random().toString(36).slice(2, 10)}`;
}

function generateNotes(topic: string, format: string): { content: string; keyPoints: string[]; summary: string } {
  const sections = [
    `## Introduction to ${topic}`,
    `${topic} is a fundamental concept that plays a crucial role in its respective field. Understanding this topic provides a strong foundation for further study and practical application.`,
    "",
    `## Key Concepts`,
    `1. **Definition**: ${topic} refers to the systematic study and understanding of core principles.`,
    `2. **Historical Context**: The development of ${topic} has evolved significantly over time.`,
    `3. **Applications**: ${topic} is applied in various real-world scenarios including research, industry, and education.`,
    "",
    `## Detailed Analysis`,
    `The study of ${topic} involves multiple interconnected components:`,
    `- **Theoretical Framework**: The underlying principles that govern ${topic}`,
    `- **Practical Implementation**: How ${topic} is applied in real-world settings`,
    `- **Current Research**: Recent developments and future directions in ${topic}`,
    "",
    `## Examples and Case Studies`,
    `1. **Case Study 1**: Application of ${topic} in industry settings`,
    `2. **Case Study 2**: Research breakthrough related to ${topic}`,
    `3. **Case Study 3**: Educational approach to teaching ${topic}`,
    "",
    `## Conclusion`,
    `${topic} remains an essential area of study with broad implications. Continued research and application will further enhance our understanding and capabilities.`,
  ];

  const keyPoints = [
    `${topic} is foundational to its field`,
    `Multiple theoretical frameworks exist`,
    `Practical applications are widespread`,
    `Ongoing research continues to expand knowledge`,
    `Interdisciplinary connections enhance understanding`,
  ];

  const summary = `${topic} is a comprehensive field encompassing theoretical foundations, practical applications, and ongoing research. This overview covers key concepts, historical context, and real-world examples to provide a thorough understanding of the subject matter.`;

  if (format === "bullet") {
    return {
      content: sections.join("\n"),
      keyPoints,
      summary,
    };
  } else if (format === "outline") {
    return {
      content: [
        `# ${topic} - Outline`,
        "",
        "I. Introduction",
        "   A. Definition and scope",
        "   B. Historical background",
        "",
        "II. Key Concepts",
        "   A. Theoretical framework",
        "   B. Core principles",
        "   C. Related concepts",
        "",
        "III. Applications",
        "   A. Industry applications",
        "   B. Research applications",
        "   C. Educational applications",
        "",
        "IV. Case Studies",
        "   A. Case Study 1",
        "   B. Case Study 2",
        "",
        "V. Future Directions",
        "   A. Emerging trends",
        "   B. Research opportunities",
        "",
        "VI. Summary",
      ].join("\n"),
      keyPoints,
      summary,
    };
  } else if (format === "summary") {
    return {
      content: [
        `# ${topic}`,
        "",
        summary,
        "",
        "## Key Takeaways",
        ...keyPoints.map(kp => `- ${kp}`),
      ].join("\n"),
      keyPoints,
      summary,
    };
  }

  // detailed
  return {
    content: sections.join("\n"),
    keyPoints,
    summary,
  };
}

export function AINotesGeneratorEngine() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("bullet");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<GeneratedNote | null>(null);
  const [history, setHistory] = useState<GeneratedNote[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const { content, keyPoints, summary } = generateNotes(topic, format);
    const note: GeneratedNote = {
      id: generateId(),
      title: `${topic} - ${format.charAt(0).toUpperCase() + format.slice(1)} Notes`,
      topic,
      format,
      content,
      keyPoints,
      summary,
      createdAt: new Date().toISOString(),
    };

    setGeneratedNote(note);
    setHistory(prev => [note, ...prev].slice(0, 20));
    setIsGenerating(false);
  };

  const copyContent = (note: GeneratedNote) => {
    navigator.clipboard.writeText(note.content);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadNote = (note: GeneratedNote) => {
    const blob = new Blob([note.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="generate">
        <TabsList className="w-full">
          <TabsTrigger value="generate" className="flex-1">Generate</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History ({history.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4 mt-4">
          {/* Sample topics */}
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TOPICS.map(t => (
              <Button
                key={t}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => setTopic(t)}
              >
                {t}
              </Button>
            ))}
          </div>

          <div>
            <Label className="text-xs mb-1 block">Topic</Label>
            <Input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Enter a topic to generate notes for..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v || "bullet")}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_FORMATS.map(f => (
                    <SelectItem key={f.value} value={f.value}>
                      <span className="flex items-center gap-2">
                        <f.icon className="h-3.5 w-3.5" /> {f.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                disabled={!topic || isGenerating}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-pulse" /> Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" /> Generate Notes
                  </>
                )}
              </Button>
            </div>
          </div>

          {generatedNote && (
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{generatedNote.title}</CardTitle>
                  <Badge variant="outline" className="text-xs mt-1">
                    {NOTE_FORMATS.find(f => f.value === generatedNote.format)?.label}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyContent(generatedNote)}>
                    {copiedId === generatedNote.id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => downloadNote(generatedNote)}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Key Points */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" /> Key Points
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {generatedNote.keyPoints.map((kp, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{kp}</Badge>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="bg-muted/50 rounded-lg p-3 max-h-[300px] overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">{generatedNote.content}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notes generated yet</p>
          ) : (
            <div className="space-y-2">
              {history.map(note => (
                <Card key={note.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setGeneratedNote(note)}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{note.title}</p>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{note.topic}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <Badge variant="outline" className="text-xs">
                          {NOTE_FORMATS.find(f => f.value === note.format)?.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); copyContent(note); }}>
                        {copiedId === note.id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); downloadNote(note); }}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}