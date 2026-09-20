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
    <div className={cn("mb-6", className)}>
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
    <div className={cn("flex flex-col gap-6 max-w-2xl mx-auto", className)}>
      {/* Input area */}
      <div className="rounded-xl border bg-card p-5 shadow-xs">
        {inputSection}
        {controlsSection && (
          <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t">
            {controlsSection}
          </div>
        )}
      </div>

      {/* Result */}
      <div className="rounded-xl border bg-card p-5 shadow-xs animate-fade-in-up">
        {resultSection}
      </div>

      {/* Explanation (collapsible) */}
      {explanationSection && (
        <div className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
          {explanationSection}
        </div>
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
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      {/* Left: Input + Format */}
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="mb-4">{formatSection}</div>
          {inputSection}
        </div>
      </div>

      {/* Right: Output + Download */}
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-xs flex-1">
          {outputSection}
        </div>
        {downloadSection && (
          <div className="flex items-center justify-end gap-3">
            {downloadSection}
          </div>
        )}
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
    <div className={cn("flex h-[calc(100vh-8rem)] gap-0", className)}>
      {/* Optional sidebar (history, settings) */}
      {sidebar && (
        <div className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-muted/20 p-4">
          {sidebar}
        </div>
      )}

      {/* Main conversation area */}
      <div className="flex flex-1 flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-4 py-6">
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
    <div className={cn("flex flex-col h-[calc(100vh-8rem)] gap-0", className)}>
      {/* Toolbar */}
      <div className="shrink-0 flex items-center gap-2 border-b bg-card/50 px-4 py-2">
        {toolbar}
        <div className="ml-auto flex items-center gap-2">
          {exportActions}
        </div>
      </div>

      {/* Main area: Canvas + Properties */}
      <div className="flex flex-1 min-h-0">
        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center p-6 bg-muted/10">
          {canvas}
        </div>

        {/* Properties panel */}
        {properties && (
          <div className="hidden xl:flex w-72 shrink-0 flex-col border-l bg-card p-4 gap-4 overflow-y-auto">
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
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Controls bar */}
      {controls && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-2.5 shadow-xs">
          {controls}
        </div>
      )}

      {/* Editor + Output split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
          <div className="border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Input
          </div>
          <div className="p-4">{editor}</div>
        </div>
        <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
          <div className="border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Output
          </div>
          <div className="p-4">{output}</div>
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
    <main className={cn("container mx-auto px-4 py-8 md:py-12 max-w-7xl page-enter", className)}>
      {children}
    </main>
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
    <div className={cn("mb-8", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand ring-1 ring-brand/20">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {badges && <div className="flex items-center gap-2">{badges}</div>}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}