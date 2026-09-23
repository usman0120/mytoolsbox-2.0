"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Play, Check, X, RotateCcw, Trophy, Copy, ChevronRight, ChevronLeft, Clock, Zap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  generateQuizId, generateQuestionId, calculateScore, generateQuizFromText,
  SAMPLE_QUIZZES,
  type Quiz, type QuizQuestion,
} from "@/features/tools/quiz-generator";

export function QuizGeneratorEngine() {
  const [quiz, setQuiz] = useState<Quiz>({
    id: generateQuizId(),
    title: "My Quiz",
    questions: [{ id: generateQuestionId(), question: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" }],
    createdAt: new Date().toISOString(),
    timeLimitMinutes: 10,
  });
  const [mode, setMode] = useState<"edit" | "take" | "results">("edit");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [bulkText, setBulkText] = useState("");
  const [copied, setCopied] = useState(false);

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: string | number | string[]) => {
    setQuiz(prev => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuiz(prev => {
      const questions = [...prev.questions];
      const options = [...questions[qIndex].options];
      options[oIndex] = value;
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { id: generateQuestionId(), question: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" }],
    }));
  };

  const removeQuestion = (index: number) => {
    if (quiz.questions.length <= 1) return;
    setQuiz(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
  };

  const generateFromText = useCallback(() => {
    if (!bulkText.trim()) { toast.error("Enter some text or notes first."); return; }
    const generated = generateQuizFromText(bulkText, 8);
    if (generated.length === 0) { toast.error("Could not extract questions. Try adding definitions like 'Mitosis is ...' or Q: / A: pairs."); return; }
    setQuiz(prev => ({
      ...prev,
      id: generateQuizId(),
      questions: generated,
      createdAt: new Date().toISOString(),
    }));
    setBulkText("");
    toast.success(`Generated ${generated.length} questions from your notes!`);
  }, [bulkText]);

  const loadSample = (key: string) => {
    const sample = SAMPLE_QUIZZES[key];
    if (sample) setQuiz({ ...sample, id: generateQuizId(), createdAt: new Date().toISOString() });
  };

  const startQuiz = () => {
    const valid = quiz.questions.filter(q => q.question.trim() && q.options.filter(o => o.trim()).length >= 2);
    if (valid.length === 0) { toast.error("Add at least one complete question with options."); return; }
    setAnswers(new Array(quiz.questions.length).fill(null));
    setCurrentQ(0);
    setStartTime(Date.now());
    setMode("take");
  };

  const answerQuestion = (optionIndex: number) => {
    setAnswers(prev => { const next = [...prev]; next[currentQ] = optionIndex; return next; });
  };

  const finishQuiz = () => setMode("results");

  const evaluation = calculateScore(
    quiz.questions,
    answers,
    startTime ? Math.round((Date.now() - startTime) / 1000) : undefined
  );

  const copyQuiz = () => {
    const text = quiz.questions.map((q, i) =>
      `Q${i + 1}: ${q.question}\n${q.options.map((o, j) => `  ${j + 1}. ${o}${j === q.correctIndex ? " ✓" : ""}`).join("\n")}`
    ).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (mode === "take") {
    const q = quiz.questions[currentQ];
    const chosen = answers[currentQ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1.5">
            <Play className="h-3.5 w-3.5" /> Question {currentQ + 1} / {quiz.questions.length}
          </Badge>
          <div className="flex gap-2 items-center">
            {startTime && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {Math.round((Date.now() - startTime) / 1000)}s
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => setMode("edit")}>Back to Edit</Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }} />
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-base font-medium">{q.question || <span className="text-muted-foreground italic">No question text</span>}</p>
            {q.difficulty && (
              <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
            )}

            <div className="space-y-2">
              {q.options.filter(o => o.trim()).map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => answerQuestion(idx)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                    chosen === idx
                      ? "bg-primary/10 border-primary text-primary font-medium"
                      : "bg-background border-border hover:bg-muted/50"
                  }`}
                >
                  <span className="font-mono text-muted-foreground mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-between">
          <Button variant="outline" size="sm" disabled={currentQ === 0} onClick={() => setCurrentQ(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          {currentQ < quiz.questions.length - 1 ? (
            <Button size="sm" onClick={() => setCurrentQ(p => p + 1)} disabled={chosen === null}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={finishQuiz} className="gap-1.5">
              <Trophy className="h-4 w-4" /> Finish Quiz
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (mode === "results") {
    const { score, total, percent, letterGrade, breakdown } = evaluation;
    const gradeColor = letterGrade === "A" ? "text-green-400" : letterGrade === "B" ? "text-cyan-400" : letterGrade === "C" ? "text-yellow-400" : "text-red-400";

    return (
      <div className="space-y-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-center space-y-2">
            <Trophy className="h-10 w-10 mx-auto text-yellow-500" />
            <div className="flex items-center justify-center gap-4">
              <div>
                <p className="text-4xl font-bold">{score}/{total}</p>
                <p className="text-sm text-muted-foreground">{percent}%</p>
              </div>
              <div className={`text-5xl font-bold ${gradeColor}`}>{letterGrade}</div>
            </div>
            {evaluation.timeTakenSeconds && (
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" /> Completed in {Math.floor(evaluation.timeTakenSeconds / 60)}m {evaluation.timeTakenSeconds % 60}s
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">Question Breakdown</Label>
          {breakdown.map((item, i) => (
            <Card key={i} className={`border-l-2 ${item.isCorrect ? "border-l-green-500" : "border-l-red-500"}`}>
              <CardContent className="pt-3 pb-3 space-y-1">
                <div className="flex items-start gap-2">
                  {item.isCorrect
                    ? <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    : <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                  <div className="flex-1">
                    <p className="text-xs font-medium">{i + 1}. {item.question}</p>
                    {!item.isCorrect && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Your answer: <span className="text-red-400">{item.userAnswer}</span> |
                        Correct: <span className="text-green-400">{item.correctAnswer}</span>
                      </p>
                    )}
                    {item.explanation && (
                      <p className="text-[10px] text-muted-foreground mt-1 italic">{item.explanation}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={() => { setAnswers([]); setCurrentQ(0); setStartTime(null); setMode("take"); }} className="gap-1.5">
            <RotateCcw className="h-4 w-4" /> Retake
          </Button>
          <Button variant="outline" onClick={() => setMode("edit")} className="gap-1.5">
            <Zap className="h-4 w-4" /> Edit Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      <Tabs defaultValue="build">
        <TabsList>
          <TabsTrigger value="build" className="text-xs">Build Questions</TabsTrigger>
          <TabsTrigger value="auto" className="text-xs">Auto-Generate from Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="auto" className="space-y-3 mt-3">
          <p className="text-xs text-muted-foreground">
            Paste lecture notes or study material. The engine will extract quiz questions using definitions, Q&A pairs, and key facts.
          </p>
          <Textarea
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            placeholder={"Example:\nMitosis is the process of cell division resulting in two identical daughter cells.\nQ: What is the powerhouse of the cell?\nA: Mitochondria\nWWII ended in 1945."}
            className="text-xs min-h-36 font-mono"
          />
          <Button onClick={generateFromText} className="gap-1.5">
            <Zap className="h-4 w-4" /> Generate Questions
          </Button>
        </TabsContent>

        <TabsContent value="build" className="space-y-4 mt-3">
          {/* Sample presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground self-center">Load sample:</span>
            {Object.keys(SAMPLE_QUIZZES).map(key => (
              <Button key={key} variant="outline" size="sm" className="text-xs h-7" onClick={() => loadSample(key)}>
                {SAMPLE_QUIZZES[key].title}
              </Button>
            ))}
          </div>

          {/* Quiz title */}
          <div>
            <Label className="text-xs mb-1 block">Quiz Title</Label>
            <Input value={quiz.title} onChange={e => setQuiz(prev => ({ ...prev, title: e.target.value }))} className="h-8 text-sm" />
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {quiz.questions.map((q, qIdx) => (
              <Card key={q.id} className="border">
                <CardContent className="pt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] shrink-0">Q{qIdx + 1}</Badge>
                    <Input
                      value={q.question}
                      onChange={e => updateQuestion(qIdx, "question", e.target.value)}
                      placeholder="Enter question..."
                      className="h-7 text-xs flex-1"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeQuestion(qIdx)}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pl-8">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex gap-1 items-center">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctIndex === oIdx}
                          onChange={() => updateQuestion(qIdx, "correctIndex", oIdx)}
                          className="accent-primary shrink-0"
                          title="Mark as correct"
                        />
                        <Input
                          value={opt}
                          onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          className="h-7 text-xs"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pl-8">
                    <Input
                      value={q.explanation || ""}
                      onChange={e => updateQuestion(qIdx, "explanation", e.target.value)}
                      placeholder="Explanation (optional)"
                      className="h-6 text-[10px] text-muted-foreground bg-muted/30"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-1 h-8 text-xs" onClick={addQuestion}>
              <Plus className="h-3.5 w-3.5" /> Add Question
            </Button>
            <Button variant="outline" size="sm" className="gap-1 h-8 text-xs" onClick={copyQuiz}>
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              Copy as Text
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Button onClick={startQuiz} className="w-full gap-2">
        <Play className="h-4 w-4" /> Start Quiz ({quiz.questions.length} questions)
      </Button>
    </div>
  );
}