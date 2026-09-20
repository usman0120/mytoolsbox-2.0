"use client";

import { useState } from "react";
import { FileText, ExternalLink, Smile, Wand2, Layout, FileOutput, Shield, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  { icon: Smile, label: "User-Friendly", desc: "Intuitive interface for beginners" },
  { icon: Wand2, label: "AI-Powered", desc: "Smart editing with AI assistance" },
  { icon: Layout, label: "Form Creation", desc: "Create fillable PDF forms easily" },
  { icon: FileOutput, label: "Format Conversion", desc: "Convert to/from multiple formats" },
  { icon: Shield, label: "Redaction", desc: "Permanently remove sensitive data" },
  { icon: Type, label: "OCR", desc: "Make scanned documents searchable" },
];

export function PDFElementEngine() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">PDFelement</Badge>
        <span className="text-xs text-muted-foreground">User-friendly PDF editor for beginners</span>
      </div>

      <Card className="border-border/50 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/20 shrink-0">
              <FileText className="h-7 w-7 text-violet-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">PDFelement</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A beginner-friendly PDF editor by Wondershare with AI-powered features. Edit, convert, create forms,
                and secure your PDFs with an intuitive ribbon-style interface similar to Microsoft Office.
              </p>
              <div className="flex gap-2">
                <Button className="gap-2 rounded-xl" onClick={() => window.open("https://pdf.wondershare.com", "_blank")}>
                  <ExternalLink className="h-4 w-4" />
                  Open PDFelement
                </Button>
                <Button variant="outline" className="gap-2 rounded-xl" onClick={() => window.open("https://pdf.wondershare.com/pdf-editor/", "_blank")}>
                  Learn More
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
              <feat.icon className="h-6 w-6 mx-auto mb-2 text-violet-500" />
              <p className="text-sm font-medium">{feat.label}</p>
              <p className="text-xs text-muted-foreground">{feat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardContent className="p-5">
          <h4 className="font-medium text-sm mb-3">How to Use PDFelement</h4>
          <div className="space-y-3">
            {[
              { step: 1, text: "Download and install PDFelement from the Wondershare website (Windows, Mac, iOS, Android)." },
              { step: 2, text: "Open your PDF or create a new one from scratch using the built-in templates." },
              { step: 3, text: "Use the ribbon toolbar to edit text, images, links, and form fields — just like in Word." },
              { step: 4, text: "Apply OCR to scanned documents, add signatures, redact sensitive info, or convert to other formats." },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 text-xs font-bold shrink-0">
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