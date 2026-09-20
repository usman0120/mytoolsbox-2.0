"use client";

import { useState } from "react";
import { FileText, ExternalLink, FileDown, Combine, FileOutput, Scissors, Lock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TOOLS = [
  { icon: FileDown, label: "Compress PDF", desc: "Reduce file size without quality loss", href: "https://smallpdf.com/compress-pdf" },
  { icon: Combine, label: "Merge PDF", desc: "Combine multiple PDFs into one", href: "https://smallpdf.com/merge-pdf" },
  { icon: Scissors, label: "Split PDF", desc: "Extract or separate pages", href: "https://smallpdf.com/split-pdf" },
  { icon: FileOutput, label: "PDF Converter", desc: "Convert to/from Word, Excel, PPT", href: "https://smallpdf.com/pdf-converter" },
  { icon: Pencil, label: "Edit PDF", desc: "Add text, images, and annotations", href: "https://smallpdf.com/edit-pdf" },
  { icon: Lock, label: "Protect PDF", desc: "Add password & encryption", href: "https://smallpdf.com/protect-pdf" },
];

export function SmallPDFEngine() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Smallpdf</Badge>
        <span className="text-xs text-muted-foreground">Basic lightweight online PDF converter</span>
      </div>

      <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-green-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 shrink-0">
              <FileText className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Smallpdf</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A lightweight, browser-based PDF toolkit. Smallpdf offers 20+ PDF tools including compression,
                merging, splitting, and conversion — all accessible directly from your web browser.
              </p>
              <Button className="gap-2 rounded-xl" onClick={() => window.open("https://smallpdf.com", "_blank")}>
                <ExternalLink className="h-4 w-4" />
                Open Smallpdf
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TOOLS.map((tool) => (
          <Card
            key={tool.label}
            className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => window.open(tool.href, "_blank")}
          >
            <CardContent className="p-4 text-center">
              <tool.icon className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-medium">{tool.label}</p>
              <p className="text-xs text-muted-foreground">{tool.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardContent className="p-5">
          <h4 className="font-medium text-sm mb-3">How to Use Smallpdf</h4>
          <div className="space-y-3">
            {[
              { step: 1, text: "Visit Smallpdf.com — no account required for basic use (2 tasks per day free)." },
              { step: 2, text: "Choose a tool from the homepage or drag & drop your file directly onto the page." },
              { step: 3, text: "The tool processes your file in the browser. Wait for completion (usually seconds)." },
              { step: 4, text: "Download your processed file. Files are automatically deleted from Smallpdf servers after 1 hour." },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold shrink-0">
                  {s.step}
                </span>
                <p className="text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}