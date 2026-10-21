"use client";

import React, { useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import { WORKOUT_DAYS, Exercise, DayWorkout } from '@/lib/workout-data';
import { ExerciseDetailModal } from '@/components/exercise-detail-modal';
import { HealthHubView, HealthSubTab } from '@/components/health-hub-view';
import { EvolutionView } from '@/components/evolution-view';
import { ProfileView } from '@/components/profile-view';
import { HomeSummaryView } from '@/components/home-summary-view';
import { AthleteSwitcher } from '@/components/athlete-switcher';
import { KineticWeekRibbon } from '@/components/kinetic-week-ribbon';
import { GuidedWorkoutView, SkippedExerciseRecord } from '@/components/guided-workout-view';
import { WorkoutCockpit, MainTabType } from '@/components/workout-cockpit';
import { WatchModal } from '@/components/watch-modal';
import { WorkoutCompletedModal } from '@/components/workout-completed-modal';
import { AuthLoginView } from '@/components/auth-login-view';
import { FirstAccessModal } from '@/components/first-access-modal';
import { getAvatar } from '@/lib/avatar-storage';
import {
  AuthenticatedUser,
  getStoredUser,
  checkSession,
  logoutAthlete,
  pushSyncData
} from '@/lib/auth-client';
import {
  getUnifiedBiometrics,
  saveUnifiedBiometrics,
  BIOMETRICS_EVENT,
  UnifiedBiometrics
} from '@/lib/biometrics';
import { Dumbbell, Shield, LogOut, Watch, Lock } from 'lucide-react';

interface SavedSetState {
  done: boolean;
  weightKg?: string;
}

const PEOPLE_CONFIG = [
  { id: 'person-rangel', name: 'Rangel' },
  { id: 'person-geicsania', name: 'Jack' }
];

function getInitialDayIndex(): number {
  if (typeof window === 'undefined') return 0;
  const today = new Date();
  return Math.min(4, Math.max(0, today.getDay() === 0 ? 0 : today.getDay() - 1));
}

function getInitialWeek(): string {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return `${startOfWeek.getFullYear()}-W${Math.ceil(startOfWeek.getDate() / 7)}`;
}

export default function Home() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Autenticação Real e Sessão Persistente
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => {
    if (typeof window !== 'undefined') {
      return getStoredUser();
    }
    return null;
  });
  const [authChecking, setAuthChecking] = useState(true);

  // Perfil atualmente visualizado (pode ser o próprio ou o parceiro em modo leitura)
  const [activeProfile, setActiveProfile] = useState<string>(() => {
    return currentUser?.id || 'person-rangel';
  });

  const [dayIndex, setDayIndex] = useState<number>(getInitialDayIndex);
  const [viewTab, setViewTab] = useState<MainTabType>('inicio');
  const [healthSubTab, setHealthSubTab] = useState<HealthSubTab>('alimentacao');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const [workouts] = useState<DayWorkout[]>(WORKOUT_DAYS);
  const [savedSets, setSavedSets] = useState<Record<string, SavedSetState>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('hitfit-progress-v2');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return {};
  });
  const [currentWeek] = useState<string>(getInitialWeek);
  const [avatars, setAvatars] = useState<Record<string, string | null>>({});

  // Cronômetros e Telemetria de Treino
  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutSeconds, setWorkoutSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(60);
  const [restActive, setRestActive] = useState(false);
  const [restEndTime, setRestEndTime] = useState(0);

  // Modais
  const [completedModalOpen, setCompletedModalOpen] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<{
    completedExercisesCount: number;
    skippedExercises: SkippedExerciseRecord[];
    totalWeightVolumeKg: number;
    durationSeconds: number;
    completedSets: number;
    totalSets: number;
  } | null>(null);

  const [watchModalOpen, setWatchModalOpen] = useState(false);
  const [watchCalories, setWatchCalories] = useState<number>(0); // Zerado por padrão real
  const [watchHeartRate, setWatchHeartRate] = useState<number>(135);
  const [bleConnected, setBleConnected] = useState(false);
  const [bleDeviceName, setBleDeviceName] = useState<string | null>(null);

  // Checagem de Sessão Real no Backend
  useEffect(() => {
    if (!isClient) return;
    checkSession()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
          setActiveProfile(user.id);
        }
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, [isClient]);

  // Carrega avatares do IndexedDB
  const refreshAvatars = useCallback(() => {
    PEOPLE_CONFIG.forEach((p) => {
      getAvatar(p.id).then((url) => {
        setAvatars((prev) => ({ ...prev, [p.id]: url }));
      });
    });
  }, []);

  useEffect(() => {
    refreshAvatars();
  }, [refreshAvatars]);

  // Persistência local segura
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem('hitfit-progress-v2', JSON.stringify(savedSets));
      if (watchCalories > 0) {
        localStorage.setItem(`hitfit-watch-cals-${activeProfile}`, watchCalories.toString());
      }
    } catch {}
  }, [savedSets, watchCalories, activeProfile, isClient]);

  // Timer de treino
  useEffect(() => {
    if (!workoutActive) return;
    const interval = setInterval(() => setWorkoutSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [workoutActive]);

  // Timer de descanso
  useEffect(() => {
    if (!restActive) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((restEndTime - Date.now()) / 1000));
      setRestSeconds(remaining);
      if (remaining === 0) {
        setRestActive(false);
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 300]);
        }
      }
    }, 250);
    return () => clearInterval(interval);
  }, [restActive, restEndTime]);

  const currentPerson = PEOPLE_CONFIG.find((p) => p.id === activeProfile) || PEOPLE_CONFIG[0];
  const isJack = currentPerson.name.toLowerCase().includes('jack') || currentPerson.id === 'person-geicsania';
  const accentColor = isJack ? '#FF267A' : '#C4F53C';
  const todayWorkout = workouts[dayIndex] || WORKOUT_DAYS[dayIndex];

  // REGRA DE SEGURANÇA E AUTORIZAÇÃO:
  // Apenas o usuário autenticado pode alterar seus próprios dados.
  // Visualizar o cônjuge ativa o modo estritamente Somente Leitura (Read-Only).
  const isReadOnly = currentUser ? activeProfile !== currentUser.id : true;

  const getSetKey = useCallback(
    (dayIdx: number, exerciseId: string, setIdx: number) =>
      `${currentWeek}:${activeProfile}:${dayIdx}:${exerciseId}:${setIdx}`,
    [currentWeek, activeProfile]
  );

  const startRest = useCallback((seconds: number) => {
    setRestSeconds(seconds);
    setRestEndTime(Date.now() + seconds * 1000);
    setRestActive(true);
  }, []);

  const toggleSet = (exerciseId: string, setIdx: number) => {
    if (isReadOnly) return;
    const key = getSetKey(dayIndex, exerciseId, setIdx);
    setSavedSets((prev) => {
      const current = prev[key] || { done: false };
      const nextDone = !current.done;
      const updated = { ...prev, [key]: { ...current, done: nextDone } };
      
      // Sincroniza com a nuvem
      if (currentUser) {
        pushSyncData({ userId: currentUser.id, savedSets: updated });
      }
      return updated;
    });
    startRest(60);
  };

  const updateSetWeight = (exerciseId: string, setIdx: number, weightKg: string) => {
    if (isReadOnly) return;
    const key = getSetKey(dayIndex, exerciseId, setIdx);
    setSavedSets((prev) => {
      const current = prev[key] || { done: false };
      const updated = { ...prev, [key]: { ...current, weightKg } };
      if (currentUser) {
        pushSyncData({ userId: currentUser.id, savedSets: updated });
      }
      return updated;
    });
  };

  const handleFinishGuidedWorkout = (summary: {
    completedExercisesCount: number;
    skippedExercises: SkippedExerciseRecord[];
    totalWeightVolumeKg: number;
    durationSeconds: number;
    completedSets: number;
    totalSets: number;
  }) => {
    const sessionRecord = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      workoutTitle: todayWorkout.title,
      durationSeconds: summary.durationSeconds,
      completedSets: summary.completedSets,
      totalSets: summary.totalSets,
      completedExercisesCount: summary.completedExercisesCount,
      skippedExercises: summary.skippedExercises,
      totalWeightVolumeKg: summary.totalWeightVolumeKg,
      caloriesEstimated: watchCalories || Math.round(summary.durationSeconds * 0.12)
    };

    try {
      const historyKey = `hitfit-history-${activeProfile}`;
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
      existing.unshift(sessionRecord);
      localStorage.setItem(historyKey, JSON.stringify(existing.slice(0, 30)));

      if (currentUser && !isReadOnly) {
        pushSyncData({
          userId: currentUser.id,
          workoutHistory: existing.slice(0, 30)
        });
      }
    } catch {}

    setWorkoutActive(false);
    setCompletedSummary(summary);
    setCompletedModalOpen(true);
  };

  const connectBluetoothWatch = async () => {
    interface NavigatorBLE {
      bluetooth?: {
        requestDevice: (options: { filters: { services: string[] }[] }) => Promise<{ name?: string }>;
      };
    }
    const nav = typeof navigator !== 'undefined' ? (navigator as unknown as NavigatorBLE) : null;
    if (nav?.bluetooth) {
      try {
        const device = await nav.bluetooth.requestDevice({
          filters: [{ services: ['heart_rate'] }]
        });
        setBleDeviceName(device.name || 'Monitor Cardíaco BLE');
        setBleConnected(true);
      } catch {
        alert('Para pareamento BLE nativo, utilize Google Chrome ou Edge no Android/PC.');
      }
    } else {
      alert('Seu navegador atual não suporta Web Bluetooth nativo. Registre os dados manualmente no campo do relógio.');
    }
  };

  const handleLogout = () => {
    logoutAthlete();
    setCurrentUser(null);
  };

  // Biometria Unificada com Sincronização em Tempo Real (Single Source of Truth)
  const [, setBioVersion] = useState(0);

  useEffect(() => {
    const handleBiometricsChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ profileId: string; biometrics: UnifiedBiometrics }>;
      if (customEvent.detail?.profileId === activeProfile) {
        setBioVersion((v) => v + 1);
      }
    };
    window.addEventListener(BIOMETRICS_EVENT, handleBiometricsChange);
    return () => window.removeEventListener(BIOMETRICS_EVENT, handleBiometricsChange);
  }, [activeProfile]);

  const athleteBio = getUnifiedBiometrics(activeProfile, currentUser);

  // Leitura de Água e Peso Reais (sem valores predefinidos fictícios)
  const todayDate = new Date().toISOString().split('T')[0];
  const waterConsumedToday = isClient
    ? Number(localStorage.getItem(`hitfit-water-${todayDate}-${activeProfile}`) || 0)
    : 0;
  const currentWeightToday = athleteBio.currentWeightKg;
  const targetWeightToday = athleteBio.targetWeightKg;

  if (!isClient || authChecking) {
    return (
      <main className="min-h-screen bg-[#07090C] text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Dumbbell className="w-8 h-8 text-[#C4F53C] animate-spin" />
          <p className="text-sm font-bold tracking-tight text-neutral-400">Autenticando no HIT-FIT DUO PRO…</p>
        </div>
      </main>
    );
  }

  // TELA DE LOGIN PREMIUM (SEM FORMULÁRIO DE BIOMETRIA PRÉVIO)
  if (!currentUser) {
    return (
      <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#07090C] text-neutral-100 flex items-center justify-center p-4 selection:bg-[#C4F53C]/30">
        <AuthLoginView
          onAuthenticated={(user) => {
            setCurrentUser(user);
            setActiveProfile(user.id);
            refreshAvatars();
          }}
        />
      </main>
    );
  }

  // PRIMEIRO ACESSO APÓS O LOGIN (CONFIGURAÇÃO DE BIOMETRIA INDIVIDUAL SE INCOMPLETO)
  if (currentUser.needsProfileSetup) {
    return (
      <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#07090C] text-neutral-100 flex items-center justify-center p-4 selection:bg-[#C4F53C]/30">
        <FirstAccessModal
          user={currentUser}
          onCompleted={(updatedUser) => {
            setCurrentUser(updatedUser);
            refreshAvatars();
          }}
        />
      </main>
    );
  }

  const totalSetsToday = todayWorkout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSetsToday = todayWorkout.exercises.reduce((sum, ex) => {
    let completed = 0;
    for (let s = 0; s < ex.sets; s++) {
      if (savedSets[getSetKey(dayIndex, ex.id, s)]?.done) completed++;
    }
    return sum + completed;
  }, 0);
  const progressPct = Math.round((completedSetsToday / Math.max(1, totalSetsToday)) * 100);

  return (
    <div className="min-h-screen w-full max-w-full bg-[#07090C] text-neutral-100 flex flex-col items-center overflow-x-hidden selection:bg-[#C4F53C]/30">
      <div className="w-full max-w-lg min-h-screen flex flex-col px-4 pt-3 pb-[max(8.5rem,calc(env(safe-area-inset-bottom)+7.5rem))] overflow-x-hidden">
        
        {/* HEADER: STATUS DE AUTENTICAÇÃO E ATLETA */}
        <header className="flex items-center justify-between py-3 border-b border-white/[0.06] mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg border"
              style={{
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}40`,
                color: accentColor
              }}
            >
              <Dumbbell size={18} />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight text-white block">
                  HIT-FIT DUO PRO
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                <Shield size={10} style={{ color: accentColor }} />
                Logado: <strong className="text-white">{currentUser.name}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setWatchModalOpen(true)}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white tap-haptic"
              title="Smartwatch"
            >
              <Watch size={16} />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 tap-haptic"
              title="Encerrar Sessão"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* ALERTA DE MODO SOMENTE LEITURA QUANDO VISUALIZANDO CÔNJUGE */}
        {isReadOnly && (
          <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <Lock size={14} className="shrink-0 text-amber-400" />
              <span>
                Visualizando perfil de <strong>{currentPerson.name}</strong> (Modo Leitura).
              </span>
            </div>
            <button
              onClick={() => setActiveProfile(currentUser.id)}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 font-bold text-[10px] font-mono text-amber-200 tap-haptic"
            >
              Meu Perfil
            </button>
          </div>
        )}

        {/* SWITCHER DE ATLETAS (NÃO ALTERA A IDENTIDADE AUTENTICADA) */}
        <div className="mb-4">
          <AthleteSwitcher
            people={PEOPLE_CONFIG}
            activeProfileId={activeProfile}
            onSelectProfile={setActiveProfile}
            avatars={avatars}
          />
        </div>

        {/* ABA 1: INÍCIO */}
        {viewTab === 'inicio' && (
          <HomeSummaryView
            athleteName={currentPerson.name}
            avatarUrl={avatars[activeProfile] || null}
            accentColor={accentColor}
            todayWorkout={todayWorkout}
            progressPct={progressPct}
            completedSets={completedSetsToday}
            totalSets={totalSetsToday}
            waterConsumedMl={waterConsumedToday}
            waterGoalMl={athleteBio.waterGoalMl}
            currentWeightKg={currentWeightToday}
            targetWeightKg={targetWeightToday}
            onOpenWorkout={() => setViewTab('treino')}
            onOpenHealthSubTab={(sub) => {
              setHealthSubTab(sub);
              setViewTab('saude');
            }}
            onOpenProfile={() => setViewTab('perfil')}
          />
        )}

        {/* ABA 2: TREINO GUIADO SEQUENCIAL (1 EXERCÍCIO POR VEZ) */}
        {viewTab === 'treino' && (
          <div className="flex flex-col gap-3">
            <KineticWeekRibbon
              days={workouts}
              activeDayIndex={dayIndex}
              onSelectDay={setDayIndex}
              accentColor={accentColor}
              isDayCompleted={(dIdx) => {
                const day = workouts[dIdx];
                if (!day || !day.exercises.length) return false;
                return day.exercises.every((ex) => {
                  for (let s = 0; s < ex.sets; s++) {
                    if (!savedSets[getSetKey(dIdx, ex.id, s)]?.done) return false;
                  }
                  return true;
                });
              }}
            />

            <GuidedWorkoutView
              workout={todayWorkout}
              athleteName={currentPerson.name}
              accentColor={accentColor}
              isReadOnly={isReadOnly}
              workoutActive={workoutActive}
              workoutSeconds={workoutSeconds}
              onToggleWorkout={() => setWorkoutActive((v) => !v)}
              onFinishWorkout={handleFinishGuidedWorkout}
              onStartRest={startRest}
              savedSets={savedSets}
              getSetKey={getSetKey}
              dayIndex={dayIndex}
              onToggleSet={toggleSet}
              onUpdateSetWeight={updateSetWeight}
              onOpenDetailModal={setSelectedExercise}
            />
          </div>
        )}

        {/* ABA 3: SAÚDE & NUTRIÇÃO */}
        {viewTab === 'saude' && (
          <HealthHubView
            profileId={activeProfile}
            athleteName={currentPerson.name}
            accentColor={accentColor}
            todayWorkoutCaloriesBurned={watchCalories}
            initialSubTab={healthSubTab}
            currentWeightKg={currentWeightToday}
            isReadOnly={isReadOnly}
            currentUser={currentUser}
            onUserUpdated={(u) => setCurrentUser(u)}
            onWeightUpdated={(w) => {
              saveUnifiedBiometrics(
                activeProfile,
                { currentWeightKg: w, weightKg: w },
                currentUser,
                (u) => setCurrentUser(u)
              );
            }}
          />
        )}

        {/* ABA 4: EVOLUÇÃO */}
        {viewTab === 'evolucao' && (
          <EvolutionView
            profileId={activeProfile}
            profileName={currentPerson.name}
            currentWeek={currentWeek}
            savedSets={savedSets}
            accentColor={accentColor}
          />
        )}

        {/* ABA 5: PERFIL */}
        {viewTab === 'perfil' && (
          <ProfileView
            profileId={activeProfile}
            athleteName={currentPerson.name}
            accentColor={accentColor}
            isReadOnly={isReadOnly}
            people={PEOPLE_CONFIG}
            currentWeek={currentWeek}
            savedSets={savedSets}
            currentUser={currentUser}
            onUserUpdated={(u) => setCurrentUser(u)}
            onAvatarUpdated={refreshAvatars}
            onLogout={handleLogout}
          />
        )}

      </div>

      {/* MODAL BIOMECÂNICO 2D */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          accentColor={accentColor}
          onClose={() => setSelectedExercise(null)}
          onSwapExercise={() => {}}
        />
      )}

      {/* MODAL DE SMARTWATCH */}
      <WatchModal
        isOpen={watchModalOpen}
        onClose={() => setWatchModalOpen(false)}
        athleteName={currentPerson.name}
        accentColor={accentColor}
        watchCalories={watchCalories}
        onUpdateCalories={setWatchCalories}
        watchHeartRate={watchHeartRate}
        onUpdateHeartRate={setWatchHeartRate}
        bleConnected={bleConnected}
        bleDeviceName={bleDeviceName}
        onConnectBle={connectBluetoothWatch}
      />

      {/* MODAL DE TREINO CONCLUÍDO (RESUMO REAL SEM PULADOS) */}
      <WorkoutCompletedModal
        isOpen={completedModalOpen}
        onClose={() => setCompletedModalOpen(false)}
        athleteName={currentPerson.name}
        workoutTitle={todayWorkout.title}
        workoutSeconds={completedSummary?.durationSeconds || workoutSeconds}
        completedSets={completedSummary?.completedSets || completedSetsToday}
        totalSets={completedSummary?.totalSets || totalSetsToday}
        accentColor={accentColor}
        completedExercisesCount={completedSummary?.completedExercisesCount}
        totalExercisesCount={todayWorkout.exercises.length}
        skippedExercises={completedSummary?.skippedExercises}
        totalWeightVolumeKg={completedSummary?.totalWeightVolumeKg}
        caloriesBurned={watchCalories || Math.round((completedSummary?.durationSeconds || workoutSeconds) * 0.12)}
      />

      {/* CONSOLE FLUTUANTE INFERIOR COCKPIT */}
      <WorkoutCockpit
        workoutActive={workoutActive}
        workoutSeconds={workoutSeconds}
        onToggleWorkout={() => setWorkoutActive((v) => !v)}
        restActive={restActive}
        restSeconds={restSeconds}
        onStartRest={startRest}
        accentColor={accentColor}
        canFinishWorkout={workoutSeconds > 0 || completedSetsToday > 0}
        onFinishWorkout={() => {
          handleFinishGuidedWorkout({
            completedExercisesCount: todayWorkout.exercises.length,
            skippedExercises: [],
            totalWeightVolumeKg: 0,
            durationSeconds: workoutSeconds,
            completedSets: completedSetsToday,
            totalSets: totalSetsToday
          });
        }}
        viewTab={viewTab}
        onSelectTab={setViewTab}
      />
    </div>
  );
}
