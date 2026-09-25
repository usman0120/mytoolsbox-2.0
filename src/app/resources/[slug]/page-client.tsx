"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Clock, Share2, Check, Copy, BookOpen, Sparkles,
  ExternalLink, ThumbsUp, ThumbsDown, CheckCircle2, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import type { ResourceGuide } from "@/features/resources/resources-data";

interface Props {
  guide: ResourceGuide;
}

export function ResourceGuidePageClient({ guide }: Props) {
  const { t, localizePath } = useI18n();
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  const handleCopyCode = async (code: string, idx: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    toast.success("Code snippet copied!");
    setTimeout(() => setCopiedCodeIdx(null), 1500);
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    toast.success("Guide link copied to clipboard!");
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleFeedback = (val: "yes" | "no") => {
    setFeedback(val);
    toast.success(val === "yes" ? "Thanks for your feedback!" : "Thank you. We'll work to improve this guide.");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={localizePath("/resources")}
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
          {t("resources_back", "Back to Resources")}
        </Link>
        <Button variant="outline" size="sm" onClick={handleShare} className="h-8 text-xs gap-1.5">
          {copiedShare ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
          {t("resources_share", "Share Guide")}
        </Button>
      </div>

      {/* Article Header */}
      <div className="space-y-4 mb-8 pb-6 border-b">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="capitalize text-xs">
            {guide.category.replace("-", " ")}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {guide.readTime}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {guide.title}
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed">
          {guide.description}
        </p>
      </div>

      {/* Key Takeaways Callout Box */}
      <Card className="border-primary/30 bg-primary/5 mb-10 shadow-xs">
        <CardContent className="p-5 space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" /> {t("resources_takeaways", "Key Takeaways")}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-foreground/90">
            {guide.takeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Main Guide Content Sections */}
      <div className="space-y-8 mb-12">
        {guide.sections.map((section, idx) => (
          <section key={idx} className="space-y-3 scroll-mt-20">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {section.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {section.content}
            </p>

            {section.codeSnippet && (
              <div className="relative group rounded-xl border bg-muted/40 p-4 font-mono text-xs overflow-x-auto my-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2.5 top-2.5 h-7 w-7 opacity-75 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCopyCode(section.codeSnippet!, idx)}
                >
                  {copiedCodeIdx === idx ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <pre className="text-foreground">{section.codeSnippet}</pre>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Recommended Interactive Tools */}
      {guide.recommendedTools.length > 0 && (
        <div className="space-y-4 mb-12 p-6 rounded-2xl border bg-muted/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> {t("related_tools_title", "Recommended Tools")}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {guide.recommendedTools.map((tool) => (
              <Link key={tool.slug} href={localizePath(`/tools/${tool.slug}`)}>
                <Card className="h-full border hover:border-primary/50 transition-all hover:scale-[1.02] shadow-xs cursor-pointer">
                  <CardContent className="p-3.5 space-y-1.5 flex flex-col justify-between h-full">
                    <div>
                      <p className="font-semibold text-xs text-foreground flex items-center justify-between">
                        <span>{tool.name}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                        {tool.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[9px] w-fit mt-2">
                      {t("action_explore", "Try Tool")}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Helpful Feedback Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card text-center sm:text-left">
        <span className="text-xs font-medium text-muted-foreground">
          {t("resources_feedback_prompt", "Was this resource helpful?")}
        </span>
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={feedback === "yes" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => handleFeedback("yes")}
          >
            <ThumbsUp className="h-3.5 w-3.5" /> Helpful
          </Button>
          <Button
            variant={feedback === "no" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => handleFeedback("no")}
          >
            <ThumbsDown className="h-3.5 w-3.5" /> Needs More
          </Button>
        </div>
      </div>
    </div>
  );
}
