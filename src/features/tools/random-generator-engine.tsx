"use client";

import { useState, useCallback } from "react";
import { Shuffle, Copy, Check, RefreshCw, Dice1, Dice5, Hash, Type, Calendar, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomString(length: number, charset: string): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

function randomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, length);
}

function randomUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function randomColor(): { hex: string; rgb: string } {
  const r = randomInt(0, 255);
  const g = randomInt(0, 255);
  const b = randomInt(0, 255);
  return {
    hex: `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`,
    rgb: `rgb(${r}, ${g}, ${b})`,
  };
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const NAMES = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry", "Iris", "Jack", "Kate", "Leo", "Mia", "Noah", "Olivia"];
const COUNTRIES = ["USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", "Brazil", "India", "Mexico"];
const DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "proton.me", "example.org"];

export function RandomGeneratorEngine() {
  const [activeTab, setActiveTab] = useState("number");
  const [copied, setCopied] = useState("");

  // Number
  const [numMin, setNumMin] = useState("1");
  const [numMax, setNumMax] = useState("100");
  const [numDecimals, setNumDecimals] = useState(0);
  const [numResult, setNumResult] = useState<number | null>(null);

  // String
  const [strLength, setStrLength] = useState(16);
  const [strCharset, setStrCharset] = useState("alphanumeric");
  const [strResult, setStrResult] = useState("");

  // List picker
  const [listItems, setListItems] = useState("Red, Blue, Green, Yellow, Purple");
  const [listResult, setListResult] = useState("");

  // UUID
  const [uuidResult, setUuidResult] = useState("");

  // Color
  const [colorResult, setColorResult] = useState<{ hex: string; rgb: string } | null>(null);

  // Person
  const [personResult, setPersonResult] = useState<{ name: string; email: string; country: string; age: number } | null>(null);

  // Dice
  const [diceCount, setDiceCount] = useState(2);
  const [diceSides, setDiceSides] = useState(6);
  const [diceResults, setDiceResults] = useState<number[]>([]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const charsets: Record<string, string> = {
    alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    numeric: "0123456789",
    hex: "0123456789abcdef",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    pronounceable: "abcdefghijklmnopqrstuvwxyz",
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
        <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6">
          <TabsTrigger value="number" className="text-xs gap-1"><Hash className="h-3 w-3" /> Number</TabsTrigger>
          <TabsTrigger value="string" className="text-xs gap-1"><Type className="h-3 w-3" /> String</TabsTrigger>
          <TabsTrigger value="dice" className="text-xs gap-1"><Dice5 className="h-3 w-3" /> Dice</TabsTrigger>
          <TabsTrigger value="uuid" className="text-xs gap-1"><Shuffle className="h-3 w-3" /> UUID</TabsTrigger>
          <TabsTrigger value="color" className="text-xs gap-1"><div className="h-3 w-3 rounded-full bg-linear-to-br from-red-500 to-blue-500" /> Color</TabsTrigger>
          <TabsTrigger value="list" className="text-xs gap-1"><List className="h-3 w-3" /> Pick</TabsTrigger>
        </TabsList>

        {/* Number Generator */}
        <TabsContent value="number" className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Min</Label>
              <Input type="number" value={numMin} onChange={(e) => setNumMin(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max</Label>
              <Input type="number" value={numMax} onChange={(e) => setNumMax(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Decimals</Label>
              <Input type="number" min={0} max={10} value={numDecimals} onChange={(e) => setNumDecimals(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <Button
            onClick={() => setNumResult(numDecimals > 0 ? randomFloat(parseFloat(numMin), parseFloat(numMax), numDecimals) : randomInt(parseInt(numMin), parseInt(numMax)))}
            className="gap-2 w-full"
          >
            <RefreshCw className="h-4 w-4" /> Generate Number
          </Button>
          {numResult !== null && (
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <p className="text-2xl font-bold font-mono">{numResult}</p>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(String(numResult), "num")}>
                  {copied === "num" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* String Generator */}
        <TabsContent value="string" className="space-y-4 mt-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Length: {strLength}</Label>
              <Slider value={[strLength]} onValueChange={(v) => setStrLength(Array.isArray(v) ? v[0] : v)} min={4} max={128} step={1} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Character Set</Label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(charsets).map(([key, _]) => (
                  <Badge
                    key={key}
                    variant={strCharset === key ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => setStrCharset(key)}
                  >
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={() => setStrResult(randomString(strLength, charsets[strCharset]))} className="gap-2 w-full">
            <RefreshCw className="h-4 w-4" /> Generate String
          </Button>
          {strResult && (
            <Card>
              <CardContent className="p-4">
                <p className="font-mono text-sm break-all mb-2">{strResult}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => handleCopy(strResult, "str")}>
                    {copied === "str" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} Copy
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setStrResult(randomHex(strLength))}>
                    <Shuffle className="h-3.5 w-3.5" /> Crypto-safe
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dice Roller */}
        <TabsContent value="dice" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Number of Dice</Label>
              <Input type="number" min={1} max={20} value={diceCount} onChange={(e) => setDiceCount(parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sides</Label>
              <select
                value={diceSides}
                onChange={(e) => setDiceSides(parseInt(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {[4, 6, 8, 10, 12, 20, 100].map((s) => (
                  <option key={s} value={s}>D{s}</option>
                ))}
              </select>
            </div>
          </div>
          <Button
            onClick={() => setDiceResults(Array.from({ length: diceCount }, () => randomInt(1, diceSides)))}
            className="gap-2 w-full"
          >
            <Dice5 className="h-4 w-4" /> Roll {diceCount}D{diceSides}
          </Button>
          {diceResults.length > 0 && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex justify-center gap-2 flex-wrap mb-2">
                  {diceResults.map((r, i) => (
                    <Badge key={i} variant="secondary" className="text-lg px-3 py-1 font-mono">{r}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Total: <span className="font-bold text-foreground">{diceResults.reduce((a, b) => a + b, 0)}</span>
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* UUID Generator */}
        <TabsContent value="uuid" className="space-y-4 mt-4">
          <Button onClick={() => setUuidResult(randomUUID())} className="gap-2 w-full">
            <RefreshCw className="h-4 w-4" /> Generate UUID v4
          </Button>
          {uuidResult && (
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <p className="font-mono text-sm">{uuidResult}</p>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(uuidResult, "uuid")}>
                  {copied === "uuid" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Color Generator */}
        <TabsContent value="color" className="space-y-4 mt-4">
          <Button onClick={() => setColorResult(randomColor())} className="gap-2 w-full">
            <RefreshCw className="h-4 w-4" /> Generate Random Color
          </Button>
          {colorResult && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-xl border shadow-sm" style={{ backgroundColor: colorResult.hex }} />
                  <div>
                    <p className="text-lg font-bold font-mono">{colorResult.hex}</p>
                    <p className="text-sm text-muted-foreground font-mono">{colorResult.rgb}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => handleCopy(colorResult.hex, "color-hex")}>
                    {copied === "color-hex" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} HEX
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => handleCopy(colorResult.rgb, "color-rgb")}>
                    {copied === "color-rgb" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} RGB
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* List Picker */}
        <TabsContent value="list" className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Items (comma-separated)</Label>
            <Input
              placeholder="Red, Blue, Green, Yellow"
              value={listItems}
              onChange={(e) => setListItems(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              const items = listItems.split(",").map((s) => s.trim()).filter(Boolean);
              if (items.length > 0) setListResult(pickRandom(items));
            }}
            className="gap-2 w-full"
          >
            <Shuffle className="h-4 w-4" /> Pick Random Item
          </Button>
          {listResult && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{listResult}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}