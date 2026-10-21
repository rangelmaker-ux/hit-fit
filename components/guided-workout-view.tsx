import React, { useState } from 'react';
import { DayWorkout, Exercise } from '@/lib/workout-data';
import { ExerciseAnimation } from '@/components/exercise-animation';
import { NumericInput } from '@/components/ui/numeric-input';
import {
  CheckCircle2,
  FastForward,
  Layers,
  ChevronLeft,
  ChevronRight,
  Flame,
  X,
  AlertTriangle,
  Trophy
} from 'lucide-react';

export type ExerciseSessionStatus = 'nao_iniciado' | 'em_andamento' | 'concluido' | 'parcial' | 'pulado';

export interface SkippedExerciseRecord {
  exerciseName: string;
  reason?: string;
}

interface GuidedWorkoutViewProps {
  workout: DayWorkout;
  athleteName: string;
  accentColor: string;
  isReadOnly?: boolean;
  workoutActive: boolean;
  workoutSeconds: number;
  onToggleWorkout: () => void;
  onFinishWorkout: (summary: {
    completedExercisesCount: number;
    skippedExercises: SkippedExerciseRecord[];
    totalWeightVolumeKg: number;
    durationSeconds: number;
    completedSets: number;
    totalSets: number;
  }) => void;
  onStartRest: (seconds: number) => void;
  savedSets: Record<string, { done: boolean; weightKg?: string }>;
  getSetKey: (dayIdx: number, exerciseId: string, setIdx: number) => string;
  dayIndex: number;
  onToggleSet: (exerciseId: string, setIdx: number) => void;
  onUpdateSetWeight: (exerciseId: string, setIdx: number, weightKg: string) => void;
  onOpenDetailModal?: (exercise: Exercise) => void;
}

const SKIP_REASONS = [
  'Aparelho ou máquina ocupada',
  'Desconforto ou dor articular',
  'Sem tempo / treino reduzido',
  'Exercício alternativo já realizado',
  'Outro motivo pessoal'
];

export function GuidedWorkoutView({
  workout,
  athleteName,
  accentColor,
  isReadOnly,
  workoutActive,
  workoutSeconds,
  onToggleWorkout,
  onFinishWorkout,
  onStartRest,
  savedSets,
  getSetKey,
  dayIndex,
  onToggleSet,
  onUpdateSetWeight,
  onOpenDetailModal
}: GuidedWorkoutViewProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [skippedExercises, setSkippedExercises] = useState<Record<string, string>>({});
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [selectedSkipReason, setSelectedSkipReason] = useState(SKIP_REASONS[0]);
  const [sessionMapOpen, setSessionMapOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const exercises = workout.exercises;
  const currentEx = exercises[activeIdx] || exercises[0];

  // Identifica o status de cada exercício
  const getExerciseStatus = (ex: Exercise): ExerciseSessionStatus => {
    if (skippedExercises[ex.id]) return 'pulado';
    let doneCount = 0;
    for (let s = 0; s < ex.sets; s++) {
      if (savedSets[getSetKey(dayIndex, ex.id, s)]?.done) doneCount++;
    }
    if (doneCount === 0) return 'nao_iniciado';
    if (doneCount === ex.sets) return 'concluido';
    return 'em_andamento';
  };

  // Séries concluídas no exercício ativo
  const completedSetsThisEx = Array.from({ length: currentEx.sets }).filter(
    (_, sIdx) => savedSets[getSetKey(dayIndex, currentEx.id, sIdx)]?.done
  ).length;

  const currentSetNumber = Math.min(currentEx.sets, completedSetsThisEx + 1);
  const currentSetKey = getSetKey(dayIndex, currentEx.id, Math.max(0, currentSetNumber - 1));
  const currentSetSaved = savedSets[currentSetKey];

  // Carga local
  const currentSetWeightNum = currentSetSaved?.weightKg ? parseFloat(currentSetSaved.weightKg) : null;

  // Concluir série ativa
  const handleCompleteCurrentSet = () => {
    if (isReadOnly) return;
    if (!workoutActive) {
      onToggleWorkout(); // Inicia cronômetro automaticamente se ainda não estava rodando
    }

    const setIdxToComplete = Math.max(0, currentSetNumber - 1);
    onToggleSet(currentEx.id, setIdxToComplete);
    onStartRest(currentEx.restSeconds || 60);

    // Se completou a última série do exercício
    if (setIdxToComplete === currentEx.sets - 1) {
      setTransitioning(true);
      setTimeout(() => {
        setTransitioning(false);
        // Avança para o próximo exercício pendente se houver
        if (activeIdx < exercises.length - 1) {
          setActiveIdx((prev) => prev + 1);
        }
      }, 1100);
    }
  };

  // Pular exercício atual com motivo
  const handleConfirmSkip = () => {
    setSkippedExercises((prev) => ({
      ...prev,
      [currentEx.id]: selectedSkipReason
    }));
    setSkipModalOpen(false);

    if (activeIdx < exercises.length - 1) {
      setActiveIdx((prev) => prev + 1);
    }
  };

  // Ajuste de peso rápido (+2.5kg / -2.5kg)
  const handleWeightAdjust = (delta: number) => {
    if (isReadOnly) return;
    const base = currentSetWeightNum || 20;
    const nextVal = Math.max(0, Math.round((base + delta) * 10) / 10);
    onUpdateSetWeight(currentEx.id, Math.max(0, currentSetNumber - 1), String(nextVal));
  };

  // Finalizar treino com cálculo estrito
  const handleFinalize = () => {
    let completedExCount = 0;
    let totalVolumeKg = 0;
    let totalDoneSets = 0;
    const skippedList: SkippedExerciseRecord[] = [];

    exercises.forEach((ex) => {
      const isSkipped = Boolean(skippedExercises[ex.id]);
      if (isSkipped) {
        skippedList.push({
          exerciseName: ex.name,
          reason: skippedExercises[ex.id]
        });
        return; // Exercício pulado NÃO é contado como concluído!
      }

      let doneInEx = 0;
      for (let s = 0; s < ex.sets; s++) {
        const setRec = savedSets[getSetKey(dayIndex, ex.id, s)];
        if (setRec?.done) {
          doneInEx++;
          totalDoneSets++;
          const w = parseFloat(setRec.weightKg || '0') || 0;
          totalVolumeKg += w * (parseInt(ex.reps.split('-')[0], 10) || 10);
        }
      }

      if (doneInEx === ex.sets) {
        completedExCount++;
      }
    });

    const totalSetsAll = exercises.reduce((sum, e) => sum + e.sets, 0);

    onFinishWorkout({
      completedExercisesCount: completedExCount,
      skippedExercises: skippedList,
      totalWeightVolumeKg: Math.round(totalVolumeKg),
      durationSeconds: workoutSeconds,
      completedSets: totalDoneSets,
      totalSets: totalSetsAll
    });
  };

  return (
    <div className="flex flex-col gap-3.5 text-neutral-100 pb-20 animate-in fade-in">
      
      {/* BARRA SUPERIOR HUD: PROGRESSO DA SESSÃO */}
      <div className="p-3.5 rounded-2xl bg-[#0E121A] border border-white/10 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
            disabled={activeIdx === 0}
            className="p-1.5 rounded-xl bg-white/5 text-neutral-400 hover:text-white disabled:opacity-30 tap-haptic"
            aria-label="Exercício Anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
              EXERCÍCIO {activeIdx + 1} DE {exercises.length} · {athleteName.toUpperCase()}
            </span>
            <strong className="text-xs font-mono font-black text-white block">
              {workout.focusTag} · {completedSetsThisEx}/{currentEx.sets} SÉRIES
            </strong>
          </div>

          <button
            onClick={() => setActiveIdx((prev) => Math.min(exercises.length - 1, prev + 1))}
            disabled={activeIdx === exercises.length - 1}
            className="p-1.5 rounded-xl bg-white/5 text-neutral-400 hover:text-white disabled:opacity-30 tap-haptic"
            aria-label="Próximo Exercício"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          onClick={() => setSessionMapOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono font-bold text-neutral-300 flex items-center gap-1.5 tap-haptic border border-white/10"
        >
          <Layers size={13} style={{ color: accentColor }} />
          <span>Mapa ({exercises.length})</span>
        </button>
      </div>

      {/* CARD DO EXERCÍCIO SEQUENCIAL ATIVO */}
      <div className="p-5 rounded-3xl bg-[#0B0E15] border border-[rgba(255,255,255,0.08)] shadow-2xl relative overflow-hidden flex flex-col gap-4">
        
        {/* Glow dinâmico de fundo */}
        <div
          className="absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        {/* TRANSITION OVERLAY AO CONCLUIR EXERCÍCIO */}
        {transitioning && (
          <div className="absolute inset-0 bg-[#07090C]/90 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 size={44} style={{ color: accentColor }} className="animate-bounce" />
            <strong className="text-base font-black text-white">Exercício Concluído!</strong>
            <span className="text-xs text-neutral-400 font-mono">Avançando para o próximo...</span>
          </div>
        )}

        {/* HEADER DO EXERCÍCIO */}
        <div className="flex items-start justify-between gap-3 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[9px] font-mono font-black uppercase px-2.5 py-0.5 rounded-md border"
                style={{
                  backgroundColor: `${accentColor}15`,
                  borderColor: `${accentColor}40`,
                  color: accentColor
                }}
              >
                {currentEx.muscleGroup}
              </span>
              {activeIdx === 0 && (
                <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-400">
                  ★ ÂNCORA
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 tracking-tight">
              {currentEx.name}
            </h3>
            <span className="text-[11px] font-mono text-neutral-400 block mt-0.5">
              Máquina: {currentEx.machines.primary.name}
            </span>
          </div>

          {onOpenDetailModal && (
            <button
              onClick={() => onOpenDetailModal(currentEx)}
              className="text-[10px] font-mono font-bold text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/5 tap-haptic"
            >
              Guia 2D
            </button>
          )}
        </div>

        {/* ANIMAÇÃO BIOMECÂNICA 2D VETORIAL */}
        <div className="w-full rounded-2xl overflow-hidden bg-black/40 border border-white/5 p-2 z-10">
          <ExerciseAnimation
            key={`${currentEx.id}-${currentEx.activeVariantId || currentEx.animationKey}`}
            animationKey={currentEx.animationKey}
            exerciseName={currentEx.name}
            equipmentName={currentEx.machines?.primary?.name}
            accentColor={accentColor}
          />
        </div>

        {/* CONTROLE DE SÉRIE ATIVA */}
        <div className="p-4 rounded-2xl bg-[#0E121A] border border-white/10 flex flex-col gap-3 z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-neutral-400">
              Série {currentSetNumber} de {currentEx.sets}
            </span>
            <span className="text-xs font-mono font-bold text-white">
              Alvo: {currentEx.reps} reps · Descanso: {currentEx.restSeconds}s
            </span>
          </div>

          {/* CÁPSULAS VISUAIS DE SÉRIES */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {Array.from({ length: currentEx.sets }).map((_, sIdx) => {
              const k = getSetKey(dayIndex, currentEx.id, sIdx);
              const done = savedSets[k]?.done;
              const isCurrent = sIdx === currentSetNumber - 1;

              return (
                <button
                  key={sIdx}
                  onClick={() => !isReadOnly && onToggleSet(currentEx.id, sIdx)}
                  className={`py-2 rounded-xl text-xs font-mono font-black flex items-center justify-center gap-1 transition-all tap-haptic border ${
                    done
                      ? 'bg-[#C4F53C]/20 border-[#C4F53C] text-[#C4F53C]'
                      : isCurrent
                      ? 'bg-white/15 border-white text-white shadow-md'
                      : 'bg-white/[0.03] border-white/10 text-neutral-500'
                  }`}
                  style={done ? { backgroundColor: `${accentColor}25`, borderColor: accentColor, color: accentColor } : undefined}
                >
                  {done ? <CheckCircle2 size={13} /> : `S${sIdx + 1}`}
                </button>
              );
            })}
          </div>

          {/* AJUSTE DE CARGA (NUMERICINPUT + STEPPERS) */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
              Carga da Série
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleWeightAdjust(-2.5)}
                disabled={isReadOnly}
                className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono font-bold text-neutral-300 tap-haptic"
              >
                -2.5
              </button>

              <div className="w-20 p-1 rounded-xl bg-black/50 border border-white/10">
                <NumericInput
                  value={currentSetWeightNum}
                  onChange={(val) => {
                    if (isReadOnly) return;
                    onUpdateSetWeight(currentEx.id, Math.max(0, currentSetNumber - 1), val !== null ? String(val) : '');
                  }}
                  allowDecimals={true}
                  placeholder="0"
                  className="w-full text-center text-xs font-mono font-bold text-white bg-transparent focus:outline-none"
                />
              </div>

              <span className="text-[10px] font-mono text-neutral-400">kg</span>

              <button
                type="button"
                onClick={() => handleWeightAdjust(2.5)}
                disabled={isReadOnly}
                className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono font-bold text-neutral-300 tap-haptic"
              >
                +2.5
              </button>
            </div>
          </div>
        </div>

        {/* AÇÕES PRINCIPAIS: CONCLUIR SÉRIE / PULAR */}
        <div className="flex items-center gap-2.5 z-10 pt-1">
          <button
            onClick={() => setSkipModalOpen(true)}
            disabled={isReadOnly}
            className="py-3 px-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 tap-haptic border border-white/10"
            title="Pular este exercício"
          >
            <FastForward size={14} />
            <span>Pular</span>
          </button>

          <button
            onClick={handleCompleteCurrentSet}
            disabled={isReadOnly}
            className="flex-1 py-3.5 px-4 rounded-2xl font-black text-xs text-[#07090C] shadow-xl flex items-center justify-center gap-2 transition-all tap-haptic"
            style={{ backgroundColor: accentColor }}
          >
            <CheckCircle2 size={16} />
            <span>CONCLUIR SÉRIE {currentSetNumber}</span>
          </button>
        </div>

      </div>

      {/* FINALIZADOR CARDIO METABÓLICO */}
      <div className="p-4 rounded-3xl bg-[#0E121A] border border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Flame size={18} />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase font-black text-amber-400 block">
              FINALIZADOR · {workout.finishCardio.durationMin} MIN
            </span>
            <strong className="text-xs font-black text-white block">
              {workout.finishCardio.name}
            </strong>
          </div>
        </div>

        <button
          onClick={handleFinalize}
          className="py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5 tap-haptic border border-white/10"
        >
          <Trophy size={14} style={{ color: accentColor }} />
          <span>Finalizar Sessão</span>
        </button>
      </div>

      {/* MODAL DE PULAR EXERCÍCIO COM MOTIVO */}
      {skipModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0E121A] border border-white/15 p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle size={18} />
                <strong className="text-sm font-black text-white">Pular Exercício</strong>
              </div>
              <button
                onClick={() => setSkipModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Deseja pular <strong>{currentEx.name}</strong>? Ele não será contabilizado como concluído no resumo final.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                Motivo (opcional):
              </label>
              <select
                value={selectedSkipReason}
                onChange={(e) => setSelectedSkipReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none"
              >
                {SKIP_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setSkipModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-neutral-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSkip}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-black"
              >
                Confirmar Pulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: MAPA COMPLETO DA SESSÃO */}
      {sessionMapOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md max-h-[85vh] rounded-3xl bg-[#0B0E15] border border-white/15 p-5 flex flex-col gap-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <strong className="text-sm font-black text-white block">
                  Mapa da Sessão de Treino
                </strong>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Toque em qualquer exercício para navegar ou retomar pendências
                </span>
              </div>
              <button
                onClick={() => setSessionMapOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto pr-1">
              {exercises.map((ex, idx) => {
                const status = getExerciseStatus(ex);
                const isCurrent = idx === activeIdx;

                return (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setActiveIdx(idx);
                      setSessionMapOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all tap-haptic flex items-center justify-between ${
                      isCurrent
                        ? 'bg-white/10 border-white text-white'
                        : 'bg-[#0E121A] border-white/5 text-neutral-300 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center text-xs font-mono font-bold text-neutral-400">
                        {idx + 1}
                      </span>
                      <div>
                        <strong className="text-xs font-black block text-white">
                          {ex.name}
                        </strong>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {ex.sets} séries · {ex.reps} reps
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md border ${
                        status === 'concluido'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : status === 'pulado'
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                          : status === 'em_andamento'
                          ? 'bg-sky-500/15 border-sky-500/40 text-sky-400'
                          : 'bg-white/5 border-white/10 text-neutral-500'
                      }`}
                    >
                      {status === 'concluido'
                        ? 'CONCLUÍDO'
                        : status === 'pulado'
                        ? 'PULADO'
                        : status === 'em_andamento'
                        ? 'EM CURSO'
                        : 'PENDENTE'}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setSessionMapOpen(false)}
              className="w-full py-3 rounded-2xl bg-white/10 text-xs font-mono font-bold text-white hover:bg-white/20"
            >
              Voltar ao Exercício Ativo
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
