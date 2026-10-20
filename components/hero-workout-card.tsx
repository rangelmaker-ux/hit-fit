"use client";

import React from 'react';
import { DayWorkout } from '@/lib/workout-data';
import { Clock } from 'lucide-react';

interface HeroWorkoutCardProps {
  workout: DayWorkout;
  currentPersonName: string;
  progressPct: number;
  completedSets: number;
  totalSets: number;
  accentColor: string;
}

export function HeroWorkoutCard({
  workout,
  currentPersonName,
  progressPct,
  completedSets,
  totalSets,
  accentColor
}: HeroWorkoutCardProps) {
  // Cálculo do raio e arco do HUD Circular
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#0D111A] border border-[rgba(255,255,255,0.09)] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)] surface-sheen">
      {/* Luz ambiente atmosférica profunda */}
      <div
        className="absolute -top-24 -left-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-25 animate-hero-glow"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative p-5 sm:p-6 flex flex-col gap-5">
        
        {/* Top Meta Header: Tag de Bloco e Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-mono font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md border"
              style={{
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}40`,
                color: accentColor
              }}
            >
              {workout.focusTag}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
            <Clock size={13} style={{ color: accentColor }} />
            <span>{workout.durationMin} MINUTOS</span>
          </div>
        </div>

        {/* Bloco Central: Título Atlético e HUD Circular */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {workout.title}
            </h1>
            <p className="text-xs text-neutral-300 mt-1 line-clamp-2 leading-relaxed">
              {workout.subtitle}
            </p>

            <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-neutral-400">
              <span>Atleta:</span>
              <strong className="text-white font-bold">{currentPersonName}</strong>
            </div>
          </div>

          {/* Kinetic Radial Telemetry Arc (HUD Circular de Séries) */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Trilho de fundo */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="7"
              />
              {/* Arco de progresso ativo com neon glow */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={accentColor}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700 ease-out"
                style={{
                  filter: `drop-shadow(0 0 6px ${accentColor}80)`
                }}
              />
            </svg>

            {/* Núcleo de Leitura Numérica */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black font-mono tracking-tight text-white leading-none">
                {progressPct}%
              </span>
              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-tighter mt-1">
                {completedSets}/{totalSets} SÉRIES
              </span>
            </div>
          </div>
        </div>

        {/* Telemetria Segmentada Inferior: 3 Pilares com Linhas de Precisão */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[rgba(255,255,255,0.07)] text-center">
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[8px] font-mono uppercase text-neutral-400 tracking-wider block">VOLUME</span>
            <strong className="text-xs font-mono font-bold text-white mt-0.5 block">{totalSets} Séries</strong>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[8px] font-mono uppercase text-neutral-400 tracking-wider block">ESTÍMULO</span>
            <strong className="text-xs font-bold text-sky-300 mt-0.5 block">Recomposição</strong>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[8px] font-mono uppercase text-neutral-400 tracking-wider block">ESTIMATIVA</span>
            <strong className="text-xs font-mono font-bold text-amber-300 mt-0.5 block">~480 kcal</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
