"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Download, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useShell } from "@/components/shell/shell-store";
import { addToTray } from "@/runtime/file-store";

/** Completed tasks are counted on this device; the install prompt waits for the 2nd (blueprint section 17). */
export const TASKS_KEY = "mtb.tasksDone";
const DISMISS_KEY = "mtb.installDismissedAt";

export function recordCompletedTask() {
  try {
    const n = Number(localStorage.getItem(TASKS_KEY) ?? 0) + 1;
    localStorage.setItem(TASKS_KEY, String(n));
    window.dispatchEvent(new Event("mtb-task-done"));
  } catch {}
}

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
type LaunchParams = { files: { getFile: () => Promise<File> }[] };

/** Registers the service worker and handles app entry points (?open=, shared files, "Open with"). */
export function PwaClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { openAsk, setTray } = useShell();
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  // Service worker in production only (dev servers rebuild assets constantly).
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);

  // Entry points from shortcuts, the share sheet and the manifest.
  useEffect(() => {
    const open = params.get("open");
    if (!open) return;
    if (open === "ask") openAsk(new URLSearchParams(window.location.hash.slice(1)).get("q") ?? params.get("q") ?? "");
    if (open === "tray") setTray(true);
    const shared = Number(params.get("shared") ?? 0);
    if (shared > 0) toast.success(`${shared} shared ${shared === 1 ? "file is" : "files are"} in your Tray. Pick one and choose Send to…`);
    router.replace(pathname, { scroll: false });
  }, [params, pathname, router, openAsk, setTray]);

  // Desktop "Open with MyToolsBox" (file_handlers): put the files in the Tray.
  useEffect(() => {
    const queue = (window as unknown as { launchQueue?: { setConsumer: (fn: (p: LaunchParams) => void) => void } }).launchQueue;
    queue?.setConsumer(async ({ files }) => {
      if (!files?.length) return;
      for (const handle of files.slice(0, 20)) await addToTray(await handle.getFile(), { origin: "upload", kind: "input" }).catch(() => {});
      setTray(true);
    });
  }, [setTray]);

  // Install prompt after the 2nd completed task, at most once every 30 days after "Not now".
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallEvent);
    };
    const check = () => {
      try {
        const done = Number(localStorage.getItem(TASKS_KEY) ?? 0);
        const dismissed = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
        setShowInstall(done >= 2 && Date.now() - dismissed > 30 * 86400_000);
      } catch {}
    };
    check();
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("mtb-task-done", check);
    window.addEventListener("appinstalled", () => setInstallEvent(null));
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("mtb-task-done", check);
    };
  }, []);

  if (!installEvent || !showInstall) return null;
  return (
    <div
      role="dialog"
      aria-label="Install MyToolsBox"
      className="fixed inset-x-3 bottom-[calc(var(--shell-bottom-nav-height)+env(safe-area-inset-bottom)+0.75rem)] z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border bg-popover p-3 shadow-lg md:bottom-6"
    >
      <Download className="size-5 shrink-0" />
      <p className="min-w-0 flex-1 text-sm">
        <span className="block font-medium">Install MyToolsBox</span>
        <span className="block text-muted-foreground">Opens from your home screen and works offline.</span>
      </p>
      <Button
        size="sm"
        onClick={async () => {
          await installEvent.prompt();
          await installEvent.userChoice.catch(() => null);
          setInstallEvent(null);
        }}
      >
        Install
      </Button>
      <Button
        size="icon"
        variant="ghost"
        aria-label="Not now"
        onClick={() => {
          try {
            localStorage.setItem(DISMISS_KEY, String(Date.now()));
          } catch {}
          setShowInstall(false);
        }}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
