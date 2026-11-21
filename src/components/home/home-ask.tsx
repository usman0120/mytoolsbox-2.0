"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useShell } from "@/components/shell/shell-store";

const EXAMPLES = [
  "compress a photo to 100 KB",
  "merge two PDFs",
  "solve 2x + 5 = 13",
  "turn a video into a GIF",
  "format this JSON",
  "loan payment for 25,000 over 5 years",
  "make a QR code for my shop",
];

/** Home page Ask bar: typing here opens the Ask palette with the text pre-filled. */
export function HomeAsk() {
  const openAsk = useShell((s) => s.openAsk);
  const [value, setValue] = useState("");
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % EXAMPLES.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        openAsk(value);
        setValue("");
      }}
      className="group relative mt-8 w-full max-w-xl"
    >
      <label htmlFor="home-ask" className="sr-only">
        What do you need to do?
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
      <input
        id="home-ask"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (e.target.value.length > 1) {
            openAsk(e.target.value);
            setValue("");
          }
        }}
        onFocus={(e) => {
          if (window.matchMedia("(pointer: coarse)").matches) {
            e.currentTarget.blur();
            openAsk("");
          }
        }}
        autoComplete="off"
        placeholder={`Try “${EXAMPLES[i]}”`}
        className="h-14 w-full rounded-2xl border bg-card pr-24 pl-12 text-base shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-foreground/30 focus:shadow-md"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:block">
        Ctrl K
      </kbd>
    </form>
  );
}
