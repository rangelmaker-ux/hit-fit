"use client";

import React, { useState, useEffect } from 'react';
import { 
  UserBioProfile, 
  calculateTargets, 
  calculateActualDailyBurn,
  DEFAULT_PROFILES,
  QUICK_FOODS_CATALOG,
  FoodItem,
  Meal
} from '@/lib/nutrition';
import { 
  Flame, 
  Scale, 
  Droplets, 
  Utensils, 
  Plus, 
  Trash2, 
  Layers 
} from 'lucide-react';

interface NutritionViewProps {
  profileId: string;
  profileName: string;
  accentColor?: string;
  todayWorkoutCaloriesBurned?: number;
}

const DEFAULT_MEAL_NAMES = ['Café da Manhã', 'Almoço', 'Pré/Pós-Treino', 'Jantar', 'Lanche'];

export function NutritionView({
  profileId,
  profileName,
  accentColor = '#c3f75a',
  todayWorkoutCaloriesBurned = 0
}: NutritionViewProps) {
  // Carrega ou inicializa perfil biométrico
  const [profile, setProfile] = useState<UserBioProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hitfit-bio-${profileId}`);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return DEFAULT_PROFILES[profileName] || {
      name: profileName,
      gender: profileName.toLowerCase().includes('geic') ? 'female' : 'male',
      weightKg: profileName.toLowerCase().includes('geic') ? 64 : 82,
      heightCm: profileName.toLowerCase().includes('geic') ? 165 : 178,
      age: 29,
      targetWeightKg: profileName.toLowerCase().includes('geic') ? 58 : 76,
      goal: profileName.toLowerCase().includes('geic') ? 'recomp' : 'fat_loss',
      activityFactor: 1.55,
      customDailyDeficit: 400,
      waterGoalMl: 2800
    };
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [weightInput, setWeightInput] = useState(profile.weightKg.toString());

  // Diário Alimentar do Dia (Persistido por data:perfil)
  const todayDate = new Date().toISOString().split('T')[0];
  const [meals, setMeals] = useState<Meal[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hitfit-meals-${todayDate}-${profileId}`);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return DEFAULT_MEAL_NAMES.map((name, i) => ({
      id: `meal-${i}`,
      name,
      items: []
    }));
  });

  // Controle de Água (ml)
  const [waterConsumedMl, setWaterConsumedMl] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hitfit-water-${todayDate}-${profileId}`);
        if (stored) return Number(stored);
      } catch {}
    }
    return 1250;
  });

  // Modal para adicionar alimento
  const [addingToMealId, setAddingToMealId] = useState<string | null>(null);
  const [customFoodName, setCustomFoodName] = useState('');
  const [customPortion, setCustomPortion] = useState('1 porção');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  // Persistência automática
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`hitfit-bio-${profileId}`, JSON.stringify(profile));
      localStorage.setItem(`hitfit-meals-${todayDate}-${profileId}`, JSON.stringify(meals));
      localStorage.setItem(`hitfit-water-${todayDate}-${profileId}`, waterConsumedMl.toString());
    } catch {}
  }, [profile, meals, waterConsumedMl, profileId, todayDate]);

  // Cálculos Nutricionais
  const targets = calculateTargets(profile);
  const actualDailyBurn = calculateActualDailyBurn(targets.bmr, profile.activityFactor, todayWorkoutCaloriesBurned);

  // Totais consumidos nas refeições de hoje
  const totalCaloriesConsumed = meals.reduce(
    (sum, m) => sum + m.items.reduce((s, it) => s + it.calories, 0),
    0
  );
  const totalProteinConsumed = meals.reduce(
    (sum, m) => sum + m.items.reduce((s, it) => s + it.protein, 0),
    0
  );
  const totalCarbsConsumed = meals.reduce(
    (sum, m) => sum + m.items.reduce((s, it) => s + it.carbs, 0),
    0
  );
  const totalFatConsumed = meals.reduce(
    (sum, m) => sum + m.items.reduce((s, it) => s + it.fat, 0),
    0
  );

  // Saldo Calórico do Dia (sem contagem dupla):
  // Balanço = Ingerido - Gasto Total Real
  const netEnergyBalance = totalCaloriesConsumed - actualDailyBurn.totalDailyBurn;
  const isDeficit = netEnergyBalance < 0;
  const currentDeficitKcal = Math.abs(netEnergyBalance);

  const handleAddWater = (ml: number) => {
    setWaterConsumedMl((prev) => Math.min(6000, prev + ml));
  };

  const handleAddQuickFood = (mealId: string, food: FoodItem) => {
    setMeals((prev) =>
      prev.map((m) => {
        if (m.id === mealId) {
          return {
            ...m,
            items: [...m.items, { ...food, id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }]
          };
        }
        return m;
      })
    );
    setAddingToMealId(null);
  };

  const handleAddCustomFood = (mealId: string) => {
    if (!customFoodName.trim()) return;
    const item: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customFoodName.trim(),
      portion: customPortion.trim() || '1 porção',
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0
    };
    handleAddQuickFood(mealId, item);
    setCustomFoodName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
  };

  const handleRemoveFood = (mealId: string, itemId: string) => {
    setMeals((prev) =>
      prev.map((m) => {
        if (m.id === mealId) {
          return { ...m, items: m.items.filter((it) => it.id !== itemId) };
        }
        return m;
      })
    );
  };

  return (
    <div className="flex flex-col gap-5 text-neutral-100 pb-20 animate-in fade-in duration-300">
      
      {/* CABEÇALHO DO PERFIL NUTRICIONAL */}
      <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md border"
            style={{ 
              backgroundColor: `${accentColor}18`, 
              borderColor: `${accentColor}50`, 
              color: accentColor 
            }}
          >
            {profile.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                NUTRIÇÃO & RECOMPOSIÇÃO
              </span>
              <span 
                className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full"
                style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
              >
                {profile.goal === 'fat_loss' ? 'Queima de Gordura' : profile.goal === 'recomp' ? 'Recomposição' : 'Hipertrofia'}
              </span>
            </div>
            <h2 className="text-xl font-black text-white">{profile.name}</h2>
          </div>
        </div>
        <button
          onClick={() => setEditingProfile(!editingProfile)}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 transition-colors border border-white/5"
        >
          {editingProfile ? 'Concluir' : 'Editar Dados'}
        </button>
      </div>

      {/* FORMULÁRIO DE BIOMETRIA */}
      {editingProfile && (
        <div className="p-4 rounded-3xl bg-black/50 border border-white/10 grid grid-cols-2 gap-3 text-xs animate-in fade-in">
          <label className="flex flex-col gap-1">
            <span className="text-neutral-400">Peso Atual (kg):</span>
            <input
              type="number"
              step="0.1"
              value={profile.weightKg}
              onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) || 0 })}
              className="bg-white/10 border border-white/15 rounded-xl p-2.5 text-white font-bold"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-400">Meta de Peso (kg):</span>
            <input
              type="number"
              step="0.1"
              value={profile.targetWeightKg}
              onChange={(e) => setProfile({ ...profile, targetWeightKg: Number(e.target.value) || 0 })}
              className="bg-white/10 border border-white/15 rounded-xl p-2.5 text-white font-bold"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-400">Altura (cm):</span>
            <input
              type="number"
              value={profile.heightCm}
              onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) || 0 })}
              className="bg-white/10 border border-white/15 rounded-xl p-2.5 text-white font-bold"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-400">Idade (anos):</span>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) || 0 })}
              className="bg-white/10 border border-white/15 rounded-xl p-2.5 text-white font-bold"
            />
          </label>
          <label className="flex flex-col gap-1 col-span-2">
            <span className="text-neutral-400">Objetivo Físico:</span>
            <select
              value={profile.goal}
              onChange={(e) => setProfile({ ...profile, goal: e.target.value as UserBioProfile['goal'] })}
              className="bg-white/10 border border-white/15 rounded-xl p-2.5 text-white font-bold"
            >
              <option value="fat_loss" className="bg-[#121512]">Perda de Gordura com Preservação de Massa</option>
              <option value="recomp" className="bg-[#121512]">Recomposição Corporal (Definição Simultânea)</option>
              <option value="hypertrophy" className="bg-[#121512]">Hipertrofia Muscular Controlada</option>
            </select>
          </label>
        </div>
      )}

      {/* TERMÔMETRO DO BALANÇO CALÓRICO (MATEMÁTICA REAL SEM CONTAGEM DUPLA) */}
      <div 
        className="p-5 rounded-3xl border relative overflow-hidden flex flex-col gap-4 shadow-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          borderColor: isDeficit ? `${accentColor}50` : 'rgba(255,255,255,0.1)'
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Flame size={15} style={{ color: accentColor }} />
            Balanço Energético do Dia
          </span>
          <span 
            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
            style={{ 
              backgroundColor: isDeficit ? `${accentColor}25` : '#f59e0b25',
              color: isDeficit ? accentColor : '#f59e0b'
            }}
          >
            {isDeficit ? `Déficit Ativo (-${currentDeficitKcal} kcal)` : `Superávit (+${netEnergyBalance} kcal)`}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: isDeficit ? accentColor : '#f59e0b' }}>
              {totalCaloriesConsumed} <small className="text-base font-normal text-neutral-400">/ {targets.targetCalories} kcal</small>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {actualDailyBurn.source === 'watch_adjusted'
                ? `Gasto real ajustado pelo relógio: ${actualDailyBurn.totalDailyBurn} kcal (sem contagem dupla)`
                : `Gasto diário estimado (TDEE moderado): ${actualDailyBurn.totalDailyBurn} kcal`}
            </p>
          </div>
        </div>

        {/* Breakdown dos 3 Pilares com Transparência Biomecânica */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
          <div className="bg-white/5 p-2 rounded-2xl">
            <span className="text-[9px] text-neutral-400 uppercase block">Metabolismo Basal</span>
            <strong className="text-xs font-bold text-neutral-200">{targets.bmr} kcal</strong>
          </div>
          <div className="bg-white/5 p-2 rounded-2xl">
            <span className="text-[9px] text-neutral-400 uppercase block">Gasto do Treino</span>
            <strong className="text-xs font-bold text-sky-300">
              {todayWorkoutCaloriesBurned > 0 ? `${todayWorkoutCaloriesBurned} kcal (Relógio)` : 'Incluso no TDEE'}
            </strong>
          </div>
          <div className="bg-white/5 p-2 rounded-2xl">
            <span className="text-[9px] text-neutral-400 uppercase block">Total Consumido</span>
            <strong className="text-xs font-bold text-amber-300">{totalCaloriesConsumed} kcal</strong>
          </div>
        </div>
      </div>

      {/* METAS DE MACRONUTRIENTES */}
      <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Utensils size={14} className="text-emerald-400" />
            Metas de Macronutrientes
          </span>
          <span className="text-[10px] text-neutral-400">Proteína alta para recomposição</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20 text-center">
            <span className="text-[10px] text-emerald-400 font-bold block mb-1">PROTEÍNA</span>
            <div className="text-lg font-black text-white">{totalProteinConsumed.toFixed(0)} <small className="text-xs font-normal text-neutral-400">/ {targets.targetProteinG}g</small></div>
            <span className="text-[9px] text-neutral-400">2.0g/kg</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 text-center">
            <span className="text-[10px] text-amber-400 font-bold block mb-1">CARBOIDRATO</span>
            <div className="text-lg font-black text-white">{totalCarbsConsumed.toFixed(0)} <small className="text-xs font-normal text-neutral-400">/ {targets.targetCarbsG}g</small></div>
            <span className="text-[9px] text-neutral-400">Energia do treino</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-sky-500/20 text-center">
            <span className="text-[10px] text-sky-400 font-bold block mb-1">GORDURAS</span>
            <div className="text-lg font-black text-white">{totalFatConsumed.toFixed(0)} <small className="text-xs font-normal text-neutral-400">/ {targets.targetFatG}g</small></div>
            <span className="text-[9px] text-neutral-400">Hormônios vitais</span>
          </div>
        </div>
      </div>

      {/* DIÁRIO DE REFEIÇÕES DO DIA */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Layers size={14} style={{ color: accentColor }} />
            Diário Alimentar de Hoje
          </span>
          <span className="text-[11px] text-neutral-500">{meals.reduce((acc, m) => acc + m.items.length, 0)} itens registrados</span>
        </div>

        {meals.map((meal) => {
          const mealKcal = meal.items.reduce((s, it) => s + it.calories, 0);
          const mealProt = meal.items.reduce((s, it) => s + it.protein, 0);

          return (
            <div key={meal.id} className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{meal.name}</h4>
                  <span className="text-[10px] text-neutral-400">
                    {mealKcal} kcal · {mealProt.toFixed(0)}g proteína
                  </span>
                </div>
                <button
                  onClick={() => setAddingToMealId(meal.id)}
                  className="py-1 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1 transition-colors"
                >
                  <Plus size={13} style={{ color: accentColor }} />
                  <span>Adicionar</span>
                </button>
              </div>

              {/* Lista de itens da refeição */}
              {meal.items.length > 0 ? (
                <div className="flex flex-col gap-1.5 pt-1 border-t border-white/5">
                  {meal.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between py-1 px-2 rounded-xl bg-black/30 text-xs">
                      <div>
                        <strong className="text-neutral-200">{it.name}</strong>
                        <span className="text-[10px] text-neutral-400 ml-1.5 font-mono">({it.portion})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-white">{it.calories} kcal</span>
                        <span className="text-[10px] font-mono text-emerald-400">{it.protein}g P</span>
                        <button
                          onClick={() => handleRemoveFood(meal.id, it.id)}
                          className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                          aria-label={`Remover ${it.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-neutral-500 italic py-1">Nenhum alimento registrado ainda.</p>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL PARA ADICIONAR ALIMENTO À REFEIÇÃO */}
      {addingToMealId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setAddingToMealId(null)}
        >
          <div 
            className="w-full max-w-md bg-[#0e120e] border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-neutral-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-base font-bold text-white">Adicionar Alimento</h3>
              <button onClick={() => setAddingToMealId(null)} className="text-xs text-neutral-400 hover:text-white">✕</button>
            </div>

            {/* Catálogo Rápido com 1 Toque */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Alimentos Rápidos de Academia:
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {QUICK_FOODS_CATALOG.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleAddQuickFood(addingToMealId, food)}
                    className="p-2 text-left rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 flex flex-col gap-0.5 transition-colors"
                  >
                    <span className="text-xs font-bold text-white truncate">{food.name}</span>
                    <span className="text-[9px] text-neutral-400">{food.portion} · {food.calories} kcal</span>
                    <span className="text-[9px] text-emerald-400 font-mono">{food.protein}g proteína</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cadastro Customizado */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Ou Cadastre Outro Alimento:
              </span>
              <input
                type="text"
                placeholder="Nome do alimento (ex: Omelete de 3 ovos)"
                value={customFoodName}
                onChange={(e) => setCustomFoodName(e.target.value)}
                className="p-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white"
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Porção (ex: 200g)"
                  value={customPortion}
                  onChange={(e) => setCustomPortion(e.target.value)}
                  className="p-2 bg-black/50 border border-white/15 rounded-xl text-white"
                />
                <input
                  type="number"
                  placeholder="Calorias (kcal)"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  className="p-2 bg-black/50 border border-white/15 rounded-xl text-white font-bold"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <input
                  type="number"
                  placeholder="Prot (g)"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  className="p-2 bg-black/50 border border-white/15 rounded-xl text-emerald-300"
                />
                <input
                  type="number"
                  placeholder="Carb (g)"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  className="p-2 bg-black/50 border border-white/15 rounded-xl text-amber-300"
                />
                <input
                  type="number"
                  placeholder="Gord (g)"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  className="p-2 bg-black/50 border border-white/15 rounded-xl text-sky-300"
                />
              </div>
              <button
                onClick={() => handleAddCustomFood(addingToMealId)}
                className="py-2.5 rounded-xl font-bold text-xs shadow-md transition-transform active:scale-95 text-[#10150d] mt-1"
                style={{ backgroundColor: accentColor }}
              >
                Salvar no Diário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTROLE DE HIDRATAÇÃO */}
      <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Droplets size={16} />
            Consumo de Água
          </span>
          <span className="text-sm font-bold text-white font-mono">
            {waterConsumedMl} / {targets.targetWaterMl} ml
          </span>
        </div>

        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, Math.round((waterConsumedMl / targets.targetWaterMl) * 100))}%` }}
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleAddWater(250)}
            className="flex-1 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
          >
            +250 ml (Copo)
          </button>
          <button
            onClick={() => handleAddWater(500)}
            className="flex-1 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
          >
            +500 ml (Garrafa)
          </button>
        </div>
      </div>

      {/* BALANÇA & REGISTRO DE PESO */}
      <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Scale size={15} style={{ color: accentColor }} />
            Peso Atual & Meta
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            Falta {Math.max(0, profile.weightKg - profile.targetWeightKg).toFixed(1)} kg para a meta
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            step="0.1"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="flex-1 bg-black/50 border border-white/15 rounded-2xl p-3 text-white font-black text-2xl font-mono"
            placeholder="Seu peso hoje (ex: 81.5)"
          />
          <button
            onClick={() => {
              const val = parseFloat(weightInput);
              if (val > 0) setProfile({ ...profile, weightKg: val });
            }}
            className="py-3.5 px-5 rounded-2xl font-bold text-xs shadow-md transition-transform active:scale-95 text-[#10150d]"
            style={{ backgroundColor: accentColor }}
          >
            Salvar Peso
          </button>
        </div>
      </div>

    </div>
  );
}
