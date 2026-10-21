"use client";

import React from 'react';
import { Trophy, CheckCircle2, AlertTriangle, Dumbbell, Timer } from 'lucide-react';

export interface SkippedExerciseSummary {
  exerciseName: string;
  reason?: string;
}

interface WorkoutCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteName: string;
  workoutTitle: string;
  workoutSeconds: number;
  completedSets: number;
  totalSets: number;
  accentColor: string;
  completedExercisesCount?: number;
  totalExercisesCount?: number;
  skippedExercises?: SkippedExerciseSummary[];
  totalWeightVolumeKg?: number;
  caloriesBurned?: number;
}

export function WorkoutCompletedModal({
  isOpen,
  onClose,
  athleteName,
  workoutTitle,
  workoutSeconds,
  completedSets,
  totalSets,
  accentColor,
  completedExercisesCount,
  totalExercisesCount,
  skippedExercises = [],
  totalWeightVolumeKg,
  caloriesBurned
}: WorkoutCompletedModalProps) {
  if (!isOpen) return null;

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto overflow-x-hidden"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm max-h-[90vh] bg-[#0B0E15] border border-[rgba(255,255,255,0.12)] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 text-neutral-100 overflow-y-auto box-border pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Resumo Real do Treino Concluído"
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
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">
            Resumo Real da Sessão
          </span>
          <h3 className="text-xl font-black text-white mt-0.5">Parabéns, {athleteName}!</h3>
          <p className="text-xs text-neutral-300 mt-1">{workoutTitle}</p>
        </div>

        {/* MÉTRICAS PRINCIPAIS (GRID) */}
        <div className="grid grid-cols-2 gap-2 w-full pt-1">
          <div className="bg-[#07090C] p-3 rounded-2xl border border-white/5 flex flex-col items-center">
            <span className="text-[9px] font-mono text-neutral-400 uppercase flex items-center gap-1">
              <Timer size={10} /> Tempo Real
            </span>
            <strong className="text-base font-black font-mono text-white mt-0.5">
              {formatTimer(workoutSeconds)}
            </strong>
          </div>

          <div className="bg-[#07090C] p-3 rounded-2xl border border-white/5 flex flex-col items-center">
            <span className="text-[9px] font-mono text-neutral-400 uppercase flex items-center gap-1">
              <CheckCircle2 size={10} style={{ color: accentColor }} /> Séries Feitas
            </span>
            <strong className="text-base font-black font-mono mt-0.5" style={{ color: accentColor }}>
              {completedSets} / {totalSets}
            </strong>
          </div>

          {completedExercisesCount !== undefined && totalExercisesCount !== undefined && (
            <div className="bg-[#07090C] p-3 rounded-2xl border border-white/5 flex flex-col items-center">
              <span className="text-[9px] font-mono text-neutral-400 uppercase">Exercícios 100%</span>
              <strong className="text-base font-black font-mono text-white mt-0.5">
                {completedExercisesCount} / {totalExercisesCount}
              </strong>
            </div>
          )}

          {totalWeightVolumeKg !== undefined && totalWeightVolumeKg > 0 && (
            <div className="bg-[#07090C] p-3 rounded-2xl border border-white/5 flex flex-col items-center">
              <span className="text-[9px] font-mono text-neutral-400 uppercase flex items-center gap-1">
                <Dumbbell size={10} /> Volume Total
              </span>
              <strong className="text-base font-black font-mono text-white mt-0.5">
                {totalWeightVolumeKg} kg
              </strong>
            </div>
          )}
        </div>

        {caloriesBurned !== undefined && (
          <div className="w-full bg-[#07090C] px-3.5 py-2.5 rounded-2xl border border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-400">Gasto Estimado</span>
            <strong className="text-white font-bold">{caloriesBurned} kcal</strong>
          </div>
        )}

        {/* LISTA DE EXERCÍCIOS PULADOS (COM MOTIVOS) */}
        {skippedExercises.length > 0 && (
          <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-left flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle size={14} />
              <strong className="text-xs font-bold">
                Exercícios Pulados ({skippedExercises.length})
              </strong>
            </div>
            <span className="text-[10px] text-amber-200/80 font-mono">
              Não contabilizados no total de concluídos:
            </span>
            <div className="flex flex-col gap-1.5 pt-1">
              {skippedExercises.map((sk, idx) => (
                <div key={idx} className="bg-black/40 p-2 rounded-xl border border-amber-500/20 text-xs">
                  <span className="font-bold text-white block">{sk.exerciseName}</span>
                  {sk.reason && (
                    <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                      Motivo: {sk.reason}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl font-black text-xs shadow-md transition-transform active:scale-95 text-[#07090C] mt-1"
          style={{ backgroundColor: accentColor }}
        >
          Confirmar e Salvar Histórico
        </button>
      </div>
    </div>
  );
}
