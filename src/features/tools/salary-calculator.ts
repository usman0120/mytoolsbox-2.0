export interface SalaryResult {
  grossAnnual: number;
  grossMonthly: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  totalDeductions: number;
  netAnnual: number;
  netMonthly: number;
  netBiweekly: number;
  netWeekly: number;
}

export function calculateSalary(
  grossAnnual: number,
  stateTaxRate: number = 5,
  federalTaxRate: number = 22,
  otherDeductions: number = 0
): SalaryResult {
  const grossMonthly = grossAnnual / 12;
  const socialSecurity = Math.min(grossAnnual * 0.062, 168600 * 0.062);
  const medicare = grossAnnual * 0.0145;
  const federalTax = grossAnnual * (federalTaxRate / 100);
  const stateTax = grossAnnual * (stateTaxRate / 100);
  const totalDeductions = federalTax + stateTax + socialSecurity + medicare + otherDeductions;
  const netAnnual = grossAnnual - totalDeductions;

  return {
    grossAnnual: Math.round(grossAnnual * 100) / 100,
    grossMonthly: Math.round(grossMonthly * 100) / 100,
    federalTax: Math.round(federalTax * 100) / 100,
    stateTax: Math.round(stateTax * 100) / 100,
    socialSecurity: Math.round(socialSecurity * 100) / 100,
    medicare: Math.round(medicare * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netAnnual: Math.round(netAnnual * 100) / 100,
    netMonthly: Math.round((netAnnual / 12) * 100) / 100,
    netBiweekly: Math.round((netAnnual / 26) * 100) / 100,
    netWeekly: Math.round((netAnnual / 52) * 100) / 100,
  };
}