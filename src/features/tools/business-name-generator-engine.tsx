"use client";

import { useState } from "react";
import { Lightbulb, RefreshCw, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { generateBusinessName, BUSINESS_INDUSTRIES } from "@/features/tools/business-name-generator";

export function BusinessNameGeneratorEngine() {
  const [industry, setIndustry] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = () => {
    setNames(generateBusinessName(industry || undefined, 12));
    setCopied(null);
  };

  const handleCopy = async (name: string) => {
    await navigator.clipboard.writeText(name);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Label className="text-sm mb-1.5 block">Industry (optional)</Label>
          <Select value={industry} onValueChange={(v) => setIndustry(v || "")}>
            <SelectTrigger>
              <SelectValue placeholder="All industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All Industries</SelectItem>
              {Object.keys(BUSINESS_INDUSTRIES).map(ind => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerate} className="gap-2">
          <Sparkles className="h-4 w-4" /> Generate Names
        </Button>
      </div>

      {names.length > 0 && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Generated Names</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleGenerate}>
              <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {names.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleCopy(name)}
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-sm">{name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                    {copied === name ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}