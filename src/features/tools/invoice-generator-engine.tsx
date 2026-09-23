"use client";

import { useState } from "react";
import { FileText, Plus, Trash2, Download, Printer, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  InvoiceLineItem,
  DiscountType,
  InvoiceData,
  generateInvoiceId,
  calculateLineTotal,
  calculateSubtotal,
  calculateDiscountAmount,
  calculateTax,
  calculateTotal,
  formatCurrency,
  CURRENCIES,
  exportInvoiceCSV,
} from "@/features/tools/invoice-generator";

export function InvoiceGeneratorEngine() {
  const [invoiceNumber] = useState(generateInvoiceId());
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toName, setToName] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: "1", description: "Standard Consultation", quantity: 1, unitPrice: 150 },
  ]);
  const [taxRate, setTaxRate] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [discountType, setDiscountType] = useState<DiscountType>("fixed");
  const [shipping, setShipping] = useState("0");
  const [notes, setNotes] = useState("Payment is due within 14 days of invoice date. Thank you for your business!");
  const [currency, setCurrency] = useState("USD");
  const [viewTab, setViewTab] = useState<"edit" | "preview">("edit");

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: field === "description" ? value : Number(value) || 0 } : item
      )
    );
  };

  const subtotal = calculateSubtotal(lineItems);
  const discountAmount = calculateDiscountAmount(subtotal, parseFloat(discount) || 0, discountType);
  const tax = calculateTax(subtotal - discountAmount, parseFloat(taxRate) || 0);
  const total = calculateTotal(subtotal, tax, discountAmount, parseFloat(shipping) || 0);

  const getInvoiceData = (): InvoiceData => ({
    invoiceNumber,
    date,
    dueDate,
    fromName: fromName || "Your Business Name",
    fromEmail: fromEmail || "billing@example.com",
    fromAddress: fromAddress || "123 Business Way, City",
    toName: toName || "Client / Company Name",
    toEmail: toEmail || "client@example.com",
    toAddress: toAddress || "456 Client St, Town",
    lineItems,
    taxRate: parseFloat(taxRate) || 0,
    discount: parseFloat(discount) || 0,
    discountType,
    shipping: parseFloat(shipping) || 0,
    notes,
    currency,
  });

  const handleDownloadCSV = () => {
    const csv = exportInvoiceCSV(getInvoiceData());
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoiceNumber}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice CSV downloaded!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Invoice Generator
          </h2>
          <p className="text-sm text-muted-foreground">Create and print itemized commercial invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
          </Button>
          <Button variant="default" size="sm" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print / PDF
          </Button>
        </div>
      </div>

      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as "edit" | "preview")}>
        <TabsList>
          <TabsTrigger value="edit" className="gap-1.5 text-xs">
            <Edit3 className="h-3.5 w-3.5" /> Invoice Builder
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5 text-xs">
            <Eye className="h-3.5 w-3.5" /> Document Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Invoice #</Label>
              <Input value={invoiceNumber} readOnly className="font-mono text-xs bg-muted" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Issue Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v || "USD")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground uppercase">From (Provider)</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Input placeholder="Your Business / Full Name" value={fromName} onChange={(e) => setFromName(e.target.value)} className="text-xs" />
                <Input placeholder="billing@yourdomain.com" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} className="text-xs" />
                <Textarea placeholder="Address, City, Tax ID / VAT #" rows={2} value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} className="text-xs" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground uppercase">To (Client)</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Input placeholder="Client Name or Company" value={toName} onChange={(e) => setToName(e.target.value)} className="text-xs" />
                <Input placeholder="client@company.com" value={toEmail} onChange={(e) => setToEmail(e.target.value)} className="text-xs" />
                <Textarea placeholder="Client Billing Address" rows={2} value={toAddress} onChange={(e) => setToAddress(e.target.value)} className="text-xs" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs text-muted-foreground uppercase">Line Items</CardTitle>
              <Button variant="ghost" size="sm" onClick={addLineItem} className="text-xs h-7 gap-1">
                <Plus className="h-3 w-3" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {lineItems.map((item) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <Input
                    placeholder="Description of item or service"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                    className="flex-1 text-xs"
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, "quantity", e.target.value)}
                    className="w-20 text-xs"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Unit Price"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(item.id, "unitPrice", e.target.value)}
                    className="w-28 text-xs"
                  />
                  <span className="w-24 text-right text-xs font-mono font-medium">
                    {formatCurrency(calculateLineTotal(item), currency)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(item.id)}
                    disabled={lineItems.length <= 1}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Notes & Payment Details</Label>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="text-xs" />
            </div>

            <Card>
              <CardContent className="pt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Discount</span>
                    <button
                      type="button"
                      onClick={() => setDiscountType(discountType === "fixed" ? "percentage" : "fixed")}
                      className="text-[10px] underline text-primary"
                    >
                      ({discountType === "fixed" ? currency : "%"})
                    </button>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="h-6 w-20 text-xs text-right font-mono"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Tax Rate (%)</span>
                  <Input
                    type="number"
                    min="0"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="h-6 w-20 text-xs text-right font-mono"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Shipping</span>
                  <Input
                    type="number"
                    min="0"
                    value={shipping}
                    onChange={(e) => setShipping(e.target.value)}
                    className="h-6 w-20 text-xs text-right font-mono"
                  />
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold pt-1">
                  <span>Grand Total</span>
                  <span className="font-mono text-primary">{formatCurrency(total, currency)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card className="max-w-3xl mx-auto p-6 bg-white dark:bg-card text-foreground shadow-sm border print:border-none print:shadow-none">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h1 className="text-2xl font-black text-primary uppercase tracking-tight">INVOICE</h1>
                  <p className="text-xs text-muted-foreground font-mono mt-1">#{invoiceNumber}</p>
                </div>
                <div className="text-right text-xs">
                  <p><strong className="text-foreground">Date:</strong> {date}</p>
                  <p><strong className="text-foreground">Due Date:</strong> {dueDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <p className="font-bold text-muted-foreground uppercase text-[10px] mb-1">From</p>
                  <p className="font-semibold text-sm">{fromName || "Your Company"}</p>
                  <p className="text-muted-foreground">{fromEmail}</p>
                  <p className="whitespace-pre-line text-muted-foreground mt-1">{fromAddress}</p>
                </div>
                <div>
                  <p className="font-bold text-muted-foreground uppercase text-[10px] mb-1">Billed To</p>
                  <p className="font-semibold text-sm">{toName || "Client Name"}</p>
                  <p className="text-muted-foreground">{toEmail}</p>
                  <p className="whitespace-pre-line text-muted-foreground mt-1">{toAddress}</p>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Price</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3">{item.description || "Untitled Item"}</td>
                        <td className="py-2 px-3 text-right font-mono">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono">{formatCurrency(item.unitPrice, currency)}</td>
                        <td className="py-2 px-3 text-right font-mono font-medium">
                          {formatCurrency(calculateLineTotal(item), currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-mono">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discountType === "percentage" ? `${discount}%` : "Fixed"}):</span>
                      <span className="font-mono">-{formatCurrency(discountAmount, currency)}</span>
                    </div>
                  )}
                  {parseFloat(taxRate) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                      <span className="font-mono">+{formatCurrency(tax, currency)}</span>
                    </div>
                  )}
                  {parseFloat(shipping) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span className="font-mono">+{formatCurrency(parseFloat(shipping) || 0, currency)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base font-bold pt-1">
                    <span>Total:</span>
                    <span className="font-mono text-primary">{formatCurrency(total, currency)}</span>
                  </div>
                </div>
              </div>

              {notes && (
                <div className="border-t pt-4 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Notes & Terms:</p>
                  <p className="whitespace-pre-line">{notes}</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}