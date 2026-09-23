"use client";

import { useState, useId, useMemo } from "react";
import {
  Fingerprint,
  Copy,
  Check,
  RefreshCw,
  Hash,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCode2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  generateSingleID,
  formatSingleID,
  generateUUIDBulk,
  inspectUUID,
  IDType,
} from "@/features/tools/uuid-generator";
import { toast } from "sonner";

export function UUIDGeneratorEngine() {
  const [activeTab, setActiveTab] = useState<"quick" | "bulk" | "inspect">("quick");

  // Options
  const [idType, setIdType] = useState<IDType>("v4");
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [braces, setBraces] = useState(false);

  // Single ID
  const [singleId, setSingleId] = useState(() =>
    formatSingleID(generateSingleID("v4"), { uppercase: false, noHyphens: false, braces: false })
  );

  // Bulk
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkFormat, setBulkFormat] = useState<"lines" | "json" | "sql" | "csv">("lines");
  const [bulkOutput, setBulkOutput] = useState("");

  // Inspect
  const [inspectInput, setInspectInput] = useState("");

  const [copied, setCopied] = useState<string | null>(null);

  const uppercaseId = useId();
  const noHyphensId = useId();
  const bracesId = useId();

  const handleGenerateSingle = (type = idType, upper = uppercase, noHyp = noHyphens, br = braces) => {
    const raw = generateSingleID(type);
    const formatted = formatSingleID(raw, { uppercase: upper, noHyphens: noHyp, braces: br });
    setSingleId(formatted);
  };

  const handleGenerateBulk = () => {
    const res = generateUUIDBulk(bulkCount, {
      type: idType,
      uppercase,
      noHyphens,
      braces,
      format: bulkFormat,
    });
    setBulkOutput(res.message || "");
  };

  const handleCopy = async (text: string, key: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = (content: string, filename: string) => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const inspection = useMemo(() => {
    if (!inspectInput.trim()) return null;
    return inspectUUID(inspectInput.trim());
  }, [inspectInput]);

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "quick" | "bulk" | "inspect")}>
          <TabsList>
            <TabsTrigger value="quick" className="gap-1.5 text-xs">
              <Fingerprint className="h-3.5 w-3.5" /> Single ID
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-1.5 text-xs">
              <Hash className="h-3.5 w-3.5" /> Bulk Generator
            </TabsTrigger>
            <TabsTrigger value="inspect" className="gap-1.5 text-xs">
              <Search className="h-3.5 w-3.5" /> UUID Inspector
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Global Type Selector */}
        {activeTab !== "inspect" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Type:</span>
            <select
              value={idType}
              onChange={(e) => {
                const nextType = e.target.value as IDType;
                setIdType(nextType);
                handleGenerateSingle(nextType);
              }}
              className="text-xs border rounded-md px-2 py-1.5 bg-background font-medium"
            >
              <option value="v4">UUID v4 (Random Crypto)</option>
              <option value="v7">UUID v7 (Time-Sorted RFC 9562)</option>
              <option value="v1">UUID v1 (Timestamp-Based)</option>
              <option value="nanoid">NanoID (Compact URL-Safe)</option>
              <option value="ulid">ULID (Sortable Base32)</option>
            </select>
          </div>
        )}
      </div>

      {/* Global Formatting switches */}
      {activeTab !== "inspect" && (
        <div className="flex flex-wrap items-center gap-6 p-2.5 bg-muted/40 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <Switch
              id={uppercaseId}
              checked={uppercase}
              onCheckedChange={(c) => {
                setUppercase(c);
                handleGenerateSingle(idType, c, noHyphens, braces);
              }}
            />
            <Label htmlFor={uppercaseId} className="cursor-pointer font-medium">
              Uppercase
            </Label>
          </div>

          {idType !== "nanoid" && idType !== "ulid" && (
            <>
              <div className="flex items-center gap-2">
                <Switch
                  id={noHyphensId}
                  checked={noHyphens}
                  onCheckedChange={(c) => {
                    setNoHyphens(c);
                    handleGenerateSingle(idType, uppercase, c, braces);
                  }}
                />
                <Label htmlFor={noHyphensId} className="cursor-pointer font-medium">
                  Remove Hyphens
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id={bracesId}
                  checked={braces}
                  onCheckedChange={(c) => {
                    setBraces(c);
                    handleGenerateSingle(idType, uppercase, noHyphens, c);
                  }}
                />
                <Label htmlFor={bracesId} className="cursor-pointer font-medium">
                  Wrap with &#123; &#125;
                </Label>
              </div>
            </>
          )}
        </div>
      )}

      {/* Quick Single Generator */}
      {activeTab === "quick" && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Fingerprint className="h-4 w-4 text-primary" /> Generated {idType.toUpperCase()}
                </Label>
                <Badge variant="secondary" className="text-xs">
                  {singleId.length} characters
                </Badge>
              </div>

              <div className="flex gap-2">
                <Input value={singleId} readOnly className="font-mono text-sm h-11 bg-muted/30" />
                <Button
                  size="default"
                  variant="outline"
                  onClick={() => handleCopy(singleId, "single")}
                  className="gap-1.5 h-11 px-4"
                >
                  {copied === "single" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied === "single" ? "Copied" : "Copy"}
                </Button>
                <Button
                  size="default"
                  onClick={() => handleGenerateSingle()}
                  className="gap-1.5 h-11 px-4"
                >
                  <RefreshCw className="h-4 w-4" /> Re-generate
                </Button>
              </div>
            </div>

            {/* Quick Type info */}
            <div className="p-3 rounded-lg bg-muted/20 border text-xs text-muted-foreground space-y-1">
              {idType === "v7" && (
                <p>
                  <strong>UUID v7:</strong> The modern replacement for UUID v4. Encodes 48-bit Unix millisecond
                  timestamps in the leading bits for index-friendly B-tree database performance.
                </p>
              )}
              {idType === "v4" && (
                <p>
                  <strong>UUID v4:</strong> 122 bits of cryptographically secure random entropy. Negligible collision
                  probability across all distributed applications.
                </p>
              )}
              {idType === "nanoid" && (
                <p>
                  <strong>NanoID:</strong> 21-character URL-friendly identifier with 126 bits of entropy, smaller footprint
                  than UUIDs.
                </p>
              )}
              {idType === "ulid" && (
                <p>
                  <strong>ULID:</strong> 26-character Crockford base32 encoded identifier, lexicographically sortable,
                  case-insensitive.
                </p>
              )}
              {idType === "v1" && (
                <p>
                  <strong>UUID v1:</strong> Encodes timestamp with host sequence. Recommended to use v7 for modern
                  systems.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Generator */}
      {activeTab === "bulk" && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Label className="text-sm font-semibold">Quantity:</Label>
                <Input
                  type="number"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                  min="1"
                  max="500"
                  className="w-24 h-9 text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Output Format:</span>
                {(
                  [
                    { id: "lines", label: "Line by line" },
                    { id: "json", label: "JSON Array" },
                    { id: "sql", label: "SQL VALUES" },
                    { id: "csv", label: "CSV" },
                  ] as const
                ).map((fmt) => (
                  <Button
                    key={fmt.id}
                    variant={bulkFormat === fmt.id ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 text-xs px-2.5"
                    onClick={() => setBulkFormat(fmt.id)}
                  >
                    {fmt.label}
                  </Button>
                ))}
              </div>

              <Button onClick={handleGenerateBulk} className="h-9 gap-1.5 text-xs">
                <Hash className="h-3.5 w-3.5" /> Generate {bulkCount} IDs
              </Button>
            </div>

            {bulkOutput && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground">Generated List</Label>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleCopy(bulkOutput, "bulk")}
                    >
                      {copied === "bulk" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      Copy All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() =>
                        handleDownload(
                          bulkOutput,
                          `ids-${idType}-${bulkCount}.${bulkFormat === "json" ? "json" : "txt"}`
                        )
                      }
                    >
                      <Download className="h-3 w-3" /> Download
                    </Button>
                  </div>
                </div>
                <textarea
                  value={bulkOutput}
                  readOnly
                  className="w-full h-52 font-mono text-xs bg-muted/30 rounded-lg p-3 border resize-none focus:outline-none"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* UUID Inspector */}
      {activeTab === "inspect" && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Paste UUID to Inspect and Decode</Label>
              <div className="flex gap-2">
                <Input
                  value={inspectInput}
                  onChange={(e) => setInspectInput(e.target.value)}
                  placeholder="e.g. 018d3b87-1234-7000-8000-000000000000 or c73bcdcc-6660-4e0f-9b63-293e705b60cb"
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={() => setInspectInput(singleId)}
                >
                  Inspect Current
                </Button>
              </div>
            </div>

            {inspection && (
              <div className="pt-2">
                {inspection.valid ? (
                  <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm">
                      <CheckCircle2 className="h-5 w-5" /> Valid UUID Recognized
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="p-2.5 rounded-lg border bg-background">
                        <span className="text-muted-foreground block text-[11px]">Version</span>
                        <span className="font-bold text-sm">Version {inspection.version}</span>
                      </div>
                      <div className="p-2.5 rounded-lg border bg-background">
                        <span className="text-muted-foreground block text-[11px]">Variant</span>
                        <span className="font-semibold">{inspection.variant}</span>
                      </div>
                      {inspection.timestamp && (
                        <div className="p-2.5 rounded-lg border bg-background">
                          <span className="text-muted-foreground block text-[11px]">Embedded Timestamp</span>
                          <span className="font-mono text-[11px] font-semibold">{inspection.timestamp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{inspection.error}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}