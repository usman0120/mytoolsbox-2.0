"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";
import {
  Mail,
  MessageSquare,
  ExternalLink,
  AtSign,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import type { FeedbackType } from "@/types/user";
import { useI18n } from "@/lib/i18n";

export function ContactPageClient() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<FeedbackType>("feedback");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: message.trim(),
          name: name.trim() || "Anonymous",
          email: email.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send message");
      }

      setSubmitted(true);
      toast.success("Message sent! We'll get back to you soon.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell className="max-w-4xl">
      {/* Header */}
      <ToolHeader title={t("contact_title")} description={t("contact_subtitle")} />

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Contact methods */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Get in Touch</h2>

          <a
            href="mailto:hello@mytoolsbox.me"
            className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-0.5">Email</h3>
              <p className="text-sm text-muted-foreground">hello@mytoolsbox.me</p>
              <p className="text-xs text-muted-foreground mt-1">
                General inquiries, support, feedback
              </p>
            </div>
          </a>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <ExternalLink className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-0.5">GitHub</h3>
              <p className="text-sm text-muted-foreground">Open an issue or discussion</p>
              <p className="text-xs text-muted-foreground mt-1">
                Bug reports, feature requests, contributions
              </p>
            </div>
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <AtSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-0.5">Twitter / X</h3>
              <p className="text-sm text-muted-foreground">Follow for updates</p>
              <p className="text-xs text-muted-foreground mt-1">
                Announcements, tips, community
              </p>
            </div>
          </a>
        </div>

        {/* FAQ quick links */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Quick Answers</h2>

          <div className="space-y-4">
            {[
              {
                q: "Is it really free?",
                a: "Availability and limits depend on the tool. AI features use credits; review the tool or account details before use.",
              },
              {
                q: "Do I need an account?",
                a: "Many tools are available without signing in. Account features and tools marked as requiring authentication need a sign-in.",
              },
              {
                q: "Are my files safe?",
                a: "Processing depends on the tool. Browser-based operations run locally, while server and AI features send data to their services. Review the tool's processing information and privacy policy before submitting sensitive data.",
              },
              {
                q: "Can I request a tool?",
                a: "Yes! We love hearing what tools would make your life easier. Email us or open a GitHub issue with your idea.",
              },
              {
                q: "How do I report a bug?",
                a: "The fastest way is to open an issue on GitHub with details about what happened. You can also email us directly.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group py-3 border-b border-border/50"
              >
                <summary className="font-semibold text-sm cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <MessageSquare className="h-4 w-4 text-muted-foreground group-open:hidden" />
                </summary>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <section className="mb-6 border-t border-border pt-5">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Send className="h-5 w-5" />
            {t("contact_send")}
          </h2>
        </div>
        <div>
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
              <h3 className="text-lg font-semibold">{t("contact_sent")}</h3>
              <p className="text-muted-foreground">
                Thanks for reaching out. We&apos;ll get back to you soon.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setEmail("");
                  setMessage("");
                  setType("feedback");
                }}
              >
                {t("contact_send")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">{t("contact_name")}</Label>
                  <Input
                    id="contact-name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">{t("contact_email")}</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-type">{t("contact_type")}</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as FeedbackType)}
                >
                  <SelectTrigger id="contact-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feedback">General Feedback</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message">{t("contact_message")} *</Label>
                <Textarea
                  id="contact-message"
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting || !message.trim()}>
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {t("contact_send")}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Response time */}
      <div className="py-4 border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          We typically respond within{" "}
          <strong className="text-foreground">24-48 hours</strong>.
          For urgent issues, please include &ldquo;Urgent&rdquo; in your subject line.
        </p>
      </div>
    </PageShell>
  );
}