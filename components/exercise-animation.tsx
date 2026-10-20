"use client";

import React, { useEffect, useState } from 'react';
import { Play, Pause, Wind, Flame } from 'lucide-react';

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

  // Alterna o ritmo biomecânico (fase concêntrica / excêntrica) para guiar respiração
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPhase((prev) => (prev === 'concentric' ? 'eccentric' : 'concentric'));
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div 
      aria-label={`Animação de ${exerciseName}`}
      className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#141814] to-[#0d100d] border border-white/10 shadow-lg p-4 flex flex-col items-center"
    >
      {/* Indicador de fase e respiração no topo */}
      <div className="w-full flex items-center justify-between mb-3 px-1 text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          <Wind className="w-4 h-4 text-sky-400 animate-pulse" />
          <span className="text-neutral-300">
            {phase === 'concentric' ? (
              <span className="text-sky-300 font-bold">SOLTE O AR (Força / Subida)</span>
            ) : (
              <span className="text-amber-300 font-bold">PUXE O AR (Descida Controlada)</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
            aria-label={isPlaying ? 'Pausar animação' : 'Reproduzir animação'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
          </button>
        </div>
      </div>

      {/* Janela de Animação 2D Vetorial */}
      <div className="relative w-full h-52 flex items-center justify-center bg-[#0a0c0a] rounded-xl border border-white/5 overflow-hidden">
        {/* Linhas de grade técnica de fundo */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}
        />

        {/* Animação Específica baseada na Chave do Exercício */}
        <div className={`transition-all duration-1000 ease-in-out ${isPlaying ? '' : 'paused'}`}>
          {renderExerciseSvg(animationKey, phase, accentColor)}
        </div>

        {/* Barra de Ritmo de Movimento */}
        <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[10px] text-neutral-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span className="flex items-center gap-1">
            <Flame size={12} style={{ color: accentColor }} />
            Cadência: 2s subida · 3s descida
          </span>
          <span className="font-mono text-neutral-300 uppercase tracking-wider">
            {phase === 'concentric' ? 'Fase de Força' : 'Fase de Alongamento'}
          </span>
        </div>
      </div>
    </div>
  );
}

function renderExerciseSvg(key: string, phase: 'concentric' | 'eccentric', accentColor: string) {
  const isUp = phase === 'concentric';

  switch (key) {
    case 'squat':
    case 'legpress':
    case 'bulgarian':
      return (
        <svg viewBox="0 0 160 160" className="w-44 h-44">
          {/* Suporte da Máquina / Smith */}
          <line x1="25" y1="15" x2="25" y2="150" stroke="#333d30" strokeWidth="4" />
          <line x1="135" y1="15" x2="135" y2="150" stroke="#333d30" strokeWidth="4" />
          <line x1="20" y1="148" x2="140" y2="148" stroke="#445540" strokeWidth="4" strokeLinecap="round" />

          {/* Barra com anilhas - move verticalmente */}
          <g
            className="transition-transform duration-1000 ease-in-out"
            style={{ transform: isUp ? 'translateY(0px)' : 'translateY(36px)' }}
          >
            <line x1="20" y1="45" x2="140" y2="45" stroke="#99a890" strokeWidth="5" strokeLinecap="round" />
            <rect x="18" y="37" width="8" height="16" rx="2" fill={accentColor} />
            <rect x="134" y="37" width="8" height="16" rx="2" fill={accentColor} />
            <circle cx="80" cy="40" r="10" fill="#20261e" stroke="#fff" strokeWidth="2" />
          </g>

          {/* Atleta Agachando / Tronco e Pernas */}
          <g className="transition-all duration-1000 ease-in-out">
            {/* Tronco */}
            <line
              x1="80"
              y1={isUp ? '50' : '86'}
              x2={isUp ? '80' : '75'}
              y2={isUp ? '85' : '110'}
              stroke="#fff"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Coxa (Quadríceps aceso) */}
            <line
              x1={isUp ? '80' : '75'}
              y1={isUp ? '85' : '110'}
              x2={isUp ? '72' : '96'}
              y2={isUp ? '118' : '118'}
              stroke={accentColor}
              strokeWidth="6"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_currentColor]"
            />
            {/* Perna/Canela */}
            <line
              x1={isUp ? '72' : '96'}
              y1={isUp ? '118' : '118'}
              x2="74"
              y2="146"
              stroke="#889680"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Pés */}
            <line x1="68" y1="146" x2="82" y2="146" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'pulldown':
    case 'row':
    case 'singleRow':
      return (
        <svg viewBox="0 0 160 160" className="w-44 h-44">
          {/* Torre Pulley e Roldana */}
          <line x1="80" y1="10" x2="80" y2="35" stroke="#333d30" strokeWidth="3" />
          <circle cx="80" cy="22" r="8" fill="#1b201a" stroke="#556650" strokeWidth="2" />

          {/* Barra puxada para o peito */}
          <g
            className="transition-transform duration-1000 ease-in-out"
            style={{ transform: isUp ? 'translateY(28px)' : 'translateY(0px)' }}
          >
            <line x1="80" y1="22" x2="80" y2="40" stroke="#778870" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="30" y1="40" x2="130" y2="40" stroke="#e0e8d8" strokeWidth="4" strokeLinecap="round" />
            {/* Mãos segurando a barra */}
            <circle cx="45" cy="40" r="4" fill={accentColor} />
            <circle cx="115" cy="40" r="4" fill={accentColor} />
          </g>

          {/* Atleta sentado no banco */}
          <rect x="65" y="110" width="30" height="8" rx="2" fill="#333d30" />
          <line x1="80" y1="118" x2="80" y2="146" stroke="#445540" strokeWidth="4" />

          {/* Cabeça */}
          <circle cx="80" cy="58" r="9" fill="#1e241c" stroke="#fff" strokeWidth="2" />

          {/* Costas / Dorsais destacados */}
          <line x1="80" y1="67" x2="80" y2="108" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />

          {/* Braços puxando */}
          <line
            x1="80"
            y1="72"
            x2={isUp ? '52' : '45'}
            y2={isUp ? '88' : '40'}
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="80"
            y1="72"
            x2={isUp ? '108' : '115'}
            y2={isUp ? '88' : '40'}
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'benchpress':
    case 'inclineBench':
    case 'fly':
      return (
        <svg viewBox="0 0 160 160" className="w-44 h-44">
          {/* Banco de Supino */}
          <line x1="30" y1="110" x2="130" y2="110" stroke="#333d30" strokeWidth="6" strokeLinecap="round" />
          <line x1="45" y1="113" x2="45" y2="146" stroke="#445540" strokeWidth="4" />
          <line x1="115" y1="113" x2="115" y2="146" stroke="#445540" strokeWidth="4" />

          {/* Atleta Deitado */}
          <circle cx="45" cy="100" r="8" fill="#1b201a" stroke="#fff" strokeWidth="2" />
          <line x1="53" y1="104" x2="105" y2="104" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
          {/* Peito iluminado */}
          <rect x="62" y="98" width="22" height="10" rx="3" fill={accentColor} />

          {/* Barra subindo e descendo */}
          <g
            className="transition-transform duration-1000 ease-in-out"
            style={{ transform: isUp ? 'translateY(-26px)' : 'translateY(0px)' }}
          >
            <line x1="72" y1="92" x2="72" y2="92" stroke="#fff" strokeWidth="4" />
            <line x1="40" y1="88" x2="104" y2="88" stroke="#d5e0cb" strokeWidth="5" strokeLinecap="round" />
            <circle cx="38" cy="88" r="7" fill={accentColor} />
            <circle cx="106" cy="88" r="7" fill={accentColor} />
            {/* Braços estendendo */}
            <line x1="72" y1="102" x2="72" y2="88" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'hipthrust':
      return (
        <svg viewBox="0 0 160 160" className="w-44 h-44">
          {/* Banco de apoio para as costas */}
          <rect x="25" y="85" width="25" height="35" rx="3" fill="#2b3327" stroke="#44553e" strokeWidth="2" />

          {/* Pés no chão */}
          <line x1="110" y1="140" x2="135" y2="140" stroke="#fff" strokeWidth="4" strokeLinecap="round" />

          {/* Quadril subindo (Glúteo ativado) */}
          <g className="transition-all duration-1000 ease-in-out">
            {/* Tronco */}
            <line
              x1="48"
              y1="90"
              x2={isUp ? '85' : '75'}
              y2={isUp ? '90' : '116'}
              stroke="#fff"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Glúteo em destaque */}
            <circle
              cx={isUp ? '85' : '75'}
              cy={isUp ? '90' : '116'}
              r="10"
              fill={accentColor}
              className="drop-shadow-[0_0_10px_currentColor]"
            />
            {/* Coxa até o joelho */}
            <line
              x1={isUp ? '85' : '75'}
              y1={isUp ? '90' : '116'}
              x2="115"
              y2={isUp ? '90' : '105'}
              stroke="#fff"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Canela vertical */}
            <line
              x1="115"
              y1={isUp ? '90' : '105'}
              x2="118"
              y2="140"
              stroke="#889680"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    default:
      // Ícone universal biomecânico pulsante
      return (
        <svg viewBox="0 0 160 160" className="w-44 h-44">
          <circle
            cx="80"
            cy="80"
            r={isUp ? '52' : '44'}
            fill="none"
            stroke={accentColor}
            strokeWidth="4"
            strokeDasharray="6 6"
            className="transition-all duration-1000"
          />
          <circle cx="80" cy="80" r="28" fill="#1b2218" stroke="#fff" strokeWidth="2" />
          <path
            d="M70 70 L90 80 L70 90 Z"
            fill={accentColor}
            className="transition-transform duration-1000"
            style={{ transform: isUp ? 'scale(1.1)' : 'scale(0.95)', transformOrigin: '80px 80px' }}
          />
        </svg>
      );
  }
}
