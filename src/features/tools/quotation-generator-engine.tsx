"use client";

import { useState } from "react";
import { FileText, Plus, Trash2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  QuotationLineItem,
  generateQuoteId,
  calculateLineTotal,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  formatCurrency,
  CURRENCIES,
} from "@/features/tools/quotation-generator";

export function QuotationGeneratorEngine() {
  const [quoteNumber] = useState(generateQuoteId());
  const [date] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromCompany, setFromCompany] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [toName, setToName] = useState("");
  const [toCompany, setToCompany] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [taxRate, setTaxRate] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("USD");

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof QuotationLineItem, value: string | number) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, [field]: field === "description" ? value : Number(value) || 0 } : item
    ));
  };

  const subtotal = calculateSubtotal(lineItems);
  const tax = calculateTax(subtotal, parseFloat(taxRate) || 0);
  const total = calculateTotal(subtotal, tax, parseFloat(discount) || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quotation #{quoteNumber}</h2>
          <p className="text-sm text-muted-foreground">Create a professional quotation</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1" /> Print
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">From</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="Your name" value={fromName} onChange={e => setFromName(e.target.value)} />
            <Input placeholder="Company name" value={fromCompany} onChange={e => setFromCompany(e.target.value)} />
            <Input placeholder="Email" type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">To</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="Client name" value={toName} onChange={e => setToName(e.target.value)} />
            <Input placeholder="Company name" value={toCompany} onChange={e => setToCompany(e.target.value)} />
            <Input placeholder="Email" type="email" value={toEmail} onChange={e => setToEmail(e.target.value)} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Date</Label>
          <Input type="date" value={date} disabled />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Valid Until</Label>
          <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Currency</Label>
          <Select value={currency} onValueChange={(v) => setCurrency(v || "USD")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Items</CardTitle>
          <Button variant="outline" size="sm" onClick={addLineItem}><Plus className="h-3 w-3 mr-1" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground pb-1">
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-1"></div>
          </div>
          {lineItems.map(item => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <Input className="col-span-5 h-8 text-sm" placeholder="Item description" value={item.description} onChange={e => updateLineItem(item.id, "description", e.target.value)} />
              <Input className="col-span-2 h-8 text-sm" type="number" min="1" value={item.quantity || ""} onChange={e => updateLineItem(item.id, "quantity", e.target.value)} />
              <Input className="col-span-2 h-8 text-sm" type="number" min="0" step="0.01" value={item.unitPrice || ""} onChange={e => updateLineItem(item.id, "unitPrice", e.target.value)} />
              <div className="col-span-2 text-sm font-medium">{formatCurrency(calculateLineTotal(item), currency)}</div>
              <Button variant="ghost" size="icon" className="col-span-1 h-8 w-8" onClick={() => removeLineItem(item.id)} disabled={lineItems.length <= 1}>
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-xs mb-1 block">Notes / Terms</Label>
          <Textarea placeholder="Additional terms, validity period..." rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax (%)</span>
              <Input className="w-20 h-7 text-sm text-right" type="number" min="0" step="0.1" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax Amount</span>
              <span>{formatCurrency(tax, currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <Input className="w-20 h-7 text-sm text-right" type="number" min="0" step="0.01" value={discount} onChange={e => setDiscount(e.target.value)} />
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}