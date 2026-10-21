"use client";

import React, { useState, useEffect } from 'react';
import { Scale, Plus, Trash2, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { NumericInput } from '@/components/ui/numeric-input';
import { getUnifiedBiometrics, saveUnifiedBiometrics } from '@/lib/biometrics';

export interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  notes?: string;
}

interface WeightViewProps {
  profileId: string;
  athleteName: string;
  accentColor: string;
  isReadOnly?: boolean;
  onWeightUpdated?: (latestKg: number) => void;
}

export function WeightView({
  profileId,
  athleteName,
  accentColor,
  isReadOnly = false,
  onWeightUpdated
}: WeightViewProps) {
  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [history, setHistory] = useState<WeightRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hitfit-weight-history-${profileId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    // Seed com o peso cadastrado do atleta se não houver histórico
    const bio = getUnifiedBiometrics(profileId);
    if (bio.currentWeightKg > 0) {
      const today = new Date().toISOString().split('T')[0];
      return [{
        id: `w-init-${Date.now()}`,
        date: today,
        weightKg: bio.currentWeightKg,
        notes: 'Peso inicial cadastrado'
      }];
    }
    return [];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [inputWeight, setInputWeight] = useState<number | null>(null);
  const [inputDate, setInputDate] = useState(getTodayStr());

  // Salvar no localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`hitfit-weight-history-${profileId}`, JSON.stringify(history));
    } catch {}
  }, [history, profileId]);

  // Ordena por data decrescente (mais recente primeiro)
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestRecord = sortedHistory[0] || null;
  const oldestRecord = sortedHistory[sortedHistory.length - 1] || null;

  // Notifica o app sobre a pesagem mais recente
  useEffect(() => {
    if (latestRecord && onWeightUpdated) {
      onWeightUpdated(latestRecord.weightKg);
    }
  }, [latestRecord, onWeightUpdated]);

  const handleAddWeight = () => {
    if (isReadOnly || !inputWeight || inputWeight <= 0) return;

    const newRecord: WeightRecord = {
      id: `w-${Date.now()}`,
      date: inputDate || getTodayStr(),
      weightKg: inputWeight
    };

    setHistory((prev) => [newRecord, ...prev]);
    saveUnifiedBiometrics(profileId, { currentWeightKg: inputWeight, weightKg: inputWeight });
    onWeightUpdated?.(inputWeight);
    setInputWeight(null);
    setIsAdding(false);
  };

  const handleDeleteWeight = (id: string) => {
    if (isReadOnly) return;
    setHistory((prev) => prev.filter((r) => r.id !== id));
  };

  // Cálculo de variação total
  const totalChangeKg = latestRecord && oldestRecord && history.length > 1
    ? Math.round((latestRecord.weightKg - oldestRecord.weightKg) * 10) / 10
    : 0;

  // Formatação de data em padrão brasileiro
  const formatDateBR = (iso: string) => {
    try {
      const [y, m, d] = iso.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return iso;
    }
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
            <Scale size={24} />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase font-black tracking-widest text-neutral-400 block">
              ACOMPANHAMENTO DE PESO
            </span>
            <h2 className="text-xl font-black text-white">{athleteName}</h2>
          </div>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 flex items-center gap-1.5 transition-all tap-haptic"
          >
            <Plus size={14} style={{ color: accentColor }} />
            <span>{isAdding ? 'Fechar' : 'Nova Pesagem'}</span>
          </button>
        )}
      </div>

      {/* FORMULÁRIO DE NOVA PESAGEM */}
      {isAdding && !isReadOnly && (
        <div className="p-4 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.1)] flex flex-col gap-3 animate-in fade-in">
          <span className="text-xs font-mono font-bold text-neutral-300">
            Registrar Nova Pesagem:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
              <span>Peso (kg):</span>
              <NumericInput
                value={inputWeight}
                allowDecimals={true}
                placeholder="Ex: 82,5"
                onChangeValue={(val) => setInputWeight(val)}
                className="p-3 bg-[#07090C] border border-white/15 rounded-2xl text-white font-mono font-bold text-base outline-none focus:border-white/30"
              />
            </label>

            <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
              <span>Data da Medição:</span>
              <input
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="p-3 bg-[#07090C] border border-white/15 rounded-2xl text-white font-mono font-bold text-base outline-none"
              />
            </label>
          </div>

          <button
            onClick={handleAddWeight}
            disabled={!inputWeight || inputWeight <= 0}
            className="py-3 px-4 rounded-2xl font-bold text-xs shadow-md disabled:opacity-40 text-black transition-transform active:scale-95 mt-1"
            style={{ backgroundColor: accentColor }}
          >
            Salvar Pesagem
          </button>
        </div>
      )}

      {/* ESTADO VAZIO (SE NENHUMA PESAGEM EXISTE) */}
      {sortedHistory.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.06)] flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center text-neutral-400">
            <Scale size={28} />
          </div>
          <h3 className="text-base font-bold text-white">Nenhuma pesagem registrada</h3>
          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
            Registre sua primeira pesagem para iniciar o gráfico de tendência e acompanhar a evolução corporal com precisão.
          </p>
          {!isReadOnly && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 py-2.5 px-4 rounded-xl text-xs font-bold text-black shadow-md tap-haptic"
              style={{ backgroundColor: accentColor }}
            >
              Registrar Primeiro Peso
            </button>
          )}
        </div>
      ) : (
        <>
          {/* CARD DE ÚLTIMO PESO & VARIAÇÃO */}
          <div className="p-5 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">
                Última Medição ({latestRecord ? formatDateBR(latestRecord.date) : ''})
              </span>
              {history.length > 1 && (
                <div
                  className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    totalChangeKg < 0
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : totalChangeKg > 0
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-white/10 text-neutral-300'
                  }`}
                >
                  {totalChangeKg < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                  <span>{totalChangeKg > 0 ? `+${totalChangeKg}` : totalChangeKg} kg total</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <strong className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {latestRecord?.weightKg}
              </strong>
              <span className="text-base font-mono text-neutral-400 font-bold">kg</span>
            </div>

            {/* GRÁFICO DE TENDÊNCIA SVG */}
            {sortedHistory.length >= 2 && (
              <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-1.5">
                <span className="text-[9px] font-mono text-neutral-400 uppercase">Linha de Tendência</span>
                <div className="h-20 w-full flex items-center justify-center">
                  <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible">
                    {(() => {
                      const points = [...sortedHistory].reverse().slice(-10);
                      const minW = Math.min(...points.map((p) => p.weightKg)) - 1;
                      const maxW = Math.max(...points.map((p) => p.weightKg)) + 1;
                      const range = Math.max(1, maxW - minW);

                      const coords = points.map((p, idx) => {
                        const x = (idx / Math.max(1, points.length - 1)) * 280 + 10;
                        const y = 70 - ((p.weightKg - minW) / range) * 60;
                        return { x, y, kg: p.weightKg, date: p.date };
                      });

                      const pathD = coords.reduce(
                        (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
                        ''
                      );

                      return (
                        <>
                          <path
                            d={pathD}
                            fill="none"
                            stroke={accentColor}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {coords.map((pt, i) => (
                            <circle
                              key={i}
                              cx={pt.x}
                              cy={pt.y}
                              r="3.5"
                              fill="#07090C"
                              stroke={accentColor}
                              strokeWidth="2"
                            />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* LISTA DO HISTÓRICO DE PESAGENS */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 px-1">
              Histórico ({sortedHistory.length})
            </span>

            <div className="flex flex-col gap-2">
              {sortedHistory.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-2xl bg-[#0E121A] border border-[rgba(255,255,255,0.06)] flex items-center justify-between hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center text-neutral-400 font-mono text-xs">
                      <Calendar size={14} />
                    </div>
                    <div>
                      <strong className="text-sm font-mono font-black text-white">
                        {rec.weightKg} kg
                      </strong>
                      <span className="text-[10px] text-neutral-400 font-mono block">
                        {formatDateBR(rec.date)}
                      </span>
                    </div>
                  </div>

                  {!isReadOnly && (
                    <button
                      onClick={() => handleDeleteWeight(rec.id)}
                      className="p-2 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors tap-haptic"
                      aria-label="Excluir medição"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
