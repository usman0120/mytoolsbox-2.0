// Profit Calculator & P&L Statement Engine

export interface ProfitResult {
  currency: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  operatingProfit: number; // EBITDA
  operatingMargin: number;
  interestExpense: number;
  preTaxProfit: number; // EBT
  taxRate: number;
  taxAmount: number;
  netProfit: number;
  netMargin: number;
  breakEvenRevenue: number;
  expenseRatio: number;
}

export interface ProfitInput {
  currency?: string;
  revenue: number;
  cogs?: number;
  salaries?: number;
  marketing?: number;
  rentUtilities?: number;
  otherOpex?: number;
  interestExpense?: number;
  taxRate?: number;
}

export function calculateProfit(
  revenueOrInput: number | ProfitInput,
  fixedCostsOrUndefined?: number,
  variableCostsOrUndefined?: number,
  taxRateOrUndefined?: number
): ProfitResult {
  // Backward compatibility with previous signature: calculateProfit(revenue, fixedCosts, variableCosts, taxRate)
  let input: ProfitInput;
  if (typeof revenueOrInput === "number") {
    const fixed = fixedCostsOrUndefined || 0;
    const variable = variableCostsOrUndefined || 0;
    input = {
      currency: "$",
      revenue: revenueOrInput,
      cogs: variable,
      otherOpex: fixed,
      taxRate: taxRateOrUndefined || 0,
    };
  } else {
    input = revenueOrInput;
  }

  const currency = input.currency || "$";
  const revenue = Math.max(0, input.revenue || 0);
  const cogs = Math.max(0, input.cogs || 0);

  // Gross Profit
  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  // Operating Expenses (OpEx)
  const salaries = Math.max(0, input.salaries || 0);
  const marketing = Math.max(0, input.marketing || 0);
  const rentUtilities = Math.max(0, input.rentUtilities || 0);
  const otherOpex = Math.max(0, input.otherOpex || 0);
  const operatingExpenses = salaries + marketing + rentUtilities + otherOpex;

  // Operating Profit (EBITDA/EBIT)
  const operatingProfit = grossProfit - operatingExpenses;
  const operatingMargin = revenue > 0 ? (operatingProfit / revenue) * 100 : 0;

  // Interest
  const interestExpense = Math.max(0, input.interestExpense || 0);
  const preTaxProfit = operatingProfit - interestExpense;

  // Tax
  const taxRate = Math.max(0, Math.min(100, input.taxRate || 0));
  const taxAmount = preTaxProfit > 0 ? (preTaxProfit * taxRate) / 100 : 0;

  // Net Profit
  const netProfit = preTaxProfit - taxAmount;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  // Total Costs & Break-even
  const totalCosts = cogs + operatingExpenses + interestExpense;
  const breakEvenRevenue = grossMargin > 0 ? operatingExpenses / (grossMargin / 100) : 0;
  const expenseRatio = revenue > 0 ? (totalCosts / revenue) * 100 : 0;

  return {
    currency,
    revenue: round(revenue),
    cogs: round(cogs),
    grossProfit: round(grossProfit),
    grossMargin: round(grossMargin),
    operatingExpenses: round(operatingExpenses),
    operatingProfit: round(operatingProfit),
    operatingMargin: round(operatingMargin),
    interestExpense: round(interestExpense),
    preTaxProfit: round(preTaxProfit),
    taxRate: round(taxRate),
    taxAmount: round(taxAmount),
    netProfit: round(netProfit),
    netMargin: round(netMargin),
    breakEvenRevenue: round(breakEvenRevenue),
    expenseRatio: round(expenseRatio),
  };
}

function round(val: number): number {
  return Math.round(val * 100) / 100;
}