"use client";

import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Wind, Flame, Eye, Compass } from 'lucide-react';
import {
  SquatSmithSvg,
  SquatFreeBarSvg,
  HackSquatMachineSvg,
  LegPress45Svg,
  LegPressHorizontalSvg,
  LegExtensionSvg,
  LegCurlSvg,
  LegCurlSeatedSvg,
  StiffDumbbellSvg,
  CalfRaiseSvg,
  CalfRaiseLegPressSvg,
  PulldownWideSvg,
  PulldownCloseSvg,
  CableRowSvg,
  TBarRowSvg,
  SingleArmRowSvg,
  SingleArmRowCableSvg,
  BicepsCurlWBarSvg,
  BicepsCurlCableSvg,
  HammerCurlDumbbellSvg,
  ShoulderPressDumbbellSvg,
  ShoulderPressMachineSvg,
  ShoulderPressSmithSvg,
  LateralRaiseCableSvg,
  LateralRaiseDumbbellSvg,
  LateralRaiseMachineSvg,
  RearDeltPeckDeckSvg,
  FacepullCableSvg,
  RearDeltDumbbellSvg,
  TricepsRopePushdownSvg,
  TricepsBarPushdownSvg,
  HipThrustMachineSvg,
  HipThrustBarbellSvg,
  BulgarianSplitSquatSvg,
  SumoSquatStepSvg,
  SeatedAbductorSvg,
  CableStandingAbductionSvg,
  BenchPressBarbellSvg,
  BenchPressDumbbellSvg,
  ChestPressMachineSvg,
  InclineBenchPressSvg,
  InclineBenchSmithSvg,
  PeckDeckFlySvg,
  CableCrossOverSvg,
  DumbbellFlatFlySvg,
  PlankCoreSvg,
  AnimationInPreparationSvg
} from './exercise-svg-models';

interface ExerciseAnimationProps {
  animationKey: string;
  exerciseName?: string;
  equipmentName?: string;
  accentColor?: string;
}

export function ExerciseAnimation({
  animationKey,
  exerciseName = 'exercício',
  equipmentName,
  accentColor = '#c3f75a'
}: ExerciseAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState<'concentric' | 'eccentric'>('concentric');
  const [isTechnicalMode, setIsTechnicalMode] = useState(false);

  const isIsometric = animationKey === 'plank' || animationKey === 'plankFloor';

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
    if (animationKey.startsWith('lateralRaise')) {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Subindo até a altura dos ombros)' : 'PUXE O AR (Descendo suave sem bater)',
        cadence: 'Cadência: 2s subida · 1s pico · 3s descida lenta',
        concentricLabel: 'Abdução de Braços (Deltóide Lateral)',
        eccentricLabel: 'Fase Excêntrica Controlada'
      };
    }
    if (animationKey.startsWith('shoulderPress')) {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Empurrando acima da cabeça)' : 'PUXE O AR (Descendo na altura das orelhas)',
        cadence: 'Cadência: 2s subida · 3s descida lenta',
        concentricLabel: 'Pressão Vertical (Deltóide Anterior/Médio)',
        eccentricLabel: 'Descida Controlada'
      };
    }
    if (animationKey.startsWith('rearDelt') || animationKey === 'facepullCable' || animationKey === 'facepull') {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Puxando cotovelos para trás)' : 'PUXE O AR (Retorno alongando)',
        cadence: 'Cadência: 2s puxada · 1s contração · 3s retorno',
        concentricLabel: 'Abdução Horizontal (Deltóide Posterior)',
        eccentricLabel: 'Alongamento Dorsal/Ombro'
      };
    }
    if (animationKey.startsWith('triceps')) {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Estendendo cotovelos)' : 'PUXE O AR (Subindo até 90°)',
        cadence: 'Cadência: 2s extensão · 1s pico · 3s retorno',
        concentricLabel: 'Extensão de Cotovelos (Tríceps)',
        eccentricLabel: 'Fase Excêntrica (90°)'
      };
    }
    if (
      animationKey.startsWith('pulldown') ||
      animationKey.startsWith('cableRow') ||
      animationKey.startsWith('tbarRow') ||
      animationKey.startsWith('singleArmRow') ||
      animationKey === 'row' ||
      animationKey === 'singleRow'
    ) {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Puxando ao corpo)' : 'PUXE O AR (Retorno alongando)',
        cadence: 'Cadência: 2s puxada · 1s pico · 3s retorno',
        concentricLabel: 'Fase de Tração (Dorsal)',
        eccentricLabel: 'Fase Excêntrica (Alongamento)'
      };
    }
    if (
      animationKey.startsWith('benchPress') ||
      animationKey.startsWith('chestPress') ||
      animationKey.startsWith('inclineBench') ||
      animationKey.startsWith('peckDeck') ||
      animationKey.startsWith('cableCross') ||
      animationKey.startsWith('dumbbellFlatFly') ||
      animationKey === 'benchpress' ||
      animationKey === 'inclineBench' ||
      animationKey === 'fly'
    ) {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Empurrando a carga)' : 'PUXE O AR (Descida controlada)',
        cadence: 'Cadência: 2s subida · 3s descida lenta',
        concentricLabel: 'Fase de Empurrada (Peitoral)',
        eccentricLabel: 'Fase de Alongamento'
      };
    }
    if (animationKey.startsWith('hipThrust') || animationKey === 'hipthrust') {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Pico no topo alinhado)' : 'PUXE O AR (Descendo suave)',
        cadence: 'Cadência: 2s subida · 2s pausa no topo · 3s descida',
        concentricLabel: 'Extensão Máxima de Quadril (Glúteo)',
        eccentricLabel: 'Retorno sem encostar no chão'
      };
    }
    if (animationKey.startsWith('seatedAbductor') || animationKey.startsWith('cableStandingAbduction') || animationKey === 'abductor') {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Abrindo pernas no máximo)' : 'PUXE O AR (Fechando com controle)',
        cadence: 'Cadência: 2s abertura · 2s pico · 3s retorno',
        concentricLabel: 'Abdução de Quadril (Glúteo Médio)',
        eccentricLabel: 'Retorno Resistido'
      };
    }
    if (animationKey.startsWith('legpress')) {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Empurrando a plataforma)' : 'PUXE O AR (Descendo até 90°)',
        cadence: 'Cadência: 2s subida · 3s descida lenta',
        concentricLabel: 'Extensão de Pernas (Quadríceps/Glúteo)',
        eccentricLabel: 'Fase Excêntrica Suave'
      };
    }
    if (animationKey.startsWith('bulgarian') || animationKey.startsWith('sumo')) {
      return {
        breathing: phase === 'concentric' ? 'SOLTE O AR (Subindo na força das pernas)' : 'PUXE O AR (Descendo controlado)',
        cadence: 'Cadência: 2s subida · 3s descida profunda',
        concentricLabel: 'Foco Unilateral / Glúteos',
        eccentricLabel: 'Descida Estável sem Balançar'
      };
    }
    if (animationKey.startsWith('biceps') || animationKey.startsWith('hammer')) {
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

        {/* Modelo SVG específico do equipamento/exercício */}
        <div className={`transition-all duration-700 ease-in-out ${isPlaying ? '' : 'opacity-90'}`}>
          {renderExerciseComponent(animationKey, phase, accentColor, isTechnicalMode, exerciseName, equipmentName)}
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
  exerciseName?: string,
  equipmentName?: string
) {
  switch (key) {
    // 1. Pernas & Agachamentos
    case 'squatSmith':
    case 'squat':
      return <SquatSmithSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'squatFree':
      return <SquatFreeBarSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'hackSquat':
      return <HackSquatMachineSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'legpress45':
    case 'legpress':
      return <LegPress45Svg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'legpressHorizontal':
      return <LegPressHorizontalSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'legextBilateral':
    case 'legextCable':
    case 'legext':
      return <LegExtensionSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'legcurlProne':
    case 'legcurl':
      return <LegCurlSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'legcurlSeated':
      return <LegCurlSeatedSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'stiffDumbbell':
      return <StiffDumbbellSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'calfStanding':
    case 'calfSeated':
    case 'calf':
      return <CalfRaiseSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'calfLegPress':
      return <CalfRaiseLegPressSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    // 2. Costas, Dorsal & Puxadas
    case 'pulldownWide':
    case 'pulldown':
      return <PulldownWideSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'pulldownClose':
      return <PulldownCloseSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'cableRowSeated':
    case 'row':
      return <CableRowSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'tbarRow':
      return <TBarRowSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'singleArmRowDumbbell':
    case 'singleRow':
      return <SingleArmRowSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'singleArmRowCable':
      return <SingleArmRowCableSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    // 3. Braços & Tríceps
    case 'bicepsWBar':
    case 'biceps':
      return <BicepsCurlWBarSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'bicepsCable':
      return <BicepsCurlCableSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'hammerDumbbell':
    case 'hammer':
      return <HammerCurlDumbbellSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'tricepsRopePushdown':
    case 'tricepsRope':
      return <TricepsRopePushdownSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'tricepsBarPushdown':
      return <TricepsBarPushdownSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    // 4. Ombros & Deltoides (Diferenciados por Equipamento!)
    case 'shoulderPressDumbbell':
    case 'shoulderPress':
      return <ShoulderPressDumbbellSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'shoulderPressMachine':
      return <ShoulderPressMachineSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'shoulderPressSmith':
      return <ShoulderPressSmithSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'lateralRaiseCable':
    case 'lateralRaise':
      return <LateralRaiseCableSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'lateralRaiseDumbbell':
      return <LateralRaiseDumbbellSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'lateralRaiseMachine':
      return <LateralRaiseMachineSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    case 'rearDeltPeckDeck':
    case 'facepull':
      return <RearDeltPeckDeckSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'facepullCable':
      return <FacepullCableSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'rearDeltDumbbell':
      return <RearDeltDumbbellSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    // 5. Glúteos & Core
    case 'hipThrustMachine':
    case 'hipthrust':
      return <HipThrustMachineSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'hipThrustBarbell':
      return <HipThrustBarbellSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'bulgarianSplitSquat':
    case 'bulgarian':
      return <BulgarianSplitSquatSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'sumoSquatStep':
      return <SumoSquatStepSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'seatedAbductorMachine':
    case 'abductor':
      return <SeatedAbductorSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'cableStandingAbduction':
      return <CableStandingAbductionSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'plankFloor':
    case 'plank':
      return <PlankCoreSvg accentColor={accentColor} />;

    // 6. Peitoral & Supinos
    case 'benchPressBarbell':
    case 'benchpress':
      return <BenchPressBarbellSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'benchPressDumbbell':
      return <BenchPressDumbbellSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'chestPressMachine':
      return <ChestPressMachineSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'inclineBenchDumbbell':
    case 'inclineBench':
      return <InclineBenchPressSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'inclineBenchSmith':
      return <InclineBenchSmithSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'peckDeckFly':
    case 'fly':
      return <PeckDeckFlySvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'cableCrossOver':
      return <CableCrossOverSvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;
    case 'dumbbellFlatFly':
      return <DumbbellFlatFlySvg phase={phase} accentColor={accentColor} isTechnicalMode={isTechnicalMode} />;

    default:
      return (
        <AnimationInPreparationSvg
          accentColor={accentColor}
          exerciseName={exerciseName}
          equipmentName={equipmentName}
        />
      );
  }
}
