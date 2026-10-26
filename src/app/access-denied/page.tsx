import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BrandLogo } from "@/components/common/brand-logo";

export const metadata: Metadata = { title: "Access restricted", robots: { index: false, follow: false } };

export default function AccessDenied() {
  return <section className="mx-auto max-w-xl px-6 py-20 text-center">
    <BrandLogo className="mx-auto mb-8 h-14" />
    <ShieldAlert className="mx-auto mb-4 size-10 text-primary" />
    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Restricted area</p>
    <h1 className="text-3xl font-semibold tracking-tight">This page is for administrators</h1>
    <p className="mt-4 text-sm leading-7 text-muted-foreground">Your account does not have access to the admin panel. You can still explore tools, apps, and your own workspace.</p>
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <Link href="/tools" className={buttonVariants({ className: "h-11 px-5" })}>Explore tools</Link>
      <Link href="/settings" className={buttonVariants({ variant: "outline", className: "h-11 px-5" })}>My settings</Link>
    </div>
  </section>;
}
