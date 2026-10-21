"use client";

import React, { useState } from 'react';
import { Exercise } from '@/lib/workout-data';
import { MuscleMap } from './muscle-map';
import { ExerciseAnimation } from './exercise-animation';
import { 
  X, 
  Dumbbell, 
  ShieldAlert, 
  Lightbulb, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ExerciseDetailModalProps {
  exercise: Exercise;
  accentColor?: string;
  onClose: () => void;
  onStartExercise?: () => void;
  onSwapExercise?: (targetAltName: string) => void;
}

export function ExerciseDetailModal({
  exercise,
  accentColor = '#c3f75a',
  onClose,
  onStartExercise,
  onSwapExercise
}: ExerciseDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'machines' | 'posture'>('visual');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 overflow-y-auto overflow-x-hidden"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#0d100d] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto text-neutral-100 flex flex-col gap-4 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] box-border"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Guia de ${exercise.name}`}
      >
        {/* Header com Nome e Botão Fechar */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border"
                style={{ 
                  color: accentColor, 
                  borderColor: `${accentColor}50`, 
                  backgroundColor: `${accentColor}15` 
                }}
              >
                {exercise.targetMuscle}
              </span>
              <span className="text-[11px] text-neutral-400">
                {exercise.sets} séries · {exercise.reps} reps
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {exercise.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
            aria-label="Fechar guia"
          >
            <X size={20} />
          </button>
        </div>

        {/* Abas de Navegação do Modal */}
        <div className="flex rounded-xl bg-white/5 p-1 gap-1 border border-white/5">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'visual'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles size={14} style={{ color: activeTab === 'visual' ? accentColor : undefined }} />
            Movimento & Músculo
          </button>
          <button
            onClick={() => setActiveTab('machines')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'machines'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Dumbbell size={14} style={{ color: activeTab === 'machines' ? accentColor : undefined }} />
            Máquinas na Academia
          </button>
          <button
            onClick={() => setActiveTab('posture')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'posture'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <CheckCircle2 size={14} style={{ color: activeTab === 'posture' ? accentColor : undefined }} />
            Postura & Dicas
          </button>
        </div>

        {/* CONTEÚDO DA ABA 1: VISUAL (ANIMAÇÃO 2D + MAPA MUSCULAR) */}
        {activeTab === 'visual' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Animação 2D do Movimento */}
            <ExerciseAnimation
              key={`${exercise.id}-${exercise.activeVariantId || exercise.animationKey}`}
              animationKey={exercise.animationKey}
              exerciseName={exercise.name}
              equipmentName={exercise.machines.primary.name}
              accentColor={accentColor}
            />

            {/* Mapa Anatômico 2D dos Músculos */}
            <MuscleMap
              activeFrontParts={exercise.activeBodyParts.front}
              activeBackParts={exercise.activeBodyParts.back}
              accentColor={accentColor}
            />

            {/* Resumo Anatômico */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Alvo Primário:</span>
                <span className="font-semibold" style={{ color: accentColor }}>
                  {exercise.targetMuscle}
                </span>
              </div>
              {exercise.secondaryMuscles.length > 0 && (
                <div className="flex items-center gap-2 text-neutral-400">
                  <span className="font-medium">Músculos Sinergistas:</span>
                  <span>{exercise.secondaryMuscles.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: MÁQUINAS DA ACADEMIA */}
        {activeTab === 'machines' && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
            <p className="text-xs text-neutral-400">
              Procure o modelo principal na academia. Se estiver cheio, utilize as alternativas com o mesmo estímulo muscular:
            </p>

            {/* Máquina Principal */}
            <div 
              className="p-4 rounded-2xl border flex flex-col gap-2"
              style={{ 
                backgroundColor: `${accentColor}10`,
                borderColor: `${accentColor}40`
              }}
            >
              <div className="flex items-center justify-between">
                <span 
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: accentColor, color: '#10150d' }}
                >
                  Máquina Principal Recomendada
                </span>
                <Layers size={16} style={{ color: accentColor }} />
              </div>
              <h3 className="text-base font-bold text-white">
                {exercise.machines.primary.name}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {exercise.machines.primary.description}
              </p>
              <div className="mt-1 pt-2 border-t border-white/10 text-[11px] text-neutral-300 flex items-start gap-1.5">
                <Lightbulb size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Ajuste ideal:</strong> {exercise.machines.primary.settingTips}
                </span>
              </div>
            </div>

            {/* Alternativas se a Máquina Principal estiver Ocupada */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                Alternativas (Se a máquina estiver ocupada)
              </span>
              {exercise.machines.alternatives.map((alt, i) => (
                <div 
                  key={i}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{alt.name}</h4>
                    <span className="text-[10px] font-mono text-neutral-500">OPÇÃO {i + 2}</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {alt.description}
                  </p>
                  {onSwapExercise && (
                    <button
                      type="button"
                      onClick={() => {
                        onSwapExercise(alt.variantId || alt.name);
                        setActiveTab('visual');
                      }}
                      className="mt-1 py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white flex items-center justify-center gap-1.5 transition-colors self-start border border-white/10"
                    >
                      <Sparkles size={12} style={{ color: accentColor }} />
                      <span>Trocar Exercício por este</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 3: POSTURA & DICAS DE OURO */}
        {activeTab === 'posture' && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
            {/* Como se posicionar */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                1. Posicionamento Inicial
              </span>
              <p className="text-xs text-neutral-200 leading-relaxed">
                {exercise.biomechanics.setup}
              </p>
            </div>

            {/* Execução */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                2. Movimento Correto
              </span>
              <p className="text-xs text-neutral-200 leading-relaxed">
                {exercise.biomechanics.execution}
              </p>
            </div>

            {/* Respiração */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                3. Respiração
              </span>
              <p className="text-xs text-neutral-200 leading-relaxed">
                {exercise.biomechanics.breathing}
              </p>
            </div>

            {/* Dica Profissional */}
            <div 
              className="p-3.5 rounded-xl border flex items-start gap-2.5"
              style={{ backgroundColor: `${accentColor}12`, borderColor: `${accentColor}40` }}
            >
              <Lightbulb size={18} style={{ color: accentColor }} className="shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-white block mb-0.5">Dica de Ouro:</strong>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  {exercise.biomechanics.proTip}
                </p>
              </div>
            </div>

            {/* Erro Comum a Evitar */}
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 flex items-start gap-2.5">
              <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-red-200 block mb-0.5">Erro Fatal a Evitar:</strong>
                <p className="text-xs text-red-200/90 leading-relaxed">
                  {exercise.biomechanics.commonMistake}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé com Ação */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-neutral-300 transition-colors"
          >
            Voltar ao Treino
          </button>
          <button
            onClick={() => {
              if (onStartExercise) onStartExercise();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md"
            style={{ backgroundColor: accentColor, color: '#10150d' }}
          >
            Fazer Exercício
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
