export function calculateLoan(
  principal: number,
  annualRate: number,
  years: number
): { monthlyPayment: number; totalPayment: number; totalInterest: number } {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;

  if (monthlyRate === 0) {
    return {
      monthlyPayment: principal / months,
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