export interface QuotationLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuotationData {
  quoteNumber: string;
  date: string;
  validUntil: string;
  fromName: string;
  fromCompany: string;
  fromEmail: string;
  toName: string;
  toCompany: string;
  toEmail: string;
  lineItems: QuotationLineItem[];
  taxRate: number;
  discount: number;
  notes: string;
  currency: string;
}

export function generateQuoteId(): string {
  return `QTE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function calculateLineTotal(item: QuotationLineItem): number {
  return Math.round(item.quantity * item.unitPrice * 100) / 100;
}

export function calculateSubtotal(items: QuotationLineItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + calculateLineTotal(item), 0) * 100) / 100;
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return Math.round(subtotal * (taxRate / 100) * 100) / 100;
}

export function calculateTotal(subtotal: number, tax: number, discount: number): number {
  return Math.round((subtotal + tax - discount) * 100) / 100;
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CAD", label: "CAD (C$)" },
  { value: "AUD", label: "AUD (A$)" },
  { value: "INR", label: "INR (₹)" },
];