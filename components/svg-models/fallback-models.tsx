import React from 'react';
import { FallbackModelProps } from './types';

// ============================================================================
// ANIMAÇÃO TÉCNICA EM PREPARAÇÃO (Fallback seguro para variantes raras)
// Jamais exibe um equipamento incorreto no lugar de outro
// ============================================================================
export function AnimationInPreparationSvg({
  accentColor,
  exerciseName,
  equipmentName
}: FallbackModelProps) {
  const displayLabel = equipmentName || exerciseName || 'EQUIPAMENTO EM CALIBRAÇÃO';
  const truncatedLabel = displayLabel.length > 24 ? displayLabel.slice(0, 22) + '...' : displayLabel;

  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label={`Animação técnica para ${displayLabel}`}>
      {/* Moldura técnica / Blueprint com grade de calibração */}
      <rect x="15" y="15" width="130" height="130" rx="8" fill="#0D1117" stroke="#30363D" strokeWidth="2" strokeDasharray="4 3" />
      <circle cx="80" cy="80" r="50" fill="none" stroke="#21262D" strokeWidth="1" strokeDasharray="2 2" />

      {/* Silhueta geométrica em vetor técnico */}
      <circle cx="80" cy="48" r="10" fill="#161B22" stroke={accentColor} strokeWidth="2" />
      <line x1="80" y1="58" x2="80" y2="92" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="68" x2="56" y2="84" stroke="#8B949E" strokeWidth="3" strokeLinecap="round" />
      <line x1="80" y1="68" x2="104" y2="84" stroke="#8B949E" strokeWidth="3" strokeLinecap="round" />
      <line x1="80" y1="92" x2="68" y2="124" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="92" x2="92" y2="124" stroke="#8B949E" strokeWidth="4" strokeLinecap="round" />

      {/* Placa com nome do equipamento/variante selecionada */}
      <rect x="20" y="98" width="120" height="28" rx="5" fill="#161B22" stroke={accentColor} strokeWidth="1" />
      <text x="80" y="110" fill={accentColor} fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">
        ANIMAÇÃO EM PREPARAÇÃO
      </text>
      <text x="80" y="121" fill="#8B949E" fontSize="6.5" textAnchor="middle" fontWeight="500">
        {truncatedLabel}
      </text>
    </svg>
  );
}
