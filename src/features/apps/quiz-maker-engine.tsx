"use client";

import { useState, useCallback } from "react";
import { HelpCircle, Plus, Trash2, Copy, Check, Download, FileText, Shuffle, Clock, Trophy, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface QuizState {
  questions: Question[];
  currentQuestion: number;
  answers: number[];
  score: number | null;
  isFinished: boolean;
}

export function QuizMakerEngine() {
  const [activeTab, setActiveTab] = useState<"create" | "take">("create");
  const [quizTitle, setQuizTitle] = useState("My Quiz");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", text: "", options: ["", "", "", ""], correctIndex: 0 },
  ]);
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestion: 0,
    answers: [],
    score: null,
    isFinished: false,
  });

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: "",
        options: ["", "", "", ""],
        correctIndex: 0,
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.map((o, i) => (i === optionIndex ? value : o)) }
          : q
      )
    );
  };

  const startQuiz = () => {
    const validQuestions = questions.filter((q) => q.text.trim() && q.options.every((o) => o.trim()));
    if (validQuestions.length === 0) return;
    setQuizState({
      questions: validQuestions,
      currentQuestion: 0,
      answers: new Array(validQuestions.length).fill(-1),
      score: null,
      isFinished: false,
    });
    setActiveTab("take");
  };

  const answerQuestion = (optionIndex: number) => {
    setQuizState((prev) => {
      const newAnswers = [...prev.answers];
      newAnswers[prev.currentQuestion] = optionIndex;
      return { ...prev, answers: newAnswers };
    });
  };

  const nextQuestion = () => {
    setQuizState((prev) => {
      if (prev.currentQuestion >= prev.questions.length - 1) {
        // Finish quiz
        const score = prev.answers.reduce((acc, ans, i) => {
          return acc + (ans === prev.questions[i].correctIndex ? 1 : 0);
        }, 0);
        return { ...prev, isFinished: true, score };
      }
      return { ...prev, currentQuestion: prev.currentQuestion + 1 };
    });
  };

  const prevQuestion = () => {
    setQuizState((prev) => ({
      ...prev,
      currentQuestion: Math.max(0, prev.currentQuestion - 1),
    }));
  };

  const resetQuiz = () => {
    setQuizState({
      questions: [],
      currentQuestion: 0,
      answers: [],
      score: null,
      isFinished: false,
    });
    setActiveTab("create");
  };

  const exportQuiz = () => {
    const data = { title: quizTitle, questions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${quizTitle.toLowerCase().replace(/\s+/g, "-")}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isValid = questions.some((q) => q.text.trim() && q.options.every((o) => o.trim()));

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "create" | "take")}>
        <TabsList>
          <TabsTrigger value="create" className="gap-1"><Plus className="h-3.5 w-3.5" /> Create</TabsTrigger>
          <TabsTrigger value="take" className="gap-1" disabled={quizState.questions.length === 0}>
            <HelpCircle className="h-3.5 w-3.5" /> Take Quiz
          </TabsTrigger>
        </TabsList>

        {/* Create Tab */}
        <TabsContent value="create" className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Quiz Title</Label>
            <Input
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Enter quiz title..."
            />
          </div>

          <div className="space-y-4">
            {questions.map((q, qi) => (
              <Card key={q.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Question {qi + 1}</Label>
                    {questions.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeQuestion(q.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Enter question..."
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                  />
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuestion(q.id, "correctIndex", oi)}
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            q.correctIndex === oi
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-border hover:border-green-300"
                          }`}
                        >
                          {q.correctIndex === oi && <Check className="h-3 w-3" />}
                        </button>
                        <Input
                          placeholder={`Option ${oi + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(q.id, oi, e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 flex-1" onClick={addQuestion}>
              <Plus className="h-4 w-4" /> Add Question
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportQuiz}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>

          <Button onClick={startQuiz} className="gap-2 w-full" size="lg" disabled={!isValid}>
            <HelpCircle className="h-4 w-4" /> Start Quiz ({questions.filter((q) => q.text.trim()).length} questions)
          </Button>
        </TabsContent>

        {/* Take Quiz Tab */}
        <TabsContent value="take" className="space-y-4 mt-4">
          {!quizState.isFinished ? (
            <>
              {/* Progress */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Question {quizState.currentQuestion + 1} of {quizState.questions.length}
                </Badge>
                <div className="flex gap-1">
                  {quizState.questions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full ${
                        quizState.answers[i] >= 0 ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-lg font-semibold">
                    {quizState.questions[quizState.currentQuestion].text}
                  </p>
                  <div className="space-y-2">
                    {quizState.questions[quizState.currentQuestion].options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => answerQuestion(oi)}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          quizState.answers[quizState.currentQuestion] === oi
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                            : "border-border/50 hover:border-border hover:bg-muted/50"
                        }`}
                      >
                        <span className="text-sm font-medium">{String.fromCharCode(65 + oi)}.</span>{" "}
                        <span className="text-sm">{opt}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={prevQuestion}
                  disabled={quizState.currentQuestion === 0}
                >
                  Previous
                </Button>
                <Button
                  className="gap-2 flex-1"
                  onClick={nextQuestion}
                  disabled={quizState.answers[quizState.currentQuestion] < 0}
                >
                  {quizState.currentQuestion >= quizState.questions.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </>
          ) : (
            /* Results */
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center space-y-4">
                <Trophy className="h-16 w-16 mx-auto text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Quiz Complete!</p>
                  <p className="text-4xl font-bold">
                    {quizState.score} / {quizState.questions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((quizState.score! / quizState.questions.length) * 100)}% correct
                  </p>
                </div>

                {/* Per-question results */}
                <div className="space-y-2 text-left">
                  {quizState.questions.map((q, i) => {
                    const isCorrect = quizState.answers[i] === q.correctIndex;
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${
                          isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Badge variant={isCorrect ? "default" : "destructive"} className="shrink-0 mt-0.5">
                            {isCorrect ? <Check className="h-3 w-3" /> : "✕"}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">{q.text}</p>
                            <p className="text-xs text-muted-foreground">
                              Your answer: {q.options[quizState.answers[i]] || "—"}
                            </p>
                            {!isCorrect && (
                              <p className="text-xs text-green-600">
                                Correct: {q.options[q.correctIndex]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <Button onClick={resetQuiz} className="gap-2 flex-1">
                    <RefreshCw className="h-4 w-4" /> New Quiz
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("create")} className="gap-2">
                    <Plus className="h-4 w-4" /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}