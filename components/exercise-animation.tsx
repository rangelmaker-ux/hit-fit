"use client";

import React, { useEffect, useState } from 'react';
import { Play, Pause, Wind, Flame, Eye, Compass } from 'lucide-react';
import {
  SquatLegPressSvg,
  LegExtensionSvg,
  LegCurlSvg,
  CalfRaiseSvg,
  PulldownSvg,
  CableRowSvg,
  BicepsCurlSvg,
  ShoulderPressSvg,
  HipThrustSvg,
  ChestPressFlySvg,
  PlankCoreSvg
} from './exercise-svg-models';

interface ExerciseAnimationProps {
  animationKey: string;
  exerciseName?: string;
  accentColor?: string;
}

export function ExerciseAnimation({
  animationKey,
  exerciseName = 'exercício',
  accentColor = '#c3f75a'
}: ExerciseAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState<'concentric' | 'eccentric'>('concentric');
  const [isTechnicalMode, setIsTechnicalMode] = useState(false);

  const isIsometric = animationKey === 'plank';

  // Alterna o ritmo biomecânico (fase concêntrica / excêntrica) para guiar respiração
  useEffect(() => {
    if (!isPlaying || isIsometric) return;
    const interval = setInterval(() => {
      setPhase((prev) => (prev === 'concentric' ? 'eccentric' : 'concentric'));
    }, 2200);
    return () => clearInterval(interval);
  }, [isPlaying, isIsometric]);

  // Cues específicos de respiração e cadência por padrão motor
  const getBiomechanicsCues = () => {
    if (isIsometric) {
      return {
        breathing: 'Respiração contínua e diafragmática (nunca tranque o ar)',
        cadence: 'Isometria: Sustentação de 45 a 60s',
        concentricLabel: 'Estabilização de Core',
        eccentricLabel: 'Contração Isométrica'
      };
    }
    if (['pulldown', 'row', 'singleRow'].includes(animationKey)) {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Puxando ao corpo)' : 'PUXE O AR (Retorno alongando)',
        cadence: 'Cadência: 2s puxada · 1s pico · 3s retorno',
        concentricLabel: 'Fase de Tração (Dorsal)',
        eccentricLabel: 'Fase Excêntrica (Alongamento)'
      };
    }
    if (['benchpress', 'inclineBench', 'fly', 'shoulderPress'].includes(animationKey)) {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Empurrando o peso)' : 'PUXE O AR (Descida controlada)',
        cadence: 'Cadência: 2s subida · 3s descida lenta',
        concentricLabel: 'Fase de Empurrada',
        eccentricLabel: 'Fase de Alongamento'
      };
    }
    if (['hipthrust', 'abductor'].includes(animationKey)) {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Pico no topo)' : 'PUXE O AR (Descendo suave)',
        cadence: 'Cadência: 2s subida · 2s pausa no topo · 3s descida',
        concentricLabel: 'Extensão Máxima de Quadril',
        eccentricLabel: 'Retorno sem encostar no chão'
      };
    }
    return {
      breathing: phase === 'concentric' ? 'SOLTE O AR (Fase de Maior Força)' : 'PUXE O AR (Descida / Alongamento)',
      cadence: 'Cadência: 2s concêntrica · 3s excêntrica',
      concentricLabel: 'Fase Concêntrica (Força)',
      eccentricLabel: 'Fase Excêntrica (Controle)'
    };
  };

  const cues = getBiomechanicsCues();

  return (
    <div 
      aria-label={`Guia visual de ${exerciseName}`}
      className="relative w-full overflow-hidden rounded-2xl bg-[#0D1117] border border-[#21262D] shadow-xl p-4 flex flex-col items-center"
    >
      {/* Indicador de fase e respiração no topo */}
      <div className="w-full flex items-center justify-between mb-3 px-1 text-xs">
        <div className="flex items-center gap-1.5 font-medium truncate max-w-[70%]">
          <Wind className="w-4 h-4 text-sky-400 shrink-0 animate-pulse" />
          <span className="text-neutral-200 truncate">
            {cues.breathing}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsTechnicalMode(!isTechnicalMode)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              isTechnicalMode
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-white/5 hover:bg-white/10 text-neutral-400'
            }`}
            title="Alternar entre modo dinâmico e visualização de ângulos técnicos"
            aria-label="Alternar modo técnico"
          >
            {isTechnicalMode ? <Compass size={14} /> : <Eye size={14} />}
            <span className="hidden sm:inline text-[10px] font-bold">
              {isTechnicalMode ? 'Técnico' : 'Ângulos'}
            </span>
          </button>

          {!isIsometric && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors border border-white/5"
              aria-label={isPlaying ? 'Pausar animação' : 'Reproduzir animação'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
            </button>
          )}
        </div>
      </div>

      {/* Janela de Animação 2D Vetorial */}
      <div className="relative w-full h-52 flex items-center justify-center bg-[#090D12] rounded-xl border border-[#21262D] overflow-hidden">
        {/* Grade técnica milimétrica de fundo */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}
        />

        {/* Modelo SVG específico do exercício */}
        <div className={`transition-all duration-700 ease-in-out ${isPlaying ? '' : 'opacity-90'}`}>
          {renderExerciseComponent(animationKey, phase, accentColor, isTechnicalMode)}
        </div>

        {/* Barra de Ritmo de Movimento */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-neutral-300 bg-[#161B22]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#21262D]">
          <span className="flex items-center gap-1 font-medium truncate">
            <Flame size={12} style={{ color: accentColor }} className="shrink-0" />
            <span className="truncate">{cues.cadence}</span>
          </span>
          <span className="font-mono text-neutral-400 uppercase tracking-wider text-[9px] shrink-0 ml-1">
            {phase === 'concentric' ? cues.concentricLabel : cues.eccentricLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function renderExerciseComponent(
  key: string,
  phase: 'concentric' | 'eccentric',
  accentColor: string,
  isTechnicalMode: boolean
) {
  switch (key) {
    case 'squat':
    case 'legpress':
    case 'bulgarian':
      return <SquatLegPressSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'legext':
      return <LegExtensionSvg phase={phase} accentColor={accentColor} />;

    case 'legcurl':
      return <LegCurlSvg phase={phase} accentColor={accentColor} />;

    case 'calf':
      return <CalfRaiseSvg phase={phase} accentColor={accentColor} />;

    case 'pulldown':
      return <PulldownSvg phase={phase} accentColor={accentColor} />;

    case 'row':
    case 'singleRow':
      return <CableRowSvg phase={phase} accentColor={accentColor} />;

    case 'biceps':
    case 'hammer':
      return <BicepsCurlSvg phase={phase} accentColor={accentColor} />;

    case 'shoulderPress':
    case 'lateralRaise':
    case 'facepull':
    case 'tricepsRope':
      return <ShoulderPressSvg phase={phase} accentColor={accentColor} />;

    case 'hipthrust':
    case 'abductor':
      return <HipThrustSvg phase={phase} accentColor={accentColor} />;

    case 'benchpress':
    case 'inclineBench':
    case 'fly':
      return <ChestPressFlySvg phase={phase} accentColor={accentColor} />;

    case 'plank':
      return <PlankCoreSvg accentColor={accentColor} />;

    default:
      return <SquatLegPressSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
  }
}
