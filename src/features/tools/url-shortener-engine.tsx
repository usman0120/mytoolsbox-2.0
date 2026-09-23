"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Link as LinkIcon, Copy, Check, Trash2, ExternalLink, QrCode,
  Download, Search, Sparkles, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  createShortLink,
  validateUrl,
  validateCustomAlias,
  exportLinksToCSV,
  type ShortLink,
} from "@/features/tools/url-shortener";
import { generateQrDataUrl } from "@/features/tools/barcode-generator";

const STORAGE_KEY = "mytoolsbox-shortlinks-v2";

export function URLShortenerEngine() {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [title, setTitle] = useState("");
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [lastCreated, setLastCreated] = useState<ShortLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQrId, setActiveQrId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load from local storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLinks(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const saveLinks = (updated: ShortLink[]) => {
    setLinks(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleShorten = useCallback(() => {
    const existingCodes = links.map((l) => l.shortCode);
    const res = createShortLink(url, {
      customAlias: customAlias.trim() || undefined,
      existingCodes,
      title: title.trim() || undefined,
    });

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    const updated = [res.link, ...links];
    saveLinks(updated);
    setLastCreated(res.link);
    setUrl("");
    setCustomAlias("");
    setTitle("");
    toast.success("Short link created successfully!");
  }, [url, customAlias, title, links]);

  const handleCopy = async (shortCode: string, id: string) => {
    const shortUrl = `https://mytoolsbox.me/s/${shortCode}`;
    await navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    toast.success("Short link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = (id: string) => {
    const updated = links.filter((l) => l.id !== id);
    saveLinks(updated);
    if (lastCreated?.id === id) setLastCreated(null);
    if (activeQrId === id) {
      setActiveQrId(null);
      setQrDataUrl(null);
    }
    toast.success("Link deleted.");
  };

  const handleShowQr = async (link: ShortLink) => {
    if (activeQrId === link.id) {
      setActiveQrId(null);
      setQrDataUrl(null);
      return;
    }
    const shortUrl = `https://mytoolsbox.me/s/${link.shortCode}`;
    const dataUrl = await generateQrDataUrl(shortUrl, { width: 240 });
    setActiveQrId(link.id);
    setQrDataUrl(dataUrl);
  };

  const handleExportCSV = () => {
    if (links.length === 0) return;
    const csv = exportLinksToCSV(links);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mytoolsbox-links-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV file downloaded!");
  };

  const handleIncrementClicks = (id: string, originalUrl: string) => {
    const updated = links.map((l) => (l.id === id ? { ...l, clicks: l.clicks + 1 } : l));
    saveLinks(updated);
    window.open(originalUrl, "_blank");
  };

  const filteredLinks = links.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.shortCode.toLowerCase().includes(q) ||
      l.originalUrl.toLowerCase().includes(q) ||
      (l.title && l.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Create Link Card */}
      <Card className="border shadow-xs">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Destination URL *</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/url/to/shorten"
              className="text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Custom Alias (Optional)</Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-mono">mytoolsbox.me/s/</span>
                <Input
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  placeholder="custom-slug"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Link Title / Note (Optional)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Portfolio Project"
                className="text-xs"
              />
            </div>
          </div>

          <Button onClick={handleShorten} disabled={!url.trim()} className="w-full gap-2 text-xs">
            <LinkIcon className="h-4 w-4" /> Shorten URL
          </Button>
        </CardContent>
      </Card>

      {/* Last Created Success Banner */}
      {lastCreated && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Short Link Created!</p>
              <p className="font-mono text-base font-bold text-primary">
                https://mytoolsbox.me/s/{lastCreated.shortCode}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-md">{lastCreated.originalUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => handleCopy(lastCreated.shortCode, lastCreated.id)}
              >
                {copiedId === lastCreated.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => handleShowQr(lastCreated)}
              >
                <QrCode className="h-3.5 w-3.5" /> QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Modal / Drawer */}
      {qrDataUrl && activeQrId && (
        <Card className="border shadow-md bg-card">
          <CardContent className="p-4 flex flex-col items-center space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">Scan QR to Open Shortlink</p>
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg border shadow-xs" />
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                const a = document.createElement("a");
                a.href = qrDataUrl;
                a.download = `qrcode-${activeQrId}.png`;
                a.click();
              }}
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Download QR Image
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Links List / History */}
      {links.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Shortened Links ({links.length})
              </Label>
              <Badge variant="secondary" className="text-[10px]">
                {links.reduce((acc, l) => acc + l.clicks, 0)} Total Clicks
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3 w-3 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter links..."
                  className="h-7 text-xs pl-7 w-40 sm:w-48"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-7 text-xs gap-1"
              >
                <Download className="h-3 w-3" /> CSV
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredLinks.map((link) => (
              <Card key={link.id} className="border shadow-xs hover:border-primary/40 transition-colors">
                <CardContent className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-primary">
                        mytoolsbox.me/s/{link.shortCode}
                      </span>
                      {link.customAlias && (
                        <Badge variant="outline" className="text-[9px] px-1 h-4">Custom</Badge>
                      )}
                      {link.title && (
                        <span className="text-xs font-medium text-foreground truncate max-w-[200px]">
                          • {link.title}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-lg">{link.originalUrl}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-0.5">
                      <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="font-semibold text-foreground">{link.clicks} clicks</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleCopy(link.shortCode, link.id)}
                    >
                      {copiedId === link.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleShowQr(link)}
                    >
                      <QrCode className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleIncrementClicks(link.id, link.originalUrl)}
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}