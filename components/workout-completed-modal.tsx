"use client";

import React from 'react';
import { Trophy } from 'lucide-react';

interface WorkoutCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteName: string;
  workoutTitle: string;
  workoutSeconds: number;
  completedSets: number;
  totalSets: number;
  accentColor: string;
}

export function WorkoutCompletedModal({
  isOpen,
  onClose,
  athleteName,
  workoutTitle,
  workoutSeconds,
  completedSets,
  totalSets,
  accentColor
}: WorkoutCompletedModalProps) {
  if (!isOpen) return null;

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#0B0E15] border border-[rgba(255,255,255,0.12)] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 text-neutral-100"
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
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">
            Sessão Registrada
          </span>
          <h3 className="text-xl font-black text-white mt-0.5">Parabéns, {athleteName}!</h3>
          <p className="text-xs text-neutral-300 mt-1">{workoutTitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full pt-1">
          <div className="bg-[#07090C] p-3 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <span className="text-[9px] font-mono text-neutral-400 uppercase block">Tempo Total</span>
            <strong className="text-base font-black font-mono text-white">{formatTimer(workoutSeconds)}</strong>
          </div>
          <div className="bg-[#07090C] p-3 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <span className="text-[9px] font-mono text-neutral-400 uppercase block">Séries Concluídas</span>
            <strong className="text-base font-black font-mono" style={{ color: accentColor }}>
              {completedSets} / {totalSets}
            </strong>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl font-bold text-xs shadow-md transition-transform active:scale-95 text-[#07090C]"
          style={{ backgroundColor: accentColor }}
        >
          Salvar e Fechar Sessão
        </button>
      </div>
    </div>
  );
}
