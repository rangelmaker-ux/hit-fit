"use client";

import React from 'react';
import { DayWorkout } from '@/lib/workout-data';
import { Check } from 'lucide-react';

interface KineticWeekRibbonProps {
  days: DayWorkout[];
  activeDayIndex: number;
  onSelectDay: (index: number) => void;
  accentColor: string;
  isDayCompleted: (index: number) => boolean;
}

export function KineticWeekRibbon({
  days,
  activeDayIndex,
  onSelectDay,
  accentColor,
  isDayCompleted
}: KineticWeekRibbonProps) {
  const muscleTags = ['PERNA', 'COSTAS', 'OMBRO', 'GLÚTEO', 'PEITO'];

  return (
    <div className="w-full p-1.5 rounded-2xl bg-[#0E121A] border border-[rgba(255,255,255,0.07)] shadow-xl grid grid-cols-5 gap-1.5">
      {days.map((w, idx) => {
        const isActive = activeDayIndex === idx;
        const completed = isDayCompleted(idx);

        return (
          <button
            key={w.dayShort}
            onClick={() => onSelectDay(idx)}
            className={`relative py-2.5 px-1 rounded-xl flex flex-col items-center justify-between gap-1 transition-all duration-200 tap-haptic overflow-hidden ${
              isActive
                ? 'bg-[#171D28] text-white shadow-lg border border-[rgba(255,255,255,0.15)]'
                : 'bg-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02] border border-transparent'
            }`}
            style={
              isActive
                ? {
                    borderTopColor: accentColor,
                    boxShadow: `0 4px 16px -4px ${accentColor}30`
                  }
                : undefined
            }
          >
            {/* Top Index & Check indicator */}
            <div className="w-full flex items-center justify-between px-1">
              <span className={`text-[9px] font-mono tracking-tighter ${isActive ? 'text-white' : 'text-neutral-400'}`}>
                0{idx + 1}
              </span>
              {completed && (
                <span 
                  className="w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold"
                  style={{ backgroundColor: `${accentColor}30`, color: accentColor }}
                >
                  <Check size={8} strokeWidth={3} />
                </span>
              )}
            </div>

            {/* Day Short Name */}
            <span className={`text-xs font-black tracking-tight ${isActive ? 'text-white' : 'text-neutral-300'}`}>
              {w.dayShort}
            </span>

            {/* Micro Muscle Focus Tag */}
            <span
              className={`text-[8px] font-bold uppercase tracking-wider px-1 rounded ${
                isActive ? 'font-black' : 'text-neutral-400'
              }`}
              style={isActive ? { color: accentColor } : undefined}
            >
              {muscleTags[idx] || 'TREINO'}
            </span>

            {/* Active glowing underline indicator */}
            {isActive && (
              <span
                className="w-4 h-0.5 rounded-full mt-0.5"
                style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
