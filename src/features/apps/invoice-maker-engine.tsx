"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Receipt, Plus, Trash2, Download, Calculator, Building2,
  Mail, Phone, Globe, Hash, Calendar, DollarSign, Percent,
  Upload, Palette, FileText, Printer, Copy
} from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  fromName: string;
  fromEmail: string;
  fromPhone: string;
  fromAddress: string;
  toName: string;
  toEmail: string;
  toAddress: string;
  items: LineItem[];
  taxRate: number;
  notes: string;
  currency: string;
  accentColor: string;
}

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "CNY"];
const COLORS = ["#0891b2", "#7c3aed", "#059669", "#dc2626", "#d97706", "#2563eb", "#0f172a"];

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function InvoiceMakerEngine() {
  const [data, setData] = useState<InvoiceData>(() => ({
    invoiceNumber: `INV-${new Date().getFullYear()}-001`,
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    fromName: "",
    fromEmail: "",
    fromPhone: "",
    fromAddress: "",
    toName: "",
    toEmail: "",
    toAddress: "",
    items: [
      { id: "1", description: "Web Development", quantity: 1, rate: 2500 },
      { id: "2", description: "UI/UX Design", quantity: 1, rate: 1500 },
    ],
    taxRate: 0,
    notes: "Thank you for your business!",
    currency: "USD",
    accentColor: "#0891b2",
  }));
  const invoiceRef = useRef<HTMLDivElement>(null);

  const updateField = <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setData((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), description: "", quantity: 1, rate: 0 }],
    }));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const removeItem = (id: string) => {
    setData((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));
  };

  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = subtotal * (data.taxRate / 100);
  const total = subtotal + tax;

  const exportPDF = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const itemsHtml = data.items
      .map(
        (item, i) => `
      <tr>
        <td style="padding:8px;border:1px solid #e5e7eb;">${i + 1}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${item.description}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.rate, data.currency)}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.quantity * item.rate, data.currency)}</td>
      </tr>`
      )
      .join("");

    printWindow.document.write(`
      <html><head>
        <style>
          body { font-family: Inter, sans-serif; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
          .invoice-title { font-size: 32px; font-weight: 700; color: ${data.accentColor}; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: ${data.accentColor}; color: white; padding: 10px 8px; text-align: left; font-size: 13px; }
          .totals { margin-left: auto; width: 280px; }
          .totals td { padding: 6px 8px; }
          .total-row { font-size: 18px; font-weight: 700; color: ${data.accentColor}; }
          @media print { body { padding: 0; } }
        </style></head>
        <body>
          <div class="header">
            <div>
              <h1 class="invoice-title">INVOICE</h1>
              <p>#${data.invoiceNumber}</p>
              <p>Date: ${data.date}</p>
              <p>Due: ${data.dueDate}</p>
            </div>
            <div style="text-align:right;">
              <h3>${data.fromName}</h3>
              <p>${data.fromEmail}</p>
              <p>${data.fromPhone}</p>
              <p style="white-space:pre-wrap;">${data.fromAddress}</p>
            </div>
          </div>
          <div style="margin-bottom:24px;">
            <strong>Bill To:</strong>
            <h3>${data.toName}</h3>
            <p>${data.toEmail}</p>
            <p style="white-space:pre-wrap;">${data.toAddress}</p>
          </div>
          <table>
            <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <table class="totals">
            <tr><td>Subtotal</td><td style="text-align:right;">${formatCurrency(subtotal, data.currency)}</td></tr>
            <tr><td>Tax (${data.taxRate}%)</td><td style="text-align:right;">${formatCurrency(tax, data.currency)}</td></tr>
            <tr class="total-row"><td>Total</td><td style="text-align:right;">${formatCurrency(total, data.currency)}</td></tr>
          </table>
          ${data.notes ? `<p style="margin-top:24px;color:#6b7280;">${data.notes}</p>` : ""}
        </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }, [data, subtotal, tax, total]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Currency:</span>
          <select
            value={data.currency}
            onChange={(e) => updateField("currency", e.target.value)}
            className="text-sm border rounded-md px-2 py-1.5 bg-background"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Color:</span>
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`w-6 h-6 rounded-full border-2 transition-all ${data.accentColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c }}
                onClick={() => updateField("accentColor", c)}
              />
            ))}
          </div>
        </div>
        <div className="flex-1" />
        <Button onClick={exportPDF} size="sm" className="gap-1.5">
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          {/* Invoice Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="h-4 w-4" /> Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Invoice #" value={data.invoiceNumber} onChange={(e) => updateField("invoiceNumber", e.target.value)} />
                <Input type="date" value={data.date} onChange={(e) => updateField("date", e.target.value)} />
                <Input type="date" value={data.dueDate} onChange={(e) => updateField("dueDate", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* From */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" /> From (Your Business)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Business Name" value={data.fromName} onChange={(e) => updateField("fromName", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Email" type="email" value={data.fromEmail} onChange={(e) => updateField("fromEmail", e.target.value)} />
                <Input placeholder="Phone" value={data.fromPhone} onChange={(e) => updateField("fromPhone", e.target.value)} />
              </div>
              <Textarea placeholder="Address" value={data.fromAddress} onChange={(e) => updateField("fromAddress", e.target.value)} rows={2} />
            </CardContent>
          </Card>

          {/* To */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Bill To (Client)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Client Name" value={data.toName} onChange={(e) => updateField("toName", e.target.value)} />
              <Input placeholder="Client Email" type="email" value={data.toEmail} onChange={(e) => updateField("toEmail", e.target.value)} />
              <Textarea placeholder="Client Address" value={data.toAddress} onChange={(e) => updateField("toAddress", e.target.value)} rows={2} />
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-4 w-4" /> Line Items
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.items.map((item) => (
                <div key={item.id} className="flex gap-2 items-start">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                    className="w-16 text-center"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                    className="w-24 text-right"
                  />
                  <Button variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Separator />

              <div className="flex items-center gap-3">
                <span className="text-sm">Tax Rate:</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={data.taxRate}
                  onChange={(e) => updateField("taxRate", parseFloat(e.target.value) || 0)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>

              <Textarea
                placeholder="Notes / Payment instructions"
                value={data.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={2}
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-4 h-fit">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2 bg-muted/30">
              <CardTitle className="text-sm">Invoice Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div ref={invoiceRef} className="p-6 text-sm">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-bold" style={{ color: data.accentColor }}>INVOICE</h2>
                    <p className="text-muted-foreground mt-1">#{data.invoiceNumber || "INV-001"}</p>
                    <p className="text-xs text-muted-foreground">Date: {data.date || "—"}</p>
                    <p className="text-xs text-muted-foreground">Due: {data.dueDate || "—"}</p>
                  </div>
                  {data.fromName && (
                    <div className="text-right">
                      <p className="font-semibold">{data.fromName}</p>
                      <p className="text-xs text-muted-foreground">{data.fromEmail}</p>
                      <p className="text-xs text-muted-foreground">{data.fromPhone}</p>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{data.fromAddress}</p>
                    </div>
                  )}
                </div>

                {/* Bill To */}
                {data.toName && (
                  <div className="mb-6">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Bill To:</p>
                    <p className="font-semibold">{data.toName}</p>
                    <p className="text-xs text-muted-foreground">{data.toEmail}</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{data.toAddress}</p>
                  </div>
                )}

                {/* Items Table */}
                <table className="w-full text-xs mb-4">
                  <thead>
                    <tr style={{ backgroundColor: data.accentColor + "15" }}>
                      <th className="text-left p-2 font-medium">#</th>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="text-center p-2 font-medium">Qty</th>
                      <th className="text-right p-2 font-medium">Rate</th>
                      <th className="text-right p-2 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item, i) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2 text-muted-foreground">{i + 1}</td>
                        <td className="p-2">{item.description || "—"}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right">{formatCurrency(item.rate, data.currency)}</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(item.quantity * item.rate, data.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="ml-auto w-56 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal, data.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({data.taxRate}%)</span>
                    <span>{formatCurrency(tax, data.currency)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-bold" style={{ color: data.accentColor }}>
                    <span>Total</span>
                    <span>{formatCurrency(total, data.currency)}</span>
                  </div>
                </div>

                {data.notes && (
                  <p className="mt-6 text-xs text-muted-foreground italic">{data.notes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}