"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Segmented } from "@/components/tools/file-drop";
import { runAiTask } from "@/lib/ai/tasks-client";
import { download } from "@/lib/image/canvas";
import { cn } from "@/lib/utils";
import { NEW_STATE, nextLabel, parseCards, queue, review, toCsv, type Card, type Grade } from "./engine";

const KEY = "flashcards:v1";
type Deck = { id: string; name: string; cards: Card[] };
type Store = { decks: Deck[]; active: string };

const uid = () => Math.random().toString(36).slice(2, 10);
const SAMPLE: Deck = {
  id: "sample",
  name: "Biology basics (sample)",
  cards: [
    ["What is the basic unit of life?", "The cell"],
    ["Where is most ATP made in a eukaryotic cell?", "In the mitochondria"],
    ["What does DNA stand for?", "Deoxyribonucleic acid"],
    ["What process do plants use to make glucose?", "Photosynthesis"],
    ["Which organelle contains the cell's genetic material?", "The nucleus"],
  ].map(([front, back]) => ({ ...NEW_STATE, id: uid(), front, back })),
};

function load(): Store {
  // Client-only component (see ui-registry), so storage can seed the state.
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "null") as Store | null;
    if (s?.decks?.length) return s;
  } catch {}
  return { decks: [SAMPLE], active: SAMPLE.id };
}

/** Current time in state (refreshed every 30 s) so due counts stay correct without reading the clock during render. */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

const GRADES: { g: Grade; label: string; cls: string }[] = [
  { g: 1, label: "Again", cls: "border-red-500/40 hover:bg-red-500/10" },
  { g: 2, label: "Hard", cls: "border-amber-500/40 hover:bg-amber-500/10" },
  { g: 3, label: "Good", cls: "border-emerald-500/40 hover:bg-emerald-500/10" },
  { g: 4, label: "Easy", cls: "border-sky-500/40 hover:bg-sky-500/10" },
];

export function FlashcardCreatorEngine() {
  const [store, setStore] = useState<Store>(load);
  const [mode, setMode] = useState<"study" | "edit">("study");
  const deck = store.decks.find((d) => d.id === store.active) ?? store.decks[0];

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
    } catch {
      toast.error("Couldn't save cards in this browser (storage is full or blocked).");
    }
  }, [store]);

  const updateDeck = useCallback((fn: (d: Deck) => Deck) => setStore((s) => ({ ...s, decks: s.decks.map((d) => (d.id === s.active ? fn(d) : d)) })), []);

  const now = useNow();
  const due = deck.cards.filter((c) => c.due > 0 && c.due <= now).length;
  const fresh = deck.cards.filter((c) => c.due === 0).length;

  const newDeck = () => {
    const name = window.prompt("Name the new deck", "New deck");
    if (!name?.trim()) return;
    const d: Deck = { id: uid(), name: name.trim().slice(0, 80), cards: [] };
    setStore((s) => ({ decks: [...s.decks, d], active: d.id }));
    setMode("edit");
  };
  const renameDeck = () => {
    const name = window.prompt("Rename deck", deck.name);
    if (name?.trim()) updateDeck((d) => ({ ...d, name: name.trim().slice(0, 80) }));
  };
  const deleteDeck = () => {
    if (!window.confirm(`Delete "${deck.name}" and its ${deck.cards.length} cards? This can't be undone.`)) return;
    setStore((s) => {
      const decks = s.decks.filter((d) => d.id !== deck.id);
      return decks.length ? { decks, active: decks[0].id } : { decks: [{ id: uid(), name: "My deck", cards: [] }], active: "" };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Deck" value={deck.id} onChange={(e) => setStore((s) => ({ ...s, active: e.target.value }))} className="h-9 min-w-0 max-w-xs flex-1 rounded-lg border bg-background px-2 text-sm font-medium">
          {store.decks.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.cards.length})
            </option>
          ))}
        </select>
        <Button variant="ghost" size="sm" onClick={newDeck}>
          New deck
        </Button>
        <Button variant="ghost" size="sm" onClick={renameDeck}>
          Rename
        </Button>
        <Button variant="ghost" size="sm" onClick={deleteDeck}>
          Delete
        </Button>
        <div className="ml-auto w-48">
          <Segmented
            label="Mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "study", label: "Study" },
              { value: "edit", label: "Edit cards" },
            ]}
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {deck.cards.length} cards · <span className="text-foreground">{due} due</span> · {fresh} new
      </p>

      {mode === "study" ? <Study key={deck.id} deck={deck} onUpdate={updateDeck} onEdit={() => setMode("edit")} /> : <Edit deck={deck} onUpdate={updateDeck} />}
    </div>
  );
}

function Study({ deck, onUpdate, onEdit }: { deck: Deck; onUpdate: (fn: (d: Deck) => Deck) => void; onEdit: () => void }) {
  // The session queue is fixed when it starts; cards marked Again or Hard come back at the end.
  const [ids, setIds] = useState<string[]>(() => queue(deck.cards, Date.now()).map((c) => c.id));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const card = deck.cards.find((c) => c.id === ids[pos]);
  const now = useNow();

  const grade = useCallback(
    (g: Grade) => {
      if (!card || !flipped) return;
      const next = review(card, g, Date.now());
      onUpdate((d) => ({ ...d, cards: d.cards.map((c) => (c.id === card.id ? { ...c, ...next } : c)) }));
      if (next.interval === 0) setIds((q) => [...q, card.id]);
      setPos((p) => p + 1);
      setFlipped(false);
      setReviewed((n) => n + 1);
    },
    [card, flipped, onUpdate],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped(true);
      } else if (["1", "2", "3", "4"].includes(e.key)) grade(Number(e.key) as Grade);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [grade]);

  if (!deck.cards.length) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-10 text-center">
        <p className="font-semibold">This deck has no cards yet</p>
        <Button className="mt-4" onClick={onEdit}>
          Add cards
        </Button>
      </div>
    );
  }

  if (!card) {
    const nextDue = deck.cards.filter((c) => c.due > now).sort((a, b) => a.due - b.due)[0];
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <p className="text-lg font-semibold">{reviewed ? `Done: ${reviewed} reviews` : "Nothing due right now"}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {nextDue ? `Next card is due ${new Date(nextDue.due).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}.` : "Add more cards to keep learning."}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setIds(deck.cards.map((c) => c.id));
            setPos(0);
          }}
        >
          Review all cards anyway
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2 flex justify-between text-xs text-muted-foreground">
        <span>
          Card {pos + 1} of {ids.length}
        </span>
        <span>{card.due === 0 ? "New" : card.interval === 0 ? "Learning" : `Interval ${card.interval} d`}</span>
      </div>
      <button
        type="button"
        onClick={() => setFlipped(true)}
        className="flex min-h-64 w-full flex-col items-center justify-center rounded-xl border bg-card px-6 py-10 text-center"
        aria-label={flipped ? "Answer shown" : "Show answer"}
      >
        <p className="text-xl leading-relaxed font-medium whitespace-pre-wrap">{card.front}</p>
        {flipped ? (
          <>
            <div className="my-5 h-px w-24 bg-border" />
            <p className="text-lg leading-relaxed whitespace-pre-wrap text-muted-foreground">{card.back}</p>
          </>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">Click or press Space to show the answer</p>
        )}
      </button>
      {flipped && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {GRADES.map(({ g, label, cls }) => (
            <button key={g} type="button" onClick={() => grade(g)} className={cn("rounded-lg border bg-card px-2 py-2.5 text-center", cls)}>
              <span className="block text-sm font-medium">{label}</span>
              <span className="block text-xs text-muted-foreground">
                {nextLabel(card, g, now)} · {g}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Edit({ deck, onUpdate }: { deck: Deck; onUpdate: (fn: (d: Deck) => Deck) => void }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [bulk, setBulk] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const csv = useRef<HTMLInputElement>(null);
  const preview = useMemo(() => parseCards(bulk), [bulk]);

  const add = (cards: { front: string; back: string }[]) => {
    if (!cards.length) return;
    onUpdate((d) => ({ ...d, cards: [...d.cards, ...cards.map((c) => ({ ...NEW_STATE, id: uid(), front: c.front.slice(0, 1000), back: c.back.slice(0, 2000) }))] }));
    toast.success(`Added ${cards.length} card${cards.length > 1 ? "s" : ""}`);
  };

  const fromNotes = async () => {
    if (notes.trim().length < 20) return toast.error("Paste a few sentences of notes, or a topic.");
    setBusy(true);
    try {
      const { data } = await runAiTask<{ cards: { front: string; back: string }[] }>("study.cards", notes, { count: 15 });
      add(data.cards);
      setNotes("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't make cards. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const area = "w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:border-foreground/40";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <form
          className="space-y-3 rounded-xl border bg-card p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!front.trim() || !back.trim()) return;
            add([{ front: front.trim(), back: back.trim() }]);
            setFront("");
            setBack("");
          }}
        >
          <h3 className="text-sm font-semibold">Add a card</h3>
          <div className="space-y-1.5">
            <Label htmlFor="front">Front</Label>
            <textarea id="front" rows={2} value={front} onChange={(e) => setFront(e.target.value)} placeholder="Question or term" className={area} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="back">Back</Label>
            <textarea id="back" rows={2} value={back} onChange={(e) => setBack(e.target.value)} placeholder="Answer or definition" className={area} />
          </div>
          <Button type="submit" disabled={!front.trim() || !back.trim()}>
            Add card
          </Button>
        </form>

        <div className="space-y-2 rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold">Paste many</h3>
          <textarea rows={4} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={"One per line:\nmitosis - cell division into two identical cells\nosmosis: movement of water across a membrane"} className={area} />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{bulk ? `${preview.length} cards found` : "Separate with a tab, dash, colon or comma"}</span>
            <Button size="sm" disabled={!preview.length} onClick={() => (add(preview), setBulk(""))}>
              Add {preview.length || ""}
            </Button>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold">Make cards from notes with AI</h3>
          <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={6000} placeholder="Paste lecture notes or a textbook passage" className={area} />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Uses your daily AI allowance. Check the cards before studying.</span>
            <Button size="sm" disabled={busy || !notes.trim()} onClick={fromNotes}>
              {busy ? "Making cards…" : "Make cards"}
            </Button>
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
          <h3 className="text-sm font-semibold">{deck.cards.length} cards</h3>
          <div className="flex gap-1">
            <input
              ref={csv}
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              className="sr-only"
              tabIndex={-1}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) add(parseCards(await f.text()));
              }}
            />
            <Button size="sm" variant="ghost" onClick={() => csv.current?.click()}>
              Import CSV
            </Button>
            <Button size="sm" variant="ghost" disabled={!deck.cards.length} onClick={() => download(new Blob([toCsv(deck.cards)], { type: "text/csv" }), `${deck.name.replace(/[^\w-]+/g, "-")}.csv`)}>
              Export CSV
            </Button>
          </div>
        </div>
        {deck.cards.length ? (
          <ol className="max-h-[70vh] divide-y overflow-auto">
            {deck.cards.map((c) => (
              <li key={c.id} className="flex gap-3 px-4 py-2.5 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium break-words">{c.front}</p>
                  <p className="break-words text-muted-foreground">{c.back}</p>
                </div>
                <button type="button" aria-label="Delete card" onClick={() => onUpdate((d) => ({ ...d, cards: d.cards.filter((x) => x.id !== c.id) }))} className="self-start rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="p-6 text-sm text-muted-foreground">Add cards on the left, paste a list, or import a CSV.</p>
        )}
      </div>
    </div>
  );
}
