/**
 * HIT-FIT 2.0 | Centralizador Único de Biometria e Parâmetros de Atleta (Single Source of Truth)
 * Sincroniza em tempo real:
 * - Altura em metros (com digitação livre 1,78 ou 1.78 e normalização sem distorção)
 * - Peso atual e histórico de pesagens
 * - Meta de peso e objetivo
 * - Data de nascimento e cálculo exato de idade civil (sem erro UTC)
 * - Hidratação diária recomendada (38 ml/kg)
 * - Sincronização entre abas (Início, Treino, Saúde, Evolução, Perfil) e nuvem
 */

import { calculateAge } from './auth-crypto.ts';
import type { AuthenticatedUser } from './auth-client.ts';
import { updateAthleteProfile, setStoredUser } from './auth-client.ts';
import type { UserBioProfile } from './nutrition.ts';

export interface ParsedHeight {
  cm: number | null;
  meters: number | null;
  displayMeters: string;
  displayFull: string;
}

/**
 * Normaliza qualquer entrada de altura para metros (ex: 1.78) e centímetros (ex: 178)
 * Suporta: "1,78", "1.78", 1.78, "178", 178, etc.
 */
export function parseHeight(input: string | number | null | undefined): ParsedHeight {
  if (input === null || input === undefined || input === '') {
    return { cm: null, meters: null, displayMeters: '', displayFull: '-- m' };
  }

  const str = String(input).trim().replace(',', '.');
  const num = parseFloat(str);

  if (isNaN(num) || num <= 0) {
    return { cm: null, meters: null, displayMeters: '', displayFull: '-- m' };
  }

  // Se o usuário digitou em centímetros (ex: 178 ou 175)
  if (num > 3) {
    const cm = Math.round(num);
    const meters = Math.round(cm) / 100;
    const displayMeters = meters.toFixed(2).replace('.', ',');
    return {
      cm,
      meters,
      displayMeters,
      displayFull: `${displayMeters} m`
    };
  }

  // Se o usuário digitou em metros (ex: 1.78 ou 1.7)
  const meters = Math.round(num * 100) / 100;
  const cm = Math.round(meters * 100);
  const displayMeters = meters.toFixed(2).replace('.', ',');
  return {
    cm,
    meters,
    displayMeters,
    displayFull: `${displayMeters} m`
  };
}

/**
 * Formata altura em padrão brasileiro (ex: "1,78 m")
 */
export function formatHeight(cmOrMeters: number | null | undefined): string {
  if (!cmOrMeters || cmOrMeters <= 0) return '-- m';
  const parsed = parseHeight(cmOrMeters);
  return parsed.displayFull;
}

/**
 * Formata peso em padrão brasileiro (ex: "97 kg" ou "97,5 kg")
 */
export function formatWeight(kg: number | null | undefined): string {
  if (kg === null || kg === undefined || isNaN(kg) || kg <= 0) return '-- kg';
  const rounded = Math.round(kg * 10) / 10;
  const str = String(rounded).replace('.', ',');
  return `${str} kg`;
}

export interface UnifiedBiometrics {
  profileId: string;
  athleteName: string;
  gender: 'male' | 'female';
  birthDate: string;
  age: number;
  heightCm: number;
  heightMeters: number;
  currentWeightKg: number;
  initialWeightKg: number;
  targetWeightKg: number;
  goal: 'fat_loss' | 'recomp' | 'hypertrophy';
  activityLevel: string;
  waterGoalMl: number;
}

const BIOMETRICS_EVENT = 'hitfit:biometrics-updated';

/**
 * Carrega a biometria unificada do atleta prioritizando a sessão ativa e o cache local
 */
export function getUnifiedBiometrics(
  profileId: string,
  currentUser?: AuthenticatedUser | null
): UnifiedBiometrics {
  const isJack = profileId === 'person-geicsania' || profileId.toLowerCase().includes('jack');
  const defaultName = isJack ? 'Jack' : 'Rangel';
  const defaultGender: 'male' | 'female' = isJack ? 'female' : 'male';
  const defaultGoal = isJack ? 'recomp' : 'fat_loss';

  let cachedBio: Partial<UserBioProfile> = {};
  let cachedWeight = 0;
  let cachedGoalWeight = 0;

  if (typeof window !== 'undefined') {
    try {
      const bioRaw = localStorage.getItem(`hitfit-bio-${profileId}`);
      if (bioRaw) cachedBio = JSON.parse(bioRaw);
    } catch {}

    try {
      cachedWeight = Number(localStorage.getItem(`hitfit-weight-${profileId}`) || 0);
    } catch {}

    try {
      cachedGoalWeight = Number(localStorage.getItem(`hitfit-goal-weight-${profileId}`) || 0);
    } catch {}
  }

  // Se este perfil for o do usuário logado, seus dados têm prioridade de autoridade
  const isSelf = currentUser && (
    currentUser.id === profileId ||
    (isJack && (currentUser.username === 'jack' || currentUser.id === 'person-geicsania')) ||
    (!isJack && (currentUser.username === 'rangel' || currentUser.id === 'person-rangel'))
  );

  const birthDate = (isSelf && currentUser?.birthDate) || (cachedBio as { birthDate?: string })?.birthDate || '';
  const age = birthDate ? calculateAge(birthDate) : (cachedBio.age || (isSelf ? currentUser?.age : 0) || 0);

  const initialWeight = (isSelf && currentUser?.initialWeightKg) || cachedBio.weightKg || 0;
  const currentWeight = (isSelf && currentUser?.currentWeightKg) || cachedWeight || initialWeight || 0;

  const heightCmRaw = (isSelf && currentUser?.heightCm) || cachedBio.heightCm || 0;
  const parsedHeight = parseHeight(heightCmRaw);
  const heightCm = parsedHeight.cm || 0;
  const heightMeters = parsedHeight.meters || 0;

  const targetWeight = (isSelf && currentUser?.targetWeightKg) || cachedGoalWeight || (cachedBio.targetWeightKg || 0);

  const goal = (cachedBio.goal as 'fat_loss' | 'recomp' | 'hypertrophy') || defaultGoal;
  const activityLevel = (isSelf && currentUser?.activityLevel) || 'Moderado (3-4x por semana)';

  const waterGoalMl = currentWeight > 0
    ? Math.max(2000, Math.round(currentWeight * 38))
    : 2500;

  return {
    profileId,
    athleteName: (isSelf && currentUser?.name) || defaultName,
    gender: defaultGender,
    birthDate,
    age,
    heightCm,
    heightMeters,
    currentWeightKg: currentWeight,
    initialWeightKg: initialWeight,
    targetWeightKg: targetWeight,
    goal,
    activityLevel,
    waterGoalMl
  };
}

export interface SaveBiometricsResult {
  success: boolean;
  biometrics: UnifiedBiometrics;
  user?: AuthenticatedUser | null;
  error?: string;
  offline?: boolean;
}

const SYNC_QUEUE_KEY = 'hitfit_pending_sync_queue';

export function queuePendingSync(profileId: string, data: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push({
      profileId,
      data,
      queuedAt: new Date().toISOString()
    });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

export function getPendingSyncCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    return Array.isArray(queue) ? queue.length : 0;
  } catch {
    return 0;
  }
}

function applyLocalBiometricsCache(profileId: string, updated: UnifiedBiometrics): void {
  if (typeof window === 'undefined') return;
  try {
    const bioPayload: UserBioProfile & { birthDate?: string } = {
      name: updated.athleteName,
      gender: updated.gender,
      weightKg: updated.currentWeightKg,
      heightCm: updated.heightCm,
      age: updated.age,
      birthDate: updated.birthDate,
      targetWeightKg: updated.targetWeightKg,
      goal: updated.goal,
      activityFactor: 1.55,
      customDailyDeficit: updated.goal === 'fat_loss' ? 450 : 350,
      waterGoalMl: updated.waterGoalMl
    };
    localStorage.setItem(`hitfit-bio-${profileId}`, JSON.stringify(bioPayload));

    if (updated.currentWeightKg > 0) {
      localStorage.setItem(`hitfit-weight-${profileId}`, String(updated.currentWeightKg));
    }

    if (updated.targetWeightKg > 0) {
      localStorage.setItem(`hitfit-goal-weight-${profileId}`, String(updated.targetWeightKg));
      localStorage.setItem(
        `hitfit-goal-${profileId}`,
        JSON.stringify({
          initialWeightKg: updated.initialWeightKg,
          targetWeightKg: updated.targetWeightKg,
          objective: updated.goal,
          updatedAt: new Date().toISOString()
        })
      );
    }
  } catch {}

  window.dispatchEvent(
    new CustomEvent(BIOMETRICS_EVENT, {
      detail: { profileId, biometrics: updated }
    })
  );
}

/**
 * Salva e sincroniza os dados biométricos com confirmação de persistência durável no servidor.
 * Desacopla peso atual, peso inicial e meta. Não injeta pesagens artificiais.
 */
export async function saveUnifiedBiometrics(
  profileId: string,
  data: {
    birthDate?: string;
    weightKg?: number | null;
    currentWeightKg?: number | null;
    initialWeightKg?: number | null;
    heightCm?: number | null;
    heightMeters?: number | null;
    targetWeightKg?: number | null;
    goal?: string;
    activityLevel?: string;
    avatarBase64?: string | null;
    weightHistory?: Array<{ id: string; date: string; weightKg: number; notes?: string }>;
  },
  currentUser?: AuthenticatedUser | null,
  onUserUpdated?: (user: AuthenticatedUser) => void
): Promise<SaveBiometricsResult> {
  const current = getUnifiedBiometrics(profileId, currentUser);

  // Normalização de altura se fornecida
  let nextHeightCm = current.heightCm;
  if (data.heightCm !== undefined && data.heightCm !== null) {
    nextHeightCm = parseHeight(data.heightCm).cm || current.heightCm;
  } else if (data.heightMeters !== undefined && data.heightMeters !== null) {
    nextHeightCm = parseHeight(data.heightMeters).cm || current.heightCm;
  }

  // Desacoplamento estrito de peso:
  // - initialWeightKg: só atualiza se explicitamente informado (ex: cadastro inicial)
  // - currentWeightKg: atualiza quando uma pesagem é informada
  // - targetWeightKg: atualiza quando a meta é ajustada, sem sobrescrever initialWeightKg
  const nextInitialWeight = data.initialWeightKg !== undefined && data.initialWeightKg !== null
    ? data.initialWeightKg
    : current.initialWeightKg;

  const nextCurrentWeight = data.currentWeightKg !== undefined && data.currentWeightKg !== null
    ? data.currentWeightKg
    : (data.weightKg !== undefined && data.weightKg !== null ? data.weightKg : current.currentWeightKg);

  const nextTargetWeight = data.targetWeightKg !== undefined && data.targetWeightKg !== null
    ? data.targetWeightKg
    : current.targetWeightKg;

  // Normalização de data de nascimento e idade civil
  const nextBirthDate = data.birthDate !== undefined ? data.birthDate : current.birthDate;
  const nextAge = nextBirthDate ? calculateAge(nextBirthDate) : current.age;

  const nextGoal = (data.goal as 'fat_loss' | 'recomp' | 'hypertrophy') || current.goal;
  const nextActivity = data.activityLevel || current.activityLevel;
  const nextWater = nextCurrentWeight > 0 ? Math.max(2000, Math.round(nextCurrentWeight * 38)) : current.waterGoalMl;

  const updated: UnifiedBiometrics = {
    ...current,
    birthDate: nextBirthDate,
    age: nextAge,
    heightCm: nextHeightCm,
    heightMeters: parseHeight(nextHeightCm).meters || 0,
    currentWeightKg: nextCurrentWeight,
    initialWeightKg: nextInitialWeight,
    targetWeightKg: nextTargetWeight,
    goal: nextGoal,
    activityLevel: nextActivity,
    waterGoalMl: nextWater
  };

  const isSelf = currentUser && (
    currentUser.id === profileId ||
    (profileId === 'person-geicsania' && currentUser.username === 'jack') ||
    (profileId === 'person-rangel' && currentUser.username === 'rangel')
  );

  let updatedUser: AuthenticatedUser | undefined;

  // 1. Se autenticado, confirma no servidor PRIMEIRO antes de consolidar localmente
  if (isSelf && currentUser) {
    const res = await updateAthleteProfile({
      userId: currentUser.id,
      birthDate: updated.birthDate,
      initialWeightKg: updated.initialWeightKg > 0 ? updated.initialWeightKg : null,
      currentWeightKg: updated.currentWeightKg > 0 ? updated.currentWeightKg : null,
      targetWeightKg: updated.targetWeightKg > 0 ? updated.targetWeightKg : null,
      heightCm: updated.heightCm > 0 ? updated.heightCm : null,
      goal: updated.goal,
      activityLevel: updated.activityLevel,
      avatarBase64: data.avatarBase64,
      weightHistory: data.weightHistory
    });

    if (!res.success) {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      if (isOffline) {
        queuePendingSync(profileId, data);
        applyLocalBiometricsCache(profileId, updated);
        return {
          success: true,
          offline: true,
          biometrics: updated,
          user: currentUser
        };
      }

      // Rejeição ou erro do servidor: propaga o erro explicitamente
      return {
        success: false,
        biometrics: current,
        error: res.error || 'O servidor rejeitou a gravação dos dados biométricos.'
      };
    }

    if (res.user) {
      updatedUser = res.user;
      setStoredUser(res.user);
      onUserUpdated?.(res.user);
    }
  }

  // 2. Com a confirmação do servidor (ou sem sessão ativa), aplica o cache local e emite o evento
  applyLocalBiometricsCache(profileId, updated);

  return {
    success: true,
    biometrics: updated,
    user: updatedUser || currentUser || null
  };
}

export { BIOMETRICS_EVENT };
