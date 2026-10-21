"use client";

import React, { useState, useEffect } from 'react';
import { Target, Edit3 } from 'lucide-react';
import { NumericInput } from '@/components/ui/numeric-input';
import { getUnifiedBiometrics, saveUnifiedBiometrics } from '@/lib/biometrics';

interface WeightGoalData {
  initialWeightKg: number | null;
  targetWeightKg: number | null;
  objective: 'fat_loss' | 'recomp' | 'hypertrophy';
  updatedAt: string;
}

interface WeightGoalViewProps {
  profileId: string;
  athleteName: string;
  accentColor: string;
  currentWeightKg: number;
  isReadOnly?: boolean;
}

export function WeightGoalView({
  profileId,
  athleteName,
  accentColor,
  currentWeightKg,
  isReadOnly = false
}: WeightGoalViewProps) {
  const isJack = athleteName.toLowerCase().includes('jack') || athleteName.toLowerCase().includes('geic') || profileId === 'person-geicsania';

  const [goal, setGoal] = useState<WeightGoalData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hitfit-goal-${profileId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.targetWeightKg || parsed.initialWeightKg)) return parsed;
        }
      } catch {}
    }
    // Seed a partir da biometria cadastrada
    const bio = getUnifiedBiometrics(profileId);
    return {
      initialWeightKg: bio.initialWeightKg > 0 ? bio.initialWeightKg : (currentWeightKg > 0 ? currentWeightKg : null),
      targetWeightKg: bio.targetWeightKg > 0 ? bio.targetWeightKg : null,
      objective: (bio.goal as WeightGoalData['objective']) || (isJack ? 'recomp' : 'fat_loss'),
      updatedAt: new Date().toISOString()
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempInitial, setTempInitial] = useState<number | null>(goal.initialWeightKg);
  const [tempTarget, setTempTarget] = useState<number | null>(goal.targetWeightKg);
  const [tempObjective, setTempObjective] = useState(goal.objective);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`hitfit-goal-${profileId}`, JSON.stringify(goal));
    } catch {}
  }, [goal, profileId]);

  const handleSaveGoal = () => {
    if (isReadOnly || !tempTarget || tempTarget <= 0) return;

    const initial = tempInitial && tempInitial > 0 ? tempInitial : (currentWeightKg > 0 ? currentWeightKg : null);
    const updatedGoal: WeightGoalData = {
      initialWeightKg: initial,
      targetWeightKg: tempTarget,
      objective: tempObjective,
      updatedAt: new Date().toISOString()
    };

    setGoal(updatedGoal);
    saveUnifiedBiometrics(profileId, {
      initialWeightKg: initial,
      targetWeightKg: tempTarget,
      goal: tempObjective
    });
    setIsEditing(false);
  };

  // Cálculo de progresso até a meta
  const hasValidGoal = Boolean(goal.targetWeightKg && goal.initialWeightKg && goal.targetWeightKg > 0 && goal.initialWeightKg > 0);
  const totalDelta = hasValidGoal ? Math.abs((goal.targetWeightKg as number) - (goal.initialWeightKg as number)) : 0;
  const currentDelta = hasValidGoal && currentWeightKg > 0 ? Math.abs(currentWeightKg - (goal.initialWeightKg as number)) : 0;
  const progressPct = totalDelta > 0
    ? Math.min(100, Math.max(0, Math.round((currentDelta / totalDelta) * 100)))
    : (hasValidGoal ? 100 : 0);

  const diffToGoal = goal.targetWeightKg && currentWeightKg > 0
    ? Math.round(Math.abs(currentWeightKg - goal.targetWeightKg) * 10) / 10
    : 0;
  const isGoalReached = diffToGoal === 0 && Boolean(goal.targetWeightKg);

  const objectiveLabels: Record<string, string> = {
    fat_loss: 'Definição & Queima de Gordura',
    recomp: 'Recomposição Corporal',
    hypertrophy: 'Ganho de Massa Magra'
  };

  return (
    <div className="flex flex-col gap-5 text-neutral-100 pb-20 animate-in fade-in">
      
      {/* MODO SOMENTE LEITURA */}
      {isReadOnly && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <span>Modo Somente Leitura (Dados de {athleteName})</span>
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Bloqueado</span>
        </div>
      )}

      {/* CABEÇALHO */}
      <div className="flex items-center justify-between bg-[#0E121A] p-4 rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-lg">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md border"
            style={{
              backgroundColor: `${accentColor}15`,
              borderColor: `${accentColor}40`,
              color: accentColor
            }}
          >
            <Target size={24} />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase font-black tracking-widest text-neutral-400 block">
              OBJETIVO CORPORAL
            </span>
            <h2 className="text-xl font-black text-white">{athleteName}</h2>
          </div>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => {
              setTempInitial(goal.initialWeightKg);
              setTempTarget(goal.targetWeightKg);
              setTempObjective(goal.objective);
              setIsEditing(!isEditing);
            }}
            className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 flex items-center gap-1.5 transition-all tap-haptic"
          >
            <Edit3 size={13} style={{ color: accentColor }} />
            <span>{isEditing ? 'Cancelar' : 'Editar Meta'}</span>
          </button>
        )}
      </div>

      {/* FORMULÁRIO DE EDIÇÃO */}
      {isEditing && !isReadOnly && (
        <div className="p-5 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.12)] shadow-xl flex flex-col gap-4 animate-in fade-in">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
            Ajustar Parâmetros da Meta:
          </span>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-[10px] font-mono text-neutral-400">
              <span>Peso Inicial de Referência (kg):</span>
              <NumericInput
                value={tempInitial}
                allowDecimals={true}
                placeholder="Ex: 82"
                onChangeValue={(val) => setTempInitial(val)}
                className="p-3 bg-[#07090C] border border-white/15 rounded-2xl text-white font-mono font-bold text-base outline-none focus:border-white/30"
              />
            </label>

            <label className="flex flex-col gap-1 text-[10px] font-mono text-neutral-400">
              <span>Peso Desejado / Meta (kg):</span>
              <NumericInput
                value={tempTarget}
                allowDecimals={true}
                placeholder="Ex: 76"
                onChangeValue={(val) => setTempTarget(val)}
                className="p-3 bg-[#07090C] border border-white/15 rounded-2xl text-white font-mono font-bold text-base outline-none focus:border-white/30"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-[10px] font-mono text-neutral-400">
            <span>Objetivo Fisiológico:</span>
            <select
              value={tempObjective}
              onChange={(e) => setTempObjective(e.target.value as WeightGoalData['objective'])}
              className="p-3 bg-[#07090C] border border-white/15 rounded-2xl text-white font-bold text-base outline-none"
            >
              <option value="fat_loss">Definição & Queima de Gordura</option>
              <option value="recomp">Recomposição Corporal</option>
              <option value="hypertrophy">Ganho de Massa Magra</option>
            </select>
          </label>

          <button
            onClick={handleSaveGoal}
            disabled={!tempTarget || tempTarget <= 0}
            className="py-3 px-4 rounded-2xl font-bold text-xs shadow-md disabled:opacity-40 text-black transition-transform active:scale-95"
            style={{ backgroundColor: accentColor }}
          >
            Salvar e Atualizar Meta
          </button>
        </div>
      )}

      {/* CARD PRINCIPAL DA META */}
      <div className="p-6 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span
            className="text-[9px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-md border"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}40`,
              color: accentColor
            }}
          >
            {objectiveLabels[goal.objective]}
          </span>
          <span className="text-xs font-mono font-bold text-neutral-400">
            {goal.targetWeightKg
              ? (isGoalReached ? 'Meta Alcançada!' : `Faltam ${diffToGoal} kg`)
              : 'Meta pendente de configuração'}
          </span>
        </div>

        {/* 3 Pilares: Inicial -> Atual -> Meta */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2">
          <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.05]">
            <span className="text-[8px] font-mono uppercase text-neutral-400 tracking-wider block">INÍCIO</span>
            <strong className="text-lg font-mono font-black text-neutral-300 mt-0.5 block">
              {goal.initialWeightKg ? `${goal.initialWeightKg} ` : '-- '}
              <span className="text-xs font-normal">{goal.initialWeightKg ? 'kg' : ''}</span>
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.08] relative">
            <span className="text-[8px] font-mono uppercase text-neutral-400 tracking-wider block">ATUAL</span>
            <strong className="text-xl font-mono font-black text-white mt-0.5 block" style={{ color: accentColor }}>
              {currentWeightKg > 0 ? `${currentWeightKg} ` : '-- '}
              <span className="text-xs font-normal">{currentWeightKg > 0 ? 'kg' : ''}</span>
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.05]">
            <span className="text-[8px] font-mono uppercase text-neutral-400 tracking-wider block">META</span>
            <strong className="text-lg font-mono font-black text-neutral-300 mt-0.5 block">
              {goal.targetWeightKg ? `${goal.targetWeightKg} ` : '-- '}
              <span className="text-xs font-normal">{goal.targetWeightKg ? 'kg' : ''}</span>
            </strong>
          </div>
        </div>

        {/* BARRA DE PROGRESSO VISUAL */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-400">Progresso Concluído</span>
            <span className="font-black text-white" style={{ color: accentColor }}>{progressPct}%</span>
          </div>

          <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.max(4, progressPct)}%`,
                backgroundColor: accentColor,
                boxShadow: `0 0 12px ${accentColor}`
              }}
            />
          </div>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed bg-[#07090C] p-3 rounded-2xl border border-white/[0.04]">
          💡 <strong>Diretriz de Saúde:</strong> O foco está na constância, força nos treinos e recomposição gradual. Pesagens semanais no mesmo horário proporcionam as melhores leituras de tendência.
        </p>
      </div>

    </div>
  );
}
