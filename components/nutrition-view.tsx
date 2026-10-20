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
  Plus, 
  Trash2, 
  Layers,
  Lock
} from 'lucide-react';
import { NumericInput } from '@/components/ui/numeric-input';

interface NutritionViewProps {
  profileId: string;
  profileName: string;
  accentColor?: string;
  todayWorkoutCaloriesBurned?: number;
  isReadOnly?: boolean;
}

const DEFAULT_MEAL_NAMES = ['Café da Manhã', 'Almoço', 'Pré/Pós-Treino', 'Jantar', 'Lanche'];

export function NutritionView({
  profileId,
  profileName,
  accentColor = '#C4F53C',
  todayWorkoutCaloriesBurned = 0,
  isReadOnly = false
}: NutritionViewProps) {
  const isGeic = profileName.toLowerCase().includes('geic');

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
      gender: isGeic ? 'female' : 'male',
      weightKg: isGeic ? 64 : 82,
      heightCm: isGeic ? 165 : 178,
      age: 29,
      targetWeightKg: isGeic ? 58 : 76,
      goal: isGeic ? 'recomp' : 'fat_loss',
      activityFactor: 1.55,
      customDailyDeficit: 400,
      waterGoalMl: 2800
    };
  });

  const [editingProfile, setEditingProfile] = useState(false);

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

  // Modal para adicionar alimento customizado
  const [addingToMealId, setAddingToMealId] = useState<string | null>(null);
  const [customFoodName, setCustomFoodName] = useState('');
  const [customPortion, setCustomPortion] = useState('1 porção');
  const [customCalories, setCustomCalories] = useState<number | null>(null);
  const [customProtein, setCustomProtein] = useState<number | null>(null);
  const [customCarbs, setCustomCarbs] = useState<number | null>(null);
  const [customFat, setCustomFat] = useState<number | null>(null);

  // Persistência automática
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`hitfit-bio-${profileId}`, JSON.stringify(profile));
      localStorage.setItem(`hitfit-meals-${todayDate}-${profileId}`, JSON.stringify(meals));
    } catch {}
  }, [profile, meals, profileId, todayDate]);

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

  const netEnergyBalance = totalCaloriesConsumed - actualDailyBurn.totalDailyBurn;
  const isDeficit = netEnergyBalance < 0;
  const currentDeficitKcal = Math.abs(netEnergyBalance);

  const handleAddQuickFood = (mealId: string, food: FoodItem) => {
    if (isReadOnly) return;
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
    if (isReadOnly || !customFoodName.trim()) return;
    const item: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customFoodName.trim(),
      portion: customPortion.trim() || '1 porção',
      calories: customCalories || 0,
      protein: customProtein || 0,
      carbs: customCarbs || 0,
      fat: customFat || 0
    };
    handleAddQuickFood(mealId, item);
    setCustomFoodName('');
    setCustomCalories(null);
    setCustomProtein(null);
    setCustomCarbs(null);
    setCustomFat(null);
  };

  const handleRemoveFood = (mealId: string, itemId: string) => {
    if (isReadOnly) return;
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
    <div className="flex flex-col gap-5 text-neutral-100 pb-20 animate-in fade-in">
      
      {/* MODO SOMENTE LEITURA */}
      {isReadOnly && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Lock size={15} />
            <span className="font-bold">Modo Somente Leitura (Nutrição de {profileName})</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider font-black px-2 py-0.5 rounded bg-amber-500/20">
            Bloqueado
          </span>
        </div>
      )}

      {/* CABEÇALHO DO PERFIL NUTRICIONAL */}
      <div className="flex items-center justify-between bg-[#0E121A] p-4 rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-lg">
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
              <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
                DIÁRIO NUTRICIONAL
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

        {!isReadOnly && (
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 transition-all border border-white/10 tap-haptic"
          >
            {editingProfile ? 'Concluir' : 'Editar Metas'}
          </button>
        )}
      </div>

      {/* FORMULÁRIO DE BIOMETRIA */}
      {editingProfile && !isReadOnly && (
        <div className="p-4 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.12)] grid grid-cols-2 gap-3 text-xs animate-in fade-in">
          <label className="flex flex-col gap-1 text-[10px] font-mono text-neutral-400">
            <span>Peso Atual (kg):</span>
            <NumericInput
              value={profile.weightKg}
              allowDecimals={true}
              placeholder="Ex: 82"
              onChangeValue={(val) => {
                if (val && val > 0) setProfile({ ...profile, weightKg: val });
              }}
              className="bg-[#07090C] border border-white/15 rounded-xl p-2.5 text-white font-mono font-bold text-sm outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-mono text-neutral-400">
            <span>Meta de Peso (kg):</span>
            <NumericInput
              value={profile.targetWeightKg}
              allowDecimals={true}
              placeholder="Ex: 76"
              onChangeValue={(val) => {
                if (val && val > 0) setProfile({ ...profile, targetWeightKg: val });
              }}
              className="bg-[#07090C] border border-white/15 rounded-xl p-2.5 text-white font-mono font-bold text-sm outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-mono text-neutral-400">
            <span>Altura (cm):</span>
            <NumericInput
              value={profile.heightCm}
              allowDecimals={false}
              placeholder="Ex: 178"
              onChangeValue={(val) => {
                if (val && val > 0) setProfile({ ...profile, heightCm: val });
              }}
              className="bg-[#07090C] border border-white/15 rounded-xl p-2.5 text-white font-mono font-bold text-sm outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-mono text-neutral-400">
            <span>Idade (anos):</span>
            <NumericInput
              value={profile.age}
              allowDecimals={false}
              placeholder="Ex: 29"
              onChangeValue={(val) => {
                if (val && val > 0) setProfile({ ...profile, age: val });
              }}
              className="bg-[#07090C] border border-white/15 rounded-xl p-2.5 text-white font-mono font-bold text-sm outline-none"
            />
          </label>
        </div>
      )}

      {/* BALANÇO ENERGÉTICO & GASTO DIÁRIO */}
      <div className="p-5 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-amber-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Balanço Energético do Dia
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            {todayWorkoutCaloriesBurned > 0 ? 'Ajustado via Relógio' : 'TDEE Planejado'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.04]">
            <span className="text-[8px] font-mono uppercase text-neutral-400 block">CONSUMIDO</span>
            <strong className="text-base font-mono font-bold text-white mt-0.5 block">{totalCaloriesConsumed} kcal</strong>
          </div>
          <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.04]">
            <span className="text-[8px] font-mono uppercase text-neutral-400 block">GASTO TOTAL</span>
            <strong className="text-base font-mono font-bold text-amber-300 mt-0.5 block">{actualDailyBurn.totalDailyBurn} kcal</strong>
          </div>
          <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.04]">
            <span className="text-[8px] font-mono uppercase text-neutral-400 block">{isDeficit ? 'DÉFICIT' : 'SUPERÁVIT'}</span>
            <strong className={`text-base font-mono font-black mt-0.5 block ${isDeficit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isDeficit ? `-${currentDeficitKcal}` : `+${netEnergyBalance}`} kcal
            </strong>
          </div>
        </div>

        {/* METAS DE MACRONUTRIENTES */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
          <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">Metas de Macronutrientes</span>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex flex-col gap-0.5">
              <span className="text-[9px] uppercase text-emerald-400/80">PROTEÍNA</span>
              <strong className="font-bold">{totalProteinConsumed} / {targets.targetProteinG}g</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex flex-col gap-0.5">
              <span className="text-[9px] uppercase text-amber-400/80">CARBOS</span>
              <strong className="font-bold">{totalCarbsConsumed} / {targets.targetCarbsG}g</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 flex flex-col gap-0.5">
              <span className="text-[9px] uppercase text-sky-400/80">GORDURAS</span>
              <strong className="font-bold">{totalFatConsumed} / {targets.targetFatG}g</strong>
            </div>
          </div>
        </div>
      </div>

      {/* REFEIÇÕES DO DIA */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 px-1">
          Refeições ({meals.length})
        </span>

        {meals.map((meal) => {
          const mealCals = meal.items.reduce((s, it) => s + it.calories, 0);

          return (
            <div
              key={meal.id}
              className="p-4 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.06)] flex flex-col gap-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white">{meal.name}</h4>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {meal.items.length} itens · {mealCals} kcal
                  </span>
                </div>

                {!isReadOnly && (
                  <button
                    onClick={() => setAddingToMealId(meal.id)}
                    className="py-1.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono font-bold text-white flex items-center gap-1 border border-white/10 tap-haptic"
                  >
                    <Plus size={13} style={{ color: accentColor }} />
                    <span>Adicionar</span>
                  </button>
                )}
              </div>

              {meal.items.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.04]">
                  {meal.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-xl bg-[#07090C] border border-white/[0.03] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="text-white font-bold block">{item.name}</span>
                        <span className="text-[9px] text-neutral-400 font-mono">
                          {item.portion} · {item.calories} kcal (P: {item.protein}g · C: {item.carbs}g · G: {item.fat}g)
                        </span>
                      </div>

                      {!isReadOnly && (
                        <button
                          onClick={() => handleRemoveFood(meal.id, item.id)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 tap-haptic"
                          aria-label="Remover alimento"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL PARA ADICIONAR ALIMENTO */}
      {addingToMealId && !isReadOnly && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setAddingToMealId(null)}
        >
          <div
            className="w-full max-w-md bg-[#0E121A] border border-[rgba(255,255,255,0.12)] rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-neutral-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-base font-bold text-white">Adicionar Alimento</h3>
              <button onClick={() => setAddingToMealId(null)} className="text-xs text-neutral-400 hover:text-white p-1">✕</button>
            </div>

            {/* Catálogo Rápido */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                Alimentos Rápidos de Academia:
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {QUICK_FOODS_CATALOG.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleAddQuickFood(addingToMealId, food)}
                    className="p-2.5 text-left rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex flex-col gap-0.5 transition-all tap-haptic"
                  >
                    <span className="text-xs font-bold text-white truncate">{food.name}</span>
                    <span className="text-[9px] text-neutral-400 font-mono">{food.portion} · {food.calories} kcal</span>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold">{food.protein}g proteína</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cadastro Customizado com NumericInput */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                Ou Cadastre Outro Alimento:
              </span>
              <input
                type="text"
                placeholder="Nome do alimento (ex: Omelete de 3 ovos)"
                value={customFoodName}
                onChange={(e) => setCustomFoodName(e.target.value)}
                className="p-2.5 bg-[#07090C] border border-white/15 rounded-xl text-xs text-white outline-none"
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Porção (ex: 200g)"
                  value={customPortion}
                  onChange={(e) => setCustomPortion(e.target.value)}
                  className="p-2 bg-[#07090C] border border-white/15 rounded-xl text-white outline-none"
                />
                <NumericInput
                  placeholder="Calorias (kcal)"
                  value={customCalories}
                  allowDecimals={false}
                  onChangeValue={(val) => setCustomCalories(val)}
                  className="p-2 bg-[#07090C] border border-white/15 rounded-xl text-white font-mono font-bold outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <NumericInput
                  placeholder="Prot (g)"
                  value={customProtein}
                  allowDecimals={true}
                  onChangeValue={(val) => setCustomProtein(val)}
                  className="p-2 bg-[#07090C] border border-white/15 rounded-xl text-emerald-300 font-mono outline-none"
                />
                <NumericInput
                  placeholder="Carb (g)"
                  value={customCarbs}
                  allowDecimals={true}
                  onChangeValue={(val) => setCustomCarbs(val)}
                  className="p-2 bg-[#07090C] border border-white/15 rounded-xl text-amber-300 font-mono outline-none"
                />
                <NumericInput
                  placeholder="Gord (g)"
                  value={customFat}
                  allowDecimals={true}
                  onChangeValue={(val) => setCustomFat(val)}
                  className="p-2 bg-[#07090C] border border-white/15 rounded-xl text-sky-300 font-mono outline-none"
                />
              </div>

              <button
                onClick={() => handleAddCustomFood(addingToMealId)}
                disabled={!customFoodName.trim()}
                className="mt-2 py-3 rounded-xl font-bold text-xs text-black shadow-md disabled:opacity-40 tap-haptic"
                style={{ backgroundColor: accentColor }}
              >
                Adicionar Alimento à Refeição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AVISO CIENTÍFICO */}
      <div className="p-4 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.06)] text-xs text-neutral-400 leading-relaxed flex flex-col gap-1.5 shadow-md">
        <span className="font-bold text-neutral-200 flex items-center gap-1.5">
          <Layers size={14} style={{ color: accentColor }} />
          Diretriz Científica de Recomposição
        </span>
        <p className="text-[11px]">
          Metas calculadas pela equação de Mifflin-St Jeor com balanço dinâmico. Estes valores são estimativas de engenharia nutricional e não substituem prescrição médica.
        </p>
      </div>

    </div>
  );
}
