"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  HelpCircle,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  FileText,
  Shuffle,
  Clock,
  Trophy,
  BarChart3,
  RefreshCw,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Printer,
  ChevronRight,
  ChevronLeft,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { generateQuizFromText } from "@/features/tools/quiz-generator";

export interface QuizQuestion {
  id: string;
  question: string;
  type: "mcq" | "boolean";
  options: string[];
  correctIndex: number;
  explanation: string;
  points?: number;
}

export interface Quiz {
  title: string;
  description: string;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
}

const SAMPLE_QUIZZES: Record<string, Quiz> = {
  web_dev: {
    title: "Full-Stack Web Development & Modern Architecture",
    description: "Assess fundamental principles of JavaScript, TypeScript, Next.js, and client-server pipelines.",
    timeLimitMinutes: 5,
    questions: [
      {
        id: "q1",
        question: "Which data structure does the JavaScript runtime use to coordinate asynchronous callback execution?",
        type: "mcq",
        options: ["Call Stack", "Task / Event Queue", "Heap Memory Buffer", "Garbage Collection Pool"],
        correctIndex: 1,
        explanation: "The Task/Event Queue holds asynchronous callbacks (like setTimeout or fetch) to be pushed onto the Call Stack when it is empty.",
      },
      {
        id: "q2",
        question: "React Server Components (RSC) execute exclusively on the server and do not add to the client bundle size.",
        type: "boolean",
        options: ["True", "False"],
        correctIndex: 0,
        explanation: "True. RSCs render to an intermediate format on the server and send zero JavaScript runtime code to the browser.",
      },
      {
        id: "q3",
        question: "What HTTP status code represents '429 Too Many Requests' used in rate-limiting and abuse prevention?",
        type: "mcq",
        options: ["403 Forbidden", "422 Unprocessable Entity", "429 Too Many Requests", "503 Service Unavailable"],
        correctIndex: 2,
        explanation: "HTTP 429 explicitly informs clients that they have sent too many requests within a given time frame (rate limit).",
      },
      {
        id: "q4",
        question: "In TypeScript, what keyword creates a new type that can be any of several specified types?",
        type: "mcq",
        options: ["Interface", "Union (|)", "Intersection (&)", "Generics"],
        correctIndex: 1,
        explanation: "The union operator (|) defines a type composed of two or more distinct types.",
      },
    ],
  },
  science: {
    title: "General Science & Planetary Physics",
    description: "Explore fundamental concepts in biology, astronomy, and chemistry.",
    timeLimitMinutes: 4,
    questions: [
      {
        id: "s1",
        question: "What cellular organelle is responsible for generating the majority of chemical energy (ATP)?",
        type: "mcq",
        options: ["Golgi Apparatus", "Mitochondria", "Endoplasmic Reticulum", "Ribosome"],
        correctIndex: 1,
        explanation: "Mitochondria produce ATP through oxidative phosphorylation, earning the title 'powerhouse of the cell'.",
      },
      {
        id: "s2",
        question: "Sound travels faster through water than through air.",
        type: "boolean",
        options: ["True", "False"],
        correctIndex: 0,
        explanation: "True. Because water is denser and more elastic than air, sound waves propagate roughly 4.3 times faster in water.",
      },
      {
        id: "s3",
        question: "Which chemical element possesses the highest electrical conductivity at room temperature?",
        type: "mcq",
        options: ["Gold (Au)", "Copper (Cu)", "Silver (Ag)", "Aluminum (Al)"],
        correctIndex: 2,
        explanation: "Silver is the most electrically conductive metal, closely followed by copper and gold.",
      },
    ],
  },
};

const STORAGE_KEY = "mytoolsbox-quiz-maker-v2";

export function QuizEditor() {
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "take" | "results">("edit");
  const [quiz, setQuiz] = useState<Quiz>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {
        // Fall back
      }
    }
    return SAMPLE_QUIZZES.web_dev;
  });

  // Test Taking State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(quiz.timeLimitMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);

  // Save changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quiz));
    }
  }, [quiz]);

  // Countdown timer in Test mode
  useEffect(() => {
    if (!isTimerRunning || activeTab !== "take") return;
    if (secondsRemaining <= 0) {
      finishQuiz();
      return;
    }
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining, activeTab]);

  const loadSample = (key: string) => {
    const s = SAMPLE_QUIZZES[key];
    if (!s) return;
    setQuiz(s);
    setActiveTab("edit");
    toast.success(`Loaded quiz: ${s.title}`);
  };

  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: "",
      type: "mcq",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanation: "",
    };
    setQuiz((prev) => ({ ...prev, questions: [...prev.questions, newQ] }));
    toast.success("Added new question card");
  };

  const removeQuestion = (idx: number) => {
    if (quiz.questions.length <= 1) {
      toast.error("Quiz must have at least one question.");
      return;
    }
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx),
    }));
  };

  const updateQuestion = (idx: number, patch: Partial<QuizQuestion>) => {
    setQuiz((prev) => {
      const qCopy = [...prev.questions];
      qCopy[idx] = { ...qCopy[idx], ...patch };
      return { ...prev, questions: qCopy };
    });
  };

  const startQuiz = () => {
    if (quiz.questions.length === 0) {
      toast.error("Please add at least one question.");
      return;
    }
    setUserAnswers({});
    setCurrentIdx(0);
    setSecondsRemaining(quiz.timeLimitMinutes * 60);
    setIsTimerRunning(true);
    setSubmittedAt(null);
    setActiveTab("take");
  };

  const finishQuiz = () => {
    setIsTimerRunning(false);
    setSubmittedAt(Date.now());
    setActiveTab("results");
    toast.success("Quiz completed! Review your score below.");
  };

  // Score Calculation
  const scoreResult = useMemo(() => {
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctIndex) {
        correct++;
      }
    });
    const total = quiz.questions.length;
    const points = (question: QuizQuestion) => Math.max(1, Number(question.points) || 1);
    const totalPoints = quiz.questions.reduce((sum, question) => sum + points(question), 0);
    const earnedPoints = quiz.questions.reduce((sum, question, index) => sum + (userAnswers[index] === question.correctIndex ? points(question) : 0), 0);
    const pct = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    let grade = "A";
    if (pct < 60) grade = "F";
    else if (pct < 70) grade = "D";
    else if (pct < 80) grade = "C";
    else if (pct < 90) grade = "B";

    return { correct, total, pct, grade };
  }, [quiz.questions, userAnswers]);

  // Export Quiz JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(quiz, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-${quiz.title.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Quiz JSON exported!");
  };

  return (
    <div className="space-y-6">
      {/* Top Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">Interactive Quiz & Assessment Studio</h2>
              <Badge variant="outline" className="text-[10px] uppercase font-semibold text-purple-600 border-purple-500/30">
                Exam Mode
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Design multi-choice & binary tests, take live timed examinations, and review instant question analytics.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Select onValueChange={(v: any) => v && loadSample(String(v))}>
            <SelectTrigger className="h-8 w-44 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-500" />
              <span>Load Sample Quiz</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web_dev" className="text-xs">
                Web Development Mastery
              </SelectItem>
              <SelectItem value="science" className="text-xs">
                General Science & Physics
              </SelectItem>
            </SelectContent>
          </Select>

          {activeTab === "edit" ? (
            <Button size="sm" onClick={startQuiz} className="h-8 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white">
              <Play className="h-3.5 w-3.5" />
              Launch Test Mode
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setActiveTab("edit")} className="h-8 text-xs gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Return to Editor
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={exportJSON} className="h-8 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            Export JSON
          </Button>

          <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8 text-xs gap-1.5">
            <Printer className="h-3.5 w-3.5 text-muted-foreground" />
            Print Exam
          </Button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid grid-cols-3 max-w-md h-9 text-xs mb-4">
          <TabsTrigger value="edit" className="text-xs">
            1. Quiz Editor ({quiz.questions.length})
          </TabsTrigger>
          <TabsTrigger value="take" className="text-xs" disabled={quiz.questions.length === 0}>
            2. Live Exam
          </TabsTrigger>
          <TabsTrigger value="results" className="text-xs" disabled={!submittedAt}>
            3. Results & Review
          </TabsTrigger>
        </TabsList>

        {/* ================================================================= */}
        {/* TAB 1: QUIZ EDITOR */}
        {/* ================================================================= */}
        <TabsContent value="edit" className="space-y-4">
          <Card><CardHeader><CardTitle>Generate questions from notes</CardTitle><CardDescription>Use definitions or Q: / A: pairs. Generating replaces the questions in this draft; export it first if you want to keep a copy.</CardDescription></CardHeader><CardContent className="space-y-3">
            <Textarea aria-label="Notes for quiz generation" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Mitosis is the process of cell division..." />
            <Button onClick={() => {
              const questions = generateQuizFromText(notes, 8);
              if (!questions.length) { toast.error("No questions found. Add definitions or Q: / A: pairs."); return; }
              setQuiz((previous) => ({ ...previous, questions: questions.map((question) => ({ ...question, explanation: question.explanation ?? "", type: "mcq" as const })) }));
              toast.success("Questions generated from your notes.");
            }}>Generate from notes</Button>
          </CardContent></Card>
          {/* Metadata Card */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Quiz Header & Time Limit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Quiz Title</Label>
                  <Input
                    value={quiz.title}
                    onChange={(e) => setQuiz((prev) => ({ ...prev, title: e.target.value }))}
                    className="h-8 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Time Limit (Minutes)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={quiz.timeLimitMinutes}
                    onChange={(e) => setQuiz((prev) => ({ ...prev, timeLimitMinutes: parseInt(e.target.value) || 5 }))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Instructions / Description</Label>
                <Input
                  value={quiz.description}
                  onChange={(e) => setQuiz((prev) => ({ ...prev, description: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Question List */}
          <div className="space-y-4">
            {quiz.questions.map((q, qIndex) => (
              <Card key={q.id} className="border-border/60">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-md bg-purple-500/10 text-purple-600 font-bold text-xs">
                      {qIndex + 1}
                    </span>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Question #{qIndex + 1}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(qIndex)}
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Question Text</Label>
                    <Input
                      placeholder="e.g. What is the output of typeof NaN?"
                      value={q.question}
                      onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                      className="h-8 text-xs font-medium"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-1"><Label className="text-xs">Question type</Label><Select value={q.type} onValueChange={(value) => {
                    const type = value === "boolean" ? "boolean" : "mcq";
                    updateQuestion(qIndex, { type, correctIndex: 0, options: type === "boolean" ? ["True", "False"] : ["", "", "", ""] });
                  }}><SelectTrigger aria-label={`Type for question ${qIndex + 1}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mcq">Multiple choice</SelectItem><SelectItem value="boolean">True / false</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><Label className="text-xs">Question points</Label><Input aria-label={`Points for question ${qIndex + 1}`} type="number" min={1} value={q.points ?? 1} onChange={(event) => updateQuestion(qIndex, { points: Math.max(1, Number(event.target.value) || 1) })} /></div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Answer Choices (Select radio for correct answer)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-colors ${
                            q.correctIndex === optIdx
                              ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20"
                              : "border-border"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctIndex === optIdx}
                            onChange={() => updateQuestion(qIndex, { correctIndex: optIdx })}
                            className="h-4 w-4 accent-emerald-600 shrink-0"
                          />
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...q.options];
                              newOpts[optIdx] = e.target.value;
                              updateQuestion(qIndex, { options: newOpts });
                            }}
                            className="h-7 text-xs border-0 bg-transparent shadow-none focus-visible:ring-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Explanation / Learning Note</Label>
                    <Input
                      placeholder="Why is this answer correct?"
                      value={q.explanation}
                      onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                      className="h-7 text-xs text-muted-foreground"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={addQuestion} variant="outline" className="w-full text-xs font-semibold h-9 border-dashed gap-1.5">
              <Plus className="h-4 w-4" />
              Add Another Question
            </Button>
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 2: LIVE TEST TAKING MODE */}
        {/* ================================================================= */}
        <TabsContent value="take" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle data-user-content className="text-base font-bold">{quiz.title}</CardTitle>
                <CardDescription className="text-xs">
                  Question {currentIdx + 1} of {quiz.questions.length}
                </CardDescription>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-sm font-bold">
                <Clock className="h-4 w-4" />
                <span>
                  {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Question Navigator Dots */}
              <div className="flex flex-wrap items-center gap-1.5">
                {quiz.questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                      currentIdx === i
                        ? "bg-purple-600 text-white ring-2 ring-purple-600/30"
                        : userAnswers[i] !== undefined
                        ? "bg-purple-500/20 text-purple-700 dark:text-purple-300"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Active Question Box */}
              {quiz.questions[currentIdx] && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-base font-semibold leading-relaxed">
                    <span data-user-content>{quiz.questions[currentIdx].question}</span>
                  </h3>

                  <div className="space-y-2">
                    {quiz.questions[currentIdx].options.map((opt, optIdx) => {
                      const isSelected = userAnswers[currentIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => setUserAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }))}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left text-sm transition-all ${
                            isSelected
                              ? "border-purple-600 bg-purple-600/10 text-foreground font-semibold shadow-xs"
                              : "border-border hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${
                              isSelected ? "border-purple-600 bg-purple-600 text-white" : "border-muted-foreground/40"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span data-user-content>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Nav Bottom Controls */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                  className="text-xs gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentIdx === quiz.questions.length - 1 ? (
                  <Button size="sm" onClick={finishQuiz} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                    Submit Examination
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setCurrentIdx((prev) => prev + 1)} className="text-xs gap-1 bg-purple-600 hover:bg-purple-700 text-white">
                    Next Question
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 3: RESULTS & REVIEW */}
        {/* ================================================================= */}
        <TabsContent value="results" className="space-y-6">
          <Card className="border-border/60 text-center p-6 space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 text-purple-600">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight">
                {scoreResult.correct} / {scoreResult.total} ({scoreResult.pct.toFixed(0)}%)
              </p>
              <p className="text-sm font-semibold text-muted-foreground mt-1">
                Final Grade: <span className="text-purple-600 font-bold">{scoreResult.grade}</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {scoreResult.pct >= 80
                ? "Excellent performance! You demonstrate thorough mastery of this subject matter."
                : "Good effort! Review the detailed breakdown below to reinforce key concepts."}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button size="sm" onClick={startQuiz} className="text-xs gap-1 bg-purple-600 hover:bg-purple-700 text-white">
                <RotateCcw className="h-3.5 w-3.5" />
                Retake Quiz
              </Button>
              <Button size="sm" variant="outline" onClick={() => setActiveTab("edit")} className="text-xs">
                Edit Questions
              </Button>
            </div>
          </Card>

          {/* Detailed Question Review */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold">Answer Breakdown & Explanations</h3>
            {quiz.questions.map((q, i) => {
              const selected = userAnswers[i];
              const isCorrect = selected === q.correctIndex;

              return (
                <div key={q.id} className="p-4 rounded-xl border bg-card/60 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold text-foreground">
                      {i + 1}. {q.question}
                    </p>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 shrink-0">
                        <CheckCircle2 className="h-4 w-4" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 shrink-0">
                        <XCircle className="h-4 w-4" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-muted/40">
                      <span className="text-muted-foreground block text-[10px]">Your Answer:</span>
                      <span className={`font-semibold ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                        {selected !== undefined ? q.options[selected] : "Unanswered"}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
                      <span className="block text-[10px] text-emerald-600">Correct Answer:</span>
                      <span className="font-semibold">{q.options[q.correctIndex]}</span>
                    </div>
                  </div>

                  {q.explanation && (
                    <p className="text-[11px] text-muted-foreground bg-muted/20 p-2 rounded border border-border/40">
                      💡 <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
