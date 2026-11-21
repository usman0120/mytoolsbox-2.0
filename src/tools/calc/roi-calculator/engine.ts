// Return on Investment (ROI) & CAGR Engine

export interface ROIResult {
  initialInvestment: number;
  totalContributions: number;
  totalInvested: number;
  finalValue: number;
  netReturn: number;
  roiPercent: number;
  annualizedROI: number; // CAGR
  realROI: number; // Inflation-adjusted ROI
  years: number;
  isProfit: boolean;
  yearlySchedule: {
    year: number;
    investedPrincipal: number;
    endingValue: number;
    accumulatedGain: number;
  }[];
}

export interface ROIInput {
  initialInvestment: number;
  finalValue: number;
  years?: number;
  annualContribution?: number;
  inflationRate?: number;
}

export function calculateROI(
  initialOrInput: number | ROIInput,
  finalValueOrUndefined?: number,
  yearsOrUndefined?: number
): ROIResult {
  let initialInvestment: number;
  let finalValue: number;
  let years = 1;
  let annualContribution = 0;
  let inflationRate = 0;

  // Backward compatibility with calculateROI(initialInvestment, finalValue, years)
  if (typeof initialOrInput === "number") {
    initialInvestment = Math.max(0, initialOrInput);
    finalValue = Math.max(0, finalValueOrUndefined || 0);
    years = Math.max(0.1, yearsOrUndefined || 1);
  } else {
    initialInvestment = Math.max(0, initialOrInput.initialInvestment || 0);
    finalValue = Math.max(0, initialOrInput.finalValue || 0);
    years = Math.max(0.1, initialOrInput.years || 1);
    annualContribution = Math.max(0, initialOrInput.annualContribution || 0);
    inflationRate = Math.max(0, initialOrInput.inflationRate || 0);
  }

  const totalContributions = annualContribution * Math.floor(years);
  const totalInvested = initialInvestment + totalContributions;
  const netReturn = finalValue - totalInvested;

  // Simple Total ROI
  const roiPercent = totalInvested > 0 ? (netReturn / totalInvested) * 100 : 0;

  // Annualized ROI / CAGR
  // CAGR = (Final Value / Total Invested)^(1 / years) - 1
  let annualizedROI = 0;
  if (totalInvested > 0 && finalValue > 0 && years > 0) {
    annualizedROI = (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100;
  }

  // Real ROI (Fisher equation: (1 + nominal) / (1 + inflation) - 1)
  const nominalFrac = roiPercent / 100;
  const inflationFrac = Math.pow(1 + inflationRate / 100, years) - 1;
  const realROI = inflationFrac > -1 ? ((1 + nominalFrac) / (1 + inflationFrac) - 1) * 100 : roiPercent;

  // Year-by-year trajectory
  const yearlySchedule = [];
  const wholeYears = Math.min(50, Math.ceil(years));
  const cagrFrac = annualizedROI / 100;

  let currentPrincipal = initialInvestment;
  for (let y = 1; y <= wholeYears; y++) {
    currentPrincipal += annualContribution;
    const estValue = totalInvested > 0 ? (currentPrincipal / totalInvested) * finalValue * Math.pow(1 + (cagrFrac / 2), (y - wholeYears) / wholeYears) : 0;
    yearlySchedule.push({
      year: y,
      investedPrincipal: round(currentPrincipal),
      endingValue: round(y === wholeYears ? finalValue : Math.max(0, estValue)),
      accumulatedGain: round((y === wholeYears ? finalValue : estValue) - currentPrincipal),
    });
  }

  return {
    initialInvestment: round(initialInvestment),
    totalContributions: round(totalContributions),
    totalInvested: round(totalInvested),
    finalValue: round(finalValue),
    netReturn: round(netReturn),
    roiPercent: round(roiPercent),
    annualizedROI: round(annualizedROI),
    realROI: round(realROI),
    years: round(years),
    isProfit: netReturn >= 0,
    yearlySchedule,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}