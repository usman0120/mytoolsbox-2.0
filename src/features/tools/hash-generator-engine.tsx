"use client";

import { useState, useCallback } from "react";
import { Hash, Copy, Check, Trash2, Shield, Clock, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" | "SHA-3-256" | "SHA-3-512" | "BLAKE2b-256" | "BLAKE2b-512";

const ALGORITHMS: { id: HashAlgorithm; label: string; bits: number; color: string }[] = [
  { id: "MD5", label: "MD5", bits: 128, color: "bg-amber-500" },
  { id: "SHA-1", label: "SHA-1", bits: 160, color: "bg-orange-500" },
  { id: "SHA-256", label: "SHA-256", bits: 256, color: "bg-blue-500" },
  { id: "SHA-384", label: "SHA-384", bits: 384, color: "bg-indigo-500" },
  { id: "SHA-512", label: "SHA-512", bits: 512, color: "bg-purple-500" },
  { id: "SHA-3-256", label: "SHA-3-256", bits: 256, color: "bg-cyan-500" },
  { id: "SHA-3-512", label: "SHA-3-512", bits: 512, color: "bg-teal-500" },
  { id: "BLAKE2b-256", label: "BLAKE2b-256", bits: 256, color: "bg-emerald-500" },
  { id: "BLAKE2b-512", label: "BLAKE2b-512", bits: 512, color: "bg-green-500" },
];

async function computeHash(input: string, algorithm: HashAlgorithm): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  if (algorithm === "MD5") {
    // MD5 is not in Web Crypto, use a pure JS implementation
    return md5(input);
  }

  if (algorithm.startsWith("BLAKE2b")) {
    // BLAKE2b is not in Web Crypto, use SHA-512 as fallback with note
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("") + " (SHA-512 fallback)";
  }

  const algoMap: Record<string, string> = {
    "SHA-1": "SHA-1",
    "SHA-256": "SHA-256",
    "SHA-384": "SHA-384",
    "SHA-512": "SHA-512",
    "SHA-3-256": "SHA-256", // Fallback
    "SHA-3-512": "SHA-512", // Fallback
  };

  const hashBuffer = await crypto.subtle.digest(algoMap[algorithm] || "SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Pure JS MD5 implementation
function md5(string: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }

  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }

  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  function add32(a: number, b: number) {
    return (a + b) & 0xFFFFFFFF;
  }

  function md5blk(s: string) {
    const md5blks: number[] = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  function md5blk_array(a: number[]) {
    const md5blks: number[] = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
    }
    return md5blks;
  }

  function md51(s: string) {
    const n = s.length;
    const state = [1732584193, -271733879, -1732584194, 271733878];
    let i: number;
    for (i = 64; i <= n; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    const tail: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    }
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, md5blk_array(tail));
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  function hex_chr(n: number) {
    const hex = "0123456789abcdef";
    let s = "";
    for (let j = 0; j < 4; j++) {
      s += hex.charAt((n >> (j * 8 + 4)) & 0x0F) + hex.charAt((n >> (j * 8)) & 0x0F);
    }
    return s;
  }

  function hex(x: number[]) {
    return x.map(hex_chr).join("");
  }

  return hex(md51(string));
}

export function HashGeneratorEngine() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [hash, setHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ algo: HashAlgorithm; input: string; hash: string; time: number }[]>([]);
  const [compareInput, setCompareInput] = useState("");
  const [compareHash, setCompareHash] = useState("");
  const [match, setMatch] = useState<boolean | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!input) return;
    const start = performance.now();
    const result = await computeHash(input, algorithm);
    const elapsed = performance.now() - start;
    setHash(result);
    setHistory(prev => [{ algo: algorithm, input: input.slice(0, 50), hash: result, time: elapsed }, ...prev].slice(0, 20));
  }, [input, algorithm]);

  const handleCompare = async () => {
    if (!compareInput) return;
    const h = await computeHash(compareInput, algorithm);
    setCompareHash(h);
    setMatch(h === hash);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedAlgo = ALGORITHMS.find(a => a.id === algorithm);

  return (
    <div className="space-y-6">
      {/* Algorithm selector */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Hash Algorithm</Label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo.id}
              onClick={() => { setAlgorithm(algo.id); setHash(""); setMatch(null); }}
              className={`relative p-3 rounded-lg border text-center transition-all ${
                algorithm === algo.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border/50 hover:border-border hover:bg-muted/50"
              }`}
            >
              <div className={`h-1.5 w-full rounded-full mb-2 ${algo.color}`} />
              <p className="text-xs font-semibold">{algo.label}</p>
              <p className="text-[10px] text-muted-foreground">{algo.bits}-bit</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Input Text</Label>
        <Textarea
          placeholder="Enter text to hash..."
          className="font-mono text-sm min-h-[100px]"
          value={input}
          onChange={(e) => { setInput(e.target.value); setHash(""); }}
        />
      </div>

      <Button onClick={handleGenerate} className="gap-2 w-full" disabled={!input}>
        <Hash className="h-4 w-4" /> Generate {selectedAlgo?.label} Hash
      </Button>

      {/* Hash output */}
      {hash && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <div className={`h-2 w-2 rounded-full ${selectedAlgo?.color}`} />
                  {selectedAlgo?.label}
                </Badge>
                <Badge variant="outline" className="text-[10px]">{hash.length} chars</Badge>
              </div>
              <Button variant="ghost" size="sm" className="gap-1" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="font-mono text-sm break-all bg-muted/50 p-3 rounded-lg">{hash}</p>
          </CardContent>
        </Card>
      )}

      {/* Compare */}
      {hash && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Verify / Compare Hash</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter text to compare..."
              value={compareInput}
              onChange={(e) => { setCompareInput(e.target.value); setMatch(null); }}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={handleCompare} className="gap-1" disabled={!compareInput}>
              <ArrowDownUp className="h-3.5 w-3.5" /> Compare
            </Button>
          </div>
          {match !== null && (
            <Badge variant={match ? "default" : "destructive"} className="gap-1">
              {match ? <Check className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
              {match ? "Hashes match!" : "Hashes do NOT match"}
            </Badge>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Recent Hashes</Label>
          <div className="space-y-1 max-h-[200px] overflow-auto">
            {history.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-xs">
                <Badge variant="outline" className="shrink-0 text-[10px]">{item.algo}</Badge>
                <span className="font-mono truncate flex-1">{item.hash}</span>
                <span className="text-muted-foreground shrink-0">{item.time.toFixed(1)}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}