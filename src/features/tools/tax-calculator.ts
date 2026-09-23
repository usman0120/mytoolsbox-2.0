// Tax Calculator Engine supporting multiple filing statuses, FICA, State Tax, and Bracket Breakdown

export type FilingStatus = "single" | "married_joint" | "married_separate" | "head_of_household";

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface BracketDetail {
  rate: number;
  bracketMin: number;
  bracketMax: number | null;
  taxableInBracket: number;
  taxAmount: number;
}

export interface TaxResult {
  grossIncome: number;
  filingStatus: FilingStatus;
  standardDeduction: number;
  itemizedDeductions: number;
  totalDeductions: number;
  taxableIncome: number;
  federalTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  ficaTotal: number;
  stateTax: number;
  totalTax: number;
  effectiveFederalRate: number;
  effectiveTotalRate: number;
  marginalRate: number;
  takeHomeAnnual: number;
  takeHomeMonthly: number;
  takeHomeBiweekly: number;
  bracketBreakdown: BracketDetail[];
}

// 2024/2025 Standard Deductions
export const STANDARD_DEDUCTIONS_2024: Record<FilingStatus, number> = {
  single: 14600,
  married_joint: 29200,
  married_separate: 14600,
  head_of_household: 21900,
};

// Federal Tax Brackets by Filing Status
export const FEDERAL_TAX_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 11600, rate: 10 },
    { min: 11600, max: 47150, rate: 12 },
    { min: 47150, max: 100525, rate: 22 },
    { min: 100525, max: 191950, rate: 24 },
    { min: 191950, max: 243725, rate: 32 },
    { min: 243725, max: 609350, rate: 35 },
    { min: 609350, max: null, rate: 37 },
  ],
  married_joint: [
    { min: 0, max: 23200, rate: 10 },
    { min: 23200, max: 94300, rate: 12 },
    { min: 94300, max: 201050, rate: 22 },
    { min: 201050, max: 383900, rate: 24 },
    { min: 383900, max: 487450, rate: 32 },
    { min: 487450, max: 731200, rate: 35 },
    { min: 731200, max: null, rate: 37 },
  ],
  married_separate: [
    { min: 0, max: 11600, rate: 10 },
    { min: 11600, max: 47150, rate: 12 },
    { min: 47150, max: 100525, rate: 22 },
    { min: 100525, max: 191950, rate: 24 },
    { min: 191950, max: 243725, rate: 32 },
    { min: 243725, max: 365600, rate: 35 },
    { min: 365600, max: null, rate: 37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 10 },
    { min: 16550, max: 63100, rate: 12 },
    { min: 63100, max: 100500, rate: 22 },
    { min: 100500, max: 191950, rate: 24 },
    { min: 191950, max: 243700, rate: 32 },
    { min: 243700, max: 609350, rate: 35 },
    { min: 609350, max: null, rate: 37 },
  ],
};

// Backward-compatibility export
export const US_TAX_BRACKETS_2024 = FEDERAL_TAX_BRACKETS.single;

export interface TaxInput {
  grossIncome: number;
  filingStatus?: FilingStatus;
  useStandardDeduction?: boolean;
  customDeductions?: number;
  stateTaxRate?: number;
  includeFica?: boolean;
}

export function calculateTax(
  grossIncomeOrInput: number | TaxInput,
  customDeductionsOrUndefined?: number,
  bracketsOrUndefined?: TaxBracket[]
): TaxResult {
  let grossIncome: number;
  let filingStatus: FilingStatus = "single";
  let useStandardDeduction = true;
  let customDeductions = 0;
  let stateTaxRate = 0;
  let includeFica = true;

  if (typeof grossIncomeOrInput === "number") {
    grossIncome = Math.max(0, grossIncomeOrInput);
    customDeductions = customDeductionsOrUndefined || 0;
    useStandardDeduction = customDeductions === 0;
  } else {
    grossIncome = Math.max(0, grossIncomeOrInput.grossIncome || 0);
    filingStatus = grossIncomeOrInput.filingStatus || "single";
    useStandardDeduction = grossIncomeOrInput.useStandardDeduction ?? true;
    customDeductions = grossIncomeOrInput.customDeductions || 0;
    stateTaxRate = grossIncomeOrInput.stateTaxRate || 0;
    includeFica = grossIncomeOrInput.includeFica ?? true;
  }

  const standardDeduction = STANDARD_DEDUCTIONS_2024[filingStatus];
  const totalDeductions = useStandardDeduction ? standardDeduction : customDeductions;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  const brackets = bracketsOrUndefined || FEDERAL_TAX_BRACKETS[filingStatus];
  let federalTax = 0;
  let marginalRate = 0;
  const bracketBreakdown: BracketDetail[] = [];

  for (const b of brackets) {
    if (taxableIncome <= b.min) break;
    const bMax = b.max ?? Infinity;
    const taxableInBracket = Math.min(taxableIncome, bMax) - b.min;
    const taxAmount = (taxableInBracket * b.rate) / 100;
    federalTax += taxAmount;
    marginalRate = b.rate;
    bracketBreakdown.push({
      rate: b.rate,
      bracketMin: b.min,
      bracketMax: b.max,
      taxableInBracket: round(taxableInBracket),
      taxAmount: round(taxAmount),
    });
  }

  // FICA calculation (Social Security cap 2024 = $168,600 at 6.2%, Medicare = 1.45% + 0.9% additional over threshold)
  let socialSecurityTax = 0;
  let medicareTax = 0;
  if (includeFica) {
    socialSecurityTax = Math.min(grossIncome, 168600) * 0.062;
    const medThreshold = filingStatus === "married_joint" ? 250000 : 200000;
    const baseMedicare = grossIncome * 0.0145;
    const extraMedicare = grossIncome > medThreshold ? (grossIncome - medThreshold) * 0.009 : 0;
    medicareTax = baseMedicare + extraMedicare;
  }
  const ficaTotal = socialSecurityTax + medicareTax;

  // State Tax
  const stateTax = grossIncome * (Math.max(0, stateTaxRate) / 100);

  const totalTax = federalTax + ficaTotal + stateTax;
  const effectiveFederalRate = grossIncome > 0 ? (federalTax / grossIncome) * 100 : 0;
  const effectiveTotalRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;
  const takeHomeAnnual = Math.max(0, grossIncome - totalTax);

  return {
    grossIncome: round(grossIncome),
    filingStatus,
    standardDeduction: round(standardDeduction),
    itemizedDeductions: round(customDeductions),
    totalDeductions: round(totalDeductions),
    taxableIncome: round(taxableIncome),
    federalTax: round(federalTax),
    socialSecurityTax: round(socialSecurityTax),
    medicareTax: round(medicareTax),
    ficaTotal: round(ficaTotal),
    stateTax: round(stateTax),
    totalTax: round(totalTax),
    effectiveFederalRate: round(effectiveFederalRate),
    effectiveTotalRate: round(effectiveTotalRate),
    marginalRate,
    takeHomeAnnual: round(takeHomeAnnual),
    takeHomeMonthly: round(takeHomeAnnual / 12),
    takeHomeBiweekly: round(takeHomeAnnual / 26),
    bracketBreakdown,
  };
}

function round(val: number): number {
  return Math.round(val * 100) / 100;
}