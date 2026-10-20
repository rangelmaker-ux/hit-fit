"use client";

import React from 'react';
import { Exercise } from '@/lib/workout-data';
import { Sparkles, Layers, Check, Plus, Minus, ArrowRight } from 'lucide-react';

interface ExerciseCardRowProps {
  exercise: Exercise;
  index: number;
  athleteName: string;
  accentColor: string;
  savedSets: Record<string, { done: boolean; weightKg?: string }>;
  getSetKey: (dayIdx: number, exerciseId: string, setIdx: number) => string;
  dayIndex: number;
  onToggleSet: (exerciseId: string, setIdx: number) => void;
  onUpdateSetWeight: (exerciseId: string, setIdx: number, weight: string) => void;
  onOpenDetail: (exercise: Exercise) => void;
}

export function ExerciseCardRow({
  exercise,
  index,
  athleteName,
  accentColor,
  savedSets,
  getSetKey,
  dayIndex,
  onToggleSet,
  onUpdateSetWeight,
  onOpenDetail
}: ExerciseCardRowProps) {
  const isAnchor = index === 0;

  const handleAdjustWeight = (setIdx: number, delta: number) => {
    const key = getSetKey(dayIndex, exercise.id, setIdx);
    const current = parseFloat(savedSets[key]?.weightKg || '0');
    const nextVal = Math.max(0, current + delta);
    onUpdateSetWeight(exercise.id, setIdx, nextVal.toString());
  };

  return (
    <article
      className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${
        isAnchor
          ? 'bg-[#0E131C] border border-[rgba(255,255,255,0.12)] shadow-[0_12px_32px_rgba(0,0,0,0.6)]'
          : 'bg-[#0C0F16] border border-[rgba(255,255,255,0.06)] hover:border-white/15'
      }`}
    >
      {/* Indicador de Âncora no topo se for o primeiro exercício */}
      {isAnchor && (
        <div className="w-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent h-[1px]" />
      )}

      <div className="p-4 sm:p-5 flex flex-col gap-3.5">
        
        {/* Cabeçalho do Exercício */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono font-bold text-neutral-400">
                0{index + 1}
              </span>
              {isAnchor ? (
                <span
                  className="text-[9px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider border"
                  style={{
                    backgroundColor: `${accentColor}18`,
                    borderColor: `${accentColor}50`,
                    color: accentColor
                  }}
                >
                  EXERCÍCIO ÂNCORA
                </span>
              ) : (
                <span className="text-[9px] uppercase font-bold text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md">
                  {exercise.targetMuscle}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug truncate">
              {exercise.name}
            </h3>
            <p className="text-xs text-neutral-400 font-medium mt-0.5">
              {exercise.sets} séries · {exercise.reps} repetições · {exercise.restSeconds}s descanso
            </p>
          </div>

          {/* Botão de Ver Máquina & Movimento */}
          <button
            onClick={() => onOpenDetail(exercise)}
            className="py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-white flex items-center gap-1.5 transition-all tap-haptic border border-white/10 shrink-0"
            aria-label={`Ver máquina e movimento de ${exercise.name}`}
          >
            <Sparkles size={13} style={{ color: accentColor }} />
            <span className="hidden sm:inline">Ver Máquina</span>
            <ArrowRight size={12} className="text-neutral-400" />
          </button>
        </div>

        {/* Badge do Equipamento Primário */}
        <div className="text-xs text-neutral-300 bg-[#07090C] p-2.5 rounded-2xl border border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
            <Layers size={13} style={{ color: accentColor }} />
            Equipamento:
          </span>
          <strong className="text-white text-xs truncate max-w-[200px] sm:max-w-[260px]">
            {exercise.machines.primary.name}
          </strong>
        </div>

        {/* SÉRIES E CARGAS (CÁPSULAS TÁTEIS) */}
        <div className="flex flex-col gap-2 pt-1 border-t border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono tracking-wider">
              Séries de {athleteName}:
            </span>
            <span className="text-[10px] text-neutral-500">Toque para marcar e iniciar descanso</span>
          </div>

          <div className="grid grid-cols-2 min-[380px]:grid-cols-3 sm:grid-cols-4 gap-2">
            {Array.from({ length: exercise.sets }).map((_, sIdx) => {
              const setKey = getSetKey(dayIndex, exercise.id, sIdx);
              const state = savedSets[setKey] || { done: false, weightKg: '' };

              return (
                <div
                  key={sIdx}
                  className={`p-2.5 rounded-2xl border transition-all duration-200 flex flex-col gap-1.5 tap-haptic ${
                    state.done
                      ? 'bg-[#101C12] border-emerald-500/50 shadow-[0_4px_16px_rgba(16,185,129,0.15)] text-white'
                      : 'bg-[#080B10] border-[rgba(255,255,255,0.08)] text-neutral-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-tight">SÉRIE 0{sIdx + 1}</span>
                    <button
                      onClick={() => onToggleSet(exercise.id, sIdx)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        state.done
                          ? 'bg-emerald-400 text-black shadow-md scale-105'
                          : 'bg-white/10 hover:bg-white/20 text-neutral-300'
                      }`}
                      aria-label={`Concluir série ${sIdx + 1}`}
                    >
                      {state.done ? <Check size={14} strokeWidth={3} /> : sIdx + 1}
                    </button>
                  </div>

                  {/* Campo de Carga com Micro-Steppers (+ / -) */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => handleAdjustWeight(sIdx, -2.5)}
                      className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center shrink-0"
                      aria-label="Diminuir 2.5 kg"
                    >
                      <Minus size={10} />
                    </button>

                    <div className="flex items-center justify-center gap-0.5 flex-1 min-w-0">
                      <input
                        type="text"
                        placeholder="0"
                        value={state.weightKg || ''}
                        onChange={(e) => onUpdateSetWeight(exercise.id, sIdx, e.target.value)}
                        className="w-10 text-center text-base font-mono font-bold bg-transparent text-white outline-none p-0"
                      />
                      <span className="text-[10px] font-mono text-neutral-400">kg</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdjustWeight(sIdx, 2.5)}
                      className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center shrink-0"
                      aria-label="Aumentar 2.5 kg"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </article>
  );
}
