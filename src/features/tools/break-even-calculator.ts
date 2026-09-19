export interface BreakEvenResult {
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  unitsForTargetProfit: number;
}

export function calculateBreakEven(
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number,
  targetProfit: number = 0
): BreakEvenResult {
  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
  const contributionMarginRatio = sellingPricePerUnit > 0
    ? (contributionMargin / sellingPricePerUnit) * 100
    : 0;
  const breakEvenUnits = contributionMargin > 0
    ? Math.ceil(fixedCosts / contributionMargin)
    : Infinity;
  const breakEvenRevenue = breakEvenUnits === Infinity ? Infinity
    : Math.round(breakEvenUnits * sellingPricePerUnit * 100) / 100;
  const unitsForTargetProfit = contributionMargin > 0
    ? Math.ceil((fixedCosts + targetProfit) / contributionMargin)
    : Infinity;

  return {
    fixedCosts: Math.round(fixedCosts * 100) / 100,
    variableCostPerUnit: Math.round(variableCostPerUnit * 100) / 100,
    sellingPricePerUnit: Math.round(sellingPricePerUnit * 100) / 100,
    breakEvenUnits,
    breakEvenRevenue,
    contributionMargin: Math.round(contributionMargin * 100) / 100,
    contributionMarginRatio: Math.round(contributionMarginRatio * 100) / 100,
    unitsForTargetProfit,
  };
}