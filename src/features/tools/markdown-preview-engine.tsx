"use client";

import { useState, useCallback } from "react";
import { Eye, Code, Copy, Check, FileText, Columns, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Simple markdown to HTML renderer
function renderMarkdown(md: string): string {
  let html = md;

  // Escape HTML
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Headers
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />");
  html = html.replace(/^\*\*\*$/gm, "<hr />");

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // Unordered lists
  html = html.replace(/^[\*\-] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    const cells = match.split("|").filter(Boolean).map((c) => c.trim());
    if (cells.every((c) => /^[-:]+$/.test(c))) return ""; // separator row
    const cellTag = match.includes("---") ? "th" : "td";
    return "<tr>" + cells.map((c) => `<${cellTag}>${c}</${cellTag}>`).join("") + "</tr>";
  });

  // Paragraphs (lines not already wrapped)
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, "<p>$1</p>");

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "");

  return html;
}

const SAMPLE_MARKDOWN = `# Welcome to Markdown Preview

## Text Formatting
**Bold text**, *italic text*, ~~strikethrough~~, and \`inline code\`.

## Lists
- Item 1
- Item 2
  - Nested item
- Item 3

1. First step
2. Second step
3. Third step

## Links & Images
[Visit Example](https://example.com)

## Blockquote
> This is a blockquote with important information.

## Code Block
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## Table
| Name  | Age | City     |
|-------|-----|----------|
| Alice | 25  | New York |
| Bob   | 30  | London   |
`;

export function MarkdownPreviewEngine() {
  const [markdown, setMarkdown] = useState("");
  const [html, setHtml] = useState("");
  const [copied, setCopied] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("split");

  const handlePreview = useCallback(() => {
    setHtml(renderMarkdown(markdown));
  }, [markdown]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleLoadSample = () => {
    setMarkdown(SAMPLE_MARKDOWN);
    setHtml(renderMarkdown(SAMPLE_MARKDOWN));
  };

  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const charCount = markdown.length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
            <TabsList>
              <TabsTrigger value="split" className="text-xs gap-1">
                <Columns className="h-3 w-3" /> Split
              </TabsTrigger>
              <TabsTrigger value="edit" className="text-xs gap-1">
                <Code className="h-3 w-3" /> Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs gap-1">
                <Eye className="h-3 w-3" /> Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">{wordCount} words</Badge>
          <Badge variant="secondary" className="text-[10px]">{charCount} chars</Badge>
          <Button variant="outline" size="sm" className="gap-1" onClick={handleLoadSample}>
            <FileText className="h-3.5 w-3.5" /> Sample
          </Button>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className={`grid gap-4 ${activeTab === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {(activeTab === "split" || activeTab === "edit") && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">Markdown</Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1"
                    onClick={() => handleCopy(markdown, "md")}
                  >
                    {copied === "md" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder="Type or paste your Markdown here..."
                className="min-h-100 font-mono text-sm"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
              />
              <Button onClick={handlePreview} className="gap-2 mt-2 w-full" size="sm">
                <Eye className="h-3.5 w-3.5" /> Render Preview
              </Button>
            </CardContent>
          </Card>
        )}

        {(activeTab === "split" || activeTab === "preview") && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">Preview</Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1"
                    onClick={() => handleCopy(html, "html")}
                  >
                    {copied === "html" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    HTML
                  </Button>
                </div>
              </div>
              <div
                className="min-h-100 p-4 rounded-lg border border-border bg-background prose prose-sm dark:prose-invert max-w-none overflow-auto"
                dangerouslySetInnerHTML={{ __html: html || "<p class='text-muted-foreground text-sm'>Click <strong>Render Preview</strong> to see the output...</p>" }}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick reference */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <Label className="text-xs font-medium mb-2 block">Quick Reference</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div><code className="bg-muted px-1 rounded"># H1</code> Heading 1</div>
            <div><code className="bg-muted px-1 rounded">**text**</code> Bold</div>
            <div><code className="bg-muted px-1 rounded">*text*</code> Italic</div>
            <div><code className="bg-muted px-1 rounded">~~text~~</code> Strike</div>
            <div><code className="bg-muted px-1 rounded">`code`</code> Inline Code</div>
            <div><code className="bg-muted px-1 rounded">[text](url)</code> Link</div>
            <div><code className="bg-muted px-1 rounded">![alt](url)</code> Image</div>
            <div><code className="bg-muted px-1 rounded">- item</code> List</div>
            <div><code className="bg-muted px-1 rounded">&gt; text</code> Blockquote</div>
            <div><code className="bg-muted px-1 rounded">```code```</code> Code Block</div>
            <div><code className="bg-muted px-1 rounded">---</code> Horizontal Rule</div>
            <div><code className="bg-muted px-1 rounded">| col |</code> Table</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}