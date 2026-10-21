"use client";

import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Wind, Flame, Eye, Compass } from 'lucide-react';
import {
  SquatSmithSvg,
  LegPress45Svg,
  LegExtensionSvg,
  LegCurlSvg,
  CalfRaiseSvg,
  PulldownSvg,
  CableRowSvg,
  SingleArmRowSvg,
  BicepsCurlSvg,
  HammerCurlSvg,
  ShoulderPressSvg,
  LateralRaiseSvg,
  RearDeltFlySvg,
  TricepsRopePushdownSvg,
  HipThrustSvg,
  BulgarianSplitSquatSvg,
  SeatedAbductorSvg,
  BenchPressSvg,
  InclineBenchPressSvg,
  PeckDeckFlySvg,
  PlankCoreSvg,
  AnimationInPreparationSvg
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

  const handleRestart = () => {
    setPhase('concentric');
    setIsPlaying(true);
  };

  // Cues específicos de respiração e cadência por padrão biomecânico
  const getBiomechanicsCues = () => {
    if (isIsometric) {
      return {
        breathing: 'Respiração contínua e diafragmática (nunca tranque o ar)',
        cadence: 'Isometria: Sustentação de 45 a 60s',
        concentricLabel: 'Estabilização de Core',
        eccentricLabel: 'Contração Isométrica'
      };
    }
    if (animationKey === 'lateralRaise') {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Subindo até a altura dos ombros)' : 'PUXE O AR (Descendo suave sem bater halteres)',
        cadence: 'Cadência: 2s subida · 1s pico · 3s descida lenta',
        concentricLabel: 'Abdução de Braços (Deltóide Lateral)',
        eccentricLabel: 'Fase Excêntrica Controlada'
      };
    }
    if (animationKey === 'shoulderPress') {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Empurrando acima da cabeça)' : 'PUXE O AR (Descendo na altura das orelhas)',
        cadence: 'Cadência: 2s subida · 3s descida lenta',
        concentricLabel: 'Pressão Vertical (Deltóide Anterior/Médio)',
        eccentricLabel: 'Descida Controlada'
      };
    }
    if (animationKey === 'facepull') {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Puxando cotovelos para trás)' : 'PUXE O AR (Retorno alongando)',
        cadence: 'Cadência: 2s puxada · 1s contração · 3s retorno',
        concentricLabel: 'Abdução Horizontal (Deltóide Posterior)',
        eccentricLabel: 'Alongamento Dorsal/Ombro'
      };
    }
    if (animationKey === 'tricepsRope') {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Estendendo e abrindo corda)' : 'PUXE O AR (Subindo até 90°)',
        cadence: 'Cadência: 2s extensão · 1s pico · 3s retorno',
        concentricLabel: 'Extensão de Cotovelos (Tríceps)',
        eccentricLabel: 'Fase Excêntrica (90°)'
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
    if (['benchpress', 'inclineBench', 'fly'].includes(animationKey)) {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Empurrando o peso)' : 'PUXE O AR (Descida controlada)',
        cadence: 'Cadência: 2s subida · 3s descida lenta',
        concentricLabel: 'Fase de Empurrada (Peitoral)',
        eccentricLabel: 'Fase de Alongamento'
      };
    }
    if (animationKey === 'hipthrust') {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Pico no topo alinhado)' : 'PUXE O AR (Descendo suave)',
        cadence: 'Cadência: 2s subida · 2s pausa no topo · 3s descida',
        concentricLabel: 'Extensão Máxima de Quadril (Glúteo)',
        eccentricLabel: 'Retorno sem encostar no chão'
      };
    }
    if (animationKey === 'abductor') {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Abrindo pernas no máximo)' : 'PUXE O AR (Fechando com controle)',
        cadence: 'Cadência: 2s abertura · 2s pico · 3s retorno',
        concentricLabel: 'Abdução de Quadril (Glúteo Médio)',
        eccentricLabel: 'Retorno Resistido'
      };
    }
    if (animationKey === 'legpress') {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Empurrando a plataforma a 45°)' : 'PUXE O AR (Descendo até 90°)',
        cadence: 'Cadência: 2s subida · 3s descida lenta',
        concentricLabel: 'Extensão a 45° (Quadríceps/Glúteo)',
        eccentricLabel: 'Fase Excêntrica Suave'
      };
    }
    if (animationKey === 'bulgarian') {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Subindo na perna dianteira)' : 'PUXE O AR (Afundando joelho traseiro)',
        cadence: 'Cadência: 2s subida · 3s descida unilateral',
        concentricLabel: 'Foco Unilateral (Glúteo/Quadríceps)',
        eccentricLabel: 'Descida Estável sem Balançar'
      };
    }
    if (['biceps', 'hammer'].includes(animationKey)) {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Flexionando cotovelos)' : 'PUXE O AR (Descida em 3 segundos)',
        cadence: 'Cadência: 2s flexão · 1s pico · 3s descida',
        concentricLabel: 'Flexão de Braços',
        eccentricLabel: 'Descida Controlada'
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
        <div className="flex items-center gap-1.5 font-medium truncate max-w-[65%]">
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
            <>
              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors border border-white/5"
                title="Reiniciar animação do início"
                aria-label="Reiniciar animação"
              >
                <RotateCcw size={14} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors border border-white/5"
                aria-label={isPlaying ? 'Pausar animação' : 'Reproduzir animação'}
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              </button>
            </>
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
          {renderExerciseComponent(animationKey, phase, accentColor, isTechnicalMode, exerciseName)}
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
  isTechnicalMode: boolean,
  exerciseName?: string
) {
  switch (key) {
    case 'squat':
      return <SquatSmithSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'legpress':
      return <LegPress45Svg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'legext':
      return <LegExtensionSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'legcurl':
      return <LegCurlSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'calf':
      return <CalfRaiseSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'pulldown':
      return <PulldownSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'row':
      return <CableRowSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'singleRow':
      return <SingleArmRowSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'biceps':
      return <BicepsCurlSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'hammer':
      return <HammerCurlSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'shoulderPress':
      return <ShoulderPressSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'lateralRaise':
      return <LateralRaiseSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'facepull':
      return <RearDeltFlySvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'tricepsRope':
      return <TricepsRopePushdownSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'hipthrust':
      return <HipThrustSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'bulgarian':
      return <BulgarianSplitSquatSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'abductor':
      return <SeatedAbductorSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'benchpress':
      return <BenchPressSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'inclineBench':
      return <InclineBenchPressSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'fly':
      return <PeckDeckFlySvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'plank':
      return <PlankCoreSvg accentColor={accentColor} />;

    default:
      return <AnimationInPreparationSvg accentColor={accentColor} exerciseName={exerciseName} />;
  }
}
