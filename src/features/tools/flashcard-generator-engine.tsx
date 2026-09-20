"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  generateDeckId, generateCardId, shuffleCards, getMasteryStats,
  parseFlashcardsFromText, SAMPLE_DECKS,
  type Flashcard, type FlashcardDeck,
} from "@/features/tools/flashcard-generator";
import { Plus, Trash2, RotateCcw, Check, X, ChevronLeft, ChevronRight, Upload } from "lucide-react";

export function FlashcardGeneratorEngine() {
  const [deck, setDeck] = useState<FlashcardDeck>({
    id: generateDeckId(),
    title: "My Flashcards",
    cards: [
      { id: generateCardId(), front: "", back: "", mastered: false },
    ],
    createdAt: new Date().toISOString(),
  });
  const [mode, setMode] = useState<"edit" | "study">("edit");
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [bulkInput, setBulkInput] = useState("");

  const updateCard = (index: number, field: "front" | "back", value: string) => {
    setDeck(prev => {
      const cards = [...prev.cards];
      cards[index] = { ...cards[index], [field]: value };
      return { ...prev, cards };
    });
  };

  const addCard = () => {
    setDeck(prev => ({
      ...prev,
      cards: [...prev.cards, { id: generateCardId(), front: "", back: "", mastered: false }],
    }));
  };

  const removeCard = (index: number) => {
    if (deck.cards.length <= 1) return;
    setDeck(prev => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index),
    }));
  };

  const importBulk = () => {
    const cards = parseFlashcardsFromText(bulkInput);
    if (cards.length > 0) {
      setDeck(prev => ({
        ...prev,
        cards: [...prev.cards.filter(c => c.front || c.back), ...cards],
      }));
      setBulkInput("");
    }
  };

  const startStudy = () => {
    const validCards = deck.cards.filter(c => c.front && c.back);
    if (validCards.length === 0) return;
    setStudyCards(shuffleCards(validCards));
    setCurrentCard(0);
    setIsFlipped(false);
    setMode("study");
  };

  const flipCard = () => setIsFlipped(!isFlipped);

  const markMastered = () => {
    const card = studyCards[currentCard];
    setDeck(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.id === card.id ? { ...c, mastered: true } : c),
    }));
    setStudyCards(prev => prev.map(c => c.id === card.id ? { ...c, mastered: true } : c));
    nextCard();
  };

  const markReview = () => {
    const card = studyCards[currentCard];
    setDeck(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.id === card.id ? { ...c, mastered: false } : c),
    }));
    setStudyCards(prev => prev.map(c => c.id === card.id ? { ...c, mastered: false } : c));
    nextCard();
  };

  const nextCard = () => {
    if (currentCard < studyCards.length - 1) {
      setCurrentCard(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const loadSample = (key: string) => {
    const sample = SAMPLE_DECKS[key];
    if (sample) setDeck({ ...sample, id: generateDeckId(), createdAt: new Date().toISOString() });
  };

  const stats = getMasteryStats(deck.cards);

  return (
    <div className="space-y-4">
      {mode === "edit" ? (
        <>
          {/* Sample decks */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(SAMPLE_DECKS).map(key => (
              <Button key={key} variant="outline" size="sm" className="text-xs h-7" onClick={() => loadSample(key)}>
                {SAMPLE_DECKS[key].title}
              </Button>
            ))}
          </div>

          {/* Title */}
          <div>
            <Label className="text-xs mb-1 block">Deck Title</Label>
            <Input
              value={deck.title}
              onChange={e => setDeck(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Bulk import */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Upload className="h-4 w-4" /> Bulk Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                value={bulkInput}
                onChange={e => setBulkInput(e.target.value)}
                className="font-mono text-xs min-h-15"
                placeholder="Front | Back&#10;Front : Back&#10;Front - Back"
              />
              <Button onClick={importBulk} variant="outline" size="sm" className="gap-2">
                <Plus className="h-3.5 w-3.5" /> Import Cards
              </Button>
            </CardContent>
          </Card>

          {/* Cards */}
          <div className="space-y-3">
            {deck.cards.map((card, ci) => (
              <Card key={card.id}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Card {ci + 1}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCard(ci)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    value={card.front}
                    onChange={e => updateCard(ci, "front", e.target.value)}
                    placeholder="Front (question/term)"
                    className="text-sm h-8"
                  />
                  <Input
                    value={card.back}
                    onChange={e => updateCard(ci, "back", e.target.value)}
                    placeholder="Back (answer/definition)"
                    className="text-sm h-8"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={addCard} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Add Card
            </Button>
            <Button onClick={startStudy} className="gap-2" disabled={!deck.cards.some(c => c.front && c.back)}>
              Study ({deck.cards.filter(c => c.front && c.back).length} cards)
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between">
            <Badge variant="outline">Card {currentCard + 1} of {studyCards.length}</Badge>
            <span className="text-xs text-muted-foreground">
              {stats.mastered} mastered ({stats.percent}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{ width: `${((currentCard + 1) / studyCards.length) * 100}%` }}
            />
          </div>

          {/* Flashcard */}
          <div
            className="relative min-h-50 cursor-pointer perspective-1000"
            onClick={flipCard}
          >
            <Card className={`w-full min-h-50 flex items-center justify-center p-6 transition-all duration-300 ${isFlipped ? "bg-green-500/10 border-green-500/30" : "bg-card"}`}>
              <CardContent className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  {isFlipped ? "Answer" : "Question"} (click to flip)
                </p>
                <p className="text-lg font-medium">
                  {isFlipped ? studyCards[currentCard].back : studyCards[currentCard].front}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          {isFlipped && (
            <div className="flex justify-center gap-3">
              <Button onClick={markReview} variant="outline" className="gap-2 text-red-400">
                <X className="h-4 w-4" /> Review Again
              </Button>
              <Button onClick={markMastered} className="gap-2 text-green-400">
                <Check className="h-4 w-4" /> Mastered
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button onClick={prevCard} variant="outline" disabled={currentCard === 0}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button onClick={() => { setMode("edit"); setIsFlipped(false); }} variant="ghost" className="gap-2">
              <RotateCcw className="h-4 w-4" /> Edit Deck
            </Button>
            <Button onClick={nextCard} variant="outline" disabled={currentCard === studyCards.length - 1}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}