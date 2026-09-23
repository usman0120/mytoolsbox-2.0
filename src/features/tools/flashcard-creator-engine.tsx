"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, Trash2, Shuffle, ChevronLeft, ChevronRight, RotateCcw, Download, Upload, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Card {
  id: string;
  front: string;
  back: string;
  hint?: string;
  color?: string;
}

const CARD_COLORS = [
  { label: "Default", value: "bg-background" },
  { label: "Blue",    value: "bg-blue-50 dark:bg-blue-950/30" },
  { label: "Green",   value: "bg-green-50 dark:bg-green-950/30" },
  { label: "Yellow",  value: "bg-yellow-50 dark:bg-yellow-950/30" },
  { label: "Purple",  value: "bg-purple-50 dark:bg-purple-950/30" },
];

const CONFIDENCE = [
  { label: "Again", value: 1, cls: "border-red-400/40 hover:bg-red-500/10 text-red-400" },
  { label: "Hard",  value: 2, cls: "border-orange-400/40 hover:bg-orange-500/10 text-orange-400" },
  { label: "Good",  value: 3, cls: "border-cyan-400/40 hover:bg-cyan-500/10 text-cyan-400" },
  { label: "Easy",  value: 4, cls: "border-green-400/40 hover:bg-green-500/10 text-green-400" },
];

function genId() { return `card_${Math.random().toString(36).slice(2, 10)}`; }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function FlashcardCreatorEngine() {
  const [cards, setCards] = useState<Card[]>([
    { id: genId(), front: "What is the speed of light?", back: "299,792,458 m/s (~3×10⁸ m/s)", hint: "Think: c" },
    { id: genId(), front: "What year did WWII end?", back: "1945", hint: "Allied victory in Europe: May" },
    { id: genId(), front: "Photosynthesis equation", back: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂" },
  ]);
  const [mode, setMode] = useState<"edit" | "study">("edit");
  const [studyDeck, setStudyDeck] = useState<Card[]>([]);
  const [current, setCurrent] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [confidenceLog, setConfidenceLog] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showKeymap, setShowKeymap] = useState(false);

  // Keyboard shortcuts during study
  useEffect(() => {
    if (mode !== "study") return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " " || e.key === "f") { e.preventDefault(); setIsFlipped(p => !p); }
      if (e.key === "ArrowRight" || e.key === "n") nextCard();
      if (e.key === "ArrowLeft" || e.key === "p") prevCard();
      if (isFlipped) {
        if (e.key === "1") logConfidence(1);
        if (e.key === "2") logConfidence(2);
        if (e.key === "3") logConfidence(3);
        if (e.key === "4") logConfidence(4);
      }
      if (e.key === "h" || e.key === "?") setShowHint(p => !p);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const nextCard = useCallback(() => {
    if (current < studyDeck.length - 1) { setCurrent(p => p + 1); setIsFlipped(false); setShowHint(false); }
  }, [current, studyDeck.length]);

  const prevCard = useCallback(() => {
    if (current > 0) { setCurrent(p => p - 1); setIsFlipped(false); setShowHint(false); }
  }, [current]);

  const logConfidence = (v: number) => {
    setConfidenceLog(prev => { const next = [...prev]; next[current] = v; return next; });
    nextCard();
  };

  const startStudy = () => {
    const valid = cards.filter(c => c.front && c.back);
    if (valid.length === 0) { toast.error("Add at least one complete card."); return; }
    setStudyDeck(valid);
    setConfidenceLog([]);
    setCurrent(0);
    setIsFlipped(false);
    setShowHint(false);
    setMode("study");
  };

  const shuffleStudy = () => {
    setStudyDeck(shuffle(studyDeck));
    setCurrent(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const addCard = () => setCards(prev => [...prev, { id: genId(), front: "", back: "", hint: "" }]);
  const removeCard = (id: string) => { if (cards.length > 1) setCards(prev => prev.filter(c => c.id !== id)); };
  const updateCard = (id: string, field: keyof Card, value: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const exportCards = () => {
    const text = cards.map(c => `${c.front}\t${c.back}${c.hint ? `\t${c.hint}` : ""}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "flashcards.tsv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Cards exported as TSV!");
  };

  const importCards = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const imported: Card[] = text.split("\n").filter(Boolean).map(line => {
        const [front, back, hint] = line.split("\t");
        return { id: genId(), front: front?.trim() || "", back: back?.trim() || "", hint: hint?.trim() };
      }).filter(c => c.front && c.back);
      if (imported.length > 0) {
        setCards(prev => [...prev.filter(c => c.front || c.back), ...imported]);
        toast.success(`Imported ${imported.length} cards!`);
      } else {
        toast.error("Could not parse file. Expected: front\tback format.");
      }
    };
    reader.readAsText(file);
  };

  if (mode === "study" && studyDeck.length > 0) {
    const card = studyDeck[current];
    const avgConf = confidenceLog.length > 0
      ? (confidenceLog.reduce((a, b) => a + b, 0) / confidenceLog.length).toFixed(1)
      : null;

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge variant="outline">{current + 1} / {studyDeck.length}</Badge>
          <div className="flex gap-2">
            {avgConf && <Badge variant="secondary" className="text-xs">Avg confidence: {avgConf}/4</Badge>}
            <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={() => setShowKeymap(p => !p)}>
              <Keyboard className="h-3.5 w-3.5" /> Keys
            </Button>
            <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={shuffleStudy}>
              <Shuffle className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setMode("edit")}>← Edit</Button>
          </div>
        </div>

        {showKeymap && (
          <Card className="bg-muted/30">
            <CardContent className="pt-3 pb-3 text-[10px] font-mono grid grid-cols-2 gap-1 text-muted-foreground">
              <span><kbd>Space</kbd> / <kbd>F</kbd> — Flip card</span>
              <span><kbd>→</kbd> / <kbd>N</kbd> — Next card</span>
              <span><kbd>←</kbd> / <kbd>P</kbd> — Previous card</span>
              <span><kbd>H</kbd> — Toggle hint</span>
              <span><kbd>1–4</kbd> — Rate confidence (when flipped)</span>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <div className="h-1.5 bg-muted rounded-full">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((current + 1) / studyDeck.length) * 100}%` }} />
        </div>

        {/* Card */}
        <div className="cursor-pointer" onClick={() => { setIsFlipped(p => !p); setShowHint(false); }}>
          <Card className={`min-h-56 flex items-center justify-center transition-all border-2 ${
            isFlipped ? "border-primary/50" : "border-border"
          } ${card.color || ""}`}>
            <CardContent className="py-10 text-center space-y-3">
              <Badge variant="secondary" className="text-[9px]">
                {isFlipped ? "↙ Answer" : "↗ Question"}
              </Badge>
              <p className="text-xl font-semibold">{isFlipped ? card.back : card.front}</p>
              {!isFlipped && showHint && card.hint && (
                <p className="text-xs text-muted-foreground italic">💡 {card.hint}</p>
              )}
              {!isFlipped && card.hint && !showHint && (
                <button className="text-[10px] text-primary/70 underline" onClick={e => { e.stopPropagation(); setShowHint(true); }}>Show hint</button>
              )}
              {!isFlipped && <p className="text-[10px] text-muted-foreground">Click or press Space to flip</p>}
            </CardContent>
          </Card>
        </div>

        {/* Confidence rating (shown after flip) */}
        {isFlipped && (
          <div className="grid grid-cols-4 gap-2">
            {CONFIDENCE.map(c => (
              <Button
                key={c.value}
                variant="outline"
                size="sm"
                className={`text-xs gap-1.5 ${c.cls}`}
                onClick={() => logConfidence(c.value)}
              >
                [{c.value}] {c.label}
              </Button>
            ))}
          </div>
        )}

        <div className="flex gap-2 justify-between">
          <Button variant="outline" size="sm" disabled={current === 0} onClick={prevCard}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={nextCard} disabled={current === studyDeck.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {current === studyDeck.length - 1 && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">🎉 End of deck</p>
            <Button size="sm" variant="outline" onClick={() => { setCurrent(0); setIsFlipped(false); }} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Restart
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Label className="text-sm font-semibold">Card Studio ({cards.length} cards)</Label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={exportCards}>
            <Download className="h-3 w-3" /> Export TSV
          </Button>
          <label className="cursor-pointer inline-flex items-center gap-1 h-7 px-3 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
            <Upload className="h-3 w-3" /> Import TSV
            <input type="file" accept=".tsv,.txt,.csv" className="hidden" onChange={importCards} />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        {cards.map((card, i) => (
          <Card key={card.id} className="p-0">
            <CardContent className="pt-2 pb-2">
              <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-1 pt-2">
                  <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                </div>
                <div className="col-span-4">
                  {i === 0 && <Label className="text-[10px] mb-1 block text-muted-foreground">Front</Label>}
                  <Textarea
                    value={card.front}
                    onChange={e => updateCard(card.id, "front", e.target.value)}
                    placeholder="Question / Term"
                    className="text-xs min-h-10 resize-none"
                  />
                </div>
                <div className="col-span-4">
                  {i === 0 && <Label className="text-[10px] mb-1 block text-muted-foreground">Back</Label>}
                  <Textarea
                    value={card.back}
                    onChange={e => updateCard(card.id, "back", e.target.value)}
                    placeholder="Answer / Definition"
                    className="text-xs min-h-10 resize-none"
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <Label className="text-[10px] mb-1 block text-muted-foreground">Hint</Label>}
                  <Input
                    value={card.hint || ""}
                    onChange={e => updateCard(card.id, "hint", e.target.value)}
                    placeholder="Optional hint"
                    className="h-7 text-xs"
                  />
                </div>
                <div className="col-span-1 pt-2 flex justify-end">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCard(card.id)}>
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={addCard}>
          <Plus className="h-3.5 w-3.5" /> Add Card
        </Button>
        <Button onClick={startStudy} className="gap-2">
          Study Now →
        </Button>
      </div>
    </div>
  );
}