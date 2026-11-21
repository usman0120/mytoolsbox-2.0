"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Film, Image as ImageIcon, Music, Pin, PinOff, Send, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { clearTray, getTrayFile, listTray, removeFromTray, setPinned, subscribeTray, TRAY_SOFT_CAP, trayUsage, type TrayItem } from "@/runtime/file-store";
import { acceptsFile, portTypeOf, type CatalogEntry } from "@/runtime/ports";
import { cn } from "@/lib/utils";
import { useShell } from "./shell-store";

const fmtSize = (n: number) => (n < 1024 ? `${n} B` : n < 1024 ** 2 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 ** 2).toFixed(1)} MB`);
const fmtAge = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`;
};

function Thumb({ item }: { item: TrayItem }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!item.mime.startsWith("image/") || item.size > 15 * 1024 ** 2) return;
    let url: string | null = null;
    let active = true;
    getTrayFile(item.id).then((f) => {
      if (f && active) {
        url = URL.createObjectURL(f);
        setSrc(url);
      }
    });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [item.id, item.mime, item.size]);
  const type = portTypeOf(item.mime, item.name);
  const Icon = type === "video" ? Film : type === "audio" ? Music : type === "image" ? ImageIcon : FileText;
  return (
    <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
      {src ? <img src={src} alt="" className="size-full object-cover" /> : <Icon className="size-5 text-muted-foreground" />}
    </span>
  );
}

async function download(items: TrayItem[]) {
  if (items.length === 1) {
    const f = await getTrayFile(items[0].id);
    if (!f) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(f);
    a.download = f.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return;
  }
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const used = new Set<string>();
  for (const item of items) {
    const f = await getTrayFile(item.id);
    if (!f) continue;
    let name = f.name;
    for (let i = 2; used.has(name); i++) name = f.name.replace(/(\.[^.]*)?$/, ` (${i})$1`);
    used.add(name);
    zip.file(name, f);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mytoolsbox-files.zip";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

const mobileQuery = "(max-width: 639px)";
function useIsMobile() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(mobileQuery);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(mobileQuery).matches,
    () => false,
  );
}

/** File Tray drawer (blueprint S13): files and results kept on this device, ready for the next tool. */
export function FileTray({ catalog }: { catalog: CatalogEntry[] }) {
  const router = useRouter();
  const open = useShell((s) => s.trayOpen);
  const setOpen = useShell((s) => s.setTray);
  const [items, setItems] = useState<TrayItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const mobile = useIsMobile();

  const refresh = useCallback(() => {
    listTray()
      .then((list) => {
        setItems(list);
        setSelected((prev) => new Set([...prev].filter((id) => list.some((i) => i.id === id))));
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!open) return;
    refresh();
    return subscribeTray(refresh);
  }, [open, refresh]);

  const chosen = useMemo(() => items.filter((i) => selected.has(i.id)), [items, selected]);
  const target = chosen.length ? chosen : items;
  const usage = trayUsage(items);
  const sendable = chosen.length === 1 ? catalog.filter((t) => acceptsFile(t, portTypeOf(chosen[0].mime, chosen[0].name))).slice(0, 12) : [];

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side={mobile ? "bottom" : "right"} className={cn("gap-0 p-0", mobile ? "h-[85dvh] rounded-t-2xl" : "w-full sm:max-w-md")}>
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="font-heading text-lg">File Tray</SheetTitle>
          <SheetDescription>Files you added and results you made. Send any of them to the next tool.</SheetDescription>
        </SheetHeader>

        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 border-b px-3 py-2">
            <Button size="sm" variant="ghost" onClick={() => download(target)}>
              <Download className="size-4" /> {chosen.length ? `Download ${chosen.length}` : "Download all"}
            </Button>
            <Popover>
              <PopoverTrigger
                disabled={chosen.length !== 1}
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40"
                title={chosen.length !== 1 ? "Select one file to send" : undefined}
              >
                <Send className="size-4" /> Send to…
              </PopoverTrigger>
              <PopoverContent align="start" className="max-h-72 w-64 gap-0 overflow-y-auto p-1">
                {sendable.length ? (
                  sendable.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="w-full rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => {
                        setOpen(false);
                        router.push(`${t.url}?tray=${chosen[0].id}`);
                      }}
                    >
                      {t.name}
                    </button>
                  ))
                ) : (
                  <p className="px-2.5 py-2 text-sm text-muted-foreground">No tool takes this file type yet.</p>
                )}
              </PopoverContent>
            </Popover>
            <Button
              size="sm"
              variant="ghost"
              disabled={!chosen.length}
              onClick={() => setPinned(chosen.map((i) => i.id), !chosen.every((i) => i.pinned))}
            >
              {chosen.length && chosen.every((i) => i.pinned) ? <PinOff className="size-4" /> : <Pin className="size-4" />} Pin
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto text-destructive hover:text-destructive"
              onClick={async () => {
                if (chosen.length) await removeFromTray(chosen.map((i) => i.id));
                else await clearTray();
                toast.success(chosen.length ? "Removed from Tray" : "Tray cleared (pinned files kept)");
              }}
            >
              <Trash2 className="size-4" /> {chosen.length ? "Delete" : "Clear"}
            </Button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {error ? (
            <p className="p-5 text-sm text-destructive">{error}</p>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <svg viewBox="0 0 120 72" className="mb-5 h-16 w-28 text-muted-foreground/60" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M8 44h28l6 10h36l6-10h28v20a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" />
                <path d="M40 10h22l10 10v26H40z" strokeDasharray="3 3" />
                <path d="M62 10v10h10" strokeDasharray="3 3" />
              </svg>
              <p className="font-medium">Your tray is empty</p>
              <p className="mt-1.5 max-w-[16rem] text-sm text-muted-foreground">Add a file to any tool and it waits here, so you never upload twice.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id}>
                  <label className={cn("flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/60", selected.has(item.id) && "bg-muted")}>
                    <input type="checkbox" className="size-4 accent-foreground" checked={selected.has(item.id)} onChange={() => toggle(item.id)} aria-label={`Select ${item.name}`} />
                    <Thumb item={item} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <span className="truncate">{item.name}</span>
                        {item.pinned && <Pin className="size-3 shrink-0 text-muted-foreground" aria-label="Pinned" />}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {fmtSize(item.size)} · {item.kind === "result" ? `from ${catalog.find((t) => t.id === item.origin)?.name ?? "a tool"}` : "added"} · {fmtAge(item.createdAt)}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2 border-t bg-muted/50 px-5 py-3 text-xs text-muted-foreground">
          {items.length > 0 && (
            <div>
              <div className="mb-1 flex justify-between">
                <span>{fmtSize(usage)} used</span>
                <span>Unpinned files clear after 24 h</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-foreground/60" style={{ width: `${Math.min(100, (usage / TRAY_SOFT_CAP) * 100)}%` }} />
              </div>
            </div>
          )}
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-px size-4 shrink-0 text-success" />
            Files never leave this device. The tray is not synced to any server.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
