"use client";

import { useState, useTransition, useId } from "react";
import {
  Binary,
  Copy,
  Check,
  ArrowLeftRight,
  Trash2,
  Download,
  FileCode,
  Image as ImageIcon,
  Upload,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { encodeBase64, decodeBase64 } from "@/features/tools/base64-encoder";
import { toast } from "sonner";

export function Base64EncoderEngine() {
  const [tab, setTab] = useState<"text" | "file">("text");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ inBytes: number; outBytes: number; diff: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Options
  const [urlSafe, setUrlSafe] = useState(false);
  const [splitLines, setSplitLines] = useState(false);

  // File state
  const [fileName, setFileName] = useState("");
  const [fileMime, setFileMime] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [, startTransition] = useTransition();

  const urlSafeId = useId();
  const splitLinesId = useId();
  const fileUploadId = useId();

  const handleProcessText = (text: string, currentMode = mode, isUrlSafe = urlSafe, isSplit = splitLines) => {
    setInput(text);
    if (!text.trim()) {
      setOutput("");
      setError(null);
      setStats(null);
      return;
    }

    startTransition(() => {
      const result = currentMode === "encode"
        ? encodeBase64(text, { urlSafe: isUrlSafe, splitLines: isSplit, stripPadding: isUrlSafe })
        : decodeBase64(text, { urlSafe: isUrlSafe });

      if (result.status === "error") {
        setError(result.error || "Operation failed");
        setOutput("");
        setStats(null);
      } else if (result.data) {
        setError(null);
        setOutput(result.data.output);
        setStats({
          inBytes: result.data.inputBytes,
          outBytes: result.data.outputBytes,
          diff: result.data.sizeDifference,
        });
      }
    });
  };

  const handleSwap = () => {
    const nextMode = mode === "encode" ? "decode" : "encode";
    setMode(nextMode);
    handleProcessText(output, nextMode);
  };

  const handleCopy = async (val = output) => {
    if (!val) return;
    await navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = (content: string, filename: string, mime = "text/plain") => {
    if (!content) return;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileMime(file.type || "application/octet-stream");

    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setFileBase64(res);
      toast.success(`Converted ${file.name} to Base64!`);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadFromBase64 = () => {
    if (!fileBase64) return;
    const a = document.createElement("a");
    a.href = fileBase64;
    a.download = fileName ? `restored-${fileName}` : "downloaded-file";
    a.click();
    toast.success("Downloaded decoded file!");
  };

  const isImageBase64 = output.startsWith("data:image/") || (fileBase64 && fileBase64.startsWith("data:image/"));
  const imageSrc = fileBase64.startsWith("data:image/") ? fileBase64 : (output.startsWith("data:image/") ? output : null);

  return (
    <div className="space-y-5">
      {/* Top tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "text" | "file")}>
          <TabsList>
            <TabsTrigger value="text" className="gap-1.5">
              <FileCode className="h-4 w-4" /> Text Base64
            </TabsTrigger>
            <TabsTrigger value="file" className="gap-1.5">
              <ImageIcon className="h-4 w-4" /> File & Image to Base64
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === "text" && (
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "encode" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMode("encode");
                handleProcessText(input, "encode");
              }}
            >
              Encode
            </Button>
            <Button
              variant={mode === "decode" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMode("decode");
                handleProcessText(input, "decode");
              }}
            >
              Decode
            </Button>
          </div>
        )}
      </div>

      {tab === "text" ? (
        <div className="space-y-4">
          {/* Options row */}
          <div className="flex flex-wrap items-center gap-6 p-3 bg-muted/40 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <Switch
                id={urlSafeId}
                checked={urlSafe}
                onCheckedChange={(checked) => {
                  setUrlSafe(checked);
                  handleProcessText(input, mode, checked, splitLines);
                }}
              />
              <Label htmlFor={urlSafeId} className="cursor-pointer font-medium">
                URL-Safe Base64 (base64url)
              </Label>
            </div>
            {mode === "encode" && (
              <div className="flex items-center gap-2">
                <Switch
                  id={splitLinesId}
                  checked={splitLines}
                  onCheckedChange={(checked) => {
                    setSplitLines(checked);
                    handleProcessText(input, mode, urlSafe, checked);
                  }}
                />
                <Label htmlFor={splitLinesId} className="cursor-pointer font-medium">
                  Split into 76-character lines (RFC 2045)
                </Label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input column */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Binary className="h-4 w-4 text-primary" />
                  {mode === "encode" ? "Plaintext Input (UTF-8)" : "Base64 Input"}
                </Label>
                {input && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => handleProcessText("")}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
                  </Button>
                )}
              </div>
              <Textarea
                placeholder={
                  mode === "encode"
                    ? "Enter text or code here (UTF-8, emojis, multiline supported)..."
                    : "Paste Base64 encoded string here (e.g. SGVsbG8gV29ybGQh)..."
                }
                className="min-h-60 font-mono text-xs leading-relaxed"
                value={input}
                onChange={(e) => handleProcessText(e.target.value)}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{input.length.toLocaleString()} characters</span>
                {mode === "encode" && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() =>
                      handleProcessText(
                        JSON.stringify({ hello: "world", numbers: [1, 2, 3], timestamp: Date.now() }, null, 2)
                      )
                    }
                  >
                    Sample JSON
                  </Button>
                )}
              </div>
            </div>

            {/* Output column */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  {mode === "encode" ? "Base64 Output" : "Decoded Plaintext"}
                </Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={handleSwap}
                    disabled={!output}
                    title="Swap input and output"
                  >
                    <ArrowLeftRight className="h-3 w-3" /> Swap
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleCopy()}
                    disabled={!output}
                  >
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() =>
                      handleDownload(
                        output,
                        `base64-${mode}-${Date.now()}.${mode === "encode" ? "txt" : "txt"}`
                      )
                    }
                    disabled={!output}
                  >
                    <Download className="h-3 w-3" /> Save
                  </Button>
                </div>
              </div>

              {error ? (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm min-h-60 flex flex-col justify-center items-center text-center">
                  <Info className="h-6 w-6 mb-2" />
                  <p className="font-medium">{error}</p>
                  <p className="text-xs mt-1 text-muted-foreground">Check for illegal characters or missing padding.</p>
                </div>
              ) : (
                <Textarea
                  readOnly
                  value={output}
                  placeholder="Processed output will appear here automatically..."
                  className="min-h-60 font-mono text-xs leading-relaxed bg-muted/40 cursor-text"
                />
              )}

              {stats && !error && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    Input: {stats.inBytes.toLocaleString()} bytes
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Output: {stats.outBytes.toLocaleString()} bytes
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Size: {stats.diff}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* File & Image to Base64 tab */
        <div className="space-y-5">
          <Card>
            <CardContent className="p-6">
              <label
                htmlFor={fileUploadId}
                className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary cursor-pointer transition-colors"
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <h4 className="font-semibold text-base mb-1">Click to upload or drag & drop any file</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  PNG, JPG, SVG, WebP, PDF, Font, or any binary file up to 20MB
                </p>
                <input
                  id={fileUploadId}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button size="sm" variant="secondary" type="button" onClick={() => document.getElementById(fileUploadId)?.click()}>
                  Browse Files
                </Button>
              </label>
            </CardContent>
          </Card>

          {fileBase64 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted rounded-lg text-xs">
                <div>
                  <span className="font-semibold">{fileName}</span> ({fileMime}) &bull;{" "}
                  {fileBase64.length.toLocaleString()} Base64 chars
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleCopy(fileBase64)}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy Data URI
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleCopy(fileBase64.replace(/^data:[^;]+;base64,/, ""))
                    }
                  >
                    Copy Raw Base64
                  </Button>
                  <Button size="sm" variant="default" onClick={handleDownloadFromBase64}>
                    <Download className="h-3.5 w-3.5 mr-1" /> Download File
                  </Button>
                </div>
              </div>

              {isImageBase64 && imageSrc && (
                <div className="p-4 rounded-xl border bg-card flex flex-col items-center justify-center gap-3">
                  <p className="text-xs font-semibold text-muted-foreground">Image Preview</p>
                  <div className="max-h-64 max-w-full overflow-hidden rounded-lg border bg-checkerboard">
                    <img src={imageSrc} alt="Base64 Preview" className="max-h-60 object-contain mx-auto" />
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs font-medium mb-1.5 block">Base64 Data URI</Label>
                <Textarea
                  readOnly
                  value={fileBase64}
                  className="min-h-32 font-mono text-xs max-h-48 break-all bg-muted/40"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}