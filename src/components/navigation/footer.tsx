"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import { Heart, Globe, ExternalLink, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { LanguageSwitcher } from "@/components/common/language-switcher";

export function Footer() {
  const pathname = usePathname();
  const { user, isAnonymous } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When on AI workspace or logged in, hide footer completely
  if (pathname === "/ai" || (mounted && user && !isAnonymous)) {
    return null;
  }

  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group" aria-label={`${SITE_CONFIG.name} home`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 ring-1 ring-primary/25 group-hover:scale-105 transition-transform shadow-xs">
                <img
                  src="/mytoolsbox logo.png"
                  alt={SITE_CONFIG.name}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <span className="font-bold text-base tracking-tight">{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Free online tools and next-gen AI workspace for everyday tasks. Private, fast, and multi-provider.
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
              <Link href="/hubs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Hubs
              </Link>
              <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Resources
              </Link>
            </div>
          </nav>

          {/* AI Features */}
          <nav aria-label="AI Platform links">
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI Suite
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Chat Workspace
              </Link>
              <Link href="/ai/prompts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Prompt Library (160+)
              </Link>
              <Link href="/ai/compare" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Compare Models
              </Link>
              <Link href="/ai/personas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Personas & Tools
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

          {/* Legal & Info */}
          <nav aria-label="Legal links">
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground">
              Company
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="footer" />
            <p>
              &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
            </p>
          </div>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline" /> for everyday creators & developers
          </p>
        </div>
      </div>
    </footer>
  );
}