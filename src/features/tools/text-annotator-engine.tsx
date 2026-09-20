"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  MessageSquareText, Loader2, Copy, CheckCircle2, XCircle,
  Highlighter, Trash2, Palette,
} from "lucide-react";

interface Annotation {
  id: string;
  text: string;
  color: string;
  startIndex: number;
  endIndex: number;
}

const COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff", "#fed7aa"];

export function TextAnnotatorEngine() {
  const [input, setInput] = useState("");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null);
  const [noteText, setNoteText] = useState("");
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const handleTextSelect = useCallback(() => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selected = input.substring(start, end);
      setSelectedText(selected);
      setSelectedRange([start, end]);
    } else {
      setSelectedText("");
      setSelectedRange(null);
    }
  }, [input]);

  const addAnnotation = useCallback(() => {
    if (!selectedRange || !selectedText) {
      setError("Please select some text first.");
      return;
    }

    const annotation: Annotation = {
      id: crypto.randomUUID(),
      text: noteText || selectedText,
      color: activeColor,
      startIndex: selectedRange[0],
      endIndex: selectedRange[1],
    };

    setAnnotations((prev) => [...prev, annotation]);
    setNoteText("");
    setSelectedText("");
    setSelectedRange(null);
    setError(null);
    toast.success("Annotation added!");
  }, [selectedRange, selectedText, noteText, activeColor]);

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    toast.success("Annotation removed.");
  }, []);

  const handleCopy = useCallback(async () => {
    const annotatedText = renderAnnotatedText();
    await navigator.clipboard.writeText(annotatedText);
    toast.success("Annotated text copied!");
  }, [input, annotations]);

  const renderAnnotatedText = useCallback(() => {
    if (annotations.length === 0) return input;

    // Sort annotations by start index
    const sorted = [...annotations].sort((a, b) => a.startIndex - b.startIndex);

    let result = "";
    let lastIndex = 0;

    for (const ann of sorted) {
      result += input.substring(lastIndex, ann.startIndex);
      result += `⟦${ann.text}⟧`;
      lastIndex = ann.endIndex;
    }
    result += input.substring(lastIndex);

    return result;
  }, [input, annotations]);

  // Render text with highlighted spans
  const renderHighlightedText = () => {
    if (annotations.length === 0) {
      return <p className="text-sm whitespace-pre-wrap">{input || "Your text will appear here..."}</p>;
    }

    const sorted = [...annotations].sort((a, b) => a.startIndex - b.startIndex);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const ann of sorted) {
      if (ann.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{input.substring(lastIndex, ann.startIndex)}</span>
        );
      }
      elements.push(
        <span
          key={ann.id}
          style={{ backgroundColor: ann.color }}
          className="rounded px-0.5 cursor-pointer relative group"
          title={ann.text}
        >
          {input.substring(ann.startIndex, ann.endIndex)}
          <span className="absolute -top-2 -right-2 hidden group-hover:inline-flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 rounded-full bg-background border"
              onClick={() => removeAnnotation(ann.id)}
            >
              <Trash2 className="h-2 w-2" />
            </Button>
          </span>
        </span>
      );
      lastIndex = ann.endIndex;
    }

    if (lastIndex < input.length) {
      elements.push(
        <span key={`text-${lastIndex}`}>{input.substring(lastIndex)}</span>
      );
    }

    return <p className="text-sm whitespace-pre-wrap">{elements}</p>;
  };

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <Highlighter className="h-3.5 w-3.5" /> Text Annotator
      </Badge>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enter Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onMouseUp={handleTextSelect}
            onKeyUp={handleTextSelect}
            placeholder="Paste or type your text here. Select text to annotate..."
            className="min-h-[150px]"
          />
        </CardContent>
      </Card>

      {/* Annotation controls */}
      {selectedText && (
        <Card className="border-primary/50">
          <CardContent className="py-3 space-y-3">
            <div>
              <p className="text-xs font-medium mb-1">Selected: &ldquo;{selectedText.substring(0, 50)}{selectedText.length > 50 ? "..." : ""}&rdquo;</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Note (optional)</label>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note for this annotation..."
                className="min-h-[60px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Color</label>
              <div className="flex gap-1.5">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setActiveColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      activeColor === color ? "border-primary scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button onClick={addAnnotation} size="sm" className="gap-1.5">
              <Highlighter className="h-3.5 w-3.5" />
              Add Annotation
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {input && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Preview</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {annotations.length} annotation{annotations.length !== 1 ? "s" : ""}
                </span>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5">
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderHighlightedText()}
          </CardContent>
        </Card>
      )}

      {/* Annotations list */}
      {annotations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Annotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {annotations.map((ann) => (
                <div key={ann.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                  <div
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: ann.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      &ldquo;{input.substring(ann.startIndex, ann.endIndex)}&rdquo;
                    </p>
                    {ann.text !== input.substring(ann.startIndex, ann.endIndex) && (
                      <p className="text-sm mt-0.5">{ann.text}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive shrink-0"
                    onClick={() => removeAnnotation(ann.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}