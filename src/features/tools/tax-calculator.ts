export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface TaxResult {
  grossIncome: number;
  deductions: number;
  taxableIncome: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  netIncome: number;
  bracketBreakdown: { bracket: TaxBracket; taxInBracket: number }[];
}

// 2024 US Federal Tax Brackets (Single Filer) - simplified
export const US_TAX_BRACKETS_2024: TaxBracket[] = [
  { min: 0, max: 11600, rate: 10 },
  { min: 11601, max: 47150, rate: 12 },
  { min: 47151, max: 100525, rate: 22 },
  { min: 100526, max: 191950, rate: 24 },
  { min: 191951, max: 243725, rate: 32 },
  { min: 243726, max: 609350, rate: 35 },
  { min: 609351, max: null, rate: 37 },
];

export function calculateTax(
  grossIncome: number,
  deductions: number = 0,
  brackets: TaxBracket[] = US_TAX_BRACKETS_2024
): TaxResult {
  const taxableIncome = Math.max(0, grossIncome - deductions);
  let totalTax = 0;
  const bracketBreakdown: { bracket: TaxBracket; taxInBracket: number }[] = [];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const bracketMax = bracket.max ?? Infinity;
    const incomeInBracket = Math.min(taxableIncome, bracketMax) - bracket.min;
    const taxInBracket = (incomeInBracket * bracket.rate) / 100;
    totalTax += taxInBracket;
    bracketBreakdown.push({ bracket, taxInBracket: Math.round(taxInBracket * 100) / 100 });
  }

  const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;
  const marginalRate = bracketBreakdown.length > 0 ? bracketBreakdown[bracketBreakdown.length - 1].bracket.rate : 0;

  return {
    grossIncome: Math.round(grossIncome * 100) / 100,
    deductions: Math.round(deductions * 100) / 100,
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    marginalRate,
    netIncome: Math.round((grossIncome - totalTax) * 100) / 100,
    bracketBreakdown,
  };
}