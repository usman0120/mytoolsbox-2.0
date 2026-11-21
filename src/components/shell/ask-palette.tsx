"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowRight, Clock, Heart, Loader2, Moon, Search, Sparkles, Sun, Workflow } from "lucide-react";
import { runAiTask } from "@/lib/ai/tasks-client";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { loadSearchIndex, searchTools, type SearchDoc } from "@/tools/search";
import { SPACES } from "@/spaces";
import { SpaceGlyph } from "./space-glyph";
import type { SpaceId } from "@/spaces";
import { useShell } from "./shell-store";
import { spaceHref } from "./space-links";

const EXAMPLES = ["compress a photo to 100 KB", "merge PDFs", "format JSON", "loan EMI", "solve 2x + 5 = 13"];

/** Ask bar: Ctrl/⌘ + K. Local search over tools, apps, Spaces and actions; works offline. */
export function AskPalette() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const open = useShell((s) => s.askOpen);
  const setOpen = useShell((s) => s.setAsk);
  const setTray = useShell((s) => s.setTray);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchDoc[]>([]);
  const askQuery = useShell((s) => s.askQuery);
  const [ai, setAi] = useState<{ query: string; state: "loading" | "done" | "error"; toolId?: string | null; reason?: string; error?: string } | null>(null);

  // Load the search index on first open; take any pre-filled query.
  useEffect(() => {
    if (!open) return;
    let active = true;
    void loadSearchIndex().then((docs) => active && setIndex(docs));
    if (askQuery) queueMicrotask(() => setQuery(askQuery));
    return () => {
      active = false;
    };
  }, [open, askQuery]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useShell.getState().askOpen);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => (q.length >= 2 ? searchTools(index, q, 8) : []), [index, q]);
  const spaces = SPACES.filter((s) => !q || `${s.name} ${s.tagline}`.toLowerCase().includes(q));
  const actions = [
    {
      id: "theme",
      label: resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      icon: resolvedTheme === "dark" ? Sun : Moon,
      run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      words: "dark light mode theme",
    },
    { id: "tray", label: "Open File Tray", icon: Workflow, run: () => setTray(true), words: "tray files" },
    { id: "flows", label: "Open Workflows", icon: Workflow, run: () => router.push("/flows"), words: "flows workflows chain" },
    { id: "workspace", label: "Open your workspace", icon: Clock, run: () => router.push("/me"), words: "workspace me account settings" },
    { id: "favorites", label: "Open favorites", icon: Heart, run: () => router.push("/me?tab=favorites"), words: "favorites favourites saved" },
    { id: "history", label: "Open history", icon: Clock, run: () => router.push("/me?tab=history"), words: "history recent" },
  ].filter((a) => !q || `${a.label} ${a.words}`.toLowerCase().includes(q));

  /** Step 2 of the Ask bar: only when local search finds nothing and the user asks for it. */
  const askAi = async () => {
    const text = query.trim();
    setAi({ query: text, state: "loading" });
    try {
      const { data } = await runAiTask<{ toolId: string | null; reason: string }>("ask.intent", text);
      setAi({ query: text, state: "done", toolId: data.toolId, reason: data.reason });
    } catch (e) {
      setAi({ query: text, state: "error", error: e instanceof Error ? e.message : "AI is unavailable right now." });
    }
  };
  const aiPick = ai?.state === "done" && ai.query === query.trim() && ai.toolId ? index.find((d) => d.id === ai.toolId) : undefined;
  const showAskAi = q.length >= 4 && results.length === 0;

  const close = () => {
    setOpen(false);
    setQuery("");
    setAi(null);
    useShell.setState({ askQuery: "" });
  };
  const go = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(o) => (o ? setOpen(true) : close())}
      title="Ask MyToolsBox"
      description="Type a job, like compress a photo to 100 KB"
      className="top-[12vh] max-w-[calc(100%-2rem)] sm:max-w-xl"
    >
      <Command shouldFilter={false} loop>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="What do you need to do?"
        onKeyDown={(e) => {
          if (e.key === "Enter" && q && results.length === 0 && spaces.length === 0 && actions.length === 0) {
            go(`/search?q=${encodeURIComponent(query.trim())}`);
          }
        }}
      />
      <CommandList className="max-h-[min(60vh,440px)]">
        {!showAskAi && (
          <CommandEmpty>
            <span className="block text-sm">Nothing matches “{query}”.</span>
            <span className="mt-1 block text-xs text-muted-foreground">Press Enter to search everything.</span>
          </CommandEmpty>
        )}

        {showAskAi && (
          <CommandGroup heading="Not finding it?">
            {aiPick ? (
              <CommandItem value={`ai:${aiPick.id}`} onSelect={() => go(aiPick.url)}>
                <Sparkles className="text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{aiPick.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{ai?.reason || aiPick.tagline}</span>
                </span>
                <CommandShortcut>Open</CommandShortcut>
              </CommandItem>
            ) : (
              <CommandItem value="ask-ai" onSelect={askAi} disabled={ai?.state === "loading"}>
                {ai?.state === "loading" ? <Loader2 className="animate-spin text-muted-foreground" /> : <Sparkles className="text-muted-foreground" />}
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{ai?.state === "loading" ? "Finding the right tool…" : "Ask AI to find the right tool"}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {ai?.state === "error"
                      ? ai.error
                      : ai?.state === "done" && ai.query === query.trim()
                        ? "No tool fits that yet. Press Enter to search everything."
                        : "Uses 1 of your free daily AI requests"}
                  </span>
                </span>
              </CommandItem>
            )}
          </CommandGroup>
        )}

        {!q && (
          <CommandGroup heading="Try">
            {EXAMPLES.map((ex) => (
              <CommandItem key={ex} value={`example ${ex}`} onSelect={() => setQuery(ex)}>
                <Search className="text-muted-foreground" />
                <span className="text-muted-foreground">{ex}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.length > 0 && (
          <CommandGroup heading="Tools">
            {results.map((r) => (
              <CommandItem key={r.id} value={r.id} onSelect={() => go(r.url)}>
                <span style={{ color: SPACES.find((s) => s.id === r.space)?.color }}>
                  <SpaceGlyph space={r.space as SpaceId} className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{r.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{r.tagline}</span>
                </span>
                {r.ai && <CommandShortcut>AI</CommandShortcut>}
              </CommandItem>
            ))}
            <CommandItem value="see-all" onSelect={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}>
              <ArrowRight className="text-muted-foreground" />
              <span>See all results for “{query.trim()}”</span>
            </CommandItem>
          </CommandGroup>
        )}

        {spaces.length > 0 && (
          <CommandGroup heading="Spaces">
            {spaces.map((s) => (
              <CommandItem key={s.id} value={`space:${s.id}`} onSelect={() => go(spaceHref(s.id))}>
                <span style={{ color: s.color }}>
                  <SpaceGlyph space={s.id} className="size-4" />
                </span>
                <span className="font-medium">{s.name}</span>
                <span className="truncate text-xs text-muted-foreground">{s.tagline}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {actions.length > 0 && (
          <CommandGroup heading="Actions">
            {actions.map((a) => (
              <CommandItem
                key={a.id}
                value={`action:${a.id}`}
                onSelect={() => {
                  close();
                  a.run();
                }}
              >
                <a.icon className="text-muted-foreground" />
                {a.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      </Command>
      <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
        <span>Runs on this device. No sign-up.</span>
        <span className="hidden gap-3 sm:flex">
          <span><kbd className="font-mono">↑↓</kbd> move</span>
          <span><kbd className="font-mono">↵</kbd> open</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
        </span>
      </div>
    </CommandDialog>
  );
}
