export type BmiCategory = 'Underweight' | 'Normal' | 'Overweight' | 'Obese';

export function calculateBmi(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function formatBmi(heightCm: number, weightKg: number): string {
  const bmi = calculateBmi(heightCm, weightKg);
  const category = getBmiCategory(bmi);
  return `${bmi} · ${category}`;
}
