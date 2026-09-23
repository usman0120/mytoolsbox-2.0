// Margin & Markup Calculator Engine

export interface MarginResult {
  cost: number;
  sellingPrice: number;
  grossProfit: number;
  grossMarginPercent: number;
  markup: number;
  markupPercent: number;
  profitMultiplier: number;
}

export interface PricingTier {
  marginPercent: number;
  sellingPrice: number;
  markupPercent: number;
  profit: number;
}

export function calculateMargin(cost: number, sellingPrice: number): MarginResult {
  const safeCost = Math.max(0, cost);
  const safePrice = Math.max(0, sellingPrice);

  const grossProfit = safePrice - safeCost;
  const markup = grossProfit;
  const markupPercent = safeCost > 0 ? (markup / safeCost) * 100 : 0;
  const grossMarginPercent = safePrice > 0 ? (grossProfit / safePrice) * 100 : 0;
  const profitMultiplier = safeCost > 0 ? safePrice / safeCost : 0;

  return {
    cost: round(safeCost),
    sellingPrice: round(safePrice),
    grossProfit: round(grossProfit),
    grossMarginPercent: round(grossMarginPercent),
    markup: round(markup),
    markupPercent: round(markupPercent),
    profitMultiplier: round(profitMultiplier),
  };
}

export function calculateSellingPriceFromMargin(cost: number, targetMarginPercent: number): MarginResult {
  const safeCost = Math.max(0, cost);
  const marginFrac = Math.min(0.9999, Math.max(0, targetMarginPercent / 100));
  const sellingPrice = marginFrac < 1 ? safeCost / (1 - marginFrac) : safeCost;

  return calculateMargin(safeCost, sellingPrice);
}

export function calculateSellingPriceFromMarkup(cost: number, targetMarkupPercent: number): MarginResult {
  const safeCost = Math.max(0, cost);
  const markupFrac = Math.max(0, targetMarkupPercent / 100);
  const sellingPrice = safeCost * (1 + markupFrac);

  return calculateMargin(safeCost, sellingPrice);
}

export function calculateCostFromPrice(sellingPrice: number, marginPercent: number): MarginResult {
  const safePrice = Math.max(0, sellingPrice);
  const marginFrac = Math.min(1, Math.max(0, marginPercent / 100));
  const allowableCost = safePrice * (1 - marginFrac);

  return calculateMargin(allowableCost, safePrice);
}

export function generatePricingTiers(cost: number, margins: number[] = [10, 20, 30, 40, 50, 60, 70]): PricingTier[] {
  return margins.map(margin => {
    const res = calculateSellingPriceFromMargin(cost, margin);
    return {
      marginPercent: margin,
      sellingPrice: res.sellingPrice,
      markupPercent: res.markupPercent,
      profit: res.grossProfit,
    };
  });
}

// Backward compatibility alias
export function calculateSellingPrice(cost: number, targetMarginPercent: number): number {
  return calculateSellingPriceFromMargin(cost, targetMarginPercent).sellingPrice;
}

function round(val: number): number {
  return Math.round(val * 100) / 100;
}