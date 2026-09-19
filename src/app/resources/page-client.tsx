"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Download,
  ArrowRight,
  Shield,
  Zap,
  Clock,
  Globe,
  Lock,
  Smartphone,
  FileJson,
  FileImage,
  FileCode,
  Calculator,
  Type,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const GUIDES = [
  {
    title: "Getting Started with MyToolsBox",
    description: "Learn how to use the platform effectively for your daily tasks. Covers navigation, favorites, history, and keyboard shortcuts.",
    readTime: "5 min read",
    icon: Zap,
    slug: "getting-started",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "PDF Tools: Complete Guide",
    description: "Master merging, splitting, compressing, and converting PDFs. Learn when to use each tool and tips for best results.",
    readTime: "8 min read",
    icon: FileText,
    slug: "pdf-tools-guide",
    gradient: "from-red-500/10 to-rose-500/10",
    iconColor: "text-red-600 dark:text-red-400",
  },
  {
    title: "Image Processing 101",
    description: "Compress, resize, crop, and convert images without quality loss. Understand format differences and optimization strategies.",
    readTime: "6 min read",
    icon: FileImage,
    slug: "image-processing-101",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    title: "Developer Tools Overview",
    description: "JSON formatting, Base64 encoding, URL encoding, regex testing, and diff checking — all in your browser.",
    readTime: "7 min read",
    icon: FileCode,
    slug: "developer-tools-overview",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Calculator Tools Guide",
    description: "Percentage, age, BMI, loan, and unit conversion calculators explained with real-world examples.",
    readTime: "5 min read",
    icon: Calculator,
    slug: "calculator-tools-guide",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    title: "Writing & Text Tools",
    description: "Word counting, case conversion, text cleaning, and lorem ipsum generation for writers and editors.",
    readTime: "4 min read",
    icon: Type,
    slug: "writing-tools-guide",
    gradient: "from-teal-500/10 to-cyan-500/10",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
];

const TEMPLATES = [
  {
    title: "Project Proposal Template",
    description: "Professional project proposal document structure with executive summary, timeline, and budget sections.",
    format: "DOCX",
    icon: FileText,
    gradient: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Meeting Notes Template",
    description: "Structured meeting notes with attendees, agenda, discussion points, and action items.",
    format: "MD",
    icon: FileText,
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Budget Calculator Spreadsheet",
    description: "Monthly budget tracking template with income, expenses, savings goals, and auto-calculating formulas.",
    format: "CSV",
    icon: Calculator,
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "Code Review Checklist",
    description: "Comprehensive code review checklist covering functionality, readability, security, and performance.",
    format: "MD",
    icon: FileCode,
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    title: "Weekly Planner Template",
    description: "Plan your week with time blocks, priorities, and goals. Printable and digital-friendly.",
    format: "PDF",
    icon: FileText,
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    title: "Personal SWOT Analysis",
    description: "Strengths, Weaknesses, Opportunities, and Threats analysis template for personal development.",
    format: "DOCX",
    icon: FileText,
    gradient: "from-teal-500/10 to-green-500/10",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
];

const FAQS = [
  {
    question: "Are my files uploaded to a server?",
    answer:
      "No. All tools process files locally in your browser using Web APIs. Your data never leaves your device. We don't have access to your files.",
    icon: Shield,
  },
  {
    question: "Is MyToolsBox really free?",
    answer:
      "Yes! All core tools are free forever with no usage limits. We may offer optional premium features in the future, but the essentials will always remain free.",
    icon: Zap,
  },
  {
    question: "Do I need an account?",
    answer:
      "No account is needed for any tool. Signing in is optional and gives you access to favorites, history sync, and personalized recommendations.",
    icon: Lock,
  },
  {
    question: "Which browsers are supported?",
    answer:
      "MyToolsBox works on all modern browsers: Chrome 90+, Firefox 90+, Safari 15+, and Edge 90+. Mobile browsers are also supported.",
    icon: Globe,
  },
  {
    question: "Is there a file size limit?",
    answer:
      "Since processing happens in your browser, limits depend on your device's memory. Most tools handle files up to 100MB smoothly. For very large files, consider splitting them first.",
    icon: FileJson,
  },
  {
    question: "Can I use MyToolsBox offline?",
    answer:
      "Yes! Once the page loads, most tools work offline since all processing is client-side. You can even install it as a PWA on supported browsers.",
    icon: Smartphone,
  },
  {
    question: "How is my privacy protected?",
    answer:
      "We don't track individual usage, don't store your files, and don't use third-party analytics. Your data stays on your device. Read our privacy policy for details.",
    icon: Shield,
  },
  {
    question: "How often are new tools added?",
    answer:
      "We regularly add new tools and improve existing ones based on user feedback. Check the changelog or follow us for updates.",
    icon: Clock,
  },
];

function FaqItem({ faq, i }: { faq: (typeof FAQS)[0]; i: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card
      className="border-border/50 hover:border-primary/20 transition-colors animate-fade-in-up overflow-hidden"
      style={{ animationDelay: `${i * 60}ms` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-start gap-4 text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-rose-500/10 to-pink-500/10 ring-1 ring-rose-500/20 shrink-0">
          <faq.icon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-sm">{faq.question}</h3>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </div>
          {isOpen && (
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed animate-fade-in-up">
              {faq.answer}
            </p>
          )}
        </div>
      </button>
    </Card>
  );
}

export function ResourcesPageClient() {
  const [activeTab, setActiveTab] = useState("guides");

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500/10 to-pink-500/10 ring-1 ring-rose-500/20 shadow-sm">
            <BookOpen className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Resources</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Guides, templates, and FAQs to help you get the most out of MyToolsBox
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 rounded-xl p-1 bg-muted/50 w-full justify-start overflow-x-auto">
          <TabsTrigger value="guides" className="rounded-lg data-[state=active]:shadow-sm gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Guides
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg data-[state=active]:shadow-sm gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="faqs" className="rounded-lg data-[state=active]:shadow-sm gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GUIDES.map((guide, i) => (
              <Link key={guide.slug} href={`/resources/${guide.slug}`}>
                <Card
                  className="group card-lift border-border/50 hover:border-primary/30 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${guide.gradient} ring-1 ring-border/50 group-hover:scale-110 transition-transform shrink-0`}
                      >
                        <guide.icon className={`h-6 w-6 ${guide.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {guide.title}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                          {guide.description}
                        </p>
                        <Badge variant="secondary" className="text-[10px] rounded-full">
                          {guide.readTime}
                        </Badge>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((template, i) => (
              <Card
                key={template.title}
                className="group card-lift border-border/50 hover:border-primary/30 overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${template.gradient} ring-1 ring-border/50 group-hover:scale-110 transition-transform shrink-0`}
                    >
                      <template.icon className={`h-6 w-6 ${template.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {template.title}
                        </h3>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-full">
                          {template.format}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faqs">
          <div className="max-w-3xl space-y-3">
            {FAQS.map((faq, i) => (
              <FaqItem key={faq.question} faq={faq} i={i} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}