"use client";

import { useState, useCallback } from "react";
import { Key, Copy, Check, RefreshCw, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

function generatePassword(
  length: number,
  uppercase: boolean,
  lowercase: boolean,
  numbers: boolean,
  symbols: boolean
): string {
  const charSets: string[] = [];
  if (uppercase) charSets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (lowercase) charSets.push("abcdefghijklmnopqrstuvwxyz");
  if (numbers) charSets.push("0123456789");
  if (symbols) charSets.push("!@#$%^&*()_+-=[]{}|;:,.<>?");

  if (charSets.length === 0) return "";

  const allChars = charSets.join("");
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  let password = "";
  for (let i = 0; i < length; i++) {
    password += allChars[array[i] % allChars.length];
  }

  // Ensure at least one character from each selected set
  for (const set of charSets) {
    const pos = array[0] % length;
    password = password.substring(0, pos) + set[array[1] % set.length] + password.substring(pos + 1);
  }

  return password;
}

function getStrength(password: string): { score: number; label: string; color: string; icon: typeof Shield } {
  if (!password) return { score: 0, label: "None", color: "bg-muted", icon: Shield };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-500", icon: ShieldAlert };
  if (score <= 4) return { score, label: "Fair", color: "bg-amber-500", icon: ShieldAlert };
  if (score <= 6) return { score, label: "Strong", color: "bg-green-500", icon: ShieldCheck };
  return { score, label: "Very Strong", color: "bg-emerald-500", icon: ShieldCheck };
}

export function PasswordGeneratorEngine() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleGenerate = useCallback(() => {
    const pwd = generatePassword(length, uppercase, lowercase, numbers, symbols);
    setPassword(pwd);
    setHistory((prev) => [pwd, ...prev].slice(0, 10));
  }, [length, uppercase, lowercase, numbers, symbols]);

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = getStrength(password);
  const StrengthIcon = strength.icon;

  return (
    <div className="space-y-6">
      {/* Password Display */}
      <div className="relative">
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-xl border border-border/50 font-mono text-lg break-all min-h-[60px]">
          <span className={password ? "" : "text-muted-foreground"}>
            {password || "Click Generate to create a password"}
          </span>
        </div>
        <div className="flex gap-2 mt-2">
          <Button onClick={handleGenerate} className="gap-2 flex-1" size="sm">
            <RefreshCw className="h-4 w-4" /> Generate
          </Button>
          <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2" disabled={!password}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Strength Meter */}
      {password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Strength</span>
            <span className="text-sm flex items-center gap-1.5">
              <StrengthIcon className="h-4 w-4" /> {strength.label}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${(strength.score / 7) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Options */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Length: {length}</Label>
            </div>
            <Slider
              value={[length]}
              onValueChange={(v) => setLength(Array.isArray(v) ? v[0] : v)}
              min={4}
              max={64}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>4</span>
              <span>64</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <Label htmlFor="uppercase" className="text-sm cursor-pointer">A-Z Uppercase</Label>
              <Switch id="uppercase" checked={uppercase} onCheckedChange={setUppercase} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <Label htmlFor="lowercase" className="text-sm cursor-pointer">a-z Lowercase</Label>
              <Switch id="lowercase" checked={lowercase} onCheckedChange={setLowercase} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <Label htmlFor="numbers" className="text-sm cursor-pointer">0-9 Numbers</Label>
              <Switch id="numbers" checked={numbers} onCheckedChange={setNumbers} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <Label htmlFor="symbols" className="text-sm cursor-pointer">!@#$ Symbols</Label>
              <Switch id="symbols" checked={symbols} onCheckedChange={setSymbols} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">Recent Passwords</Label>
          <div className="space-y-1">
            {history.map((pwd, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30 font-mono text-sm"
              >
                <span className="truncate mr-2">{pwd}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={async () => {
                    await navigator.clipboard.writeText(pwd);
                  }}
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