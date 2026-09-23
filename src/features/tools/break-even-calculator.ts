// Break-Even Analysis Engine

export interface BreakEvenResult {
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  targetProfit: number;
  unitsForTargetProfit: number;
  revenueForTargetProfit: number;
  projectedUnits: number;
  marginOfSafetyUnits: number;
  marginOfSafetyRevenue: number;
  marginOfSafetyPercent: number;
  volumeSensitivity: {
    units: number;
    revenue: number;
    variableCost: number;
    fixedCost: number;
    totalCost: number;
    profit: number;
  }[];
}

export interface BreakEvenInput {
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  targetProfit?: number;
  projectedUnits?: number;
}

export function calculateBreakEven(
  fixedCostsOrInput: number | BreakEvenInput,
  variableCostPerUnitOrUndefined?: number,
  sellingPricePerUnitOrUndefined?: number,
  targetProfitOrUndefined?: number
): BreakEvenResult {
  let fixedCosts: number;
  let variableCostPerUnit: number;
  let sellingPricePerUnit: number;
  let targetProfit = 0;
  let projectedUnits = 0;

  // Backward compatibility with calculateBreakEven(fixedCosts, variableCostPerUnit, sellingPricePerUnit, targetProfit)
  if (typeof fixedCostsOrInput === "number") {
    fixedCosts = Math.max(0, fixedCostsOrInput);
    variableCostPerUnit = Math.max(0, variableCostPerUnitOrUndefined || 0);
    sellingPricePerUnit = Math.max(0, sellingPricePerUnitOrUndefined || 0);
    targetProfit = Math.max(0, targetProfitOrUndefined || 0);
  } else {
    fixedCosts = Math.max(0, fixedCostsOrInput.fixedCosts || 0);
    variableCostPerUnit = Math.max(0, fixedCostsOrInput.variableCostPerUnit || 0);
    sellingPricePerUnit = Math.max(0, fixedCostsOrInput.sellingPricePerUnit || 0);
    targetProfit = Math.max(0, fixedCostsOrInput.targetProfit || 0);
    projectedUnits = Math.max(0, fixedCostsOrInput.projectedUnits || 0);
  }

  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
  const contributionMarginRatio = sellingPricePerUnit > 0
    ? (contributionMargin / sellingPricePerUnit) * 100
    : 0;

  const breakEvenUnits = contributionMargin > 0
    ? Math.ceil(fixedCosts / contributionMargin)
    : Infinity;

  const breakEvenRevenue = breakEvenUnits === Infinity
    ? Infinity
    : round(breakEvenUnits * sellingPricePerUnit);

  const unitsForTargetProfit = contributionMargin > 0
    ? Math.ceil((fixedCosts + targetProfit) / contributionMargin)
    : Infinity;

  const revenueForTargetProfit = unitsForTargetProfit === Infinity
    ? Infinity
    : round(unitsForTargetProfit * sellingPricePerUnit);

  // Margin of Safety calculation based on projected sales units
  const marginOfSafetyUnits = projectedUnits > 0 && breakEvenUnits !== Infinity
    ? Math.max(0, projectedUnits - breakEvenUnits)
    : 0;

  const marginOfSafetyRevenue = round(marginOfSafetyUnits * sellingPricePerUnit);
  const marginOfSafetyPercent = projectedUnits > 0
    ? round(((projectedUnits - (breakEvenUnits === Infinity ? 0 : breakEvenUnits)) / projectedUnits) * 100)
    : 0;

  // Sensitivity analysis table across multiple volume points
  const baseUnits = breakEvenUnits !== Infinity && breakEvenUnits > 0 ? breakEvenUnits : 1000;
  const volumeMultipliers = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const volumeSensitivity = volumeMultipliers.map(mult => {
    const units = Math.round(baseUnits * mult);
    const revenue = round(units * sellingPricePerUnit);
    const variableCost = round(units * variableCostPerUnit);
    const totalCost = round(fixedCosts + variableCost);
    const profit = round(revenue - totalCost);
    return {
      units,
      revenue,
      variableCost,
      fixedCost: fixedCosts,
      totalCost,
      profit,
    };
  });

  return {
    fixedCosts: round(fixedCosts),
    variableCostPerUnit: round(variableCostPerUnit),
    sellingPricePerUnit: round(sellingPricePerUnit),
    contributionMargin: round(contributionMargin),
    contributionMarginRatio: round(contributionMarginRatio),
    breakEvenUnits,
    breakEvenRevenue,
    targetProfit: round(targetProfit),
    unitsForTargetProfit,
    revenueForTargetProfit,
    projectedUnits,
    marginOfSafetyUnits,
    marginOfSafetyRevenue,
    marginOfSafetyPercent,
    volumeSensitivity,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}