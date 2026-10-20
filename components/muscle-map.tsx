"use client";

import React from 'react';

interface MuscleMapProps {
  activeFrontParts?: string[];
  activeBackParts?: string[];
  accentColor?: string; // e.g. '#c3f75a' (lime) or '#ff2e93' (magenta)
  viewMode?: 'both' | 'front' | 'back';
}

export function MuscleMap({
  activeFrontParts = [],
  activeBackParts = [],
  accentColor = '#c3f75a',
  viewMode = 'both'
}: MuscleMapProps) {
  const isFrontActive = (part: string) => activeFrontParts.includes(part);
  const isBackActive = (part: string) => activeBackParts.includes(part);

  const activeFill = accentColor;
  const activeGlow = `${accentColor}88`;
  const defaultFill = '#222822';
  const strokeColor = '#3a4435';

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-[#121612]/90 rounded-2xl border border-white/10 shadow-inner">
      <div className="flex items-center justify-between w-full px-2">
        <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
          Músculos Fortalecidos
        </span>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse shadow-sm"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
          />
          <span className="text-[10px] font-medium text-neutral-300">Em Foco</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-[340px] py-1">
        {/* CORPO FRENTE */}
        {(viewMode === 'both' || viewMode === 'front') && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold text-neutral-400 mb-1 tracking-widest">
              VISÃO FRONTAL
            </span>
            <svg
              viewBox="0 0 100 210"
              className="w-full h-44 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
              aria-label="Anatomia Frontal"
            >
              <defs>
                <filter id="glow-front" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={activeGlow} />
                </filter>
              </defs>

              {/* Cabeça e Pescoço */}
              <circle cx="50" cy="18" r="11" fill="#1b201a" stroke={strokeColor} strokeWidth="1.2" />
              <path d="M46 29 L46 36 L54 36 L54 29 Z" fill="#1b201a" stroke={strokeColor} strokeWidth="1" />

              {/* Ombros / Deltoides Frontais */}
              <path
                d="M32 37 C26 39 23 45 22 52 C26 53 31 51 34 46 Z"
                fill={isFrontActive('shoulders') ? activeFill : defaultFill}
                stroke={isFrontActive('shoulders') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isFrontActive('shoulders') ? 'url(#glow-front)' : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M68 37 C74 39 77 45 78 52 C74 53 69 51 66 46 Z"
                fill={isFrontActive('shoulders') ? activeFill : defaultFill}
                stroke={isFrontActive('shoulders') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isFrontActive('shoulders') ? 'url(#glow-front)' : undefined}
                className="transition-colors duration-300"
              />

              {/* Peitoral Maior */}
              <path
                d="M35 38 C43 38 49 41 49 53 C42 54 34 52 32 44 Z"
                fill={isFrontActive('chest') ? activeFill : defaultFill}
                stroke={isFrontActive('chest') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isFrontActive('chest') ? 'url(#glow-front)' : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M65 38 C57 38 51 41 51 53 C58 54 66 52 68 44 Z"
                fill={isFrontActive('chest') ? activeFill : defaultFill}
                stroke={isFrontActive('chest') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isFrontActive('chest') ? 'url(#glow-front)' : undefined}
                className="transition-colors duration-300"
              />

              {/* Braços (Bíceps) */}
              <path
                d="M21 53 C18 60 17 68 20 73 C23 72 26 66 26 58 Z"
                fill={isFrontActive('biceps') ? activeFill : defaultFill}
                stroke={isFrontActive('biceps') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isFrontActive('biceps') ? 'url(#glow-front)' : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M79 53 C82 60 83 68 80 73 C77 72 74 66 74 58 Z"
                fill={isFrontActive('biceps') ? activeFill : defaultFill}
                stroke={isFrontActive('biceps') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isFrontActive('biceps') ? 'url(#glow-front)' : undefined}
                className="transition-colors duration-300"
              />

              {/* Antebraços */}
              <path
                d="M19 75 C16 83 14 92 16 98 C19 97 22 89 22 81 Z"
                fill={isFrontActive('forearms') ? activeFill : defaultFill}
                stroke={strokeColor}
                strokeWidth="1"
              />
              <path
                d="M81 75 C84 83 86 92 84 98 C81 97 78 89 78 81 Z"
                fill={isFrontActive('forearms') ? activeFill : defaultFill}
                stroke={strokeColor}
                strokeWidth="1"
              />

              {/* Abdômen (Core) */}
              <path
                d="M39 56 L61 56 L59 90 L41 90 Z"
                fill={isFrontActive('abs') ? activeFill : defaultFill}
                stroke={isFrontActive('abs') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isFrontActive('abs') ? 'url(#glow-front)' : undefined}
                className="transition-colors duration-300"
              />

              {/* Quadril / Pelve */}
              <path d="M40 91 L60 91 L57 104 L43 104 Z" fill="#1e241c" stroke={strokeColor} strokeWidth="1" />

              {/* Quadríceps (Coxa Frontal) */}
              <path
                d="M38 106 C34 116 32 136 36 148 C41 148 45 140 47 125 C47 114 45 106 43 106 Z"
                fill={isFrontActive('quads') ? activeFill : defaultFill}
                stroke={isFrontActive('quads') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isFrontActive('quads') ? 'url(#glow-front)' : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M62 106 C66 116 68 136 64 148 C59 148 55 140 53 125 C53 114 55 106 57 106 Z"
                fill={isFrontActive('quads') ? activeFill : defaultFill}
                stroke={isFrontActive('quads') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isFrontActive('quads') ? 'url(#glow-front)' : undefined}
                className="transition-colors duration-300"
              />

              {/* Joelhos */}
              <circle cx="41" cy="153" r="3.5" fill="#1a1f19" stroke={strokeColor} strokeWidth="1" />
              <circle cx="59" cy="153" r="3.5" fill="#1a1f19" stroke={strokeColor} strokeWidth="1" />

              {/* Canelas / Panturrilhas Frontais */}
              <path
                d="M37 158 C35 168 36 186 39 196 C42 196 44 186 44 172 Z"
                fill={isFrontActive('calves') ? activeFill : defaultFill}
                stroke={strokeColor}
                strokeWidth="1"
              />
              <path
                d="M63 158 C65 168 64 186 61 196 C58 196 56 186 56 172 Z"
                fill={isFrontActive('calves') ? activeFill : defaultFill}
                stroke={strokeColor}
                strokeWidth="1"
              />
            </svg>
          </div>
        )}

        {/* CORPO COSTAS */}
        {(viewMode === 'both' || viewMode === 'back') && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold text-neutral-400 mb-1 tracking-widest">
              VISÃO POSTERIOR
            </span>
            <svg
              viewBox="0 0 100 210"
              className="w-full h-44 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
              aria-label="Anatomia Posterior"
            >
              <defs>
                <filter id="glow-back" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={activeGlow} />
                </filter>
              </defs>

              {/* Cabeça Posterior */}
              <circle cx="50" cy="18" r="11" fill="#1b201a" stroke={strokeColor} strokeWidth="1.2" />

              {/* Trapézio Superior & Médio */}
              <path
                d="M45 28 L55 28 L62 42 L50 56 L38 42 Z"
                fill={isBackActive('traps') ? activeFill : defaultFill}
                stroke={isBackActive('traps') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isBackActive('traps') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />

              {/* Deltoides Posteriores */}
              <path
                d="M33 37 C27 40 24 45 23 52 C27 52 32 49 35 44 Z"
                fill={isBackActive('shoulders') ? activeFill : defaultFill}
                stroke={isBackActive('shoulders') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isBackActive('shoulders') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M67 37 C73 40 76 45 77 52 C73 52 68 49 65 44 Z"
                fill={isBackActive('shoulders') ? activeFill : defaultFill}
                stroke={isBackActive('shoulders') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isBackActive('shoulders') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />

              {/* Dorsais (Latíssimo do Dorso) */}
              <path
                d="M34 47 C32 58 35 72 42 80 L50 60 L38 46 Z"
                fill={isBackActive('lats') ? activeFill : defaultFill}
                stroke={isBackActive('lats') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isBackActive('lats') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M66 47 C68 58 65 72 58 80 L50 60 L62 46 Z"
                fill={isBackActive('lats') ? activeFill : defaultFill}
                stroke={isBackActive('lats') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isBackActive('lats') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />

              {/* Tríceps */}
              <path
                d="M21 53 C18 61 17 68 20 74 C23 72 25 66 26 58 Z"
                fill={isBackActive('triceps') ? activeFill : defaultFill}
                stroke={isBackActive('triceps') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isBackActive('triceps') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M79 53 C82 61 83 68 80 74 C77 72 75 66 74 58 Z"
                fill={isBackActive('triceps') ? activeFill : defaultFill}
                stroke={isBackActive('triceps') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isBackActive('triceps') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />

              {/* Lombar / Eretores da Espinha */}
              <path
                d="M43 78 L57 78 L55 94 L45 94 Z"
                fill={isBackActive('lowerback') ? activeFill : defaultFill}
                stroke={isBackActive('lowerback') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isBackActive('lowerback') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />

              {/* GLÚTEOS (Glúteo Máximo & Médio) */}
              <path
                d="M34 96 C33 107 38 118 48 118 C49 111 49 101 48 96 Z"
                fill={isBackActive('glutes') ? activeFill : defaultFill}
                stroke={isBackActive('glutes') ? '#fff' : strokeColor}
                strokeWidth="1.3"
                filter={isBackActive('glutes') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M66 96 C67 107 62 118 52 118 C51 111 51 101 52 96 Z"
                fill={isBackActive('glutes') ? activeFill : defaultFill}
                stroke={isBackActive('glutes') ? '#fff' : strokeColor}
                strokeWidth="1.3"
                filter={isBackActive('glutes') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />

              {/* Isquiotibiais (Posterior de Coxa) */}
              <path
                d="M36 120 C34 130 35 142 39 148 C43 148 46 142 47 130 C47 122 45 120 44 120 Z"
                fill={isBackActive('hamstrings') ? activeFill : defaultFill}
                stroke={isBackActive('hamstrings') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isBackActive('hamstrings') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M64 120 C66 130 65 142 61 148 C57 148 54 142 53 130 C53 122 55 120 56 120 Z"
                fill={isBackActive('hamstrings') ? activeFill : defaultFill}
                stroke={isBackActive('hamstrings') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isBackActive('hamstrings') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />

              {/* Panturrilhas (Gastrocnêmio & Sóleo) */}
              <path
                d="M36 156 C33 166 35 185 39 196 C42 196 45 186 45 172 C44 163 42 156 39 156 Z"
                fill={isBackActive('calves') ? activeFill : defaultFill}
                stroke={isBackActive('calves') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isBackActive('calves') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M64 156 C67 166 65 185 61 196 C58 196 55 186 55 172 C56 163 58 156 61 156 Z"
                fill={isBackActive('calves') ? activeFill : defaultFill}
                stroke={isBackActive('calves') ? '#fff' : strokeColor}
                strokeWidth="1.2"
                filter={isBackActive('calves') ? 'url(#glow-back)' : undefined}
                className="transition-colors duration-300"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
