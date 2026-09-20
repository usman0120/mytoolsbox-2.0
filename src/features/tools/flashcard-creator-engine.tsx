"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Layers, Loader2, Copy, CheckCircle2, XCircle, Plus,
  Trash2, Shuffle, ChevronLeft, ChevronRight, RotateCcw,
} from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export function FlashcardCreatorEngine() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [frontInput, setFrontInput] = useState("");
  const [backInput, setBackInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCard = useCallback(() => {
    if (!frontInput.trim() || !backInput.trim()) {
      setError("Both front and back text are required.");
      return;
    }

    const newCard: Flashcard = {
      id: crypto.randomUUID(),
      front: frontInput.trim(),
      back: backInput.trim(),
    };

    setCards((prev) => [...prev, newCard]);
    setFrontInput("");
    setBackInput("");
    setError(null);
    toast.success("Card added!");
  }, [frontInput, backInput]);

  const removeCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (currentIndex >= cards.length - 1) {
      setCurrentIndex(Math.max(0, cards.length - 2));
    }
    toast.success("Card removed.");
  }, [cards.length, currentIndex]);

  const startStudy = useCallback(() => {
    if (cards.length === 0) {
      setError("Add at least one card to start studying.");
      return;
    }
    setIsStudyMode(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setError(null);
  }, [cards.length]);

  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, cards.length]);

  const prevCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const shuffleCards = useCallback(() => {
    setCards((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.success("Cards shuffled!");
  }, []);

  const exportCards = useCallback(() => {
    const data = cards.map((c) => `${c.front}\t${c.back}`).join("\n");
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flashcards.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Flashcards exported!");
  }, [cards]);

  if (isStudyMode && cards.length > 0) {
    const currentCard = cards[currentIndex];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Study Mode
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={shuffleCards} className="gap-1.5">
              <Shuffle className="h-3.5 w-3.5" />
              Shuffle
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsStudyMode(false)}>
              <RotateCcw className="h-3.5 w-3.5" />
              Edit Cards
            </Button>
          </div>
        </div>

        {/* Flashcard */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="cursor-pointer perspective-1000"
        >
          <div
            className={`relative min-h-[250px] rounded-xl border-2 transition-all duration-500 transform-style-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
          >
            <div className={`absolute inset-0 flex items-center justify-center p-6 backface-hidden ${isFlipped ? "invisible" : ""}`}>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">FRONT</p>
                <p className="text-lg font-medium">{currentCard.front}</p>
              </div>
            </div>
            <div className={`absolute inset-0 flex items-center justify-center p-6 bg-primary/5 rounded-xl backface-hidden rotate-y-180 ${!isFlipped ? "invisible" : ""}`}>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">BACK</p>
                <p className="text-lg">{currentCard.back}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">Click card to flip</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {cards.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextCard}
            disabled={currentIndex === cards.length - 1}
            className="gap-1.5"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <Layers className="h-3.5 w-3.5" /> Flashcard Creator
      </Badge>

      {/* Add card form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Flashcard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Front (Question/Term)</label>
            <Textarea
              value={frontInput}
              onChange={(e) => setFrontInput(e.target.value)}
              placeholder="Enter the question or term..."
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Back (Answer/Definition)</label>
            <Textarea
              value={backInput}
              onChange={(e) => setBackInput(e.target.value)}
              placeholder="Enter the answer or definition..."
              className="min-h-[80px]"
            />
          </div>
          <Button onClick={addCard} className="w-full gap-1.5">
            <Plus className="h-4 w-4" />
            Add Card
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

      {/* Card list */}
      {cards.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Your Cards ({cards.length})</CardTitle>
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" onClick={shuffleCards} className="gap-1.5">
                  <Shuffle className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={exportCards} className="gap-1.5">
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {cards.map((card, idx) => (
                <div key={card.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                  <span className="text-xs text-muted-foreground w-6 pt-0.5">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{card.front}</p>
                    <p className="text-xs text-muted-foreground truncate">{card.back}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive shrink-0"
                    onClick={() => removeCard(card.id)}
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
        onClick={startStudy}
        disabled={cards.length === 0}
        className="w-full gap-2"
        variant="default"
      >
        <Layers className="h-4 w-4" />
        Start Studying ({cards.length} cards)
      </Button>
    </div>
  );
}