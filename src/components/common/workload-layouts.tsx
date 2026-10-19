// ---------------------------------------------------------------------------
// Workload-specific layout components
// ---------------------------------------------------------------------------
// Each tool type gets a distinct interaction pattern while sharing
// the same design tokens (typography, spacing, colors, buttons).
//
// Patterns:
//   Calculator  → Input → Controls → Result → Explanation
//   Converter   → Input → Format selector → Output → Download
//   AI          → Conversation / workspace
//   Editor      → Toolbar → Canvas → Properties → Export
//   DevTool     → Editor → Output → Controls
// ---------------------------------------------------------------------------

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Shared section heading
// ---------------------------------------------------------------------------

interface SectionHeadingProps {
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeading({ title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-3", className)}>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Calculator Layout
//   Input → Controls → Result → Explanation
// ---------------------------------------------------------------------------

interface CalculatorLayoutProps {
  inputSection: React.ReactNode;
  controlsSection?: React.ReactNode;
  resultSection: React.ReactNode;
  explanationSection?: React.ReactNode;
  className?: string;
}

export function CalculatorLayout({
  inputSection,
  controlsSection,
  resultSection,
  explanationSection,
  className,
}: CalculatorLayoutProps) {
  return (
    <div className={cn("grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]", className)}>
      {/* Input area */}
      <div className="min-w-0 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
        {inputSection}
        {controlsSection && (
          <div className="mt-5 flex flex-wrap items-center gap-3 pt-5 border-t border-border/60">
            {controlsSection}
          </div>
        )}
      </div>

      {/* Result panel — elevated preview style */}
      <div className="min-w-0 rounded-2xl border border-border/80 bg-muted/20 dark:bg-muted/10 p-5 sm:p-6 shadow-xs flex flex-col justify-between" aria-live="polite">
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Result & Breakdown</span>
          </div>
          {resultSection}
        </div>
      </div>

      {explanationSection && (
        <HelpDisclosure title="Calculation details" className="mt-2 lg:col-span-2">
          {explanationSection}
        </HelpDisclosure>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Converter Layout
//   Input → Format selector → Output → Download
// ---------------------------------------------------------------------------

interface ConverterLayoutProps {
  inputSection: React.ReactNode;
  formatSection: React.ReactNode;
  outputSection: React.ReactNode;
  downloadSection?: React.ReactNode;
  className?: string;
}

export function ConverterLayout({
  inputSection,
  formatSection,
  outputSection,
  downloadSection,
  className,
}: ConverterLayoutProps) {
  return (
    <div className={cn("grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2", className)}>
      {/* Left: Input + Format */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
          <div className="mb-5 pb-3 border-b border-border/50">{formatSection}</div>
          {inputSection}
        </div>
      </div>

      {/* Right: Output + Download */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex-1 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Converted Output</span>
            </div>
            {outputSection}
          </div>
          {downloadSection && (
            <div className="mt-6 pt-4 border-t border-border/60 flex flex-wrap items-center justify-end gap-3">
              {downloadSection}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Workspace Layout
//   Conversation / workspace
// ---------------------------------------------------------------------------

interface AIWorkspaceLayoutProps {
  sidebar?: React.ReactNode;
  conversation: React.ReactNode;
  inputArea: React.ReactNode;
  className?: string;
}

export function AIWorkspaceLayout({
  sidebar,
  conversation,
  inputArea,
  className,
}: AIWorkspaceLayoutProps) {
  return (
    <div className={cn("flex min-w-0 h-[calc(100dvh-var(--shell-header-height))] gap-0", className)}>
      {/* Optional sidebar (history, settings) */}
      {sidebar && (
        <div className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-muted/20 p-4">
          {sidebar}
        </div>
      )}

      {/* Main conversation area */}
      <div className="flex min-w-0 flex-1 flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-3xl mx-auto">{conversation}</div>
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t bg-card/50 p-4">
          <div className="max-w-3xl mx-auto">{inputArea}</div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editor Layout
//   Toolbar → Canvas → Properties → Export
// ---------------------------------------------------------------------------

interface EditorLayoutProps {
  toolbar: React.ReactNode;
  canvas: React.ReactNode;
  properties?: React.ReactNode;
  exportActions?: React.ReactNode;
  className?: string;
}

export function EditorLayout({
  toolbar,
  canvas,
  properties,
  exportActions,
  className,
}: EditorLayoutProps) {
  return (
    <div className={cn("flex min-w-0 flex-col h-[calc(100dvh-var(--shell-header-height))] gap-0", className)}>
      {/* Toolbar */}
      <div className="shrink-0 flex flex-wrap items-center gap-2 border-b bg-card/50 px-3 py-2">
        {toolbar}
        <div className="ms-auto flex flex-wrap items-center gap-2">
          {exportActions}
        </div>
      </div>

      {/* Main area: Canvas + Properties */}
      <div className="flex min-w-0 flex-1 min-h-0 flex-col overflow-y-auto xl:flex-row">
        {/* Canvas */}
        <div className="min-w-0 min-h-64 flex-1 flex items-center justify-center overflow-auto p-3 bg-muted/10">
          {canvas}
        </div>

        {/* Properties panel */}
        {properties && (
          <div className="flex w-full shrink-0 flex-col gap-4 border-t bg-card p-4 xl:w-72 xl:border-t-0 xl:border-l xl:overflow-y-auto">
            {properties}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Developer Tool Layout
//   Editor → Output → Controls
// ---------------------------------------------------------------------------

interface DevToolLayoutProps {
  editor: React.ReactNode;
  output: React.ReactNode;
  controls?: React.ReactNode;
  className?: string;
}

export function DevToolLayout({
  editor,
  output,
  controls,
  className,
}: DevToolLayoutProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* Controls bar */}
      {controls && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs">
          {controls}
        </div>
      )}

      {/* Editor + Output split */}
      <div className="grid min-w-0 grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-w-0 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="border-b border-border/60 bg-muted/20 px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Input</span>
          </div>
          <div className="p-4 sm:p-5">{editor}</div>
        </div>
        <div className="min-w-0 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="border-b border-border/60 bg-muted/20 px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Output</span>
          </div>
          <div className="p-4 sm:p-5">{output}</div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page shell — consistent page wrapper with large whitespace
// ---------------------------------------------------------------------------

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8", className)}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tool header — consistent tool page header
// ---------------------------------------------------------------------------

interface ToolHeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function ToolHeader({
  icon,
  title,
  description,
  badges,
  actions,
  className,
}: ToolHeaderProps) {
  return (
    <header className={cn("mb-6 flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-border/50", className)}>
      <div className="flex min-w-0 items-start gap-3.5">
        {icon && (
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs" aria-hidden="true">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl wrap-break-word text-foreground">
              {title}
            </h1>
            {badges}
          </div>
          {description && (
            <p className="mt-1 max-w-3xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function WorkspaceShell({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <section aria-label={label} className={cn("workspace min-w-0", className)}>
      {children}
    </section>
  );
}

export function HelpDisclosure({
  children,
  title = "Help and details",
  className,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <details className={cn("group/help mt-6 rounded-xl border border-border/70 bg-card/60 p-4 transition-colors", className)}>
      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring select-none">
        {title}
      </summary>
      <div className="mt-4 space-y-3 pt-3 border-t border-border/50 text-xs sm:text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </details>
  );
}