import React from 'react';
import { SvgModelProps } from './types';

// 1. ELEVAÇÃO PÉLVICA NA MÁQUINA (glute-1-machine / hipThrustMachine)
export function HipThrustMachineSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Elevação Pélvica na Máquina Dedicada">
      <line x1="25" y1="135" x2="135" y2="135" stroke="#30363D" strokeWidth="6" strokeLinecap="round" />
      <line x1="40" y1="105" x2="40" y2="135" stroke="#21262D" strokeWidth="8" strokeLinecap="round" />

      {/* Escápulas apoiadas */}
      <circle cx="45" cy={isUp ? '85' : '95'} r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" className="transition-all duration-1000" />
      {/* Pés firmes na plataforma */}
      <rect x="110" y="130" width="16" height="5" rx="1" fill="#8B949E" />

      {/* Quadril estendendo até o plano horizontal alinhado */}
      <line
        x1="45"
        y1={isUp ? '85' : '95'}
        x2={isUp ? '92' : '82'}
        y2={isUp ? '85' : '115'}
        stroke={accentColor}
        strokeWidth="6"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
      <line
        x1={isUp ? '92' : '82'}
        y1={isUp ? '85' : '115'}
        x2="115"
        y2="132"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        className="transition-all duration-1000"
      />

      {/* Cinto e Carga na Pelve */}
      <circle cx={isUp ? '92' : '82'} cy={isUp ? '85' : '115'} r="7" fill={accentColor} className="transition-all duration-1000" />
    </svg>
  );
}

// 2. ELEVAÇÃO PÉLVICA COM BARRA LIVRE NO BANCO (glute-1-barbell / hipThrustBarbell)
export function HipThrustBarbellSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Elevação Pélvica com Barra Livre">
      <line x1="20" y1="140" x2="140" y2="140" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />
      {/* Banco Reto estofado */}
      <rect x="25" y="95" width="25" height="45" rx="3" fill="#161B22" stroke="#30363D" strokeWidth="2" />

      {/* Atleta e Barra com protetor de espuma */}
      <circle cx="48" cy={isUp ? '84' : '96'} r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" className="transition-all duration-1000" />
      <line
        x1="48"
        y1={isUp ? '84' : '96'}
        x2={isUp ? '95' : '85'}
        y2={isUp ? '84' : '118'}
        stroke={accentColor}
        strokeWidth="6"
        strokeLinecap="round"
        className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
      />
      <line
        x1={isUp ? '95' : '85'}
        y1={isUp ? '84' : '118'}
        x2="118"
        y2="138"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        className="transition-all duration-1000"
      />

      {/* Barra Olímpica transversal com anilhas */}
      <line x1={isUp ? '85' : '75'} y1={isUp ? '84' : '118'} x2={isUp ? '105' : '95'} y2={isUp ? '84' : '118'} stroke="#E6EDF3" strokeWidth="5" strokeLinecap="round" className="transition-all duration-1000" />
      <circle cx={isUp ? '95' : '85'} cy={isUp ? '84' : '118'} r="9" fill="#161B22" stroke={accentColor} strokeWidth="2" className="transition-all duration-1000" />
    </svg>
  );
}

// 3. AGACHAMENTO BÚLGARO NO BANCO (glute-2-bulgarian / bulgarianSplitSquat)
export function BulgarianSplitSquatSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Agachamento Búlgaro no Banco">
      <line x1="20" y1="145" x2="140" y2="145" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />
      {/* Banco atrás */}
      <rect x="22" y="105" width="24" height="40" rx="2" fill="#161B22" stroke="#30363D" strokeWidth="2" />

      {/* Atleta afundando o joelho */}
      <g className="transition-all duration-1000 ease-in-out">
        <circle cx="85" cy={isUp ? '42' : '72'} r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="85" y1={isUp ? '50' : '80'} x2="85" y2={isUp ? '92' : '122'} stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

        {/* Perna dianteira */}
        <line x1="85" y1={isUp ? '92' : '122'} x2="108" y2={isUp ? '118' : '128'} stroke={accentColor} strokeWidth="5" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />
        <line x1="108" y1={isUp ? '118' : '128'} x2="108" y2="145" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

        {/* Perna traseira apoiada no banco */}
        <line x1="85" y1={isUp ? '92' : '122'} x2="52" y2={isUp ? '110' : '135'} stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
        <line x1="52" y1={isUp ? '110' : '135'} x2="35" y2="105" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />

        {/* Halteres nas mãos */}
        <line x1="82" y1={isUp ? '75' : '105'} x2="82" y2={isUp ? '92' : '122'} stroke="#8B949E" strokeWidth="3" />
        <circle cx="82" cy={isUp ? '92' : '122'} r="4" fill="#8B949E" />
      </g>
    </svg>
  );
}

// 4. AGACHAMENTO SUMÔ NO STEP COM HALTER (glute-2-sumo / sumoSquatStep)
export function SumoSquatStepSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Agachamento Sumô no Step">
      {/* Dois Steps no solo */}
      <rect x="35" y="135" width="25" height="10" rx="2" fill="#30363D" />
      <rect x="100" y="135" width="25" height="10" rx="2" fill="#30363D" />

      {/* Atleta com pernas bem afastadas descendo halter ao meio */}
      <g className="transition-all duration-1000 ease-in-out">
        <circle cx="80" cy={isUp ? '42' : '70'} r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="80" y1={isUp ? '50' : '78'} x2="80" y2={isUp ? '90' : '118'} stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

        <line x1="80" y1={isUp ? '90' : '118'} x2="48" y2="135" stroke={accentColor} strokeWidth="5" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />
        <line x1="80" y1={isUp ? '90' : '118'} x2="112" y2="135" stroke={accentColor} strokeWidth="5" strokeLinecap="round" className="drop-shadow-[0_0_8px_currentColor]" />

        {/* Halter pesado central descendo abaixo dos steps */}
        <line x1="80" y1={isUp ? '72' : '100'} x2="80" y2={isUp ? '108' : '138'} stroke="#E6EDF3" strokeWidth="4" />
        <rect x="73" y={isUp ? '104' : '134'} width="14" height="8" rx="2" fill={accentColor} />
      </g>
    </svg>
  );
}

// 5. CADEIRA ABDUTORA DE PLACAS (glute-3-machine / seatedAbductorMachine)
export function SeatedAbductorSvg({ phase, accentColor }: SvgModelProps) {
  const isOpen = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Cadeira Abdutora de Placas">
      <line x1="80" y1="55" x2="80" y2="120" stroke="#30363D" strokeWidth="8" strokeLinecap="round" />
      <circle cx="80" cy="50" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="80" y1="58" x2="80" y2="115" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Joelhos abrindo contra almofadas externas */}
      <line
        x1="80"
        y1="115"
        x2={isOpen ? '36' : '65'}
        y2="135"
        stroke={accentColor}
        strokeWidth="6"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />
      <line
        x1="80"
        y1="115"
        x2={isOpen ? '124' : '95'}
        y2="135"
        stroke={accentColor}
        strokeWidth="6"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />

      <circle cx={isOpen ? '36' : '65'} cy="135" r="7" fill="#161B22" stroke="#8B949E" strokeWidth="2" className="transition-all duration-1000" />
      <circle cx={isOpen ? '124' : '95'} cy="135" r="7" fill="#161B22" stroke="#8B949E" strokeWidth="2" className="transition-all duration-1000" />
    </svg>
  );
}

// 6. ABDUÇÃO NA POLIA BAIXA EM PÉ (glute-3-cable / cableStandingAbduction)
export function CableStandingAbductionSvg({ phase, accentColor }: SvgModelProps) {
  const isOpen = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Abdução de Quadril na Polia Baixa">
      <rect x="20" y="60" width="8" height="85" rx="2" fill="#161B22" stroke="#21262D" strokeWidth="2" />
      <circle cx="24" cy="138" r="5" fill="#30363D" stroke="#8B949E" strokeWidth="1.5" />
      <line x1="15" y1="145" x2="140" y2="145" stroke="#30363D" strokeWidth="3" />

      {/* Atleta em pé segurando a barra da torre */}
      <circle cx="70" cy="45" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="70" y1="53" x2="70" y2="105" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <line x1="70" y1="105" x2="70" y2="145" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Perna abduzindo para fora com tornozeleira */}
      <line x1="70" y1="105" x2={isOpen ? '118' : '76'} y2={isOpen ? '130' : '145'} stroke={accentColor} strokeWidth="5" strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]" />
      {/* Cabo da polia até a tornozeleira */}
      <line x1="24" y1="138" x2={isOpen ? '118' : '76'} y2={isOpen ? '130' : '145'} stroke="#8B949E" strokeWidth="1.5" strokeDasharray="3 2" className="transition-all duration-1000" />
    </svg>
  );
}

// 7. PRANCHA ISOMÉTRICA (back-6-floor / plankFloor)
export function PlankCoreSvg({ accentColor }: { accentColor: string }) {
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Prancha Isométrica no Solo">
      <line x1="15" y1="135" x2="145" y2="135" stroke="#30363D" strokeWidth="4" strokeLinecap="round" />
      <circle cx="35" cy="95" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="38" y1="103" x2="48" y2="128" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
      <line x1="48" y1="128" x2="32" y2="132" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />

      <line x1="44" y1="102" x2="88" y2="106" stroke={accentColor} strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_10px_currentColor] animate-pulse" />
      <line x1="88" y1="106" x2="128" y2="125" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <circle cx="128" cy="125" r="4" fill="#8B949E" />
      <line x1="128" y1="125" x2="132" y2="132" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// 8. ABDOMINAL NA BOLA SUÍÇA (back-6-ball / swissBallCrunch)
export function SwissBallCrunchSvg({ phase, accentColor }: SvgModelProps) {
  const isCrunched = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Abdominal na Bola Suíça (Fitball)">
      <line x1="15" y1="145" x2="145" y2="145" stroke="#30363D" strokeWidth="4" />

      {/* Bola Suíça apoiando a região lombar */}
      <circle cx="62" cy="115" r="24" fill="#161B22" stroke="#8B949E" strokeWidth="2.5" />
      <path d="M48 105 Q62 96 76 105" stroke="#30363D" strokeWidth="2" fill="none" />
      <path d="M50 125 Q62 134 74 125" stroke="#30363D" strokeWidth="2" fill="none" />

      {/* Pés firmes e joelhos a 90° */}
      <line x1="122" y1="145" x2="122" y2="112" stroke="#484F58" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="122" y1="112" x2="88" y2="104" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Quadril apoiado na curvatura da bola */}
      <circle cx="88" cy="104" r="4" fill="#8B949E" />

      {/* Tronco: Enrolando para cima no pico concêntrico ou estendendo para trás na excêntrica */}
      <line
        x1="88"
        y1="104"
        x2={isCrunched ? '58' : '44'}
        y2={isCrunched ? '80' : '108'}
        stroke={accentColor}
        strokeWidth="6.5"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />

      {/* Cabeça e braços cruzados no peito ou mãos na têmpora */}
      <circle
        cx={isCrunched ? '50' : '34'}
        cy={isCrunched ? '68' : '114'}
        r="7.5"
        fill="#161B22"
        stroke="#FFFFFF"
        strokeWidth="2"
        className="transition-all duration-1000 ease-in-out"
      />
      <line
        x1={isCrunched ? '55' : '40'}
        y1={isCrunched ? '76' : '110'}
        x2={isCrunched ? '64' : '48'}
        y2={isCrunched ? '68' : '98'}
        stroke="#8B949E"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out"
      />
    </svg>
  );
}

// 9. ELEVAÇÃO PÉLVICA NO SMITH MACHINE (glute-1-smith / hipThrustSmith)
export function HipThrustSmithSvg({ phase, accentColor }: SvgModelProps) {
  const isUp = phase === 'concentric';
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Elevação Pélvica no Smith Machine">
      <line x1="15" y1="145" x2="145" y2="145" stroke="#30363D" strokeWidth="4" />

      {/* Trilho Vertical da Smith Machine */}
      <line x1="88" y1="20" x2="88" y2="145" stroke="#8B949E" strokeWidth="3" />
      {/* Trava amarela de segurança do Smith */}
      <rect x="83" y="120" width="10" height="5" rx="1" fill="#F59E0B" />

      {/* Banco Reto para apoio escapular */}
      <rect x="25" y="90" width="34" height="8" rx="2" fill="#21262D" stroke="#30363D" strokeWidth="1.5" />
      <line x1="36" y1="98" x2="36" y2="145" stroke="#21262D" strokeWidth="4" />

      {/* Atleta apoiando escápulas na borda do banco */}
      <circle cx="48" cy="84" r="8" fill="#161B22" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="48" y1="88" x2="58" y2="92" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Tronco e Quadril subindo até ficar alinhado horizontalmente sob os trilhos */}
      <line
        x1="58"
        y1="92"
        x2="88"
        y2={isUp ? '90' : '122'}
        stroke={accentColor}
        strokeWidth="6"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />

      {/* Coxas conectando quadril ao joelho a 90° */}
      <line
        x1="88"
        y1={isUp ? '90' : '122'}
        x2="116"
        y2="92"
        stroke={accentColor}
        strokeWidth="5.5"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_currentColor]"
      />

      {/* Canela vertical com pés firmes no chão */}
      <line x1="116" y1="92" x2="116" y2="145" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* Barra guiada do Smith com almofada grossa deslizando no trilho vertical */}
      <g className="transition-transform duration-1000 ease-in-out" style={{ transform: isUp ? 'translateY(-32px)' : 'translateY(0)' }}>
        {/* Barra e anilhas */}
        <line x1="74" y1="120" x2="102" y2="120" stroke="#E6EDF3" strokeWidth="3" />
        <rect x="78" y="116" width="20" height="8" rx="2" fill="#30363D" stroke="#E6EDF3" strokeWidth="1" />
        {/* Gancho de encaixe no trilho */}
        <path d="M88 116 L88 112 L92 112" stroke="#F59E0B" strokeWidth="2" fill="none" />
      </g>
    </svg>
  );
}

// Aliases
export const HipThrustSvg = HipThrustMachineSvg;
export const SeatedAbductorMachineSvg = SeatedAbductorSvg;
