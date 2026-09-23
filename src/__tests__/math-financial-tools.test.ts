import { describe, it, expect } from "vitest";
import { calculatePercentageComprehensive } from "../features/tools/percentage-calculator";
import { calculateComprehensiveAge, dateDifference } from "../features/tools/age-calculator";
import { calculateBMI, calculateDetailedBMI } from "../features/tools/bmi-calculator";
import { calculateLoan, calculateDetailedLoan } from "../features/tools/loan-calculator";
import { convertUnit } from "../features/tools/unit-converter";
import { evaluateExpression } from "../features/tools/scientific-calculator";
import {
  parseMatrix,
  addMatrices,
  multiplyMatrices,
  determinant,
  inverse,
  matrixPower,
  trace,
  matrixRank,
} from "../features/tools/matrix-calculator";
import { solveEquation, solveSystem2, solveSystem3 } from "../features/tools/equation-solver";
import { calculateStatistics } from "../features/tools/statistics-calculator";
import { calculateProfit } from "../features/tools/profit-calculator";
import {
  calculateMargin,
  calculateSellingPriceFromMargin,
  calculateSellingPriceFromMarkup,
  calculateCostFromPrice,
} from "../features/tools/margin-calculator";
import { calculateTax } from "../features/tools/tax-calculator";
import { calculateSalary } from "../features/tools/salary-calculator";
import { calculateROI } from "../features/tools/roi-calculator";
import { calculateBreakEven } from "../features/tools/break-even-calculator";

describe("Math, Calculator, and Financial Tools Suite", () => {
  // 1. Percentage Calculator
  it("computes all 6 percentage operation modes accurately", () => {
    expect(calculatePercentageComprehensive("percentOf", 25, 200).value).toBe(50);
    expect(calculatePercentageComprehensive("isWhatPercent", 50, 200).value).toBe(25);
    expect(calculatePercentageComprehensive("percentChange", 100, 150).value).toBe(50);
    expect(calculatePercentageComprehensive("addPercent", 20, 100).value).toBe(120);
    expect(calculatePercentageComprehensive("subtractPercent", 20, 100).value).toBe(80);
    expect(calculatePercentageComprehensive("fractionToPercent", 3, 4).value).toBe(75);
  });

  // 2. Age Calculator
  it("calculates exact age, milestones, and date differences", () => {
    const age = calculateComprehensiveAge(new Date(2000, 0, 1), new Date(2025, 0, 1));
    expect(age).not.toBeNull();
    expect(age.years).toBe(25);
    expect(age.zodiac.sign).toBe("Capricorn");
    expect(age.totalDays).toBeGreaterThan(9100);

    const diff = dateDifference(new Date(2024, 0, 1), new Date(2024, 11, 31));
    expect(diff.totalDays).toBe(365); // 2024 is a leap year
  });

  // 3. BMI Calculator
  it("calculates metric BMI accurately with WHO classification", () => {
    const metric = calculateBMI(70, 175);
    expect(metric.bmi).toBe(22.9);
    expect(metric.category).toBe("Normal weight");

    const detailed = calculateDetailedBMI(70, 175);
    expect(detailed.healthyWeightRange.minKg).toBeCloseTo(56.7, 0);
  });

  // 4. Loan Calculator
  it("computes monthly loan amortization payment and total interest", () => {
    // $100,000 at 6% for 30 years
    const loan = calculateLoan(100000, 6, 30);
    expect(loan.monthlyPayment).toBe(599.55);
    expect(loan.totalPayment).toBeCloseTo(215838, -1);
    expect(loan.totalInterest).toBeCloseTo(115838, -1);

    const detailed = calculateDetailedLoan(100000, 6, 30);
    expect(detailed.annualSchedule.length).toBe(30);
  });

  // 5. Unit Converter
  it("normalizes and converts units across categories seamlessly", () => {
    const length = convertUnit(1000, "m", "km", "length");
    expect(length).toBe(1);

    const temp = convertUnit(100, "c", "f", "temperature");
    expect(temp).toBe(212);

    const bytes = convertUnit(1024, "mb", "gb", "storage");
    expect(bytes).toBe(1);
  });

  // 6. Scientific Calculator
  it("parses and evaluates algebraic and trigonometric expressions", () => {
    expect(evaluateExpression("2 + 3 * 4")).toBe("14");
    expect(evaluateExpression("sin(90)", "deg")).toBe("1");
    expect(evaluateExpression("sqrt(16) + 2^3")).toBe("12");
    expect(evaluateExpression("5!")).toBe("120");
    expect(evaluateExpression("ln(e)")).toBe("1");
    expect(evaluateExpression("sinh(0)")).toBe("0");
  });

  // 7. Matrix Calculator
  it("performs matrix addition, multiplication, determinant, rank, and power", () => {
    const A = parseMatrix("1 2\n3 4");
    const B = parseMatrix("2 0\n1 2");
    expect(A).not.toBeNull();
    expect(B).not.toBeNull();

    if (A && B) {
      expect(addMatrices(A, B)).toEqual([[3, 2], [4, 6]]);
      expect(multiplyMatrices(A, B)).toEqual([[4, 4], [10, 8]]);
      expect(determinant(A)).toBe(-2);
      expect(trace(A)).toBe(5);
      expect(matrixRank(A)).toBe(2);
      expect(matrixPower(A, 2)).toEqual([[7, 10], [15, 22]]);
      expect(inverse(A)).toEqual([[-2, 1], [1.5, -0.5]]);
    }
  });

  // 8. Equation Solver
  it("solves linear, quadratic, cubic, and systems of equations", () => {
    const linear = solveEquation("3x + 9 = 0");
    expect(linear.type).toBe("linear");
    expect(linear.roots).toContain("-3");

    const quad = solveEquation("x^2 - 5x + 6 = 0");
    expect(quad.type).toBe("quadratic");
    expect(quad.roots).toContain("2");
    expect(quad.roots).toContain("3");
    expect(quad.properties?.discriminant).toBe(1);

    const sys2 = solveSystem2("x + y = 10", "x - y = 2");
    expect(sys2.type).toBe("system2");
    expect(sys2.roots).toContain("x = 6");
    expect(sys2.roots).toContain("y = 4");

    const sys3 = solveSystem3("x + y + z = 6", "2y + 5z = -4", "2x + 5y - z = 27");
    expect(sys3.type).toBe("system3");
    expect(sys3.roots).toContain("x = 5");
    expect(sys3.roots).toContain("y = 3");
    expect(sys3.roots).toContain("z = -2");
  });

  // 9. Statistics Calculator
  it("computes comprehensive descriptive statistics and outlier detection", () => {
    const data = [10, 20, 20, 30, 40, 50, 1000]; // 1000 is an outlier
    const stats = calculateStatistics(data);
    expect(stats).not.toBeNull();
    expect(stats?.count).toBe(7);
    expect(stats?.median).toBe(30);
    expect(stats?.mode).toEqual([20]);
    expect(stats?.outliers).toContain(1000);
    expect(stats?.sampleStdDev).toBeGreaterThan(0);
  });

  // 10. Profit Calculator
  it("computes gross profit, operating profit, and net income with margins", () => {
    const profit = calculateProfit({
      revenue: 100000,
      cogs: 40000,
      salaries: 20000,
      marketing: 10000,
      taxRate: 20,
    });
    expect(profit.grossProfit).toBe(60000);
    expect(profit.grossMargin).toBe(60);
    expect(profit.operatingProfit).toBe(30000);
    expect(profit.taxAmount).toBe(6000);
    expect(profit.netProfit).toBe(24000);
    expect(profit.netMargin).toBe(24);
  });

  // 11. Margin Calculator
  it("solves cost, price, margin, markup, and target costing", () => {
    const margin = calculateMargin(50, 100);
    expect(margin.grossProfit).toBe(50);
    expect(margin.grossMarginPercent).toBe(50);
    expect(margin.markupPercent).toBe(100);

    const priceFromMargin = calculateSellingPriceFromMargin(50, 50);
    expect(priceFromMargin.sellingPrice).toBe(100);

    const costFromPrice = calculateCostFromPrice(100, 40);
    expect(costFromPrice.cost).toBe(60);
  });

  // 12. Tax Calculator
  it("calculates federal tax, FICA, state tax, and take-home pay", () => {
    const tax = calculateTax({
      grossIncome: 100000,
      filingStatus: "single",
      useStandardDeduction: true,
      stateTaxRate: 5,
      includeFica: true,
    });
    expect(tax.grossIncome).toBe(100000);
    expect(tax.taxableIncome).toBe(100000 - 14600);
    expect(tax.federalTax).toBeGreaterThan(10000);
    expect(tax.socialSecurityTax).toBe(6200);
    expect(tax.medicareTax).toBe(1450);
    expect(tax.stateTax).toBe(5000);
    expect(tax.takeHomeAnnual).toBeLessThan(100000);
    expect(tax.takeHomeAnnual).toBe(tax.grossIncome - tax.totalTax);
  });

  // 13. Salary Calculator
  it("converts pay across frequencies with retirement and healthcare deductions", () => {
    const salary = calculateSalary({
      amount: 104000,
      period: "annual",
      hoursPerWeek: 40,
      federalTaxRate: 20,
      stateTaxRate: 5,
      retirement401kPercent: 5,
    });
    expect(salary.grossHourly).toBe(50);
    expect(salary.grossMonthly).toBeCloseTo(104000 / 12, 1);
    expect(salary.grossBiweekly).toBe(4000);
    expect(salary.netAnnual).toBeGreaterThan(0);
    expect(salary.schedule.length).toBe(7);
  });

  // 14. ROI Calculator
  it("calculates total ROI, annualized CAGR, and real inflation-adjusted return", () => {
    const roi = calculateROI({
      initialInvestment: 10000,
      finalValue: 20000,
      years: 5,
      inflationRate: 2.5,
    });
    expect(roi.netReturn).toBe(10000);
    expect(roi.roiPercent).toBe(100);
    expect(roi.annualizedROI).toBeCloseTo(14.87, 1);
    expect(roi.realROI).toBeLessThan(roi.roiPercent);
    expect(roi.yearlySchedule.length).toBe(5);
  });

  // 15. Break-Even Calculator
  it("calculates break-even units, revenue, contribution margin, and safety margin", () => {
    const be = calculateBreakEven({
      fixedCosts: 10000,
      variableCostPerUnit: 20,
      sellingPricePerUnit: 40,
      targetProfit: 5000,
      projectedUnits: 600,
    });
    expect(be.contributionMargin).toBe(20);
    expect(be.contributionMarginRatio).toBe(50);
    expect(be.breakEvenUnits).toBe(500);
    expect(be.breakEvenRevenue).toBe(20000);
    expect(be.unitsForTargetProfit).toBe(750);
    expect(be.marginOfSafetyUnits).toBe(100);
    expect(be.marginOfSafetyPercent).toBeCloseTo(16.67, 1);
  });
});
