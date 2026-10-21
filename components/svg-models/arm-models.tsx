import React from 'react';
import { SvgModelProps } from './types';

// 1. ROSCA DIRETA COM BARRA W (back-4-wbar / bicepsWBar)
export function BicepsCurlWBarSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Rosca Direta com Barra W">
      <line x1="30" y1="145" x2="130" y2="145" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="40" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="49" x2="80" y2="98" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="80" y1="98" x2="74" y2="142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="98" x2="86" y2="142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Cotovelos fixos */}
      <circle cx="72" cy="74" r="3" fill="#8B949E" />
      <circle cx="88" cy="74" r="3" fill="#8B949E" />

      {/* Barra W Ondulada subindo até o peito */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translateY(-30px)' : 'translateY(12px)' }}>
        <path d="M55 92 L64 96 L72 90 L80 96 L88 90 L96 96 L105 92" stroke="#E6EDF3" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="52" y="87" width="5" height="12" rx="1" fill={accentColor} />
        <rect x="103" y="87" width="5" height="12" rx="1" fill={accentColor} />
      </g>

      <path
        d={isUp ? 'M72 74 L65 62' : 'M72 74 L65 104'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
      <path
        d={isUp ? 'M88 74 L95 62' : 'M88 74 L95 104'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
    </svg>
  );
}

// 2. ROSCA NO CABO COM BARRA RETA (back-4-cable / bicepsCable)
export function BicepsCurlCableSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Rosca no Cabo na Polia Baixa">
      <rect x="25" y="60" width="8" height="85" rx="2" fill="#161B22" stroke="#21262D" strokeWidth="2" />
      <circle cx="29" cy="138" r="5" fill="#30363D" stroke="#8B949E" strokeWidth="1.5" />
      <circle cx="95" cy="40" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="95" y1="49" x2="95" y2="98" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="95" y1="98" x2="90" y2="142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="95" y1="98" x2="100" y2="142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Cabo puxando da polia baixa até a barra reta */}
      <line x1="29" y1="138" x2="80" y2={isUp ? '62' : '104'} stroke="#8B949E" strokeWidth="2" strokeDasharray="3 2" className="transition-all duration-1000" />
      <line x1="72" y1={isUp ? '62' : '104'} x2="88" y2={isUp ? '62' : '104'} stroke="#E6EDF3" strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />

      <path
        d={isUp ? 'M90 74 L80 62' : 'M90 74 L80 104'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
    </svg>
  );
}

// 3. ROSCA MARTELO COM HALTERES (back-5-dumbbells / hammerDumbbell)
export function HammerCurlDumbbellSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Rosca Martelo com Halteres">
      <line x1="30" y1="145" x2="130" y2="145" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="40" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="49" x2="80" y2="98" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="80" y1="98" x2="74" y2="142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="98" x2="86" y2="142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Halteres em pegada neutra vertical (sem girar os punhos) */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translateY(-30px)' : 'translateY(12px)' }}>
        {/* Halter Esquerdo */}
        <line x1="60" y1="84" x2="60" y2="104" stroke="#E6EDF3" strokeWidth="3" strokeLinecap="round" />
        <rect x="56" y="80" width="8" height="5" rx="1" fill="#8B949E" />
        <rect x="56" y="103" width="8" height="5" rx="1" fill="#8B949E" />

        {/* Halter Direito */}
        <line x1="100" y1="84" x2="100" y2="104" stroke="#E6EDF3" strokeWidth="3" strokeLinecap="round" />
        <rect x="96" y="80" width="8" height="5" rx="1" fill="#8B949E" />
        <rect x="96" y="103" width="8" height="5" rx="1" fill="#8B949E" />
      </g>

      <path
        d={isUp ? 'M72 74 L60 64' : 'M72 74 L60 94'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
      <path
        d={isUp ? 'M88 74 L100 64' : 'M88 74 L100 94'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
    </svg>
  );
}

// 4. TRÍCEPS CORDA NA POLIA ALTA (sh-4-rope / tricepsRopePushdown)
export function TricepsRopePushdownSvg({ phase, accentColor }: SvgModelProps) {
  const isExtended = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Tríceps Corda na Polia Alta">
      <circle cx="80" cy="20" r="5" fill="#30363D" stroke="#8B949E" strokeWidth="1.5" />
      <line x1="70" y1="15" x2="90" y2="15" stroke="#21262D" strokeWidth="4" />

      {/* Atleta de perfil com cotovelos estáveis */}
      <circle cx="80" cy="46" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="54" x2="80" y2="105" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="80" y1="105" x2="74" y2="145" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="105" x2="86" y2="145" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Cotovelos fixos ao lado do tronco */}
      <circle cx="74" cy="72" r="3" fill="#8B949E" />
      <circle cx="86" cy="72" r="3" fill="#8B949E" />

      {/* Corda descendo e abrindo nas pontas */}
      <path
        d={isExtended ? 'M80 25 L80 65 L65 110' : 'M80 25 L80 65 L72 75'}
        stroke="#8B949E"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out"
      />
      <path
        d={isExtended ? 'M80 25 L80 65 L95 110' : 'M80 25 L80 65 L88 75'}
        stroke="#8B949E"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out"
      />

      <circle cx={isExtended ? '65' : '72'} cy={isExtended ? '110' : '75'} r="4" fill={accentColor} className="transition-all duration-1000" />
      <circle cx={isExtended ? '95' : '88'} cy={isExtended ? '110' : '75'} r="4" fill={accentColor} className="transition-all duration-1000" />

      <line x1="74" y1="72" x2={isExtended ? '65' : '72'} y2={isExtended ? '110' : '75'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]" />
      <line x1="86" y1="72" x2={isExtended ? '95' : '88'} y2={isExtended ? '110' : '75'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]" />
    </svg>
  );
}

// 5. TRÍCEPS BARRA RETA OU V (sh-4-bar / tricepsBarPushdown)
export function TricepsBarPushdownSvg({ phase, accentColor }: SvgModelProps) {
  const isExtended = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Tríceps Barra Reta ou V">
      <circle cx="80" cy="20" r="5" fill="#30363D" stroke="#8B949E" strokeWidth="1.5" />
      <circle cx="80" cy="46" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="54" x2="80" y2="105" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Barra Reta fixa descendo */}
      <line x1="80" y1="25" x2="80" y2={isExtended ? '105' : '75'} stroke="#8B949E" strokeWidth="2" strokeDasharray="3 2" className="transition-all duration-1000" />
      <line x1="68" y1={isExtended ? '105' : '75'} x2="92" y2={isExtended ? '105' : '75'} stroke="#E6EDF3" strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />

      <line x1="75" y1="72" x2="72" y2={isExtended ? '105' : '75'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]" />
      <line x1="85" y1="72" x2="88" y2={isExtended ? '105' : '75'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]" />
    </svg>
  );
}

// 6. ROSCA COM HALTERES ALTERNADA COM SUPINAÇÃO (back-4-dumbbells / bicepsAlternatingDumbbell)
export function BicepsCurlAlternatingDumbbellSvg({ phase, accentColor }: SvgModelProps) {
  const isCurled = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Rosca com Halteres Alternada com Supinação">
      <line x1="25" y1="148" x2="135" y2="148" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />

      {/* Atleta em pé com coluna alinhada */}
      <circle cx="80" cy="38" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="46" x2="80" y2="95" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="80" y1="95" x2="73" y2="148" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="95" x2="87" y2="148" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Braço Esquerdo (em repouso ao lado com halter neutro) */}
      <line x1="74" y1="56" x2="68" y2="82" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="68" y1="82" x2="66" y2="108" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
      {/* Halter esquerdo neutro */}
      <line x1="61" y1="108" x2="71" y2="108" stroke="#E6EDF3" strokeWidth="3" />
      <rect x="58" y="104" width="3" height="8" rx="1" fill="#8B949E" />
      <rect x="71" y="104" width="3" height="8" rx="1" fill="#8B949E" />

      {/* Braço Direito Ativo (flexionando com rotação/supinação de punho) */}
      <line x1="86" y1="56" x2="90" y2="80" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      {/* Antebraço subindo com supinação - palma voltada ao ombro */}
      <line
        x1="90"
        y1="80"
        x2={isCurled ? '106' : '94'}
        y2={isCurled ? '54' : '108'}
        stroke={accentColor}
        strokeWidth="5"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />
      {/* Halter supinado no topo */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isCurled ? 'translate(8px, -52px)' : 'translate(0, 0)' }}>
        <line x1="89" y1="108" x2="103" y2="108" stroke="#E6EDF3" strokeWidth="3.5" />
        <rect x="86" y="103" width="3.5" height="10" rx="1" fill={accentColor} />
        <rect x="103" y="103" width="3.5" height="10" rx="1" fill={accentColor} />
      </g>
    </svg>
  );
}

// 7. ROSCA MARTELO NA CORDA NA POLIA BAIXA (back-5-rope / hammerRopeCable)
export function HammerCurlRopeCableSvg({ phase, accentColor }: SvgModelProps) {
  const isCurled = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Rosca Martelo na Corda (Polia Baixa)">
      {/* Polia baixa central no solo */}
      <circle cx="80" cy="142" r="5" fill="#30363D" stroke="#8B949E" strokeWidth="1.5" />
      <line x1="20" y1="148" x2="140" y2="148" stroke="#30363D" strokeWidth="4" />

      {/* Atleta em pé */}
      <circle cx="80" cy="40" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="48" x2="80" y2="98" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="80" y1="98" x2="72" y2="148" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="98" x2="88" y2="148" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Cotovelos travados na lateral do tronco */}
      <circle cx="74" cy="74" r="3" fill="#8B949E" />
      <circle cx="86" cy="74" r="3" fill="#8B949E" />

      {/* Cabo tracionando da polia baixa até a corda */}
      <line
        x1="80"
        y1="142"
        x2="80"
        y2={isCurled ? '76' : '110'}
        stroke="#8B949E"
        strokeWidth="2"
        strokeDasharray="3 2"
        className="transition-all duration-1000 ease-in-out"
      />

      {/* Puxador Corda dupla com pegada neutra e separação das pontas no pico */}
      <path
        d={isCurled ? 'M80 76 L66 66' : 'M80 110 L72 104'}
        stroke="#E6EDF3"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out"
      />
      <path
        d={isCurled ? 'M80 76 L94 66' : 'M80 110 L88 104'}
        stroke="#E6EDF3"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out"
      />

      {/* Pontas da corda (nódulos) */}
      <circle cx={isCurled ? '66' : '72'} cy={isCurled ? '66' : '104'} r="4" fill="#8B949E" className="transition-all duration-1000" />
      <circle cx={isCurled ? '94' : '88'} cy={isCurled ? '66' : '104'} r="4" fill="#8B949E" className="transition-all duration-1000" />

      {/* Antebraços puxando na pegada neutra com braquiorradial ativo */}
      <line
        x1="74"
        y1="74"
        x2={isCurled ? '66' : '72'}
        y2={isCurled ? '66' : '104'}
        stroke={accentColor}
        strokeWidth="5"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />
      <line
        x1="86"
        y1="74"
        x2={isCurled ? '94' : '88'}
        y2={isCurled ? '66' : '104'}
        stroke={accentColor}
        strokeWidth="5"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />
    </svg>
  );
}

// Aliases
export const BicepsCurlSvg = BicepsCurlWBarSvg;
export const HammerCurlSvg = HammerCurlDumbbellSvg;
