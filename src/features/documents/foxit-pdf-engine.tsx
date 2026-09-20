"use client";

import { useState } from "react";
import { FileText, ExternalLink, Layers, Image, FileOutput, Combine, Zap, ScanEye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  { icon: Layers, label: "Batch Processing", desc: "Process multiple files simultaneously" },
  { icon: Image, label: "JPG ↔ PDF", desc: "Convert between images and PDFs" },
  { icon: FileOutput, label: "Format Conversion", desc: "Convert to/from Office formats" },
  { icon: Combine, label: "Merge & Split", desc: "Combine or divide documents" },
  { icon: Zap, label: "Fast Performance", desc: "Optimized processing engine" },
  { icon: ScanEye, label: "OCR Support", desc: "Recognize text in scanned docs" },
];

export function FoxitPDFEngine() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Foxit PDF</Badge>
        <span className="text-xs text-muted-foreground">Batch processing for JPG ↔ PDF conversion</span>
      </div>

      <Card className="border-border/50 bg-linear-to-br from-red-500/5 to-rose-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 shrink-0">
              <FileText className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Foxit PDF Editor</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A fast, lightweight PDF editor with powerful batch processing capabilities. Foxit excels at
                JPG-to-PDF and PDF-to-JPG conversions, making it ideal for document imaging workflows.
              </p>
              <div className="flex gap-2">
                <Button className="gap-2 rounded-xl" onClick={() => window.open("https://www.foxit.com", "_blank")}>
                  <ExternalLink className="h-4 w-4" />
                  Open Foxit
                </Button>
                <Button variant="outline" className="gap-2 rounded-xl" onClick={() => window.open("https://www.foxit.com/pdf-editor/", "_blank")}>
                  PDF Editor
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FEATURES.map((feat) => (
          <Card key={feat.label} className="border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-4 text-center">
              <feat.icon className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <p className="text-sm font-medium">{feat.label}</p>
              <p className="text-xs text-muted-foreground">{feat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardContent className="p-5">
          <h4 className="font-medium text-sm mb-3">How to Use Foxit PDF Editor</h4>
          <div className="space-y-3">
            {[
              { step: 1, text: "Download Foxit PDF Editor for Windows, Mac, or use Foxit Online in your browser." },
              { step: 2, text: "For batch JPG→PDF: Select multiple images and use the 'Create PDF' → 'From Multiple Files' option." },
              { step: 3, text: "For batch PDF→JPG: Open your PDF and use 'Export' → 'Image' to convert all pages to JPG/PNG." },
              { step: 4, text: "Use the batch processing toolbar to apply the same operation to multiple files at once." },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-red-600 text-xs font-bold shrink-0">
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