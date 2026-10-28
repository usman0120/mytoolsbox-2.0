"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen, FileText, HelpCircle, Download, ArrowRight,
  Clock, ExternalLink, ChevronDown, ChevronUp, Search,
  Copy, Check, Eye, Sparkles, Code2,
  CheckCircle2, X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  CHEAT_SHEETS,
  RESOURCE_FAQS,
  searchResources,
  type ResourceGuide,
  type ResourceTemplate,
} from "@/features/resources/resources-data";
import { createDocxBlob } from "@/lib/documents/openxml-builder";
import { UI_COPY } from "@/lib/ui-copy";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";

export function ResourcesPageClient() {
  const { t } = UI_COPY;
  const [activeTab, setActiveTab] = useState("guides");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Template preview modal state
  const [previewTemplate, setPreviewTemplate] = useState<ResourceTemplate | null>(null);

  // Guide quick-read modal state
  const [previewGuide, setPreviewGuide] = useState<ResourceGuide | null>(null);

  // Cheat Sheet category filter
  const [cheatCategory, setCheatCategory] = useState<string>("all");

  // FAQ accordion state
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filtered resources
  const searchResults = useMemo(() => {
    return searchResources(searchQuery);
  }, [searchQuery]);

  const filteredGuides = useMemo(() => {
    return searchResults.guides.filter((g) =>
      selectedCategory === "all" ? true : g.category === selectedCategory
    );
  }, [searchResults.guides, selectedCategory]);

  const filteredTemplates = useMemo(() => {
    return searchResults.templates.filter((t) =>
      selectedCategory === "all" ? true : t.category === selectedCategory
    );
  }, [searchResults.templates, selectedCategory]);

  const filteredCheatSheets = useMemo(() => {
    return searchResults.cheatSheets.filter((c) =>
      cheatCategory === "all" ? true : c.category === cheatCategory
    );
  }, [searchResults.cheatSheets, cheatCategory]);

  const handleCopyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleDownloadTemplate = async (template: ResourceTemplate) => {
    try {
      let blob: Blob;

      if (template.format === "DOCX") {
        const lines = template.content.split("\n");
        const paragraphs = lines.map((l) => {
          if (l.startsWith("# ")) return { text: l.replace("# ", ""), isHeading: true, fontSize: 32 };
          if (l.startsWith("## ")) return { text: l.replace("## ", ""), isHeading: true, fontSize: 26 };
          if (l.startsWith("### ")) return { text: l.replace("### ", ""), isHeading: true, fontSize: 22 };
          return { text: l };
        });
        blob = await createDocxBlob(paragraphs, template.title);
      } else if (template.format === "CSV") {
        blob = new Blob([template.content], { type: "text/csv;charset=utf-8;" });
      } else if (template.format === "JSON") {
        blob = new Blob([template.content], { type: "application/json;charset=utf-8;" });
      } else {
        blob = new Blob([template.content], { type: "text/plain;charset=utf-8;" });
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = template.filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${template.filename}!`);
    } catch {
      toast.error("Failed to download template.");
    }
  };

  return (
    <PageShell>
      {/* Page Header */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
          <ToolHeader icon={<BookOpen className="h-5 w-5 text-rose-600 dark:text-rose-400" />} title={t("resources_title", "Resources & Knowledge Hub")} description={t("resources_subtitle", "Guides, templates, cheat sheets, and FAQs")} />

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-muted-foreground" />
            <Input
              value={searchQuery}
              aria-label={t("resources_search_placeholder", "Search resources")}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("resources_search_placeholder", "Search guides, templates, syntax...")}
              className="h-9 text-xs pl-8 pr-8"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear resource search"
                title="Clear resource search"
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "guides")} className="w-full">
        <TabsList className="mb-6 rounded-xl p-1 bg-muted/60 w-full justify-start overflow-x-auto">
          <TabsTrigger value="guides" className="rounded-lg text-xs gap-1.5 data-[state=active]:shadow-xs">
            <BookOpen className="h-3.5 w-3.5" />
            {t("resources_tab_guides", "Guides & Tutorials")} ({filteredGuides.length})
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg text-xs gap-1.5 data-[state=active]:shadow-xs">
            <Download className="h-3.5 w-3.5" />
            {t("resources_tab_templates", "Templates")} ({filteredTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="cheatsheets" className="rounded-lg text-xs gap-1.5 data-[state=active]:shadow-xs">
            <Code2 className="h-3.5 w-3.5" />
            {t("resources_tab_cheatsheets", "Cheat Sheets")} ({CHEAT_SHEETS.length})
          </TabsTrigger>
          <TabsTrigger value="faqs" className="rounded-lg text-xs gap-1.5 data-[state=active]:shadow-xs">
            <HelpCircle className="h-3.5 w-3.5" />
            {t("resources_tab_faqs", "FAQs")} ({RESOURCE_FAQS.length})
          </TabsTrigger>
          <div className="ml-auto flex items-center pr-1">
            <Link
              href="/blog"
              className="h-7 inline-flex items-center text-xs gap-1.5 px-2.5 rounded-lg text-primary hover:text-primary hover:bg-primary/10 font-medium transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              <span>Visit Blog & Guides</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </TabsList>

        {/* ------------------------------------------------------------- */}
        {/* Tab 1: Guides & Tutorials */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="guides" className="space-y-6">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "all", label: t("resources_cat_all", "All Categories") },
              { id: "getting-started", label: "Getting Started" },
              { id: "multimedia", label: "Multimedia" },
              { id: "developer", label: t("cat_developer", "Developer") },
              { id: "productivity", label: "Productivity" },
              { id: "security", label: t("cat_security", "Security") },
            ].map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs rounded-full px-3 shrink-0"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGuides.map((guide) => (
              <Card
                key={guide.slug}
                className="border shadow-xs hover:border-primary/40 transition-all hover:scale-[1.01] flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted shrink-0">
                      <BookOpen className={`h-6 w-6 ${guide.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] capitalize px-1.5 h-4">
                          {guide.category.replace("-", " ")}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {guide.readTime}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {guide.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setPreviewGuide(guide)}
                    >
                      <Eye className="h-3.5 w-3.5" /> {t("resources_quick_preview", "Quick Preview")}
                    </Button>
                    <Link
                      href={`/resources/${guide.slug}`}
                      className="inline-flex items-center font-medium text-primary hover:underline text-xs gap-1"
                    >
                      {t("resources_read_full", "Read Full Guide")} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* Tab 2: Downloadable & Interactive Templates */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "all", label: "All Formats" },
              { id: "business", label: "Business & Proposals" },
              { id: "productivity", label: "Productivity & Planners" },
              { id: "developer", label: "Developer Specs" },
              { id: "finance", label: "Finance & Spreadsheets" },
            ].map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs rounded-full px-3 shrink-0"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted shrink-0">
                      <FileText className={`h-6 w-6 ${template.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] font-mono h-4 px-1.5">
                          {template.format}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {template.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-foreground">
                        {template.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t text-xs">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-3 w-3" /> {t("resources_preview", "Preview")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => handleCopyText(template.content, template.id)}
                      >
                        {copiedKey === template.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        {t("resources_copy", "Copy")}
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {template.toolIntegration && (
                        <Link href={`/tools/${template.toolIntegration.toolSlug}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-[11px] text-primary gap-1">
                            <ExternalLink className="h-3 w-3" /> {template.toolIntegration.toolName}
                          </Button>
                        </Link>
                      )}
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1 font-semibold"
                        onClick={() => handleDownloadTemplate(template)}
                      >
                        <Download className="h-3 w-3" /> {t("resources_download", "Download")} .{template.format.toLowerCase()}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* Tab 3: Interactive Cheat Sheets & References */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="cheatsheets" className="space-y-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "all", label: "All References" },
              { id: "regex", label: "Regular Expressions" },
              { id: "http", label: "HTTP Status Codes" },
              { id: "markdown", label: "Markdown Syntax" },
              { id: "mime", label: "MIME Content Types" },
              { id: "git", label: "Git Commands" },
            ].map((cat) => (
              <Button
                key={cat.id}
                variant={cheatCategory === cat.id ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs rounded-full px-3 shrink-0"
                onClick={() => setCheatCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCheatSheets.map((item) => (
              <Card key={item.id} className="border shadow-xs hover:border-primary/40 transition-colors">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{item.title}</span>
                      {item.badge && (
                        <Badge variant="outline" className="text-[9px] px-1 h-4">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopyText(item.syntax, item.id)}
                      aria-label={`Copy ${item.title}`}
                      title={`Copy ${item.title}`}
                    >
                      {copiedKey === item.id ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  <div className="p-2 rounded bg-muted/40 font-mono text-xs text-foreground break-all select-all">
                    {item.syntax}
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {item.explanation}
                  </p>

                  {item.example && (
                    <div className="text-[10px] text-muted-foreground font-mono pt-1 border-t">
                      Example: <span className="text-foreground">{item.example}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* Tab 4: Interactive FAQs */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="faqs" className="space-y-4">
          <div className="max-w-3xl space-y-2.5">
            {searchResults.faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <Card key={faq.id} className="border shadow-xs overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    className="w-full p-4 flex items-start gap-3.5 text-left hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-xs sm:text-sm text-foreground">{faq.question}</h3>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      {isOpen && (
                        <div className="pt-2 text-xs text-muted-foreground leading-relaxed animate-fade-in-up">
                          <p>{faq.answer}</p>
                          {faq.relatedToolSlug && (
                            <div className="mt-3 pt-2 border-t flex items-center gap-2">
                              <span className="text-[10px]">Related tool:</span>
                              <Link
                                href={`/tools/${faq.relatedToolSlug}`}
                                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                              >
                                Launch {faq.relatedToolSlug} <ArrowRight className="h-2.5 w-2.5" />
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ------------------------------------------------------------- */}
      {/* Template Preview Modal */}
      {/* ------------------------------------------------------------- */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl bg-card border">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{previewTemplate.title}</h3>
                <p className="text-[11px] text-muted-foreground">{previewTemplate.filename}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPreviewTemplate(null)}
                aria-label="Close template preview"
                title="Close template preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <pre className="font-mono text-xs p-3 rounded-lg bg-muted/40 text-foreground whitespace-pre-wrap break-all">
                {previewTemplate.content}
              </pre>
            </div>

            <div className="p-4 border-t flex items-center justify-between bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1"
                onClick={() => handleCopyText(previewTemplate.content, "modal-copy")}
              >
                {copiedKey === "modal-copy" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                Copy Content
              </Button>
              <Button
                size="sm"
                className="text-xs gap-1"
                onClick={() => handleDownloadTemplate(previewTemplate)}
              >
                <Download className="h-3.5 w-3.5" /> Download .{previewTemplate.format.toLowerCase()}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Guide Quick-Read Modal */}
      {/* ------------------------------------------------------------- */}
      {previewGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl bg-card border">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize text-[10px]">
                  {previewGuide.category}
                </Badge>
                <h3 className="font-bold text-sm">{previewGuide.title}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPreviewGuide(null)}
                aria-label="Close guide preview"
                title="Close guide preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {previewGuide.description}
              </p>

              <div className="p-3.5 rounded-lg border bg-primary/5 space-y-2">
                <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Key Takeaways
                </span>
                <ul className="space-y-1 text-xs text-foreground/90">
                  {previewGuide.takeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {previewGuide.sections.map((sec, i) => (
                <div key={i} className="space-y-1.5 pt-2">
                  <h4 className="font-bold text-xs text-foreground">{sec.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{sec.content}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t flex items-center justify-between bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setPreviewGuide(null)}
              >
                {t("action_clear_all", "Close")}
              </Button>
              <Link href={`/resources/${previewGuide.slug}`}>
                <Button size="sm" className="text-xs gap-1">
                  {t("resources_read_full", "Read Full Guide")} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
