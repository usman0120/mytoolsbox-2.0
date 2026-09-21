import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { Heart, Globe, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group" aria-label={`${SITE_CONFIG.name} home`}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20 group-hover:scale-105 transition-transform">
                <img
                  src="/mytoolsbox logo.png"
                  alt={SITE_CONFIG.name}
                  className="h-5 w-5 object-contain"
                />
              </div>
              <span className="font-semibold text-sm">{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Free online tools for everyday tasks. No sign-up required. All processing happens in your browser.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <nav aria-label="Platform links">
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground">
              Platform
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Tools
              </Link>
              <Link href="/apps" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Apps
              </Link>
              <Link href="/workflows" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Workflows
              </Link>
              <Link href="/ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                AI Assistant
              </Link>
              <Link href="/hubs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Hubs
              </Link>
              <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Resources
              </Link>
            </div>
          </nav>

          {/* Categories */}
          <nav aria-label="Category links">
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground">
              Categories
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/tools?category=documents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Documents
              </Link>
              <Link href="/tools?category=images" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Images
              </Link>
              <Link href="/tools?category=developer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Developer
              </Link>
              <Link href="/tools?category=calculators" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Calculators
              </Link>
              <Link href="/tools?category=writing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Writing
              </Link>
            </div>
          </nav>

          {/* Resources */}
          <nav aria-label="Resource links">
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground">
              Resources
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/resources?tab=guides" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Guides
              </Link>
              <Link href="/resources?tab=templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Templates
              </Link>
              <Link href="/resources?tab=faqs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQs
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
            </div>
          </nav>

          {/* Company */}
          <nav aria-label="Company links">
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground">
              Company
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for everyone
          </p>
        </div>
      </div>
    </footer>
  );
}