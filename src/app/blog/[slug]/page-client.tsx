"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronRight,
  Share2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Wrench,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Bookmark,
  CheckCircle2,
  FileText,
  Layers,
  Image as ImageIcon,
  Scissors,
  FilePlus,
  Code,
  Palette,
  Lock,
  QrCode,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  type BlogPost,
  type BlogToolCallout,
  getRelatedBlogPosts,
} from "@/content/blog/blogs-data";
import { useI18n } from "@/lib/i18n";
import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

function XIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.7a1.64 1.64 0 0 0-1.66 1.64 1.65 1.65 0 0 0 1.66 1.64 1.64 1.64 0 0 0 1.64-1.64c0-.9-.73-1.64-1.64-1.64" />
    </svg>
  );
}

interface Props {
  post: BlogPost;
}

// Icon resolver for in-article tool callout cards
function getCalloutIcon(iconName?: string) {
  switch (iconName) {
    case "Image":
      return <ImageIcon className="h-6 w-6 text-primary" />;
    case "Scissors":
      return <Scissors className="h-6 w-6 text-primary" />;
    case "FilePlus":
      return <FilePlus className="h-6 w-6 text-primary" />;
    case "Code":
    case "Code2":
    case "FileCode":
      return <Code className="h-6 w-6 text-primary" />;
    case "Palette":
      return <Palette className="h-6 w-6 text-primary" />;
    case "Lock":
    case "Shield":
    case "ShieldCheck":
      return <ShieldCheck className="h-6 w-6 text-primary" />;
    case "QrCode":
      return <QrCode className="h-6 w-6 text-primary" />;
    case "Timer":
    case "Clock":
      return <Timer className="h-6 w-6 text-primary" />;
    default:
      return <Wrench className="h-6 w-6 text-primary" />;
  }
}

export function BlogPostClient({ post }: Props) {
  const { localizePath } = useI18n();
  const [copied, setCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const relatedPosts = getRelatedBlogPosts(post, 3);
  const postUrl = `${SITE_CONFIG.url}/blog/${post.slug}`;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${post.title} via @MyToolsBox`);
    const url = encodeURIComponent(postUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(postUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  // Helper to parse markdown links [Text](/path) into interactive Next.js links
  const renderFormattedContent = (content: string) => {
    const paragraphs = content.split("\n\n");

    return paragraphs.map((paragraph, pIdx) => {
      // Check for bullet lists
      if (paragraph.startsWith("- ")) {
        const items = paragraph.split("\n").filter((i) => i.trim());
        return (
          <ul key={pIdx} className="space-y-2 my-4 list-disc pl-5 text-muted-foreground leading-relaxed">
            {items.map((item, itemIdx) => {
              const cleanItem = item.replace(/^- /, "");
              return <li key={itemIdx}>{parseInlineLinks(cleanItem)}</li>;
            })}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
          {parseInlineLinks(paragraph)}
        </p>
      );
    });
  };

  const parseInlineLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const label = match[1];
      const href = match[2];
      parts.push(
        <Link
          key={match.index}
          href={localizePath(href)}
          className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary transition-colors"
        >
          {label}
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Article Header & Breadcrumbs */}
      <div className="border-b border-border/40 bg-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-6 overflow-x-auto">
            <Link href="/" className="hover:text-foreground transition-colors shrink-0">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href={localizePath("/blog")} className="hover:text-foreground transition-colors shrink-0">
              Blog
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="text-foreground font-medium truncate max-w-xs sm:max-w-md">
              {post.title}
            </span>
          </nav>

          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold text-xs">
              {post.category}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{post.date}</span>
            </div>
            <span className="text-muted-foreground text-xs">•</span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{post.readTime}</span>
            </div>
            <span className="text-muted-foreground text-xs">•</span>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>100% Client-Side Privacy</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-6">
            {post.title}
          </h1>

          {/* Author Row */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/40">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div>
                <div className="font-semibold text-sm text-foreground">{post.author.name}</div>
                <div className="text-xs text-muted-foreground">{post.author.role}</div>
              </div>
            </div>

            {/* Social Share Buttons (Desktop Top) */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="h-8 gap-1.5 text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Link"}</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShareTwitter}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Share on X"
              >
                <XIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShareLinkedIn}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Share on LinkedIn"
              >
                <LinkedInIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 max-w-5xl py-10">
        {/* Cover Image */}
        <div className="relative aspect-[21/9] sm:aspect-[2/1] overflow-hidden rounded-2xl border border-border/60 shadow-lg mb-12 bg-muted">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Article Body */}
          <main className="lg:col-span-8 space-y-12">
            {/* Excerpt Lead */}
            <div className="rounded-xl border border-border/80 bg-muted/30 p-6 sm:p-7">
              <p className="text-lg sm:text-xl font-medium text-foreground leading-relaxed italic">
                &ldquo;{post.excerpt}&rdquo;
              </p>
            </div>

            {/* In-Content Sections */}
            <div className="space-y-10">
              {post.sections.map((section, sIdx) => (
                <section key={section.id} id={section.id} className="space-y-5 scroll-mt-24">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground border-b border-border/40 pb-3">
                    {section.title}
                  </h2>

                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    {renderFormattedContent(section.content)}
                  </div>

                  {/* Interactive In-Article Tool Callout Card matching Screenshot 2 */}
                  {section.toolCallout && (
                    <Card className="my-6 overflow-hidden border border-primary/30 bg-primary/[0.03] dark:bg-primary/[0.05] shadow-xs hover:border-primary/60 transition-all">
                      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                            {getCalloutIcon(section.toolCallout.iconName)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base sm:text-lg text-foreground">
                                {section.toolCallout.name}
                              </h4>
                              {section.toolCallout.badge && (
                                <Badge className="bg-emerald-600 text-white text-[10px] py-0 px-2">
                                  {section.toolCallout.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                              {section.toolCallout.description}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={localizePath(`/tools/${section.toolCallout.slug}`)}
                          className={cn(
                            buttonVariants({ variant: "default" }),
                            "shrink-0 w-full sm:w-auto gap-2 shadow-xs"
                          )}
                        >
                          <span>Open Tool</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </section>
              ))}
            </div>

            {/* Frequently Asked Questions Section */}
            {post.faqs.length > 0 && (
              <section className="space-y-6 pt-6 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Frequently Asked Questions
                  </h3>
                </div>

                <div className="space-y-3">
                  {post.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-border/60 bg-card overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-semibold text-sm sm:text-base text-foreground hover:bg-muted/40 transition-colors"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-4 ${
                              isOpen ? "rotate-180 text-primary" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/20">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Bottom Social Share Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border/60 bg-muted/20">
              <div className="space-y-1">
                <div className="font-semibold text-sm text-foreground">Did you find this guide useful?</div>
                <div className="text-xs text-muted-foreground">Share it with your teammates and network.</div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5 text-xs">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleShareTwitter} className="gap-1.5 text-xs">
                  <XIcon className="h-3.5 w-3.5" />
                  <span>X / Tweet</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleShareLinkedIn} className="gap-1.5 text-xs">
                  <LinkedInIcon className="h-3.5 w-3.5" />
                  <span>LinkedIn</span>
                </Button>
              </div>
            </div>
          </main>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Table of Contents Box */}
            <div className="sticky top-24 space-y-6">
              <Card className="border border-border/60 bg-card p-5 space-y-4">
                <h4 className="font-bold text-sm tracking-wide text-foreground uppercase flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Table of Contents</span>
                </h4>
                <ul className="space-y-2.5 text-sm">
                  {post.sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                        <span className="truncate">{section.title}</span>
                      </a>
                    </li>
                  ))}
                  {post.faqs.length > 0 && (
                    <li>
                      <a
                        href="#faq"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                        <span>FAQ</span>
                      </a>
                    </li>
                  )}
                </ul>
              </Card>

              {/* Tools Mentioned In This Article */}
              {post.relatedTools.length > 0 && (
                <Card className="border border-border/60 bg-card p-5 space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm tracking-wide text-foreground uppercase flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      <span>Tools Mentioned</span>
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Free browser utilities featured in this guide.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {post.relatedTools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={localizePath(`/tools/${tool.slug}`)}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/50 transition-all group"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                            {tool.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1">
                            {tool.description}
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Client-Side Privacy Guarantee Badge Card */}
              <Card className="border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="font-bold text-sm">Client-Side Privacy Guarantee</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your files, text, and data never leave your device. All computations are handled directly inside your browser’s local runtime.
                </p>
              </Card>
            </div>
          </aside>
        </div>

        {/* Related Guides Grid */}
        <section className="pt-16 border-t border-border/40 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              Related Guides & Articles
            </h3>
            <Link
              href={localizePath("/blog")}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>View all guides</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((rPost) => (
              <Card
                key={rPost.slug}
                className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300"
              >
                <Link
                  href={localizePath(`/blog/${rPost.slug}`)}
                  className="relative aspect-[16/10] overflow-hidden bg-muted block"
                >
                  <img
                    src={rPost.coverImage}
                    alt={rPost.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-background/90 text-foreground text-[10px] font-semibold">
                      {rPost.category}
                    </Badge>
                  </div>
                </Link>

                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{rPost.date}</span>
                      <span>•</span>
                      <span>{rPost.readTime}</span>
                    </div>

                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={localizePath(`/blog/${rPost.slug}`)}>
                        {rPost.title}
                      </Link>
                    </h4>
                  </div>

                  <Link
                    href={localizePath(`/blog/${rPost.slug}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-2 border-t border-border/40"
                  >
                    <span>Read Article</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Deep Emerald Green Bottom CTA Banner matching Screenshot 1 & 2 */}
        <section className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border border-emerald-500/30 p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300">
                <Wrench className="h-3.5 w-3.5" />
                <span>BROWSE TOOLS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Your Free Online Toolbox
              </h3>
              <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
                192 free tools, no sign-up required, 100% private in-browser processing. Merge PDFs, resize images, format code, and automate daily tasks in seconds.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href={localizePath("/tools")}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-white text-emerald-950 hover:bg-emerald-50 font-bold shadow-md gap-2"
                )}
              >
                <span>Browse Tools</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={localizePath("/blog")}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-emerald-500/40 text-white hover:bg-emerald-900/40 backdrop-blur-xs font-medium"
                )}
              >
                <span>Blog & Guides</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
