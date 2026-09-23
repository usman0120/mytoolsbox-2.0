"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Key, Copy, Check, RefreshCw, Shield, ShieldAlert, ShieldCheck,
  Download, Lock, Hash, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  generatePassword,
  generatePassphrase,
  generatePin,
  calculatePasswordEntropy,
  estimateCrackTime,
} from "@/features/tools/password-generator";

export function PasswordGeneratorEngine() {
  const [activeTab, setActiveTab] = useState<"password" | "passphrase" | "pin">("password");

  // Custom password options
  const [length, setLength] = useState(18);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(true);

  // Passphrase options
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState("-");

  // PIN options
  const [pinLength, setPinLength] = useState(6);

  // Generated value & state
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const generate = useCallback(() => {
    let result = "";
    if (activeTab === "password") {
      result = generatePassword({
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
        avoidAmbiguous,
      });
    } else if (activeTab === "passphrase") {
      result = generatePassphrase(wordCount, separator);
    } else {
      result = generatePin(pinLength);
    }

    if (result) {
      setOutput(result);
      setHistory((prev) => [result, ...prev.filter((p) => p !== result)].slice(0, 10));
    }
  }, [activeTab, length, uppercase, lowercase, numbers, symbols, avoidAmbiguous, wordCount, separator, pinLength]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleCopy = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (history.length === 0) return;
    const content = `MyToolsBox Generated Passwords Export\nDate: ${new Date().toISOString()}\n\n` +
      history.map((p, i) => `${i + 1}. ${p}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `passwords-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("History exported to file!");
  };

  const entropy = calculatePasswordEntropy(output);
  const crackTime = estimateCrackTime(entropy.bits);

  const getStrengthBadge = () => {
    switch (entropy.strength) {
      case "very-strong":
        return <Badge className="bg-emerald-600 gap-1"><ShieldCheck className="h-3 w-3" /> Very Strong</Badge>;
      case "strong":
        return <Badge className="bg-green-600 gap-1"><ShieldCheck className="h-3 w-3" /> Strong</Badge>;
      case "fair":
        return <Badge className="bg-amber-600 gap-1"><Shield className="h-3 w-3" /> Fair</Badge>;
      default:
        return <Badge variant="destructive" className="gap-1"><ShieldAlert className="h-3 w-3" /> Weak</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Output Card */}
      <Card className="border shadow-xs bg-card overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {getStrengthBadge()}
              <Badge variant="outline" className="text-xs font-mono">
                {entropy.bits} bits of entropy
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span>Crack Time:</span>
              <span className="font-semibold text-foreground">{crackTime}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border font-mono text-lg sm:text-xl break-all min-h-[64px] flex items-center justify-between gap-3">
            <span className="text-foreground tracking-wide select-all">{output}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button onClick={generate} className="gap-2 flex-1 sm:flex-none" size="sm">
              <RefreshCw className="h-4 w-4" /> Generate New
            </Button>
            <Button
              onClick={() => handleCopy(output)}
              variant="outline"
              size="sm"
              className="gap-2 flex-1 sm:flex-none"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            {history.length > 1 && (
              <Button onClick={handleExport} variant="outline" size="sm" className="gap-1.5 text-xs ml-auto">
                <Download className="h-3.5 w-3.5" /> Export History
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mode Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab((v as "password" | "passphrase" | "pin") ?? "password")}
      >
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="password" className="text-xs gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Password
          </TabsTrigger>
          <TabsTrigger value="passphrase" className="text-xs gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Passphrase
          </TabsTrigger>
          <TabsTrigger value="pin" className="text-xs gap-1.5">
            <Hash className="h-3.5 w-3.5" /> PIN Code
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Custom Password */}
        <TabsContent value="password" className="space-y-4 pt-3">
          <Card className="border">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>Password Length: <span className="font-bold text-foreground">{length} chars</span></Label>
                  <span className="text-muted-foreground">Recommended: 16+</span>
                </div>
                <Slider
                  value={[length]}
                  onValueChange={(v) => setLength(Array.isArray(v) ? v[0] : v)}
                  min={8}
                  max={64}
                  step={1}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="uppercase" className="text-xs font-medium cursor-pointer">Uppercase (A–Z)</Label>
                    <p className="text-[10px] text-muted-foreground">ABCDEFGH...</p>
                  </div>
                  <Switch id="uppercase" checked={uppercase} onCheckedChange={setUppercase} />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="lowercase" className="text-xs font-medium cursor-pointer">Lowercase (a–z)</Label>
                    <p className="text-[10px] text-muted-foreground">abcdefgh...</p>
                  </div>
                  <Switch id="lowercase" checked={lowercase} onCheckedChange={setLowercase} />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="numbers" className="text-xs font-medium cursor-pointer">Numbers (0–9)</Label>
                    <p className="text-[10px] text-muted-foreground">0123456789</p>
                  </div>
                  <Switch id="numbers" checked={numbers} onCheckedChange={setNumbers} />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="symbols" className="text-xs font-medium cursor-pointer">Special Symbols</Label>
                    <p className="text-[10px] text-muted-foreground">!@#$%^&*()</p>
                  </div>
                  <Switch id="symbols" checked={symbols} onCheckedChange={setSymbols} />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="ambiguous" className="text-xs font-medium cursor-pointer">
                      Exclude Ambiguous Characters
                    </Label>
                    <p className="text-[10px] text-muted-foreground">Removes 0, O, 1, l, I to prevent reading confusion</p>
                  </div>
                  <Switch id="ambiguous" checked={avoidAmbiguous} onCheckedChange={setAvoidAmbiguous} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Diceware Passphrase */}
        <TabsContent value="passphrase" className="space-y-4 pt-3">
          <Card className="border">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>Word Count: <span className="font-bold text-foreground">{wordCount} words</span></Label>
                  <span className="text-muted-foreground">Diceware style</span>
                </div>
                <Slider
                  value={[wordCount]}
                  onValueChange={(v) => setWordCount(Array.isArray(v) ? v[0] : v)}
                  min={3}
                  max={8}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Word Separator</Label>
                <div className="flex gap-2">
                  {[
                    { label: "Hyphen (-)", val: "-" },
                    { label: "Underscore (_)", val: "_" },
                    { label: "Space ( )", val: " " },
                    { label: "Period (.)", val: "." },
                  ].map((sep) => (
                    <Button
                      key={sep.val}
                      variant={separator === sep.val ? "default" : "outline"}
                      size="sm"
                      className="text-xs flex-1"
                      onClick={() => setSeparator(sep.val)}
                    >
                      {sep.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Numeric PIN */}
        <TabsContent value="pin" className="space-y-4 pt-3">
          <Card className="border">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>PIN Length: <span className="font-bold text-foreground">{pinLength} digits</span></Label>
                  <span className="text-muted-foreground">CSPRNG randomness</span>
                </div>
                <Slider
                  value={[pinLength]}
                  onValueChange={(v) => setPinLength(Array.isArray(v) ? v[0] : v)}
                  min={4}
                  max={12}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recently Generated
          </Label>
          <div className="space-y-1.5">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors font-mono text-xs"
              >
                <span className="truncate mr-2">{item}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => handleCopy(item)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}