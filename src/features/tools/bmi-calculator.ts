export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let category: string;

  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  return { bmi: Math.round(bmi * 10) / 10, category };
}