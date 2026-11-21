// Salary & Paycheck Conversion Engine

export type PayPeriod = "hourly" | "daily" | "weekly" | "biweekly" | "semimonthly" | "monthly" | "annual";

export interface SalaryInput {
  amount: number;
  period: PayPeriod;
  hoursPerWeek?: number;
  daysPerWeek?: number;
  weeksPerYear?: number;
  overtimeHoursPerWeek?: number;
  overtimeMultiplier?: number;
  federalTaxRate?: number;
  stateTaxRate?: number;
  retirement401kPercent?: number;
  healthInsuranceMonthly?: number;
  otherDeductionsMonthly?: number;
}

export interface PayScheduleItem {
  period: string;
  gross: number;
  taxes: number;
  deductions: number;
  net: number;
}

export interface SalaryResult {
  grossAnnual: number;
  grossMonthly: number;
  grossBiweekly: number;
  grossWeekly: number;
  grossDaily: number;
  grossHourly: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  totalTaxes: number;
  retirement401kAnnual: number;
  healthInsuranceAnnual: number;
  otherDeductionsAnnual: number;
  totalBenefitsAndDeductions: number;
  totalDeductions: number;
  netAnnual: number;
  netMonthly: number;
  netSemimonthly: number;
  netBiweekly: number;
  netWeekly: number;
  netDaily: number;
  netHourly: number;
  takeHomePercentage: number;
  schedule: PayScheduleItem[];
}

export function calculateSalary(
  amountOrGrossAnnual: number | SalaryInput,
  stateTaxRateOrUndefined?: number,
  federalTaxRateOrUndefined?: number,
  otherDeductionsOrUndefined?: number
): SalaryResult {
  let input: SalaryInput;

  // Backward compatibility with calculateSalary(grossAnnual, stateTaxRate, federalTaxRate, otherDeductions)
  if (typeof amountOrGrossAnnual === "number") {
    input = {
      amount: amountOrGrossAnnual,
      period: "annual",
      stateTaxRate: stateTaxRateOrUndefined ?? 5,
      federalTaxRate: federalTaxRateOrUndefined ?? 22,
      otherDeductionsMonthly: (otherDeductionsOrUndefined ?? 0) / 12,
    };
  } else {
    input = amountOrGrossAnnual;
  }

  const hoursPerWeek = Math.max(1, input.hoursPerWeek || 40);
  const daysPerWeek = Math.max(1, input.daysPerWeek || 5);
  const weeksPerYear = Math.max(1, input.weeksPerYear || 52);
  const overtimeHours = Math.max(0, input.overtimeHoursPerWeek || 0);
  const overtimeMultiplier = input.overtimeMultiplier || 1.5;

  const baseAnnualHours = hoursPerWeek * weeksPerYear;
  const annualOvertimeHours = overtimeHours * weeksPerYear;

  // 1. Calculate Gross Annual Base
  let grossAnnual = 0;
  const amt = Math.max(0, input.amount || 0);

  switch (input.period) {
    case "hourly": {
      const basePay = amt * baseAnnualHours;
      const otPay = amt * overtimeMultiplier * annualOvertimeHours;
      grossAnnual = basePay + otPay;
      break;
    }
    case "daily": {
      grossAnnual = amt * daysPerWeek * weeksPerYear;
      break;
    }
    case "weekly": {
      grossAnnual = amt * weeksPerYear;
      break;
    }
    case "biweekly": {
      grossAnnual = amt * (weeksPerYear / 2);
      break;
    }
    case "semimonthly": {
      grossAnnual = amt * 24;
      break;
    }
    case "monthly": {
      grossAnnual = amt * 12;
      break;
    }
    case "annual":
    default: {
      grossAnnual = amt;
      break;
    }
  }

  // Pre-tax deductions (401k)
  const k401Rate = Math.min(100, Math.max(0, input.retirement401kPercent || 0)) / 100;
  const retirement401kAnnual = grossAnnual * k401Rate;

  // Health Insurance & other pre-tax / pre-net deductions
  const healthInsuranceAnnual = Math.max(0, input.healthInsuranceMonthly || 0) * 12;
  const otherDeductionsAnnual = Math.max(0, input.otherDeductionsMonthly || 0) * 12;
  const totalBenefitsAndDeductions = retirement401kAnnual + healthInsuranceAnnual + otherDeductionsAnnual;

  // Taxable Base for Federal / State
  const federalTaxable = Math.max(0, grossAnnual - retirement401kAnnual - healthInsuranceAnnual);
  const fedRate = (input.federalTaxRate ?? 22) / 100;
  const federalTax = federalTaxable * fedRate;

  const stateRate = (input.stateTaxRate ?? 5) / 100;
  const stateTax = federalTaxable * stateRate;

  // FICA
  const socialSecurity = Math.min(grossAnnual, 168600) * 0.062;
  const medicare = grossAnnual * 0.0145;
  const totalTaxes = federalTax + stateTax + socialSecurity + medicare;

  const totalDeductions = totalTaxes + totalBenefitsAndDeductions;
  const netAnnual = Math.max(0, grossAnnual - totalDeductions);
  const takeHomePercentage = grossAnnual > 0 ? (netAnnual / grossAnnual) * 100 : 0;

  // Breakdown periods
  const grossMonthly = grossAnnual / 12;
  const grossBiweekly = grossAnnual / 26;
  const grossWeekly = grossAnnual / 52;
  const grossDaily = grossAnnual / (weeksPerYear * daysPerWeek);
  const grossHourly = grossAnnual / baseAnnualHours;

  const netMonthly = netAnnual / 12;
  const netSemimonthly = netAnnual / 24;
  const netBiweekly = netAnnual / 26;
  const netWeekly = netAnnual / 52;
  const netDaily = netAnnual / (weeksPerYear * daysPerWeek);
  const netHourly = netAnnual / baseAnnualHours;

  const schedule: PayScheduleItem[] = [
    { period: "Annual", gross: round(grossAnnual), taxes: round(totalTaxes), deductions: round(totalBenefitsAndDeductions), net: round(netAnnual) },
    { period: "Monthly (12/yr)", gross: round(grossMonthly), taxes: round(totalTaxes / 12), deductions: round(totalBenefitsAndDeductions / 12), net: round(netMonthly) },
    { period: "Semi-Monthly (24/yr)", gross: round(grossAnnual / 24), taxes: round(totalTaxes / 24), deductions: round(totalBenefitsAndDeductions / 24), net: round(netSemimonthly) },
    { period: "Bi-Weekly (26/yr)", gross: round(grossBiweekly), taxes: round(totalTaxes / 26), deductions: round(totalBenefitsAndDeductions / 26), net: round(netBiweekly) },
    { period: "Weekly (52/yr)", gross: round(grossWeekly), taxes: round(totalTaxes / 52), deductions: round(totalBenefitsAndDeductions / 52), net: round(netWeekly) },
    { period: "Daily (8h)", gross: round(grossDaily), taxes: round(totalTaxes / (weeksPerYear * daysPerWeek)), deductions: round(totalBenefitsAndDeductions / (weeksPerYear * daysPerWeek)), net: round(netDaily) },
    { period: "Hourly", gross: round(grossHourly), taxes: round(totalTaxes / baseAnnualHours), deductions: round(totalBenefitsAndDeductions / baseAnnualHours), net: round(netHourly) },
  ];

  return {
    grossAnnual: round(grossAnnual),
    grossMonthly: round(grossMonthly),
    grossBiweekly: round(grossBiweekly),
    grossWeekly: round(grossWeekly),
    grossDaily: round(grossDaily),
    grossHourly: round(grossHourly),
    federalTax: round(federalTax),
    stateTax: round(stateTax),
    socialSecurity: round(socialSecurity),
    medicare: round(medicare),
    totalTaxes: round(totalTaxes),
    retirement401kAnnual: round(retirement401kAnnual),
    healthInsuranceAnnual: round(healthInsuranceAnnual),
    otherDeductionsAnnual: round(otherDeductionsAnnual),
    totalBenefitsAndDeductions: round(totalBenefitsAndDeductions),
    totalDeductions: round(totalDeductions),
    netAnnual: round(netAnnual),
    netMonthly: round(netMonthly),
    netSemimonthly: round(netSemimonthly),
    netBiweekly: round(netBiweekly),
    netWeekly: round(netWeekly),
    netDaily: round(netDaily),
    netHourly: round(netHourly),
    takeHomePercentage: round(takeHomePercentage),
    schedule,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}