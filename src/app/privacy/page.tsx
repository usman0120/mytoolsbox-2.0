import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_CONFIG.name} handles your data — our commitment to privacy, what we collect, and how we protect you.`,
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Your privacy is the foundation of {SITE_CONFIG.name}
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-8">
        {/* Last updated */}
        <p className="text-sm text-muted-foreground animate-fade-in-up">
          Last updated: September 20, 2026
        </p>

        {/* Overview */}
        <section className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <h2 className="text-xl font-semibold text-foreground">1. Our Approach to Privacy</h2>
          <p>
            {SITE_CONFIG.name} is designed from the ground up to protect your privacy.
            The vast majority of our tools process your data entirely within your browser —
            your files, text, images, and other content never leave your device and are
            never uploaded to our servers.
          </p>
          <p>
            We believe you shouldn&apos;t have to trade privacy for utility. This policy
            explains what little data we do collect and how we handle it.
          </p>
        </section>

        {/* Data we collect */}
        <section className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <h2 className="text-xl font-semibold text-foreground">2. What We Collect</h2>

          <h3 className="text-base font-semibold text-foreground">2.1 Automatically</h3>
          <ul>
            <li>
              <strong>Anonymous usage analytics</strong> — We use a privacy-focused
              analytics service that does not use cookies or track you across sites.
              We collect page views and tool usage counts to understand what people
              find useful.
            </li>
            <li>
              <strong>Technical logs</strong> — Our hosting provider may log IP
              addresses and request data temporarily for security and debugging.
              These logs are not used for tracking and are automatically purged.
            </li>
          </ul>

          <h3 className="text-base font-semibold text-foreground">2.2 When You Sign In (Optional)</h3>
          <ul>
            <li>
              <strong>Account information</strong> — If you choose to create an account,
              we store your email address and a display name. We use Firebase
              Authentication, which handles login credentials securely.
            </li>
            <li>
              <strong>Preferences</strong> — Your theme preference, favorite tools,
              and settings are stored to personalize your experience.
            </li>
            <li>
              <strong>Usage history</strong> — If signed in, we may store your tool
              usage history so you can revisit past work. This is optional and can
              be cleared at any time.
            </li>
          </ul>

          <h3 className="text-base font-semibold text-foreground">2.3 What We NEVER Collect</h3>
          <ul>
            <li>Your files, documents, or images processed by our tools</li>
            <li>Your passwords or sensitive form data</li>
            <li>Your browsing history on other websites</li>
            <li>Your precise location</li>
          </ul>
        </section>

        {/* How we use data */}
        <section className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          <h2 className="text-xl font-semibold text-foreground">3. How We Use Data</h2>
          <ul>
            <li>To improve our tools based on usage patterns</li>
            <li>To fix bugs and maintain service reliability</li>
            <li>To personalize your experience (if signed in)</li>
            <li>To communicate service updates (only if you opt in)</li>
          </ul>
          <p>
            We never sell, rent, or share your personal data with third parties for
            advertising or any other purpose.
          </p>
        </section>

        {/* Cookies */}
        <section className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
          <h2 className="text-xl font-semibold text-foreground">4. Cookies & Storage</h2>
          <p>
            We use minimal local storage (not tracking cookies) to remember your
            preferences:
          </p>
          <ul>
            <li>
              <strong>Theme preference</strong> — Stored in localStorage so your
              light/dark mode choice persists.
            </li>
            <li>
              <strong>Authentication token</strong> — If you sign in, Firebase stores
              a session token in IndexedDB (not a cookie).
            </li>
            <li>
              <strong>Tool state</strong> — Some tools save your progress locally so
              you don&apos;t lose work if you close the tab.
            </li>
          </ul>
          <p>
            We do not use third-party tracking cookies. There are no advertising
            cookies on {SITE_CONFIG.name}.
          </p>
        </section>

        {/* Third parties */}
        <section className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <h2 className="text-xl font-semibold text-foreground">5. Third-Party Services</h2>
          <p>We use the following services that may process limited data:</p>
          <ul>
            <li>
              <strong>Firebase (Google)</strong> — Authentication and optional data
              storage for signed-in users. Subject to Google&apos;s privacy policy.
            </li>
            <li>
              <strong>AI Providers</strong> — If you use AI-powered tools, your
              prompts are sent to AI API providers for processing. Prompts are not
              stored or used for training by these providers.
            </li>
            <li>
              <strong>Hosting Provider</strong> — Our web host may process IP
              addresses as part of standard server operations.
            </li>
          </ul>
        </section>

        {/* Your rights */}
        <section className="animate-fade-in-up" style={{ animationDelay: "360ms" }}>
          <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
          <ul>
            <li>
              <strong>Access</strong> — You can request a copy of any personal data
              we hold about you.
            </li>
            <li>
              <strong>Deletion</strong> — You can delete your account and all
              associated data at any time from your account settings.
            </li>
            <li>
              <strong>Opt-out</strong> — You can use all tools without signing in.
              No data is collected from anonymous users beyond basic analytics.
            </li>
            <li>
              <strong>Questions</strong> — Contact us at any time about privacy
              concerns.
            </li>
          </ul>
        </section>

        {/* Changes */}
        <section className="animate-fade-in-up" style={{ animationDelay: "420ms" }}>
          <h2 className="text-xl font-semibold text-foreground">7. Changes to This Policy</h2>
          <p>
            We may update this policy occasionally. Significant changes will be
            announced on the site. Continued use after changes constitutes acceptance.
          </p>
        </section>

        {/* Contact */}
        <section className="animate-fade-in-up" style={{ animationDelay: "480ms" }}>
          <h2 className="text-xl font-semibold text-foreground">8. Contact</h2>
          <p>
            For privacy-related questions, contact us at{" "}
            <a href="mailto:privacy@mytoolsbox.me" className="text-primary hover:underline">
              privacy@mytoolsbox.me
            </a>
            {" "}or visit our{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}