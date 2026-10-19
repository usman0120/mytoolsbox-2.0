"use client";

import { useState } from "react";
import { useChatStore } from "../chat-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PanelLeft,
  PanelLeftClose,
  Share2,
  Plus,

  Copy,
  FileText,
  Download,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

interface ChatHeaderProps {
  creditsRemaining: number | null;
  onNewChat: () => void;
  availableProviders?: string[];
}

export function ChatHeader({
  creditsRemaining,
  onNewChat,
}: ChatHeaderProps) {
  const { t } = useI18n();
  const {
    isSidebarOpen,
    toggleSidebar,
    getActiveConversation,
    renameConversation,
  } = useChatStore();

  const activeConv = getActiveConversation();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(activeConv?.title || "New Chat");
  const [copied, setCopied] = useState(false);

  const totalWords = activeConv
    ? activeConv.messages.reduce(
        (acc, m) =>
          acc + (m.content.trim() ? m.content.trim().split(/\s+/).length : 0),
        0
      )
    : 0;

  const handleTitleSubmit = () => {
    if (activeConv && titleValue.trim()) {
      renameConversation(activeConv.id, titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const getFormattedMarkdown = () => {
    if (!activeConv) return "";
    return (
      `# ${activeConv.title}\n\n` +
      activeConv.messages
        .map(
          (m) =>
            `### ${m.role === "user" ? "User" : `AI (${m.provider || "Assistant"})`}\n\n${m.content}\n\n---\n`
        )
        .join("\n")
    );
  };

  const handleCopyChat = async () => {
    if (!activeConv || activeConv.messages.length === 0) {
      toast.error("No messages to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(getFormattedMarkdown());
      setCopied(true);
      toast.success("Conversation copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy conversation");
    }
  };

  const handleExportMarkdown = () => {
    if (!activeConv || activeConv.messages.length === 0) {
      toast.error("No messages to export");
      return;
    }
    const text = getFormattedMarkdown();
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeConv.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported as Markdown (.md)");
  };

  const handleExportText = () => {
    if (!activeConv || activeConv.messages.length === 0) {
      toast.error("No messages to export");
      return;
    }
    const text = activeConv.messages
      .map((m) => `[${m.role.toUpperCase()}]:\n${m.content}\n`)
      .join("\n----------------------------------------\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeConv.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported as Plain Text (.txt)");
  };

  const handleExportJSON = () => {
    if (!activeConv) return;
    const blob = new Blob([JSON.stringify(activeConv, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeConv.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported as JSON (.json)");
  };

  return (
    <header className="flex items-center justify-between px-3 md:px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-xs sticky top-0 z-10 shrink-0">
      {/* Left: Sidebar Toggle + Title */}
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Collapse chat history" : "Open chat history"}
          aria-expanded={isSidebarOpen}
          className="h-11 w-11 rounded-md hover:bg-muted shrink-0"
          title={isSidebarOpen ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
          ) : (
            <PanelLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>

        {/* Title / Inline Edit */}
        <div className="min-w-0 flex items-center gap-2">
          {isEditingTitle && activeConv ? (
            <input
              type="text"
              aria-label="Conversation title"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSubmit();
                if (e.key === "Escape") setIsEditingTitle(false);
              }}
              autoFocus
              className="text-base min-w-0 w-full font-semibold bg-background border border-input rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <button
              onClick={() => {
                if (activeConv) {
                  setTitleValue(activeConv.title);
                  setIsEditingTitle(true);
                }
              }}
              suppressHydrationWarning
              className="text-sm font-semibold text-foreground hover:text-primary truncate min-w-0 text-left"
              title="Click to rename chat"
            >
              {activeConv ? activeConv.title : "New Chat"}
            </button>
          )}

          {activeConv && activeConv.messages.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              <Badge
                variant="outline"
                suppressHydrationWarning
                className="text-[10px] px-1.5 h-4.5 rounded-full font-mono text-muted-foreground border-border/60"
              >
                {activeConv.messages.length} msgs
              </Badge>
              {totalWords > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 h-4.5 rounded-full font-mono text-muted-foreground/80 border-border/50 hidden md:inline-flex"
                >
                  {totalWords.toLocaleString()} words
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Credits Badge, New Chat, Export / Share */}
      <div className="flex items-center gap-1 shrink-0">
        {creditsRemaining !== null && <span className="hidden sm:inline text-xs text-muted-foreground">{creditsRemaining.toLocaleString()} credits</span>}



        {/* New Chat Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onNewChat}
          aria-label={t("ai_new_chat", "New chat")}
          className="h-11 w-11 rounded-md border-border/60 hover:bg-muted"
          title="Start new chat"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Export / Share Dropdown */}
        {activeConv && activeConv.messages.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Export or share conversation"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              title="Export or share conversation"
            >
              <Share2 className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-lg p-1.5 text-sm">
              <div className="px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                Export & Share
              </div>
              <DropdownMenuItem
                onClick={handleCopyChat}
                className="gap-2 cursor-pointer rounded-md p-2"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-primary" />
                )}
                <span>Copy Full Chat</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleExportMarkdown}
                className="gap-2 cursor-pointer rounded-md p-2"
              >
                <Download className="h-3.5 w-3.5 text-blue-500" />
                <span>Export Markdown (.md)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportText}
                className="gap-2 cursor-pointer rounded-md p-2"
              >
                <FileText className="h-3.5 w-3.5 text-neutral-400" />
                <span>Export Plain Text (.txt)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportJSON}
                className="gap-2 cursor-pointer rounded-md p-2"
              >
                <Download className="h-3.5 w-3.5 text-amber-500" />
                <span>Export JSON (.json)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
