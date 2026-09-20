import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms and conditions for using ${SITE_CONFIG.name} — acceptable use, disclaimers, and your responsibilities.`,
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Using {SITE_CONFIG.name} — simple, fair, and transparent
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-8">
        <p className="text-sm text-muted-foreground animate-fade-in-up">
          Last updated: September 20, 2026
        </p>

        {/* Acceptance */}
        <section className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using {SITE_CONFIG.name} (&ldquo;the Service&rdquo;), you
            agree to be bound by these Terms of Service. If you do not agree, please
            do not use the Service.
          </p>
        </section>

        {/* Description */}
        <section className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
          <p>
            {SITE_CONFIG.name} provides free online tools and utilities for document
            processing, image editing, calculations, development, and other tasks.
            Most tools process data locally in your browser. Some features (AI tools,
            cloud processing) may require an internet connection and optional account
            creation.
          </p>
        </section>

        {/* Acceptable use */}
        <section className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          <h2 className="text-xl font-semibold text-foreground">3. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>
              Use the Service for any illegal purpose or in violation of any laws
            </li>
            <li>
              Attempt to disrupt, overload, or compromise the Service or its
              infrastructure
            </li>
            <li>
              Use automated tools (bots, scrapers) in a way that degrades service
              for other users
            </li>
            <li>
              Upload or process content that is illegal, harmful, or infringes on
              others&apos; rights
            </li>
            <li>
              Attempt to bypass any rate limits, security measures, or access
              restrictions
            </li>
            <li>
              Misuse AI features to generate harmful, deceptive, or illegal content
            </li>
          </ul>
          <p>
            We reserve the right to suspend or terminate access for violations of
            these terms.
          </p>
        </section>

        {/* Intellectual property */}
        <section className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
          <h2 className="text-xl font-semibold text-foreground">4. Intellectual Property</h2>
          <p>
            The {SITE_CONFIG.name} name, logo, website design, and original code are
            our intellectual property. You may not copy, modify, or redistribute them
            without permission.
          </p>
          <p>
            <strong>Your content remains yours.</strong> Any files, text, or data you
            process through our tools belong to you. Since processing happens in your
            browser, we never have access to your content.
          </p>
        </section>

        {/* AI tools */}
        <section className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <h2 className="text-xl font-semibold text-foreground">5. AI-Powered Features</h2>
          <p>
            Some tools use third-party AI services. When using these features:
          </p>
          <ul>
            <li>
              Your prompts are sent to AI providers for processing but are not stored
              or used for model training
            </li>
            <li>
              AI-generated content may contain errors or inaccuracies — always verify
              important outputs
            </li>
            <li>
              You are responsible for the content you generate and how you use it
            </li>
            <li>
              AI features may have usage limits based on your account tier
            </li>
          </ul>
        </section>

        {/* Disclaimers */}
        <section className="animate-fade-in-up" style={{ animationDelay: "360ms" }}>
          <h2 className="text-xl font-semibold text-foreground">6. Disclaimers</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
            without warranties of any kind, either express or implied.
          </p>
          <ul>
            <li>
              We strive for accuracy but do not guarantee that tools are error-free
              or that results are always correct
            </li>
            <li>
              We are not responsible for any damages arising from use of the Service
            </li>
            <li>
              We may modify or discontinue features at any time without notice
            </li>
            <li>
              Service availability may be affected by factors beyond our control
            </li>
          </ul>
        </section>

        {/* Limitation of liability */}
        <section className="animate-fade-in-up" style={{ animationDelay: "420ms" }}>
          <h2 className="text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, {SITE_CONFIG.name} and its
            operators shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising from your use of the Service.
          </p>
        </section>

        {/* Changes */}
        <section className="animate-fade-in-up" style={{ animationDelay: "480ms" }}>
          <h2 className="text-xl font-semibold text-foreground">8. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Material changes will be
            communicated on the site. Continued use after changes constitutes
            acceptance of the updated terms.
          </p>
        </section>

        {/* Contact */}
        <section className="animate-fade-in-up" style={{ animationDelay: "540ms" }}>
          <h2 className="text-xl font-semibold text-foreground">9. Contact</h2>
          <p>
            For questions about these terms, contact us at{" "}
            <a href="mailto:terms@mytoolsbox.me" className="text-primary hover:underline">
              terms@mytoolsbox.me
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