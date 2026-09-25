"use client";

import { useState, useMemo } from "react";
import { useChatStore } from "../chat-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  PinOff,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Download,

  Sparkles,
  ChevronLeft,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { ChatConversation } from "../types";

interface ChatSidebarProps {
  creditsRemaining: number | null;
  onNewChat: () => void;
  className?: string;
}

export function ChatSidebar({
  creditsRemaining,
  onNewChat,
  className = "",
}: ChatSidebarProps) {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    deleteConversation,
    renameConversation,
    pinConversation,
    duplicateConversation,
    clearAllConversations,
    searchQuery,
    setSearchQuery,
    isSidebarOpen,
    setSidebarOpen,
  } = useChatStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Group conversations by time period
  const { pinned, today, yesterday, last7Days, last30Days, older } =
    useMemo(() => {
      const q = searchQuery.toLowerCase().trim();
      const filtered = conversations.filter((c) => {
        if (!q) return !c.isArchived;
        return (
          !c.isArchived &&
          (c.title.toLowerCase().includes(q) ||
            c.messages.some((m) => m.content.toLowerCase().includes(q)))
        );
      });

      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();
      const startOfYesterday = startOfToday - 86400000;
      const startOf7Days = startOfToday - 86400000 * 7;
      const startOf30Days = startOfToday - 86400000 * 30;

      const pinnedList: ChatConversation[] = [];
      const todayList: ChatConversation[] = [];
      const yesterdayList: ChatConversation[] = [];
      const last7DaysList: ChatConversation[] = [];
      const last30DaysList: ChatConversation[] = [];
      const olderList: ChatConversation[] = [];

      filtered.forEach((conv) => {
        if (conv.isPinned) {
          pinnedList.push(conv);
          return;
        }
        const time = conv.updatedAt || conv.createdAt;
        if (time >= startOfToday) {
          todayList.push(conv);
        } else if (time >= startOfYesterday) {
          yesterdayList.push(conv);
        } else if (time >= startOf7Days) {
          last7DaysList.push(conv);
        } else if (time >= startOf30Days) {
          last30DaysList.push(conv);
        } else {
          olderList.push(conv);
        }
      });

      return {
        pinned: pinnedList,
        today: todayList,
        yesterday: yesterdayList,
        last7Days: last7DaysList,
        last30Days: last30DaysList,
        older: olderList,
      };
    }, [conversations, searchQuery]);

  const handleStartRename = (conv: ChatConversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
      toast.success("Chat renamed");
    }
    setEditingId(null);
  };

  const handleExportChat = (conv: ChatConversation) => {
    const markdown = `# ${conv.title}\n\n*Created: ${new Date(
      conv.createdAt
    ).toLocaleString()}*\n*Provider: ${conv.provider}*\n\n---\n\n` +
      conv.messages
        .map(
          (m) =>
            `### ${m.role === "user" ? "User" : "Assistant"}\n\n${m.content}\n\n`
        )
        .join("---\n\n");

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${conv.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "chat"}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Chat exported as Markdown");
  };

  const renderGroup = (title: string, list: ChatConversation[], icon?: React.ReactNode) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="flex items-center gap-1.5 px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {icon}
          <span>{title}</span>
          <span className="ml-auto text-[10px] font-normal opacity-60">
            {list.length}
          </span>
        </div>
        <div className="space-y-0.5">
          {list.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
                onClick={() => {
                  if (!isEditing) setActiveConversation(conv.id);
                }}
              >
                {conv.isPinned ? (
                  <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                )}

                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveRename(conv.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => handleSaveRename(conv.id)}
                    autoFocus
                    className="flex-1 bg-background px-1.5 py-0.5 rounded border border-primary/50 text-foreground text-xs focus:outline-hidden"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="flex-1 truncate">{conv.title || "Untitled Chat"}</span>
                )}

                {/* Dropdown Menu */}
                <div
                  className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center ${
                    isActive ? "opacity-100" : ""
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground outline-none transition-colors">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl text-xs">
                      <DropdownMenuItem
                        onClick={() => pinConversation(conv.id)}
                        className="gap-2 cursor-pointer"
                      >
                        {conv.isPinned ? (
                          <>
                            <PinOff className="h-3.5 w-3.5" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="h-3.5 w-3.5" />
                            Pin to Top
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStartRename(conv)}
                        className="gap-2 cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => duplicateConversation(conv.id)}
                        className="gap-2 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExportChat(conv)}
                        className="gap-2 cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Export (.md)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteConversation(conv.id)}
                        className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside
      className={`flex flex-col h-full bg-muted/20 border-r border-border/50 transition-all duration-300 ${
        isSidebarOpen ? "w-64 md:w-72" : "w-0 overflow-hidden border-none"
      } ${className}`}
    >
      {/* Top Bar: New Chat & Search */}
      <div className="p-3 space-y-2 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-xs text-muted-foreground px-1">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <span>Chat History</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-6 w-6 rounded-md md:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full justify-start rounded-xl gap-2 font-medium shadow-xs h-9 text-xs"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="h-8 pl-8 pr-7 text-xs rounded-lg bg-background/60 border-border/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 min-h-0 [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.25)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
        {conversations.length === 0 ? (
          <div className="text-center py-12 px-4 text-xs text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No chats yet.</p>
            <p className="mt-1 opacity-70">Start a new conversation to save it here.</p>
          </div>
        ) : (
          <>
            {renderGroup("Pinned", pinned, <Pin className="h-3 w-3 text-amber-500" />)}
            {renderGroup("Today", today)}
            {renderGroup("Yesterday", yesterday)}
            {renderGroup("Previous 7 Days", last7Days)}
            {renderGroup("Previous 30 Days", last30Days)}
            {renderGroup("Older", older)}
          </>
        )}
      </div>

      {/* Footer / Account & Storage Status */}
      <div className="p-3 border-t border-border/50 bg-background/50 space-y-2">
        

        {conversations.length > 0 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground">
              {conversations.length} saved {conversations.length === 1 ? "chat" : "chats"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to clear all chat history?")) {
                  clearAllConversations();
                  toast.success("All chats cleared");
                }
              }}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
