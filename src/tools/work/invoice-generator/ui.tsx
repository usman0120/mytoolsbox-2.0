"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Receipt,
  Plus,
  Trash2,
  Download,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Printer,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceData {
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
  discountRate: number;
  notes: string;
  currency: string;
  accentColor: string;
}

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "CNY"];
const COLORS = ["#0891b2", "#7c3aed", "#059669", "#dc2626", "#d97706", "#2563eb", "#0f172a"];

const INVOICE_PRESETS: Record<string, { label: string; data: Partial<InvoiceData> }> = {
  consulting: {
    label: "Software Engineering & Architecture",
    data: {
      fromName: "Nexus Digital Engineering LLC",
      fromEmail: "billing@nexusengineering.dev",
      fromPhone: "+1 (555) 349-2041",
      fromAddress: "100 Montgomery St, Suite 1400\nSan Francisco, CA 94104",
      toName: "Acme Enterprises Inc.",
      toEmail: "accounts-payable@acme.com",
      toAddress: "450 Lexington Ave\nNew York, NY 10017",
      items: [
        { id: "1", description: "Microservice Architecture & Event Pipeline Sprint", quantity: 1, rate: 3800 },
        { id: "2", description: "Edge Middleware & Latency Optimization", quantity: 1, rate: 1600 },
        { id: "3", description: "Security Audit & Token Abuse Hardening", quantity: 1, rate: 1200 },
      ],
      taxRate: 8.5,
      discountRate: 5,
      currency: "USD",
      accentColor: "#2563eb",
      notes: "Payment is due within 30 days via ACH wire or Stripe invoice portal.",
    },
  },
  design_agency: {
    label: "Brand & UI/UX Retainer",
    data: {
      fromName: "Aura Creative Studio",
      fromEmail: "hello@aurastudio.design",
      fromPhone: "+1 (555) 782-9912",
      fromAddress: "220 King St West\nToronto, ON M5H 1K4",
      toName: "Beacon Health Technologies",
      toEmail: "finance@beaconhealth.io",
      toAddress: "800 Boylston St\nBoston, MA 02199",
      items: [
        { id: "1", description: "Monthly Product Design Sprint (Figma Systems)", quantity: 1, rate: 3500 },
        { id: "2", description: "Marketing Landing Page & Micro-Interactions", quantity: 1, rate: 1400 },
      ],
      taxRate: 13,
      discountRate: 0,
      currency: "USD",
      accentColor: "#7c3aed",
      notes: "Thank you for partnering with Aura Creative Studio!",
    },
  },
};

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
    fromName: "Nexus Digital Engineering LLC",
    fromEmail: "billing@nexusengineering.dev",
    fromPhone: "+1 (555) 349-2041",
    fromAddress: "100 Montgomery St, Suite 1400\nSan Francisco, CA 94104",
    toName: "Acme Enterprises Inc.",
    toEmail: "accounts-payable@acme.com",
    toAddress: "450 Lexington Ave\nNew York, NY 10017",
    items: [
      { id: "1", description: "Full-Stack Web Engineering Sprint", quantity: 1, rate: 3200 },
      { id: "2", description: "UI/UX Component System & Accessibility Audit", quantity: 1, rate: 1400 },
    ],
    taxRate: 8,
    discountRate: 0,
    notes: "Payment is due within 30 days. Wire transfer details provided upon request.",
    currency: "USD",
    accentColor: "#2563eb",
  }));

  const invoiceRef = useRef<HTMLDivElement>(null);

  const updateField = <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const loadPreset = (key: string) => {
    const p = INVOICE_PRESETS[key];
    if (!p) return;
    setData((prev) => ({
      ...prev,
      ...p.data,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    }));
    toast.success(`Loaded invoice: ${p.label}`);
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
  const discount = subtotal * (data.discountRate / 100);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * (data.taxRate / 100);
  const total = taxableAmount + tax;

  const exportPDF = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const itemsHtml = data.items
      .map(
        (item, i) => `
      <tr>
        <td style="padding:10px;border:1px solid #e5e7eb;">${i + 1}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;"><strong>${item.description}</strong></td>
        <td style="padding:10px;border:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.rate, data.currency)}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.quantity * item.rate, data.currency)}</td>
      </tr>`
      )
      .join("");

    printWindow.document.write(`
      <html><head>
        <title>Invoice - ${data.invoiceNumber}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; max-width: 820px; margin: 0 auto; padding: 40px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; }
          .invoice-title { font-size: 32px; font-weight: 800; color: ${data.accentColor}; margin: 0 0 6px 0; }
          table { width: 100%; border-collapse: collapse; margin: 24px 0; }
          th { background: ${data.accentColor}; color: white; padding: 12px 10px; text-align: left; font-size: 13px; font-weight: 600; }
          .totals { margin-left: auto; width: 320px; }
          .totals td { padding: 8px 10px; font-size: 14px; }
          .total-row { font-size: 20px; font-weight: 800; color: ${data.accentColor}; border-top: 2px solid ${data.accentColor}; }
          @media print { body { padding: 0; } }
        </style></head>
        <body>
          <div class="header">
            <div>
              <h1 class="invoice-title">INVOICE</h1>
              <p style="margin:2px 0;font-weight:600;">#${data.invoiceNumber}</p>
              <p style="margin:2px 0;color:#64748b;">Issue Date: ${data.date}</p>
              <p style="margin:2px 0;color:#64748b;">Payment Due: ${data.dueDate}</p>
            </div>
            <div style="text-align:right;">
              <h3 style="margin:0 0 4px 0;font-size:18px;">${data.fromName}</h3>
              <p style="margin:2px 0;color:#64748b;">${data.fromEmail}</p>
              <p style="margin:2px 0;color:#64748b;">${data.fromPhone}</p>
              <p style="margin:2px 0;color:#64748b;white-space:pre-wrap;">${data.fromAddress}</p>
            </div>
          </div>
          <div style="margin-bottom:28px;">
            <span style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Bill To:</span>
            <h3 style="margin:4px 0;font-size:16px;">${data.toName}</h3>
            <p style="margin:2px 0;color:#64748b;">${data.toEmail}</p>
            <p style="margin:2px 0;color:#64748b;white-space:pre-wrap;">${data.toAddress}</p>
          </div>
          <table>
            <thead><tr><th style="width:30px;">#</th><th>Description</th><th style="text-align:center;width:60px;">Qty</th><th style="text-align:right;width:120px;">Rate</th><th style="text-align:right;width:120px;">Amount</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <table class="totals">
            <tr><td>Subtotal</td><td style="text-align:right;">${formatCurrency(subtotal, data.currency)}</td></tr>
            ${data.discountRate > 0 ? `<tr><td>Discount (${data.discountRate}%)</td><td style="text-align:right;color:#16a34a;">-${formatCurrency(discount, data.currency)}</td></tr>` : ""}
            <tr><td>Tax (${data.taxRate}%)</td><td style="text-align:right;">${formatCurrency(tax, data.currency)}</td></tr>
            <tr class="total-row"><td>Total Due</td><td style="text-align:right;">${formatCurrency(total, data.currency)}</td></tr>
          </table>
          ${data.notes ? `<div style="margin-top:32px;padding:16px;background:#f8fafc;border-radius:8px;"><strong style="font-size:12px;text-transform:uppercase;color:#475569;">Payment Instructions & Terms:</strong><p style="margin:4px 0 0 0;color:#64748b;font-size:13px;">${data.notes}</p></div>` : ""}
        </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 350);
  }, [data, subtotal, discount, tax, total]);

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">Invoice & Billing Platform</h2>
              <Badge variant="outline" className="text-[10px] uppercase font-semibold text-blue-600 border-blue-500/30">
                PDF Ready
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Professional client billing with custom branding, discount calculations, and instant printable export.
            </p>
          </div>
        </div>

        {/* Presets and Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Select onValueChange={(v: any) => v && loadPreset(String(v))}>
            <SelectTrigger className="h-8 w-44 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-blue-500" />
              <span>Load Sample Invoice</span>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(INVOICE_PRESETS).map(([k, p]) => (
                <SelectItem key={k} value={k} className="text-xs">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" onClick={exportPDF} className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
            <Printer className="h-3.5 w-3.5" />
            Print & Export PDF
          </Button>
        </div>
      </div>

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Form Controls */}
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Invoice Parameters & Sender Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Invoice Number</Label>
                  <Input
                    value={data.invoiceNumber}
                    onChange={(e) => updateField("invoiceNumber", e.target.value)}
                    className="h-8 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Currency</Label>
                  <Select value={data.currency} onValueChange={(v) => v && updateField("currency", v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Issue Date</Label>
                  <Input
                    type="date"
                    value={data.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Due Date</Label>
                  <Input
                    type="date"
                    value={data.dueDate}
                    onChange={(e) => updateField("dueDate", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Sender Details */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-semibold">Your Business / Sender Info</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Company or Freelancer Name"
                    value={data.fromName}
                    onChange={(e) => updateField("fromName", e.target.value)}
                    className="h-8 text-xs font-medium"
                  />
                  <Input
                    placeholder="Email Address"
                    value={data.fromEmail}
                    onChange={(e) => updateField("fromEmail", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <Input
                  placeholder="Address & City"
                  value={data.fromAddress}
                  onChange={(e) => updateField("fromAddress", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Client Details */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-semibold">Bill To (Client Info)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Client Company or Individual"
                    value={data.toName}
                    onChange={(e) => updateField("toName", e.target.value)}
                    className="h-8 text-xs font-medium"
                  />
                  <Input
                    placeholder="Client Email"
                    value={data.toEmail}
                    onChange={(e) => updateField("toEmail", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <Input
                  placeholder="Client Address"
                  value={data.toAddress}
                  onChange={(e) => updateField("toAddress", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Line Items</Label>
                  <Button size="sm" variant="ghost" onClick={addItem} className="h-7 text-xs gap-1 text-blue-600">
                    <Plus className="h-3.5 w-3.5" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {data.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg border bg-card/60">
                      <Input
                        placeholder="Item description..."
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        className="h-7 text-xs flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs w-16 text-center"
                      />
                      <Input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs w-24 text-right"
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Taxes & Discounts */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="space-y-1">
                  <Label className="text-xs">Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={data.taxRate}
                    onChange={(e) => updateField("taxRate", parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Discount Rate (%)</Label>
                  <Input
                    type="number"
                    value={data.discountRate}
                    onChange={(e) => updateField("discountRate", parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Formatted Invoice Preview */}
        <div className="space-y-4">
          <Card className="border-border/60 overflow-hidden shadow-lg bg-card">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Live Document Preview
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  {COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => updateField("accentColor", col)}
                      className={`h-4 w-4 rounded-full border transition-transform ${
                        data.accentColor === col ? "scale-125 border-foreground shadow-xs" : "border-transparent"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Header preview */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: data.accentColor }}>
                    INVOICE
                  </h1>
                  <p className="text-xs font-semibold text-foreground mt-0.5">#{data.invoiceNumber}</p>
                  <p className="text-[11px] text-muted-foreground">Issued: {data.date}</p>
                  <p className="text-[11px] text-muted-foreground">Due: {data.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-foreground">{data.fromName}</p>
                  <p className="text-xs text-muted-foreground">{data.fromEmail}</p>
                  <p className="text-xs text-muted-foreground">{data.fromPhone}</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{data.fromAddress}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="p-3 rounded-lg bg-muted/30 border text-xs space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Bill To:</span>
                <p className="font-semibold text-foreground">{data.toName}</p>
                <p className="text-muted-foreground">{data.toEmail}</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{data.toAddress}</p>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b" style={{ backgroundColor: `${data.accentColor}15` }}>
                      <th className="text-left p-2.5 font-semibold">Description</th>
                      <th className="text-center p-2.5 font-semibold">Qty</th>
                      <th className="text-right p-2.5 font-semibold">Rate</th>
                      <th className="text-right p-2.5 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {data.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2.5 font-medium">{item.description || "—"}</td>
                        <td className="p-2.5 text-center">{item.quantity}</td>
                        <td className="p-2.5 text-right">{formatCurrency(item.rate, data.currency)}</td>
                        <td className="p-2.5 text-right font-semibold">
                          {formatCurrency(item.quantity * item.rate, data.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="ml-auto w-64 space-y-1.5 text-xs pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal, data.currency)}</span>
                </div>
                {data.discountRate > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({data.discountRate}%)</span>
                    <span>-{formatCurrency(discount, data.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({data.taxRate}%)</span>
                  <span className="font-medium">{formatCurrency(tax, data.currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-extrabold" style={{ color: data.accentColor }}>
                  <span>Total Due</span>
                  <span>{formatCurrency(total, data.currency)}</span>
                </div>
              </div>

              {/* Notes */}
              {data.notes && (
                <div className="p-3 rounded-lg border bg-muted/20 text-xs text-muted-foreground">
                  <strong className="block text-[10px] uppercase font-bold text-foreground">Payment Notes:</strong>
                  {data.notes}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}