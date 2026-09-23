"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Parse content into blocks (code blocks vs regular markdown)
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`space-y-3 leading-relaxed text-sm md:text-[15px] ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === "code") {
          return (
            <CodeBlock
              key={idx}
              language={block.language || "text"}
              code={block.content}
            />
          );
        }
        return <TextBlock key={idx} text={block.content} />;
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Code Block with Copy & Download
// ---------------------------------------------------------------------------

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleDownload = () => {
    const ext = getExtension(language);
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `code-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as code-${Date.now()}.${ext}`);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-border/60 bg-zinc-950 text-zinc-100 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/90 text-xs font-mono text-zinc-400">
        <span className="uppercase tracking-wider font-semibold text-zinc-300">
          {language}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md gap-1"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md"
            title="Download code"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {/* Code body */}
      <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed selection:bg-violet-900 selection:text-white">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Text Block renderer (Markdown paragraphs, lists, headers, tables)
// ---------------------------------------------------------------------------

function TextBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inList: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (inList === "ul") {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 ml-5 list-disc space-y-1">
          {listItems.map((item, i) => (
            <li key={i}>{renderInlineFormatting(item)}</li>
          ))}
        </ul>
      );
    } else if (inList === "ol") {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-2 ml-5 list-decimal space-y-1">
          {listItems.map((item, i) => (
            <li key={i}>{renderInlineFormatting(item)}</li>
          ))}
        </ol>
      );
    }
    inList = null;
    listItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Headers
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={i} className="text-base font-semibold mt-4 mb-1 text-foreground">
          {renderInlineFormatting(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={i} className="text-lg font-bold mt-5 mb-1.5 text-foreground">
          {renderInlineFormatting(trimmed.slice(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={i} className="text-xl font-bold mt-5 mb-2 text-foreground">
          {renderInlineFormatting(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={i}
          className="my-2 border-l-4 border-violet-500/60 bg-muted/30 px-3.5 py-2 italic text-muted-foreground rounded-r-lg"
        >
          {renderInlineFormatting(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (inList !== "ul") {
        flushList();
        inList = "ul";
      }
      listItems.push(trimmed.slice(2));
      continue;
    }

    // Ordered List
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      if (inList !== "ol") {
        flushList();
        inList = "ol";
      }
      listItems.push(orderedMatch[2]);
      continue;
    }

    // Horizontal Rule
    if (trimmed === "---" || trimmed === "***") {
      flushList();
      elements.push(<hr key={i} className="my-4 border-border/50" />);
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={i} className="my-1.5 leading-relaxed">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  }

  flushList();

  return <>{elements}</>;
}

// ---------------------------------------------------------------------------
// Inline markdown formatting (**bold**, *italic*, `code`, [link](url))
// ---------------------------------------------------------------------------

function renderInlineFormatting(str: string): React.ReactNode[] {
  // Regex tokenizing inline backticks, bold, italic
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-muted/80 px-1.5 py-0.5 text-xs font-mono font-medium text-foreground border border-border/50"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={match.index} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 hover:opacity-80"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface MarkdownBlock {
  type: "text" | "code";
  content: string;
  language?: string;
}

function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = content.substring(lastIndex, match.index).trim();
      if (textChunk) {
        blocks.push({ type: "text", content: textChunk });
      }
    }

    blocks.push({
      type: "code",
      language: match[1] || "text",
      content: match[2].trimEnd(),
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    const trailingText = content.substring(lastIndex).trim();
    if (trailingText) {
      blocks.push({ type: "text", content: trailingText });
    }
  }

  return blocks;
}

function getExtension(lang: string): string {
  const map: Record<string, string> = {
    typescript: "ts",
    javascript: "js",
    tsx: "tsx",
    jsx: "jsx",
    python: "py",
    sql: "sql",
    html: "html",
    css: "css",
    json: "json",
    markdown: "md",
    bash: "sh",
    shell: "sh",
    yaml: "yml",
    rust: "rs",
    go: "go",
    java: "java",
    c: "c",
    cpp: "cpp",
  };
  return map[lang.toLowerCase()] || "txt";
}
