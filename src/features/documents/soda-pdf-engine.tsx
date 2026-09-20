"use client";

import { useState } from "react";
import { FileText, ExternalLink, ScanEye, FileSearch, Pencil, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  { icon: ScanEye, label: "OCR Technology", desc: "Convert scanned PDFs to editable text" },
  { icon: Pencil, label: "Edit PDFs", desc: "Modify text and images directly" },
  { icon: FileSearch, label: "Smart Search", desc: "Search across multiple PDFs" },
  { icon: Lock, label: "e-Signatures", desc: "Legally binding digital signatures" },
  { icon: Globe, label: "Online & Desktop", desc: "Works in browser and as desktop app" },
  { icon: FileText, label: "Batch Processing", desc: "Process multiple files at once" },
];

export function SodaPDFEngine() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Soda PDF</Badge>
        <span className="text-xs text-muted-foreground">Desktop & online PDF editor with OCR</span>
      </div>

      <Card className="border-border/50 bg-gradient-to-br from-teal-500/5 to-emerald-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 ring-1 ring-teal-500/20 shrink-0">
              <FileText className="h-7 w-7 text-teal-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Soda PDF</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A powerful PDF solution available both online and as a desktop application. Features advanced OCR,
                editing tools, e-signatures, and batch processing for professional document workflows.
              </p>
              <div className="flex gap-2">
                <Button className="gap-2 rounded-xl" onClick={() => window.open("https://www.sodapdf.com", "_blank")}>
                  <ExternalLink className="h-4 w-4" />
                  Open Soda PDF
                </Button>
                <Button variant="outline" className="gap-2 rounded-xl" onClick={() => window.open("https://www.sodapdf.com/pdf-editor/", "_blank")}>
                  Online Editor
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
              <feat.icon className="h-6 w-6 mx-auto mb-2 text-teal-500" />
              <p className="text-sm font-medium">{feat.label}</p>
              <p className="text-xs text-muted-foreground">{feat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardContent className="p-5">
          <h4 className="font-medium text-sm mb-3">How to Use Soda PDF</h4>
          <div className="space-y-3">
            {[
              { step: 1, text: "Choose between the online web app or download the desktop version for offline use." },
              { step: 2, text: "Upload your PDF or scan a document using the OCR feature to make it editable." },
              { step: 3, text: "Edit text, images, add annotations, or insert e-signatures as needed." },
              { step: 4, text: "Save, export, or share your document directly from the application." },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 text-xs font-bold shrink-0">
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