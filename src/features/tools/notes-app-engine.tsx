"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Search,
  Save,
  Download,
  Upload,
  FileText,
  FileCode,
  Tag,
  X,
  Edit3,
  Check,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "mytoolsbox-notes";

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function NotesAppEngine() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  const selectedNote = notes.find((n) => n.id === selectedId) || null;

  const filteredNotes = searchQuery
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : notes;

  const handleCreate = () => {
    const newNote: Note = {
      id: generateId(),
      title: "Untitled Note",
      content: "",
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setSelectedId(newNote.id);
  };

  const handleUpdate = (field: "title" | "content", value: string) => {
    if (!selectedId) return;
    const updated = notes.map((n) =>
      n.id === selectedId ? { ...n, [field]: value, updatedAt: Date.now() } : n
    );
    setNotes(updated);
    saveNotes(updated);
  };

  const handleDelete = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
    if (selectedId === id) setSelectedId(null);
  };

  const handleAddTag = () => {
    if (!selectedId || !tagInput.trim()) return;
    const tag = tagInput.trim().toLowerCase();
    const updated = notes.map((n) =>
      n.id === selectedId && !n.tags.includes(tag)
        ? { ...n, tags: [...n.tags, tag], updatedAt: Date.now() }
        : n
    );
    setNotes(updated);
    saveNotes(updated);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    if (!selectedId) return;
    const updated = notes.map((n) =>
      n.id === selectedId
        ? { ...n, tags: n.tags.filter((t) => t !== tag), updatedAt: Date.now() }
        : n
    );
    setNotes(updated);
    saveNotes(updated);
  };

  const handleExportNote = (note: Note) => {
    const blob = new Blob([`# ${note.title}\n\n${note.content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const json = JSON.stringify(notes, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result as string);
          if (Array.isArray(imported)) {
            const merged = [...imported, ...notes];
            setNotes(merged);
            saveNotes(merged);
          }
        } catch {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px]">
      {/* Sidebar */}
      <div className="md:col-span-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={handleCreate} size="icon" variant="outline" className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {filteredNotes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchQuery ? "No notes found" : "No notes yet. Create one!"}
            </p>
          )}
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedId(note.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                selectedId === note.id
                  ? "bg-primary/10 border-primary/30"
                  : "hover:bg-muted/50 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm truncate">{note.title || "Untitled"}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {note.content || "Empty note"}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                {note.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {formatDate(note.updatedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex gap-2">
          <Button onClick={handleExportAll} variant="outline" size="sm" className="gap-1.5 flex-1">
            <Download className="h-3.5 w-3.5" /> Export All
          </Button>
          <Button onClick={handleImport} variant="outline" size="sm" className="gap-1.5 flex-1">
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="md:col-span-2">
        {selectedNote ? (
          <div className="space-y-4">
            {/* Title */}
            <div className="flex items-center gap-2">
              {editingTitle ? (
                <>
                  <Input
                    value={selectedNote.title}
                    onChange={(e) => handleUpdate("title", e.target.value)}
                    className="text-lg font-bold"
                    autoFocus
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setEditingTitle(false);
                    }}
                  />
                  <Button variant="ghost" size="icon" onClick={() => setEditingTitle(false)}>
                    <Check className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <h2
                    className="text-lg font-bold flex-1 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setEditingTitle(true)}
                  >
                    {selectedNote.title}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setEditingTitle(true)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleExportNote(selectedNote)}
                title="Export as Markdown"
              >
                <FileCode className="h-4 w-4" />
              </Button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedNote.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTag();
                  }}
                  className="h-7 w-24 text-xs"
                />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddTag}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <Textarea
              value={selectedNote.content}
              onChange={(e) => handleUpdate("content", e.target.value)}
              placeholder="Start writing... (Markdown supported)"
              className="min-h-[300px] resize-y font-mono text-sm"
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Created: {formatDate(selectedNote.createdAt)}</span>
              <span>Updated: {formatDate(selectedNote.updatedAt)}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
            <StickyNote className="h-12 w-12 mb-3 opacity-30" />
            <p className="font-medium">Select a note or create a new one</p>
            <Button onClick={handleCreate} variant="outline" className="mt-3 gap-2">
              <Plus className="h-4 w-4" /> New Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}