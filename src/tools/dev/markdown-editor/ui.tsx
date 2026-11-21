"use client";

import { useState, useTransition, useMemo, useEffect, useRef } from "react";
import {
  Eye,
  Code,
  Copy,
  Check,
  FileText,
  Columns,
  Download,
  Bold,
  Italic,
  Strikethrough,
  Heading,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Table as TableIcon,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Enhanced Markdown to HTML renderer
function renderMarkdown(md: string): string {
  let html = md;

  // Escape HTML tags to prevent XSS except our generated tags
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Callouts / Alerts: > [!NOTE], > [!WARNING], > [!TIP]
  html = html.replace(/^&gt; \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/gim, (_, type, text) => {
    const alertColors: Record<string, string> = {
      NOTE: "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200",
      TIP: "border-green-500 bg-green-50/50 dark:bg-green-950/20 text-green-900 dark:text-green-200",
      IMPORTANT: "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200",
      WARNING: "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200",
      CAUTION: "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-200",
    };
    const cls = alertColors[type.toUpperCase()] || alertColors.NOTE;
    return `<div class="p-3 my-2 border-l-4 rounded-r-md text-xs ${cls}"><strong>${type.toUpperCase()}:</strong> ${text}</div>`;
  });

  // Fenced Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="my-3 p-3 bg-muted rounded-lg font-mono text-xs overflow-x-auto border"><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, `<code class="px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-primary">$1</code>`);

  // Headers (H1-H6)
  html = html.replace(/^###### (.+)$/gm, `<h6 class="text-sm font-semibold mt-3 mb-1 text-foreground">$1</h6>`);
  html = html.replace(/^##### (.+)$/gm, `<h5 class="text-sm font-bold mt-3 mb-1 text-foreground">$1</h5>`);
  html = html.replace(/^#### (.+)$/gm, `<h4 class="text-base font-bold mt-4 mb-1.5 text-foreground">$1</h4>`);
  html = html.replace(/^### (.+)$/gm, `<h3 class="text-lg font-bold mt-4 mb-2 text-foreground">$1</h3>`);
  html = html.replace(/^## (.+)$/gm, `<h2 class="text-xl font-bold mt-5 mb-2 pb-1 border-b border-border text-foreground">$1</h2>`);
  html = html.replace(/^# (.+)$/gm, `<h1 class="text-2xl font-extrabold mt-6 mb-3 pb-1 border-b border-border text-foreground">$1</h1>`);

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, `<strong><em>$1</em></strong>`);
  html = html.replace(/\*\*(.+?)\*\*/g, `<strong>$1</strong>`);
  html = html.replace(/\*(.+?)\*/g, `<em>$1</em>`);
  html = html.replace(/___(.+?)___/g, `<strong><em>$1</em></strong>`);
  html = html.replace(/__(.+?)__/g, `<strong>$1</strong>`);
  html = html.replace(/_(.+?)_/g, `<em>$1</em>`);

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, `<del class="line-through text-muted-foreground">$1</del>`);

  // Checklists
  html = html.replace(/^[\*\-] \[x\] (.+)$/gim, `<div class="flex items-center gap-2 my-1"><input type="checkbox" checked disabled class="rounded" /> <span class="line-through text-muted-foreground">$1</span></div>`);
  html = html.replace(/^[\*\-] \[ \] (.+)$/gim, `<div class="flex items-center gap-2 my-1"><input type="checkbox" disabled class="rounded" /> <span>$1</span></div>`);

  // Links & Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, `<img src="$2" alt="$1" class="rounded-lg max-w-full my-2 border" />`);
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:opacity-80">$1</a>`);

  // Horizontal rules
  html = html.replace(/^(?:---|\*\*\*|___)$/gm, `<hr class="my-4 border-border" />`);

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, `<blockquote class="border-l-4 border-primary/50 pl-3 my-2 italic text-muted-foreground text-sm">$1</blockquote>`);

  // Lists
  html = html.replace(/^[\*\-] (.+)$/gm, `<li class="ml-4 list-disc">$1</li>`);
  html = html.replace(/^\d+\. (.+)$/gm, `<li class="ml-4 list-decimal">$1</li>`);

  // Wrap contiguous <li> in <ul> or <ol>
  html = html.replace(/(<li class="ml-4 list-disc">[\s\S]*?<\/li>\n?)+/g, `<ul class="my-2 space-y-1">$&</ul>`);
  html = html.replace(/(<li class="ml-4 list-decimal">[\s\S]*?<\/li>\n?)+/g, `<ol class="my-2 space-y-1">$&</ol>`);

  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    const cells = match.split("|").filter((c) => c !== "");
    if (cells.every((c) => /^[-: ]+$/.test(c))) return "<!--table-divider-->";
    const isHeader = !html.includes("<!--table-divider-->");
    const cellTag = isHeader ? "th" : "td";
    const cls = isHeader ? "p-2 font-semibold bg-muted/50 border text-left" : "p-2 border text-left";
    return `<tr>${cells.map((c) => `<${cellTag} class="${cls}">${c.trim()}</${cellTag}>`).join("")}</tr>`;
  });
  html = html.replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, `<div class="overflow-x-auto my-3"><table class="w-full border-collapse border border-border text-xs">$&</table></div>`);
  html = html.replace(/<!--table-divider-->\n?/g, "");

  // Paragraphs
  html = html.replace(/^(?!<[a-z]|<!--)(.+)$/gm, `<p class="my-2 leading-relaxed text-sm">$1</p>`);
  html = html.replace(/<p class="my-2 leading-relaxed text-sm">\s*<\/p>/g, "");

  return html;
}

const SAMPLE_MARKDOWN = `# Real-Time Markdown Previewer

Welcome to the **enhanced Markdown editor & previewer**! You can write, preview, and export documentation with ease.

> [!TIP]
> This editor supports live debounced rendering, Github alerts, tables, checklists, and code blocks!

## Features Checklist
- [x] Real-time live side-by-side rendering
- [x] Syntax-aware code snippets
- [x] Formatted data tables
- [ ] Direct PDF export

## Data Comparison
| Feature | Basic Markdown | Pro Markdown Engine |
| :--- | :--- | :--- |
| Live Split Preview | No | Yes (Debounced) |
| Checklists & Alerts | No | Supported |
| Code Highlighting | Plain | Syntax Wrapped |

## Code Example
\`\`\`typescript
export function greet(name: string): string {
  return \`Hello, \${name}! Built with Next.js 16 & React 19.\`;
}
\`\`\`

> "Good documentation is like a love letter you write to your future self."

Need to link somewhere? Visit [MyToolsBox](https://mytoolsbox.me).
`;

export function MarkdownPreviewEngine() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [activeTab, setActiveTab] = useState<"split" | "edit" | "preview">("split");
  const [copied, setCopied] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Live memoized HTML rendering
  const renderedHtml = useMemo(() => {
    return renderMarkdown(markdown);
  }, [markdown]);

  const wordCount = useMemo(() => {
    return markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  }, [markdown]);

  const charCount = markdown.length;
  const readingTimeMin = Math.ceil(wordCount / 200) || 1;

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}!`);
  };

  // Markdown formatting helpers
  const insertFormatting = (prefix: string, suffix = "", defaultText = "text") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end) || defaultText;

    const newText =
      markdown.substring(0, start) +
      prefix +
      selected +
      suffix +
      markdown.substring(end);

    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? "fixed inset-4 z-50 bg-background p-6 rounded-2xl border shadow-2xl overflow-y-auto" : ""}`}>
      {/* Top Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "split" | "edit" | "preview")}>
            <TabsList>
              <TabsTrigger value="split" className="text-xs gap-1.5">
                <Columns className="h-3.5 w-3.5" /> Split View
              </TabsTrigger>
              <TabsTrigger value="edit" className="text-xs gap-1.5">
                <Code className="h-3.5 w-3.5" /> Editor Only
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Preview Only
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {wordCount} words
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {charCount} chars
          </Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> ~{readingTimeMin} min read
          </Badge>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => handleCopy(renderedHtml, "html")}
            >
              {copied === "html" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              HTML
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => handleDownload(markdown, "document.md", "text/markdown")}
            >
              <Download className="h-3 w-3" /> .md
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() =>
                handleDownload(
                  `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Markdown Export</title><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:1rem;line-height:1.6}pre{background:#f4f4f4;padding:1rem;border-radius:6px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}</style></head><body>${renderedHtml}</body></html>`,
                  "document.html",
                  "text/html"
                )
              }
            >
              <Download className="h-3 w-3" /> .html
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Formatting Ribbon */}
      {(activeTab === "split" || activeTab === "edit") && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/40 rounded-lg border text-xs">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => insertFormatting("**", "**", "bold text")}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => insertFormatting("*", "*", "italic text")}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => insertFormatting("~~", "~~", "strikethrough text")}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => insertFormatting("## ", "", "Heading 2")}
            title="Heading 2"
          >
            <Heading className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => insertFormatting("- ", "", "List item")}
            title="Bullet List"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => insertFormatting("1. ", "", "Ordered item")}
            title="Numbered List"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => insertFormatting("- [ ] ", "", "Task")}
            title="Checklist"
          >
            <CheckSquare className="h-3.5 w-3.5" />
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => insertFormatting("> ", "", "Blockquote")}
            title="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => insertFormatting("```javascript\n", "\n```", "console.log('Hello');")}
            title="Code Block"
          >
            <Code2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => insertFormatting("| Header 1 | Header 2 |\n| :--- | :--- |\n| Cell 1 | Cell 2 |", "")}
            title="Table"
          >
            <TableIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => insertFormatting("[", "](https://example.com)", "link title")}
            title="Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Editor & Preview Panes */}
      <div className={`grid gap-4 ${activeTab === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {(activeTab === "split" || activeTab === "edit") && (
          <Card className="flex flex-col">
            <CardContent className="p-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold text-muted-foreground">Markdown Source</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs gap-1"
                  onClick={() => handleCopy(markdown, "md")}
                >
                  {copied === "md" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  Copy Markdown
                </Button>
              </div>
              <Textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Type your markdown here..."
                className="flex-1 min-h-120 font-mono text-xs leading-relaxed resize-none"
              />
            </CardContent>
          </Card>
        )}

        {(activeTab === "split" || activeTab === "preview") && (
          <Card className="flex flex-col">
            <CardContent className="p-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold text-muted-foreground">Live Rendered View</Label>
                <span className="text-[11px] text-muted-foreground">Real-time sync</span>
              </div>
              <div
                className="flex-1 min-h-120 p-5 rounded-lg border bg-card overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}