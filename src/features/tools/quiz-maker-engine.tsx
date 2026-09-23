"use client";

import { useState } from "react";
import { Plus, Trash2, Play, Check, X, Download, RotateCcw, ToggleLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type QuestionType = "multiple" | "truefalse";

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
  correctIndex: number;
  points: number;
  explanation?: string;
}

function genId() { return `q_${Math.random().toString(36).slice(2, 9)}`; }

function newQuestion(type: QuestionType = "multiple"): Question {
  if (type === "truefalse") {
    return { id: genId(), type: "truefalse", text: "", options: ["True", "False"], correctIndex: 0, points: 1 };
  }
  return { id: genId(), type: "multiple", text: "", options: ["", "", "", ""], correctIndex: 0, points: 1 };
}

export function QuizMakerEngine() {
  const [title, setTitle] = useState("My Quiz");
  const [questions, setQuestions] = useState<Question[]>([newQuestion("multiple")]);
  const [mode, setMode] = useState<"build" | "take" | "review">("build");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [checked, setChecked] = useState(false);

  const addQuestion = (type: QuestionType) => {
    setQuestions(prev => [...prev, newQuestion(type)]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateQ = (id: string, field: keyof Question, value: string | number | string[]) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (id: string, idx: number, value: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== id) return q;
      const options = [...q.options];
      options[idx] = value;
      return { ...q, options };
    }));
  };

  const changeType = (id: string, type: QuestionType) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== id) return q;
      if (type === "truefalse") return { ...q, type, options: ["True", "False"], correctIndex: 0 };
      return { ...q, type, options: q.options.length >= 4 ? q.options : ["", "", "", ""], correctIndex: 0 };
    }));
  };

  const startQuiz = () => {
    const valid = questions.filter(q => q.text.trim() && q.options.filter(o => o.trim()).length >= 2);
    if (valid.length === 0) { toast.error("Add at least one complete question."); return; }
    setAnswers(new Array(questions.length).fill(null));
    setCurrentQ(0);
    setChecked(false);
    setMode("take");
  };

  const selectAnswer = (optIdx: number) => {
    if (checked) return;
    setAnswers(prev => { const next = [...prev]; next[currentQ] = optIdx; return next; });
  };

  const checkAnswer = () => {
    if (answers[currentQ] === null) { toast.error("Select an answer first."); return; }
    setChecked(true);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(p => p + 1);
      setChecked(false);
    } else {
      setMode("review");
    }
  };

  const exportPrintable = () => {
    const lines: string[] = [`${title}\n`, "QUESTIONS", "-".repeat(40)];
    questions.forEach((q, i) => {
      lines.push(`\n${i + 1}. [${q.points} pt] ${q.text}`);
      q.options.filter(o => o.trim()).forEach((o, j) => {
        lines.push(`   ${String.fromCharCode(65 + j)}. ${o}`);
      });
    });
    lines.push("\n\n" + "=" .repeat(40));
    lines.push("ANSWER KEY");
    lines.push("-".repeat(40));
    questions.forEach((q, i) => {
      const correct = String.fromCharCode(65 + q.correctIndex);
      lines.push(`${i + 1}. ${correct}${q.explanation ? " — " + q.explanation : ""}`);
    });
    const text = lines.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${title.replace(/\s+/g, "-")}-quiz.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Quiz exported with answer key!");
  };

  // Results
  if (mode === "review") {
    const totalPoints = questions.reduce((a, q) => a + q.points, 0);
    const earned = questions.reduce((a, q, i) => {
      return answers[i] === q.correctIndex ? a + q.points : a;
    }, 0);
    const pct = totalPoints > 0 ? Math.round((earned / totalPoints) * 100) : 0;
    const grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";

    return (
      <div className="space-y-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-center space-y-2">
            <p className="text-4xl font-bold">{earned}/{totalPoints}</p>
            <p className="text-muted-foreground text-sm">{pct}% — Grade: <strong>{grade}</strong></p>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctIndex;
            return (
              <Card key={q.id} className={`border-l-2 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex gap-2 items-start">
                    {isCorrect ? <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> : <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <p className="text-xs font-medium">{i + 1}. {q.text}</p>
                      {!isCorrect && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Your answer: <span className="text-red-400">{q.options[answers[i] ?? -1] || "None"}</span> ·
                          Correct: <span className="text-green-400">{q.options[q.correctIndex]}</span>
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-[10px] text-muted-foreground italic mt-0.5">{q.explanation}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{q.points}pt</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMode("build")} className="gap-1.5">
            ← Edit Quiz
          </Button>
          <Button onClick={startQuiz} className="gap-1.5">
            <RotateCcw className="h-4 w-4" /> Retake
          </Button>
          <Button variant="outline" onClick={exportPrintable} className="gap-1.5">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "take") {
    const q = questions[currentQ];
    const chosen = answers[currentQ];
    const isCorrect = chosen === q.correctIndex;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">Question {currentQ + 1} / {questions.length}</Badge>
          <Button size="sm" variant="outline" onClick={() => setMode("build")}>← Back</Button>
        </div>
        <div className="h-1.5 bg-muted rounded-full">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-base font-medium">{q.text}</p>
              <Badge variant="secondary" className="text-[10px] shrink-0">{q.points}pt</Badge>
            </div>

            <div className="space-y-2">
              {q.options.filter(o => o.trim()).map((option, idx) => {
                let cls = "border-border hover:bg-muted/50";
                if (checked) {
                  if (idx === q.correctIndex) cls = "border-green-500 bg-green-500/10 text-green-600";
                  else if (idx === chosen) cls = "border-red-500 bg-red-500/10 text-red-600";
                } else if (chosen === idx) {
                  cls = "border-primary bg-primary/10";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(idx)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${cls}`}
                  >
                    <span className="font-mono text-muted-foreground mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {option}
                  </button>
                );
              })}
            </div>

            {checked && q.explanation && (
              <p className="text-xs text-muted-foreground italic border-t pt-2">{q.explanation}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          {!checked ? (
            <Button onClick={checkAnswer} disabled={chosen === null} className="gap-1.5">
              Check Answer
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="gap-1.5">
              {currentQ < questions.length - 1 ? "Next →" : "Finish Quiz"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs mb-1 block">Quiz Title</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} className="h-8 text-sm" />
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => (
          <Card key={q.id}>
            <CardContent className="pt-3 space-y-2">
              <div className="flex gap-2 items-center">
                <Badge variant="outline" className="text-[10px] shrink-0">Q{i + 1}</Badge>
                <Input
                  value={q.text}
                  onChange={e => updateQ(q.id, "text", e.target.value)}
                  placeholder="Question text..."
                  className="h-7 text-xs flex-1"
                />
                <Select value={q.type} onValueChange={v => changeType(q.id, v as QuestionType)}>
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple" className="text-xs">Multiple Choice</SelectItem>
                    <SelectItem value="truefalse" className="text-xs">True / False</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number" min={1} max={10}
                  value={q.points}
                  onChange={e => updateQ(q.id, "points", parseInt(e.target.value) || 1)}
                  className="h-7 w-14 text-xs"
                  title="Points"
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeQuestion(q.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>

              {q.type === "multiple" ? (
                <div className="grid grid-cols-2 gap-1.5 pl-8">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex gap-1 items-center">
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={q.correctIndex === oIdx}
                        onChange={() => updateQ(q.id, "correctIndex", oIdx)}
                        className="accent-primary shrink-0"
                        title="Correct answer"
                      />
                      <Input
                        value={opt}
                        onChange={e => updateOption(q.id, oIdx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                        className="h-7 text-xs"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 pl-8">
                  {["True", "False"].map((opt, oIdx) => (
                    <label key={opt} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={q.correctIndex === oIdx}
                        onChange={() => updateQ(q.id, "correctIndex", oIdx)}
                        className="accent-primary"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              <div className="pl-8">
                <Input
                  value={q.explanation || ""}
                  onChange={e => updateQ(q.id, "explanation", e.target.value)}
                  placeholder="Explanation (shown after answering)"
                  className="h-6 text-[10px] text-muted-foreground bg-muted/30"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => addQuestion("multiple")}>
          <Plus className="h-3.5 w-3.5" /> Multiple Choice
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => addQuestion("truefalse")}>
          <ToggleLeft className="h-3.5 w-3.5" /> True / False
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={exportPrintable}>
          <Download className="h-3.5 w-3.5" /> Export with Key
        </Button>
      </div>

      <Button onClick={startQuiz} className="w-full gap-2">
        <Play className="h-4 w-4" /> Start Quiz
      </Button>
    </div>
  );
}