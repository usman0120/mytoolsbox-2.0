"use client";

import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  accept: string;
  onFile: (file: File) => void;
  title: string;
  hint?: ReactNode;
  button?: string;
  /** Render compact (after a file is loaded) as just a "Replace" button. */
  compact?: boolean;
  className?: string;
}

/**
 * Drop area plus a file input that stays mounted, so ToolSurface can feed Tray files and pasted images into it.
 */
export function FileDrop({ accept, onFile, title, hint, button = "Choose file", compact, className }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const pick = (files: FileList | null) => {
    const f = files?.[0];
    if (f) onFile(f);
  };
  const el = (
    <input
      ref={input}
      type="file"
      accept={accept}
      className="sr-only"
      tabIndex={-1}
      onChange={(e) => {
        pick(e.target.files);
        e.target.value = "";
      }}
    />
  );

  if (compact) {
    return (
      <>
        {el}
        <Button variant="outline" size="sm" className={className} onClick={() => input.current?.click()}>
          {button}
        </Button>
      </>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-10 text-center transition-colors",
        over ? "border-foreground/40 bg-muted/60" : "border-border",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        pick(e.dataTransfer.files);
      }}
    >
      {el}
      <p className="text-lg font-semibold">{title}</p>
      {hint && <p className="mt-1 max-w-md text-sm text-muted-foreground">{hint}</p>}
      <Button className="mt-5" onClick={() => input.current?.click()}>
        {button}
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">or drop it here, or paste with Ctrl+V</p>
    </div>
  );
}

/** Small segmented control (radio group) used by tool option panels. */
export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full rounded-lg border bg-muted/50 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === o.value ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
