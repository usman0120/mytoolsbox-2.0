"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { deleteUser } from "firebase/auth";
import { ArrowRight, Clock, Copy, Download, LogOut, Star, Trash2, Workflow } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAiQuota } from "@/lib/ai/use-ai-quota";
import { useShell } from "@/components/shell/shell-store";
import { SpaceGlyph } from "@/components/shell/space-glyph";
import { readSavedWorkflows, removeSavedWorkflow, type SavedWorkflow } from "@/flows/storage";
import {
  clearAllHistory,
  deleteAccountData,
  deleteItem,
  exportAccountData,
  listHistory,
  listItems,
  useWorkspace,
  type HistoryEntry,
  type Prefs,
  type SavedItem,
} from "@/lib/workspace/store";
import type { ToolIndexEntry } from "@/tools/catalog";
import type { SpaceId } from "@/spaces";
import { cn } from "@/lib/utils";

type Space = { id: SpaceId; name: string; color: string };
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "favorites", label: "Favorites" },
  { id: "flows", label: "Flows" },
  { id: "saved", label: "Saved" },
  { id: "history", label: "History" },
  { id: "settings", label: "Settings" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const when = (t: number) => {
  const d = (Date.now() - t) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)} min ago`;
  if (d < 86400) return `${Math.floor(d / 3600)} h ago`;
  return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function ToolRow({ tool, space, meta, action }: { tool: ToolIndexEntry; space?: Space; meta?: string; action?: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ color: space?.color, background: `color-mix(in srgb, ${space?.color ?? "var(--muted)"} 14%, transparent)` }}>
        {space && <SpaceGlyph space={space.id} className="size-4" />}
      </span>
      <Link href={tool.url} className="min-w-0 flex-1">
        <span className="block truncate font-medium hover:underline">{tool.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{meta ?? tool.tagline}</span>
      </Link>
      {action}
    </li>
  );
}

function Empty({ title, body, cta }: { title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed px-6 py-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}

const subscribeNoop = () => () => {};

export function WorkspaceClient({ tools, spaces }: { tools: ToolIndexEntry[]; spaces: Space[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tab: TabId = (TABS.find((t) => t.id === params.get("tab"))?.id ?? "overview") as TabId;
  const { user, loading, logOut } = useAuth();
  const setSignIn = useShell((s) => s.setSignIn);
  const { uid, ready, error, favorites, toggleFavorite, doc: userDoc, setPrefs } = useWorkspace();
  const { quota } = useAiQuota();
  const { setTheme } = useTheme();
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const byId = useMemo(() => new Map(tools.map((t) => [t.id, t])), [tools]);
  const spaceOf = useCallback((t: ToolIndexEntry) => spaces.find((s) => s.id === t.space), [spaces]);
  const signedIn = !!user && !user.isAnonymous;

  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [items, setItems] = useState<SavedItem[] | null>(null);
  const [flows, setFlows] = useState<SavedWorkflow[]>([]);
  const [listError, setListError] = useState("");
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    listHistory(uid)
      .then((h) => active && setHistory(h))
      .catch((e: Error) => active && setListError(e.message));
    if (uid) {
      listItems(uid)
        .then((i) => active && setItems(i))
        .catch((e: Error) => active && setListError(e.message));
    }
    // Saved Flows live in this browser's storage (read after hydration).
    queueMicrotask(() => {
      if (!active) return;
      try {
        setFlows(readSavedWorkflows());
      } catch {
        setFlows([]);
      }
    });
    return () => {
      active = false;
    };
  }, [ready, uid]);

  const go = (id: TabId) => router.replace(`${pathname}${id === "overview" ? "" : `?tab=${id}`}`, { scroll: false });

  const recent = useMemo(() => {
    const seen = new Set<string>();
    return (history ?? []).filter((h) => !seen.has(h.toolId) && seen.add(h.toolId) && byId.has(h.toolId)).slice(0, 6);
  }, [history, byId]);

  const exportData = async () => {
    if (!uid) return;
    try {
      const blob = await exportAccountData(uid);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `mytoolsbox-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed. Try again.");
    }
  };

  const deleteAccount = async () => {
    const auth = getFirebaseAuth();
    const current = auth?.currentUser;
    if (!uid || !current) return;
    // Firebase only lets a recent sign-in delete an account. Check first, before removing any data.
    const lastSignIn = Date.parse(current.metadata.lastSignInTime ?? "");
    if (!lastSignIn || Date.now() - lastSignIn > 5 * 60 * 1000) {
      toast.error("For your security, sign out and sign in again, then delete your account within 5 minutes.");
      return;
    }
    setDeleting(true);
    try {
      await deleteAccountData(uid);
      await deleteUser(current);
      toast.success("Your account and data were deleted.");
      router.replace("/");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't delete the account. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  const updatePrefs = async (patch: Partial<Prefs>) => {
    try {
      await setPrefs(patch);
      if (patch.theme) setTheme(patch.theme);
    } catch {
      toast.error("Couldn't save your settings.");
    }
  };

  const favTools = favorites.map((id) => byId.get(id)).filter((t): t is ToolIndexEntry => !!t);

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8 md:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] leading-tight font-bold md:text-[32px]">Your workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading || !hydrated ? " " : signedIn ? `Signed in as ${user?.email ?? user?.displayName ?? "you"}` : "Saved in this browser. Sign in to keep it across devices."}
          </p>
        </div>
        {hydrated && !loading && !signedIn && <Button onClick={() => setSignIn(true)}>Sign in</Button>}
      </header>

      <nav aria-label="Workspace sections" className="mt-6 flex gap-1 overflow-x-auto border-b [scrollbar-width:none]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => go(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            ref={(el) => {
              if (el && tab === t.id) el.scrollIntoView({ block: "nearest", inline: "nearest" });
            }}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {(error || listError) && <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error || listError}</p>}

      <div className="mt-6">
        {tab === "overview" && (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 font-sans text-sm font-semibold text-muted-foreground">Jump back in</h2>
              {history === null ? (
                <div className="h-24 animate-pulse rounded-xl bg-muted" />
              ) : recent.length ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {recent.map((h) => {
                    const t = byId.get(h.toolId)!;
                    const s = spaceOf(t);
                    return (
                      <Link key={h.toolId} href={t.url} className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-foreground/20">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg" style={{ color: s?.color, background: `color-mix(in srgb, ${s?.color} 14%, transparent)` }}>
                          {s && <SpaceGlyph space={s.id} className="size-4" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{t.name}</span>
                          <span className="block text-xs text-muted-foreground">{when(h.at)}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <Empty title="Nothing here yet" body="Tools you open will show up here, so you can pick up where you left off." cta={<Link href="/" className="text-sm font-medium underline underline-offset-4">Find a tool</Link>} />
              )}
            </section>
            <section className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Favorites", value: favorites.length, tab: "favorites" as TabId },
                { label: "Saved Flows", value: flows.length, tab: "flows" as TabId },
                { label: "AI requests left today", value: quota ? `${quota.remaining} of ${quota.limit}` : "—", tab: null },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  disabled={!s.tab}
                  onClick={() => s.tab && go(s.tab)}
                  className="rounded-xl border bg-card p-4 text-left transition-colors enabled:hover:border-foreground/20"
                >
                  <span className="tabular block font-heading text-2xl font-semibold">{s.value}</span>
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                </button>
              ))}
            </section>
          </div>
        )}

        {tab === "favorites" &&
          (favTools.length ? (
            <ul className="divide-y rounded-xl border bg-card">
              {favTools.map((t) => (
                <ToolRow
                  key={t.id}
                  tool={t}
                  space={spaceOf(t)}
                  action={
                    <Button variant="ghost" size="icon" aria-label={`Remove ${t.name} from favorites`} onClick={() => toggleFavorite(t.id).catch(() => toast.error("Couldn't update favorites."))}>
                      <Star className="size-[18px] fill-current text-[var(--color-space-calc)]" />
                    </Button>
                  }
                />
              ))}
            </ul>
          ) : (
            <Empty title="No favorites yet" body="Tap the star on any tool to keep it here." />
          ))}

        {tab === "flows" &&
          (flows.length ? (
            <ul className="divide-y rounded-xl border bg-card">
              {flows.map((f) => (
                <li key={f.workflow.id} className="flex items-center gap-3 px-4 py-3">
                  <Workflow className="size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{f.workflow.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.workflow.steps.length} steps · edited {when(f.updatedAt)}
                    </p>
                  </div>
                  <Link href="/flows" className="text-sm font-medium underline-offset-4 hover:underline">
                    Open
                  </Link>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${f.workflow.name}`} onClick={() => setFlows(removeSavedWorkflow(f.workflow.id))}>
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No saved Flows" body="Build a Flow to chain tools together, then save it to reuse it here." cta={<Link href="/flows" className="text-sm font-medium underline underline-offset-4">Open Flows</Link>} />
          ))}

        {tab === "saved" &&
          (!signedIn ? (
            <Empty title="Sign in to save results" body="Saved AI answers, notes and other results are kept in your account so you can open them on any device." cta={<Button onClick={() => setSignIn(true)}>Sign in</Button>} />
          ) : items === null ? (
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          ) : items.length ? (
            <ul className="divide-y rounded-xl border bg-card">
              {items.map((it) => {
                const t = byId.get(it.toolId);
                return (
                  <li key={it.id} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpenItem(openItem === it.id ? null : it.id)} aria-expanded={openItem === it.id}>
                        <span className="block truncate font-medium">{it.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {t?.name ?? "Saved result"} · {when(it.updatedAt)}
                        </span>
                      </button>
                      <Button variant="ghost" size="icon" aria-label="Copy" onClick={() => navigator.clipboard.writeText(it.content).then(() => toast.success("Copied"))}>
                        <Copy className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${it.title}`}
                        onClick={() => uid && deleteItem(uid, it.id).then(() => setItems((prev) => prev?.filter((x) => x.id !== it.id) ?? null))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    {openItem === it.id && <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap">{it.content}</pre>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty title="Nothing saved yet" body="Results you save from AI apps and tools will appear here." />
          ))}

        {tab === "history" && (
          <div>
            {history === null ? (
              <div className="h-24 animate-pulse rounded-xl bg-muted" />
            ) : history.length ? (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Tools you opened. File contents are never recorded.</p>
                  <Button variant="ghost" size="sm" onClick={() => clearAllHistory(uid).then(() => setHistory([]))}>
                    <Trash2 className="size-4" /> Clear
                  </Button>
                </div>
                <ul className="divide-y rounded-xl border bg-card">
                  {history.flatMap((h) => {
                    const t = byId.get(h.toolId);
                    return t ? [<ToolRow key={h.id} tool={t} space={spaceOf(t)} meta={when(h.at)} action={<Clock className="size-4 text-muted-foreground" />} />] : [];
                  })}
                </ul>
              </>
            ) : (
              <Empty title="No history yet" body="Tools you open are listed here. File contents are never recorded." />
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-8">
            {signedIn && userDoc ? (
              <section className="divide-y rounded-xl border bg-card">
                <h2 className="px-4 py-3 font-sans text-sm font-semibold">Preferences</h2>
                {(
                  [
                    { key: "theme", label: "Theme", options: [["system", "Match device"], ["light", "Light"], ["dark", "Dark"]] },
                    { key: "units", label: "Units", options: [["metric", "Metric"], ["imperial", "Imperial"]] },
                    { key: "aiTone", label: "AI answers", options: [["simple", "Simple"], ["standard", "Standard"], ["detailed", "Detailed"]] },
                    { key: "defaultSpace", label: "Start page", options: [["", "Home"], ...spaces.map((s) => [s.id, s.name])] },
                  ] as { key: keyof Prefs; label: string; options: string[][] }[]
                ).map((row) => (
                  <label key={row.key} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                    <span>{row.label}</span>
                    <select
                      value={userDoc.prefs[row.key]}
                      onChange={(e) => updatePrefs({ [row.key]: e.target.value } as Partial<Prefs>)}
                      className="h-9 rounded-md border bg-background px-2 text-sm"
                    >
                      {row.options.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </section>
            ) : (
              <Empty title="Sign in to save settings" body="Preferences, favorites and saved results follow you across devices when you're signed in." cta={<Button onClick={() => setSignIn(true)}>Sign in</Button>} />
            )}

            {signedIn && (
              <>
                <section className="rounded-xl border bg-card p-4">
                  <h2 className="font-sans text-sm font-semibold">Your data</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Download everything stored in your account as a JSON file. Files you process are never stored.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="outline" onClick={exportData}>
                      <Download className="size-4" /> Export my data
                    </Button>
                    <Button variant="outline" onClick={() => logOut().then(() => router.replace("/"))}>
                      <LogOut className="size-4" /> Sign out
                    </Button>
                  </div>
                </section>

                <section className="rounded-xl border border-destructive/30 p-4">
                  <h2 className="font-sans text-sm font-semibold text-destructive">Delete account</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Permanently deletes your favorites, history, saved results, settings and sign-in. This can&apos;t be undone. Type DELETE to confirm.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Input value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} placeholder="DELETE" className="w-40" aria-label="Type DELETE to confirm" />
                    <Button variant="destructive" disabled={confirmDelete !== "DELETE" || deleting} onClick={deleteAccount}>
                      {deleting ? "Deleting…" : "Delete my account"}
                    </Button>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </div>

      {tab === "overview" && favTools.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-sans text-sm font-semibold text-muted-foreground">Favorites</h2>
            <button type="button" onClick={() => go("favorites")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              All <ArrowRight className="size-3.5" />
            </button>
          </div>
          <ul className="divide-y rounded-xl border bg-card">
            {favTools.slice(0, 5).map((t) => (
              <ToolRow key={t.id} tool={t} space={spaceOf(t)} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
