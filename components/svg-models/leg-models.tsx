import React from 'react';
import { SvgModelProps } from './types';

// 1. AGACHAMENTO SMITH (leg-1-smith / squatSmith)
export function SquatSmithSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Agachamento no Smith Machine">
      <line x1="25" y1="15" x2="25" y2="150" stroke="#21262D" strokeWidth="4" />
      <line x1="135" y1="15" x2="135" y2="150" stroke="#21262D" strokeWidth="4" />
      <line x1="20" y1="148" x2="140" y2="148" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />
      <rect x="22" y="112" width="6" height="4" fill="#F59E0B" rx="1" />
      <rect x="132" y="112" width="6" height="4" fill="#F59E0B" rx="1" />

      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translateY(0px)' : 'translateY(36px)' }}>
        <line x1="18" y1="45" x2="142" y2="45" stroke="#E6EDF3" strokeWidth="5" strokeLinecap="round" />
        <rect x="18" y="37" width="8" height="16" rx="2" fill={accentColor} />
        <rect x="134" y="37" width="8" height="16" rx="2" fill={accentColor} />
        <circle cx="80" cy="40" r="10" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      </g>

      <line x1="80" y1={isUp ? '50' : '86'} x2={isUp ? '80' : '75'} y2={isUp ? '85' : '110'} stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" className="transition-all duration-1000" />
      <line x1={isUp ? '80' : '75'} y1={isUp ? '85' : '110'} x2={isUp ? '72' : '96'} y2={isUp ? '118' : '118'} stroke={accentColor} strokeWidth="6" strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]" />
      <line x1={isUp ? '72' : '96'} y1={isUp ? '118' : '118'} x2="72" y2="148" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />
    </svg>
  );
}

// 2. AGACHAMENTO LIVRE COM BARRA (leg-1-free-bar / squatFree)
export function SquatFreeBarSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Rack de Agachamento Livre">
      {/* Power Rack de Agachamento Aberto */}
      <line x1="30" y1="35" x2="30" y2="148" stroke="#21262D" strokeWidth="4" />
      <line x1="130" y1="35" x2="130" y2="148" stroke="#21262D" strokeWidth="4" />
      <path d="M26 80 L35 80 L35 85" stroke="#F59E0B" strokeWidth="3" fill="none" />
      <path d="M134 80 L125 80 L125 85" stroke="#F59E0B" strokeWidth="3" fill="none" />
      <line x1="20" y1="148" x2="140" y2="148" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />

      {/* Barra Olímpica Livre e Atleta Agachando Livremente */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translateY(0px)' : 'translateY(36px)' }}>
        <line x1="15" y1="46" x2="145" y2="46" stroke="#E6EDF3" strokeWidth="4" strokeLinecap="round" />
        <rect x="18" y="38" width="6" height="16" rx="2" fill={accentColor} />
        <rect x="136" y="38" width="6" height="16" rx="2" fill={accentColor} />
        <circle cx="80" cy="40" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      </g>

      <line x1="80" y1={isUp ? '50' : '86'} x2={isUp ? '80' : '74'} y2={isUp ? '85' : '110'} stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" className="transition-all duration-1000" />
      <line x1={isUp ? '80' : '74'} y1={isUp ? '85' : '110'} x2={isUp ? '72' : '96'} y2={isUp ? '118' : '118'} stroke={accentColor} strokeWidth="6" strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]" />
      <line x1={isUp ? '72' : '96'} y1={isUp ? '118' : '118'} x2="72" y2="148" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />
    </svg>
  );
}

// 3. HACK SQUAT 45° (leg-1-hack / hackSquat)
export function HackSquatMachineSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Hack Squat 45°">
      {/* Trilho Inclinado a 45° */}
      <line x1="30" y1="135" x2="125" y2="40" stroke="#30363D" strokeWidth="6" strokeLinecap="round" />
      <line x1="20" y1="145" x2="80" y2="145" stroke="#21262D" strokeWidth="4" />
      {/* Plataforma de Pés inclinada */}
      <line x1="24" y1="145" x2="48" y2="120" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />

      {/* Trenó Hack com encosto e apoios de ombro */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translate(0px, 0px)' : 'translate(-28px, 28px)' }}>
        <line x1="90" y1="75" x2="115" y2="50" stroke="#E6EDF3" strokeWidth="8" strokeLinecap="round" />
        <rect x="110" y="44" width="10" height="8" rx="2" fill={accentColor} />
        {/* Atleta no Hack */}
        <circle cx="106" cy="48" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="102" y1="56" x2="82" y2="76" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Pernas empurrando a plataforma */}
      <path
        d={isUp ? 'M82 76 L52 108 L36 132' : 'M54 104 L60 128 L36 132'}
        stroke={accentColor}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
    </svg>
  );
}

// 4. LEG PRESS 45° (leg-2-45 / legpress45)
export function LegPress45Svg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Leg Press 45° de Anilhas">
      <line x1="25" y1="135" x2="135" y2="25" stroke="#21262D" strokeWidth="6" strokeLinecap="round" />
      <line x1="20" y1="145" x2="60" y2="145" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />
      <line x1="30" y1="130" x2="45" y2="145" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <circle cx="28" cy="115" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="32" y1="122" x2="52" y2="142" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translate(22px, -22px)' : 'translate(-10px, 10px)' }}>
        <line x1="88" y1="62" x2="108" y2="82" stroke="#8B949E" strokeWidth="6" strokeLinecap="round" />
        <line x1="98" y1="72" x2="128" y2="42" stroke="#E6EDF3" strokeWidth="4" />
        <rect x="110" y="38" width="10" height="20" rx="2" fill={accentColor} />
      </g>

      <path
        d={isUp ? 'M52 142 L80 100 L108 62' : 'M52 142 L58 102 L86 84'}
        stroke={accentColor}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
    </svg>
  );
}

// 5. LEG PRESS HORIZONTAL (leg-2-horizontal / legpressHorizontal)
export function LegPressHorizontalSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Leg Press Horizontal com Placas">
      {/* Trilho Horizontal Reto a 0° */}
      <line x1="20" y1="130" x2="145" y2="130" stroke="#30363D" strokeWidth="5" strokeLinecap="round" />
      {/* Plataforma Fixa vertical à esquerda */}
      <line x1="25" y1="70" x2="25" y2="130" stroke="#8B949E" strokeWidth="7" strokeLinecap="round" />
      <rect x="12" y="55" width="10" height="75" rx="2" fill="#161B22" stroke="#21262D" strokeWidth="2" />

      {/* Banco Deslizante horizontal para a direita */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translate(36px, 0px)' : 'translate(0px, 0px)' }}>
        <line x1="75" y1="75" x2="75" y2="125" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
        <line x1="65" y1="125" x2="90" y2="125" stroke="#30363D" strokeWidth="6" strokeLinecap="round" />
        <circle cx="75" cy="65" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="75" y1="73" x2="75" y2="120" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Pernas estendendo horizontalmente contra a placa */}
      <path
        d={isUp ? 'M111 120 L70 105 L26 100' : 'M75 120 L50 85 L26 100'}
        stroke={accentColor}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
    </svg>
  );
}

// 6. CADEIRA EXTENSORA (leg-3-bilateral / legextBilateral)
export function LegExtensionSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Cadeira Extensora Tradicional">
      <line x1="45" y1="65" x2="45" y2="120" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="40" y1="120" x2="85" y2="120" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <circle cx="45" cy="52" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="45" y1="61" x2="45" y2="115" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="45" y1="115" x2="85" y2="115" stroke={accentColor} strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />

      <circle cx="85" cy="115" r="4" fill="#0D1117" stroke="#8B949E" strokeWidth="2" />
      <line
        x1="85"
        y1="115"
        x2={isUp ? '128' : '85'}
        y2={isUp ? '112' : '148'}
        stroke={accentColor}
        strokeWidth="6"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />
      <circle cx={isUp ? '128' : '85'} cy={isUp ? '112' : '148'} r="7" fill="#161B22" stroke="#8B949E" strokeWidth="2" className="transition-all duration-1000 ease-in-out" />
    </svg>
  );
}

// 7. MESA FLEXORA DEITADA (leg-4-prone / legcurlProne)
export function LegCurlSvg({ phase, accentColor }: SvgModelProps) {
  const isCurled = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Mesa Flexora Deitada">
      <line x1="30" y1="110" x2="115" y2="110" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <circle cx="25" cy="104" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="33" y1="106" x2="75" y2="106" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="75" y1="106" x2="105" y2="106" stroke={accentColor} strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />

      <circle cx="105" cy="106" r="4" fill="#0D1117" stroke="#8B949E" strokeWidth="2" />
      <line
        x1="105"
        y1="106"
        x2={isCurled ? '82' : '140'}
        y2={isCurled ? '68' : '106'}
        stroke={accentColor}
        strokeWidth="6"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />
      <circle cx={isCurled ? '82' : '140'} cy={isCurled ? '68' : '106'} r="6" fill="#161B22" stroke="#8B949E" strokeWidth="2" className="transition-all duration-1000 ease-in-out" />
    </svg>
  );
}

// 8. CADEIRA FLEXORA SENTADA (leg-4-seated / legcurlSeated)
export function LegCurlSeatedSvg({ phase, accentColor }: SvgModelProps) {
  const isCurled = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Cadeira Flexora Sentada">
      <line x1="50" y1="65" x2="50" y2="115" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="45" y1="115" x2="90" y2="115" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <circle cx="50" cy="52" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="50" y1="60" x2="50" y2="110" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="110" x2="90" y2="110" stroke={accentColor} strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Rolete descendo sob a coxa / panturrilha flexionando para trás */}
      <circle cx="90" cy="110" r="4" fill="#0D1117" stroke="#8B949E" strokeWidth="2" />
      <line
        x1="90"
        y1="110"
        x2={isCurled ? '75' : '125'}
        y2={isCurled ? '146' : '110'}
        stroke={accentColor}
        strokeWidth="5"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />
      <circle cx={isCurled ? '75' : '125'} cy={isCurled ? '146' : '110'} r="6" fill="#161B22" stroke="#8B949E" strokeWidth="2" className="transition-all duration-1000" />
    </svg>
  );
}

// 9. STIFF COM HALTERES (leg-4-stiff / stiffDumbbell)
export function StiffDumbbellSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Stiff com Halteres Livres">
      <line x1="30" y1="145" x2="130" y2="145" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />
      {/* Atleta flexionando quadril e mantendo pernas quase estendidas */}
      <circle cx={isUp ? '80' : '55'} cy={isUp ? '45' : '65'} r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" className="transition-all duration-1000" />
      <line x1={isUp ? '80' : '55'} y1={isUp ? '53' : '72'} x2={isUp ? '80' : '95'} y2={isUp ? '98' : '95'} stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" className="transition-all duration-1000" />
      <line x1={isUp ? '80' : '95'} y1={isUp ? '98' : '95'} x2="80" y2="145" stroke={accentColor} strokeWidth="6" strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]" />

      {/* Halteres descendo rente às canelas */}
      <line x1={isUp ? '80' : '55'} y1={isUp ? '60' : '75'} x2={isUp ? '82' : '65'} y2={isUp ? '95' : '135'} stroke="#8B949E" strokeWidth="3" strokeLinecap="round" className="transition-all duration-1000" />
      <circle cx={isUp ? '82' : '65'} cy={isUp ? '95' : '135'} r="6" fill="#8B949E" className="transition-all duration-1000" />
    </svg>
  );
}

// 10. GÊMEOS EM PÉ NA MÁQUINA (leg-5-standing / calfStanding)
export function CalfRaiseSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Gêmeos em Pé na Máquina">
      <rect x="25" y="20" width="10" height="125" rx="2" fill="#161B22" stroke="#21262D" strokeWidth="2" />
      <rect x="60" y="138" width="40" height="10" rx="2" fill="#30363D" />

      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translateY(-14px)' : 'translateY(8px)' }}>
        <rect x="70" y="46" width="20" height="8" rx="2" fill="#8B949E" />
        <circle cx="80" cy="38" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="80" y1="46" x2="80" y2="95" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
        <line x1="80" y1="95" x2="76" y2="118" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
        <line x1="76" y1="118" x2="76" y2="138" stroke={accentColor} strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />
        <line x1="76" y1="138" x2="86" y2="138" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// 11. GÊMEOS NO LEG PRESS (leg-5-legpress / calfLegPress)
export function CalfRaiseLegPressSvg({ phase, accentColor }: SvgModelProps) {
  const isPushed = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Panturrilha no Leg Press 45°">
      <line x1="25" y1="135" x2="135" y2="25" stroke="#21262D" strokeWidth="6" strokeLinecap="round" />
      <g className="transition-transform duration-1000" style={{ transform: isPushed ? 'translate(8px, -8px)' : 'translate(0, 0)' }}>
        <line x1="100" y1="60" x2="120" y2="40" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />
      </g>
      <circle cx="35" cy="118" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="38" y1="125" x2="60" y2="140" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="60" y1="140" x2="100" y2="60" stroke={accentColor} strokeWidth="5" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />
    </svg>
  );
}

// Aliases
export const SquatLegPressSvg = SquatSmithSvg;
export const CalfRaiseStandingSvg = CalfRaiseSvg;
