"use client";

import React, { useState, useEffect } from 'react';
import { Droplets, Plus, Undo2, Award, Calendar } from 'lucide-react';
import { NumericInput } from '@/components/ui/numeric-input';

interface WaterLogEntry {
  id: string;
  time: string;
  ml: number;
}

interface DayWaterRecord {
  date: string; // YYYY-MM-DD
  totalMl: number;
  logs: WaterLogEntry[];
}

interface WaterViewProps {
  profileId: string;
  athleteName: string;
  accentColor: string;
  weightKg?: number;
  isReadOnly?: boolean;
}

function createWaterLogEntry(amountMl: number): WaterLogEntry {
  const now = new Date();
  return {
    id: `w-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
    time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    ml: amountMl
  };
}

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function WaterView({
  profileId,
  athleteName,
  accentColor,
  weightKg = 75,
  isReadOnly = false
}: WaterViewProps) {
  const todayStr = getTodayDateString();
  const defaultGoalMl = Math.round(weightKg * 38); // 38ml/kg

  // Carrega histórico completo de hidratação
  const [history, setHistory] = useState<DayWaterRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hitfit-water-history-${profileId}`);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  // Meta personalizada ou calculada
  const [goalMl, setGoalMl] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hitfit-water-goal-${profileId}`);
        if (stored) return Number(stored) || defaultGoalMl;
      } catch {}
    }
    return defaultGoalMl;
  });

  const [editingGoal, setEditingGoal] = useState(false);
  const [customMl, setCustomMl] = useState<number | null>(null);

  // Registro de hoje
  const todayRecord = history.find((h) => h.date === todayStr) || {
    date: todayStr,
    totalMl: 0,
    logs: []
  };

  // Salvar no localStorage sempre que histórico ou meta mudarem
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`hitfit-water-history-${profileId}`, JSON.stringify(history));
      localStorage.setItem(`hitfit-water-goal-${profileId}`, goalMl.toString());
      // Sincroniza retrocompatibilidade com hitfit-water-date-profile
      localStorage.setItem(`hitfit-water-${todayStr}-${profileId}`, todayRecord.totalMl.toString());
    } catch {}
  }, [history, goalMl, profileId, todayStr, todayRecord.totalMl]);

  const addWater = (amountMl: number) => {
    if (isReadOnly || amountMl <= 0) return;

    const newLog = createWaterLogEntry(amountMl);

    setHistory((prev) => {
      const existingIdx = prev.findIndex((h) => h.date === todayStr);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const current = updated[existingIdx];
        updated[existingIdx] = {
          ...current,
          totalMl: current.totalMl + amountMl,
          logs: [newLog, ...current.logs]
        };
        return updated;
      }
      return [
        {
          date: todayStr,
          totalMl: amountMl,
          logs: [newLog]
        },
        ...prev
      ];
    });
  };

  const undoLastWater = () => {
    if (isReadOnly || todayRecord.logs.length === 0) return;

    setHistory((prev) => {
      const existingIdx = prev.findIndex((h) => h.date === todayStr);
      if (existingIdx < 0) return prev;

      const updated = [...prev];
      const current = updated[existingIdx];
      const [removed, ...remainingLogs] = current.logs;
      updated[existingIdx] = {
        ...current,
        totalMl: Math.max(0, current.totalMl - removed.ml),
        logs: remainingLogs
      };
      return updated;
    });
  };

  const currentMl = todayRecord.totalMl;
  const remainingMl = Math.max(0, goalMl - currentMl);
  const progressPct = Math.min(100, Math.round((currentMl / Math.max(1, goalMl)) * 100));

  // Cálculo da média dos últimos 7 dias
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${day}`;
    const dayRecord = history.find((h) => h.date === dateKey);
    return {
      dayLabel: d.toLocaleDateString('pt-BR', { weekday: 'narrow' }),
      dateKey,
      totalMl: dayRecord ? dayRecord.totalMl : 0
    };
  });

  const totalLast7 = last7Days.reduce((sum, d) => sum + d.totalMl, 0);
  const weeklyAverage = Math.round(totalLast7 / 7);

  return (
    <div className="flex flex-col gap-5 text-neutral-100 pb-20 animate-in fade-in">
      
      {/* MODO SOMENTE LEITURA CASO VISUALIZANDO PARCEIRO */}
      {isReadOnly && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <span>Modo Somente Leitura (Dados de {athleteName})</span>
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Bloqueado</span>
        </div>
      )}

      {/* CABEÇALHO DO MENU */}
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
            <Droplets size={24} />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase font-black tracking-widest text-neutral-400 block">
              HIDRATAÇÃO DIÁRIA
            </span>
            <h2 className="text-xl font-black text-white">{athleteName}</h2>
          </div>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setEditingGoal(!editingGoal)}
            className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 border border-white/10 transition-all tap-haptic"
          >
            {editingGoal ? 'Concluir' : 'Ajustar Meta'}
          </button>
        )}
      </div>

      {/* FORMULÁRIO DE AJUSTE DA META */}
      {editingGoal && !isReadOnly && (
        <div className="p-4 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.1)] flex flex-col gap-3 animate-in fade-in">
          <span className="text-xs font-mono font-bold text-neutral-300">
            Meta Diária Personalizada (ml):
          </span>
          <div className="flex items-center gap-2">
            <NumericInput
              value={goalMl}
              allowDecimals={false}
              onChangeValue={(val) => {
                if (val && val > 0) setGoalMl(val);
              }}
              placeholder="Ex: 3000"
              className="flex-1 p-3 bg-[#07090C] border border-white/15 rounded-2xl text-white font-mono font-bold text-lg outline-none"
            />
            <button
              onClick={() => setEditingGoal(false)}
              className="py-3 px-5 rounded-2xl font-bold text-xs shadow-md bg-sky-400 text-black tap-haptic"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* RECIPIENTE DE VIDRO COM ANIMAÇÃO LÍQUIDA INTERATIVA */}
      <div className="relative p-6 rounded-3xl bg-[#0D121B] border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col items-center justify-center overflow-hidden">
        
        {/* Luz ambiente azulada */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-sky-500/10 pointer-events-none" />

        {/* Cilindro Hidráulico com Nível Líquido Reativo */}
        <div className="relative w-44 h-56 rounded-3xl border-2 border-sky-400/30 bg-[#07090C]/80 shadow-[inset_0_0_20px_rgba(14,165,233,0.2)] overflow-hidden flex flex-col justify-end p-2">
          
          {/* Marcadores de Volume no Cilindro */}
          <div className="absolute top-4 right-2 text-[9px] font-mono text-sky-400/60 font-bold">100%</div>
          <div className="absolute top-1/2 -translate-y-1/2 right-2 text-[9px] font-mono text-sky-400/40 font-bold">50%</div>
          <div className="absolute bottom-4 right-2 text-[9px] font-mono text-sky-400/30 font-bold">0%</div>

          {/* O Líquido Dinâmico com Altura Calculada */}
          <div
            className="w-full rounded-2xl transition-all duration-700 ease-out relative overflow-hidden"
            style={{
              height: `${Math.max(8, progressPct)}%`,
              background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
              boxShadow: '0 0 25px rgba(56,189,248,0.4)'
            }}
          >
            {/* Linha de onda superior brilhante */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/70 animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.3),transparent_70%)]" />
          </div>

          {/* Leitura Central de Porcentagem & Volume */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center drop-shadow-md">
            <span className="text-3xl font-black font-mono tracking-tight text-white leading-none">
              {progressPct}%
            </span>
            <span className="text-xs font-mono font-bold text-sky-200 mt-1">
              {currentMl} / {goalMl} ml
            </span>
          </div>
        </div>

        {/* Telemetria Segmentada */}
        <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-4 border-t border-white/[0.06] text-center">
          <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[8px] font-mono uppercase text-neutral-400 tracking-wider block">CONSUMIDO</span>
            <strong className="text-sm font-mono font-black text-white mt-0.5 block">{currentMl} ml</strong>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[8px] font-mono uppercase text-neutral-400 tracking-wider block">RESTANTE</span>
            <strong className="text-sm font-mono font-black text-sky-300 mt-0.5 block">{remainingMl} ml</strong>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[8px] font-mono uppercase text-neutral-400 tracking-wider block">META</span>
            <strong className="text-sm font-mono font-black text-neutral-300 mt-0.5 block">{goalMl} ml</strong>
          </div>
        </div>

      </div>

      {/* BOTÕES DE REGISTRO RÁPIDO */}
      {!isReadOnly && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              Registrar Hidratação
            </span>
            {todayRecord.logs.length > 0 && (
              <button
                onClick={undoLastWater}
                className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 tap-haptic"
              >
                <Undo2 size={13} />
                <span>Desfazer último</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[150, 250, 500].map((ml) => (
              <button
                key={ml}
                onClick={() => addWater(ml)}
                className="py-3 px-2 rounded-2xl bg-[#0E121A] hover:bg-[#151A24] border border-[rgba(255,255,255,0.08)] flex flex-col items-center justify-center gap-1 transition-all tap-haptic shadow-md"
              >
                <span className="text-xs font-mono font-black text-sky-400">+{ml} ml</span>
                <span className="text-[9px] text-neutral-400 font-medium">
                  {ml === 150 ? 'Copo pequeno' : ml === 250 ? 'Copo médio' : 'Garrafa'}
                </span>
              </button>
            ))}
          </div>

          {/* Adicionar Quantidade Personalizada */}
          <div className="p-3 rounded-2xl bg-[#0E121A] border border-[rgba(255,255,255,0.08)] flex items-center gap-2">
            <NumericInput
              value={customMl}
              allowDecimals={false}
              onChangeValue={(val) => setCustomMl(val)}
              placeholder="Qtd personalizada (ex: 350)"
              className="flex-1 p-2.5 bg-[#07090C] border border-white/10 rounded-xl text-white font-mono font-bold text-sm outline-none"
            />
            <button
              onClick={() => {
                if (customMl && customMl > 0) {
                  addWater(customMl);
                  setCustomMl(null);
                }
              }}
              disabled={!customMl || customMl <= 0}
              className="py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-black font-bold text-xs flex items-center gap-1 tap-haptic"
            >
              <Plus size={14} />
              <span>Adicionar</span>
            </button>
          </div>
        </div>
      )}

      {/* GRÁFICO DOS ÚLTIMOS 7 DIAS & MÉDIA */}
      <div className="p-5 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.08)] shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-sky-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Histórico dos Últimos 7 Dias
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-neutral-400">
            Média: <strong className="text-sky-300">{weeklyAverage} ml/dia</strong>
          </span>
        </div>

        {/* Barras do Histórico Semanal */}
        <div className="grid grid-cols-7 gap-1.5 pt-4 items-end h-28 border-b border-white/[0.06] pb-2">
          {last7Days.map((d, i) => {
            const barHeightPct = Math.min(100, Math.round((d.totalMl / Math.max(1, goalMl)) * 100));
            const isToday = d.dateKey === todayStr;

            return (
              <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[8px] font-mono text-neutral-400">
                  {d.totalMl > 0 ? `${Math.round(d.totalMl / 100) / 10}L` : '0'}
                </span>
                <div className="w-full bg-white/[0.04] rounded-lg h-16 flex flex-col justify-end p-0.5">
                  <div
                    className={`w-full rounded-md transition-all duration-500 ${
                      isToday ? 'bg-sky-400' : 'bg-sky-500/50'
                    }`}
                    style={{ height: `${Math.max(6, barHeightPct)}%` }}
                  />
                </div>
                <span className={`text-[10px] font-mono ${isToday ? 'font-black text-sky-400' : 'text-neutral-400'}`}>
                  {d.dayLabel}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1">
          <span>Meta: {goalMl} ml</span>
          <span className="flex items-center gap-1">
            <Award size={12} className="text-amber-400" />
            {currentMl >= goalMl ? 'Meta de hoje batida!' : `Faltam ${remainingMl} ml`}
          </span>
        </div>
      </div>

    </div>
  );
}
