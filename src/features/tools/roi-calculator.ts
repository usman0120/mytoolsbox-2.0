export interface ROIResult {
  initialInvestment: number;
  finalValue: number;
  netReturn: number;
  roiPercent: number;
  annualizedROI: number;
  years: number;
  isProfit: boolean;
}

export function calculateROI(
  initialInvestment: number,
  finalValue: number,
  years: number = 1
): ROIResult {
  const netReturn = finalValue - initialInvestment;
  const roiPercent = initialInvestment > 0 ? (netReturn / initialInvestment) * 100 : 0;
  const annualizedROI = years > 0 && initialInvestment > 0
    ? (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100
    : roiPercent;

  return {
    initialInvestment: Math.round(initialInvestment * 100) / 100,
    finalValue: Math.round(finalValue * 100) / 100,
    netReturn: Math.round(netReturn * 100) / 100,
    roiPercent: Math.round(roiPercent * 100) / 100,
    annualizedROI: Math.round(annualizedROI * 100) / 100,
    years,
    isProfit: netReturn >= 0,
  };
}