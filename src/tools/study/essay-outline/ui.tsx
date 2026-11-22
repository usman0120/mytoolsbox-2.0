"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AiMarkdown } from "@/components/ai/ai-markdown";
import { streamAiTask } from "@/lib/ai/tasks-client";
import { download } from "@/lib/image/canvas";
import { useSavedItem } from "@/lib/workspace/use-saved-item";

const TYPES: [string, string][] = [
  ["argumentative", "Argumentative"],
  ["persuasive", "Persuasive"],
  ["expository", "Expository (explain)"],
  ["compare-contrast", "Compare and contrast"],
  ["cause-effect", "Cause and effect"],
  ["research", "Research paper"],
  ["narrative", "Narrative"],
];
const LEVELS: [string, string][] = [
  ["school", "School"],
  ["college", "College / A-level"],
  ["university", "University"],
  ["graduate", "Postgraduate"],
];
const EXAMPLES = ["Should homework be banned in primary schools?", "The impact of social media on teenage mental health", "Renewable energy in developing countries"];

export function EssayOutline() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("argumentative");
  const [level, setLevel] = useState("university");
  const [words, setWords] = useState("1500");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const { save, saving } = useSavedItem("ai", "study.essay-outline", () => undefined);

  const run = async () => {
    if (!topic.trim()) return;
    abort.current?.abort();
    const ctl = new AbortController();
    abort.current = ctl;
    setBusy(true);
    setOut("");
    try {
      const { text } = await streamAiTask("essay.outline", topic, { type, level, words }, setOut, ctl.signal);
      setOut(text);
    } catch (e) {
      if (!ctl.signal.aborted) toast.error(e instanceof Error ? e.message : "Couldn't write the outline. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form
        className="space-y-4 self-start rounded-xl border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="topic">Essay question or topic</Label>
          <textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Paste the question from your assignment, plus any requirements"
            className="w-full resize-y rounded-lg border bg-background px-3 py-2 text-[15px] outline-none focus-visible:border-foreground/40"
          />
          {!topic && (
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button key={ex} type="button" onClick={() => setTopic(ex)} className="rounded-full border px-2.5 py-1 text-left text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground">
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="type">Essay type</Label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-full rounded-lg border bg-background px-2 text-sm">
              {TYPES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="level">Level</Label>
            <select id="level" value={level} onChange={(e) => setLevel(e.target.value)} className="h-10 w-full rounded-lg border bg-background px-2 text-sm">
              {LEVELS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="words">Length</Label>
            <select id="words" value={words} onChange={(e) => setWords(e.target.value)} className="h-10 w-full rounded-lg border bg-background px-2 text-sm">
              {["500", "1000", "1500", "2000", "3000", "5000"].map((w) => (
                <option key={w} value={w}>
                  {Number(w).toLocaleString("en-US")} words
                </option>
              ))}
            </select>
          </div>
        </div>
        {busy ? (
          <Button type="button" variant="outline" className="w-full" onClick={() => abort.current?.abort()}>
            Stop
          </Button>
        ) : (
          <Button type="submit" className="w-full" disabled={!topic.trim()}>
            Create outline
          </Button>
        )}
        <p className="text-xs leading-5 text-muted-foreground">An outline to plan your own essay, not a finished essay. It suggests the kinds of sources to find; it never invents citations.</p>
      </form>

      <section className="min-w-0 rounded-xl border bg-card" aria-live="polite">
        {out ? (
          <>
            <div className="flex flex-wrap justify-end gap-1 border-b p-2">
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => navigator.clipboard.writeText(out).then(() => toast.success("Outline copied"))}>
                Copy
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => download(new Blob([out], { type: "text/markdown" }), "essay-outline.md")}>
                Download
              </Button>
              <Button size="sm" variant="ghost" disabled={busy || saving} onClick={() => save(`Outline: ${topic.slice(0, 80)}`, out, { asNew: true })}>
                Save
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={run}>
                Regenerate
              </Button>
            </div>
            <AiMarkdown text={out} className="p-5" />
          </>
        ) : (
          <div className="flex min-h-64 items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {busy ? "Planning your essay…" : "Your outline appears here: thesis, sections with points and evidence to find, and a word budget."}
          </div>
        )}
      </section>
    </div>
  );
}
