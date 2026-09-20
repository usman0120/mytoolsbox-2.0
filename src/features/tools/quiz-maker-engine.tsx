"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  HelpCircle, Loader2, Copy, CheckCircle2, XCircle, Plus,
  Trash2, Shuffle, ChevronLeft, ChevronRight, RotateCcw,
  Check, X,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export function QuizMakerEngine() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionInput, setQuestionInput] = useState("");
  const [optionsInput, setOptionsInput] = useState("");
  const [correctIndex, setCorrectIndex] = useState(0);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const addQuestion = useCallback(() => {
    if (!questionInput.trim()) {
      setError("Please enter a question.");
      return;
    }

    const options = optionsInput
      .split("\n")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (options.length < 2) {
      setError("Please enter at least 2 options (one per line).");
      return;
    }

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question: questionInput.trim(),
      options,
      correctIndex: Math.min(correctIndex, options.length - 1),
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setQuestionInput("");
    setOptionsInput("");
    setCorrectIndex(0);
    setError(null);
    toast.success("Question added!");
  }, [questionInput, optionsInput, correctIndex]);

  const removeQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    toast.success("Question removed.");
  }, []);

  const startQuiz = useCallback(() => {
    if (questions.length === 0) {
      setError("Add at least one question to start the quiz.");
      return;
    }
    setIsQuizMode(true);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions(new Set());
    setError(null);
  }, [questions.length]);

  const selectAnswer = useCallback((index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  }, [showResult]);

  const checkAnswer = useCallback(() => {
    if (selectedAnswer === null) return;
    setShowResult(true);

    const currentQuestion = questions[currentIndex];
    if (selectedAnswer === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
    setAnsweredQuestions((prev) => new Set(prev).add(currentQuestion.id));
  }, [selectedAnswer, questions, currentIndex]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [currentIndex, questions.length]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [currentIndex]);

  const finishQuiz = useCallback(() => {
    setIsQuizMode(false);
    toast.success(`Quiz complete! Score: ${score}/${questions.length}`);
  }, [score, questions.length]);

  if (isQuizMode && questions.length > 0) {
    const currentQuestion = questions[currentIndex];
    const isAnswered = answeredQuestions.has(currentQuestion.id);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" /> Quiz Mode
          </Badge>
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground">
              Score: {score}/{answeredQuestions.size}
            </span>
            <Button variant="outline" size="sm" onClick={finishQuiz}>
              Finish
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <p className="text-lg font-medium">{currentQuestion.question}</p>
              </div>

              <div className="space-y-2">
                {currentQuestion.options.map((option, idx) => {
                  let variant: "outline" | "default" | "destructive" | "secondary" = "outline";
                  if (showResult) {
                    if (idx === currentQuestion.correctIndex) {
                      variant = "default";
                    } else if (idx === selectedAnswer && idx !== currentQuestion.correctIndex) {
                      variant = "destructive";
                    }
                  } else if (idx === selectedAnswer) {
                    variant = "secondary";
                  }

                  return (
                    <Button
                      key={idx}
                      variant={variant}
                      onClick={() => selectAnswer(idx)}
                      disabled={showResult}
                      className="w-full justify-start text-left h-auto py-3"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full border text-xs flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm">{option}</span>
                      </span>
                    </Button>
                  );
                })}
              </div>

              {showResult && (
                <div className={`p-3 rounded-md text-sm ${
                  selectedAnswer === currentQuestion.correctIndex
                    ? "bg-green-500/10 text-green-600"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {selectedAnswer === currentQuestion.correctIndex
                    ? "✅ Correct!"
                    : `❌ Incorrect. The correct answer is: ${currentQuestion.options[currentQuestion.correctIndex]}`}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {!showResult ? (
            <Button onClick={checkAnswer} disabled={selectedAnswer === null} className="gap-1.5">
              <Check className="h-4 w-4" />
              Check Answer
            </Button>
          ) : currentIndex < questions.length - 1 ? (
            <Button onClick={nextQuestion} className="gap-1.5">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finishQuiz} className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              See Results
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <HelpCircle className="h-3.5 w-3.5" /> Quiz Maker
      </Badge>

      {/* Add question form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Question</label>
            <Textarea
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Enter your question..."
              className="min-h-15"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Options (one per line)</label>
            <Textarea
              value={optionsInput}
              onChange={(e) => setOptionsInput(e.target.value)}
              placeholder={"Option A\nOption B\nOption C\nOption D"}
              className="min-h-25"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Correct Answer Index</label>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((idx) => (
                <Button
                  key={idx}
                  variant={correctIndex === idx ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCorrectIndex(idx)}
                  className="flex-1"
                >
                  {String.fromCharCode(65 + idx)}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={addQuestion} className="w-full gap-1.5">
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question list */}
      {questions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-75 overflow-y-auto">
              {questions.map((q, idx) => (
                <div key={q.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                  <span className="text-xs text-muted-foreground w-6 pt-0.5">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{q.question}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.options.length} options — Correct: {String.fromCharCode(65 + q.correctIndex)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive shrink-0"
                    onClick={() => removeQuestion(q.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={startQuiz}
        disabled={questions.length === 0}
        className="w-full gap-2"
      >
        <HelpCircle className="h-4 w-4" />
        Start Quiz ({questions.length} questions)
      </Button>
    </div>
  );
}