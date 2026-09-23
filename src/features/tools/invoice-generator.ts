export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type DiscountType = "percentage" | "fixed";

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
  taxRate: number; // percentage, e.g. 10 for 10%
  discount: number;
  discountType?: DiscountType;
  shipping?: number;
  notes: string;
  currency: string;
  paymentTerms?: string;
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

export function calculateDiscountAmount(subtotal: number, discount: number, type: DiscountType = "fixed"): number {
  if (discount <= 0 || subtotal <= 0) return 0;
  if (type === "percentage") {
    return Math.round((subtotal * (discount / 100)) * 100) / 100;
  }
  return Math.min(subtotal, Math.round(discount * 100) / 100);
}

export function calculateTax(taxableAmount: number, taxRate: number): number {
  if (taxRate <= 0 || taxableAmount <= 0) return 0;
  return Math.round(taxableAmount * (taxRate / 100) * 100) / 100;
}

export function calculateTotal(
  subtotal: number,
  tax: number,
  discount: number,
  shipping: number = 0
): number {
  const finalTotal = subtotal - discount + tax + shipping;
  return Math.max(0, Math.round(finalTotal * 100) / 100);
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
];

export function exportInvoiceCSV(data: InvoiceData): string {
  const subtotal = calculateSubtotal(data.lineItems);
  const discountAmount = calculateDiscountAmount(subtotal, data.discount, data.discountType);
  const tax = calculateTax(subtotal - discountAmount, data.taxRate);
  const total = calculateTotal(subtotal, tax, discountAmount, data.shipping || 0);

  const lines = [
    `"Invoice Number","${data.invoiceNumber}"`,
    `"Date","${data.date}"`,
    `"Due Date","${data.dueDate}"`,
    `"From","${data.fromName} (${data.fromEmail}) - ${data.fromAddress.replace(/\n/g, ' ')}"`,
    `"To","${data.toName} (${data.toEmail}) - ${data.toAddress.replace(/\n/g, ' ')}"`,
    `"Currency","${data.currency}"`,
    "",
    `"Item Description","Quantity","Unit Price","Total"`,
    ...data.lineItems.map(
      (item) =>
        `"${item.description.replace(/"/g, '""')}","${item.quantity}","${item.unitPrice}","${calculateLineTotal(item)}"`
    ),
    "",
    `"Subtotal","${subtotal}"`,
    `"Discount","${discountAmount}"`,
    `"Tax (${data.taxRate}%)","${tax}"`,
    `"Shipping","${data.shipping || 0}"`,
    `"Grand Total","${total}"`,
  ];
  return lines.join("\n");
}