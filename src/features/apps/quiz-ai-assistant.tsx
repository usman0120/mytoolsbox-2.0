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
import { Separator } from "@/components/ui/separator";
import {
  Sparkles, Plus, Trash2, Copy, Check, Shuffle, Download,
  FileText, Clock, Brain, Target, BookOpen, RotateCcw,
} from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface GeneratedQuiz {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
  createdAt: string;
}

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard", "Mixed"];
const QUESTION_COUNTS = ["5", "10", "15", "20"];

const SAMPLE_TOPICS: Record<string, string[]> = {
  "Mathematics": ["Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry", "Number Theory"],
  "Science": ["Physics", "Chemistry", "Biology", "Astronomy", "Earth Science", "Environmental Science"],
  "History": ["World History", "American History", "Ancient Civilizations", "Modern History", "Cold War"],
  "Literature": ["Shakespeare", "Poetry", "American Literature", "World Literature", "Literary Devices"],
  "Computer Science": ["Data Structures", "Algorithms", "Programming", "Databases", "Networking"],
};

function generateId(): string {
  return `aiq_${Math.random().toString(36).slice(2, 10)}`;
}

function generateQuestionId(): string {
  return `q_${Math.random().toString(36).slice(2, 10)}`;
}

// Simulated AI generation with templates
function generateQuestions(topic: string, difficulty: string, count: number): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const templates: Record<string, string[]> = {
    Easy: [
      "What is the primary purpose of {topic}?",
      "Define the term '{topic}' in your own words.",
      "Which of the following best describes {topic}?",
      "What is a basic example of {topic}?",
      "Who is associated with the discovery of {topic}?",
    ],
    Medium: [
      "Explain how {topic} is applied in real-world scenarios.",
      "Compare and contrast two approaches within {topic}.",
      "What are the key principles underlying {topic}?",
      "How does {topic} relate to other concepts in the field?",
      "Analyze the importance of {topic} in modern contexts.",
    ],
    Hard: [
      "Critically evaluate the limitations of {topic}.",
      "Propose an advanced application of {topic} to solve a complex problem.",
      "Synthesize knowledge of {topic} with other disciplines.",
      "What are the cutting-edge developments in {topic}?",
      "Design an experiment to test a hypothesis related to {topic}.",
    ],
  };

  const pool = templates[difficulty] || [...templates.Easy, ...templates.Medium];
  const actualCount = Math.min(count, pool.length);

  for (let i = 0; i < actualCount; i++) {
    const questionText = pool[i].replace(/{topic}/g, topic);
    const correctIndex = Math.floor(Math.random() * 4);
    questions.push({
      id: generateQuestionId(),
      question: questionText,
      options: [
        `Option A for ${topic}`,
        `Option B for ${topic}`,
        `Option C for ${topic}`,
        `Option D for ${topic}`,
      ],
      correctIndex,
      explanation: `This is the correct answer because it best addresses the question about ${topic}.`,
    });
  }

  return questions;
}

export function QuizAIAssistant() {
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState("10");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [history, setHistory] = useState<GeneratedQuiz[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeTopic = customTopic || topic;

  const handleGenerate = async () => {
    if (!activeTopic) return;
    setIsGenerating(true);

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const questions = generateQuestions(activeTopic, difficulty, parseInt(questionCount));
    const quiz: GeneratedQuiz = {
      id: generateId(),
      title: `${activeTopic} Quiz`,
      topic: activeTopic,
      difficulty,
      questions,
      createdAt: new Date().toISOString(),
    };

    setGeneratedQuiz(quiz);
    setHistory(prev => [quiz, ...prev].slice(0, 20));
    setIsGenerating(false);
  };

  const copyQuiz = (quiz: GeneratedQuiz) => {
    const text = [
      `# ${quiz.title}`,
      `Topic: ${quiz.topic} | Difficulty: ${quiz.difficulty}`,
      "",
      ...quiz.questions.map((q, i) =>
        `Q${i + 1}: ${q.question}\n${q.options.map((o, j) => `  ${j + 1}. ${o}${j === q.correctIndex ? " ✓" : ""}`).join("\n")}\n  Explanation: ${q.explanation}`
      ),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopiedId(quiz.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadQuiz = (quiz: GeneratedQuiz) => {
    const text = [
      `# ${quiz.title}`,
      `Topic: ${quiz.topic} | Difficulty: ${quiz.difficulty} | Date: ${new Date(quiz.createdAt).toLocaleDateString()}`,
      "",
      ...quiz.questions.map((q, i) =>
        `Q${i + 1}: ${q.question}\n${q.options.map((o, j) => `  ${j + 1}. ${o}${j === q.correctIndex ? " ✓" : ""}`).join("\n")}\n  Explanation: ${q.explanation}`
      ),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.title.replace(/\s+/g, "_")}.txt`;
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
          {/* Topic selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Category</Label>
              <Select value={topic} onValueChange={(v) => setTopic(v || "")}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SAMPLE_TOPICS).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Sub-topic</Label>
              <Select value={customTopic} onValueChange={(v) => setCustomTopic(v || "")}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {(SAMPLE_TOPICS[topic] || []).map(st => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Or enter custom topic</Label>
            <Input
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
              placeholder="e.g. Machine Learning, Cell Biology, World War II..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v || "Medium")}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Questions</Label>
              <Select value={questionCount} onValueChange={(v) => setQuestionCount(v || "10")}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_COUNTS.map(c => (
                    <SelectItem key={c} value={c}>{c} questions</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!activeTopic || isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" /> Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" /> Generate Quiz
              </>
            )}
          </Button>

          {generatedQuiz && (
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{generatedQuiz.title}</CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{generatedQuiz.difficulty}</Badge>
                    <Badge variant="outline" className="text-xs">{generatedQuiz.questions.length} Qs</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyQuiz(generatedQuiz)}>
                    {copiedId === generatedQuiz.id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => downloadQuiz(generatedQuiz)}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-75 overflow-y-auto">
                  {generatedQuiz.questions.map((q, i) => (
                    <div key={q.id} className="text-sm p-2 rounded bg-muted/50">
                      <p className="font-medium">Q{i + 1}: {q.question}</p>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {q.options.map((opt, j) => (
                          <span key={j} className={`text-xs ${j === q.correctIndex ? "text-green-400 font-medium" : "text-muted-foreground"}`}>
                            {String.fromCharCode(65 + j)}. {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No quizzes generated yet</p>
          ) : (
            <div className="space-y-2">
              {history.map(quiz => (
                <Card key={quiz.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setGeneratedQuiz(quiz)}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{quiz.title}</p>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{quiz.topic}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{quiz.difficulty}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{quiz.questions.length} Qs</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); copyQuiz(quiz); }}>
                        {copiedId === quiz.id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); downloadQuiz(quiz); }}>
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
