export interface DetailedBMI {
  bmi: number;
  category: string;
  categoryColor: string;
  prime: number;
  ponderalIndex: number;
  healthyWeightRange: {
    minKg: number;
    maxKg: number;
    minLbs: number;
    maxLbs: number;
  };
  weightDeltaToNormal: number; // kg to gain (+) or lose (-) to reach normal boundary
}

export function calculateBMI(
  weightKg: number,
  heightCm: number
): { bmi: number; category: string } {
  if (heightCm <= 0 || weightKg <= 0) return { bmi: 0, category: "Invalid" };
  const heightM = heightCm / 100;
  const rawBmi = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBmi * 10) / 10;

  let category = "Normal weight";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  return { bmi, category };
}

export function calculateDetailedBMI(
  weightKg: number,
  heightCm: number
): DetailedBMI {
  if (heightCm <= 0 || weightKg <= 0) {
    return {
      bmi: 0,
      category: "Invalid",
      categoryColor: "#94a3b8",
      prime: 0,
      ponderalIndex: 0,
      healthyWeightRange: { minKg: 0, maxKg: 0, minLbs: 0, maxLbs: 0 },
      weightDeltaToNormal: 0,
    };
  }

  const heightM = heightCm / 100;
  const rawBmi = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBmi * 10) / 10;

  // WHO Detailed Categories
  let category = "Normal weight";
  let categoryColor = "#10b981"; // Emerald green

  if (bmi < 16.0) {
    category = "Severe Thinness";
    categoryColor = "#3b82f6";
  } else if (bmi < 17.0) {
    category = "Moderate Thinness";
    categoryColor = "#60a5fa";
  } else if (bmi < 18.5) {
    category = "Mild Thinness";
    categoryColor = "#93c5fd";
  } else if (bmi < 25.0) {
    category = "Normal weight";
    categoryColor = "#10b981";
  } else if (bmi < 30.0) {
    category = "Overweight (Pre-obese)";
    categoryColor = "#f59e0b";
  } else if (bmi < 35.0) {
    category = "Obese Class I";
    categoryColor = "#f97316";
  } else if (bmi < 40.0) {
    category = "Obese Class II";
    categoryColor = "#ef4444";
  } else {
    category = "Obese Class III (Severe)";
    categoryColor = "#b91c1c";
  }

  const prime = Math.round((bmi / 25) * 100) / 100;
  const ponderalIndex = Math.round((weightKg / Math.pow(heightM, 3)) * 10) / 10;

  // Normal BMI is 18.5 - 24.9
  const minNormalKg = Math.round(18.5 * (heightM * heightM) * 10) / 10;
  const maxNormalKg = Math.round(24.9 * (heightM * heightM) * 10) / 10;
  const minNormalLbs = Math.round(minNormalKg * 2.20462 * 10) / 10;
  const maxNormalLbs = Math.round(maxNormalKg * 2.20462 * 10) / 10;

  let weightDeltaToNormal = 0;
  if (weightKg < minNormalKg) {
    weightDeltaToNormal = Math.round((minNormalKg - weightKg) * 10) / 10; // gain needed (+)
  } else if (weightKg > maxNormalKg) {
    weightDeltaToNormal = Math.round((weightKg - maxNormalKg) * 10) / 10; // loss needed (-)
  }

  return {
    bmi,
    category,
    categoryColor,
    prime,
    ponderalIndex,
    healthyWeightRange: {
      minKg: minNormalKg,
      maxKg: maxNormalKg,
      minLbs: minNormalLbs,
      maxLbs: maxNormalLbs,
    },
    weightDeltaToNormal,
  };
}