"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, BookOpen, ChevronDown, ChevronUp, Check, Target, Brain } from "lucide-react";
import type { PracticeQuestion } from "@/lib/math/engine";

interface RelatedContentProps {
  concepts: string[];
  practiceQuestions: PracticeQuestion[];
  onTryQuestion: (question: string) => void;
}

export function RelatedContent({ concepts, practiceQuestions, onTryQuestion }: RelatedContentProps) {
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [showAllConcepts, setShowAllConcepts] = useState(false);

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const difficultyColor = (d: PracticeQuestion["difficulty"]) => {
    switch (d) {
      case "easy": return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "medium": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "hard": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    }
  };

  const displayedConcepts = showAllConcepts ? concepts : concepts.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Related Concepts */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Related Concepts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {displayedConcepts.map((concept, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-xs py-1 px-2.5 cursor-default hover:bg-secondary/80"
              >
                {concept}
              </Badge>
            ))}
          </div>
          {concepts.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setShowAllConcepts(!showAllConcepts)}
            >
              {showAllConcepts ? (
                <><ChevronUp className="h-3 w-3 mr-1" /> Show less</>
              ) : (
                <><ChevronDown className="h-3 w-3 mr-1" /> +{concepts.length - 3} more</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Practice Questions */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-violet-500" />
            Practice Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {practiceQuestions.map((pq, i) => (
            <div
              key={i}
              className="rounded-lg border border-border/50 p-3 hover:border-violet-200 dark:hover:border-violet-800 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-[10px] h-4 px-1.5 rounded-full ${difficultyColor(pq.difficulty)}`}>
                      {pq.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{pq.question}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 shrink-0"
                  onClick={() => onTryQuestion(pq.question)}
                >
                  <Brain className="h-3 w-3" />
                  Try
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground mt-1.5"
                onClick={() => toggleAnswer(i)}
              >
                {revealedAnswers.has(i) ? (
                  <><ChevronUp className="h-3 w-3 mr-1" /> Hide answer</>
                ) : (
                  <><ChevronDown className="h-3 w-3 mr-1" /> Reveal answer</>
                )}
              </Button>
              {revealedAnswers.has(i) && (
                <div className="mt-1.5 p-2 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-1.5">
                    <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-green-700 dark:text-green-300 font-mono">{pq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}