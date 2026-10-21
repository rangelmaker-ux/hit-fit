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

  const initialWeight = (isSelf && currentUser?.initialWeightKg) || cachedBio.weightKg || cachedWeight || 0;
  const currentWeight = cachedWeight > 0 ? cachedWeight : initialWeight;

  const heightCmRaw = (isSelf && currentUser?.heightCm) || cachedBio.heightCm || 0;
  const parsedHeight = parseHeight(heightCmRaw);
  const heightCm = parsedHeight.cm || 0;
  const heightMeters = parsedHeight.meters || 0;

  const targetWeight = cachedGoalWeight > 0
    ? cachedGoalWeight
    : (cachedBio.targetWeightKg || 0);

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

/**
 * Salva e sincroniza os dados biométricos em TODAS as camadas (localStorage, sessão, nuvem e eventos)
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
  },
  currentUser?: AuthenticatedUser | null,
  onUserUpdated?: (user: AuthenticatedUser) => void
): Promise<UnifiedBiometrics> {
  const current = getUnifiedBiometrics(profileId, currentUser);

  // Normalização de altura se fornecida
  let nextHeightCm = current.heightCm;
  if (data.heightCm !== undefined && data.heightCm !== null) {
    nextHeightCm = parseHeight(data.heightCm).cm || current.heightCm;
  } else if (data.heightMeters !== undefined && data.heightMeters !== null) {
    nextHeightCm = parseHeight(data.heightMeters).cm || current.heightCm;
  }

  // Normalização de peso
  const nextCurrentWeight = data.currentWeightKg ?? data.weightKg ?? current.currentWeightKg;
  const nextInitialWeight = data.initialWeightKg ?? (current.initialWeightKg > 0 ? current.initialWeightKg : nextCurrentWeight);
  const nextTargetWeight = data.targetWeightKg !== undefined ? (data.targetWeightKg || 0) : current.targetWeightKg;

  // Normalização de data de nascimento e idade
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

  // 1. Atualiza chaves no LocalStorage
  if (typeof window !== 'undefined') {
    try {
      // Bio para Nutrição e Perfil
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

      // Peso para Home e Rastreadores
      if (updated.currentWeightKg > 0) {
        localStorage.setItem(`hitfit-weight-${profileId}`, String(updated.currentWeightKg));
      }

      // Meta de peso
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

      // Histórico de peso: garante que há um registro inicial com a data de hoje se o histórico estiver vazio
      const historyKey = `hitfit-weight-history-${profileId}`;
      const existingHistoryRaw = localStorage.getItem(historyKey);
      let history = existingHistoryRaw ? JSON.parse(existingHistoryRaw) : [];
      if (updated.currentWeightKg > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const hasToday = history.some((r: { date: string }) => r.date === todayStr);
        if (!hasToday) {
          history = [
            {
              id: `w-${Date.now()}`,
              date: todayStr,
              weightKg: updated.currentWeightKg,
              notes: 'Pesagem registrada'
            },
            ...history
          ];
          localStorage.setItem(historyKey, JSON.stringify(history));
        }
      }
    } catch {}

    // Dispara evento global para que todas as abas e componentes atualizem seus estados imediatamente
    window.dispatchEvent(
      new CustomEvent(BIOMETRICS_EVENT, {
        detail: { profileId, biometrics: updated }
      })
    );
  }

  // 2. Se for o próprio atleta logado, sincroniza com o backend /api/auth e sessão
  const isSelf = currentUser && (
    currentUser.id === profileId ||
    (profileId === 'person-geicsania' && currentUser.username === 'jack') ||
    (profileId === 'person-rangel' && currentUser.username === 'rangel')
  );

  if (isSelf && currentUser) {
    try {
      const res = await updateAthleteProfile({
        userId: currentUser.id,
        birthDate: updated.birthDate,
        initialWeightKg: updated.initialWeightKg,
        heightCm: updated.heightCm,
        targetWeightKg: updated.targetWeightKg,
        goal: updated.goal,
        activityLevel: updated.activityLevel,
        avatarBase64: data.avatarBase64
      });

      if (res.success && res.user) {
        setStoredUser(res.user);
        onUserUpdated?.(res.user);
      }
    } catch {}
  }

  return updated;
}

export { BIOMETRICS_EVENT };
