export interface UserBioProfile {
  name: string;
  gender: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  age: number;
  targetWeightKg: number;
  goal: 'fat_loss' | 'recomp' | 'hypertrophy';
  activityFactor: number; // 1.2, 1.375, 1.55, 1.725
  customDailyDeficit?: number; // ex: 400 kcal
  waterGoalMl: number;
}

export interface FoodItem {
  id: string;
  name: string;
  portion: string; // ex: '100g' ou '1 scoop'
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string; // 'Café da Manhã', 'Almoço', 'Pré/Pós-Treino', 'Jantar', 'Lanche'
  items: FoodItem[];
}

export interface DailyNutritionLog {
  date: string; // YYYY-MM-DD
  profileId: string;
  weightKg?: number;
  meals: Meal[];
  waterDrunkMl: number;
  watchCaloriesBurned?: number; // estimativa manual ou BLE do relógio
  watchAvgBpm?: number;
  notes?: string;
}

// Catálogo de Alimentos Rápidos Populares para Dieta de Academia
export const QUICK_FOODS_CATALOG: FoodItem[] = [
  { id: 'q1', name: 'Peito de Frango Grelhado', portion: '150g', calories: 247, protein: 46.5, carbs: 0, fat: 5.4 },
  { id: 'q2', name: 'Ovos Cozidos / Mexidos (2 un)', portion: '100g', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { id: 'q3', name: 'Arroz Branco Cozido', portion: '150g', calories: 195, protein: 3.8, carbs: 42.5, fat: 0.4 },
  { id: 'q4', name: 'Batata Doce Cozida', portion: '150g', calories: 129, protein: 2.4, carbs: 30, fat: 0.2 },
  { id: 'q5', name: 'Whey Protein Concentrado', portion: '1 scoop (30g)', calories: 120, protein: 24, carbs: 3, fat: 1.5 },
  { id: 'q6', name: 'Aveia em Flocos', portion: '40g', calories: 157, protein: 5.6, carbs: 26.8, fat: 3.2 },
  { id: 'q7', name: 'Banana Prata', portion: '1 unidade média (90g)', calories: 88, protein: 1.2, carbs: 23, fat: 0.3 },
  { id: 'q8', name: 'Carne Moída Patinho', portion: '150g', calories: 250, protein: 43.5, carbs: 0, fat: 7.2 },
  { id: 'q9', name: 'Iogurte Natural Desnatado', portion: '170g', calories: 85, protein: 8.5, carbs: 10, fat: 0.5 },
  { id: 'q10', name: 'Pasta de Amendoim', portion: '1 colher de sopa (20g)', calories: 124, protein: 5.2, carbs: 3.8, fat: 10 },
  { id: 'q11', name: 'Feijão Carioca Cozido', portion: '100g', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5 },
  { id: 'q12', name: 'Azeite de Oliva Extra Virgem', portion: '1 colher de sopa (10ml)', calories: 88, protein: 0, carbs: 0, fat: 10 }
];

// Fórmula Oficial de Mifflin-St Jeor para Taxa Metabólica Basal (BMR)
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female'): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 1500;
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
}

// Fator de Atividade e TDEE planejado
export function calculatePlannedTDEE(bmr: number, activityFactor: number = 1.55): number {
  return Math.round(bmr * activityFactor);
}

/**
 * Cálculo rigoroso de Gasto Diário Real (evita contagem dupla de exercício):
 * - Base sem treino = BMR * 1.25 (cobre metabolismo basal + NEAT leve e efeito térmico dos alimentos).
 * - Quando há estimativa do relógio inteligente para a sessão, ela é somada a essa base sedentária.
 * - Se não houver relógio, utiliza o TDEE planejado com o fator de atividade da rotina.
 */
export function calculateActualDailyBurn(
  bmr: number,
  activityFactor: number = 1.55,
  watchExerciseCalories?: number
): { totalDailyBurn: number; source: 'watch_adjusted' | 'planned_tdee' } {
  if (watchExerciseCalories && watchExerciseCalories > 0) {
    const nonExerciseBaseline = Math.round(bmr * 1.25);
    const total = nonExerciseBaseline + watchExerciseCalories;
    return { totalDailyBurn: total, source: 'watch_adjusted' };
  }
  return { totalDailyBurn: calculatePlannedTDEE(bmr, activityFactor), source: 'planned_tdee' };
}

// Metas nutricionais balanceadas e seguras
export function calculateTargets(profile: UserBioProfile) {
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const plannedTDEE = calculatePlannedTDEE(bmr, profile.activityFactor || 1.55);

  // Déficit ou Superávit seguro baseado no objetivo
  let calorieAdjustment = 0;
  if (profile.goal === 'fat_loss') {
    calorieAdjustment = -Math.min(600, profile.customDailyDeficit || 450);
  } else if (profile.goal === 'recomp') {
    calorieAdjustment = -Math.min(400, profile.customDailyDeficit || 300);
  } else {
    // hypertrophy
    calorieAdjustment = 250;
  }

  // Pisos calóricos de segurança médica
  const minimumCalorieFloor = profile.gender === 'male' ? 1500 : 1200;
  const targetCalories = Math.max(minimumCalorieFloor, plannedTDEE + calorieAdjustment);

  // Proteína: 2.0g/kg para recomposição e retenção de massa magra
  const targetProteinG = Math.round(profile.weightKg * 2.0);
  const proteinKcal = targetProteinG * 4;

  // Gordura saudável: 0.8g/kg para síntese hormonal
  const targetFatG = Math.round(profile.weightKg * 0.8);
  const fatKcal = targetFatG * 9;

  // Carboidratos completam as calorias restantes para suportar treinos pesados
  const remainingKcal = Math.max(0, targetCalories - (proteinKcal + fatKcal));
  const targetCarbsG = Math.round(remainingKcal / 4);

  // Hidratação: 38 ml por kg de peso
  const targetWaterMl = Math.round(profile.weightKg * 38);

  return {
    bmr,
    plannedTDEE,
    targetCalories,
    calorieAdjustment,
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
    goal: 'fat_loss',
    activityFactor: 1.55,
    customDailyDeficit: 450,
    waterGoalMl: 3100
  },
  Geicsania: {
    name: 'Geicsania',
    gender: 'female',
    weightKg: 64,
    heightCm: 165,
    age: 28,
    targetWeightKg: 58,
    goal: 'recomp',
    activityFactor: 1.55,
    customDailyDeficit: 350,
    waterGoalMl: 2400
  }
};
