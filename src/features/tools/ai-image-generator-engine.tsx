"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ImageIcon, Download, Copy, Link, Loader2, Wand2, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const STYLES = [
  { id: "realistic", label: "Realistic", emoji: "📷" },
  { id: "cartoon", label: "Cartoon", emoji: "🎨" },
  { id: "oil-painting", label: "Oil Painting", emoji: "🖼️" },
  { id: "watercolor", label: "Watercolor", emoji: "🖌️" },
  { id: "pixel-art", label: "Pixel Art", emoji: "👾" },
  { id: "anime", label: "Anime", emoji: "🌸" },
  { id: "3d-render", label: "3D Render", emoji: "🧊" },
  { id: "sketch", label: "Sketch", emoji: "✏️" },
];

export function AIImageGeneratorEngine() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<{ prompt: string; url: string; sourceUrl: string; mime: string; style: string }[]>([]);
  const [sourceUrl, setSourceUrl] = useState("");
  const [resultMime, setResultMime] = useState("image/png");
  const requestRef = useRef<AbortController | null>(null);
  const urlsRef = useRef<string[]>([]);
  const [resultPrompt, setResultPrompt] = useState("");

  useEffect(() => () => {
    requestRef.current?.abort();
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    setIsLoading(true);
    setError("");
    setImageUrl("");
    setSourceUrl("");
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 60000);
    const submittedPrompt = prompt.trim();

    try {
      const selectedStyle = STYLES.find((item) => item.id === style)?.label || style;
      const seed = encodeURIComponent(`${submittedPrompt}. Visual style: ${selectedStyle}.`);
      const providerUrl = `https://image.pollinations.ai/prompt/${seed}?width=512&height=512&nologo=true&seed=${Date.now()}`;
      const response = await fetch(providerUrl, { signal: controller.signal });
      if (!response.ok) throw new Error(`Image provider failed (${response.status}). The existing service may require credentials or be unavailable.`);
      const blob = await response.blob();
      if (!blob.type.startsWith("image/") || blob.size === 0) throw new Error("The image provider did not return an image.");
      const bitmap = await createImageBitmap(blob);
      bitmap.close();
      if (controller.signal.aborted) throw new Error("Image generation stopped or timed out.");
      const url = URL.createObjectURL(blob);
      urlsRef.current.push(url);
      if (urlsRef.current.length > 20) URL.revokeObjectURL(urlsRef.current.shift()!);
      setImageUrl(url);
      setSourceUrl(providerUrl);
      setResultMime(blob.type);
      setResultPrompt(submittedPrompt);
      setHistory((prev) => [{ prompt: submittedPrompt, url, sourceUrl: providerUrl, mime: blob.type, style }, ...prev].slice(0, 20));
      toast.success("Image generated!");
    } catch (err) {
      if (requestRef.current === controller) setError(controller.signal.aborted ? "Image generation stopped or timed out. No image was generated." : err instanceof Error ? err.message : "Image generation failed.");
    } finally {
      clearTimeout(timeout);
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsLoading(false);
      }
    }
  }, [prompt, style]);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif", "image/svg+xml": "svg" } as Record<string, string>)[resultMime] || "img";
    a.download = `ai-image-${Date.now()}.${extension}`;
    a.click();
  }, [imageUrl, resultMime]);

  const handleCopyUrl = useCallback(async () => {
    if (!sourceUrl) return;
    try {
      await navigator.clipboard.writeText(sourceUrl);
      toast.success("Provider image URL copied. Opening it contacts Pollinations again.");
    } catch {
      setError("Your browser could not copy this URL.");
    }
  }, [sourceUrl]);

  const handleCopyImage = useCallback(async () => {
    if (!imageUrl) return;
    try {
      const image = await fetch(imageUrl).then((response) => response.blob());
      await navigator.clipboard.write([new ClipboardItem({ [image.type]: image })]);
      toast.success("Image copied!");
    } catch {
      setError("Your browser could not copy this image. Use Download instead.");
    }
  }, [imageUrl]);

  const handleClear = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    setIsLoading(false);
    setPrompt("");
    setImageUrl("");
    setSourceUrl("");
    setError("");
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_minmax(0,2fr)]">
      {/* Input */}
      <section className="space-y-4">
          <div>
            <Label htmlFor="image-prompt" className="text-sm mb-1.5 block">Describe the image you want</Label>
            <Textarea
              id="image-prompt"
              placeholder="A serene mountain lake at sunset with pine trees..."
              className="min-h-20"
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); setError(""); }}
            />
          </div>

          <div>
            <Label className="text-sm mb-1.5 block">Style</Label>
            <select aria-label="Style" value={style} onChange={(event) => setStyle(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {STYLES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <p className="text-xs text-muted-foreground">Your prompt is sent to Pollinations. Availability and access requirements are controlled by that provider.</p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleGenerate}
            className="w-full gap-2"
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" /> Generate Image
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={handleClear}>Clear</Button>
      </section>

      <section className="min-w-0 space-y-3">

      {/* Result */}
      {imageUrl && (
        <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={imageUrl}
                alt={resultPrompt}
                className="w-full h-auto max-h-100 object-contain mx-auto"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5 flex-1">
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyUrl} className="gap-1.5">
                <Link className="h-3.5 w-3.5" /> Copy URL
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyImage} className="gap-1.5">
                <Copy className="h-3.5 w-3.5" /> Copy Image
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerate} className="gap-1.5" disabled={isLoading}>
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </Button>
            </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <Label className="text-sm mb-2 block">Recent Generations</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {history.slice(0, 8).map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrompt(item.prompt);
                  setStyle(item.style);
                  setImageUrl(item.url);
                  setSourceUrl(item.sourceUrl);
                  setResultMime(item.mime);
                  setResultPrompt(item.prompt);
                  setError("");
                }}
                disabled={isLoading}
                className="relative rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-colors aspect-square"
              >
                <img
                  src={item.url}
                  alt={item.prompt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-[10px] text-white truncate">{item.prompt}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!imageUrl && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          {isLoading && <Loader2 aria-label="Generating image" className="h-6 w-6 mx-auto animate-spin" />}
        </div>
      )}
      </section>
    </div>
  );
}