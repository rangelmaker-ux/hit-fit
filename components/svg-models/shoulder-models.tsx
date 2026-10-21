import React from 'react';
import { SvgModelProps } from './types';

// ============================================================================
// 1. DESENVOLVIMENTO COM HALTERES (sh-1-dumbbells / shoulderPressDumbbell)
// Banco 75° + dois halteres livres com elevação vertical overhead
// ============================================================================
export function ShoulderPressDumbbellSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Desenvolvimento com Halteres no Banco">
      {/* Banco Regulável inclinado a 75° */}
      <line x1="80" y1="45" x2="72" y2="108" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="68" y1="108" x2="92" y2="108" stroke="#30363D" strokeWidth="6" strokeLinecap="round" />
      <line x1="80" y1="108" x2="80" y2="148" stroke="#21262D" strokeWidth="6" />
      <line x1="60" y1="148" x2="100" y2="148" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />

      {/* Atleta Sentado */}
      <circle cx="77" cy="48" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="76" y1="58" x2="73" y2="105" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Halteres Livres móveis com trajetória vertical */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateY(-26px)' : 'translateY(8px)' }}
      >
        {/* Halter Esquerdo */}
        <line x1="40" y1="68" x2="56" y2="68" stroke="#E6EDF3" strokeWidth="3" strokeLinecap="round" />
        <rect x="36" y="62" width="5" height="12" rx="1" fill="#8B949E" />
        <rect x="55" y="62" width="5" height="12" rx="1" fill="#8B949E" />

        {/* Halter Direito */}
        <line x1="98" y1="68" x2="114" y2="68" stroke="#E6EDF3" strokeWidth="3" strokeLinecap="round" />
        <rect x="94" y="62" width="5" height="12" rx="1" fill="#8B949E" />
        <rect x="113" y="62" width="5" height="12" rx="1" fill="#8B949E" />
      </g>

      {/* Braços e Deltoides com iluminação dinâmica */}
      <path
        d={isUp ? 'M68 62 L50 48 L48 42' : 'M68 62 L48 72 L48 76'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />
      <path
        d={isUp ? 'M84 62 L102 48 L104 42' : 'M84 62 L104 72 L104 76'}
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />
    </svg>
  );
}

// ============================================================================
// 2. DESENVOLVIMENTO EM MÁQUINA ARTICULADA (sh-1-machine / shoulderPressMachine)
// Máquina de placas com alavancas convergentes e articulações mecânicas
// ============================================================================
export function ShoulderPressMachineSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Desenvolvimento em Máquina Articulada">
      {/* Coluna de Carga / Torre Mecânica lateral */}
      <rect x="15" y="45" width="14" height="95" rx="2" fill="#161B22" stroke="#30363D" strokeWidth="2" />
      <line x1="22" y1="50" x2="22" y2="135" stroke="#21262D" strokeWidth="2" />
      {/* Pino seletor */}
      <rect x="13" y="85" width="18" height="6" rx="1" fill="#F59E0B" />

      {/* Chassi da Máquina e Encosto */}
      <line x1="75" y1="55" x2="75" y2="120" stroke="#30363D" strokeWidth="9" strokeLinecap="round" />
      <line x1="68" y1="120" x2="95" y2="120" stroke="#30363D" strokeWidth="7" strokeLinecap="round" />
      <line x1="28" y1="135" x2="140" y2="135" stroke="#21262D" strokeWidth="4" strokeLinecap="round" />

      {/* Pivôs Articulados da Máquina */}
      <circle cx="55" cy="100" r="4" fill="#0D1117" stroke="#8B949E" strokeWidth="2" />
      <circle cx="105" cy="100" r="4" fill="#0D1117" stroke="#8B949E" strokeWidth="2" />

      {/* Atleta Sentado */}
      <circle cx="80" cy="52" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="60" x2="80" y2="115" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Alavancas Articuladas e Manoplas Convergentes */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '80px 100px',
          transform: isUp ? 'rotate(0deg)' : 'rotate(-12deg)'
        }}
      >
        <line x1="55" y1="100" x2="48" y2={isUp ? '46' : '72'} stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
        <rect x="42" y={isUp ? '42' : '68'} width="12" height="6" rx="2" fill={accentColor} />
      </g>
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '80px 100px',
          transform: isUp ? 'rotate(0deg)' : 'rotate(12deg)'
        }}
      >
        <line x1="105" y1="100" x2="112" y2={isUp ? '46' : '72'} stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
        <rect x="106" y={isUp ? '42' : '68'} width="12" height="6" rx="2" fill={accentColor} />
      </g>

      {/* Braços com ativação de deltoide */}
      <line x1="76" y1="66" x2="48" y2={isUp ? '45' : '71'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />
      <line x1="84" y1="66" x2="112" y2={isUp ? '45' : '71'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />
    </svg>
  );
}

// ============================================================================
// 3. DESENVOLVIMENTO NO SMITH MACHINE (sh-1-smith / shoulderPressSmith)
// Trilhos verticais guiados da Smith Machine com barra guiada contínua
// ============================================================================
export function ShoulderPressSmithSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Desenvolvimento no Smith Machine">
      {/* Trilhos Verticais da Smith */}
      <line x1="25" y1="20" x2="25" y2="145" stroke="#21262D" strokeWidth="4" />
      <line x1="135" y1="20" x2="135" y2="145" stroke="#21262D" strokeWidth="4" />
      <line x1="20" y1="145" x2="140" y2="145" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />

      {/* Travas de Altura no Smith */}
      <rect x="22" y="90" width="6" height="5" fill="#F59E0B" rx="1" />
      <rect x="132" y="90" width="6" height="5" fill="#F59E0B" rx="1" />

      {/* Banco dentro da Smith */}
      <line x1="80" y1="55" x2="80" y2="115" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="70" y1="115" x2="90" y2="115" stroke="#30363D" strokeWidth="6" strokeLinecap="round" />

      {/* Atleta Sentado */}
      <circle cx="80" cy="54" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="62" x2="80" y2="112" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Barra Guiada móvel sobre os trilhos */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateY(-24px)' : 'translateY(12px)' }}
      >
        <line x1="20" y1="60" x2="140" y2="60" stroke="#E6EDF3" strokeWidth="4" strokeLinecap="round" />
        <rect x="21" y="54" width="6" height="12" rx="1" fill={accentColor} />
        <rect x="133" y="54" width="6" height="12" rx="1" fill={accentColor} />
      </g>

      {/* Braços empurrando a barra */}
      <line x1="76" y1="66" x2="52" y2={isUp ? '38' : '74'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />
      <line x1="84" y1="66" x2="108" y2={isUp ? '38' : '74'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />
    </svg>
  );
}

// ============================================================================
// 4. ELEVAÇÃO LATERAL NO CABO / POLIA BAIXA (sh-2-cables / lateralRaiseCable)
// Duas roldanas baixas cruzadas com cabos tracionando até 90° em "T"
// ============================================================================
export function LateralRaiseCableSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Elevação Lateral na Polia Baixa">
      {/* Torres Laterais da Polia Baixa */}
      <rect x="8" y="50" width="8" height="95" rx="2" fill="#161B22" stroke="#21262D" strokeWidth="2" />
      <rect x="144" y="50" width="8" height="95" rx="2" fill="#161B22" stroke="#21262D" strokeWidth="2" />
      <circle cx="12" cy="138" r="5" fill="#30363D" stroke="#8B949E" strokeWidth="1.5" />
      <circle cx="148" cy="138" r="5" fill="#30363D" stroke="#8B949E" strokeWidth="1.5" />
      <line x1="5" y1="145" x2="155" y2="145" stroke="#30363D" strokeWidth="3" strokeLinecap="round" />

      {/* Atleta em Pé */}
      <circle cx="80" cy="42" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="50" x2="80" y2="100" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="80" y1="100" x2="72" y2="142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="100" x2="88" y2="142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Braços em Abdução Lateral (em "T" a 90°) */}
      <line
        x1="76"
        y1="56"
        x2={isUp ? '30' : '65'}
        y2={isUp ? '56' : '90'}
        stroke={accentColor}
        strokeWidth="4"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />
      <line
        x1="84"
        y1="56"
        x2={isUp ? '130' : '95'}
        y2={isUp ? '56' : '90'}
        stroke={accentColor}
        strokeWidth="4"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />

      {/* Cabos de Aço da Polia Baixa */}
      <line
        x1="12"
        y1="138"
        x2={isUp ? '30' : '65'}
        y2={isUp ? '56' : '90'}
        stroke="#8B949E"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        className="transition-all duration-1000"
      />
      <line
        x1="148"
        y1="138"
        x2={isUp ? '130' : '95'}
        y2={isUp ? '56' : '90'}
        stroke="#8B949E"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        className="transition-all duration-1000"
      />
    </svg>
  );
}

// ============================================================================
// 5. ELEVAÇÃO LATERAL COM HALTERES (sh-2-dumbbells / lateralRaiseDumbbell)
// Sem cabos! Atleta em pé com halteres livres subindo lateralmente até 90°
// ============================================================================
export function LateralRaiseDumbbellSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Elevação Lateral com Halteres Livres">
      {/* Solo e Base */}
      <line x1="30" y1="145" x2="130" y2="145" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />

      {/* Atleta em Pé */}
      <circle cx="80" cy="40" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="49" x2="80" y2="100" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="80" y1="100" x2="72" y2="142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="100" x2="88" y2="142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Braços com Halteres nas mãos */}
      <line
        x1="76"
        y1="55"
        x2={isUp ? '32' : '64'}
        y2={isUp ? '55' : '90'}
        stroke={accentColor}
        strokeWidth="4"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />
      <line
        x1="84"
        y1="55"
        x2={isUp ? '128' : '96'}
        y2={isUp ? '55' : '90'}
        stroke={accentColor}
        strokeWidth="4"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />

      {/* Halter Esquerdo */}
      <g className="transition-all duration-1000 ease-in-out" style={{ transform: isUp ? 'translate(0, 0)' : 'translate(32px, 35px)' }}>
        <line x1="26" y1="55" x2="38" y2="55" stroke="#E6EDF3" strokeWidth="3" />
        <rect x="23" y="50" width="4" height="10" rx="1" fill="#8B949E" />
        <rect x="37" y="50" width="4" height="10" rx="1" fill="#8B949E" />
      </g>

      {/* Halter Direito */}
      <g className="transition-all duration-1000 ease-in-out" style={{ transform: isUp ? 'translate(0, 0)' : 'translate(-32px, 35px)' }}>
        <line x1="122" y1="55" x2="134" y2="55" stroke="#E6EDF3" strokeWidth="3" />
        <rect x="119" y="50" width="4" height="10" rx="1" fill="#8B949E" />
        <rect x="133" y="50" width="4" height="10" rx="1" fill="#8B949E" />
      </g>
    </svg>
  );
}

// ============================================================================
// 6. ELEVAÇÃO LATERAL NA MÁQUINA SENTADO (sh-2-machine / lateralRaiseMachine)
// Máquina articulada com almofadas acolchoadas sob os cotovelos elevando alavancas
// ============================================================================
export function LateralRaiseMachineSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Elevação Lateral na Máquina Específica">
      {/* Chassi Central da Máquina */}
      <line x1="80" y1="60" x2="80" y2="120" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="65" y1="120" x2="95" y2="120" stroke="#30363D" strokeWidth="6" strokeLinecap="round" />
      <line x1="30" y1="145" x2="130" y2="145" stroke="#21262D" strokeWidth="4" strokeLinecap="round" />

      {/* Atleta Sentado */}
      <circle cx="80" cy="50" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="58" x2="80" y2="115" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Pivôs Centrais */}
      <circle cx="70" cy="80" r="3" fill="#8B949E" />
      <circle cx="90" cy="80" r="3" fill="#8B949E" />

      {/* Alavancas com almofadas de cotovelo */}
      <g className="transition-all duration-1000 ease-in-out">
        <line x1="70" y1="80" x2={isUp ? '35' : '55'} y2={isUp ? '60' : '95'} stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
        <circle cx={isUp ? '35' : '55'} cy={isUp ? '60' : '95'} r="6" fill={accentColor} />
      </g>
      <g className="transition-all duration-1000 ease-in-out">
        <line x1="90" y1="80" x2={isUp ? '125' : '105'} y2={isUp ? '60' : '95'} stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
        <circle cx={isUp ? '125' : '105'} cy={isUp ? '60' : '95'} r="6" fill={accentColor} />
      </g>

      {/* Braços com foco no deltoide */}
      <line x1="76" y1="62" x2={isUp ? '35' : '55'} y2={isUp ? '60' : '95'} stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
      <line x1="84" y1="62" x2={isUp ? '125' : '105'} y2={isUp ? '60' : '95'} stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================================
// 7. CRUCIFIXO INVERSO NO PECK DECK (sh-3-peck-deck / rearDeltPeckDeck)
// ============================================================================
export function RearDeltPeckDeckSvg({ phase, accentColor }: SvgModelProps) {
  const isBack = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Crucifixo Inverso no Peck Deck">
      <line x1="30" y1="145" x2="130" y2="145" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="50" x2="80" y2="120" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <circle cx="80" cy="46" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="54" x2="80" y2="115" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Alavancas se abrindo para trás (abdução horizontal) */}
      <line x1="76" y1="64" x2={isBack ? '28' : '55'} y2="64" stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000 ease-in-out" />
      <line x1="84" y1="64" x2={isBack ? '132' : '105'} y2="64" stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000 ease-in-out" />

      <circle cx={isBack ? '28' : '55'} cy="64" r="5" fill="#8B949E" />
      <circle cx={isBack ? '132' : '105'} cy="64" r="5" fill="#8B949E" />
    </svg>
  );
}

// ============================================================================
// 8. FACE PULL NA CORDA (sh-3-facepull / facepullCable)
// ============================================================================
export function FacepullCableSvg({ phase, accentColor }: SvgModelProps) {
  const isPulled = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Facepull na Polia Alta com Corda">
      <rect x="15" y="20" width="8" height="125" rx="2" fill="#161B22" stroke="#21262D" strokeWidth="2" />
      <circle cx="19" cy="35" r="5" fill="#30363D" stroke="#8B949E" strokeWidth="1.5" />

      {/* Atleta em pé inclinado para trás */}
      <circle cx="110" cy="50" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="110" y1="58" x2="105" y2="110" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="105" y1="110" x2="95" y2="145" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="105" y1="110" x2="115" y2="145" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Cabo até as mãos / testa */}
      <line x1="19" y1="35" x2={isPulled ? '96' : '65'} y2={isPulled ? '50' : '44'} stroke="#8B949E" strokeWidth="2" strokeDasharray="2 2" className="transition-all duration-1000" />
      {/* Braços com cotovelos altos e abertos */}
      <line x1="110" y1="62" x2={isPulled ? '96' : '65'} y2={isPulled ? '50' : '44'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />
    </svg>
  );
}

// ============================================================================
// 9. CRUCIFIXO INVERSO COM HALTERES (sh-3-dumbbells / rearDeltDumbbell)
// ============================================================================
export function RearDeltDumbbellSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Crucifixo Inverso com Halteres">
      <line x1="25" y1="145" x2="135" y2="145" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />
      {/* Atleta curvado a 45° */}
      <circle cx="55" cy="55" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="58" y1="62" x2="85" y2="85" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="85" y1="85" x2="88" y2="145" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Halteres abrindo lateralmente em cruz */}
      <line x1="70" y1="72" x2={isUp ? '35' : '65'} y2={isUp ? '48' : '105'} stroke={accentColor} strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000" />
      <circle cx={isUp ? '35' : '65'} cy={isUp ? '48' : '105'} r="5" fill="#8B949E" className="transition-all duration-1000" />
    </svg>
  );
}

// ============================================================================
// Aliases para retrocompatibilidade
// ============================================================================
export const ShoulderPressSvg = ShoulderPressDumbbellSvg;
export const LateralRaiseSvg = LateralRaiseCableSvg;
export const RearDeltFlySvg = RearDeltPeckDeckSvg;
