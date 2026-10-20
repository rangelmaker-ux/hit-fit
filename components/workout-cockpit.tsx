"use client";

import React from 'react';
import {
  Play,
  Pause,
  Trophy,
  Dumbbell,
  Utensils,
  TrendingUp,
  UsersRound,
  Timer
} from 'lucide-react';

interface WorkoutCockpitProps {
  workoutActive: boolean;
  workoutSeconds: number;
  onToggleWorkout: () => void;
  restActive: boolean;
  restSeconds: number;
  onStartRest: (seconds: number) => void;
  canFinishWorkout: boolean;
  onFinishWorkout: () => void;
  viewTab: 'treino' | 'nutricao' | 'evolucao' | 'duo';
  onSelectTab: (tab: 'treino' | 'nutricao' | 'evolucao' | 'duo') => void;
  accentColor: string;
}

export function WorkoutCockpit({
  workoutActive,
  workoutSeconds,
  onToggleWorkout,
  restActive,
  restSeconds,
  onStartRest,
  canFinishWorkout,
  onFinishWorkout,
  viewTab,
  onSelectTab,
  accentColor
}: WorkoutCockpitProps) {
  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const navItems: { id: 'treino' | 'nutricao' | 'evolucao' | 'duo'; label: string; icon: React.ElementType }[] = [
    { id: 'treino', label: 'Treino', icon: Dumbbell },
    { id: 'nutricao', label: 'Nutrição', icon: Utensils },
    { id: 'evolucao', label: 'Cargas', icon: TrendingUp },
    { id: 'duo', label: 'Duo Casal', icon: UsersRound }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-[#07090C]/90 backdrop-blur-2xl border-t border-[rgba(255,255,255,0.08)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 px-4 shadow-[0_-12px_40px_rgba(0,0,0,0.8)]">
      <div className="w-full max-w-lg flex flex-col gap-2.5">
        
        {/* CONSOLE DE TELEMETRIA DO TREINO (COCKPIT LIVE BAR) */}
        <div className="relative flex items-center justify-between gap-2 p-2 rounded-2xl bg-[#0D111A] border border-[rgba(255,255,255,0.08)] shadow-lg overflow-hidden">
          
          {/* Efeito sutil de brilho quando o treino está ativo */}
          {workoutActive && (
            <div
              className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-500"
              style={{
                background: `linear-gradient(90deg, ${accentColor} 0%, transparent 60%)`
              }}
            />
          )}

          {/* CRONÔMETRO GERAL */}
          <div className="flex items-center gap-2.5 z-10">
            <button
              onClick={onToggleWorkout}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-md transition-all duration-200 tap-haptic"
              style={{
                backgroundColor: workoutActive ? accentColor : 'rgba(255,255,255,0.08)',
                color: workoutActive ? '#07090C' : '#FFFFFF'
              }}
              aria-label={workoutActive ? 'Pausar Cronômetro' : 'Iniciar Treino'}
            >
              {workoutActive ? (
                <>
                  <span
                    className="absolute inset-0 rounded-xl animate-ping opacity-30"
                    style={{ backgroundColor: accentColor }}
                  />
                  <Pause size={17} />
                </>
              ) : (
                <Play size={17} fill="currentColor" className="ml-0.5" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-mono uppercase tracking-wider text-neutral-400 block font-bold">
                  {workoutActive ? 'AO VIVO' : 'CRONÔMETRO'}
                </span>
                {workoutActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </div>
              <strong className="text-base font-black font-mono tracking-tight text-white block leading-none mt-0.5">
                {formatTimer(workoutSeconds)}
              </strong>
            </div>
          </div>

          {/* BOTÃO CONCLUIR TREINO (SE ABERTO/INICIADO) */}
          {canFinishWorkout && (
            <button
              onClick={onFinishWorkout}
              className="z-10 py-1.5 px-3 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider transition-all duration-200 tap-haptic flex items-center gap-1.5 border shadow-lg"
              style={{
                backgroundColor: `${accentColor}20`,
                borderColor: `${accentColor}50`,
                color: accentColor
              }}
              title="Finalizar Treino e Registrar Troféu"
            >
              <Trophy size={13} />
              <span>CONCLUIR</span>
            </button>
          )}

          {/* TIMER DE DESCANSO REGRESSIVO */}
          <div className="flex items-center gap-2 pl-2 border-l border-[rgba(255,255,255,0.08)] z-10">
            <div className="text-right">
              <span className="text-[8px] font-mono uppercase tracking-wider text-neutral-400 block font-bold flex items-center justify-end gap-1">
                <Timer size={10} className={restActive ? 'text-amber-400 animate-spin' : 'text-neutral-400'} />
                DESCANSO
              </span>
              <strong
                className={`text-base font-black font-mono tracking-tight block leading-none mt-0.5 ${
                  restActive ? 'text-amber-300' : 'text-neutral-400'
                }`}
              >
                {formatTimer(restSeconds)}
              </strong>
            </div>

            <div className="flex items-center gap-1">
              {[45, 60, 90].map((sec) => (
                <button
                  key={sec}
                  onClick={() => onStartRest(sec)}
                  className={`px-2 py-1.5 text-[9px] font-mono font-bold rounded-lg transition-all tap-haptic ${
                    restActive && restSeconds === sec
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300'
                  }`}
                  aria-label={`Descanso de ${sec} segundos`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DOCK (4 PILARES DO HIT-FIT) */}
        <nav className="flex items-center justify-around px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = viewTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1.5 px-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 tap-haptic ${
                  isSelected ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="relative">
                  <Icon
                    size={20}
                    className="transition-transform duration-200"
                    style={isSelected ? { color: accentColor, transform: 'scale(1.1)' } : undefined}
                  />
                  {isSelected && (
                    <span
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                  )}
                </div>
                <span className={`text-[10px] tracking-tight ${isSelected ? 'font-black text-white' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

      </div>
    </footer>
  );
}
