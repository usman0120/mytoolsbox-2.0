export interface MarginResult {
  cost: number;
  sellingPrice: number;
  markup: number;
  markupPercent: number;
  grossProfit: number;
  grossMarginPercent: number;
}

export function calculateMargin(cost: number, sellingPrice: number): MarginResult {
  const grossProfit = sellingPrice - cost;
  const markup = grossProfit;
  const markupPercent = cost > 0 ? (markup / cost) * 100 : 0;
  const grossMarginPercent = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;

  return {
    cost: Math.round(cost * 100) / 100,
    sellingPrice: Math.round(sellingPrice * 100) / 100,
    markup: Math.round(markup * 100) / 100,
    markupPercent: Math.round(markupPercent * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    grossMarginPercent: Math.round(grossMarginPercent * 100) / 100,
  };
}

export function calculateSellingPrice(cost: number, targetMarginPercent: number): number {
  if (targetMarginPercent >= 100) return cost;
  return Math.round((cost / (1 - targetMarginPercent / 100)) * 100) / 100;
}

export function calculateCostFromPrice(sellingPrice: number, marginPercent: number): number {
  return Math.round((sellingPrice * (1 - marginPercent / 100)) * 100) / 100;
}