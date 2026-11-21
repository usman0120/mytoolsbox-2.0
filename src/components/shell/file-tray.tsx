"use client";

import { ShieldCheck } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useShell } from "./shell-store";

/**
 * File Tray drawer (blueprint S13). Right drawer on desktop, bottom sheet on mobile.
 * Files and results land here once the local file store ships (M4).
 */
export function FileTray() {
  const open = useShell((s) => s.trayOpen);
  const setOpen = useShell((s) => s.setTray);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:h-[70dvh] max-sm:rounded-t-2xl max-sm:border-t sm:max-w-sm"
      >
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="font-heading text-lg">File Tray</SheetTitle>
          <SheetDescription>Files you add and results you make, ready to send to the next tool.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <svg viewBox="0 0 120 72" className="mb-5 h-16 w-28 text-muted-foreground/60" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M8 44h28l6 10h36l6-10h28v20a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" />
            <path d="M40 10h22l10 10v26H40z" strokeDasharray="3 3" />
            <path d="M62 10v10h10" strokeDasharray="3 3" />
          </svg>
          <p className="font-medium">Your tray is empty</p>
          <p className="mt-1.5 max-w-[16rem] text-sm text-muted-foreground">
            Drop a file into any tool and it will wait here, so you never upload twice.
          </p>
        </div>

        <div className="flex items-start gap-2.5 border-t bg-muted/50 px-5 py-4 text-xs text-muted-foreground">
          <ShieldCheck className="mt-px size-4 shrink-0 text-success" />
          <p>Files never leave this device. The tray is not synced to any server.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
