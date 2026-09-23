"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Search, Download, Pin, Eye, Edit3, Tag, X, FileText, Check, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Note,
  generateNoteId,
  calculateNoteStats,
  filterAndSortNotes,
  extractAllTags,
} from "@/features/tools/notes-app";

const STORAGE_KEY = "mytoolsbox-notes-app";

export function NotesAppEngine() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: "note_welcome",
        title: "Welcome to Notes",
        content: "# Welcome to Notes!\n\nThis is your private, offline markdown notepad.\n\n- Supports full **Markdown** formatting\n- Organize with #tags\n- Pin critical notes to the top\n- Auto-saves locally to your browser",
        tags: ["welcome", "guide"],
        pinned: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
  });

  const [selectedId, setSelectedId] = useState<string | null>(() => notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [newTagInput, setNewTagInput] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find((n) => n.id === selectedId) || notes[0];

  const handleCreateNote = () => {
    const newNote: Note = {
      id: generateNoteId(),
      title: "Untitled Note",
      content: "",
      tags: [],
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
    setActiveTab("edit");
    toast.success("New note created!");
  };

  const handleUpdateActiveNote = (fields: Partial<Note>) => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === activeNote.id ? { ...n, ...fields, updatedAt: Date.now() } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    if (notes.length <= 1) {
      toast.error("You must keep at least one note.");
      return;
    }
    const filtered = notes.filter((n) => n.id !== id);
    setNotes(filtered);
    if (selectedId === id) {
      setSelectedId(filtered[0]?.id || null);
    }
    toast.success("Note deleted.");
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n))
    );
  };

  const handleAddTag = () => {
    if (!newTagInput.trim() || !activeNote) return;
    const tag = newTagInput.trim().toLowerCase().replace(/^#/, "");
    if (!activeNote.tags.includes(tag)) {
      handleUpdateActiveNote({ tags: [...activeNote.tags, tag] });
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeNote) return;
    handleUpdateActiveNote({ tags: activeNote.tags.filter((t) => t !== tagToRemove) });
  };

  const handleExportNote = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeNote.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Note exported as Markdown!");
  };

  const filteredNotes = filterAndSortNotes(notes, searchQuery, selectedTag);
  const allTags = extractAllTags(notes);
  const stats = calculateNoteStats(activeNote?.content || "");

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Notes
          </h2>
          <p className="text-sm text-muted-foreground">Markdown notes with tags, instant search, and local storage</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateNote} size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> New Note
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportNote} disabled={!activeNote} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export MD
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Sidebar list (4 cols) */}
        <div className="md:col-span-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center max-h-16 overflow-y-auto">
              <Badge
                variant={selectedTag === "all" ? "default" : "outline"}
                className="cursor-pointer text-[10px] px-2 py-0.5"
                onClick={() => setSelectedTag("all")}
              >
                All
              </Badge>
              {allTags.map((t) => (
                <Badge
                  key={t}
                  variant={selectedTag === t ? "default" : "outline"}
                  className="cursor-pointer text-[10px] px-2 py-0.5"
                  onClick={() => setSelectedTag(t)}
                >
                  #{t}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedId(note.id)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                  activeNote?.id === note.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted/50 border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold truncate">{note.title || "Untitled Note"}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {note.pinned && <Pin className="h-3 w-3 text-primary fill-primary" />}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="text-muted-foreground hover:text-destructive p-0.5"
                      title="Delete note"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">
                  {note.content.replace(/^[#\s*-]+/, "") || "Empty note"}
                </p>
                <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  {note.tags.length > 0 && (
                    <div className="flex gap-1 truncate">
                      {note.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-primary/80">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note Editor / Preview (8 cols) */}
        {activeNote ? (
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Input
                value={activeNote.title}
                onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                placeholder="Note Title"
                className="text-base font-bold h-9 flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleTogglePin(activeNote.id)}
                className={activeNote.pinned ? "text-primary" : "text-muted-foreground"}
                title={activeNote.pinned ? "Unpin note" : "Pin note to top"}
              >
                <Pin className={`h-4 w-4 ${activeNote.pinned ? "fill-primary" : ""}`} />
              </Button>
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
              {activeNote.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
                  #{t}
                  <X className="h-2.5 w-2.5 cursor-pointer hover:text-destructive" onClick={() => handleRemoveTag(t)} />
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  placeholder="Add tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  className="h-6 w-24 text-[10px] px-1.5"
                />
                <Button size="sm" variant="ghost" onClick={handleAddTag} className="h-6 text-[10px] px-1.5">
                  Add
                </Button>
              </div>
            </div>

            {/* Editor vs Preview Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
              <div className="flex items-center justify-between border-b pb-1">
                <TabsList className="h-7">
                  <TabsTrigger value="edit" className="text-xs h-6 gap-1">
                    <Edit3 className="h-3 w-3" /> Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs h-6 gap-1">
                    <Eye className="h-3 w-3" /> Preview
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                  <span>{stats.wordCount} words</span>
                  <span>{stats.charCount} chars</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" /> {stats.readingTimeMinutes}m read
                  </span>
                </div>
              </div>

              <TabsContent value="edit" className="mt-2">
                <Textarea
                  value={activeNote.content}
                  onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                  placeholder="Type your markdown notes here..."
                  className="font-mono text-xs min-h-[360px] leading-relaxed resize-y"
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-2">
                <Card>
                  <CardContent className="p-4 min-h-[360px] prose dark:prose-invert max-w-none text-xs">
                    <pre className="whitespace-pre-wrap font-sans leading-relaxed text-xs">
                      {activeNote.content || "*Empty note*"}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="md:col-span-8 p-12 text-center text-muted-foreground border rounded-xl">
            Select a note or create a new one to begin.
          </div>
        )}
      </div>
    </div>
  );
}