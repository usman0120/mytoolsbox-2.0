export interface AmortizationRow {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface DetailedLoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principalRatio: number;
  interestRatio: number;
  totalPeriods: number;
  annualSchedule: {
    year: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
  }[];
  monthlySchedule: AmortizationRow[];
}

export function calculateLoan(
  principal: number,
  annualRate: number,
  years: number
): { monthlyPayment: number; totalPayment: number; totalInterest: number } {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;

  if (monthlyRate === 0) {
    return {
      monthlyPayment: Math.round((principal / months) * 100) / 100,
      totalPayment: principal,
      totalInterest: 0,
    };
  }

  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - principal;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
}

export function calculateDetailedLoan(
  principal: number,
  annualRate: number,
  years: number,
  extraMonthlyPayment: number = 0
): DetailedLoanResult {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;

  let baseMonthlyPayment = 0;
  if (monthlyRate === 0) {
    baseMonthlyPayment = principal / totalMonths;
  } else {
    baseMonthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const effectiveMonthlyPayment = baseMonthlyPayment + extraMonthlyPayment;

  let balance = principal;
  let totalInterest = 0;
  let totalPayment = 0;
  const monthlySchedule: AmortizationRow[] = [];

  const annualSchedule: {
    year: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
  }[] = [];

  let currentYearPrincipal = 0;
  let currentYearInterest = 0;
  let period = 1;

  while (balance > 0.01 && period <= totalMonths * 2) {
    const interest = balance * monthlyRate;
    let principalPaid = effectiveMonthlyPayment - interest;

    if (principalPaid > balance) {
      principalPaid = balance;
    }

    const actualPayment = principalPaid + interest;
    balance -= principalPaid;
    totalInterest += interest;
    totalPayment += actualPayment;

    currentYearPrincipal += principalPaid;
    currentYearInterest += interest;

    monthlySchedule.push({
      period,
      payment: Math.round(actualPayment * 100) / 100,
      principal: Math.round(principalPaid * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.max(0, Math.round(balance * 100) / 100),
    });

    if (period % 12 === 0 || balance <= 0.01) {
      annualSchedule.push({
        year: Math.ceil(period / 12),
        principalPaid: Math.round(currentYearPrincipal * 100) / 100,
        interestPaid: Math.round(currentYearInterest * 100) / 100,
        remainingBalance: Math.max(0, Math.round(balance * 100) / 100),
      });
      currentYearPrincipal = 0;
      currentYearInterest = 0;
    }

    if (balance <= 0.01) break;
    period++;
  }

  const principalRatio = Math.round((principal / totalPayment) * 100);
  const interestRatio = 100 - principalRatio;

  return {
    monthlyPayment: Math.round(baseMonthlyPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    principalRatio,
    interestRatio,
    totalPeriods: monthlySchedule.length,
    annualSchedule,
    monthlySchedule,
  };
}