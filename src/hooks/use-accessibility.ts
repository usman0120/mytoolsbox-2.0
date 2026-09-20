// ---------------------------------------------------------------------------
// Accessibility hooks — keyboard, focus, reduced motion, screen reader
// ---------------------------------------------------------------------------

"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// useReducedMotion — detect prefers-reduced-motion
// ---------------------------------------------------------------------------

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}

// ---------------------------------------------------------------------------
// useFocusTrap — trap focus within a container (for modals, dialogs)
// ---------------------------------------------------------------------------

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "details summary",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
].join(", ");

export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Save previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Focus first element
    first?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      // Restore focus
      previousFocusRef.current?.focus();
    };
  }, [active]);

  return containerRef;
}

// ---------------------------------------------------------------------------
// useKeyboardShortcut — register global keyboard shortcuts
// ---------------------------------------------------------------------------

interface ShortcutOptions {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (e: KeyboardEvent) => void;
  enabled?: boolean;
}

export function useKeyboardShortcut(options: ShortcutOptions) {
  const { key, ctrl, meta, shift, alt, handler, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const matchesKey = e.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = ctrl ? e.ctrlKey : !e.ctrlKey;
      const matchesMeta = meta ? e.metaKey : !e.metaKey;
      const matchesShift = shift ? e.shiftKey : !e.shiftKey;
      const matchesAlt = alt ? e.altKey : !e.altKey;

      if (matchesKey && matchesCtrl && matchesMeta && matchesShift && matchesAlt) {
        e.preventDefault();
        handler(e);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, ctrl, meta, shift, alt, handler, enabled]);
}

// ---------------------------------------------------------------------------
// useAnnounce — announce messages to screen readers via live region
// ---------------------------------------------------------------------------

let announceElement: HTMLDivElement | null = null;

function getAnnounceElement(): HTMLDivElement {
  if (!announceElement && typeof document !== "undefined") {
    announceElement = document.createElement("div");
    announceElement.setAttribute("aria-live", "polite");
    announceElement.setAttribute("aria-atomic", "true");
    announceElement.className = "sr-only";
    document.body.appendChild(announceElement);
  }
  return announceElement!;
}

export function useAnnounce() {
  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    const el = getAnnounceElement();
    if (!el) return;

    el.setAttribute("aria-live", priority);
    // Clear then set to trigger re-announcement
    el.textContent = "";
    requestAnimationFrame(() => {
      el.textContent = message;
    });
  }, []);

  return announce;
}

// ---------------------------------------------------------------------------
// useFocusVisible — track whether user is navigating by keyboard
// ---------------------------------------------------------------------------

export function useFocusVisible(): boolean {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab") {
        setIsKeyboardUser(true);
      }
    }

    function handlePointerDown() {
      setIsKeyboardUser(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return isKeyboardUser;
}

// ---------------------------------------------------------------------------
// useId — stable unique ID for aria-labelledby / aria-describedby
// ---------------------------------------------------------------------------

let idCounter = 0;

export function useA11yId(prefix = "a11y"): string {
  const [id] = useState(() => {
    idCounter += 1;
    return `${prefix}-${idCounter}`;
  });
  return id;
}