"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Inbox, Upload } from "lucide-react";
import { addToTray, getTrayFile, type TrayItem } from "@/runtime/file-store";
import { acceptsFile, portTypeOf, type CatalogEntry } from "@/runtime/ports";
import { useShell } from "@/components/shell/shell-store";
import { cn } from "@/lib/utils";

interface Props {
  toolId: string;
  /** Tools that can take this tool's results, for "Continue with…". */
  next: CatalogEntry[];
  children: React.ReactNode;
}

const fileInputs = (root: HTMLElement) => [...root.querySelectorAll<HTMLInputElement>('input[type="file"]')];

/** Picks the file input whose accept list matches the file best. */
function pickInput(root: HTMLElement, file: File): HTMLInputElement | null {
  const inputs = fileInputs(root).filter((i) => !i.disabled);
  const matches = (i: HTMLInputElement) =>
    !i.accept ||
    i.accept.split(",").some((a) => {
      const t = a.trim().toLowerCase();
      return t === file.type || (t.endsWith("/*") && file.type.startsWith(t.slice(0, -1))) || (t.startsWith(".") && file.name.toLowerCase().endsWith(t));
    });
  return inputs.find(matches) ?? null;
}

/**
 * Wraps a tool UI and connects it to the File Tray without changing the tool:
 * drop or paste files anywhere on the tool, open files sent from the Tray (?tray=id),
 * keep added files and downloaded results in the Tray, and offer "Continue with…".
 */
export function ToolSurface({ toolId, next, children }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const feeding = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<TrayItem | null>(null);
  const [notice, setNotice] = useState("");
  const setTray = useShell((s) => s.setTray);

  /** Hands files to the tool's own file input, as if the user had picked them. */
  const feed = useCallback((files: File[]): boolean => {
    const el = root.current;
    if (!el || !files.length) return false;
    const input = pickInput(el, files[0]);
    if (!input) {
      setNotice("This tool doesn't take that type of file.");
      return false;
    }
    const dt = new DataTransfer();
    (input.multiple ? files : files.slice(0, 1)).forEach((f) => dt.items.add(f));
    feeding.current = true;
    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    feeding.current = false;
    setNotice("");
    return true;
  }, []);

  // Open a file sent from the Tray: /tool?tray=<id>. Waits for the lazy tool UI to render its input.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("tray");
    const el = root.current;
    if (!id || !el) return;
    let done = false;
    const attempt = async () => {
      if (done || !fileInputs(el).length) return;
      done = true;
      observer.disconnect();
      const file = await getTrayFile(id).catch(() => null);
      if (!file) setNotice("That file is no longer in your Tray.");
      else feed([file]);
      const url = new URL(window.location.href);
      url.searchParams.delete("tray");
      window.history.replaceState(null, "", url);
    };
    const observer = new MutationObserver(() => void attempt());
    observer.observe(el, { childList: true, subtree: true });
    void attempt();
    const timeout = window.setTimeout(() => observer.disconnect(), 10_000);
    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, [feed]);

  // Keep files the user adds in the Tray, so later tools can reuse them without re-uploading.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (input.type !== "file" || !input.files?.length || feeding.current) return;
      for (const f of [...input.files].slice(0, 20)) void addToTray(f, { origin: "upload", kind: "input" }).catch(() => {});
    };
    el.addEventListener("change", onChange, true);
    return () => el.removeEventListener("change", onChange, true);
  }, []);

  // Capture downloads of generated results (blob: links) into the Tray and offer next steps.
  useEffect(() => {
    const blobs = new Map<string, Blob>();
    const originalCreate = URL.createObjectURL;
    const originalClick = HTMLAnchorElement.prototype.click;
    URL.createObjectURL = function (obj: Blob | MediaSource) {
      const url = originalCreate.call(URL, obj);
      if (obj instanceof Blob && blobs.size < 200) blobs.set(url, obj);
      return url;
    };
    const capture = (a: HTMLAnchorElement) => {
      const blob = a.href.startsWith("blob:") ? blobs.get(a.href) : undefined;
      if (!blob || !a.hasAttribute("download")) return;
      const name = a.getAttribute("download") || "result";
      void addToTray(blob, { origin: toolId, kind: "result", name })
        .then((item) => item && setResult(item))
        .catch(() => {});
    };
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      capture(this);
      return originalClick.call(this);
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[download]");
      if (a instanceof HTMLAnchorElement) capture(a);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      URL.createObjectURL = originalCreate;
      HTMLAnchorElement.prototype.click = originalClick;
      document.removeEventListener("click", onClick, true);
    };
  }, [toolId]);

  // Paste files (Ctrl/Cmd + V) anywhere on the page unless typing in a field.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = [...(e.clipboardData?.files ?? [])];
      const target = e.target as HTMLElement | null;
      if (!files.length || target?.closest("input, textarea, [contenteditable='true']")) return;
      if (root.current && fileInputs(root.current).length && feed(files)) e.preventDefault();
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [feed]);

  const hasFiles = (e: React.DragEvent) => [...e.dataTransfer.types].includes("Files");
  const resultType = result ? portTypeOf(result.mime, result.name) : null;
  const continueWith = resultType ? next.filter((t) => t.id !== toolId && acceptsFile(t, resultType)).slice(0, 5) : [];

  return (
    <div
      ref={root}
      className="relative"
      onDragEnter={(e) => {
        if (hasFiles(e) && root.current && fileInputs(root.current).length) setDragging(true);
      }}
      onDragOver={(e) => {
        if (dragging) e.preventDefault();
      }}
      onDragLeave={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(e) => {
        if (!dragging) return;
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        feed([...e.dataTransfer.files]);
      }}
    >
      {children}

      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed border-[var(--space,var(--ring))] bg-background/85 backdrop-blur-sm">
          <span className="flex items-center gap-2 text-base font-medium">
            <Upload className="size-5" /> Drop to add. Your file stays on this device.
          </span>
        </div>
      )}

      <div aria-live="polite" className="empty:hidden">
        {notice && <p className="mt-3 text-sm text-muted-foreground">{notice}</p>}
        {result && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center">
            <p className="flex min-w-0 items-center gap-2 text-sm">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-lime text-lime-foreground">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span className="truncate">
                <span className="font-medium">{result.name}</span> saved to your{" "}
                <button type="button" className="underline underline-offset-4" onClick={() => setTray(true)}>
                  Tray
                </button>
              </span>
            </p>
            {continueWith.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
                <span className="text-xs text-muted-foreground">Continue with</span>
                {continueWith.map((t) => (
                  <Link
                    key={t.id}
                    href={`${t.url}?tray=${result.id}`}
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:border-foreground/30 hover:bg-muted"
                  >
                    {t.name}
                    <ArrowRight className="size-3" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Small hint under file tools: where files go and how to add them. */
export function SurfaceHint({ className }: { className?: string }) {
  const setTray = useShell((s) => s.setTray);
  return (
    <p className={cn("mt-3 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground", className)}>
      Drop files anywhere on the tool or paste with Ctrl+V. Results are kept in your
      <button type="button" onClick={() => setTray(true)} className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline">
        <Inbox className="size-3.5" /> Tray
      </button>
      on this device for 24 hours.
    </p>
  );
}
