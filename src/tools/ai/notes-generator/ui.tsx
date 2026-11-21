"use client";

import { useState } from "react";
import { toast } from "sonner";
import { generateStudyNotes } from "@/lib/ai/study-generators";
import { AiMarkdown } from "@/components/ai/ai-markdown";

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

    let result;
    try {
      result = await generateStudyNotes(topic, format);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't generate notes. Try again.");
      setIsGenerating(false);
      return;
    }
    const { content, keyPoints, summary } = result;
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
                <div className="bg-muted/50 rounded-lg p-3 max-h-75 overflow-y-auto">
                  <AiMarkdown text={generatedNote.content} className="text-sm" />
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