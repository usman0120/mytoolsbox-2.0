"use client";

import { useState } from "react";
import { Plus, Trash2, RotateCcw, Check, X, ChevronLeft, ChevronRight, Upload, Download, Shuffle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  generateDeckId, generateCardId, shuffleCards, getMasteryStats, updateLeitnerBox,
  parseFlashcardsFromText, exportToAnkiTSV, exportToQuizletCSV, SAMPLE_DECKS,
  type Flashcard, type FlashcardDeck, type LeitnerBox,
} from "@/features/tools/flashcard-generator";

export function FlashcardGeneratorEngine() {
  const [deck, setDeck] = useState<FlashcardDeck>({
    id: generateDeckId(),
    title: "My Flashcards",
    cards: [{ id: generateCardId(), front: "", back: "", mastered: false, leitnerBox: 1 }],
    createdAt: new Date().toISOString(),
  });
  const [mode, setMode] = useState<"edit" | "study">("edit");
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [bulkInput, setBulkInput] = useState("");

  const stats = getMasteryStats(deck.cards);

  const updateCard = (index: number, field: "front" | "back" | "hint", value: string) => {
    setDeck(prev => {
      const cards = [...prev.cards];
      cards[index] = { ...cards[index], [field]: value };
      return { ...prev, cards };
    });
  };

  const addCard = () => {
    setDeck(prev => ({
      ...prev,
      cards: [...prev.cards, { id: generateCardId(), front: "", back: "", mastered: false, leitnerBox: 1 }],
    }));
  };

  const removeCard = (index: number) => {
    if (deck.cards.length <= 1) return;
    setDeck(prev => ({ ...prev, cards: prev.cards.filter((_, i) => i !== index) }));
  };

  const importBulk = () => {
    const cards = parseFlashcardsFromText(bulkInput);
    if (cards.length === 0) {
      toast.error("Could not parse cards. Try: Term: Definition  or  Q: question / A: answer");
      return;
    }
    setDeck(prev => ({ ...prev, cards: [...prev.cards.filter(c => c.front || c.back), ...cards] }));
    setBulkInput("");
    toast.success(`Imported ${cards.length} cards!`);
  };

  const loadSample = (key: string) => {
    const sample = SAMPLE_DECKS[key];
    if (sample) setDeck({ ...sample, id: generateDeckId(), createdAt: new Date().toISOString() });
  };

  const startStudy = () => {
    const valid = deck.cards.filter(c => c.front && c.back);
    if (valid.length === 0) { toast.error("Add at least one complete card."); return; }
    setStudyCards(shuffleCards(valid));
    setCurrentCard(0);
    setIsFlipped(false);
    setMode("study");
  };

  const handleLeitner = (correct: boolean) => {
    const card = studyCards[currentCard];
    const updated = updateLeitnerBox(card, correct);
    setStudyCards(prev => prev.map(c => c.id === card.id ? updated : c));
    setDeck(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.id === card.id ? updated : c),
    }));

    toast(correct ? "✅ Promoted!" : "🔄 Back to Box 1", {
      description: correct ? `Next review in ${[1,2,4,8,16][(updated.leitnerBox || 1) - 1]} days` : "Keep practicing!",
    });

    if (currentCard < studyCards.length - 1) {
      setCurrentCard(p => p + 1);
      setIsFlipped(false);
    } else {
      toast.success("Deck complete! 🎉");
      setMode("edit");
    }
  };

  const downloadAnki = () => {
    const content = exportToAnkiTSV(deck);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${deck.title}-anki.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Anki TSV downloaded!");
  };

  const downloadQuizlet = () => {
    const content = exportToQuizletCSV(deck);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${deck.title}-quizlet.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Quizlet CSV downloaded!");
  };

  if (mode === "study" && studyCards.length > 0) {
    const card = studyCards[currentCard];
    const box = card.leitnerBox || 1;
    const boxColors: Record<number, string> = { 1: "text-red-400", 2: "text-orange-400", 3: "text-yellow-400", 4: "text-cyan-400", 5: "text-green-400" };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Card {currentCard + 1} / {studyCards.length}
          </Badge>
          <div className="flex gap-2">
            <Badge variant="outline" className={`text-xs ${boxColors[box]}`}>Box {box}/5</Badge>
            <Button variant="outline" size="sm" onClick={() => setMode("edit")}>← Edit Deck</Button>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-muted rounded-full">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentCard + 1) / studyCards.length) * 100}%` }} />
        </div>

        {/* Flip card */}
        <div className="cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
          <Card className={`min-h-52 flex items-center justify-center transition-all duration-300 border-2 ${isFlipped ? "border-primary/50 bg-primary/5" : "border-border"}`}>
            <CardContent className="py-8 text-center space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {isFlipped ? "Back (Answer)" : "Front (Question)"}
              </p>
              <p className="text-xl font-semibold">
                {isFlipped ? card.back : card.front}
              </p>
              {!isFlipped && card.hint && (
                <p className="text-xs text-muted-foreground mt-2 italic">💡 Hint: {card.hint}</p>
              )}
              {!isFlipped && (
                <p className="text-xs text-muted-foreground mt-4">Click to reveal</p>
              )}
            </CardContent>
          </Card>
        </div>

        {isFlipped ? (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2 border-red-400/30 hover:bg-red-500/10 text-red-400" onClick={() => handleLeitner(false)}>
              <X className="h-4 w-4" /> Still Learning
            </Button>
            <Button className="flex-1 gap-2 bg-green-500 hover:bg-green-600 text-white" onClick={() => handleLeitner(true)}>
              <Check className="h-4 w-4" /> Got It!
            </Button>
          </div>
        ) : (
          <Button className="w-full" variant="outline" onClick={() => setIsFlipped(true)}>
            Flip Card
          </Button>
        )}

        {/* Leitner boxes overview */}
        <div className="flex gap-2 justify-center">
          {([1,2,3,4,5] as LeitnerBox[]).map(b => (
            <div key={b} className="text-center">
              <div className={`text-xs font-bold ${boxColors[b]}`}>{stats.byBox[b]}</div>
              <div className="text-[9px] text-muted-foreground">Box {b}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="cards">
        <TabsList>
          <TabsTrigger value="cards" className="text-xs">Edit Cards</TabsTrigger>
          <TabsTrigger value="import" className="text-xs">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-3 mt-3">
          <p className="text-xs text-muted-foreground">
            Supported formats: <code>Term: Definition</code> | <code>Term | Definition</code> | <code>Q: question / A: answer</code> | <code>Term → Definition</code>
          </p>
          <Textarea
            value={bulkInput}
            onChange={e => setBulkInput(e.target.value)}
            placeholder={"Mitosis: Cell division producing two identical daughter cells\nPhotosynthesis | Process by which plants convert sunlight to food\nQ: Capital of France?\nA: Paris"}
            className="text-xs min-h-36 font-mono"
          />
          <Button onClick={importBulk} className="gap-1.5">
            <Upload className="h-4 w-4" /> Import Cards
          </Button>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4 mt-3">
          {/* Sample decks */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground self-center">Load sample:</span>
            {Object.keys(SAMPLE_DECKS).map(key => (
              <Button key={key} variant="outline" size="sm" className="text-xs h-7" onClick={() => loadSample(key)}>
                {SAMPLE_DECKS[key].title}
              </Button>
            ))}
          </div>

          <div>
            <Label className="text-xs mb-1 block">Deck Title</Label>
            <Input value={deck.title} onChange={e => setDeck(prev => ({ ...prev, title: e.target.value }))} className="h-8 text-sm" />
          </div>

          <div className="space-y-2">
            {deck.cards.map((card, i) => (
              <Card key={card.id} className="p-0">
                <CardContent className="pt-2 pb-2">
                  <div className="grid grid-cols-11 gap-2 items-center">
                    <span className="col-span-1 text-[10px] text-muted-foreground text-center">{i + 1}</span>
                    <div className="col-span-5">
                      {i === 0 && <Label className="text-[10px] mb-1 block text-muted-foreground">Front</Label>}
                      <Input value={card.front} onChange={e => updateCard(i, "front", e.target.value)} placeholder="Term / Question" className="h-7 text-xs" />
                    </div>
                    <div className="col-span-4">
                      {i === 0 && <Label className="text-[10px] mb-1 block text-muted-foreground">Back</Label>}
                      <Input value={card.back} onChange={e => updateCard(i, "back", e.target.value)} placeholder="Definition / Answer" className="h-7 text-xs" />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {i === 0 && <div className="h-[18px]" />}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeCard(i)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button variant="outline" size="sm" className="gap-1 h-8 text-xs" onClick={addCard}>
            <Plus className="h-3.5 w-3.5" /> Add Card
          </Button>
        </TabsContent>
      </Tabs>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>{stats.total} cards</span>
          <span className="text-green-400">{stats.mastered} mastered ({stats.percent}%)</span>
          <span className="text-orange-400">{stats.dueForReview} due for review</span>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button onClick={startStudy} className="gap-2">
          <BookOpen className="h-4 w-4" /> Start Study Session
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={downloadAnki}>
          <Download className="h-3.5 w-3.5" /> Anki TSV
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={downloadQuizlet}>
          <Download className="h-3.5 w-3.5" /> Quizlet CSV
        </Button>
      </div>
    </div>
  );
}