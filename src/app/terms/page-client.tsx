import Link from "next/link";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";

export function TermsPageClient() {
  return <PageShell className="max-w-3xl"><ToolHeader title="Terms of Service" description="Terms for using MyToolsBox tools, apps and workflows." /><p className="mb-8 text-xs text-muted-foreground">Last updated: October 28, 2026</p>
    <div className="space-y-7 text-sm leading-7 text-muted-foreground">
      <section><h2 className="mb-2 text-lg font-semibold text-foreground">1. Using the service</h2><p>By using MyToolsBox, you agree to these terms. Use the service lawfully and only process content you are authorized to use. Feature access, credits, sign-in and connectivity requirements vary.</p></section>
      <section><h2 className="mb-2 text-lg font-semibold text-foreground">2. Your content and workflows</h2><p>Your files, text and data remain yours. Workflows process files locally; saved workflow definitions are stored on this device. You are responsible for backups, input order, chosen operations and inspecting outputs. Page reloads clear unsaved input files and results.</p></section>
      <section><h2 className="mb-2 text-lg font-semibold text-foreground">3. Output limitations</h2><p>Results depend on the source files, settings and browser capabilities. Compression can reduce quality or dimensions. Rasterizing PDFs removes searchable text; editing PDFs can invalidate signatures or change interactive features. Size-target workflows stop with an error when a limit cannot be met. Review results before relying on them.</p></section>
      <section><h2 className="mb-2 text-lg font-semibold text-foreground">4. AI and online services</h2><p>AI responses may be inaccurate and require independent verification. AI requests use configured providers and may consume credits. Do not treat generated content as authoritative legal, medical or financial advice. See the <Link href="/privacy" className="text-primary underline">Privacy Policy</Link> for processing differences.</p></section>
      <section><h2 className="mb-2 text-lg font-semibold text-foreground">5. Availability and support</h2><p>The service is provided without a guarantee of uninterrupted availability or suitability for a particular purpose. Report issues or ask questions through <Link href="/contact" className="text-primary underline">Contact & Feedback</Link>.</p></section>
    </div>
  </PageShell>;
}
