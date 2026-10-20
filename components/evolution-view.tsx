"use client";

import React from 'react';
import { WORKOUT_DAYS } from '@/lib/workout-data';
import { 
  TrendingUp, 
  Dumbbell, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';

interface EvolutionViewProps {
  profileId: string;
  profileName: string;
  currentWeek: string;
  savedSets: Record<string, { done: boolean; weightKg?: string }>;
  accentColor?: string;
}

export function EvolutionView({
  profileId,
  profileName,
  currentWeek,
  savedSets,
  accentColor = '#c3f75a'
}: EvolutionViewProps) {
  // Lista exercícios com cargas registradas para este perfil
  const exerciseHistory: {
    dayName: string;
    exerciseName: string;
    targetMuscle: string;
    maxWeight: number;
    completedSetsCount: number;
    recommendedNextWeight: number;
  }[] = [];

  WORKOUT_DAYS.forEach((day, dIdx) => {
    day.exercises.forEach((ex) => {
      let maxW = 0;
      let completedCount = 0;

      for (let s = 0; s < ex.sets; s++) {
        const key = `${currentWeek}:${profileId}:${dIdx}:${ex.id}:${s}`;
        const item = savedSets[key];
        if (item?.done) {
          completedCount++;
          const w = parseFloat(item.weightKg || '0');
          if (w > maxW) maxW = w;
        }
      }

      if (maxW > 0 || completedCount > 0) {
        // Sugestão conservadora: +1 a 2 kg se completou todas as séries
        const nextW = completedCount >= ex.sets && maxW > 0 ? maxW + 2 : maxW;
        exerciseHistory.push({
          dayName: day.dayName,
          exerciseName: ex.name,
          targetMuscle: ex.targetMuscle,
          maxWeight: maxW,
          completedSetsCount: completedCount,
          recommendedNextWeight: nextW
        });
      }
    });
  });

  return (
    <div className="flex flex-col gap-5 text-neutral-100 pb-20 animate-in fade-in duration-300">
      
      {/* HEADER DA EVOLUÇÃO */}
      <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md border"
            style={{ 
              backgroundColor: `${accentColor}18`, 
              borderColor: `${accentColor}50`, 
              color: accentColor 
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                PROGRESSÃO DE CARGAS
              </span>
            </div>
            <h2 className="text-xl font-black text-white">{profileName}</h2>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-neutral-400 bg-white/5 px-2.5 py-1 rounded-xl">
          {currentWeek}
        </span>
      </div>

      {/* CARD DE SUGESTÃO DE PROGRESSÃO INTELIGENTE */}
      <div 
        className="p-5 rounded-3xl border relative overflow-hidden flex flex-col gap-3 shadow-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          borderColor: `${accentColor}40`
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Sparkles size={15} style={{ color: accentColor }} />
            Diretriz de Progressão Segura
          </span>
          <span 
            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            Sobrecarga Progressiva
          </span>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          Para hipertrofia e definição contínuas sem risco de lesão, aumente cargas de <strong>1kg a 2kg</strong> apenas quando conseguir completar todas as repetições da última série com postura impecável.
        </p>
      </div>

      {/* HISTÓRICO DE EXERCÍCIOS E CARGAS */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Dumbbell size={15} style={{ color: accentColor }} />
            Cargas Registradas na Semana ({exerciseHistory.length})
          </span>
          <span className="text-[11px] text-neutral-500">Mais recentes</span>
        </div>

        {exerciseHistory.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {exerciseHistory.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-white/20 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="text-[9px] uppercase font-bold px-2 py-0.2 rounded-full"
                      style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                    >
                      {item.targetMuscle}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {item.dayName}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{item.exerciseName}</h4>
                  <span className="text-[11px] text-neutral-400">
                    {item.completedSetsCount} séries registradas
                  </span>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="text-lg font-black font-mono text-white">
                    {item.maxWeight > 0 ? `${item.maxWeight} kg` : 'Feito'}
                  </div>
                  {item.recommendedNextWeight > item.maxWeight && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                      Meta: {item.recommendedNextWeight} kg <ArrowUpRight size={11} />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white/5 border border-white/5 text-center flex flex-col items-center gap-2 text-neutral-400">
            <Dumbbell size={28} className="text-neutral-600 mb-1" />
            <strong className="text-sm text-neutral-300">Nenhuma carga registrada nesta semana</strong>
            <p className="text-xs max-w-xs">
              Conforme você marcar suas séries e digitar os kg no treino, seu histórico e metas de progressão aparecerão automaticamente aqui.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
