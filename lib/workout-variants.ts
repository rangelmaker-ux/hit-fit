import type { Exercise, ExerciseEquipmentVariant, DayWorkout } from './workout-data.ts';
import { getVariantRegistryItem } from './animation-registry.ts';

export interface SavedSetState {
  done: boolean;
  weightKg?: string;
  variantId?: string;
  equipmentName?: string;
  exerciseName?: string;
  reps?: string;
  completedAt?: string;
}

/**
 * Realiza a troca atômica de um exercício por uma de suas variantes/aparelhos alternativos.
 * Preserva:
 * - Metadados anatômicos dedicados (targetMuscle, secondaryMuscles, activeBodyParts front/back)
 * - Trajetória e modelo visual SVG correspondente (animationKey, activeVariantId)
 * - Prescrição específica quando definida (sets, reps, restSeconds)
 * - Biomecânica da execução (setup, execution, breathing, commonMistake, proTip)
 * - Round-trip completo: a máquina anterior vai para a lista de alternativas mantendo seus dados intactos.
 */
export function swapExerciseVariant(
  exercise: Exercise,
  targetVariantIdentifier: string
): Exercise {
  if (!exercise || !targetVariantIdentifier) return exercise;

  const targetIdClean = targetVariantIdentifier.trim().toLowerCase();

  const altItem = exercise.machines.alternatives.find(
    (a) =>
      (a.variantId && a.variantId.toLowerCase() === targetIdClean) ||
      (a.name && a.name.toLowerCase() === targetIdClean) ||
      (a.animationKey && a.animationKey.toLowerCase() === targetIdClean)
  );

  if (!altItem) {
    return exercise;
  }

  const newVariantId = altItem.variantId || altItem.animationKey || `${exercise.id}-alt`;
  const registryItem = getVariantRegistryItem(newVariantId);

  // Guarda o primary anterior como alternativa preservando todos os seus metadados
  const previousPrimary: ExerciseEquipmentVariant = {
    ...exercise.machines.primary,
    variantId: exercise.activeVariantId || exercise.machines.primary.variantId,
    name: exercise.machines.primary.name,
    animationKey: exercise.animationKey,
    sets: exercise.sets,
    reps: exercise.reps,
    restSeconds: exercise.restSeconds,
    targetMuscle: exercise.targetMuscle,
    secondaryMuscles: exercise.secondaryMuscles,
    activeBodyParts: exercise.activeBodyParts,
    biomechanics: exercise.biomechanics
  };

  const newAlternatives: ExerciseEquipmentVariant[] = [
    ...exercise.machines.alternatives.filter(
      (a) =>
        a !== altItem &&
        (!a.variantId || a.variantId.toLowerCase() !== targetIdClean) &&
        (!a.name || a.name.toLowerCase() !== targetIdClean) &&
        (!a.animationKey || a.animationKey.toLowerCase() !== targetIdClean)
    ),
    previousPrimary
  ];

  const newAnimationKey =
    altItem.animationKey || registryItem?.animationKey || exercise.animationKey;
  const newName = altItem.name || registryItem?.exerciseName || exercise.name;

  const targetMuscle =
    altItem.targetMuscle ||
    registryItem?.targetMuscle ||
    (registryItem?.primaryMuscles && registryItem.primaryMuscles.length > 0
      ? registryItem.primaryMuscles.join(' & ')
      : exercise.targetMuscle);

  const secondaryMuscles =
    altItem.secondaryMuscles ||
    registryItem?.secondaryMuscles ||
    exercise.secondaryMuscles;

  const activeBodyParts =
    altItem.activeBodyParts ||
    registryItem?.activeBodyParts ||
    exercise.activeBodyParts;

  const sets = altItem.sets || registryItem?.sets || exercise.sets;
  const reps = altItem.reps || registryItem?.reps || exercise.reps;
  const restSeconds = altItem.restSeconds || registryItem?.restSeconds || exercise.restSeconds;

  const biomechanics = altItem.biomechanics
    ? altItem.biomechanics
    : registryItem
    ? {
        ...exercise.biomechanics,
        setup: registryItem.settingTips || exercise.biomechanics.setup,
        execution: registryItem.description || exercise.biomechanics.execution
      }
    : exercise.biomechanics;

  const newPrimary: ExerciseEquipmentVariant = {
    ...altItem,
    variantId: newVariantId,
    name: newName,
    description:
      altItem.description || registryItem?.description || exercise.machines.primary.description,
    settingTips:
      altItem.settingTips || registryItem?.settingTips || previousPrimary.settingTips,
    animationKey: newAnimationKey,
    animationStatus: altItem.animationStatus || 'verified',
    targetMuscle,
    secondaryMuscles,
    activeBodyParts,
    sets,
    reps,
    restSeconds,
    biomechanics
  };

  return {
    ...exercise,
    name: newName,
    activeVariantId: newVariantId,
    animationKey: newAnimationKey,
    targetMuscle,
    secondaryMuscles,
    activeBodyParts,
    sets,
    reps,
    restSeconds,
    biomechanics,
    machines: {
      primary: newPrimary,
      alternatives: newAlternatives
    }
  };
}

/**
 * Aplica o mapa de variantes armazenado (por usuário) à lista de treinos da semana
 */
export function applyStoredVariantsToWorkouts(
  baseWorkouts: DayWorkout[],
  selectedVariants: Record<string, string>
): DayWorkout[] {
  if (!selectedVariants || typeof selectedVariants !== 'object' || Object.keys(selectedVariants).length === 0) {
    return baseWorkouts;
  }

  return baseWorkouts.map((day) => ({
    ...day,
    exercises: day.exercises.map((ex) => {
      const chosenVariantId = selectedVariants[ex.id];
      if (!chosenVariantId || chosenVariantId === ex.activeVariantId) {
        return ex;
      }
      return swapExerciseVariant(ex, chosenVariantId);
    })
  }));
}

/**
 * Lê do armazenamento durável (localStorage) as variantes selecionadas para o usuário ativo.
 * Chave canônica de armazenamento: `hitfit:selected-variants:${profileId}`
 */
export function getStoredVariantsForProfile(profileId: string): Record<string, string> {
  if (typeof window === 'undefined' || !profileId) return {};
  try {
    const raw = localStorage.getItem(`hitfit:selected-variants:${profileId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  return {};
}

/**
 * Salva no armazenamento durável as variantes selecionadas para o usuário ativo.
 */
export function saveStoredVariantsForProfile(
  profileId: string,
  variants: Record<string, string>
): void {
  if (typeof window === 'undefined' || !profileId) return;
  try {
    localStorage.setItem(`hitfit:selected-variants:${profileId}`, JSON.stringify(variants));
  } catch {}
}

/**
 * Cria ou atualiza um snapshot de série concluída, registrando variantId, equipamento,
 * nome do exercício e reps ativos no exato momento da execução.
 */
export function recordSetWithVariant(
  current: SavedSetState | undefined,
  exercise: Exercise,
  done: boolean,
  weightKg?: string
): SavedSetState {
  const isDone = done;
  return {
    ...(current || {}),
    done: isDone,
    weightKg: weightKg !== undefined ? weightKg : current?.weightKg,
    variantId: current?.variantId || exercise.activeVariantId || exercise.machines.primary.variantId,
    equipmentName: current?.equipmentName || exercise.machines.primary.name,
    exerciseName: current?.exerciseName || exercise.name,
    reps: current?.reps || exercise.reps,
    completedAt: isDone ? (current?.completedAt || new Date().toISOString()) : current?.completedAt
  };
}
