import React from 'react';

export interface SvgModelProps {
  phase: 'concentric' | 'eccentric';
  accentColor: string;
  isTechnicalMode?: boolean;
}

// ============================================================================
// 1. AGACHAMENTO SMITH / LIVRE (squat)
// Barra guiada em trilho vertical, flexão de joelho a 90° e extensão
// ============================================================================
export function SquatSmithSvg({ phase, accentColor, isTechnicalMode }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Trilhos Verticais da Smith Machine */}
      <line x1="25" y1="15" x2="25" y2="150" stroke="#21262D" strokeWidth="4" />
      <line x1="135" y1="15" x2="135" y2="150" stroke="#21262D" strokeWidth="4" />
      <line x1="20" y1="148" x2="140" y2="148" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />
      {/* Travas de segurança da Smith */}
      <rect x="22" y="112" width="6" height="4" fill="#F59E0B" rx="1" />
      <rect x="132" y="112" width="6" height="4" fill="#F59E0B" rx="1" />

      {/* Barra guiada móvel com anilhas */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateY(0px)' : 'translateY(36px)' }}
      >
        <line x1="18" y1="45" x2="142" y2="45" stroke="#E6EDF3" strokeWidth="5" strokeLinecap="round" />
        <rect x="18" y="37" width="8" height="16" rx="2" fill={accentColor} />
        <rect x="134" y="37" width="8" height="16" rx="2" fill={accentColor} />
        <circle cx="80" cy="40" r="10" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      </g>

      {/* Tronco, Quadril e Membros Inferiores */}
      <g className="transition-all duration-1000 ease-in-out">
        <line
          x1="80"
          y1={isUp ? '50' : '86'}
          x2={isUp ? '80' : '75'}
          y2={isUp ? '85' : '110'}
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Quadríceps com foco neon */}
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
        <line
          x1={isUp ? '72' : '96'}
          y1={isUp ? '118' : '118'}
          x2="74"
          y2="146"
          stroke="#8B949E"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line x1="68" y1="146" x2="84" y2="146" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Indicador de ângulo no modo técnico */}
      {isTechnicalMode && (
        <g className="animate-in fade-in">
          <circle cx={isUp ? 72 : 96} cy="118" r="14" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x={isUp ? 88 : 112} y="122" fill="#F59E0B" fontSize="9" fontWeight="bold">90°</text>
        </g>
      )}
    </svg>
  );
}

// ============================================================================
// 2. LEG PRESS 45° (legpress)
// Trenó e plataforma inclinados a 45° com encosto reclinado
// ============================================================================
export function LegPress45Svg({ phase, accentColor, isTechnicalMode }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Pernas estendidas empurrando o trenó a 45°
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Base da Máquina Leg Press 45° */}
      <line x1="15" y1="145" x2="145" y2="145" stroke="#21262D" strokeWidth="4" strokeLinecap="round" />
      {/* Trilho Inclinado a 45° */}
      <line x1="28" y1="135" x2="135" y2="28" stroke="#30363D" strokeWidth="5" strokeLinecap="round" />
      <line x1="42" y1="142" x2="142" y2="42" stroke="#21262D" strokeWidth="4" />

      {/* Banco Reclinado Fixo (45°) */}
      <line x1="24" y1="102" x2="52" y2="130" stroke="#484F58" strokeWidth="8" strokeLinecap="round" />
      <line x1="52" y1="130" x2="68" y2="130" stroke="#30363D" strokeWidth="7" strokeLinecap="round" />

      {/* Cabeça e Tronco do Atleta Reclinado */}
      <circle cx="28" cy="95" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="34" y1="101" x2="55" y2="125" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

      {/* Glúteo e Pelve na base do assento */}
      <circle cx="56" cy="126" r="6" fill={accentColor} className="drop-shadow-[0_0_6px_currentColor]" />

      {/* Trenó e Plataforma Móvel Deslizando no Trilho a 45° */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transform: isUp ? 'translate(26px, -26px)' : 'translate(0px, 0px)'
        }}
      >
        {/* Plataforma perpendicular ao trilho */}
        <line x1="86" y1="70" x2="114" y2="98" stroke="#E6EDF3" strokeWidth="6" strokeLinecap="round" />
        {/* Pino e Anilhas carregadas no trenó */}
        <line x1="100" y1="84" x2="120" y2="64" stroke="#8B949E" strokeWidth="4" />
        <circle cx="112" cy="72" r="8" fill={accentColor} />
        <circle cx="118" cy="66" r="7" fill={accentColor} />
      </g>

      {/* Pernas empurrando a plataforma */}
      <g className="transition-all duration-1000 ease-in-out">
        {/* Coxa / Quadríceps em destaque */}
        <line
          x1="56"
          y1="126"
          x2={isUp ? '80' : '65'}
          y2={isUp ? '102' : '95'}
          stroke={accentColor}
          strokeWidth="7"
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_currentColor]"
        />
        {/* Canela / Joelho estendendo */}
        <line
          x1={isUp ? '80' : '65'}
          y1={isUp ? '102' : '95'}
          x2={isUp ? '106' : '90'}
          y2={isUp ? '76' : '94'}
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Pés firmes na plataforma */}
        <circle cx={isUp ? 106 : 90} cy={isUp ? 76 : 94} r="3" fill="#FFFFFF" />
      </g>

      {/* Indicador no Modo Técnico */}
      {isTechnicalMode && (
        <g className="animate-in fade-in">
          <line x1="28" y1="135" x2="68" y2="135" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" />
          <text x="75" y="140" fill="#F59E0B" fontSize="9" fontWeight="bold">45°</text>
        </g>
      )}
    </svg>
  );
}

// ============================================================================
// 3. CADEIRA EXTENSORA (legext)
// Eixo articular no joelho com rolete estendendo a perna
// ============================================================================
export function LegExtensionSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Estrutura do Banco da Extensora */}
      <line x1="30" y1="65" x2="50" y2="105" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="48" y1="105" x2="90" y2="105" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="50" y1="105" x2="50" y2="145" stroke="#21262D" strokeWidth="6" />
      <circle cx="90" cy="105" r="7" fill="#161B22" stroke="#8B949E" strokeWidth="2" />

      {/* Tronco sentado com pegadores laterais */}
      <circle cx="40" cy="50" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="42" y1="59" x2="55" y2="105" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="45" y1="88" x2="65" y2="102" stroke="#8B949E" strokeWidth="3" strokeLinecap="round" />

      {/* Coxa (Quadríceps iluminado) */}
      <line x1="55" y1="105" x2="90" y2="105" stroke={accentColor} strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Canela e Rolete estendendo */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '90px 105px',
          transform: isUp ? 'rotate(-75deg)' : 'rotate(0deg)'
        }}
      >
        <line x1="90" y1="105" x2="90" y2="140" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />
        <rect x="83" y="130" width="14" height="12" rx="4" fill={accentColor} />
      </g>
    </svg>
  );
}

// ============================================================================
// 4. MESA FLEXORA (legcurl)
// Atleta deitado em decúbito ventral flexionando joelhos até glúteos
// ============================================================================
export function LegCurlSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Mesa Inclinada / Decúbito ventral */}
      <line x1="25" y1="105" x2="135" y2="105" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="45" y1="105" x2="45" y2="145" stroke="#21262D" strokeWidth="5" />
      <line x1="115" y1="105" x2="115" y2="145" stroke="#21262D" strokeWidth="5" />
      <circle cx="100" cy="103" r="6" fill="#161B22" stroke="#8B949E" strokeWidth="2" />

      {/* Atleta Deitado de Bruços */}
      <circle cx="35" cy="95" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="43" y1="99" x2="75" y2="100" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
      {/* Pegadores frontais */}
      <line x1="38" y1="106" x2="48" y2="114" stroke="#8B949E" strokeWidth="3" />

      {/* Posterior de Coxa em foco */}
      <line x1="75" y1="100" x2="100" y2="100" stroke={accentColor} strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Canela flexionando até os glúteos */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '100px 100px',
          transform: isUp ? 'rotate(-85deg)' : 'rotate(0deg)'
        }}
      >
        <line x1="100" y1="100" x2="135" y2="100" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />
        <rect x="124" y="93" width="14" height="14" rx="4" fill={accentColor} />
      </g>
    </svg>
  );
}

// ============================================================================
// 5. PANTURRILHA EM PÉ (calf)
// Degrau de apoio, ombros sob almofada, flexão plantar do tornozelo
// ============================================================================
export function CalfRaiseSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Degrau de apoio do antepé */}
      <rect x="50" y="135" width="60" height="15" fill="#30363D" rx="2" />
      <line x1="20" y1="150" x2="140" y2="150" stroke="#21262D" strokeWidth="3" />

      {/* Atleta em pé com ombros sob apoio acolchoado */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateY(-22px)' : 'translateY(0px)' }}
      >
        <rect x="62" y="25" width="36" height="12" rx="4" fill="#30363D" />
        <circle cx="80" cy="46" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="80" y1="55" x2="80" y2="92" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
        <line x1="80" y1="92" x2="80" y2="114" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />
        {/* Panturrilha em destaque */}
        <line x1="80" y1="114" x2="80" y2="135" stroke={accentColor} strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />
      </g>

      {/* Pé articulando no degrau */}
      <line x1="72" y1="135" x2="90" y2={isUp ? '124' : '135'} stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================================
// 6. PUXADA FRONTAL NA POLIA (pulldown)
// Torre de cabo alto, barra curva puxando ao peitoral superior
// ============================================================================
export function PulldownSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      <line x1="80" y1="10" x2="80" y2="35" stroke="#30363D" strokeWidth="3" />
      <circle cx="80" cy="22" r="8" fill="#161B22" stroke="#484F58" strokeWidth="2" />

      {/* Barra e cabo com amplitude completa */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateY(32px)' : 'translateY(0px)' }}
      >
        <line x1="80" y1="22" x2="80" y2="40" stroke="#8B949E" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M26 44 Q80 38 134 44" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="34" cy="43" r="4" fill={accentColor} />
        <circle cx="126" cy="43" r="4" fill={accentColor} />
      </g>

      {/* Banco e Apoio de Joelhos */}
      <rect x="65" y="112" width="30" height="8" rx="2" fill="#30363D" />
      <line x1="80" y1="120" x2="80" y2="148" stroke="#21262D" strokeWidth="4" />
      <rect x="70" y="96" width="20" height="6" rx="2" fill="#484F58" />

      {/* Cabeça e Dorsais em destaque */}
      <circle cx="80" cy="60" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="69" x2="80" y2="112" stroke={accentColor} strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Braços puxando com cotovelos em V para baixo */}
      <line x1="80" y1="74" x2={isUp ? '48' : '42'} y2={isUp ? '92' : '40'} stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="74" x2={isUp ? '112' : '118'} y2={isUp ? '92' : '40'} stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================================
// 7. REMADA BAIXA NO TRIÂNGULO (row)
// Polia baixa, apoio nos pés, triângulo puxando ao abdômen
// ============================================================================
export function CableRowSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Plataforma de apoio dos pés */}
      <line x1="120" y1="80" x2="120" y2="135" stroke="#30363D" strokeWidth="6" strokeLinecap="round" />
      <rect x="30" y="125" width="60" height="8" rx="2" fill="#30363D" />

      {/* Roldana frontal baixa */}
      <circle cx="120" cy="100" r="7" fill="#161B22" stroke="#484F58" strokeWidth="2" />

      {/* Atleta sentado com tronco estável */}
      <circle cx="50" cy="70" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="50" y1="79" x2="50" y2="125" stroke={accentColor} strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />
      <line x1="50" y1="125" x2="116" y2="115" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />

      {/* Cabo e Triângulo puxando */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateX(-26px)' : 'translateX(0px)' }}
      >
        <line x1="120" y1="100" x2="95" y2="100" stroke="#8B949E" strokeWidth="2" strokeDasharray="3 3" />
        <polygon points="90,94 98,100 90,106" fill="#FFFFFF" />
        <line x1="50" y1="88" x2="90" y2="100" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ============================================================================
// 8. REMADA UNILATERAL / SERROTE (singleRow)
// Joelho e mão apoiados no banco reto, puxando halter com cotovelo para trás
// ============================================================================
export function SingleArmRowSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Banco Reto */}
      <rect x="30" y="105" width="85" height="10" rx="2" fill="#21262D" stroke="#30363D" strokeWidth="2" />
      <line x1="45" y1="115" x2="45" y2="148" stroke="#21262D" strokeWidth="5" strokeLinecap="round" />
      <line x1="100" y1="115" x2="100" y2="148" stroke="#21262D" strokeWidth="5" strokeLinecap="round" />

      {/* Apoios no Banco: Joelho esquerdo e mão esquerda */}
      <circle cx="45" cy="105" r="4" fill="#8B949E" /> {/* Joelho esquerdo */}
      <line x1="45" y1="105" x2="30" y2="115" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" /> {/* Canela sobre banco */}
      <line x1="105" y1="82" x2="105" y2="105" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" /> {/* Braço de apoio */}

      {/* Pé direito firme no solo */}
      <line x1="45" y1="80" x2="25" y2="146" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />

      {/* Tronco paralelo ao banco */}
      <circle cx="112" cy="74" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="45" y1="80" x2="105" y2="80" stroke={accentColor} strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Braço direito remando com o halter */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateY(-24px)' : 'translateY(0px)' }}
      >
        {/* Cotovelo puxando alto */}
        <polyline
          points={isUp ? '80,80 74,62 80,82' : '80,80 80,105 80,126'}
          stroke="#FFFFFF"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Halter no Serrote */}
        <g transform={isUp ? 'translate(80, 82)' : 'translate(80, 126)'}>
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#E6EDF3" strokeWidth="3" />
          <rect x="-16" y="-6" width="6" height="12" rx="2" fill={accentColor} />
          <rect x="10" y="-6" width="6" height="12" rx="2" fill={accentColor} />
        </g>
      </g>
    </svg>
  );
}

// ============================================================================
// 9. ROSCA DIRETA COM BARRA W (biceps)
// Barra W olímpica, flexão pura de cotovelos, palmas supinadas
// ============================================================================
export function BicepsCurlSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Atleta em pé com postura firme */}
      <circle cx="75" cy="35" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="75" y1="44" x2="75" y2="100" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="75" y1="100" x2="75" y2="148" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />

      {/* Braço superior fixo colado ao tronco */}
      <line x1="75" y1="52" x2="75" y2="82" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />
      {/* Bíceps braquial iluminado */}
      <circle cx="78" cy="70" r="6" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Antebraço articulando pelo cotovelo (75, 82) */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '75px 82px',
          transform: isUp ? 'rotate(-120deg)' : 'rotate(0deg)'
        }}
      >
        <line x1="75" y1="82" x2="75" y2="114" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        {/* Barra W ondulada */}
        <path d="M63 115 Q69 110 75 115 Q81 120 87 115" stroke="#FFFFFF" strokeWidth="3" fill="none" />
        <rect x="58" y="110" width="5" height="10" rx="1" fill={accentColor} />
        <rect x="87" y="110" width="5" height="10" rx="1" fill={accentColor} />
      </g>
    </svg>
  );
}

// ============================================================================
// 10. ROSCA MARTELO (hammer)
// Halteres com pegada neutra (polegares para cima) no plano sagital
// ============================================================================
export function HammerCurlSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      <circle cx="75" cy="35" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="75" y1="44" x2="75" y2="100" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="75" y1="100" x2="75" y2="148" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />

      {/* Braço superior */}
      <line x1="75" y1="52" x2="75" y2="82" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />
      {/* Braquial / Braquiorradial iluminado */}
      <rect x="74" y="66" width="7" height="18" rx="2" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Antebraço flexionando com halter mantido verticalmente */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '75px 82px',
          transform: isUp ? 'rotate(-115deg)' : 'rotate(0deg)'
        }}
      >
        <line x1="75" y1="82" x2="75" y2="114" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        {/* Halter com Pegada Neutra (Vertical) */}
        <g transform="translate(75, 114)">
          <line x1="0" y1="-8" x2="0" y2="8" stroke="#E6EDF3" strokeWidth="3" />
          <rect x="-5" y="-12" width="10" height="5" rx="1" fill={accentColor} />
          <rect x="-5" y="7" width="10" height="5" rx="1" fill={accentColor} />
        </g>
      </g>
    </svg>
  );
}

// ============================================================================
// 11. DESENVOLVIMENTO COM HALTERES (shoulderPress)
// Pressão vertical acima da cabeça a partir dos ombros
// ============================================================================
export function ShoulderPressSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Banco Inclinado 75° */}
      <line x1="68" y1="60" x2="76" y2="115" stroke="#30363D" strokeWidth="7" strokeLinecap="round" />
      <line x1="70" y1="115" x2="95" y2="115" stroke="#21262D" strokeWidth="6" strokeLinecap="round" />

      {/* Cabeça e Tronco */}
      <circle cx="80" cy="52" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="61" x2="80" y2="115" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
      {/* Deltoides anteriores/laterais iluminados */}
      <circle cx="62" cy="68" r="7" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />
      <circle cx="98" cy="68" r="7" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Braços empurrando halteres para cima */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateY(-28px)' : 'translateY(0px)' }}
      >
        <line x1="62" y1="68" x2="52" y2="48" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <line x1="98" y1="68" x2="108" y2="48" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        {/* Halteres */}
        <line x1="42" y1="46" x2="62" y2="46" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
        <line x1="98" y1="46" x2="118" y2="46" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
        <circle cx="42" cy="46" r="5" fill={accentColor} />
        <circle cx="62" cy="46" r="5" fill={accentColor} />
        <circle cx="98" cy="46" r="5" fill={accentColor} />
        <circle cx="118" cy="46" r="5" fill={accentColor} />
      </g>
      <line x1="80" y1="115" x2="80" y2="148" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================================
// 12. ELEVAÇÃO LATERAL NO CABO OU HALTERES (lateralRaise)
// Abdução pura dos ombros: braços sobem LATERALMENTE até 90° em T
// NÃO é desenvolvimento!
// ============================================================================
export function LateralRaiseSvg({ phase, accentColor, isTechnicalMode }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Braços abertos lateralmente na altura dos ombros
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Polias baixas laterais / solo */}
      <circle cx="20" cy="144" r="6" fill="#161B22" stroke="#484F58" strokeWidth="2" />
      <circle cx="140" cy="144" r="6" fill="#161B22" stroke="#484F58" strokeWidth="2" />
      <line x1="15" y1="150" x2="145" y2="150" stroke="#21262D" strokeWidth="3" />

      {/* Atleta em pé com postura firme */}
      <circle cx="80" cy="40" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="49" x2="80" y2="104" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
      <line x1="80" y1="104" x2="72" y2="148" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />
      <line x1="80" y1="104" x2="88" y2="148" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />

      {/* DELTOIDES LATERAIS em destaque supremo neon */}
      <circle cx="64" cy="56" r="7" fill={accentColor} className="drop-shadow-[0_0_10px_currentColor]" />
      <circle cx="96" cy="56" r="7" fill={accentColor} className="drop-shadow-[0_0_10px_currentColor]" />

      {/* Braço Esquerdo articulando em abdução lateral pura */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '64px 56px',
          transform: isUp ? 'rotate(78deg)' : 'rotate(0deg)'
        }}
      >
        <line x1="64" y1="56" x2="60" y2="98" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        {/* Halter / Puxador de cabo */}
        <circle cx="60" cy="100" r="5" fill={accentColor} />
        {/* Cabo subindo da polia baixa */}
        <line x1="20" y1="144" x2="60" y2="100" stroke="#8B949E" strokeWidth="1.5" strokeDasharray="3 2" />
      </g>

      {/* Braço Direito articulando em abdução lateral pura */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '96px 56px',
          transform: isUp ? 'rotate(-78deg)' : 'rotate(0deg)'
        }}
      >
        <line x1="96" y1="56" x2="100" y2="98" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        {/* Halter / Puxador de cabo */}
        <circle cx="100" cy="100" r="5" fill={accentColor} />
        {/* Cabo subindo da polia baixa */}
        <line x1="140" y1="144" x2="100" y2="100" stroke="#8B949E" strokeWidth="1.5" strokeDasharray="3 2" />
      </g>

      {/* Arco de Abdução e Guia de 90° no modo técnico */}
      {isTechnicalMode && (
        <g className="animate-in fade-in">
          <line x1="18" y1="56" x2="142" y2="56" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M60 98 A 42 42 0 0 1 24 58" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
          <path d="M100 98 A 42 42 0 0 0 136 58" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
          <text x="73" y="24" fill="#F59E0B" fontSize="9" fontWeight="bold">90° ABDUÇÃO</text>
        </g>
      )}
    </svg>
  );
}

// ============================================================================
// 13. CRUCIFIXO INVERSO / PECK DECK INVERTIDO / FACEPULL (facepull)
// Alavancas empurradas horizontalmente para trás, deltoide posterior iluminado
// ============================================================================
export function RearDeltFlySvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Braços abertos para trás
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Estrutura Central da Máquina Peck Deck Invertida */}
      <rect x="74" y="20" width="12" height="120" rx="3" fill="#21262D" />
      {/* Almofada do Peito (Apoio Esternal) */}
      <rect x="70" y="55" width="20" height="35" rx="4" fill="#30363D" stroke="#484F58" strokeWidth="1" />

      {/* Atleta Sentado de Frente para o Apoio */}
      <circle cx="80" cy="42" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="51" x2="80" y2="115" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

      {/* DELTOIDES POSTERIORES destacados */}
      <circle cx="64" cy="58" r="6" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />
      <circle cx="96" cy="58" r="6" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Braços e Alavancas abrindo para trás */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '64px 58px',
          transform: isUp ? 'rotate(-65deg)' : 'rotate(10deg)'
        }}
      >
        <line x1="64" y1="58" x2="42" y2="78" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <rect x="36" y="74" width="6" height="14" rx="2" fill={accentColor} />
      </g>

      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '96px 58px',
          transform: isUp ? 'rotate(65deg)' : 'rotate(-10deg)'
        }}
      >
        <line x1="96" y1="58" x2="118" y2="78" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <rect x="118" y="74" width="6" height="14" rx="2" fill={accentColor} />
      </g>
    </svg>
  );
}

// ============================================================================
// 14. TRÍCEPS CORDA NA POLIA ALTA (tricepsRope)
// Polia alta, cotovelos estáveis ao lado do tronco, corda abrindo embaixo
// ============================================================================
export function TricepsRopePushdownSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Extensão completa para baixo abrindo as pontas
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Polia Alta e Cabo */}
      <circle cx="80" cy="20" r="7" fill="#161B22" stroke="#484F58" strokeWidth="2" />
      <line x1="80" y1="10" x2="80" y2="20" stroke="#30363D" strokeWidth="3" />
      <line x1="80" y1="20" x2="80" y2="60" stroke="#8B949E" strokeWidth="2" strokeDasharray="3 3" />

      {/* Atleta em pé com ligeira inclinação do tronco */}
      <circle cx="62" cy="45" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="62" y1="54" x2="68" y2="105" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="68" y1="105" x2="65" y2="148" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />

      {/* Braço superior colado ao corpo */}
      <line x1="62" y1="62" x2="72" y2="86" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />
      {/* TRÍCEPS em destaque supremo */}
      <line x1="60" y1="66" x2="68" y2="84" stroke={accentColor} strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Antebraço estendendo e corda abrindo no final */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '72px 86px',
          transform: isUp ? 'rotate(50deg)' : 'rotate(-35deg)'
        }}
      >
        <line x1="72" y1="86" x2="84" y2="114" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        {/* Corda e nós nas pontas */}
        <line x1="80" y1="110" x2="76" y2="124" stroke="#D1D5DB" strokeWidth="3" />
        <line x1="84" y1="110" x2="94" y2="124" stroke="#D1D5DB" strokeWidth="3" />
        <circle cx="76" cy="125" r="4" fill={accentColor} />
        <circle cx="94" cy="125" r="4" fill={accentColor} />
      </g>
    </svg>
  );
}

// ============================================================================
// 15. ELEVAÇÃO PÉLVICA / HIP THRUST (hipthrust)
// Banco acolchoado sob escápulas, quadril estendendo até formar linha horizontal
// ============================================================================
export function HipThrustSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Banco estofado de apoio escapular */}
      <rect x="22" y="85" width="26" height="35" rx="3" fill="#21262D" stroke="#30363D" strokeWidth="2" />
      <line x1="110" y1="140" x2="135" y2="140" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Quadril e glúteo subindo em extensão máxima */}
      <g className="transition-all duration-1000 ease-in-out">
        <line
          x1="46"
          y1="90"
          x2={isUp ? '85' : '75'}
          y2={isUp ? '90' : '116'}
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Glúteo Máximo com pico de contração */}
        <circle
          cx={isUp ? '85' : '75'}
          cy={isUp ? '90' : '116'}
          r="10"
          fill={accentColor}
          className="drop-shadow-[0_0_10px_currentColor]"
        />
        <line
          x1={isUp ? '85' : '75'}
          y1={isUp ? '90' : '116'}
          x2="115"
          y2={isUp ? '90' : '105'}
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1="115"
          y1={isUp ? '90' : '105'}
          x2="118"
          y2="140"
          stroke="#8B949E"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Barra sobre o quadril */}
        <circle cx={isUp ? 85 : 75} cy={isUp ? 84 : 110} r="7" fill={accentColor} stroke="#E6EDF3" strokeWidth="2" />
      </g>
    </svg>
  );
}

// ============================================================================
// 16. AGACHAMENTO BÚLGARO (bulgarian)
// Pé de trás elevado no banco, perna da frente agachando com halteres
// ============================================================================
export function BulgarianSplitSquatSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Banco Atrás */}
      <rect x="20" y="105" width="28" height="30" rx="3" fill="#21262D" stroke="#30363D" strokeWidth="2" />
      <line x1="15" y1="145" x2="145" y2="145" stroke="#21262D" strokeWidth="3" />

      {/* Perna Traseira Apoiada no Banco */}
      <line x1="34" y1="105" x2="55" y2={isUp ? '92' : '114'} stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />

      {/* Tronco descendo verticalmente */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateY(0px)' : 'translateY(24px)' }}
      >
        <circle cx="75" cy="40" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="75" y1="48" x2="75" y2="88" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
        {/* Halteres nas mãos */}
        <line x1="75" y1="60" x2="75" y2="85" stroke="#8B949E" strokeWidth="3" />
        <rect x="71" y="82" width="8" height="12" rx="2" fill="#E6EDF3" />
        <circle cx="75" cy="88" r="4" fill={accentColor} />

        {/* Glúteo em contração */}
        <circle cx="70" cy="88" r="7" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />
      </g>

      {/* Perna Dianteira (Quadríceps e Glúteo em ação) */}
      <g className="transition-all duration-1000 ease-in-out">
        {/* Coxa dianteira */}
        <line
          x1="75"
          y1={isUp ? '88' : '112'}
          x2={isUp ? '95' : '105'}
          y2={isUp ? '115' : '115'}
          stroke={accentColor}
          strokeWidth="6"
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_currentColor]"
        />
        {/* Canela dianteira vertical */}
        <line
          x1={isUp ? '95' : '105'}
          y1={isUp ? '115' : '115'}
          x2={isUp ? '95' : '105'}
          y2="145"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line x1={isUp ? '90' : '100'} y1="145" x2={isUp ? '106' : '116'} y2="145" stroke="#8B949E" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ============================================================================
// 17. CADEIRA ABDUTORA (abductor)
// Pelve sentada, almofadas externas empurradas lateralmente para fora
// NÃO é hip thrust!
// ============================================================================
export function SeatedAbductorSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Pernas abertas lateralmente contra as placas
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Assento da Cadeira Abdutora */}
      <rect x="55" y="80" width="50" height="40" rx="4" fill="#21262D" stroke="#30363D" strokeWidth="2" />
      <line x1="80" y1="120" x2="80" y2="148" stroke="#21262D" strokeWidth="6" />

      {/* Cabeça e Tronco levemente inclinado à frente */}
      <circle cx="80" cy="45" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="54" x2="80" y2="92" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

      {/* GLÚTEO MÉDIO / MÍNIMO iluminados nas laterais */}
      <circle cx="62" cy="88" r="8" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />
      <circle cx="98" cy="88" r="8" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Coxas e Almofadas abrindo lateralmente */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '70px 92px',
          transform: isUp ? 'rotate(-28deg)' : 'rotate(0deg)'
        }}
      >
        <line x1="70" y1="92" x2="52" y2="124" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
        <rect x="42" y="112" width="10" height="16" rx="3" fill="#30363D" stroke="#E6EDF3" strokeWidth="1.5" />
      </g>

      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '90px 92px',
          transform: isUp ? 'rotate(28deg)' : 'rotate(0deg)'
        }}
      >
        <line x1="90" y1="92" x2="108" y2="124" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
        <rect x="108" y="112" width="10" height="16" rx="3" fill="#30363D" stroke="#E6EDF3" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// ============================================================================
// 18. SUPINO RETO COM BARRA OLÍMPICA (benchpress)
// Banco horizontal, barra descendo no esterno e subindo na vertical
// ============================================================================
export function BenchPressSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Banco Reto */}
      <line x1="25" y1="110" x2="135" y2="110" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="45" y1="113" x2="45" y2="148" stroke="#21262D" strokeWidth="5" />
      <line x1="115" y1="113" x2="115" y2="148" stroke="#21262D" strokeWidth="5" />

      {/* Atleta deitado */}
      <circle cx="45" cy="100" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="53" y1="104" x2="105" y2="104" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
      {/* Peitoral Maior iluminado */}
      <rect x="62" y="98" width="22" height="10" rx="3" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Barra Olímpica com anilhas em movimento vertical */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateY(-28px)' : 'translateY(0px)' }}
      >
        <line x1="35" y1="88" x2="115" y2="88" stroke="#E6EDF3" strokeWidth="5" strokeLinecap="round" />
        <circle cx="36" cy="88" r="8" fill={accentColor} />
        <circle cx="114" cy="88" r="8" fill={accentColor} />
        {/* Braços empurrando */}
        <line x1="72" y1="104" x2="72" y2="88" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ============================================================================
// 19. SUPINO INCLINADO COM HALTERES (inclineBench)
// Banco inclinado a 35°-45°, empurrar convergente com halteres
// ============================================================================
export function InclineBenchPressSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Banco Inclinado 35° */}
      <line x1="30" y1="125" x2="95" y2="75" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="95" y1="75" x2="105" y2="145" stroke="#21262D" strokeWidth="5" />
      <line x1="35" y1="125" x2="35" y2="148" stroke="#21262D" strokeWidth="5" />

      {/* Atleta no banco inclinado */}
      <circle cx="86" cy="65" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="42" y1="118" x2="84" y2="72" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

      {/* Peitoral Superior (Porção Clavicular) iluminado */}
      <circle cx="72" cy="78" r="7" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Halteres empurrando ao longo do plano inclinado */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transform: isUp ? 'translate(14px, -24px)' : 'translate(0px, 0px)'
        }}
      >
        <line x1="72" y1="78" x2="80" y2="52" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        {/* Halter inclinado */}
        <line x1="68" y1="56" x2="92" y2="48" stroke="#E6EDF3" strokeWidth="3" strokeLinecap="round" />
        <circle cx="68" cy="56" r="5" fill={accentColor} />
        <circle cx="92" cy="48" r="5" fill={accentColor} />
      </g>
    </svg>
  );
}

// ============================================================================
// 20. CRUCIFIXO / VOADOR / PECK DECK (fly)
// Braços abertos em arco fechando à frente do tórax (adução horizontal)
// ============================================================================
export function PeckDeckFlySvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Braços fechados no centro
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Máquina Peck Deck: Assento e encosto vertical */}
      <rect x="74" y="35" width="12" height="100" rx="3" fill="#21262D" />
      <rect x="68" y="55" width="24" height="40" rx="4" fill="#30363D" />

      {/* Atleta sentado de costas para o encosto */}
      <circle cx="80" cy="45" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="54" x2="80" y2="105" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

      {/* Peitoral Maior iluminado no centro */}
      <circle cx="80" cy="72" r="8" fill={accentColor} className="drop-shadow-[0_0_10px_currentColor]" />

      {/* Alavanca Esquerda em Arco Fechando ao centro */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '65px 70px',
          transform: isUp ? 'rotate(45deg)' : 'rotate(-25deg)'
        }}
      >
        <path d="M65 70 Q45 70 35 90" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />
        <rect x="30" y="85" width="10" height="12" rx="3" fill={accentColor} />
      </g>

      {/* Alavanca Direita em Arco Fechando ao centro */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: '95px 70px',
          transform: isUp ? 'rotate(-45deg)' : 'rotate(25deg)'
        }}
      >
        <path d="M95 70 Q115 70 125 90" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />
        <rect x="120" y="85" width="10" height="12" rx="3" fill={accentColor} />
      </g>
    </svg>
  );
}

// ============================================================================
// 21. PRANCHA ISOMÉTRICA (plank)
// Postura reta isométrica nos antebraços e pontas dos pés
// ============================================================================
export function PlankCoreSvg({ accentColor }: { accentColor: string }) {
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      <line x1="15" y1="135" x2="145" y2="135" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />

      {/* Postura em Linha Reta: Cabeça -> Ombros -> Quadril -> Calcanhares */}
      <circle cx="35" cy="95" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="38" y1="103" x2="48" y2="128" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
      <line x1="48" y1="128" x2="32" y2="132" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />

      {/* Tronco & Core sob tensão isométrica máxima pulsante */}
      <line x1="44" y1="102" x2="88" y2="106" stroke={accentColor} strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_10px_currentColor] animate-pulse" />
      <line x1="88" y1="106" x2="128" y2="125" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <circle cx="128" cy="125" r="4" fill="#8B949E" />
      <line x1="128" y1="125" x2="132" y2="132" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================================
// 22. ANIMAÇÃO TÉCNICA EM PREPARAÇÃO (fallback seguro para variantes raras)
// Jamais exibe um exercício incorreto no lugar de outro
// ============================================================================
export function AnimationInPreparationSvg({ accentColor, exerciseName }: { accentColor: string; exerciseName?: string }) {
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Moldura técnica / Blueprint */}
      <rect x="15" y="15" width="130" height="130" rx="8" fill="#0D1117" stroke="#30363D" strokeWidth="2" strokeDasharray="4 3" />
      {/* Silhueta atlética esquemática */}
      <circle cx="80" cy="50" r="12" fill="#161B22" stroke={accentColor} strokeWidth="2" />
      <line x1="80" y1="62" x2="80" y2="105" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="75" x2="55" y2="90" stroke="#8B949E" strokeWidth="3" strokeLinecap="round" />
      <line x1="80" y1="75" x2="105" y2="90" stroke="#8B949E" strokeWidth="3" strokeLinecap="round" />
      <line x1="80" y1="105" x2="68" y2="132" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="105" x2="92" y2="132" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />

      <rect x="25" y="98" width="110" height="26" rx="4" fill="#161B22" stroke={accentColor} strokeWidth="1" />
      <text x="80" y="110" fill={accentColor} fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">
        ANIMAÇÃO EM PREPARAÇÃO
      </text>
      {exerciseName && (
        <text x="80" y="120" fill="#8B949E" fontSize="6" textAnchor="middle">
          {exerciseName.length > 22 ? exerciseName.slice(0, 20) + '...' : exerciseName}
        </text>
      )}
    </svg>
  );
}

// ============================================================================
// Aliases retrocompatíveis
// ============================================================================
export const SquatLegPressSvg = SquatSmithSvg;
export const ChestPressFlySvg = BenchPressSvg;
