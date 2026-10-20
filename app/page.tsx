"use client";

import React, { useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import { WORKOUT_DAYS, Exercise, DayWorkout } from '@/lib/workout-data';
import { ExerciseDetailModal } from '@/components/exercise-detail-modal';
import { NutritionView } from '@/components/nutrition-view';
import { DuoView } from '@/components/duo-view';
import { EvolutionView } from '@/components/evolution-view';
import { AthleteSwitcher } from '@/components/athlete-switcher';
import { KineticWeekRibbon } from '@/components/kinetic-week-ribbon';
import { HeroWorkoutCard } from '@/components/hero-workout-card';
import { ExerciseCardRow } from '@/components/exercise-card-row';
import { WorkoutCockpit } from '@/components/workout-cockpit';
import { WatchModal } from '@/components/watch-modal';
import { WorkoutCompletedModal } from '@/components/workout-completed-modal';
import { Dumbbell, Settings2, Watch, Flame } from 'lucide-react';

interface CoupleSetup {
  mode: 'solo' | 'couple';
  people: { id: string; name: string }[];
}

interface SavedSetState {
  done: boolean;
  weightKg?: string;
}

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

function getInitialConfig(): CoupleSetup {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('hitfit-setup-v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.people && parsed.people.length > 0) return parsed;
      }
    } catch {}
  }
  return {
    mode: 'couple',
    people: [
      { id: 'person-rangel', name: 'Rangel' },
      { id: 'person-geicsania', name: 'Geicsania' }
    ]
  };
}

function getInitialProfile(): string {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('hitfit-active-profile-v2');
      if (stored) return stored;
    } catch {}
  }
  return 'person-rangel';
}

function getInitialSavedSets(): Record<string, SavedSetState> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('hitfit-progress-v2');
      if (stored) return JSON.parse(stored);
    } catch {}
  }
  return {};
}

function getInitialWatchCalories(): number {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('hitfit-watch-cals-v2');
      if (stored) return Number(stored) || 420;
    } catch {}
  }
  return 420;
}

function getInitialWorkouts(): DayWorkout[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('hitfit-custom-workouts-v2');
      if (stored) return JSON.parse(stored);
    } catch {}
  }
  return WORKOUT_DAYS;
}

export default function Home() {
  const [config, setConfig] = useState<CoupleSetup>(getInitialConfig);
  const [profile, setProfile] = useState<string>(getInitialProfile);
  const [editingConfig, setEditingConfig] = useState(false);
  const [firstName, setFirstName] = useState(() => config.people[0]?.name || 'Rangel');
  const [secondName, setSecondName] = useState(() => config.people[1]?.name || 'Geicsania');

  const [dayIndex, setDayIndex] = useState<number>(getInitialDayIndex);
  const [viewTab, setViewTab] = useState<'treino' | 'nutricao' | 'evolucao' | 'duo'>('treino');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const [workouts, setWorkouts] = useState<DayWorkout[]>(getInitialWorkouts);
  const [savedSets, setSavedSets] = useState<Record<string, SavedSetState>>(getInitialSavedSets);
  const [currentWeek] = useState<string>(getInitialWeek);

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutSeconds, setWorkoutSeconds] = useState(0);

  const [restSeconds, setRestSeconds] = useState(60);
  const [restActive, setRestActive] = useState(false);
  const [restEndTime, setRestEndTime] = useState(0);

  const [completedModalOpen, setCompletedModalOpen] = useState(false);
  const [watchModalOpen, setWatchModalOpen] = useState(false);
  const [watchCalories, setWatchCalories] = useState<number>(getInitialWatchCalories);
  const [watchHeartRate, setWatchHeartRate] = useState<number>(135);
  const [bleConnected, setBleConnected] = useState(false);
  const [bleDeviceName, setBleDeviceName] = useState<string | null>(null);

  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem('hitfit-setup-v2', JSON.stringify(config));
      localStorage.setItem('hitfit-active-profile-v2', profile);
      localStorage.setItem('hitfit-progress-v2', JSON.stringify(savedSets));
      localStorage.setItem('hitfit-watch-cals-v2', watchCalories.toString());
      localStorage.setItem('hitfit-custom-workouts-v2', JSON.stringify(workouts));
    } catch {}
  }, [config, profile, savedSets, watchCalories, workouts, isClient]);

  useEffect(() => {
    if (!workoutActive) return;
    const interval = setInterval(() => setWorkoutSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [workoutActive]);

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

  const currentPerson = config.people.find((p) => p.id === profile) || config.people[0];
  const isGeicsania = currentPerson.name.toLowerCase().includes('geic');
  const accentColor = isGeicsania ? '#FF267A' : '#C4F53C';
  const todayWorkout = workouts[dayIndex] || WORKOUT_DAYS[dayIndex];

  const getSetKey = useCallback(
    (dayIdx: number, exerciseId: string, setIdx: number) =>
      `${currentWeek}:${profile}:${dayIdx}:${exerciseId}:${setIdx}`,
    [currentWeek, profile]
  );

  const startRest = useCallback((seconds: number) => {
    setRestSeconds(seconds);
    setRestEndTime(Date.now() + seconds * 1000);
    setRestActive(true);
  }, []);

  const toggleSet = (exerciseId: string, setIdx: number) => {
    const key = getSetKey(dayIndex, exerciseId, setIdx);
    setSavedSets((prev) => {
      const current = prev[key] || { done: false };
      return { ...prev, [key]: { ...current, done: !current.done } };
    });
    startRest(60);
  };

  const updateSetWeight = (exerciseId: string, setIdx: number, weightKg: string) => {
    const key = getSetKey(dayIndex, exerciseId, setIdx);
    setSavedSets((prev) => {
      const current = prev[key] || { done: false };
      return { ...prev, [key]: { ...current, weightKg } };
    });
  };

  const handleSwapExercise = (altName: string) => {
    if (!selectedExercise) return;
    setWorkouts((prev) =>
      prev.map((day, dIdx) => {
        if (dIdx !== dayIndex) return day;
        return {
          ...day,
          exercises: day.exercises.map((ex) => {
            if (ex.id !== selectedExercise.id) return ex;
            return {
              ...ex,
              name: altName,
              machines: {
                ...ex.machines,
                primary: {
                  ...ex.machines.primary,
                  name: altName,
                  description: 'Aparelho alternativo selecionado para o treino de hoje.'
                }
              }
            };
          })
        };
      })
    );
  };

  const totalSetsToday = todayWorkout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSetsToday = todayWorkout.exercises.reduce((sum, ex) => {
    let completed = 0;
    for (let s = 0; s < ex.sets; s++) {
      if (savedSets[getSetKey(dayIndex, ex.id, s)]?.done) completed++;
    }
    return sum + completed;
  }, 0);
  const progressPct = Math.round((completedSetsToday / Math.max(1, totalSetsToday)) * 100);

  const isDayCompleted = (dIdx: number) => {
    const day = workouts[dIdx] || WORKOUT_DAYS[dIdx];
    if (!day || !day.exercises.length) return false;
    return day.exercises.every((ex) => {
      for (let s = 0; s < ex.sets; s++) {
        if (!savedSets[getSetKey(dIdx, ex.id, s)]?.done) return false;
      }
      return true;
    });
  };

  const handleFinishWorkout = () => {
    if (workoutSeconds === 0 && completedSetsToday === 0) {
      alert('Inicie o cronômetro ou marque pelo menos uma série para registrar a conclusão do treino!');
      return;
    }
    const sessionRecord = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      workoutTitle: todayWorkout.title,
      durationSeconds: workoutSeconds,
      completedSets: completedSetsToday,
      totalSets: totalSetsToday,
      caloriesEstimated: watchCalories || Math.round(workoutSeconds * 0.12)
    };
    try {
      const historyKey = `hitfit-history-${profile}`;
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
      existing.unshift(sessionRecord);
      localStorage.setItem(historyKey, JSON.stringify(existing.slice(0, 30)));
    } catch {}
    setWorkoutActive(false);
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
      alert('Seu navegador atual não suporta Web Bluetooth nativo. Registre os dados manualmente no campo abaixo!');
    }
  };

  if (!isClient) {
    return (
      <main className="min-h-screen bg-[#07090C] text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Dumbbell className="w-8 h-8 text-[#C4F53C] animate-spin" />
          <p className="text-sm font-bold tracking-tight text-neutral-400">Iniciando HIT-FIT DUO PRO…</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090C] text-neutral-100 flex flex-col items-center overflow-x-hidden selection:bg-[#C4F53C]/30">
      <div className="w-full max-w-lg min-h-screen flex flex-col px-4 pt-3 pb-[max(8.5rem,calc(env(safe-area-inset-bottom)+7.5rem))]">
        
        {/* HEADER: MARCA AUTORAL HF DUO PRO & TELEMETRIA */}
        <header className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.06)] mb-3">
          <div className="flex items-center gap-3">
            <div
              className="relative w-11 h-11 rounded-2xl flex items-center justify-center font-black shadow-2xl border transition-all duration-300 tap-haptic"
              style={{
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}45`,
                color: accentColor
              }}
            >
              <svg viewBox="0 0 40 40" className="w-6 h-6 fill-none stroke-current" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 8 V32 M10 20 H22 M22 8 V32" />
                <path d="M28 8 H36 M28 20 H34 M28 8 V32" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-black text-lg tracking-tight text-white leading-none">
                <span>HIT-FIT</span>
                <span
                  className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${accentColor}20`,
                    borderColor: `${accentColor}40`,
                    color: accentColor
                  }}
                >
                  DUO PRO
                </span>
              </div>
              <p className="text-[10px] tracking-widest text-neutral-400 uppercase font-mono mt-1">
                Cockpit de Performance · Casal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setWatchModalOpen(true)}
              className="py-2 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[rgba(255,255,255,0.08)] text-neutral-300 transition-all flex items-center gap-1.5 tap-haptic"
              aria-label="Registrar Telemetria do Relógio"
            >
              <Watch size={15} style={{ color: bleConnected ? accentColor : '#94A3B8' }} />
              <span className="text-[11px] font-mono font-bold">{watchCalories} kcal</span>
            </button>

            <button
              onClick={() => setEditingConfig(!editingConfig)}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[rgba(255,255,255,0.08)] text-neutral-400 hover:text-white transition-all tap-haptic"
              aria-label="Configurar Atletas"
            >
              <Settings2 size={16} />
            </button>
          </div>
        </header>

        {/* MODAL / FORMULÁRIO DE NOMES DO CASAL */}
        {editingConfig && (
          <div className="mb-4 p-4 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.1)] flex flex-col gap-3 animate-spring-in">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
              Configuração dos Atletas:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Atleta 1"
                className="p-3 bg-[#07090C] border border-white/10 rounded-2xl text-white font-bold text-base outline-none focus:border-white/30"
              />
              <input
                type="text"
                value={secondName}
                onChange={(e) => setSecondName(e.target.value)}
                placeholder="Atleta 2"
                className="p-3 bg-[#07090C] border border-white/10 rounded-2xl text-white font-bold text-base outline-none focus:border-white/30"
              />
            </div>
            <button
              onClick={() => {
                setConfig({
                  mode: 'couple',
                  people: [
                    { id: 'person-rangel', name: firstName.trim() || 'Rangel' },
                    { id: 'person-geicsania', name: secondName.trim() || 'Geicsania' }
                  ]
                });
                setEditingConfig(false);
              }}
              className="py-3 px-4 rounded-2xl font-bold text-xs shadow-md transition-transform active:scale-95 text-[#07090C]"
              style={{ backgroundColor: accentColor }}
            >
              Salvar Alterações
            </button>
          </div>
        )}

        {/* MOTORSPORT / COCKPIT ATHLETE SWITCHER */}
        <div className="mb-4">
          <AthleteSwitcher
            people={config.people}
            activeProfileId={profile}
            onSelectProfile={setProfile}
          />
        </div>

        {/* ======================= ABA DE NUTRIÇÃO ======================= */}
        {viewTab === 'nutricao' && (
          <NutritionView
            profileId={profile}
            profileName={currentPerson.name}
            accentColor={accentColor}
            todayWorkoutCaloriesBurned={watchCalories}
          />
        )}

        {/* ======================= ABA DE EVOLUÇÃO / CARGAS ======================= */}
        {viewTab === 'evolucao' && (
          <EvolutionView
            profileId={profile}
            profileName={currentPerson.name}
            currentWeek={currentWeek}
            savedSets={savedSets}
            accentColor={accentColor}
          />
        )}

        {/* ======================= ABA DUO (CASAL) ======================= */}
        {viewTab === 'duo' && (
          <DuoView
            people={config.people}
            currentWeek={currentWeek}
            savedSets={savedSets}
            accentColor={accentColor}
          />
        )}

        {/* ======================= ABA DE TREINO ======================= */}
        {viewTab === 'treino' && (
          <div className="flex flex-col gap-4 animate-spring-in">
            <KineticWeekRibbon
              days={WORKOUT_DAYS}
              activeDayIndex={dayIndex}
              onSelectDay={setDayIndex}
              accentColor={accentColor}
              isDayCompleted={isDayCompleted}
            />

            <HeroWorkoutCard
              workout={todayWorkout}
              currentPersonName={currentPerson.name}
              progressPct={progressPct}
              completedSets={completedSetsToday}
              totalSets={totalSetsToday}
              accentColor={accentColor}
            />

            {/* CARD METABÓLICO FINALIZADOR (CARDIO HIIT) */}
            <div className="p-4 rounded-3xl bg-[#0B0E15] border border-[rgba(245,158,11,0.2)] flex items-start gap-3 shadow-lg relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                <Flame size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] font-mono uppercase font-black text-amber-400 tracking-wider">
                    FINALIZADOR METABÓLICO · {todayWorkout.finishCardio.durationMin} MIN
                  </span>
                  <span className="text-[11px] font-mono font-bold text-neutral-300">
                    ~{todayWorkout.finishCardio.caloriesBurnTarget} kcal
                  </span>
                </div>
                <h4 className="text-sm font-black text-white mt-0.5 tracking-tight">
                  {todayWorkout.finishCardio.name}
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {todayWorkout.finishCardio.protocol}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 pt-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Dumbbell size={14} style={{ color: accentColor }} />
                Deck de Exercícios ({todayWorkout.exercises.length})
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Biomecânica & Séries</span>
            </div>

            <div className="flex flex-col gap-3">
              {todayWorkout.exercises.map((exercise, eIdx) => (
                <ExerciseCardRow
                  key={exercise.id}
                  exercise={exercise}
                  index={eIdx}
                  athleteName={currentPerson.name}
                  accentColor={accentColor}
                  savedSets={savedSets}
                  getSetKey={getSetKey}
                  dayIndex={dayIndex}
                  onToggleSet={toggleSet}
                  onUpdateSetWeight={updateSetWeight}
                  onOpenDetail={setSelectedExercise}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      <WorkoutCockpit
        workoutActive={workoutActive}
        workoutSeconds={workoutSeconds}
        onToggleWorkout={() => setWorkoutActive(!workoutActive)}
        restActive={restActive}
        restSeconds={restSeconds}
        onStartRest={startRest}
        canFinishWorkout={workoutSeconds > 0 || completedSetsToday > 0}
        onFinishWorkout={handleFinishWorkout}
        viewTab={viewTab}
        onSelectTab={setViewTab}
        accentColor={accentColor}
      />

      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          accentColor={accentColor}
          onClose={() => setSelectedExercise(null)}
          onSwapExercise={handleSwapExercise}
        />
      )}

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

      <WorkoutCompletedModal
        isOpen={completedModalOpen}
        onClose={() => {
          setCompletedModalOpen(false);
          setWorkoutSeconds(0);
          setWorkoutActive(false);
        }}
        athleteName={currentPerson.name}
        workoutTitle={todayWorkout.title}
        workoutSeconds={workoutSeconds}
        completedSets={completedSetsToday}
        totalSets={totalSetsToday}
        accentColor={accentColor}
      />
    </div>
  );
}
