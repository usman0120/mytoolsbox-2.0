"use client";

import { useState, useCallback } from "react";
import { Link, Copy, Check, Trash2, ExternalLink, QrCode, History, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ShortLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: number;
  clicks: number;
}

function generateShortCode(length = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const STORAGE_KEY = "mytoolsbox-shortlinks";

function loadLinks(): ShortLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLinks(links: ShortLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export function URLShortenerEngine() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [links, setLinks] = useState<ShortLink[]>(() => loadLinks());
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [lastCreated, setLastCreated] = useState<ShortLink | null>(null);

  const handleShorten = useCallback(() => {
    setError("");
    setLastCreated(null);

    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }

    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    if (!isValidUrl(normalizedUrl)) {
      setError("Please enter a valid URL.");
      return;
    }

    const code = customCode.trim() || generateShortCode();

    // Check for duplicate codes
    if (links.some((l) => l.shortCode === code)) {
      setError("This custom code is already in use. Please choose another.");
      return;
    }

    const newLink: ShortLink = {
      id: Date.now().toString(36),
      originalUrl: normalizedUrl,
      shortCode: code,
      createdAt: Date.now(),
      clicks: 0,
    };

    const updated = [newLink, ...links];
    setLinks(updated);
    saveLinks(updated);
    setLastCreated(newLink);
    setUrl("");
    setCustomCode("");
  }, [url, customCode, links]);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleDelete = (id: string) => {
    const updated = links.filter((l) => l.id !== id);
    setLinks(updated);
    saveLinks(updated);
  };

  const handleIncrementClick = (id: string) => {
    const updated = links.map((l) =>
      l.id === id ? { ...l, clicks: l.clicks + 1 } : l
    );
    setLinks(updated);
    saveLinks(updated);
  };

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  return (
    <div className="space-y-6">
      {/* Create short link */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Long URL</Label>
            <Input
              placeholder="https://example.com/very/long/url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Custom Code <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">mytoolsbox.me/s/</span>
              <Input
                placeholder="abc123"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                className="font-mono text-sm flex-1"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleShorten} className="gap-2 w-full" disabled={!url.trim()}>
            <Link className="h-4 w-4" /> Shorten URL
          </Button>
        </CardContent>
      </Card>

      {/* Last created */}
      {lastCreated && (
        <Card className="border-primary/30 bg-primary/5 animate-fade-in-up">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Short link created!</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-bold text-primary flex-1 truncate">
                mytoolsbox.me/s/{lastCreated.shortCode}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 shrink-0"
                onClick={() => handleCopy(`https://mytoolsbox.me/s/${lastCreated.shortCode}`, lastCreated.id)}
              >
                {copied === lastCreated.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{lastCreated.originalUrl}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {links.length > 0 && (
        <div className="flex gap-3">
          <Badge variant="secondary" className="gap-1">
            <Link className="h-3 w-3" /> {links.length} links
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <BarChart3 className="h-3 w-3" /> {totalClicks} total clicks
          </Badge>
        </div>
      )}

      {/* Link history */}
      {links.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Your Short Links</Label>
          <div className="space-y-2">
            {links.map((link) => (
              <Card key={link.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-sm font-semibold text-primary">
                      mytoolsbox.me/s/{link.shortCode}
                    </code>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopy(`https://mytoolsbox.me/s/${link.shortCode}`, link.id)}
                      >
                        {copied === link.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => { handleIncrementClick(link.id); window.open(link.originalUrl, "_blank"); }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{link.originalUrl}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" /> {link.clicks} clicks
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}