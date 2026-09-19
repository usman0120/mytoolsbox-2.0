"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Microscope, Plus, Trash2, Copy, Download, BookOpen, Tag,
  Link2, FileText, Quote, Search, Bookmark, Star, Library,
  GraduationCap, Globe, Calendar, CheckCircle2, Circle, ExternalLink, X,
  Loader2, Sparkles
} from "lucide-react";
import { generateCitation, type CitationStyle as AICitationStyle } from "@/lib/ai/services/citation-generator";
import { getAvailableProviders } from "@/lib/ai";

interface Source {
  id: string;
  type: "book" | "article" | "website" | "journal" | "other";
  title: string;
  author: string;
  year: string;
  publisher: string;
  url: string;
  notes: string;
  tags: string[];
  cited: boolean;
}

interface Note {
  id: string;
  title: string;
  content: string;
  sourceId: string | null;
  tags: string[];
  createdAt: string;
}

interface CitationStyle {
  id: string;
  name: string;
  format: (source: Source) => string;
}

const CITATION_STYLES: CitationStyle[] = [
  {
    id: "apa",
    name: "APA 7th",
    format: (s) => {
      const author = s.author || "Unknown Author";
      const year = s.year ? `(${s.year})` : "(n.d.)";
      const title = s.title ? `${s.title}.` : "";
      const publisher = s.publisher ? ` ${s.publisher}.` : "";
      const url = s.url ? ` ${s.url}` : "";
      return `${author} ${year}. ${title}${publisher}${url}`;
    },
  },
  {
    id: "mla",
    name: "MLA 9th",
    format: (s) => {
      const author = s.author || "Unknown Author";
      const title = s.title ? `"${s.title}."` : "";
      const publisher = s.publisher ? ` ${s.publisher},` : "";
      const year = s.year ? ` ${s.year}.` : "";
      const url = s.url ? ` ${s.url}.` : "";
      return `${author}. ${title}${publisher}${year}${url}`;
    },
  },
  {
    id: "chicago",
    name: "Chicago",
    format: (s) => {
      const author = s.author || "Unknown Author";
      const title = s.title ? `*${s.title}.*` : "";
      const publisher = s.publisher ? ` ${s.publisher},` : "";
      const year = s.year ? ` ${s.year}.` : "";
      const url = s.url ? ` ${s.url}.` : "";
      return `${author}. ${title}${publisher}${year}${url}`;
    },
  },
  {
    id: "harvard",
    name: "Harvard",
    format: (s) => {
      const author = s.author || "Unknown Author";
      const year = s.year ? `(${s.year})` : "(n.d.)";
      const title = s.title ? `*${s.title}.*` : "";
      const publisher = s.publisher ? ` ${s.publisher}.` : "";
      const url = s.url ? ` Available at: ${s.url}` : "";
      return `${author} ${year}. ${title}${publisher}${url}`;
    },
  },
  {
    id: "bibtex",
    name: "BibTeX",
    format: (s) => {
      const key = `${(s.author || "unknown").split(",")[0].split(" ").pop()?.toLowerCase() || "unknown"}${s.year || "0000"}`;
      const type = s.type === "article" ? "article" : s.type === "book" ? "book" : "misc";
      return `@${type}{${key},\n  author = {${s.author || ""}},\n  title = {${s.title || ""}},\n  year = {${s.year || ""}},\n  publisher = {${s.publisher || ""}},\n  url = {${s.url || ""}}\n}`;
    },
  },
];

const SOURCE_TYPES = [
  { type: "book" as const, label: "Book", icon: BookOpen },
  { type: "article" as const, label: "Article", icon: FileText },
  { type: "website" as const, label: "Website", icon: Globe },
  { type: "journal" as const, label: "Journal", icon: GraduationCap },
  { type: "other" as const, label: "Other", icon: FileText },
];

export function ResearchAssistantEngine() {
  const [sources, setSources] = useState<Source[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("research-sources");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("research-notes");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState("sources");
  const [citationStyle, setCitationStyle] = useState(CITATION_STYLES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // New source form
  const [newSource, setNewSource] = useState<Partial<Source>>({
    type: "book",
    title: "",
    author: "",
    year: "",
    publisher: "",
    url: "",
    notes: "",
    tags: [],
  });
  const [newSourceTag, setNewSourceTag] = useState("");

  // New note form
  const [newNote, setNewNote] = useState({ title: "", content: "", sourceId: null as string | null, tags: [] as string[] });
  const [newNoteTag, setNewNoteTag] = useState("");

  useEffect(() => {
    localStorage.setItem("research-sources", JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem("research-notes", JSON.stringify(notes));
  }, [notes]);

  const allTags = Array.from(new Set([...sources.flatMap((s) => s.tags), ...notes.flatMap((n) => n.tags)])).sort();

  const addSource = () => {
    if (!newSource.title?.trim()) return;
    const source: Source = {
      id: Date.now().toString(),
      type: newSource.type || "book",
      title: newSource.title || "",
      author: newSource.author || "",
      year: newSource.year || "",
      publisher: newSource.publisher || "",
      url: newSource.url || "",
      notes: newSource.notes || "",
      tags: newSource.tags || [],
      cited: false,
    };
    setSources((prev) => [...prev, source]);
    setNewSource({ type: "book", title: "", author: "", year: "", publisher: "", url: "", notes: "", tags: [] });
  };

  const removeSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    setNotes((prev) => prev.map((n) => (n.sourceId === id ? { ...n, sourceId: null } : n)));
  };

  const toggleCited = (id: string) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, cited: !s.cited } : s)));
  };

  const addSourceTag = () => {
    if (!newSourceTag.trim()) return;
    setNewSource((prev) => ({ ...prev, tags: [...(prev.tags || []), newSourceTag.trim()] }));
    setNewSourceTag("");
  };

  const addNote = () => {
    if (!newNote.title.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      sourceId: newNote.sourceId,
      tags: newNote.tags,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, note]);
    setNewNote({ title: "", content: "", sourceId: null, tags: [] });
  };

  const removeNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const addNoteTag = () => {
    if (!newNoteTag.trim()) return;
    setNewNote((prev) => ({ ...prev, tags: [...prev.tags, newNoteTag.trim()] }));
    setNewNoteTag("");
  };

  const generateBibliography = (): string => {
    return sources
      .filter((s) => s.cited)
      .map((s) => citationStyle.format(s))
      .join("\n\n");
  };

  const copyBibliography = () => {
    navigator.clipboard.writeText(generateBibliography());
  };

  // AI citation generation
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedCitations, setAiGeneratedCitations] = useState<string | null>(null);
  const hasAIProvider = getAvailableProviders().length > 0;

  const generateAICitations = async () => {
    const citedSources = sources.filter((s) => s.cited);
    if (citedSources.length === 0) return;
    setAiGenerating(true);
    setAiGeneratedCitations(null);

    try {
      const results = await Promise.all(
        citedSources.map((source) => {
          // Build a descriptive source string for the AI
          const parts = [
            source.author && `Author: ${source.author}`,
            source.title && `Title: ${source.title}`,
            source.year && `Year: ${source.year}`,
            source.publisher && `Publisher: ${source.publisher}`,
            source.url && `URL: ${source.url}`,
          ].filter(Boolean);
          return generateCitation({
            source: parts.join(". "),
            style: citationStyle.id as AICitationStyle,
          });
        })
      );
      setAiGeneratedCitations(results.map((r) => r.citation).join("\n\n"));
    } catch {
      // Fall back to local formatter on error
      setAiGeneratedCitations(null);
    } finally {
      setAiGenerating(false);
    }
  };

  const filteredSources = sources.filter((s) => {
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase()) && !s.author.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedTags.length > 0 && !selectedTags.some((t) => s.tags.includes(t))) {
      return false;
    }
    return true;
  });

  const filteredNotes = notes.filter((n) => {
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !n.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedTags.length > 0 && !selectedTags.some((t) => n.tags.includes(t))) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-linear-to-br from-cyan-500/5 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Library className="h-4 w-4 text-cyan-500" />
              <span className="text-xs text-muted-foreground">Sources</span>
            </div>
            <p className="text-2xl font-bold">{sources.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-linear-to-br from-purple-500/5 to-violet-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Bookmark className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Notes</span>
            </div>
            <p className="text-2xl font-bold">{notes.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-linear-to-br from-green-500/5 to-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Quote className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Cited</span>
            </div>
            <p className="text-2xl font-bold">{sources.filter((s) => s.cited).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-linear-to-br from-amber-500/5 to-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Tags</span>
            </div>
            <p className="text-2xl font-bold">{allTags.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sources and notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {allTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
          >
            {tag}
          </Badge>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sources" className="gap-1.5"><Library className="h-3.5 w-3.5" /> Sources</TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5"><Bookmark className="h-3.5 w-3.5" /> Notes</TabsTrigger>
          <TabsTrigger value="bibliography" className="gap-1.5"><Quote className="h-3.5 w-3.5" /> Bibliography</TabsTrigger>
        </TabsList>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4 mt-4">
          {/* Add Source Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {SOURCE_TYPES.map((st) => (
                  <Badge
                    key={st.type}
                    variant={newSource.type === st.type ? "default" : "outline"}
                    className="cursor-pointer gap-1"
                    onClick={() => setNewSource((prev) => ({ ...prev, type: st.type }))}
                  >
                    <st.icon className="h-3 w-3" /> {st.label}
                  </Badge>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Title *" value={newSource.title} onChange={(e) => setNewSource((prev) => ({ ...prev, title: e.target.value }))} />
                <Input placeholder="Author" value={newSource.author} onChange={(e) => setNewSource((prev) => ({ ...prev, author: e.target.value }))} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Year" value={newSource.year} onChange={(e) => setNewSource((prev) => ({ ...prev, year: e.target.value }))} />
                <Input placeholder="Publisher" value={newSource.publisher} onChange={(e) => setNewSource((prev) => ({ ...prev, publisher: e.target.value }))} />
                <Input placeholder="URL" value={newSource.url} onChange={(e) => setNewSource((prev) => ({ ...prev, url: e.target.value }))} />
              </div>
              <Textarea placeholder="Notes about this source..." value={newSource.notes} onChange={(e) => setNewSource((prev) => ({ ...prev, notes: e.target.value }))} rows={2} />
              <div className="flex gap-2 items-center">
                <Input placeholder="Add tag..." value={newSourceTag} onChange={(e) => setNewSourceTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSourceTag()} className="max-w-[200px]" />
                <Button variant="outline" size="sm" onClick={addSourceTag}><Plus className="h-3.5 w-3.5 mr-1" /> Tag</Button>
                <div className="flex gap-1 flex-wrap">
                  {(newSource.tags || []).map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => setNewSource((prev) => ({ ...prev, tags: (prev.tags || []).filter((t) => t !== tag) }))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex-1" />
                <Button onClick={addSource} disabled={!newSource.title?.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add Source
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Source List */}
          <div className="space-y-2">
            {filteredSources.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No sources yet. Add your first source above.</p>
            ) : (
              filteredSources.map((source) => (
                <Card key={source.id} className={`${source.cited ? "border-green-500/30" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs capitalize shrink-0">{source.type}</Badge>
                          <h4 className="font-medium text-sm truncate">{source.title}</h4>
                          {source.cited && <Star className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {[source.author, source.year, source.publisher].filter(Boolean).join(" · ")}
                        </p>
                        {source.url && (
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-500 hover:underline flex items-center gap-1 mt-1">
                            <ExternalLink className="h-3 w-3" /> {source.url}
                          </a>
                        )}
                        {source.notes && <p className="text-xs text-muted-foreground mt-1 italic">{source.notes}</p>}
                        {source.tags.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {source.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleCited(source.id)} title={source.cited ? "Uncite" : "Cite"}>
                          <Star className={`h-3.5 w-3.5 ${source.cited ? "text-green-500 fill-green-500" : ""}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeSource(source.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4 mt-4">
          {/* Add Note Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Note title *" value={newNote.title} onChange={(e) => setNewNote((prev) => ({ ...prev, title: e.target.value }))} />
              <Textarea placeholder="Note content..." value={newNote.content} onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))} rows={3} />
              <div className="flex gap-2 items-center flex-wrap">
                <select
                  value={newNote.sourceId || ""}
                  onChange={(e) => setNewNote((prev) => ({ ...prev, sourceId: e.target.value || null }))}
                  className="text-sm border rounded-md px-2 py-1.5 bg-background"
                >
                  <option value="">No linked source</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                <Input placeholder="Add tag..." value={newNoteTag} onChange={(e) => setNewNoteTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNoteTag()} className="max-w-[150px]" />
                <Button variant="outline" size="sm" onClick={addNoteTag}><Plus className="h-3.5 w-3.5 mr-1" /> Tag</Button>
                <div className="flex gap-1 flex-wrap">
                  {newNote.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => setNewNote((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex-1" />
                <Button onClick={addNote} disabled={!newNote.title.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add Note
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes List */}
          <div className="space-y-2">
            {filteredNotes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No notes yet. Start taking research notes!</p>
            ) : (
              filteredNotes.map((note) => {
                const linkedSource = note.sourceId ? sources.find((s) => s.id === note.sourceId) : null;
                return (
                  <Card key={note.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{note.title}</h4>
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                          {linkedSource && (
                            <p className="text-xs text-cyan-500 mt-1 flex items-center gap-1">
                              <Link2 className="h-3 w-3" /> {linkedSource.title}
                            </p>
                          )}
                          {note.tags.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {note.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                              ))}
                            </div>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => removeNote(note.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Bibliography Tab */}
        <TabsContent value="bibliography" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Quote className="h-4 w-4" /> Bibliography
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Style:</span>
                  <select
                    value={citationStyle.id}
                    onChange={(e) => setCitationStyle(CITATION_STYLES.find((s) => s.id === e.target.value) || CITATION_STYLES[0])}
                    className="text-sm border rounded-md px-2 py-1.5 bg-background"
                  >
                    {CITATION_STYLES.map((style) => (
                      <option key={style.id} value={style.id}>{style.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sources.filter((s) => s.cited).length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No cited sources yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click the star icon on sources to add them to your bibliography
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                    {aiGeneratedCitations || generateBibliography()}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={copyBibliography} className="gap-1.5">
                      <Copy className="h-4 w-4" /> Copy to Clipboard
                    </Button>
                    <Button variant="outline" onClick={() => {
                      const blob = new Blob([aiGeneratedCitations || generateBibliography()], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `bibliography-${citationStyle.id}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }} className="gap-1.5">
                      <Download className="h-4 w-4" /> Download
                    </Button>
                    {hasAIProvider && (
                      <Button
                        variant="outline"
                        onClick={generateAICitations}
                        disabled={aiGenerating}
                        className="gap-1.5 border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
                      >
                        {aiGenerating ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                          <><Sparkles className="h-4 w-4" /> AI Generate</>
                        )}
                      </Button>
                    )}
                    {aiGeneratedCitations && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAiGeneratedCitations(null)}
                        className="gap-1 text-muted-foreground"
                      >
                        <X className="h-3.5 w-3.5" /> Reset to local
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Cited Sources List */}
          {sources.filter((s) => s.cited).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cited Sources ({sources.filter((s) => s.cited).length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sources.filter((s) => s.cited).map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <Star className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      <span className="truncate">{source.title}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{source.author}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleCited(source.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

