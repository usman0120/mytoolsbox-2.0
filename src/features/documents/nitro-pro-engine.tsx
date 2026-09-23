"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  FileText,
  Shield,
  Hash,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Lock,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

export function NitroProEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [pageCount, setPageCount] = useState(0);

  // Bates Numbering options
  const [enableBates, setEnableBates] = useState(true);
  const [batesPrefix, setBatesPrefix] = useState("CASE-2024-");
  const [batesStartNum, setBatesStartNum] = useState(1);
  const [batesDigits, setBatesDigits] = useState(6);
  const [batesSuffix, setBatesSuffix] = useState("");
  const [batesPosition, setBatesPosition] = useState<"bottom-right" | "top-right" | "bottom-center">("bottom-right");

  // Enterprise Seal & Department Stamps
  const [sealPreset, setSealPreset] = useState<string>("LEGAL COMPLIANT");
  const [enableSeal, setEnableSeal] = useState(false);
  const [departmentName, setDepartmentName] = useState("Corporate Compliance");
  const [sealColor, setSealColor] = useState<"navy" | "emerald" | "burgundy" | "amber">("navy");

  // Enterprise Document Headers / Footers
  const [headerTitle, setHeaderTitle] = useState("");
  const [classification, setClassification] = useState<"RESTRICTED" | "INTERNAL USE ONLY" | "PUBLIC" | "STRICTLY CONFIDENTIAL">("RESTRICTED");
  const [enableClassificationBanner, setEnableClassificationBanner] = useState(false);

  // Password & Permissions
  const [userPassword, setUserPassword] = useState("");
  const [restrictPrinting, setRestrictPrinting] = useState(false);
  const [restrictCopying, setRestrictCopying] = useState(false);

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setOutputUrl(null);

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setFile(f);
      setPageCount(pdf.getPageCount());
      setHeaderTitle(`PROJECT: ${f.name.replace(/\.[^.]+$/, "").toUpperCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse PDF document.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleProcess = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

      const pages = pdf.getPages();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const courierBold = await pdf.embedFont(StandardFonts.CourierBold);

      const total = pages.length;

      // Color mapping for corporate seals
      const sealColors = {
        navy: rgb(0.08, 0.22, 0.45),
        emerald: rgb(0.06, 0.45, 0.28),
        burgundy: rgb(0.55, 0.1, 0.2),
        amber: rgb(0.68, 0.4, 0.05),
      };

      for (let i = 0; i < total; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // 1. Bates Numbering
        if (enableBates) {
          const numValue = batesStartNum + i;
          const paddedNum = String(numValue).padStart(batesDigits, "0");
          const batesText = `${batesPrefix}${paddedNum}${batesSuffix}`;
          const batesFontSize = 10;
          const textWidth = courierBold.widthOfTextAtSize(batesText, batesFontSize);

          let x = width - textWidth - 36;
          let y = 25;

          if (batesPosition === "top-right") {
            y = height - 28;
          } else if (batesPosition === "bottom-center") {
            x = (width - textWidth) / 2;
          }

          // Subtle background pill for readability
          page.drawRectangle({
            x: x - 6,
            y: y - 3,
            width: textWidth + 12,
            height: batesFontSize + 6,
            color: rgb(0.95, 0.95, 0.97),
            borderWidth: 0.5,
            borderColor: rgb(0.7, 0.7, 0.75),
          });

          page.drawText(batesText, {
            x,
            y,
            size: batesFontSize,
            font: courierBold,
            color: rgb(0.1, 0.1, 0.15),
          });
        }

        // 2. Official Department Seal
        if (enableSeal && sealPreset) {
          const color = sealColors[sealColor];
          const stampBoxWidth = 160;
          const stampBoxHeight = 44;
          const stampX = width - stampBoxWidth - 36;
          const stampY = height - stampBoxHeight - 36;

          // Double border corporate seal badge
          page.drawRectangle({
            x: stampX,
            y: stampY,
            width: stampBoxWidth,
            height: stampBoxHeight,
            borderColor: color,
            borderWidth: 1.5,
            color: rgb(1, 1, 1),
            opacity: 0.9,
          });

          page.drawRectangle({
            x: stampX + 3,
            y: stampY + 3,
            width: stampBoxWidth - 6,
            height: stampBoxHeight - 6,
            borderColor: color,
            borderWidth: 0.75,
          });

          const titleWidth = boldFont.widthOfTextAtSize(sealPreset, 9);
          page.drawText(sealPreset, {
            x: stampX + (stampBoxWidth - titleWidth) / 2,
            y: stampY + 24,
            size: 9,
            font: boldFont,
            color,
          });

          const deptText = `${departmentName} • ${new Date().toLocaleDateString()}`;
          const deptWidth = font.widthOfTextAtSize(deptText, 7);
          page.drawText(deptText, {
            x: stampX + (stampBoxWidth - deptWidth) / 2,
            y: stampY + 10,
            size: 7,
            font,
            color: rgb(0.3, 0.3, 0.35),
          });
        }

        // 3. Classification Banner
        if (enableClassificationBanner) {
          const bannerText = `*** ${classification} ***`;
          const bannerFontSize = 9;
          const bannerWidth = boldFont.widthOfTextAtSize(bannerText, bannerFontSize);

          // Top banner
          page.drawText(bannerText, {
            x: (width - bannerWidth) / 2,
            y: height - 16,
            size: bannerFontSize,
            font: boldFont,
            color: classification.includes("CONFIDENTIAL") || classification.includes("RESTRICTED")
              ? rgb(0.75, 0.1, 0.1)
              : rgb(0.2, 0.2, 0.2),
          });

          // Bottom banner
          page.drawText(bannerText, {
            x: (width - bannerWidth) / 2,
            y: 10,
            size: bannerFontSize,
            font: boldFont,
            color: classification.includes("CONFIDENTIAL") || classification.includes("RESTRICTED")
              ? rgb(0.75, 0.1, 0.1)
              : rgb(0.2, 0.2, 0.2),
          });
        }

        // 4. Running Header
        if (headerTitle.trim()) {
          page.drawText(headerTitle, {
            x: 36,
            y: height - 28,
            size: 8.5,
            font,
            color: rgb(0.3, 0.3, 0.35),
          });
        }
      }

      // 5. Update Enterprise Metadata
      pdf.setProducer("Nitro Pro Enterprise • MyToolsBox");
      pdf.setCreator("Nitro Pro Enterprise Suite");
      pdf.setModificationDate(new Date());

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setOutputUrl(url);
      setOutputName(`${file.name.replace(/\.[^.]+$/, "")}_enterprise.pdf`);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process enterprise PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = outputName;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setOutputUrl(null);
    setSuccess(false);
    setError(null);
    setPageCount(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            Nitro Pro Enterprise
          </Badge>
          <span className="text-xs text-muted-foreground">
            Enterprise Bates numbering, official department seals, classification banners & security
          </span>
        </div>
        {file && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" /> Start Over
          </Button>
        )}
      </div>

      {!file && (
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            dragOver ? "border-amber-500 bg-amber-500/5 scale-[0.99]" : "border-border/60 hover:border-amber-500/40 bg-card/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20 text-amber-600">
            <Building2 className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-base mb-1">Upload PDF for Enterprise Processing</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Apply automated Bates numbering sequences, official department compliance seals, and audit classification banners in seconds.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
          <Button size="sm" className="rounded-xl gap-2 pointer-events-none bg-amber-600 hover:bg-amber-700 text-white">
            <Upload className="h-4 w-4" /> Select Enterprise PDF
          </Button>
        </div>
      )}

      {loading && (
        <div className="py-12 text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-3 border-amber-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Inspecting document pages...</p>
        </div>
      )}

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {file && !loading && (
        <div className="space-y-6">
          {/* Header Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{pageCount} page(s)</span>
                  <span>•</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600">Enterprise Ready</Badge>
                </div>
              </div>
            </div>
            {outputUrl ? (
              <Button onClick={handleDownload} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="h-4 w-4" /> Download Processed PDF
              </Button>
            ) : (
              <Button onClick={handleProcess} disabled={processing} className="gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white">
                {processing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Process Document
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Success Notification */}
          {success && outputUrl && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Enterprise PDF successfully generated!</p>
                    <p className="text-xs text-muted-foreground">Bates stamping and compliance verification applied across all {pageCount} pages.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDownload} className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="h-3.5 w-3.5" /> Download ({outputName})
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(outputUrl, "_blank")} className="rounded-xl gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs for Nitro Pro Operations */}
          <Tabs defaultValue="bates" className="space-y-4">
            <TabsList className="grid grid-cols-3 rounded-xl p-1 bg-muted/50 border border-border/50">
              <TabsTrigger value="bates" className="rounded-lg gap-2 text-xs sm:text-sm">
                <Hash className="h-4 w-4" /> Bates Numbering
              </TabsTrigger>
              <TabsTrigger value="seal" className="rounded-lg gap-2 text-xs sm:text-sm">
                <Award className="h-4 w-4" /> Official Seal & Stamps
              </TabsTrigger>
              <TabsTrigger value="classification" className="rounded-lg gap-2 text-xs sm:text-sm">
                <Shield className="h-4 w-4" /> Classification & Headers
              </TabsTrigger>
            </TabsList>

            {/* Bates Numbering Tab */}
            <TabsContent value="bates" className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm mb-0.5">Automated Bates Numbering</h4>
                      <p className="text-xs text-muted-foreground">Index legal discovery & corporate documents with continuous Bates codes.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="bates-toggle"
                        checked={enableBates}
                        onChange={(e) => setEnableBates(e.target.checked)}
                        className="rounded border-border text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                      <label htmlFor="bates-toggle" className="text-xs font-semibold cursor-pointer">
                        Enable Bates Numbering
                      </label>
                    </div>
                  </div>

                  {enableBates && (
                    <div className="space-y-4 pt-2 border-t border-border/40">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Prefix</Label>
                          <Input
                            value={batesPrefix}
                            onChange={(e) => setBatesPrefix(e.target.value)}
                            placeholder="e.g. CASE-2024-"
                            className="rounded-xl font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Start Number</Label>
                          <Input
                            type="number"
                            min="1"
                            value={batesStartNum}
                            onChange={(e) => setBatesStartNum(parseInt(e.target.value) || 1)}
                            className="rounded-xl font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Zero Padding Digits</Label>
                          <select
                            value={batesDigits}
                            onChange={(e) => setBatesDigits(parseInt(e.target.value))}
                            className="w-full rounded-xl border border-border/50 bg-background p-2 text-xs h-9 font-mono"
                          >
                            <option value={4}>4 Digits (0001)</option>
                            <option value={6}>6 Digits (000001)</option>
                            <option value={8}>8 Digits (00000001)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Suffix (optional)</Label>
                          <Input
                            value={batesSuffix}
                            onChange={(e) => setBatesSuffix(e.target.value)}
                            placeholder="e.g. -CONF"
                            className="rounded-xl font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Bates Position</Label>
                          <select
                            value={batesPosition}
                            onChange={(e) => setBatesPosition(e.target.value as typeof batesPosition)}
                            className="w-full rounded-xl border border-border/50 bg-background p-2 text-xs h-9"
                          >
                            <option value="bottom-right">Bottom Right (Standard Legal)</option>
                            <option value="top-right">Top Right</option>
                            <option value="bottom-center">Bottom Center</option>
                          </select>
                        </div>
                      </div>

                      {/* Live Bates Sample */}
                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Preview Bates Code (Page 1):</span>
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-background rounded-md border border-border">
                          {batesPrefix}{String(batesStartNum).padStart(batesDigits, "0")}{batesSuffix}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Official Seal & Stamps Tab */}
            <TabsContent value="seal" className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm mb-0.5">Corporate Compliance Seal</h4>
                      <p className="text-xs text-muted-foreground">Stamp certified verification seals onto top right of all pages.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="seal-toggle"
                        checked={enableSeal}
                        onChange={(e) => setEnableSeal(e.target.checked)}
                        className="rounded border-border text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                      <label htmlFor="seal-toggle" className="text-xs font-semibold cursor-pointer">
                        Enable Seal
                      </label>
                    </div>
                  </div>

                  {enableSeal && (
                    <div className="space-y-4 pt-2 border-t border-border/40">
                      <div>
                        <Label className="text-xs mb-2 block">Seal Certification Title</Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "LEGAL COMPLIANT",
                            "OFFICIALLY AUDITED",
                            "REVIEWED & VERIFIED",
                            "BOARD APPROVED",
                            "ARCHIVED RECORD",
                          ].map((preset) => (
                            <Button
                              key={preset}
                              type="button"
                              size="sm"
                              variant={sealPreset === preset ? "default" : "outline"}
                              className="rounded-xl text-xs"
                              onClick={() => setSealPreset(preset)}
                            >
                              {preset}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Certifying Department</Label>
                          <Input
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                            placeholder="e.g. Legal Affairs Division"
                            className="rounded-xl text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Seal Color Theme</Label>
                          <div className="flex gap-2">
                            {[
                              { id: "navy", label: "Navy", bg: "bg-blue-900" },
                              { id: "emerald", label: "Emerald", bg: "bg-emerald-700" },
                              { id: "burgundy", label: "Burgundy", bg: "bg-rose-900" },
                              { id: "amber", label: "Amber", bg: "bg-amber-600" },
                            ].map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setSealColor(c.id as typeof sealColor)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                                  sealColor === c.id ? "border-amber-600 bg-amber-500/10 font-medium" : "border-border/50 bg-muted/20"
                                }`}
                              >
                                <span className={`h-2.5 w-2.5 rounded-full ${c.bg}`} />
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Classification & Headers Tab */}
            <TabsContent value="classification" className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-0.5">Document Classification & Headers</h4>
                    <p className="text-xs text-muted-foreground">Add top/bottom security classification markings and project identifiers.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
                      <div>
                        <p className="text-xs font-semibold">Security Classification Banners</p>
                        <p className="text-xs text-muted-foreground">Stamps classification warnings at the top and bottom of each page.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableClassificationBanner}
                        onChange={(e) => setEnableClassificationBanner(e.target.checked)}
                        className="rounded border-border text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                    </div>

                    {enableClassificationBanner && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["RESTRICTED", "INTERNAL USE ONLY", "PUBLIC", "STRICTLY CONFIDENTIAL"].map((level) => (
                          <Button
                            key={level}
                            type="button"
                            size="sm"
                            variant={classification === level ? "default" : "outline"}
                            className="rounded-xl text-[11px]"
                            onClick={() => setClassification(level as typeof classification)}
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-xs">Project / Header Tracking Text</Label>
                      <Input
                        value={headerTitle}
                        onChange={(e) => setHeaderTitle(e.target.value)}
                        placeholder="e.g. ACME CORP - AUDIT REPORT 2024"
                        className="rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleProcess}
            disabled={processing}
            className="w-full py-6 rounded-2xl text-sm font-semibold shadow-md gap-2 bg-amber-600 hover:bg-amber-700 text-white"
          >
            {processing ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                Executing Enterprise Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> Run Enterprise Stamping & Export PDF
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}