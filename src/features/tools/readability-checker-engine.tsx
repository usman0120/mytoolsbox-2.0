"use client";

import { useState } from "react";
import { BookOpen, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function ReadabilityCheckerEngine() {
  const [text, setText] = useState("");

  const analyze = () => {
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean) : [];
    const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
    const wordCount = words.length;
    const sentenceCount = sentences.length || 1;

    const fleschScore = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount);
    const fleschGrade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllables / wordCount) - 15.59;

    const getLevel = (score: number) => {
      if (score >= 90) return { label: "Very Easy", color: "text-green-600" };
      if (score >= 80) return { label: "Easy", color: "text-green-500" };
      if (score >= 70) return { label: "Fairly Easy", color: "text-lime-500" };
      if (score >= 60) return { label: "Standard", color: "text-yellow-500" };
      if (score >= 50) return { label: "Fairly Difficult", color: "text-orange-500" };
      if (score >= 30) return { label: "Difficult", color: "text-red-500" };
      return { label: "Very Difficult", color: "text-red-600" };
    };

    return { fleschScore: Math.round(fleschScore * 10) / 10, fleschGrade: Math.round(fleschGrade * 10) / 10, level: getLevel(fleschScore), wordCount, sentenceCount, syllables, complexWords: words.filter(w => countSyllables(w) >= 3).length };
  };

  const countSyllables = (word: string) => {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  const stats = text.trim() ? analyze() : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Readability Checker</Badge>
        <span className="text-xs text-muted-foreground">Flesch-Kincaid readability analysis</span>
      </div>

      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your text to analyze readability..." className="w-full h-36 px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />

      {stats && (
        <div className="space-y-2">
          <div className="p-4 bg-muted/30 rounded-xl text-center">
            <div className={`text-2xl font-bold ${stats.level.color}`}>{stats.level.label}</div>
            <div className="text-sm text-muted-foreground">Flesch Score: {stats.fleschScore} | Grade: {stats.fleschGrade}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-muted/30 rounded-xl text-center">
              <div className="text-lg font-bold">{stats.wordCount}</div>
              <div className="text-xs text-muted-foreground">Words</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl text-center">
              <div className="text-lg font-bold">{stats.sentenceCount}</div>
              <div className="text-xs text-muted-foreground">Sentences</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl text-center">
              <div className="text-lg font-bold">{stats.syllables}</div>
              <div className="text-xs text-muted-foreground">Syllables</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl text-center">
              <div className="text-lg font-bold">{stats.complexWords}</div>
              <div className="text-xs text-muted-foreground">Complex Words</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied!"); }} className="rounded-xl text-xs gap-1"><Copy className="h-3 w-3" />Copy</Button>
        <Button variant="outline" size="sm" onClick={() => setText("")} className="rounded-xl text-xs gap-1"><Trash2 className="h-3 w-3" />Clear</Button>
      </div>
    </div>
  );
}