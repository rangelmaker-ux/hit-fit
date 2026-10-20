"use client";

import React, { useState } from 'react';
import { Utensils, Droplets, Scale, Target } from 'lucide-react';
import { NutritionView } from '@/components/nutrition-view';
import { WaterView } from '@/components/water-view';
import { WeightView } from '@/components/weight-view';
import { WeightGoalView } from '@/components/weight-goal-view';

export type HealthSubTab = 'alimentacao' | 'agua' | 'peso' | 'meta';

interface HealthHubViewProps {
  profileId: string;
  athleteName: string;
  accentColor: string;
  todayWorkoutCaloriesBurned?: number;
  initialSubTab?: HealthSubTab;
  currentWeightKg?: number;
  isReadOnly?: boolean;
}

export function HealthHubView({
  profileId,
  athleteName,
  accentColor,
  todayWorkoutCaloriesBurned = 0,
  initialSubTab = 'alimentacao',
  currentWeightKg = 82,
  isReadOnly = false
}: HealthHubViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<HealthSubTab>(initialSubTab);
  const [liveWeightKg, setLiveWeightKg] = useState<number>(currentWeightKg);

  const subTabs: { id: HealthSubTab; label: string; icon: React.ElementType }[] = [
    { id: 'alimentacao', label: 'Dieta', icon: Utensils },
    { id: 'agua', label: 'Água', icon: Droplets },
    { id: 'peso', label: 'Peso', icon: Scale },
    { id: 'meta', label: 'Meta', icon: Target }
  ];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in">
      
      {/* SELETOR DE SUB-ABAS (HEALTH NAVIGATION) */}
      <div className="p-1.5 rounded-2xl bg-[#0E121A] border border-[rgba(255,255,255,0.08)] grid grid-cols-4 gap-1.5 shadow-xl">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 tap-haptic ${
                isSelected
                  ? 'bg-[#171D28] text-white shadow-md border border-[rgba(255,255,255,0.12)]'
                  : 'bg-transparent text-neutral-400 hover:text-white hover:bg-white/[0.02]'
              }`}
              style={
                isSelected
                  ? {
                      borderTopColor: accentColor,
                      boxShadow: `0 4px 14px -4px ${accentColor}25`
                    }
                  : undefined
              }
            >
              <Icon
                size={17}
                style={isSelected ? { color: accentColor } : undefined}
              />
              <span className={`text-[10px] font-mono tracking-tight ${isSelected ? 'font-black text-white' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO DA SUB-ABA ATIVA */}
      {activeSubTab === 'alimentacao' && (
        <NutritionView
          profileId={profileId}
          profileName={athleteName}
          accentColor={accentColor}
          todayWorkoutCaloriesBurned={todayWorkoutCaloriesBurned}
          isReadOnly={isReadOnly}
        />
      )}

      {activeSubTab === 'agua' && (
        <WaterView
          profileId={profileId}
          athleteName={athleteName}
          accentColor={accentColor}
          weightKg={liveWeightKg}
          isReadOnly={isReadOnly}
        />
      )}

      {activeSubTab === 'peso' && (
        <WeightView
          profileId={profileId}
          athleteName={athleteName}
          accentColor={accentColor}
          isReadOnly={isReadOnly}
          onWeightUpdated={(latest) => setLiveWeightKg(latest)}
        />
      )}

      {activeSubTab === 'meta' && (
        <WeightGoalView
          profileId={profileId}
          athleteName={athleteName}
          accentColor={accentColor}
          currentWeightKg={liveWeightKg}
          isReadOnly={isReadOnly}
        />
      )}

    </div>
  );
}
