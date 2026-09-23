"use client";

import { useState } from "react";
import {
  Shuffle, Copy, Check, RefreshCw, Dice5, Hash, Type,
  CircleDot, List, Palette, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getRandomInt,
  getRandomFloat,
  rollDice,
  flipCoin,
  shuffleArray,
  pickRandomItems,
  generateRandomString,
  generateCryptoUUID,
  generateRandomColor,
  type DiceType,
  type DiceRollResult,
  type CoinFlipSession,
} from "@/features/tools/random-generator";

export function RandomGeneratorEngine() {
  const [activeTab, setActiveTab] = useState("number");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 1. Number state
  const [minNum, setMinNum] = useState("1");
  const [maxNum, setMaxNum] = useState("100");
  const [decimals, setDecimals] = useState(0);
  const [numberResult, setNumberResult] = useState<number | null>(null);

  // 2. Dice state
  const [diceCount, setDiceCount] = useState(3);
  const [diceSides, setDiceSides] = useState<DiceType>(6);
  const [diceResult, setDiceResult] = useState<DiceRollResult | null>(null);

  // 3. Coin flip state
  const [coinSession, setCoinSession] = useState<CoinFlipSession | null>(null);

  // 4. List picker / shuffler state
  const [listInput, setListInput] = useState("Apple, Banana, Orange, Mango, Grape, Strawberry");
  const [pickCount, setPickCount] = useState(1);
  const [listOutput, setListOutput] = useState<string[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);

  // 5. String & UUID state
  const [strLength, setStrLength] = useState(24);
  const [strCharset, setStrCharset] = useState<"alphanumeric" | "alpha" | "numeric" | "hex" | "symbols">("alphanumeric");
  const [strResult, setStrResult] = useState("");
  const [uuidResult, setUuidResult] = useState("");

  // 6. Color state
  const [colorResult, setColorResult] = useState<{ hex: string; rgb: string; hsl: string } | null>(null);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleGenerateNumber = () => {
    const min = parseFloat(minNum) || 0;
    const max = parseFloat(maxNum) || 100;
    const res = decimals > 0 ? getRandomFloat(min, max, decimals) : getRandomInt(min, max);
    setNumberResult(res);
  };

  const handleRollDice = () => {
    const res = rollDice(diceCount, diceSides);
    setDiceResult(res);
  };

  const handleFlipCoin = (times = 1) => {
    const res = flipCoin(times, coinSession ?? undefined);
    setCoinSession(res);
  };

  const handlePickList = () => {
    const items = listInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (items.length === 0) return;
    const picked = pickRandomItems(items, pickCount, false);
    setListOutput(picked);
    setIsShuffled(false);
  };

  const handleShuffleList = () => {
    const items = listInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (items.length === 0) return;
    const shuffled = shuffleArray(items);
    setListOutput(shuffled);
    setIsShuffled(true);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
        <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6">
          <TabsTrigger value="number" className="text-xs gap-1.5"><Hash className="h-3.5 w-3.5" /> Number</TabsTrigger>
          <TabsTrigger value="dice" className="text-xs gap-1.5"><Dice5 className="h-3.5 w-3.5" /> Dice</TabsTrigger>
          <TabsTrigger value="coin" className="text-xs gap-1.5"><CircleDot className="h-3.5 w-3.5" /> Coin Flip</TabsTrigger>
          <TabsTrigger value="list" className="text-xs gap-1.5"><List className="h-3.5 w-3.5" /> List Pick</TabsTrigger>
          <TabsTrigger value="string" className="text-xs gap-1.5"><Type className="h-3.5 w-3.5" /> Strings</TabsTrigger>
          <TabsTrigger value="color" className="text-xs gap-1.5"><Palette className="h-3.5 w-3.5" /> Color</TabsTrigger>
        </TabsList>

        {/* Tab 1: Number Generator */}
        <TabsContent value="number" className="space-y-4 pt-3">
          <Card className="border">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Minimum</Label>
                  <Input type="number" value={minNum} onChange={(e) => setMinNum(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Maximum</Label>
                  <Input type="number" value={maxNum} onChange={(e) => setMaxNum(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Decimals (0 for integer)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={6}
                    value={decimals}
                    onChange={(e) => setDecimals(parseInt(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>
              </div>

              <Button onClick={handleGenerateNumber} className="w-full gap-2 text-xs" size="sm">
                <RefreshCw className="h-3.5 w-3.5" /> Generate CSPRNG Number
              </Button>

              {numberResult !== null && (
                <div className="p-6 rounded-xl border bg-primary/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">Generated Result:</span>
                    <p className="text-3xl font-extrabold font-mono text-primary">{numberResult}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleCopy(String(numberResult), "num")}
                  >
                    {copiedKey === "num" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Dice Roller */}
        <TabsContent value="dice" className="space-y-4 pt-3">
          <Card className="border">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <Label>Dice Count: {diceCount}</Label>
                  </div>
                  <Slider
                    value={[diceCount]}
                    onValueChange={(v) => setDiceCount(Array.isArray(v) ? v[0] : v)}
                    min={1}
                    max={12}
                    step={1}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Dice Die Type</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {([4, 6, 8, 10, 12, 20, 100] as DiceType[]).map((d) => (
                      <Button
                        key={d}
                        variant={diceSides === d ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => setDiceSides(d)}
                      >
                        D{d}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleRollDice} className="w-full gap-2 text-xs" size="sm">
                <Dice5 className="h-4 w-4" /> Roll {diceCount}D{diceSides}
              </Button>

              {diceResult && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap gap-2 justify-center p-4 rounded-xl border bg-muted/30">
                    {diceResult.rolls.map((val, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded-xl bg-card border shadow-xs flex items-center justify-center font-mono font-bold text-lg text-primary"
                      >
                        {val}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg border bg-card">
                      <span className="text-[10px] text-muted-foreground">Total Sum</span>
                      <p className="font-mono font-bold text-base">{diceResult.total}</p>
                    </div>
                    <div className="p-2 rounded-lg border bg-card">
                      <span className="text-[10px] text-muted-foreground">Average</span>
                      <p className="font-mono font-bold text-base">{diceResult.average}</p>
                    </div>
                    <div className="p-2 rounded-lg border bg-card">
                      <span className="text-[10px] text-muted-foreground">Lowest</span>
                      <p className="font-mono font-bold text-base">{diceResult.min}</p>
                    </div>
                    <div className="p-2 rounded-lg border bg-card">
                      <span className="text-[10px] text-muted-foreground">Highest</span>
                      <p className="font-mono font-bold text-base">{diceResult.max}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Coin Flip */}
        <TabsContent value="coin" className="space-y-4 pt-3">
          <Card className="border">
            <CardContent className="p-4 sm:p-6 text-center space-y-4">
              <div className="flex justify-center gap-2">
                <Button onClick={() => handleFlipCoin(1)} className="gap-2" size="sm">
                  <CircleDot className="h-4 w-4" /> Flip 1 Coin
                </Button>
                <Button onClick={() => handleFlipCoin(10)} variant="outline" size="sm">
                  Flip 10 Coins
                </Button>
                <Button onClick={() => handleFlipCoin(50)} variant="outline" size="sm">
                  Flip 50 Coins
                </Button>
              </div>

              {coinSession && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-center gap-4">
                    <div className="p-4 rounded-xl border bg-card w-36">
                      <p className="text-xs text-muted-foreground">Heads</p>
                      <p className="text-2xl font-bold font-mono text-emerald-600">
                        {coinSession.headsCount}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{coinSession.headsPercentage}%</p>
                    </div>

                    <div className="p-4 rounded-xl border bg-card w-36">
                      <p className="text-xs text-muted-foreground">Tails</p>
                      <p className="text-2xl font-bold font-mono text-blue-600">
                        {coinSession.tailsCount}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {(100 - coinSession.headsPercentage).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-xs">
                    Current Streak: {coinSession.currentStreak.count} {coinSession.currentStreak.face.toUpperCase()}
                  </Badge>

                  <div className="flex flex-wrap gap-1 justify-center max-h-32 overflow-y-auto p-2 bg-muted/20 rounded-lg">
                    {coinSession.results.slice(-40).map((face, i) => (
                      <span
                        key={i}
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          face === "heads" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"
                        }`}
                      >
                        {face === "heads" ? "H" : "T"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: List Picker & Shuffler */}
        <TabsContent value="list" className="space-y-4 pt-3">
          <Card className="border">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Items (comma-separated)</Label>
                <Input
                  value={listInput}
                  onChange={(e) => setListInput(e.target.value)}
                  placeholder="Item 1, Item 2, Item 3..."
                  className="text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs">Pick Count:</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={pickCount}
                    onChange={(e) => setPickCount(parseInt(e.target.value) || 1)}
                    className="w-16 h-8 text-xs"
                  />
                </div>
                <Button onClick={handlePickList} size="sm" className="h-8 text-xs gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Pick Random Item(s)
                </Button>
                <Button onClick={handleShuffleList} variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                  <Shuffle className="h-3.5 w-3.5" /> Shuffle Order
                </Button>
              </div>

              {listOutput.length > 0 && (
                <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {isShuffled ? "Shuffled List" : "Selected Item(s)"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {listOutput.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs py-1 px-2.5">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Strings & UUIDs */}
        <TabsContent value="string" className="space-y-4 pt-3">
          <Card className="border">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <Label>Random String Length: {strLength} chars</Label>
                </div>
                <Slider
                  value={[strLength]}
                  onValueChange={(v) => setStrLength(Array.isArray(v) ? v[0] : v)}
                  min={8}
                  max={64}
                  step={1}
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(["alphanumeric", "alpha", "numeric", "hex", "symbols"] as const).map((cs) => (
                  <Button
                    key={cs}
                    variant={strCharset === cs ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs capitalize"
                    onClick={() => setStrCharset(cs)}
                  >
                    {cs}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => setStrResult(generateRandomString(strLength, strCharset))}
                  className="gap-2 text-xs"
                  size="sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Generate String
                </Button>
                <Button
                  onClick={() => setUuidResult(generateCryptoUUID())}
                  variant="outline"
                  className="gap-2 text-xs"
                  size="sm"
                >
                  <Shuffle className="h-3.5 w-3.5" /> Generate UUID v4
                </Button>
              </div>

              {strResult && (
                <div className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs break-all">{strResult}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleCopy(strResult, "str")}
                  >
                    {copiedKey === "str" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              )}

              {uuidResult && (
                <div className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs break-all">{uuidResult}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleCopy(uuidResult, "uuid")}
                  >
                    {copiedKey === "uuid" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Color Generator */}
        <TabsContent value="color" className="space-y-4 pt-3">
          <Card className="border">
            <CardContent className="p-4 sm:p-6 text-center space-y-4">
              <Button
                onClick={() => setColorResult(generateRandomColor())}
                className="gap-2 text-xs"
                size="sm"
              >
                <Palette className="h-4 w-4" /> Generate Random Color
              </Button>

              {colorResult && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <div
                    className="w-24 h-24 rounded-2xl border shadow-sm"
                    style={{ backgroundColor: colorResult.hex }}
                  />
                  <div className="space-y-1.5 text-left font-mono text-xs">
                    <p className="font-bold text-base">{colorResult.hex.toUpperCase()}</p>
                    <p className="text-muted-foreground">{colorResult.rgb}</p>
                    <p className="text-muted-foreground">{colorResult.hsl}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs mt-2"
                      onClick={() => handleCopy(colorResult.hex, "color")}
                    >
                      {copiedKey === "color" ? <Check className="h-3 w-3 text-green-500 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                      Copy HEX
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}