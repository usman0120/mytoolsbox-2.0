export interface QuotationLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type DiscountType = "percentage" | "fixed";

export interface QuotationData {
  quoteNumber: string;
  revision?: number;
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
  discountType?: DiscountType;
  notes: string;
  terms?: string;
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

export function calculateTotal(subtotal: number, tax: number, discount: number): number {
  const finalTotal = subtotal - discount + tax;
  return Math.max(0, Math.round(finalTotal * 100) / 100);
}

export function isQuoteExpired(validUntilDateStr: string): boolean {
  if (!validUntilDateStr) return false;
  const expiry = new Date(validUntilDateStr);
  const now = new Date();
  expiry.setHours(23, 59, 59, 999);
  return now > expiry;
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

export function exportQuotationCSV(data: QuotationData): string {
  const subtotal = calculateSubtotal(data.lineItems);
  const discountAmount = calculateDiscountAmount(subtotal, data.discount, data.discountType);
  const tax = calculateTax(subtotal - discountAmount, data.taxRate);
  const total = calculateTotal(subtotal, tax, discountAmount);

  const lines = [
    `"Quote Number","${data.quoteNumber}"`,
    `"Date","${data.date}"`,
    `"Valid Until","${data.validUntil}"`,
    `"From","${data.fromName} (${data.fromCompany}) - ${data.fromEmail}"`,
    `"To","${data.toName} (${data.toCompany}) - ${data.toEmail}"`,
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
    `"Grand Total","${total}"`,
  ];
  return lines.join("\n");
}