import React from 'react';

interface SvgModelProps {
  phase: 'concentric' | 'eccentric';
  accentColor: string;
  isTechnicalMode?: boolean;
}

// 1. AGACHAMENTO / LEG PRESS / BÚLGARO
export function SquatLegPressSvg({ phase, accentColor, isTechnicalMode }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Guias do Aparelho */}
      <line x1="25" y1="15" x2="25" y2="150" stroke="#21262D" strokeWidth="4" />
      <line x1="135" y1="15" x2="135" y2="150" stroke="#21262D" strokeWidth="4" />
      <line x1="20" y1="148" x2="140" y2="148" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />

      {/* Barra / Plataforma móvel */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateY(0px)' : 'translateY(36px)' }}
      >
        <line x1="20" y1="45" x2="140" y2="45" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />
        <rect x="18" y="37" width="8" height="16" rx="2" fill={accentColor} />
        <rect x="134" y="37" width="8" height="16" rx="2" fill={accentColor} />
        <circle cx="80" cy="40" r="10" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      </g>

      {/* Atleta com alinhamento biomecânico */}
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
        <line x1="68" y1="146" x2="82" y2="146" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
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

// 2. CADEIRA EXTENSORA
export function LegExtensionSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Extensão para cima
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Estrutura do Banco da Extensora */}
      <line x1="30" y1="65" x2="50" y2="105" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="48" y1="105" x2="90" y2="105" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="50" y1="105" x2="50" y2="145" stroke="#21262D" strokeWidth="6" />
      <circle cx="90" cy="105" r="7" fill="#161B22" stroke="#8B949E" strokeWidth="2" /> {/* Eixo articular do joelho */}

      {/* Tronco sentado */}
      <circle cx="40" cy="50" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="42" y1="59" x2="55" y2="105" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

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
        <rect x="83" y="130" width="14" height="12" rx="4" fill={accentColor} /> {/* Rolete cilíndrico */}
      </g>
    </svg>
  );
}

// 3. MESA FLEXORA
export function LegCurlSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Calcanhar subindo aos glúteos
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Mesa Inclinada / Decúbito ventral */}
      <line x1="25" y1="105" x2="135" y2="105" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <line x1="45" y1="105" x2="45" y2="145" stroke="#21262D" strokeWidth="5" />
      <line x1="115" y1="105" x2="115" y2="145" stroke="#21262D" strokeWidth="5" />
      <circle cx="100" cy="103" r="6" fill="#161B22" stroke="#8B949E" strokeWidth="2" /> {/* Eixo joelho */}

      {/* Atleta Deitado */}
      <circle cx="35" cy="95" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="43" y1="99" x2="75" y2="100" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
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

// 4. PANTURRILHA NA MÁQUINA
export function CalfRaiseSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Flexão plantar subindo
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

// 5. PUXADA ALTA FRONTAL / PULLEY
export function PulldownSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Puxando a barra para o peito
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
        <line x1="28" y1="40" x2="132" y2="40" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <circle cx="42" cy="40" r="4" fill={accentColor} />
        <circle cx="118" cy="40" r="4" fill={accentColor} />
      </g>

      {/* Banco */}
      <rect x="65" y="112" width="30" height="8" rx="2" fill="#30363D" />
      <line x1="80" y1="120" x2="80" y2="148" stroke="#21262D" strokeWidth="4" />

      {/* Cabeça e Dorsais em destaque */}
      <circle cx="80" cy="60" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="69" x2="80" y2="112" stroke={accentColor} strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Braços puxando */}
      <line x1="80" y1="74" x2={isUp ? '48' : '42'} y2={isUp ? '92' : '40'} stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="74" x2={isUp ? '112' : '118'} y2={isUp ? '92' : '40'} stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// 6. REMADA BAIXA / UNILATERAL
export function CableRowSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Puxando triângulo ao abdômen
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Plataforma de apoio dos pés */}
      <line x1="120" y1="80" x2="120" y2="135" stroke="#30363D" strokeWidth="6" strokeLinecap="round" />
      <rect x="30" y="125" width="60" height="8" rx="2" fill="#30363D" />

      {/* Roldana frontal */}
      <circle cx="120" cy="100" r="7" fill="#161B22" stroke="#484F58" strokeWidth="2" />

      {/* Atleta sentado */}
      <circle cx="50" cy="70" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="50" y1="79" x2="50" y2="125" stroke={accentColor} strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />
      <line x1="50" y1="125" x2="116" y2="115" stroke="#8B949E" strokeWidth="5" strokeLinecap="round" />

      {/* Cabo e Triângulo puxando */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateX(-26px)' : 'translateX(0px)' }}
      >
        <line x1="120" y1="100" x2="95" y2="100" stroke="#8B949E" strokeWidth="2" strokeDasharray="3 3" />
        <rect x="90" y="94" width="8" height="12" rx="2" fill="#FFFFFF" />
        <line x1="50" y1="88" x2="90" y2="100" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// 7. ROSCA DIRETA / MARTELO (BÍCEPS)
export function BicepsCurlSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Antebraço subindo
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
        <circle cx="75" cy="116" r="7" fill={accentColor} /> {/* Halter */}
      </g>
    </svg>
  );
}

// 8. DESENVOLVIMENTO DE OMBROS / ELEVAÇÃO LATERAL
export function ShoulderPressSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Halteres empurrando para cima
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      <circle cx="80" cy="55" r="9" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="64" x2="80" y2="115" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
      {/* Ombros / Deltoides iluminados */}
      <circle cx="62" cy="70" r="7" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />
      <circle cx="98" cy="70" r="7" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Braços empurrando halteres */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateY(-28px)' : 'translateY(0px)' }}
      >
        <line x1="62" y1="70" x2="52" y2="48" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <line x1="98" y1="70" x2="108" y2="48" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
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

// 9. ELEVAÇÃO PÉLVICA (HIP THRUST)
export function HipThrustSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Quadril estendido paralelo ao banco
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Banco estofado de apoio */}
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
      </g>
    </svg>
  );
}

// 10. SUPINO / CRUCIFIXO / VOADOR
export function ChestPressFlySvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric'; // Empurrando / fechando
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      {/* Banco */}
      <line x1="30" y1="110" x2="130" y2="110" stroke="#30363D" strokeWidth="6" strokeLinecap="round" />
      <line x1="45" y1="113" x2="45" y2="146" stroke="#21262D" strokeWidth="4" />
      <line x1="115" y1="113" x2="115" y2="146" stroke="#21262D" strokeWidth="4" />

      {/* Atleta e Peitoral iluminado */}
      <circle cx="45" cy="100" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="53" y1="104" x2="105" y2="104" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
      <rect x="62" y="98" width="22" height="10" rx="3" fill={accentColor} className="drop-shadow-[0_0_8px_currentColor]" />

      {/* Barra / Halteres em movimento vertical controlado */}
      <g
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: isUp ? 'translateY(-28px)' : 'translateY(0px)' }}
      >
        <line x1="40" y1="88" x2="104" y2="88" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
        <circle cx="38" cy="88" r="7" fill={accentColor} />
        <circle cx="106" cy="88" r="7" fill={accentColor} />
        <line x1="72" y1="102" x2="72" y2="88" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// 11. PRANCHA ISOMÉTRICA (CORE / ABDÔMEN)
export function PlankCoreSvg({ accentColor }: { accentColor: string }) {
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-hidden="true">
      <line x1="15" y1="135" x2="145" y2="135" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />

      {/* Postura em Linha Reta: Cabeça -> Ombros -> Quadril -> Calcanhares */}
      <circle cx="35" cy="95" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="38" y1="103" x2="48" y2="128" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" /> {/* Braço */}
      <line x1="48" y1="128" x2="32" y2="132" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" /> {/* Antebraço no solo */}

      {/* Tronco & Core sob tensão isométrica máxima */}
      <line x1="44" y1="102" x2="88" y2="106" stroke={accentColor} strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_10px_currentColor] animate-pulse" />
      <line x1="88" y1="106" x2="128" y2="125" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <circle cx="128" cy="125" r="4" fill="#8B949E" />
      <line x1="128" y1="125" x2="132" y2="132" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
