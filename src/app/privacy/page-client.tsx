import Link from "next/link";
import { ShieldCheck, GitBranch, Database, MessageSquare } from "lucide-react";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";

export function PrivacyPageClient() {
  return <PageShell className="max-w-3xl"><ToolHeader title="Privacy Policy" description="Understand what stays on your device and which features use online services." />
    <p className="mb-8 text-xs text-muted-foreground">Last updated: October 28, 2026</p>
    <div className="space-y-8 text-sm leading-7 text-muted-foreground">
      <section><h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground"><ShieldCheck className="size-5 text-primary" />Browser processing</h2><p>Browser-based tools process submitted content on your device. Not every feature is local: AI requests and account synchronization use online services. Check a feature’s processing information before submitting sensitive content.</p></section>
      <section><h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground"><GitBranch className="size-5 text-primary" />Workflows</h2><p>Workflow steps operate on local files and pass intermediate results directly between browser processors. Workflow file content is not uploaded to our servers. Input files and results are not intentionally saved between page reloads; browser storage and caching implementations may vary.</p><p className="mt-2">Saved workflow definitions—including names and configured options—are stored in this browser’s local storage. They are not synchronized to your account. Export definitions for backup, and remove saved definitions on shared devices when needed.</p></section>
      <section><h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground"><MessageSquare className="size-5 text-primary" />AI Chat</h2><p>AI Chat is an app. Requests are transmitted to configured AI providers for processing. Account-based conversation synchronization may store conversations. Do not submit confidential information without considering the provider’s policies.</p></section>
      <section><h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground"><Database className="size-5 text-primary" />Account and website data</h2><p>Authentication, favorites, history and supported account preferences use Firebase. Analytics may be enabled for website usage; workflow file content is not included in workflow analytics events. You can manage supported account settings in <Link href="/settings" className="text-primary underline">Settings</Link>.</p></section>
      <section className="border-t pt-6"><h2 className="mb-3 text-lg font-semibold text-foreground">Questions and removal requests</h2><p>Contact us through <Link href="/contact" className="text-primary underline">Contact & Feedback</Link> for questions or permanent data-removal requests. Stored account inactivity/deletion-request flags do not automatically revoke sessions or erase accounts.</p></section>
    </div>
  </PageShell>;
}
