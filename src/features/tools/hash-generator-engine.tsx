"use client";

import { useState, useCallback, useRef } from "react";
import {
  Hash, Copy, Check, Shield, ArrowDownUp, Key, FileCode,
  Upload, Trash2, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  computeHash,
  computeAllHashes,
  computeHMAC,
  compareHashes,
  crc32,
  bufferToHex,
  HASH_ALGORITHMS,
  type HashAlgorithm,
} from "@/features/tools/hash-generator";

export function HashGeneratorEngine() {
  const [activeTab, setActiveTab] = useState<"text" | "file" | "hmac">("text");

  // Text mode
  const [textInput, setTextInput] = useState("Hello, World!");
  const [hashes, setHashes] = useState<Record<HashAlgorithm, string> | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // File mode
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [fileHashes, setFileHashes] = useState<Record<string, string> | null>(null);
  const [isFileHashing, setIsFileHashing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // HMAC mode
  const [hmacSecret, setHmacSecret] = useState("secret-key");
  const [hmacMessage, setHmacMessage] = useState("authenticated-payload");
  const [hmacAlgo, setHmacAlgo] = useState<"SHA-256" | "SHA-512" | "SHA-1">("SHA-256");
  const [hmacResult, setHmacResult] = useState("");

  // Verification / Compare
  const [verifyInput, setVerifyInput] = useState("");
  const [targetHash, setTargetHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);

  const calculateTextHashes = useCallback(async () => {
    if (!textInput) {
      setHashes(null);
      return;
    }
    const all = await computeAllHashes(textInput);
    setHashes(all);
  }, [textInput]);

  const handleCopy = async (val: string, key: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    toast.success("Hash copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
    setIsFileHashing(true);
    setFileHashes(null);

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // CRC-32
      const crc = crc32(bytes);

      // WebCrypto SHA digests
      const sha256Buf = await crypto.subtle.digest("SHA-256", buffer);
      const sha512Buf = await crypto.subtle.digest("SHA-512", buffer);
      const sha1Buf = await crypto.subtle.digest("SHA-1", buffer);

      setFileHashes({
        "CRC-32": crc,
        "SHA-1": bufferToHex(sha1Buf),
        "SHA-256": bufferToHex(sha256Buf),
        "SHA-512": bufferToHex(sha512Buf),
      });
      toast.success("File hashes calculated!");
    } catch {
      toast.error("Failed to hash file.");
    } finally {
      setIsFileHashing(false);
    }
  };

  const handleCalculateHMAC = async () => {
    if (!hmacSecret || !hmacMessage) return;
    const res = await computeHMAC(hmacSecret, hmacMessage, hmacAlgo);
    setHmacResult(res);
  };

  const handleVerify = () => {
    if (!verifyInput || !targetHash) return;
    const isMatch = compareHashes(verifyInput, targetHash);
    setVerifyResult(isMatch);
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab((v as "text" | "file" | "hmac") ?? "text")}
      >
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="text" className="text-xs gap-1.5">
            <Hash className="h-3.5 w-3.5" /> Text Hash
          </TabsTrigger>
          <TabsTrigger value="file" className="text-xs gap-1.5">
            <FileCode className="h-3.5 w-3.5" /> File Checksum
          </TabsTrigger>
          <TabsTrigger value="hmac" className="text-xs gap-1.5">
            <Key className="h-3.5 w-3.5" /> HMAC Key
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Text Hashing */}
        <TabsContent value="text" className="space-y-4 pt-3">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Input String</Label>
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter text to calculate hashes..."
              className="font-mono text-xs min-h-[90px]"
            />
            <Button
              onClick={calculateTextHashes}
              disabled={!textInput}
              className="w-full gap-2 text-xs"
              size="sm"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Compute All Cryptographic Hashes
            </Button>
          </div>

          {hashes && (
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Digests & Checksums
              </Label>
              <div className="space-y-2">
                {HASH_ALGORITHMS.map((algo) => {
                  const val = hashes[algo.id];
                  if (!val) return null;
                  return (
                    <Card key={algo.id} className="border shadow-xs">
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={algo.category === "secure" ? "default" : "secondary"}
                              className="text-[10px] h-5"
                            >
                              {algo.label}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{algo.bits}-bit</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 gap-1 text-[11px]"
                            onClick={() => handleCopy(val, algo.id)}
                          >
                            {copiedKey === algo.id ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            Copy
                          </Button>
                        </div>
                        <p className="font-mono text-xs break-all bg-muted/30 p-2 rounded select-all">
                          {val}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: File Checksum */}
        <TabsContent value="file" className="space-y-4 pt-3">
          <Card className="border">
            <CardContent className="p-6 text-center space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium text-xs">
                  {fileName ? `${fileName} (${(fileSize! / 1024).toFixed(1)} KB)` : "Choose or drop any file"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  100% Client-Side. File never leaves your browser.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </CardContent>
          </Card>

          {fileHashes && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                File Checksums
              </Label>
              {Object.entries(fileHashes).map(([name, val]) => (
                <Card key={name} className="border shadow-xs">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">{name}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 text-[11px]"
                        onClick={() => handleCopy(val, `file-${name}`)}
                      >
                        {copiedKey === `file-${name}` ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        Copy
                      </Button>
                    </div>
                    <p className="font-mono text-xs break-all bg-muted/30 p-2 rounded select-all">
                      {val}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: HMAC */}
        <TabsContent value="hmac" className="space-y-4 pt-3">
          <Card className="border">
            <CardContent className="p-4 space-y-3">
              <div>
                <Label className="text-xs">Secret Key</Label>
                <Input
                  value={hmacSecret}
                  onChange={(e) => setHmacSecret(e.target.value)}
                  placeholder="Shared secret key..."
                  className="font-mono text-xs h-8 mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Message / Payload</Label>
                <Textarea
                  value={hmacMessage}
                  onChange={(e) => setHmacMessage(e.target.value)}
                  placeholder="Payload to authenticate..."
                  className="font-mono text-xs min-h-[70px] mt-1"
                />
              </div>

              <div className="flex gap-2 items-center">
                <Label className="text-xs">Algorithm:</Label>
                {(["SHA-256", "SHA-512", "SHA-1"] as const).map((a) => (
                  <Button
                    key={a}
                    variant={hmacAlgo === a ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setHmacAlgo(a)}
                  >
                    HMAC-{a}
                  </Button>
                ))}
              </div>

              <Button onClick={handleCalculateHMAC} className="w-full text-xs gap-1.5" size="sm">
                <Key className="h-3.5 w-3.5" /> Calculate HMAC Signature
              </Button>

              {hmacResult && (
                <div className="space-y-1.5 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">HMAC-{hmacAlgo} Signature</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 text-[11px]"
                      onClick={() => handleCopy(hmacResult, "hmac")}
                    >
                      {copiedKey === "hmac" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      Copy
                    </Button>
                  </div>
                  <p className="font-mono text-xs break-all bg-muted/40 p-2.5 rounded-lg select-all">
                    {hmacResult}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Checksum Comparator / Verifier */}
      <Card className="border">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ArrowDownUp className="h-4 w-4 text-primary" />
            <Label className="text-xs font-semibold">Compare / Verify Two Hashes</Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              value={verifyInput}
              onChange={(e) => { setVerifyInput(e.target.value); setVerifyResult(null); }}
              placeholder="Hash A (e.g. calculated)"
              className="font-mono text-xs h-8"
            />
            <Input
              value={targetHash}
              onChange={(e) => { setTargetHash(e.target.value); setVerifyResult(null); }}
              placeholder="Hash B (e.g. expected checksum)"
              className="font-mono text-xs h-8"
            />
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerify}
              disabled={!verifyInput || !targetHash}
              className="text-xs h-7 gap-1"
            >
              Verify Match
            </Button>
            {verifyResult !== null && (
              <Badge variant={verifyResult ? "default" : "destructive"} className="text-xs gap-1">
                {verifyResult ? <Check className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                {verifyResult ? "Hashes Match Exactly!" : "Mismatch: Hashes do NOT match"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}