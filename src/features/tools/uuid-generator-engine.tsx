"use client";

import { useState } from "react";
import { Fingerprint, Copy, Check, RefreshCw, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { generateUUID, generateUUIDBulk } from "@/features/tools/uuid-generator";

export function UUIDGeneratorEngine() {
  const [uuid, setUuid] = useState(generateUUID().message || "");
  const [count, setCount] = useState("5");
  const [bulk, setBulk] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const result = generateUUID();
    if (result.status === "success") setUuid(result.message || "");
  };

  const handleBulkGenerate = () => {
    const result = generateUUIDBulk(parseInt(count) || 5);
    if (result.status === "success") setBulk(result.message || "");
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Single UUID */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <Label className="text-sm font-medium">Single UUID v4</Label>
          <div className="flex gap-2">
            <Input value={uuid} readOnly className="font-mono text-sm" />
            <Button size="icon" variant="outline" onClick={() => handleCopy(uuid)}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="outline" onClick={handleGenerate}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Generation */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium">Bulk Generate</Label>
            <Input
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min="1"
              max="100"
              className="w-20 h-8 text-sm"
            />
            <Button size="sm" onClick={handleBulkGenerate} className="gap-1.5">
              <Hash className="h-3.5 w-3.5" /> Generate {count}
            </Button>
          </div>
          {bulk && (
            <div className="relative">
              <textarea
                value={bulk}
                readOnly
                className="w-full h-32 font-mono text-xs bg-muted/50 rounded-lg p-3 border resize-none"
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 h-7 gap-1"
                onClick={() => handleCopy(bulk)}
              >
                <Copy className="h-3 w-3" /> Copy All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}