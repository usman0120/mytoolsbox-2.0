"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Table as TableIcon,
  Search,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { csvToExcel, detectDelimiter, parseCsvText } from "@/features/documents/csv-to-excel";

export function CSVToExcelEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [sheetName, setSheetName] = useState("Sheet1");
  const [delimiter, setDelimiter] = useState<string>("auto");
  const [detectedDelimiter, setDetectedDelimiter] = useState<string>(",");

  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalCols, setTotalCols] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("spreadsheet.xlsx");

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (f: File) => {
    setError(null);
    setOutputUrl(null);

    try {
      const text = await f.text();
      const detected = detectDelimiter(text.slice(0, 4000));
      setDetectedDelimiter(detected);

      const effectiveDelimiter = delimiter === "auto" ? detected : delimiter;
      const parsed = parseCsvText(text, effectiveDelimiter);

      if (parsed.length === 0) {
        throw new Error("No readable rows found in CSV file.");
      }

      const cols = Math.max(...parsed.map((r) => r.length));
      setFile(f);
      setPreviewRows(parsed.slice(0, 50));
      setTotalRows(parsed.length);
      setTotalCols(cols);
      setDownloadName(`${f.name.replace(/\.[^.]+$/, "")}.xlsx`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load CSV file.");
    }
  }, [delimiter]);

  const handleDelimiterChange = async (newDelim: string) => {
    setDelimiter(newDelim);
    if (!file) return;
    const text = await file.text();
    const effective = newDelim === "auto" ? detectedDelimiter : newDelim;
    const parsed = parseCsvText(text, effective);
    setPreviewRows(parsed.slice(0, 50));
    setTotalRows(parsed.length);
    setTotalCols(Math.max(...parsed.map((r) => r.length)));
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    const effectiveDelimiter = delimiter === "auto" ? detectedDelimiter : delimiter;

    try {
      const res = await csvToExcel(file, {
        sheetName: sheetName.trim() || "Sheet1",
        delimiter: effectiveDelimiter,
      });

      if (res.status === "success" && res.outputUrl) {
        setOutputUrl(res.outputUrl);
        setDownloadName((res.data as { downloadName?: string })?.downloadName || "spreadsheet.xlsx");
      } else {
        setError(res.error || "Failed to convert CSV to Excel.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert to Excel.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = downloadName;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setOutputUrl(null);
    setError(null);
    setPreviewRows([]);
    setTotalRows(0);
    setTotalCols(0);
    setSearchQuery("");
  };

  // Filter preview rows
  const filteredRows = searchQuery.trim()
    ? previewRows.filter((row) => row.some((cell) => cell.toLowerCase().includes(searchQuery.toLowerCase())))
    : previewRows;

  const getDelimiterLabel = (d: string) => {
    switch (d) {
      case ",": return "Comma (,)";
      case "\t": return "Tab (\\t)";
      case ";": return "Semicolon (;)";
      case "|": return "Pipe (|)";
      default: return `Custom (${d})`;
    }
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            CSV to Excel Converter (.xlsx)
          </Badge>
          <span className="text-xs text-muted-foreground">
            Convert CSV & TSV into genuine Microsoft Excel OpenXML spreadsheets with live data preview
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
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer ${
            dragOver ? "border-emerald-500 bg-emerald-500/5 scale-[0.99]" : "border-border/60 hover:border-emerald-500/40 bg-card/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-600">
            <FileSpreadsheet className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-base mb-1">Drop your CSV or TSV file here</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
          <Button onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }} className="rounded-lg gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Upload className="h-4 w-4" /> Select CSV File
          </Button>
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

      {file && (
        <div className="space-y-6">
          {/* Header Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>{totalRows.toLocaleString()} rows</span>
                  <span>•</span>
                  <span>{totalCols} columns</span>
                  <span>•</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Delimiter: {getDelimiterLabel(delimiter === "auto" ? detectedDelimiter : delimiter)}
                  </Badge>
                </div>
              </div>
            </div>

            {outputUrl ? (
              <Button onClick={handleDownload} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="h-4 w-4" /> Download Excel (.xlsx)
              </Button>
            ) : (
              <Button onClick={handleConvert} disabled={processing} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                {processing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Generating .xlsx...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Convert to Excel (.xlsx)
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Success Banner */}
          {outputUrl && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Excel Spreadsheet Ready!</p>
                    <p className="text-xs text-muted-foreground">
                      Valid OpenXML workbook generated with sheet name &quot;{sheetName}&quot;. Ready for Excel, Google Sheets, or Numbers.
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={handleDownload} className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Download className="h-3.5 w-3.5" /> Download ({downloadName})
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Configuration Card */}
          <section aria-label="Spreadsheet settings">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Excel Worksheet Name</Label>
                <Input
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="Sheet1"
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Delimiter Detection</Label>
                <select
                  aria-label="Delimiter detection"
                  value={delimiter}
                  onChange={(e) => handleDelimiterChange(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-background p-2 text-xs h-9"
                >
                  <option value="auto">Auto-detect ({getDelimiterLabel(detectedDelimiter)})</option>
                  <option value=",">Comma (,)</option>
                  <option value="&#9;">Tab (\t)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Interactive Data Table Preview */}
          <section aria-label="Spreadsheet preview" className="min-w-0">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold">Spreadsheet Preview (First {previewRows.length} Rows)</span>
                </div>
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in preview..."
                    className="pl-8 text-xs h-8 rounded-lg"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border/60 overflow-x-auto max-h-[360px]">
                <table className="w-full border-collapse text-[11px] font-mono">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border/60">
                      <th className="p-2 text-center text-muted-foreground w-10 border-r border-border/40">#</th>
                      {Array.from({ length: totalCols }).map((_, cIdx) => (
                        <th key={cIdx} className="p-2 text-left font-semibold text-foreground border-r border-border/40 whitespace-nowrap">
                          {previewRows[0]?.[cIdx] || `Col ${cIdx + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="p-2 text-center text-muted-foreground border-r border-border/40 bg-muted/20">
                          {rIdx + 1}
                        </td>
                        {Array.from({ length: totalCols }).map((_, cIdx) => (
                          <td key={cIdx} className="p-2 border-r border-border/30 whitespace-nowrap max-w-[200px] truncate">
                            {row[cIdx] || ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}