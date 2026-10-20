"use client";

import React from 'react';
import { Watch, Flame, Heart, Zap } from 'lucide-react';

interface WatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteName: string;
  accentColor: string;
  watchCalories: number;
  onUpdateCalories: (cals: number) => void;
  watchHeartRate: number;
  onUpdateHeartRate: (bpm: number) => void;
  bleConnected: boolean;
  bleDeviceName: string | null;
  onConnectBle: () => void;
}

export function WatchModal({
  isOpen,
  onClose,
  athleteName,
  accentColor,
  watchCalories,
  onUpdateCalories,
  watchHeartRate,
  onUpdateHeartRate,
  bleConnected,
  bleDeviceName,
  onConnectBle
}: WatchModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#0B0E15] border border-[rgba(255,255,255,0.1)] rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-neutral-100"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Telemetria do Relógio de ${athleteName}`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Watch size={20} style={{ color: accentColor }} />
            <h3 className="text-base font-bold text-white">Relógio de {athleteName}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white p-1"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Registre a estimativa exibida no seu Apple Watch, Galaxy Watch ou Garmin:
        </p>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-neutral-400 flex items-center gap-1 font-mono">
              <Flame size={14} className="text-amber-400" /> Calorias do Treino (Estimativa do Relógio):
            </span>
            <input
              type="number"
              value={watchCalories}
              onChange={(e) => onUpdateCalories(Number(e.target.value) || 0)}
              className="p-3 bg-[#07090C] border border-white/15 rounded-2xl text-xl font-black font-mono text-white outline-none focus:border-white/30"
              placeholder="Ex: 480"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs">
            <span className="text-neutral-400 flex items-center gap-1 font-mono">
              <Heart size={14} className="text-rose-400" /> Frequência Cardíaca Média (BPM):
            </span>
            <input
              type="number"
              value={watchHeartRate}
              onChange={(e) => onUpdateHeartRate(Number(e.target.value) || 0)}
              className="p-3 bg-[#07090C] border border-white/15 rounded-2xl text-xl font-black font-mono text-white outline-none focus:border-white/30"
              placeholder="Ex: 135"
            />
          </label>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
            <Zap size={14} style={{ color: accentColor }} />
            Sensor Cardíaco Bluetooth (BLE)
          </span>
          <p className="text-[11px] text-neutral-400">
            {bleConnected
              ? `Conectado: ${bleDeviceName}`
              : 'Compatível com cintas peitorais e braceletes BLE.'}
          </p>
          <button
            onClick={onConnectBle}
            className="py-2.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-bold text-white transition-colors"
          >
            {bleConnected ? 'Sensor Pareado ✓' : 'Conectar Sensor BLE'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="py-3.5 rounded-2xl font-bold text-xs shadow-md transition-transform active:scale-95 text-[#07090C]"
          style={{ backgroundColor: accentColor }}
        >
          Salvar Dados da Sessão
        </button>
      </div>
    </div>
  );
}
