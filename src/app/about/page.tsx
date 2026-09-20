import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${SITE_CONFIG.name} — our mission, team, and why we build free online tools for everyone.`,
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          About {SITE_CONFIG.name}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {SITE_CONFIG.tagline}
        </p>
      </div>

      {/* Mission */}
      <section className="mb-16 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4">
          <p>
            We believe everyone should have access to powerful, easy-to-use tools — without
            paywalls, sign-ups, or privacy concerns. {SITE_CONFIG.name} was built to be the
            one place where you can handle everyday digital tasks quickly and securely.
          </p>
          <p>
            Every tool runs directly in your browser. Your files never leave your device.
            No accounts required. No ads that track you. Just useful things, freely available
            to everyone.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="mb-16 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <h2 className="text-xl font-semibold mb-6">What We Stand For</h2>
        <div className="grid gap-6">
          {[
            {
              title: "Privacy First",
              description:
                "All processing happens client-side. Your documents, images, and data never touch our servers. We can't see your files — by design.",
            },
            {
              title: "Free Forever",
              description:
                "Core tools are free with no hidden fees. We may offer optional premium features in the future, but the essentials will always be free.",
            },
            {
              title: "No Sign-Up Required",
              description:
                "Jump in and use any tool instantly. No email, no password, no friction. Just open the page and get things done.",
            },
            {
              title: "Works Offline",
              description:
                "Most tools work without an internet connection. Calculators, converters, text tools, and more are available anywhere, anytime.",
            },
            {
              title: "Accessible to All",
              description:
                "We design for everyone — screen reader users, keyboard navigators, and people with diverse needs. Accessibility is not an afterthought.",
            },
            {
              title: "Open & Transparent",
              description:
                "We share how our tools work, what data (if any) is collected, and how we sustain the platform. No dark patterns, no surprises.",
            },
          ].map((principle, i) => (
            <div
              key={principle.title}
              className="p-5 rounded-xl border border-border/50 bg-card/50"
            >
              <h3 className="font-semibold text-sm mb-1.5">{principle.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mb-16 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
        <h2 className="text-xl font-semibold mb-4">Our Story</h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4">
          <p>
            {SITE_CONFIG.name} started with a simple observation: too many online tools
            require accounts, upload your files to the cloud, or bombard you with ads.
            We wanted something different — a clean, fast, private toolbox that respects
            you and your time.
          </p>
          <p>
            Built with modern web technologies, every tool processes data locally in your
            browser using WebAssembly, Web Workers, and the Canvas API. This means instant
            results, complete privacy, and the ability to work offline.
          </p>
          <p>
            We&apos;re constantly adding new tools and improving existing ones based on
            community feedback. If there&apos;s something you&apos;d like to see, we&apos;d
            love to hear from you.
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center pt-8 border-t border-border/50 animate-fade-in-up" style={{ animationDelay: "240ms" }}>
        <p className="text-muted-foreground mb-4">Have questions or feedback?</p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Get in touch →
        </a>
      </div>
    </div>
  );
}