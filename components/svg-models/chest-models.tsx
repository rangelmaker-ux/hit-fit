import React from 'react';
import { SvgModelProps } from './types';

// 1. SUPINO RETO COM BARRA (chest-1-barbell / benchPressBarbell)
export function BenchPressBarbellSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Supino Reto com Barra Olímpica">
      <line x1="25" y1="110" x2="115" y2="110" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="105" y1="65" x2="105" y2="140" stroke="#21262D" strokeWidth="4" />
      <line x1="20" y1="140" x2="135" y2="140" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />
      <circle cx="95" cy="104" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="88" y1="106" x2="35" y2="106" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

      {/* Barra Olímpica com Anilhas */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translateY(-28px)' : 'translateY(6px)' }}>
        <line x1="45" y1="80" x2="95" y2="80" stroke="#E6EDF3" strokeWidth="4" strokeLinecap="round" />
        <rect x="42" y="72" width="6" height="16" rx="2" fill={accentColor} />
        <rect x="92" y="72" width="6" height="16" rx="2" fill={accentColor} />
      </g>

      <path
        d={isUp ? 'M70 106 L70 52' : 'M70 106 L55 86 L70 86'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
    </svg>
  );
}

// 2. SUPINO RETO COM HALTERES (chest-1-dumbbells / benchPressDumbbell)
export function BenchPressDumbbellSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Supino Reto com Halteres">
      <line x1="25" y1="110" x2="115" y2="110" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="20" y1="140" x2="135" y2="140" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />
      <circle cx="95" cy="104" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="88" y1="106" x2="35" y2="106" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

      {/* Dois Halteres Independentes */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translateY(-30px)' : 'translateY(10px)' }}>
        <line x1="55" y1="80" x2="65" y2="80" stroke="#E6EDF3" strokeWidth="3" />
        <rect x="52" y="74" width="4" height="12" rx="1" fill="#8B949E" />
        <rect x="64" y="74" width="4" height="12" rx="1" fill="#8B949E" />

        <line x1="75" y1="80" x2="85" y2="80" stroke="#E6EDF3" strokeWidth="3" />
        <rect x="72" y="74" width="4" height="12" rx="1" fill="#8B949E" />
        <rect x="84" y="74" width="4" height="12" rx="1" fill="#8B949E" />
      </g>

      <path
        d={isUp ? 'M68 106 L60 50' : 'M68 106 L48 90'}
        stroke={accentColor}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000"
      />
      <path
        d={isUp ? 'M75 106 L80 50' : 'M75 106 L92 90'}
        stroke={accentColor}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000"
      />
    </svg>
  );
}

// 3. SUPINO MÁQUINA ARTICULADA (chest-1-machine / chestPressMachine)
export function ChestPressMachineSvg({ phase, accentColor }: SvgModelProps) {
  const isPushed = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Supino na Máquina Articulada">
      {/* Torre e Encosto Vertical da Máquina */}
      <rect x="18" y="45" width="12" height="95" rx="2" fill="#161B22" stroke="#30363D" strokeWidth="2" />
      <line x1="45" y1="65" x2="45" y2="120" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="40" y1="120" x2="75" y2="120" stroke="#30363D" strokeWidth="6" strokeLinecap="round" />
      <circle cx="45" cy="52" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="45" y1="60" x2="45" y2="115" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Alavanca mecânica empurrando para frente horizontalmente */}
      <circle cx="35" cy="85" r="4" fill="#8B949E" />
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isPushed ? 'translateX(26px)' : 'translateX(0px)' }}>
        <line x1="50" y1="85" x2="88" y2="85" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
        <rect x="88" y="78" width="6" height="14" rx="2" fill={accentColor} />
      </g>

      <line x1="48" y1="72" x2={isPushed ? '90' : '64'} y2="85" stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]" />
    </svg>
  );
}

// 4. SUPINO INCLINADO COM HALTERES (chest-2-dumbbells / inclineBenchDumbbell)
export function InclineBenchPressSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Supino Inclinado com Halteres">
      <line x1="30" y1="125" x2="90" y2="75" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="30" y1="125" x2="55" y2="135" stroke="#30363D" strokeWidth="6" strokeLinecap="round" />
      <circle cx="85" cy="62" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="68" x2="35" y2="120" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translate(22px, -24px)' : 'translate(-5px, 6px)' }}>
        <line x1="55" y1="75" x2="75" y2="75" stroke="#E6EDF3" strokeWidth="3" />
        <rect x="52" y="70" width="5" height="10" rx="1" fill={accentColor} />
        <rect x="73" y="70" width="5" height="10" rx="1" fill={accentColor} />
      </g>

      <line x1="65" y1="88" x2={isUp ? '87' : '60'} y2={isUp ? '51' : '81'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]" />
    </svg>
  );
}

// 5. SUPINO INCLINADO NO SMITH MACHINE (chest-2-smith / inclineBenchSmith)
export function InclineBenchSmithSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Supino Inclinado no Smith Machine">
      {/* Trilhos do Smith */}
      <line x1="25" y1="20" x2="25" y2="145" stroke="#21262D" strokeWidth="4" />
      <line x1="135" y1="20" x2="135" y2="145" stroke="#21262D" strokeWidth="4" />
      {/* Banco inclinado dentro do Smith */}
      <line x1="35" y1="125" x2="95" y2="75" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <circle cx="90" cy="62" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />

      {/* Barra contínua nos trilhos do Smith */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translateY(-26px)' : 'translateY(10px)' }}>
        <line x1="20" y1="70" x2="140" y2="70" stroke="#E6EDF3" strokeWidth="4" strokeLinecap="round" />
        <rect x="22" y="64" width="6" height="12" rx="1" fill={accentColor} />
        <rect x="132" y="64" width="6" height="12" rx="1" fill={accentColor} />
      </g>

      <line x1="70" y1="85" x2="80" y2={isUp ? '44' : '80'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />
    </svg>
  );
}

// 6. VOADOR / PECK DECK (chest-3-peck-deck / peckDeckFly)
export function PeckDeckFlySvg({ phase, accentColor }: SvgModelProps) {
  const isClosed = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Voador Peck Deck">
      <line x1="80" y1="50" x2="80" y2="120" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <circle cx="80" cy="46" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="54" x2="80" y2="115" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      <circle cx="55" cy="70" r="3" fill="#8B949E" />
      <circle cx="105" cy="70" r="3" fill="#8B949E" />

      {/* Alavancas curvas fechando à frente */}
      <path
        d={isClosed ? 'M55 70 Q70 65 72 65' : 'M55 70 Q40 68 35 68'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />
      <path
        d={isClosed ? 'M105 70 Q90 65 88 65' : 'M105 70 Q120 68 125 68'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />

      <circle cx={isClosed ? '72' : '35'} cy={isClosed ? '65' : '68'} r="4" fill="#FFFFFF" className="transition-all duration-1000" />
      <circle cx={isClosed ? '88' : '125'} cy={isClosed ? '65' : '68'} r="4" fill="#FFFFFF" className="transition-all duration-1000" />
    </svg>
  );
}

// 7. CROSS OVER POLIA MÉDIA (chest-3-crossover / cableCrossOver)
export function CableCrossOverSvg({ phase, accentColor }: SvgModelProps) {
  const isClosed = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Cross Over na Polia Média">
      {/* Torres Crossover Esquerda e Direita */}
      <rect x="10" y="25" width="8" height="120" rx="2" fill="#161B22" stroke="#21262D" strokeWidth="2" />
      <rect x="142" y="25" width="8" height="120" rx="2" fill="#161B22" stroke="#21262D" strokeWidth="2" />
      <circle cx="14" cy="65" r="4" fill="#8B949E" />
      <circle cx="146" cy="65" r="4" fill="#8B949E" />

      {/* Atleta no centro com passo à frente */}
      <circle cx="80" cy="48" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="56" x2="80" y2="105" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="80" y1="105" x2="74" y2="142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="105" x2="88" y2="142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Cabos convergindo para a frente do peito */}
      <line x1="14" y1="65" x2={isClosed ? '74' : '45'} y2={isClosed ? '68' : '62'} stroke="#8B949E" strokeWidth="2" strokeDasharray="2 2" className="transition-all duration-1000" />
      <line x1="146" y1="65" x2={isClosed ? '86' : '115'} y2={isClosed ? '68' : '62'} stroke="#8B949E" strokeWidth="2" strokeDasharray="2 2" className="transition-all duration-1000" />

      <line x1="76" y1="58" x2={isClosed ? '74' : '45'} y2={isClosed ? '68' : '62'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]" />
      <line x1="84" y1="58" x2={isClosed ? '86' : '115'} y2={isClosed ? '68' : '62'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]" />
    </svg>
  );
}

// 8. CRUCIFIXO RETO COM HALTERES (chest-3-dumbbells / dumbbellFlatFly)
export function DumbbellFlatFlySvg({ phase, accentColor }: SvgModelProps) {
  const isClosed = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Crucifixo Reto com Halteres">
      <line x1="30" y1="115" x2="110" y2="115" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <circle cx="95" cy="108" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="88" y1="110" x2="40" y2="110" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Halteres abrindo e fechando em arco amplo */}
      <path
        d={isClosed ? 'M68 110 L68 55' : 'M68 110 Q50 95 40 85'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000"
      />
      <circle cx={isClosed ? '68' : '40'} cy={isClosed ? '55' : '85'} r="5" fill="#8B949E" className="transition-all duration-1000" />
    </svg>
  );
}

// Aliases
export const BenchPressSvg = BenchPressBarbellSvg;
export const ChestPressFlySvg = BenchPressBarbellSvg;
