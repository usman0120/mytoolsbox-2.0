"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generateQuizId, generateQuestionId, calculateScore,
  SAMPLE_QUIZZES, type Quiz, type QuizQuestion,
} from "@/features/tools/quiz-generator";
import { Plus, Trash2, Play, Check, X, RotateCcw, Trophy, Copy, ChevronRight } from "lucide-react";

export function QuizGeneratorEngine() {
  const [quiz, setQuiz] = useState<Quiz>({
    id: generateQuizId(),
    title: "My Quiz",
    questions: [
      { id: generateQuestionId(), question: "", options: ["", "", "", ""], correctIndex: 0 },
    ],
    createdAt: new Date().toISOString(),
  });
  const [mode, setMode] = useState<"edit" | "take">("edit");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: string | number) => {
    setQuiz(prev => {
      const questions = [...prev.questions];
      if (field === "options" && typeof value === "string") {
        // Not used directly
      } else if (field === "correctIndex") {
        questions[index] = { ...questions[index], correctIndex: value as number };
      } else if (field === "question") {
        questions[index] = { ...questions[index], question: value as string };
      }
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
      questions: [...prev.questions, {
        id: generateQuestionId(),
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
      }],
    }));
  };

  const removeQuestion = (index: number) => {
    if (quiz.questions.length <= 1) return;
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const startQuiz = () => {
    setAnswers(new Array(quiz.questions.length).fill(null));
    setCurrentQ(0);
    setShowResults(false);
    setMode("take");
  };

  const answerQuestion = (optionIndex: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentQ] = optionIndex;
      return next;
    });
  };

  const nextQuestion = () => {
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) setCurrentQ(prev => prev - 1);
  };

  const loadSample = (key: string) => {
    const sample = SAMPLE_QUIZZES[key];
    if (sample) setQuiz({ ...sample, id: generateQuizId(), createdAt: new Date().toISOString() });
  };

  const copyQuiz = () => {
    const text = quiz.questions.map((q, i) =>
      `Q${i + 1}: ${q.question}\n${q.options.map((o, j) => `  ${j + 1}. ${o}${j === q.correctIndex ? " ✓" : ""}`).join("\n")}`
    ).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const score = calculateScore(quiz.questions, answers);

  return (
    <div className="space-y-4">
      {mode === "edit" ? (
        <>
          {/* Sample quizzes */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(SAMPLE_QUIZZES).map(key => (
              <Button key={key} variant="outline" size="sm" className="text-xs h-7" onClick={() => loadSample(key)}>
                {SAMPLE_QUIZZES[key].title}
              </Button>
            ))}
          </div>

          {/* Title */}
          <div>
            <Label className="text-xs mb-1 block">Quiz Title</Label>
            <Input
              value={quiz.title}
              onChange={e => setQuiz(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {quiz.questions.map((q, qi) => (
              <Card key={q.id}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Question {qi + 1}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeQuestion(qi)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Input
                    value={q.question}
                    onChange={e => updateQuestion(qi, "question", e.target.value)}
                    placeholder="Enter question..."
                    className="text-sm"
                  />
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <Button
                        variant={q.correctIndex === oi ? "default" : "outline"}
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => updateQuestion(qi, "correctIndex", oi)}
                      >
                        {q.correctIndex === oi ? <Check className="h-3 w-3" /> : <span className="text-xs">{oi + 1}</span>}
                      </Button>
                      <Input
                        value={opt}
                        onChange={e => updateOption(qi, oi, e.target.value)}
                        placeholder={`Option ${oi + 1}`}
                        className="text-sm h-8"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={addQuestion} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Add Question
            </Button>
            <Button onClick={startQuiz} className="gap-2">
              <Play className="h-4 w-4" /> Take Quiz
            </Button>
            <Button onClick={copyQuiz} variant="ghost" size="icon">
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </>
      ) : (
        <>
          {!showResults ? (
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex items-center justify-between">
                <Badge variant="outline">Question {currentQ + 1} of {quiz.questions.length}</Badge>
                <span className="text-xs text-muted-foreground">
                  {answers.filter(a => a !== null).length} answered
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-cyan-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <Card>
                <CardContent className="p-4">
                  <p className="font-medium mb-4">{quiz.questions[currentQ].question}</p>
                  <div className="space-y-2">
                    {quiz.questions[currentQ].options.map((opt, oi) => (
                      <Button
                        key={oi}
                        variant={answers[currentQ] === oi ? "default" : "outline"}
                        className="w-full justify-start h-auto py-3 px-4 text-left"
                        onClick={() => answerQuestion(oi)}
                      >
                        <span className="font-mono text-xs mr-3">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button onClick={prevQuestion} variant="outline" disabled={currentQ === 0}>
                  Previous
                </Button>
                <Button onClick={nextQuestion}>
                  {currentQ === quiz.questions.length - 1 ? "Finish" : "Next"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <Trophy className="h-12 w-12 mx-auto text-yellow-400" />
              <div>
                <p className="text-3xl font-bold">{score.percent}%</p>
                <p className="text-muted-foreground">{score.score} / {score.total} correct</p>
              </div>

              {/* Review */}
              <div className="space-y-2 text-left">
                {quiz.questions.map((q, i) => (
                  <Card key={q.id} className={answers[i] === q.correctIndex ? "border-green-500/30" : "border-red-500/30"}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        {answers[i] === q.correctIndex ? (
                          <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{q.question}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Your answer: {answers[i] !== null ? q.options[answers[i]] : "Skipped"}
                          </p>
                          {answers[i] !== q.correctIndex && (
                            <p className="text-xs text-green-400 mt-0.5">
                              Correct: {q.options[q.correctIndex]}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 justify-center">
                <Button onClick={() => { setMode("edit"); setShowResults(false); }} variant="outline" className="gap-2">
                  Edit Quiz
                </Button>
                <Button onClick={startQuiz} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Retake
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}