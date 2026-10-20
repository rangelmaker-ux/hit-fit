export interface UserBioProfile {
  name: string;
  gender: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  age: number;
  targetWeightKg: number;
  dailyDeficitGoal: number; // e.g. 400 kcal
  waterGoalMl: number;
}

export interface NutritionDayLog {
  date: string; // YYYY-MM-DD
  profileId: string;
  weightKg?: number;
  caloriesConsumed: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterDrunkMl: number;
  workoutCaloriesBurned: number;
  notes?: string;
}

// Fórmula de Mifflin-St Jeor para Taxa Metabólica Basal (BMR)
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
}

// Gasto Energético Total Diário (TDEE) com fator de atividade moderada (5 treinos/semana)
export function calculateTDEE(bmr: number, factor: number = 1.5): number {
  return Math.round(bmr * factor);
}

// Metas recomendadas para recomposição corporal (perder gordura + definir massa muscular)
export function calculateNutritionTargets(profile: UserBioProfile) {
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, 1.5);
  const targetCalories = Math.max(1200, tdee - profile.dailyDeficitGoal);

  // 2.0g de proteína por kg de peso para preservação de massa magra
  const targetProteinG = Math.round(profile.weightKg * 2.0);
  const proteinCalories = targetProteinG * 4;

  // 0.8g de gorduras por kg para síntese hormonal
  const targetFatG = Math.round(profile.weightKg * 0.8);
  const fatCalories = targetFatG * 9;

  // Carboidratos completam as calorias alvo restantes
  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const targetCarbsG = Math.round(remainingCalories / 4);

  // Água: 38 ml por kg de peso
  const targetWaterMl = Math.round(profile.weightKg * 38);

  return {
    bmr,
    tdee,
    targetCalories,
    targetProteinG,
    targetFatG,
    targetCarbsG,
    targetWaterMl
  };
}

export const DEFAULT_PROFILES: Record<string, UserBioProfile> = {
  Rangel: {
    name: 'Rangel',
    gender: 'male',
    weightKg: 82,
    heightCm: 178,
    age: 30,
    targetWeightKg: 76,
    dailyDeficitGoal: 450,
    waterGoalMl: 3100
  },
  Geicsania: {
    name: 'Geicsania',
    gender: 'female',
    weightKg: 64,
    heightCm: 165,
    age: 28,
    targetWeightKg: 58,
    dailyDeficitGoal: 350,
    waterGoalMl: 2400
  }
};
