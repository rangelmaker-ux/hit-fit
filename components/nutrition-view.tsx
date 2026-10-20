"use client";

import React, { useState } from 'react';
import { 
  UserBioProfile, 
  calculateNutritionTargets, 
  DEFAULT_PROFILES 
} from '@/lib/nutrition';
import { 
  Flame, 
  Scale, 
  Droplets, 
  Utensils 
} from 'lucide-react';

interface NutritionViewProps {
  profileId?: string;
  profileName: string;
  accentColor?: string;
  todayWorkoutCaloriesBurned?: number;
}

export function NutritionView({
  profileName,
  accentColor = '#c3f75a',
  todayWorkoutCaloriesBurned = 0
}: NutritionViewProps) {
  // Carrega ou inicializa perfil biométrico
  const [profile, setProfile] = useState<UserBioProfile>(() => {
    return DEFAULT_PROFILES[profileName] || {
      name: profileName,
      gender: profileName.toLowerCase().includes('geic') ? 'female' : 'male',
      weightKg: profileName.toLowerCase().includes('geic') ? 64 : 80,
      heightCm: profileName.toLowerCase().includes('geic') ? 165 : 178,
      age: 29,
      targetWeightKg: profileName.toLowerCase().includes('geic') ? 58 : 75,
      dailyDeficitGoal: 400,
      waterGoalMl: 2800
    };
  });

  const [weightInput, setWeightInput] = useState(profile.weightKg.toString());
  const [consumedCalories, setConsumedCalories] = useState(1650);
  const [waterConsumedMl, setWaterConsumedMl] = useState(1500);
  const [editingProfile, setEditingProfile] = useState(false);

  // Calcula metas automáticas
  const targets = calculateNutritionTargets(profile);

  // Saldo Calórico do Dia:
  // Gasto Total do Dia = TDEE + Gasto extra do treino registrado no relógio
  const totalBurnedToday = targets.tdee + todayWorkoutCaloriesBurned;
  // Déficit Real = Total Gasto - Total Consumido
  const actualDeficit = totalBurnedToday - consumedCalories;
  const isDeficitOnTrack = actualDeficit >= profile.dailyDeficitGoal;

  const handleAddWater = (ml: number) => {
    setWaterConsumedMl((prev) => Math.min(6000, prev + ml));
  };

  const handleAddCalories = (cals: number) => {
    setConsumedCalories((prev) => Math.max(0, prev + cals));
  };

  return (
    <div className="flex flex-col gap-5 text-neutral-100 pb-20 animate-in fade-in duration-300">
      {/* CABEÇALHO DO PERFIL NUTRICIONAL */}
      <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg shadow-md"
            style={{ backgroundColor: accentColor, color: '#10150d' }}
          >
            {profile.name[0]}
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              PLANO NUTRICIONAL & PESO
            </span>
            <h2 className="text-lg font-black text-white">{profile.name}</h2>
          </div>
        </div>
        <button
          onClick={() => setEditingProfile(!editingProfile)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-neutral-300 transition-colors"
        >
          {editingProfile ? 'Concluir' : 'Ajustar Biometria'}
        </button>
      </div>

      {/* FORMULÁRIO DE EDIÇÃO BIOMÉTRICA (QUANDO ATIVO) */}
      {editingProfile && (
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-2 gap-3 text-xs">
          <label className="flex flex-col gap-1">
            <span className="text-neutral-400">Peso Atual (kg):</span>
            <input
              type="number"
              value={profile.weightKg}
              onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) || 0 })}
              className="bg-white/10 border border-white/15 rounded-lg p-2 text-white font-bold"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-400">Meta de Peso (kg):</span>
            <input
              type="number"
              value={profile.targetWeightKg}
              onChange={(e) => setProfile({ ...profile, targetWeightKg: Number(e.target.value) || 0 })}
              className="bg-white/10 border border-white/15 rounded-lg p-2 text-white font-bold"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-400">Altura (cm):</span>
            <input
              type="number"
              value={profile.heightCm}
              onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) || 0 })}
              className="bg-white/10 border border-white/15 rounded-lg p-2 text-white font-bold"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-400">Meta Déficit Diário:</span>
            <input
              type="number"
              value={profile.dailyDeficitGoal}
              onChange={(e) => setProfile({ ...profile, dailyDeficitGoal: Number(e.target.value) || 0 })}
              className="bg-white/10 border border-white/15 rounded-lg p-2 text-white font-bold"
            />
          </label>
        </div>
      )}

      {/* CARD PRINCIPAL: O TERMÔMETRO DO DÉFICIT CALÓRICO */}
      <div 
        className="p-5 rounded-3xl border relative overflow-hidden flex flex-col gap-4 shadow-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          borderColor: isDeficitOnTrack ? `${accentColor}50` : 'rgba(255,255,255,0.1)'
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Flame size={15} style={{ color: accentColor }} />
            Déficit Calórico de Hoje
          </span>
          <span 
            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
            style={{ 
              backgroundColor: isDeficitOnTrack ? `${accentColor}25` : '#f59e0b25',
              color: isDeficitOnTrack ? accentColor : '#f59e0b'
            }}
          >
            {isDeficitOnTrack ? 'Queima no Alvo' : 'Ajustar Balanço'}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: accentColor }}>
              -{actualDeficit} <small className="text-base font-normal text-neutral-400">kcal</small>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Meta do dia: -{profile.dailyDeficitGoal} kcal para queima pura de gordura
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-400">Gasto Total do Dia</div>
            <div className="text-lg font-bold text-white">{totalBurnedToday} kcal</div>
          </div>
        </div>

        {/* Três Pilares da Balança Energética */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
          <div className="bg-white/5 p-2 rounded-xl">
            <span className="text-[9px] text-neutral-400 uppercase block">Gasto Basal</span>
            <strong className="text-xs font-bold text-neutral-200">{targets.bmr} kcal</strong>
          </div>
          <div className="bg-white/5 p-2 rounded-xl">
            <span className="text-[9px] text-neutral-400 uppercase block">Treino/Relógio</span>
            <strong className="text-xs font-bold text-sky-300">+{todayWorkoutCaloriesBurned || 400} kcal</strong>
          </div>
          <div className="bg-white/5 p-2 rounded-xl">
            <span className="text-[9px] text-neutral-400 uppercase block">Consumido</span>
            <strong className="text-xs font-bold text-amber-300">{consumedCalories} kcal</strong>
          </div>
        </div>

        {/* Botoes Rapidos de Adicionar Calorias */}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-[11px] text-neutral-400">Registrar Refeição:</span>
          {[200, 350, 500].map((c) => (
            <button
              key={c}
              onClick={() => handleAddCalories(c)}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 transition-colors"
            >
              +{c} kcal
            </button>
          ))}
          <button
            onClick={() => setConsumedCalories(0)}
            className="text-[10px] text-neutral-500 hover:text-neutral-300 ml-auto"
          >
            Zerar
          </button>
        </div>
      </div>

      {/* CARD DE MACRONUTRIENTES ESSENCIAIS */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Utensils size={14} className="text-emerald-400" />
            Metas de Macros para Definição
          </span>
          <span className="text-[10px] text-neutral-400">Proteína Preserva Músculo</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-center">
            <span className="text-[10px] text-emerald-400 font-bold block mb-1">PROTEÍNA</span>
            <div className="text-lg font-black text-white">{targets.targetProteinG}g</div>
            <span className="text-[9px] text-neutral-400">2.0g por kg</span>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20 text-center">
            <span className="text-[10px] text-amber-400 font-bold block mb-1">CARBOIDRATO</span>
            <div className="text-lg font-black text-white">{targets.targetCarbsG}g</div>
            <span className="text-[9px] text-neutral-400">Energia do treino</span>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-sky-500/20 text-center">
            <span className="text-[10px] text-sky-400 font-bold block mb-1">GORDURAS</span>
            <div className="text-lg font-black text-white">{targets.targetFatG}g</div>
            <span className="text-[9px] text-neutral-400">Hormônios vitais</span>
          </div>
        </div>
      </div>

      {/* CARD DE HIDRATAÇÃO DIÁRIA */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Droplets size={15} />
            Consumo de Água
          </span>
          <span className="text-xs font-bold text-white">
            {waterConsumedMl} / {targets.targetWaterMl} ml
          </span>
        </div>

        {/* Barra de Progresso de Água */}
        <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, Math.round((waterConsumedMl / targets.targetWaterMl) * 100))}%` }}
          />
        </div>

        {/* Botoes de Adicionar Água */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleAddWater(250)}
            className="flex-1 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
          >
            +250 ml (Copo)
          </button>
          <button
            onClick={() => handleAddWater(500)}
            className="flex-1 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
          >
            +500 ml (Garrafa)
          </button>
        </div>
      </div>

      {/* EVOLUÇÃO NA BALANÇA & PESO */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Scale size={15} style={{ color: accentColor }} />
            Peso Atual & Meta
          </span>
          <span className="text-xs text-neutral-400">
            Falta {Math.max(0, profile.weightKg - profile.targetWeightKg).toFixed(1)} kg
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            step="0.1"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="flex-1 bg-black/40 border border-white/15 rounded-xl p-3 text-white font-black text-xl"
            placeholder="Seu peso hoje (ex: 81.5)"
          />
          <button
            onClick={() => {
              const val = parseFloat(weightInput);
              if (val > 0) setProfile({ ...profile, weightKg: val });
            }}
            className="py-3 px-5 rounded-xl font-bold text-xs shadow-md transition-transform active:scale-95"
            style={{ backgroundColor: accentColor, color: '#10150d' }}
          >
            Salvar Peso
          </button>
        </div>
      </div>
    </div>
  );
}
