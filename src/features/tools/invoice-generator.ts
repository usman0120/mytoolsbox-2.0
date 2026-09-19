export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  toName: string;
  toEmail: string;
  toAddress: string;
  lineItems: InvoiceLineItem[];
  taxRate: number;
  discount: number;
  notes: string;
  currency: string;
}

export function generateInvoiceId(): string {
  return `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function calculateLineTotal(item: InvoiceLineItem): number {
  return Math.round(item.quantity * item.unitPrice * 100) / 100;
}

export function calculateSubtotal(items: InvoiceLineItem[]): number {
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
  { value: "JPY", label: "JPY (¥)" },
  { value: "CNY", label: "CNY (¥)" },
];