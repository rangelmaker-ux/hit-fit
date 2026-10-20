"use client";

import React, { useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import { WORKOUT_DAYS, Exercise, DayWorkout } from '@/lib/workout-data';
import { ExerciseDetailModal } from '@/components/exercise-detail-modal';
import { NutritionView } from '@/components/nutrition-view';
import { DuoView } from '@/components/duo-view';
import { EvolutionView } from '@/components/evolution-view';
import {
  Dumbbell,
  Check,
  Play,
  Pause,
  Flame,
  Settings2,
  Utensils,
  Watch,
  Heart,
  Sparkles,
  Layers,
  Zap,
  TrendingUp,
  UsersRound,
  Trophy
} from 'lucide-react';

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
    } catch {
      // Fallback seguro
    }
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
    } catch {
      // Fallback seguro
    }
  }
  return 'person-rangel';
}

function getInitialSavedSets(): Record<string, SavedSetState> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('hitfit-progress-v2');
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback seguro
    }
  }
  return {};
}

function getInitialWatchCalories(): number {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('hitfit-watch-cals-v2');
      if (stored) return Number(stored) || 420;
    } catch {
      // Fallback seguro
    }
  }
  return 420;
}

function getInitialWorkouts(): DayWorkout[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('hitfit-custom-workouts-v2');
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback seguro
    }
  }
  return WORKOUT_DAYS;
}

export default function Home() {
  // Configuração dos Perfis (Rangel & Geicsania)
  const [config, setConfig] = useState<CoupleSetup>(getInitialConfig);
  const [profile, setProfile] = useState<string>(getInitialProfile);
  const [editingConfig, setEditingConfig] = useState(false);
  const [firstName, setFirstName] = useState(() => config.people[0]?.name || 'Rangel');
  const [secondName, setSecondName] = useState(() => config.people[1]?.name || 'Geicsania');

  // Estado do Treino e Navegação
  const [dayIndex, setDayIndex] = useState<number>(getInitialDayIndex);
  const [viewTab, setViewTab] = useState<'treino' | 'nutricao' | 'evolucao' | 'duo'>('treino');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Ficha de Treinos (permite substituição inteligente de máquinas)
  const [workouts, setWorkouts] = useState<DayWorkout[]>(getInitialWorkouts);

  // Checklist de Séries e Cargas (salvo por chave semana:perfil:dia:exercicio:serie)
  const [savedSets, setSavedSets] = useState<Record<string, SavedSetState>>(getInitialSavedSets);
  const [currentWeek] = useState<string>(getInitialWeek);

  // Detecção PWA de montagem segura (zero cascading renders)
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Cronômetro Geral do Treino (Play / Pausa de Sessão)
  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutSeconds, setWorkoutSeconds] = useState(0);

  // Timer de Descanso entre Séries
  const [restSeconds, setRestSeconds] = useState(60);
  const [restActive, setRestActive] = useState(false);
  const [restEndTime, setRestEndTime] = useState(0);

  // Modal de Conclusão de Treino com Métricas
  const [completedModalOpen, setCompletedModalOpen] = useState(false);

  // Modal do Relógio Inteligente / Dados Cardíacos
  const [watchModalOpen, setWatchModalOpen] = useState(false);
  const [watchCalories, setWatchCalories] = useState<number>(getInitialWatchCalories);
  const [watchHeartRate, setWatchHeartRate] = useState<number>(135);
  const [bleConnected, setBleConnected] = useState(false);
  const [bleDeviceName, setBleDeviceName] = useState<string | null>(null);

  // Salvar no LocalStorage
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem('hitfit-setup-v2', JSON.stringify(config));
      localStorage.setItem('hitfit-active-profile-v2', profile);
      localStorage.setItem('hitfit-progress-v2', JSON.stringify(savedSets));
      localStorage.setItem('hitfit-watch-cals-v2', watchCalories.toString());
      localStorage.setItem('hitfit-custom-workouts-v2', JSON.stringify(workouts));
    } catch {
      // Ignora falhas de quota de storage
    }
  }, [config, profile, savedSets, watchCalories, workouts, isClient]);

  // Cronômetro da Sessão de Treino
  useEffect(() => {
    if (!workoutActive) return;
    const interval = setInterval(() => {
      setWorkoutSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutActive]);

  // Contagem regressiva do Timer de Descanso
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

  // Perfil Ativo e Cores Dinâmicas
  const currentPerson = config.people.find((p) => p.id === profile) || config.people[0];
  const isGeicsania = currentPerson.name.toLowerCase().includes('geic');
  // Cyber Volt Lime (#c3f75a) para Rangel, Electric Magenta (#ff2e93) para Geicsania
  const accentColor = isGeicsania ? '#ff2e93' : '#c3f75a';
  const accentGlow = isGeicsania ? 'rgba(255, 46, 147, 0.25)' : 'rgba(195, 247, 90, 0.25)';

  // Treino do Dia Atual
  const todayWorkout = workouts[dayIndex] || WORKOUT_DAYS[dayIndex];

  // Chave estável para persistência de séries
  const getSetKey = (dayIdx: number, exerciseId: string, setIdx: number) =>
    `${currentWeek}:${profile}:${dayIdx}:${exerciseId}:${setIdx}`;

  const startRest = useCallback((seconds: number) => {
    setRestSeconds(seconds);
    const targetEnd = Date.now() + seconds * 1000;
    setRestEndTime(targetEnd);
    setRestActive(true);
  }, []);

  const toggleSet = (exerciseId: string, setIdx: number) => {
    const key = getSetKey(dayIndex, exerciseId, setIdx);
    setSavedSets((prev) => {
      const current = prev[key] || { done: false };
      return {
        ...prev,
        [key]: { ...current, done: !current.done }
      };
    });
    // Dispara descanso com cadência de 60 segundos
    startRest(60);
  };

  const updateSetWeight = (exerciseId: string, setIdx: number, weightKg: string) => {
    const key = getSetKey(dayIndex, exerciseId, setIdx);
    setSavedSets((prev) => {
      const current = prev[key] || { done: false };
      return {
        ...prev,
        [key]: { ...current, weightKg }
      };
    });
  };

  // Substituição inteligente de máquina/exercício na ficha
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
                  name: altName,
                  description: 'Aparelho substituto selecionado para o treino de hoje.',
                  settingTips: ex.machines.primary.settingTips
                }
              }
            };
          })
        };
      })
    );
  };

  // Cálculo do progresso no dia
  const totalSetsToday = todayWorkout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSetsToday = todayWorkout.exercises.reduce((sum, ex) => {
    let completed = 0;
    for (let s = 0; s < ex.sets; s++) {
      if (savedSets[getSetKey(dayIndex, ex.id, s)]?.done) completed++;
    }
    return sum + completed;
  }, 0);
  const progressPct = Math.round((completedSetsToday / Math.max(1, totalSetsToday)) * 100);

  // Finalizar Sessão de Treino e Salvar no Histórico Local
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

  // Web Bluetooth API para sensores cardíacos BLE
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
      alert('Seu navegador atual não suporta Web Bluetooth nativo. Registre os dados marcados no seu relógio no campo abaixo!');
    }
  };

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isClient) {
    return (
      <main className="min-h-screen bg-[#090D12] text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Dumbbell className="w-8 h-8 text-[#c3f75a] animate-spin" />
          <p className="text-sm font-semibold text-neutral-400">Carregando HIT-FIT DUO PRO…</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D12] text-neutral-100 flex flex-col items-center overflow-x-hidden selection:bg-[#c3f75a]/30">
      <div className="w-full max-w-lg min-h-screen flex flex-col px-4 pt-3 pb-[max(7rem,calc(env(safe-area-inset-bottom)+6rem))]">
        
        {/* HEADER: IDENTIDADE VISUAL HF DUO & SENSORS */}
        <header className="flex items-center justify-between py-2.5 border-b border-white/5 mb-3">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg border"
              style={{ 
                backgroundColor: `${accentColor}18`, 
                borderColor: `${accentColor}50`,
                color: accentColor 
              }}
            >
              <Dumbbell size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1 font-black text-lg tracking-tight text-white">
                <span>HIT</span>
                <span style={{ color: accentColor }}>-</span>
                <span>FIT</span>
                <span 
                  className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ml-1 tracking-wider"
                  style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                >
                  DUO
                </span>
              </div>
              <p className="text-[10px] tracking-widest text-neutral-400 uppercase font-semibold">
                Treino de Casal · Academia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão Sincronizar Relógio Inteligente */}
            <button
              onClick={() => setWatchModalOpen(true)}
              className="p-2 px-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 transition-colors flex items-center gap-1.5"
              aria-label="Registrar Dados do Relógio"
            >
              <Watch size={17} style={{ color: bleConnected ? accentColor : '#94a3b8' }} />
              <span className="text-[11px] font-bold font-mono">{watchCalories} kcal</span>
            </button>

            {/* Configuração de Perfis */}
            <button
              onClick={() => setEditingConfig(!editingConfig)}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 transition-colors"
              aria-label="Configurar Nomes do Casal"
            >
              <Settings2 size={18} />
            </button>
          </div>
        </header>

        {/* MODAL / FORMULÁRIO DE EDIÇÃO DOS NOMES */}
        {editingConfig && (
          <div className="mb-4 p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3 animate-in fade-in">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Nomes de Quem Treina Juntos:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nome dele"
                className="p-3 bg-black/50 border border-white/15 rounded-2xl text-white font-bold text-base"
              />
              <input
                type="text"
                value={secondName}
                onChange={(e) => setSecondName(e.target.value)}
                placeholder="Nome dela"
                className="p-3 bg-black/50 border border-white/15 rounded-2xl text-white font-bold text-base"
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
              className="py-3 px-4 rounded-2xl font-bold text-xs shadow-md transition-transform active:scale-95 text-[#10150d]"
              style={{ backgroundColor: accentColor }}
            >
              Salvar Nomes
            </button>
          </div>
        )}

        {/* SELETOR DE PERFIL (RANGEL vs GEICSANIA) */}
        <div className="flex items-center gap-2 mb-4 p-1 rounded-2xl bg-white/5 border border-white/10">
          {config.people.map((p) => {
            const isSelected = profile === p.id;
            const isGeic = p.name.toLowerCase().includes('geic');
            const pColor = isGeic ? '#ff2e93' : '#c3f75a';

            return (
              <button
                key={p.id}
                onClick={() => setProfile(p.id)}
                className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2.5 transition-all ${
                  isSelected
                    ? 'bg-white/15 text-white shadow-md font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 font-medium'
                }`}
                style={isSelected ? { borderColor: `${pColor}40`, borderWidth: 1 } : {}}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black"
                  style={{
                    backgroundColor: isSelected ? pColor : 'rgba(255,255,255,0.1)',
                    color: isSelected ? '#10150d' : '#fff'
                  }}
                >
                  {p.name[0]}
                </span>
                <span className="text-sm">{p.name}</span>
                {isSelected && (
                  <span
                    className="w-2 h-2 rounded-full animate-pulse ml-auto"
                    style={{ backgroundColor: pColor }}
                  />
                )}
              </button>
            );
          })}
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
          <div className="flex flex-col gap-4 animate-in fade-in">
            {/* SELETOR DOS 5 DIAS DA SEMANA */}
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10">
              {WORKOUT_DAYS.map((w, idx) => {
                const isActive = dayIndex === idx;

                return (
                  <button
                    key={w.dayShort}
                    onClick={() => setDayIndex(idx)}
                    className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      isActive
                        ? 'bg-white/15 text-white font-bold shadow-md'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                    style={isActive ? { borderColor: `${accentColor}50`, borderWidth: 1 } : {}}
                  >
                    <span className="text-[10px] font-bold tracking-wider">{w.dayShort}</span>
                    <span className="text-sm font-mono">{idx + 1}</span>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: isActive ? accentColor : 'transparent'
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {/* CARD HERO DO TREINO DO DIA */}
            <div
              className="p-5 rounded-3xl border relative overflow-hidden flex flex-col gap-3 shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${accentGlow}, rgba(13,16,13,0.95) 75%)`,
                borderColor: `${accentColor}40`
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: accentColor, color: '#10150d' }}
                >
                  {todayWorkout.focusTag}
                </span>
                <span className="text-xs text-neutral-300 font-mono">
                  {todayWorkout.durationMin} MINUTOS
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {todayWorkout.title}
                </h1>
                <p className="text-xs text-neutral-300 mt-1">
                  {todayWorkout.subtitle}
                </p>
              </div>

              {/* Barra de Progresso do Treino */}
              <div className="flex flex-col gap-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300 font-medium">Progresso de {currentPerson.name}</span>
                  <span className="font-bold font-mono" style={{ color: accentColor }}>
                    {progressPct}% ({completedSetsToday}/{totalSetsToday} séries)
                  </span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%`, backgroundColor: accentColor }}
                  />
                </div>
              </div>
            </div>

            {/* CARD DO CARDIO FINALIZADOR */}
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                <Flame size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    FINALIZADOR METABÓLICO · {todayWorkout.finishCardio.durationMin} MIN
                  </span>
                  <span className="text-[11px] font-bold text-neutral-300 font-mono">
                    ~{todayWorkout.finishCardio.caloriesBurnTarget} kcal
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {todayWorkout.finishCardio.name}
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {todayWorkout.finishCardio.protocol}
                </p>
              </div>
            </div>

            {/* LISTA DE EXERCÍCIOS */}
            <div className="flex items-center justify-between px-1 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Dumbbell size={15} style={{ color: accentColor }} />
                Exercícios do Treino ({todayWorkout.exercises.length})
              </span>
              <span className="text-[11px] text-neutral-500">Toque para ver a máquina</span>
            </div>

            <div className="flex flex-col gap-3">
              {todayWorkout.exercises.map((exercise, eIdx) => {
                return (
                  <article
                    key={exercise.id}
                    className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3 hover:border-white/20 transition-all shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-neutral-400">
                            #{String(eIdx + 1).padStart(2, '0')}
                          </span>
                          <span
                            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                          >
                            {exercise.targetMuscle}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {exercise.name}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {exercise.sets} séries · {exercise.reps} repetições
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedExercise(exercise)}
                        className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors border border-white/10"
                        aria-label={`Ver máquina e execução de ${exercise.name}`}
                      >
                        <Sparkles size={13} style={{ color: accentColor }} />
                        <span>Ver Máquina</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-neutral-300 bg-black/40 p-2.5 rounded-2xl border border-white/5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <Layers size={13} style={{ color: accentColor }} />
                        Aparelho:
                      </span>
                      <strong className="text-white truncate max-w-[240px]">
                        {exercise.machines.primary.name}
                      </strong>
                    </div>

                    {/* SÉRIES E CARGAS */}
                    <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                        Séries de {currentPerson.name}:
                      </span>
                      <div className="grid grid-cols-2 min-[380px]:grid-cols-3 sm:grid-cols-4 gap-2">
                        {Array.from({ length: exercise.sets }).map((_, sIdx) => {
                          const setKey = getSetKey(dayIndex, exercise.id, sIdx);
                          const state = savedSets[setKey] || { done: false, weightKg: '' };

                          return (
                            <div
                              key={sIdx}
                              className={`p-2 rounded-2xl border flex flex-col gap-1 transition-all ${
                                state.done
                                  ? 'bg-[#152010] border-emerald-500/50 text-white'
                                  : 'bg-black/30 border-white/10 text-neutral-400'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold font-mono">SÉRIE {sIdx + 1}</span>
                                <button
                                  onClick={() => toggleSet(exercise.id, sIdx)}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform active:scale-90 ${
                                    state.done
                                      ? 'bg-emerald-400 text-black shadow-sm'
                                      : 'bg-white/10 hover:bg-white/20 text-neutral-300'
                                  }`}
                                  aria-label={`Marcar série ${sIdx + 1}`}
                                >
                                  {state.done ? <Check size={14} strokeWidth={3} /> : sIdx + 1}
                                </button>
                              </div>

                              <div className="flex items-center gap-1 mt-0.5">
                                <input
                                  type="text"
                                  placeholder="kg"
                                  value={state.weightKg || ''}
                                  onChange={(e) => updateSetWeight(exercise.id, sIdx, e.target.value)}
                                  className="w-full text-base font-mono bg-transparent border-0 border-b border-white/20 focus:border-white p-0 text-white outline-none"
                                />
                                <span className="text-[9px] text-neutral-500">kg</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ======================= BARRA INFERIOR FIXA DE TREINO ======================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-[#090D12]/95 backdrop-blur-xl border-t border-[#21262D] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 px-4 shadow-2xl">
        <div className="w-full max-w-lg flex flex-col gap-2">
          
          {/* BARRA DE CRONÔMETRO GERAL & DESCANSO */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#161B22] border border-[#21262D] shadow-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWorkoutActive(!workoutActive)}
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform active:scale-95"
                style={{ backgroundColor: accentColor, color: '#10150d' }}
                aria-label={workoutActive ? 'Pausar Treino' : 'Iniciar Treino'}
              >
                {workoutActive ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
              </button>
              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                  {workoutActive ? 'TREINO EM ANDAMENTO' : 'TREINO PAUSADO'}
                </span>
                <strong className="text-base font-black font-mono text-white">
                  {formatTimer(workoutSeconds)}
                </strong>
              </div>
            </div>

            {(workoutSeconds > 0 || completedSetsToday > 0) && (
              <button
                onClick={handleFinishWorkout}
                className="py-1.5 px-2.5 rounded-xl text-[10px] font-extrabold uppercase transition-all shadow-md active:scale-95 flex items-center gap-1 border shrink-0"
                style={{
                  backgroundColor: `${accentColor}20`,
                  borderColor: `${accentColor}60`,
                  color: accentColor
                }}
                title="Finalizar e Salvar Treino"
              >
                <Trophy size={12} />
                <span>Concluir</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 pl-2 border-l border-[#21262D]">
              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block text-right">
                  DESCANSO
                </span>
                <strong className="text-base font-black font-mono text-amber-300 block text-right">
                  {formatTimer(restSeconds)}
                </strong>
              </div>
              <div className="flex items-center gap-1">
                {[45, 60, 90].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => startRest(sec)}
                    className="px-2 py-1.5 text-[10px] font-bold font-mono rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 transition-colors"
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* NAVEGAÇÃO ENTRE AS 4 TELAS PRINCIPAIS */}
          <nav className="flex items-center justify-around pt-1">
            <button
              onClick={() => setViewTab('treino')}
              className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
                viewTab === 'treino' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Dumbbell size={18} style={viewTab === 'treino' ? { color: accentColor } : {}} />
              <span>Treino</span>
            </button>

            <button
              onClick={() => setViewTab('nutricao')}
              className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
                viewTab === 'nutricao' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Utensils size={18} style={viewTab === 'nutricao' ? { color: accentColor } : {}} />
              <span>Nutrição</span>
            </button>

            <button
              onClick={() => setViewTab('evolucao')}
              className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
                viewTab === 'evolucao' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <TrendingUp size={18} style={viewTab === 'evolucao' ? { color: accentColor } : {}} />
              <span>Cargas</span>
            </button>

            <button
              onClick={() => setViewTab('duo')}
              className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
                viewTab === 'duo' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <UsersRound size={18} style={viewTab === 'duo' ? { color: accentColor } : {}} />
              <span>Duo Casal</span>
            </button>
          </nav>
        </div>
      </footer>

      {/* ======================= MODAL BIOMECÂNICO & MÁQUINA ======================= */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          accentColor={accentColor}
          onClose={() => setSelectedExercise(null)}
          onSwapExercise={handleSwapExercise}
        />
      )}

      {/* ======================= MODAL DO RELÓGIO INTELIGENTE ======================= */}
      {watchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setWatchModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#0e120e] border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Watch size={20} style={{ color: accentColor }} />
                <h3 className="text-base font-bold text-white">Relógio de {currentPerson.name}</h3>
              </div>
              <button
                onClick={() => setWatchModalOpen(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Registre a estimativa exibida no Apple Watch ou Galaxy Watch para ajustar o balanço energético do dia:
            </p>

            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Flame size={14} className="text-amber-400" /> Calorias do Treino (Estimativa do Relógio):
                </span>
                <input
                  type="number"
                  value={watchCalories}
                  onChange={(e) => setWatchCalories(Number(e.target.value) || 0)}
                  className="p-3 bg-black/50 border border-white/15 rounded-2xl text-xl font-black font-mono text-white"
                  placeholder="Ex: 480"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Heart size={14} className="text-rose-400" /> Frequência Cardíaca Média (BPM):
                </span>
                <input
                  type="number"
                  value={watchHeartRate}
                  onChange={(e) => setWatchHeartRate(Number(e.target.value) || 0)}
                  className="p-3 bg-black/50 border border-white/15 rounded-2xl text-xl font-black font-mono text-white"
                  placeholder="Ex: 135"
                />
              </label>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
                <Zap size={14} style={{ color: accentColor }} />
                Sensor Cardíaco Bluetooth (BLE)
              </span>
              <p className="text-[11px] text-neutral-400">
                {bleConnected
                  ? `Conectado: ${bleDeviceName}`
                  : 'Suporte a cintas e braceletes cardíacos BLE padrão.'}
              </p>
              <button
                onClick={connectBluetoothWatch}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                {bleConnected ? 'Sensor Pareado ✓' : 'Conectar Sensor BLE'}
              </button>
            </div>

            <button
              onClick={() => setWatchModalOpen(false)}
              className="py-3.5 rounded-2xl font-bold text-xs shadow-md transition-transform active:scale-95 text-[#10150d]"
              style={{ backgroundColor: accentColor }}
            >
              Salvar Dados da Sessão
            </button>
          </div>
        </div>
      )}

      {/* ======================= MODAL DE CONCLUSÃO DE TREINO ======================= */}
      {completedModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setCompletedModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#161B22] border border-[#21262D] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 text-neutral-100"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Treino Concluído"
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border"
              style={{
                backgroundColor: `${accentColor}20`,
                borderColor: `${accentColor}60`,
                color: accentColor
              }}
            >
              <Trophy size={32} />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Sessão Registrada
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">Parabéns, {currentPerson.name}!</h3>
              <p className="text-xs text-neutral-300 mt-1">{todayWorkout.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              <div className="bg-[#0D1117] p-3 rounded-2xl border border-[#21262D]">
                <span className="text-[10px] text-neutral-400 uppercase block">Tempo Total</span>
                <strong className="text-base font-black font-mono text-white">{formatTimer(workoutSeconds)}</strong>
              </div>
              <div className="bg-[#0D1117] p-3 rounded-2xl border border-[#21262D]">
                <span className="text-[10px] text-neutral-400 uppercase block">Séries Concluídas</span>
                <strong className="text-base font-black font-mono" style={{ color: accentColor }}>
                  {completedSetsToday} / {totalSetsToday}
                </strong>
              </div>
            </div>

            <button
              onClick={() => {
                setCompletedModalOpen(false);
                setWorkoutSeconds(0);
                setWorkoutActive(false);
              }}
              className="w-full py-3.5 rounded-2xl font-bold text-xs shadow-md transition-transform active:scale-95 text-[#10150d]"
              style={{ backgroundColor: accentColor }}
            >
              Salvar e Fechar Sessão
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
