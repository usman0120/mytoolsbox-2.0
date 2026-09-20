"use client";

import { useState } from "react";
import { FileText, ExternalLink, Edit, FileCheck, Eye, Layers, Type, Highlighter, PenTool, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  { icon: Edit, label: "Text Editing", desc: "Edit text directly in PDFs" },
  { icon: Eye, label: "View & Annotate", desc: "View PDFs with annotation tools" },
  { icon: Layers, label: "Form Filling", desc: "Fill and create PDF forms" },
  { icon: Type, label: "OCR Support", desc: "Optical character recognition" },
  { icon: Highlighter, label: "Markup Tools", desc: "Highlight, underline, strikethrough" },
  { icon: PenTool, label: "Drawing Tools", desc: "Freehand drawing and shapes" },
  { icon: Shield, label: "Secure", desc: "Password protection & encryption" },
  { icon: FileCheck, label: "Export", desc: "Export to multiple formats" },
];

export function ONLYOFFICEEditorEngine() {
  const [activeTab, setActiveTab] = useState<"features" | "howto">("features");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">ONLYOFFICE</Badge>
        <span className="text-xs text-muted-foreground">Full office suite with PDF editing tools</span>
      </div>

      {/* Hero card */}
      <Card className="border-border/50 bg-linear-to-br from-blue-500/5 to-cyan-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/20 shrink-0">
              <FileText className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">ONLYOFFICE PDF Editor</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A complete office suite with powerful PDF editing capabilities. Edit text, annotate, fill forms,
                and convert PDFs — all within a professional-grade interface.
              </p>
              <div className="flex gap-2">
                <Button className="gap-2 rounded-xl" onClick={() => window.open("https://www.onlyoffice.com", "_blank")}>
                  <ExternalLink className="h-4 w-4" />
                  Open ONLYOFFICE
                </Button>
                <Button variant="outline" className="gap-2 rounded-xl" onClick={() => window.open("https://www.onlyoffice.com/pdf-editor.aspx", "_blank")}>
                  PDF Editor
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("features")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === "features" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Features
        </button>
        <button
          onClick={() => setActiveTab("howto")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === "howto" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          How to Use
        </button>
      </div>

      {activeTab === "features" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FEATURES.map((feat) => (
            <Card key={feat.label} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-4 text-center">
                <feat.icon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-sm font-medium">{feat.label}</p>
                <p className="text-xs text-muted-foreground">{feat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "howto" && (
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, text: "Visit ONLYOFFICE and create a free account or deploy the self-hosted version." },
                { step: 2, text: "Upload your PDF file to the ONLYOFFICE workspace." },
                { step: 3, text: "Use the built-in PDF editor to modify text, add annotations, fill forms, or add signatures." },
                { step: 4, text: "Export your edited PDF or convert it to other formats like DOCX, ODT, or TXT." },
              ].map((s) => (
                <div key={s.step} className="flex gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold shrink-0">
                    {s.step}
                  </span>
                  <p className="text-sm">{s.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}