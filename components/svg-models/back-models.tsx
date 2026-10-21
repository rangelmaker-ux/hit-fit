import React from 'react';
import { SvgModelProps } from './types';

// 1. PUXADA FRONTAL BARRA ABERTA (back-1-wide / pulldownWide)
export function PulldownWideSvg({ phase, accentColor }: SvgModelProps) {
  const isDown = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Puxada Frontal Barra Aberta">
      <rect x="25" y="15" width="110" height="8" rx="2" fill="#21262D" />
      <circle cx="80" cy="19" r="5" fill="#30363D" stroke="#8B949E" strokeWidth="1.5" />
      <line x1="75" y1="85" x2="75" y2="140" stroke="#30363D" strokeWidth="6" strokeLinecap="round" />
      <circle cx="75" cy="74" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="75" y1="82" x2="75" y2="135" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Cabo e Barra Aberta Curva */}
      <line x1="80" y1="24" x2="80" y2={isDown ? '60' : '36'} stroke="#8B949E" strokeWidth="2" strokeDasharray="3 2" className="transition-all duration-1000 ease-in-out" />
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isDown ? 'translateY(24px)' : 'translateY(0px)' }}>
        <path d="M35 42 Q80 34 125 42" stroke="#E6EDF3" strokeWidth="4" fill="none" strokeLinecap="round" />
        <rect x="30" y="39" width="7" height="6" rx="1" fill={accentColor} />
        <rect x="123" y="39" width="7" height="6" rx="1" fill={accentColor} />
      </g>

      <path
        d={isDown ? 'M72 88 L50 66 L36 66' : 'M72 88 L54 60 L35 42'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
      <path
        d={isDown ? 'M78 88 L100 66 L114 66' : 'M78 88 L96 60 L125 42'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
    </svg>
  );
}

// 2. PUXADA COM TRIÂNGULO (back-1-close-triangle / pulldownClose)
export function PulldownCloseSvg({ phase, accentColor }: SvgModelProps) {
  const isDown = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Puxada com Triângulo">
      <rect x="25" y="15" width="110" height="8" rx="2" fill="#21262D" />
      <circle cx="80" cy="19" r="5" fill="#30363D" stroke="#8B949E" strokeWidth="1.5" />
      <circle cx="75" cy="74" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="75" y1="82" x2="75" y2="135" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Puxador Triângulo convergindo no peito */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isDown ? 'translateY(28px)' : 'translateY(0px)' }}>
        <path d="M72 40 L80 32 L88 40 Z" stroke="#E6EDF3" strokeWidth="3" fill="none" />
      </g>
      <line x1="75" y1="88" x2={isDown ? '78' : '76'} y2={isDown ? '65' : '38'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />
    </svg>
  );
}

// 3. REMADA SENTADA NO CABO / POLIA BAIXA (back-2-seated-cable / cableRowSeated)
export function CableRowSvg({ phase, accentColor }: SvgModelProps) {
  const isPulled = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Remada Baixa no Triângulo">
      <line x1="20" y1="125" x2="140" y2="125" stroke="#21262D" strokeWidth="6" strokeLinecap="round" />
      <circle cx="25" cy="115" r="6" fill="#30363D" stroke="#8B949E" strokeWidth="2" />
      <line x1="45" y1="105" x2="45" y2="125" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />

      <circle cx={isPulled ? '108' : '95'} cy="72" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" className="transition-all duration-1000" />
      <line x1={isPulled ? '108' : '95'} y1="80" x2={isPulled ? '108' : '95'} y2="120" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" className="transition-all duration-1000" />
      <line x1={isPulled ? '108' : '95'} y1="120" x2="45" y2="115" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />

      <line x1="25" y1="115" x2={isPulled ? '92' : '65'} y2={isPulled ? '95' : '90'} stroke="#8B949E" strokeWidth="2" strokeDasharray="3 2" className="transition-all duration-1000" />
      <path
        d={isPulled ? 'M106 88 L114 96 L92 95' : 'M95 88 L75 90 L65 90'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
    </svg>
  );
}

// 4. REMADA CAVALINHO T-BAR NO SOLO (back-2-tbar / tbarRow)
export function TBarRowSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Remada Cavalinho (T-Bar)">
      <line x1="20" y1="145" x2="140" y2="145" stroke="#21262D" strokeWidth="4" />
      {/* Pivô no chão no canto esquerdo */}
      <circle cx="28" cy="142" r="5" fill="#30363D" />

      {/* Barra em T inclinada */}
      <line x1="28" y1="142" x2="105" y2={isUp ? '75' : '95'} stroke="#8B949E" strokeWidth="5" strokeLinecap="round" className="transition-all duration-1000" />
      <circle cx="102" cy={isUp ? '77' : '97'} r="10" fill="#161B22" stroke={accentColor} strokeWidth="3" className="transition-all duration-1000" />

      {/* Atleta inclinado em 45° puxando com pegada neutra */}
      <circle cx="115" cy="55" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="115" y1="63" x2="125" y2="105" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="125" y1="105" x2="120" y2="145" stroke="#8B949E" strokeWidth="4" />

      <line x1="112" y1="72" x2="102" y2={isUp ? '77' : '97'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]" />
    </svg>
  );
}

// 5. REMADA UNILATERAL COM HALTER / SERROTE (back-3-dumbbell / singleArmRowDumbbell)
export function SingleArmRowSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Remada Unilateral no Banco (Serrote)">
      <line x1="25" y1="105" x2="115" y2="105" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="35" y1="105" x2="35" y2="145" stroke="#21262D" strokeWidth="4" />
      <line x1="105" y1="105" x2="105" y2="145" stroke="#21262D" strokeWidth="4" />
      <line x1="15" y1="145" x2="145" y2="145" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />

      {/* Apoio de Joelho e Mão no Banco */}
      <circle cx="45" cy="105" r="4" fill="#8B949E" />
      <circle cx="100" cy="105" r="4" fill="#8B949E" />

      {/* Tronco Horizontal */}
      <circle cx="108" cy="72" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="108" y1="80" x2="52" y2="82" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="98" y1="80" x2="100" y2="105" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="52" y1="82" x2="45" y2="105" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="52" y1="82" x2="62" y2="145" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />

      {/* Halter Unilateral Móvel */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translateY(-28px)' : 'translateY(12px)' }}>
        <line x1="72" y1="98" x2="88" y2="98" stroke="#E6EDF3" strokeWidth="3" strokeLinecap="round" />
        <rect x="68" y="92" width="5" height="12" rx="1" fill="#8B949E" />
        <rect x="87" y="92" width="5" height="12" rx="1" fill="#8B949E" />
      </g>

      <path
        d={isUp ? 'M80 82 L72 64 L80 70' : 'M80 82 L80 110'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
    </svg>
  );
}

// 6. REMADA UNILATERAL NA POLIA BAIXA (back-3-cable / singleArmRowCable)
export function SingleArmRowCableSvg({ phase, accentColor }: SvgModelProps) {
  const isPulled = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Remada Unilateral na Polia Baixa">
      <rect x="15" y="55" width="8" height="90" rx="2" fill="#161B22" stroke="#21262D" strokeWidth="2" />
      <circle cx="19" cy="130" r="5" fill="#30363D" stroke="#8B949E" strokeWidth="1.5" />
      <line x1="10" y1="145" x2="140" y2="145" stroke="#30363D" strokeWidth="3" />

      {/* Atleta em pé com joelhos semiflexionados */}
      <circle cx="95" cy="65" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="95" y1="73" x2="105" y2="110" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="105" y1="110" x2="100" y2="145" stroke="#FFFFFF" strokeWidth="4" />

      {/* Cabo até o puxador estribo */}
      <line x1="19" y1="130" x2={isPulled ? '85' : '55'} y2={isPulled ? '90' : '105'} stroke="#8B949E" strokeWidth="2" strokeDasharray="3 2" className="transition-all duration-1000" />
      <line x1="95" y1="78" x2={isPulled ? '85' : '55'} y2={isPulled ? '90' : '105'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />
    </svg>
  );
}

// 7. BARRA FIXA ASSISTIDA NO GRAVITON (back-1-graviton / gravitonPullup)
export function GravitonPullupSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Barra Fixa Assistida no Graviton">
      {/* Colunas e trilhos laterais da máquina */}
      <line x1="30" y1="15" x2="30" y2="148" stroke="#21262D" strokeWidth="4" />
      <line x1="130" y1="15" x2="130" y2="148" stroke="#21262D" strokeWidth="4" />
      <line x1="20" y1="148" x2="140" y2="148" stroke="#30363D" strokeWidth="4" />

      {/* Barra de pegada superior com manoplas ergonômicas */}
      <line x1="30" y1="20" x2="130" y2="20" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
      <line x1="45" y1="20" x2="55" y2="28" stroke="#E6EDF3" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="115" y1="20" x2="105" y2="28" stroke="#E6EDF3" strokeWidth="3.5" strokeLinecap="round" />

      {/* Plataforma de apoio dos joelhos conectada ao contrapeso móvel */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translateY(-24px)' : 'translateY(4px)' }}>
        <rect x="52" y="116" width="56" height="8" rx="2" fill="#21262D" stroke="#8B949E" strokeWidth="1.5" />
        <rect x="58" y="112" width="44" height="4" rx="1" fill="#484F58" />
      </g>

      {/* Atleta subindo em tração assistida */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translateY(-24px)' : 'translateY(4px)' }}>
        {/* Cabeça passando ou aproximando da barra */}
        <circle cx="80" cy={isUp ? '24' : '44'} r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
        {/* Tronco ereto com contração de dorsal */}
        <line x1="80" y1={isUp ? '32' : '52'} x2="80" y2={isUp ? '76' : '96'} stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        {/* Coxas flexionadas apoiadas sobre a plataforma */}
        <line x1="80" y1={isUp ? '76' : '96'} x2="80" y2="114" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

        {/* Braços e cotovelos flexionados na puxada */}
        <line
          x1={isUp ? '80' : '80'}
          y1={isUp ? '38' : '56'}
          x2={isUp ? '58' : '52'}
          y2={isUp ? '56' : '36'}
          stroke={accentColor}
          strokeWidth="5"
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_currentColor]"
        />
        <line
          x1={isUp ? '58' : '52'}
          y1={isUp ? '56' : '36'}
          x2="55"
          y2="28"
          stroke="#E6EDF3"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <line
          x1={isUp ? '80' : '80'}
          y1={isUp ? '38' : '56'}
          x2={isUp ? '102' : '108'}
          y2={isUp ? '56' : '36'}
          stroke={accentColor}
          strokeWidth="5"
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_currentColor]"
        />
        <line
          x1={isUp ? '102' : '108'}
          y1={isUp ? '56' : '36'}
          x2="105"
          y2="28"
          stroke="#E6EDF3"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

// 8. REMADA MÁQUINA ARTICULADA COM APOIO PEITORAL (back-2-machine / chestSupportedRowMachine)
export function ChestSupportedRowMachineSvg({ phase, accentColor }: SvgModelProps) {
  const isPulled = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Remada Máquina Articulada com Apoio Peitoral">
      <line x1="15" y1="148" x2="145" y2="148" stroke="#30363D" strokeWidth="4" />

      {/* Banco e base da máquina */}
      <rect x="36" y="98" width="30" height="8" rx="2" fill="#21262D" stroke="#30363D" strokeWidth="1.5" />
      <line x1="48" y1="106" x2="48" y2="148" stroke="#21262D" strokeWidth="4" />

      {/* Almofada Peitoral Vertical Frontal */}
      <rect x="76" y="58" width="8" height="42" rx="3" fill="#8B949E" stroke="#E6EDF3" strokeWidth="1.5" />
      <line x1="80" y1="100" x2="80" y2="148" stroke="#21262D" strokeWidth="5" />

      {/* Eixo de articulação das alavancas */}
      <circle cx="106" cy="46" r="5" fill="#30363D" stroke="#8B949E" strokeWidth="2" />

      {/* Alavanca mecânica articulada */}
      <line
        x1="106"
        y1="46"
        x2={isPulled ? '82' : '108'}
        y2={isPulled ? '76' : '78'}
        stroke="#8B949E"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out"
      />
      {/* Pegador da alavanca */}
      <circle
        cx={isPulled ? '82' : '108'}
        cy={isPulled ? '76' : '78'}
        r="4"
        fill="#E6EDF3"
        className="transition-all duration-1000 ease-in-out"
      />

      {/* Atleta sentado com peito apoiado */}
      <circle cx="60" cy="46" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      {/* Tronco encostado firme na almofada peitoral */}
      <line x1="60" y1="54" x2="72" y2="98" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      {/* Pernas do atleta no apoio de pé */}
      <line x1="72" y1="98" x2="55" y2="140" stroke="#484F58" strokeWidth="4" strokeLinecap="round" />

      {/* Braço puxando a alavanca para trás - cotovelo passando da linha do tronco */}
      <line
        x1="66"
        y1="64"
        x2={isPulled ? '44' : '88'}
        y2={isPulled ? '74' : '72'}
        stroke={accentColor}
        strokeWidth="5"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />
      <line
        x1={isPulled ? '44' : '88'}
        y1={isPulled ? '74' : '72'}
        x2={isPulled ? '82' : '108'}
        y2={isPulled ? '76' : '78'}
        stroke={accentColor}
        strokeWidth="4"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out"
      />
    </svg>
  );
}

// Aliases
export const PulldownSvg = PulldownWideSvg;
export const CableRowSeatedSvg = CableRowSvg;
export const SingleArmRowDumbbellSvg = SingleArmRowSvg;
