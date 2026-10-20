"use client";

import React from 'react';
import { DayWorkout } from '@/lib/workout-data';
import { Droplets, Scale, Target, Play, ChevronRight, Sparkles } from 'lucide-react';

interface HomeSummaryViewProps {
  athleteName: string;
  avatarUrl: string | null;
  accentColor: string;
  todayWorkout: DayWorkout;
  progressPct: number;
  completedSets: number;
  totalSets: number;
  waterConsumedMl: number;
  waterGoalMl: number;
  currentWeightKg: number;
  targetWeightKg: number;
  onOpenWorkout: () => void;
  onOpenHealthSubTab: (subTab: 'agua' | 'peso' | 'meta' | 'alimentacao') => void;
  onOpenProfile: () => void;
}

export function HomeSummaryView({
  athleteName,
  avatarUrl,
  accentColor,
  todayWorkout,
  progressPct,
  completedSets,
  totalSets,
  waterConsumedMl,
  waterGoalMl,
  currentWeightKg,
  targetWeightKg,
  onOpenWorkout,
  onOpenHealthSubTab,
  onOpenProfile
}: HomeSummaryViewProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const waterPct = Math.min(100, Math.round((waterConsumedMl / Math.max(1, waterGoalMl)) * 100));
  const diffToGoal = Math.round(Math.abs(currentWeightKg - targetWeightKg) * 10) / 10;

  return (
    <div className="flex flex-col gap-4 text-neutral-100 pb-20 animate-in fade-in">
      
      {/* CARD DE SAUDAÇÃO & FOTO */}
      <div className="p-5 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.08)] shadow-xl flex items-center justify-between relative overflow-hidden">
        <div
          className="absolute -top-16 -left-16 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        <div className="flex items-center gap-3.5 z-10">
          <button
            onClick={onOpenProfile}
            className="relative w-14 h-14 rounded-full p-0.5 border-2 shadow-lg flex items-center justify-center overflow-hidden tap-haptic"
            style={{ borderColor: accentColor }}
            title="Ver e Editar Perfil"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={athleteName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center font-black text-xl"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                {athleteName[0]}
              </div>
            )}
          </button>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
              {getGreeting()}, Atleta
            </span>
            <h1 className="text-xl font-black text-white tracking-tight leading-tight">
              {athleteName}
            </h1>
          </div>
        </div>

        <button
          onClick={onOpenProfile}
          className="text-xs font-mono font-bold text-neutral-400 hover:text-white flex items-center gap-1 p-2 rounded-xl bg-white/[0.04] tap-haptic z-10"
        >
          <span>Perfil</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* TREINO DE HOJE (CARD RESUMO COMPACTO) */}
      <div className="p-5 rounded-3xl bg-[#0D111A] border border-[rgba(255,255,255,0.09)] shadow-xl flex flex-col gap-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span
            className="text-[9px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-md border"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}40`,
              color: accentColor
            }}
          >
            TREINO DE HOJE · {todayWorkout.focusTag}
          </span>
          <span className="text-xs font-mono font-bold text-neutral-400">
            {todayWorkout.durationMin} MIN
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {todayWorkout.title}
          </h2>
          <p className="text-xs text-neutral-300 mt-1 line-clamp-1">
            {todayWorkout.subtitle}
          </p>
        </div>

        {/* Mini Barra de Progresso */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-400">Séries Concluídas</span>
            <strong className="font-bold" style={{ color: accentColor }}>
              {progressPct}% ({completedSets}/{totalSets})
            </strong>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: accentColor }}
            />
          </div>
        </div>

        <button
          onClick={onOpenWorkout}
          className="w-full py-3 px-4 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 text-black transition-transform active:scale-95 mt-1"
          style={{ backgroundColor: accentColor }}
        >
          <Play size={14} fill="currentColor" />
          <span>Abrir Treino Completo</span>
        </button>
      </div>

      {/* PEQUENOS RESUMOS CLICÁVEIS (ÁGUA, PESO, META) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Sparkles size={13} style={{ color: accentColor }} />
            Indicadores Rápidos de Saúde
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">Toque para abrir</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          
          {/* Card Resumo Água */}
          <button
            onClick={() => onOpenHealthSubTab('agua')}
            className="p-3.5 rounded-2xl bg-[#0E121A] hover:bg-[#151A24] border border-[rgba(255,255,255,0.07)] text-left flex flex-col justify-between gap-2.5 transition-all tap-haptic shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-black text-sky-400 uppercase tracking-wider">
                ÁGUA
              </span>
              <Droplets size={14} className="text-sky-400" />
            </div>

            <div>
              <strong className="text-sm sm:text-base font-black font-mono text-white block leading-tight">
                {Math.round(waterConsumedMl / 100) / 10} / {Math.round(waterGoalMl / 100) / 10}L
              </strong>
              <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">
                {waterPct}% da meta
              </span>
            </div>
          </button>

          {/* Card Resumo Peso Atual */}
          <button
            onClick={() => onOpenHealthSubTab('peso')}
            className="p-3.5 rounded-2xl bg-[#0E121A] hover:bg-[#151A24] border border-[rgba(255,255,255,0.07)] text-left flex flex-col justify-between gap-2.5 transition-all tap-haptic shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-black uppercase tracking-wider" style={{ color: accentColor }}>
                PESO
              </span>
              <Scale size={14} style={{ color: accentColor }} />
            </div>

            <div>
              <strong className="text-sm sm:text-base font-black font-mono text-white block leading-tight">
                {currentWeightKg} kg
              </strong>
              <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">
                Ver evolução
              </span>
            </div>
          </button>

          {/* Card Resumo Meta de Peso */}
          <button
            onClick={() => onOpenHealthSubTab('meta')}
            className="p-3.5 rounded-2xl bg-[#0E121A] hover:bg-[#151A24] border border-[rgba(255,255,255,0.07)] text-left flex flex-col justify-between gap-2.5 transition-all tap-haptic shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-black text-amber-400 uppercase tracking-wider">
                META
              </span>
              <Target size={14} className="text-amber-400" />
            </div>

            <div>
              <strong className="text-sm sm:text-base font-black font-mono text-white block leading-tight">
                {targetWeightKg} kg
              </strong>
              <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">
                {diffToGoal === 0 ? 'Alcançada!' : `Faltam ${diffToGoal}kg`}
              </span>
            </div>
          </button>

        </div>
      </div>

    </div>
  );
}
