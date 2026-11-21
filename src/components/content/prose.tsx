import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { guideToolHref } from "@/content/guides";

/** Old /tools/{slug} links in content point straight at the tool's current page. */
const resolve = (href: string) => (/^\/tools\/[a-z0-9-]+/.test(href) ? guideToolHref(href.slice(7).split(/[?#]/)[0]) : href);

/** Server-rendered Markdown for guides. Raw HTML in content is never rendered. */
export function Prose({ text, className }: { text: string; className?: string }) {
  return (
    <div
      className={cn(
        "space-y-4 text-[16px] leading-[1.75] text-foreground/90",
        "[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:font-semibold [&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[14px]",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-muted [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left",
        "[&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href = "", children }) =>
            href.startsWith("/") ? (
              <Link href={resolve(href)} className="font-medium underline underline-offset-4">
                {children}
              </Link>
            ) : (
              <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="font-medium underline underline-offset-4">
                {children}
              </a>
            ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
