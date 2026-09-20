// ---------------------------------------------------------------------------
// Accessibility components — SkipLink, VisuallyHidden, LiveRegion
// ---------------------------------------------------------------------------

"use client";

import type { ElementType, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// SkipLink — skip to main content (keyboard-only visible)
// ---------------------------------------------------------------------------

interface SkipLinkProps {
  targetId?: string;
  label?: string;
  className?: string;
}

export function SkipLink({
  targetId = "main-content",
  label = "Skip to main content",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100",
        "focus:inline-flex focus:items-center focus:px-4 focus:py-2",
        "focus:rounded-lg focus:bg-primary focus:text-primary-foreground",
        "focus:text-sm focus:font-medium focus:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
    >
      {label}
    </a>
  );
}

// ---------------------------------------------------------------------------
// VisuallyHidden — content only visible to screen readers
// ---------------------------------------------------------------------------

interface VisuallyHiddenProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

export function VisuallyHidden({
  children,
  as: Tag = "span",
  className,
}: VisuallyHiddenProps) {
  return (
    <Tag
      className={cn(
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        // clip: rect(0,0,0,0) is the modern equivalent of the old clip pattern
        "[clip:rect(0,0,0,0)]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// LiveRegion — announce dynamic content changes to screen readers
// ---------------------------------------------------------------------------

interface LiveRegionProps {
  children?: React.ReactNode;
  message?: string;
  priority?: "polite" | "assertive";
  className?: string;
}

export function LiveRegion({
  children,
  message,
  priority = "polite",
  className,
}: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState(message ?? "");
  const prevMessage = useRef(message);

  useEffect(() => {
    if (message && message !== prevMessage.current) {
      // Clear then set to trigger re-announcement
      setAnnouncement("");
      const timer = requestAnimationFrame(() => {
        setAnnouncement(message);
      });
      prevMessage.current = message;
      return () => cancelAnimationFrame(timer);
    }
  }, [message]);

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className={cn("sr-only", className)}
    >
      {children ?? announcement}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FocusRing — consistent focus ring wrapper
// ---------------------------------------------------------------------------

interface FocusRingProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

export function FocusRing({
  children,
  className,
  as: Tag = "div",
}: FocusRingProps) {
  return (
    <Tag
      className={cn(
        "focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-offset-2 focus-within:ring-offset-background rounded-lg",
        className
      )}
    >
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// TouchTarget — ensures minimum 44x44px touch target
// ---------------------------------------------------------------------------

interface TouchTargetProps {
  children: React.ReactNode;
  className?: string;
}

export function TouchTarget({ children, className }: TouchTargetProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-h-11 min-w-11",
        className
      )}
    >
      {children}
    </span>
  );
}