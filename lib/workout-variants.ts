import type { Exercise, ExerciseEquipmentVariant, DayWorkout } from './workout-data';
import { getVariantRegistryItem } from './animation-registry';

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
    equipmentName: exercise.machines.primary.equipmentName || exercise.machines.primary.name,
    exerciseName: exercise.name, // Preserva identidade imutável do exercício
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

  // Segregação estrita entre Nome do Exercício e Nome do Equipamento
  const newExerciseName =
    altItem.exerciseName ||
    registryItem?.exerciseName ||
    (altItem.name &&
    !altItem.name.toLowerCase().includes('banco') &&
    !altItem.name.toLowerCase().includes('máquina articulada') &&
    !altItem.name.toLowerCase().includes('smith')
      ? altItem.name
      : exercise.name);

  const newEquipmentName =
    altItem.equipmentName ||
    registryItem?.equipmentName ||
    altItem.name ||
    exercise.machines.primary.name;

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
    name: newEquipmentName,
    equipmentName: newEquipmentName,
    exerciseName: newExerciseName,
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
    name: newExerciseName,
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
 * Cria ou atualiza um snapshot de série com desacoplamento rigoroso:
 * - Se done === false: armazena somente o rascunho de carga (weightKg) sem congelar variantId ou equipamento.
 * - Se done === true: captura atomicamente a variante, equipamento e exercício ativos no momento da conclusão.
 * - Se desmarcada (done === false): preserva o peso digitado, mas limpa o snapshot de conclusão para que nova máquina possa ser escolhida.
 * - Não inventa variantes fictícias para registros legados que não as possuam.
 */
export function recordSetWithVariant(
  current: SavedSetState | undefined,
  exercise: Exercise,
  done: boolean,
  weightKg?: string
): SavedSetState {
  const resolvedWeight = weightKg !== undefined ? weightKg : current?.weightKg;

  if (!done) {
    return {
      done: false,
      weightKg: resolvedWeight
    };
  }

  // Série CONCLUÍDA (done: true)
  const primary = exercise.machines.primary;
  const activeVariantId = exercise.activeVariantId || primary.variantId;
  const activeEquipmentName = primary.equipmentName || primary.name || exercise.name;
  const activeExerciseName = exercise.name;
  const activeReps = primary.reps || exercise.reps;

  return {
    done: true,
    weightKg: resolvedWeight,
    variantId: activeVariantId,
    equipmentName: activeEquipmentName,
    exerciseName: activeExerciseName,
    reps: activeReps,
    completedAt: current?.completedAt || new Date().toISOString()
  };
}

/**
 * Calcula a chave canônica de semana ISO-8601 (YYYY-Www).
 * Segue estritamente a especificação ISO: a semana começa na segunda-feira e a primeira semana
 * do ano é aquela que contém a primeira quinta-feira de janeiro (pelo menos 4 dias no ano novo).
 * Elimina colisões de dias de meses diferentes que o método antigo (dia/7) provocava.
 */
export function getIsoWeekKey(dateInput: Date | string | number = new Date()): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return getIsoWeekKey(new Date());
  }

  // Cria cópia em meio-dia UTC para eliminar distorções de fuso horário / DST
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
  // ISO-8601: Segunda-feira = 1, Domingo = 7
  const dayNr = ((target.getUTCDay() + 6) % 7) + 1;
  // Ajusta a data para a quinta-feira da mesma semana
  target.setUTCDate(target.getUTCDate() - dayNr + 4);
  const isoYear = target.getUTCFullYear();
  // 1º de Janeiro do ano ISO
  const firstJan = new Date(Date.UTC(isoYear, 0, 1, 12, 0, 0));
  const dayDifference = Math.floor((target.getTime() - firstJan.getTime()) / 86400000);
  const weekNumber = 1 + Math.floor(dayDifference / 7);

  return `${isoYear}-W${String(weekNumber).padStart(2, '0')}`;
}
