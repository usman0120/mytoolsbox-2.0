"use client";

import { useState } from "react";
import { FileText, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateLoremIpsum } from "@/features/tools/lorem-ipsum";

export function LoremIpsumEngine() {
  const [paragraphs, setParagraphs] = useState(3);
  const [sentences, setSentences] = useState(5);
  const [words, setWords] = useState(10);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setOutput(generateLoremIpsum(paragraphs, sentences, words));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-sm mb-1.5 block">Paragraphs</Label>
          <Input type="number" min={1} max={20} value={paragraphs} onChange={(e) => setParagraphs(Number(e.target.value))} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Sentences/Paragraph</Label>
          <Input type="number" min={1} max={20} value={sentences} onChange={(e) => setSentences(Number(e.target.value))} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Words/Sentence</Label>
          <Input type="number" min={3} max={30} value={words} onChange={(e) => setWords(Number(e.target.value))} />
        </div>
      </div>

      <Button onClick={handleGenerate} className="w-full gap-2">
        <FileText className="h-4 w-4" /> Generate Lorem Ipsum
      </Button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-sm">Generated Text</Label>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 h-7">
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-sm overflow-auto max-h-64 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}