"use client";

import { useState } from "react";
import { FileText, ExternalLink, Palette, ScanEye, FileSignature, Shield, Combine, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  { icon: Palette, label: "Customization", desc: "Full control over PDF appearance" },
  { icon: ScanEye, label: "OCR Powerhouse", desc: "Advanced text recognition engine" },
  { icon: FileSignature, label: "Digital Signatures", desc: "Certified digital signing" },
  { icon: Shield, label: "Security", desc: "Encryption & permission controls" },
  { icon: Combine, label: "Merge & Split", desc: "Combine or divide PDFs easily" },
  { icon: FileOutput, label: "Batch Export", desc: "Export to 20+ file formats" },
];

export function NitroProEngine() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Nitro Pro</Badge>
        <span className="text-xs text-muted-foreground">PDF customization & OCR powerhouse</span>
      </div>

      <Card className="border-border/50 bg-linear-to-br from-amber-500/5 to-orange-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20 shrink-0">
              <FileText className="h-7 w-7 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Nitro Pro</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A comprehensive PDF solution for businesses. Nitro Pro offers powerful OCR, advanced customization,
                digital signatures, and seamless integration with cloud storage and enterprise workflows.
              </p>
              <div className="flex gap-2">
                <Button className="gap-2 rounded-xl" onClick={() => window.open("https://www.gonitro.com", "_blank")}>
                  <ExternalLink className="h-4 w-4" />
                  Open Nitro Pro
                </Button>
                <Button variant="outline" className="gap-2 rounded-xl" onClick={() => window.open("https://www.gonitro.com/pdf-editor", "_blank")}>
                  Features
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
              <feat.icon className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <p className="text-sm font-medium">{feat.label}</p>
              <p className="text-xs text-muted-foreground">{feat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardContent className="p-5">
          <h4 className="font-medium text-sm mb-3">How to Use Nitro Pro</h4>
          <div className="space-y-3">
            {[
              { step: 1, text: "Download Nitro Pro for Windows or use Nitro Sign for cloud-based workflows." },
              { step: 2, text: "Open your PDF and use the ribbon interface to edit text, images, and page layouts." },
              { step: 3, text: "Apply OCR to scanned documents, add digital signatures, or set password protection." },
              { step: 4, text: "Export to Microsoft Office formats, combine multiple files, or share via cloud integration." },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold shrink-0">
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