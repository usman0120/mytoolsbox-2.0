import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { SITE_CONFIG } from "@/config/site";
import { SPACES } from "@/spaces";
import { FOOTER_PLATFORM_SECTIONS, FOOTER_TOOL_SECTIONS } from "@/lib/navigation/footer-directory";
import { SpaceGlyph } from "./space-glyph";
import { spaceHref } from "./space-links";

const LEGAL = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
  { name: "All tools A–Z", href: "/tools" },
];

/** Server-rendered footer: crawlable links to Spaces, popular tools and legal pages. */
export function SiteFooter() {
  const apps = FOOTER_PLATFORM_SECTIONS.slice(0, 4);
  return (
    <footer className="border-t bg-card pb-[calc(var(--shell-bottom-nav-height)+env(safe-area-inset-bottom))] md:pb-0">
      <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,280px)_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2" aria-label={`${SITE_CONFIG.name} home`}>
              <BrandLogo className="h-7" />
              <span className="font-heading text-base font-semibold tracking-tight">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Get small jobs done. Free, private, no sign-up. Files are processed on your device.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-1">
              {SPACES.map((s) => (
                <li key={s.id}>
                  <Link prefetch={false} href={spaceHref(s.id)} className="group inline-flex items-center gap-2 py-1 text-sm text-muted-foreground hover:text-foreground">
                    <span style={{ color: s.color }}>
                      <SpaceGlyph space={s.id} className="size-4" />
                    </span>
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 xl:grid-cols-5">
            {[...FOOTER_TOOL_SECTIONS, ...apps].map((section) => (
              <nav key={section.title} aria-label={section.title}>
                <h2 className="mb-2.5 font-sans text-[13px] font-semibold tracking-normal">
                  <Link prefetch={false} href={section.href} className="hover:underline">
                    {section.title}
                  </Link>
                </h2>
                <ul className="space-y-0.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link prefetch={false} href={link.href} className="inline-block py-1 text-[13px] text-muted-foreground hover:text-foreground">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_CONFIG.name}. No ads, no paywalls.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL.map((l) => (
              <Link key={l.href} prefetch={false} href={l.href} className="hover:text-foreground">
                {l.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
