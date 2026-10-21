"use client";

import React from 'react';

interface AthleteSwitcherProps {
  people: { id: string; name: string }[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  avatars?: Record<string, string | null>;
}

export function AthleteSwitcher({
  people,
  activeProfileId,
  onSelectProfile,
  avatars = {}
}: AthleteSwitcherProps) {
  return (
    <div className="relative w-full p-1 rounded-2xl bg-[#0E121A] border border-[rgba(255,255,255,0.07)] shadow-2xl flex items-center gap-1.5">
      {people.map((p) => {
        const isSelected = activeProfileId === p.id;
        const isJack = p.name.toLowerCase().includes('jack') || p.name.toLowerCase().includes('geic') || p.id === 'person-geicsania';
        const themeColor = isJack ? '#FF267A' : '#C4F53C';
        const athleteTag = isJack ? 'Recomposição · Jack' : 'Performance · Rangel';
        const focusText = isJack ? 'Definição & Ritmo' : 'Força & Potência';

        return (
          <button
            key={p.id}
            onClick={() => onSelectProfile(p.id)}
            className={`relative flex-1 py-2.5 px-3 rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden text-left tap-haptic ${
              isSelected
                ? 'bg-[#161C26] shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.12)]'
                : 'bg-transparent border border-transparent hover:bg-white/[0.03] text-neutral-400'
            }`}
            style={
              isSelected
                ? {
                    borderTopColor: `${themeColor}90`,
                    boxShadow: `0 8px 24px -6px ${themeColor}20`
                  }
                : undefined
            }
          >
            {/* Efeito de luz ambiente de fundo do perfil ativo */}
            {isSelected && (
              <div
                className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20"
                style={{ backgroundColor: themeColor }}
              />
            )}

            {/* Avatar Esculpido ou Foto Real */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 overflow-hidden transition-all ${
                isSelected
                  ? 'shadow-md scale-105'
                  : 'bg-white/5 text-neutral-400'
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: `${themeColor}22`,
                      color: themeColor,
                      border: `1.5px solid ${themeColor}60`
                    }
                  : undefined
              }
            >
              {avatars[p.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatars[p.id] || ''}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                p.name[0]
              )}
            </div>

            {/* Nome e Micro-Telemetria */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-black tracking-tight truncate ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                  {p.name.toUpperCase()}
                </span>
                {isSelected && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-ping shrink-0"
                    style={{ backgroundColor: themeColor }}
                  />
                )}
              </div>
              <span className="text-[10px] text-neutral-400 block font-mono tracking-tight truncate">
                {athleteTag}
              </span>
            </div>

            {/* Micro-Indicador de Modo */}
            {isSelected && (
              <span
                className="hidden sm:inline-block text-[9px] uppercase font-bold px-2 py-0.5 rounded-md tracking-wider shrink-0"
                style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
              >
                {focusText}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
