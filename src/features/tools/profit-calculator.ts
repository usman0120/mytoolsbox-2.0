export interface ProfitResult {
  revenue: number;
  costs: number;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  breakEven: number;
}

export function calculateProfit(
  revenue: number,
  fixedCosts: number,
  variableCosts: number,
  taxRate: number = 0
): ProfitResult {
  const totalCosts = fixedCosts + variableCosts;
  const grossProfit = revenue - totalCosts;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const taxAmount = grossProfit > 0 ? grossProfit * (taxRate / 100) : 0;
  const netProfit = grossProfit - taxAmount;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const breakEven = revenue > 0 ? totalCosts : 0;

  return {
    revenue: Math.round(revenue * 100) / 100,
    costs: Math.round(totalCosts * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    grossMargin: Math.round(grossMargin * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    netMargin: Math.round(netMargin * 100) / 100,
    breakEven: Math.round(breakEven * 100) / 100,
  };
}