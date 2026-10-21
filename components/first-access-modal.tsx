"use client";

import React, { useState, useId } from 'react';
import { Sparkles, Camera, Upload, AlertCircle, ArrowRight, UserCheck, Calendar } from 'lucide-react';
import { NumericInput } from '@/components/ui/numeric-input';
import { compressAndCropAvatar, saveAvatar } from '@/lib/avatar-storage';
import { updateAthleteProfile, AuthenticatedUser } from '@/lib/auth-client';
import { calculateAge } from '@/lib/auth-crypto';

interface FirstAccessModalProps {
  user: AuthenticatedUser;
  onCompleted: (updatedUser: AuthenticatedUser) => void;
}

export function FirstAccessModal({ user, onCompleted }: FirstAccessModalProps) {
  const isJack = user.username === 'jack' || user.id === 'person-geicsania';
  const accentColor = isJack ? '#FF267A' : '#C4F53C';

  const [birthDate, setBirthDate] = useState(user.birthDate || '');
  const [weightKg, setWeightKg] = useState<number | null>(user.initialWeightKg || null);
  const [heightCm, setHeightCm] = useState<number | null>(user.heightCm || null);
  const [targetWeightKg, setTargetWeightKg] = useState<number | null>(null);
  const [goal, setGoal] = useState(user.goal || (isJack ? 'Recomposição Corporal' : 'Emagrecimento & Definição'));
  const [activityLevel, setActivityLevel] = useState(user.activityLevel || 'Moderado (3-4x por semana)');

  // Foto de perfil
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const galleryInputId = useId();
  const cameraInputId = useId();

  const computedAge = birthDate ? calculateAge(birthDate) : null;

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressAndCropAvatar(file);
      setAvatarPreview(compressed);
      setAvatarBase64(compressed);
    } catch {
      setErrorMessage('Falha ao processar a foto de perfil. Tente outra imagem.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!birthDate) {
      setErrorMessage('Informe sua data de nascimento.');
      return;
    }

    if (!weightKg || weightKg <= 0) {
      setErrorMessage('Informe seu peso atual em kg.');
      return;
    }

    if (!heightCm || heightCm <= 0) {
      setErrorMessage('Informe sua altura em cm.');
      return;
    }

    setLoading(true);

    try {
      const res = await updateAthleteProfile({
        userId: user.id,
        birthDate,
        initialWeightKg: weightKg,
        heightCm,
        targetWeightKg,
        goal,
        activityLevel,
        avatarBase64
      });

      if (!res.success || !res.user) {
        setLoading(false);
        setErrorMessage(res.error || 'Falha ao salvar a ficha biométrica.');
        return;
      }

      // Salva avatar no IndexedDB local para carregamento instantâneo
      if (avatarBase64) {
        await saveAvatar(user.id, avatarBase64);
      }

      onCompleted(res.user);
    } catch (err) {
      setLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao processar dados.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0E121A] border border-white/10 rounded-3xl p-6 shadow-2xl my-8">
        
        {/* CABEÇALHO */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg border"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}50`,
              color: accentColor
            }}
          >
            <UserCheck size={22} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-black tracking-widest text-neutral-400 block">
              PRIMEIRO ACESSO · FICHA DE ATLETA
            </span>
            <h2 className="text-xl font-black text-white">
              Bem-vindo(a), {user.name}!
            </h2>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed mb-5">
          Configure sua biometria inicial. Esses dados são preenchidos apenas uma vez e poderão ser ajustados posteriormente na sua aba Perfil.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in shake">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* FOTO DE PERFIL */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#07090C] border border-white/10">
            <div
              className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-black text-xl shrink-0 overflow-hidden shadow-md"
              style={{
                borderColor: accentColor,
                backgroundColor: `${accentColor}15`,
                color: accentColor
              }}
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name[0]
              )}
            </div>

            <div className="flex-1">
              <span className="text-xs font-bold text-white block mb-1">Foto de Perfil</span>
              <p className="text-[10px] text-neutral-400 mb-2 leading-tight">
                Tire uma foto ou envie da galeria (salva localmente e sincronizada).
              </p>

              <div className="flex items-center gap-2">
                <label
                  htmlFor={cameraInputId}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Camera size={12} />
                  <span>Câmera</span>
                  <input
                    id={cameraInputId}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={handleAvatarFile}
                  />
                </label>

                <label
                  htmlFor={galleryInputId}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Upload size={12} />
                  <span>Galeria</span>
                  <input
                    id={galleryInputId}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFile}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* DATA DE NASCIMENTO & IDADE */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-[11px] font-mono font-bold text-neutral-300">
              <span className="flex items-center gap-1">
                <Calendar size={12} style={{ color: accentColor }} />
                <span>Nascimento:</span>
              </span>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="p-3 bg-[#07090C] border border-white/15 rounded-2xl text-white font-mono font-bold text-xs outline-none focus:border-white/40"
              />
            </label>

            <div className="flex flex-col gap-1 text-[11px] font-mono font-bold text-neutral-300">
              <span>Idade Calculada:</span>
              <div className="p-3 bg-[#07090C] border border-white/10 rounded-2xl text-neutral-300 font-mono font-bold text-xs flex items-center justify-between">
                <span>{computedAge !== null ? `${computedAge} anos` : 'Informe a data'}</span>
                {computedAge !== null && <Sparkles size={13} style={{ color: accentColor }} />}
              </div>
            </div>
          </div>

          {/* PESO ATUAL E ALTURA (NUMERICINPUT SEM BUG DO ZERO) */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-[11px] font-mono font-bold text-neutral-300">
              <span>Peso Atual (kg):</span>
              <NumericInput
                value={weightKg}
                allowDecimals={true}
                placeholder="Ex: 75,5"
                onChangeValue={(val) => setWeightKg(val)}
                className="p-3 bg-[#07090C] border border-white/15 rounded-2xl text-white font-mono font-bold text-sm outline-none focus:border-white/40"
              />
            </label>

            <label className="flex flex-col gap-1 text-[11px] font-mono font-bold text-neutral-300">
              <span>Altura (cm):</span>
              <NumericInput
                value={heightCm}
                allowDecimals={false}
                placeholder="Ex: 175"
                onChangeValue={(val) => setHeightCm(val)}
                className="p-3 bg-[#07090C] border border-white/15 rounded-2xl text-white font-mono font-bold text-sm outline-none focus:border-white/40"
              />
            </label>
          </div>

          {/* META DE PESO (OPCIONAL) */}
          <label className="flex flex-col gap-1 text-[11px] font-mono font-bold text-neutral-300">
            <span>Meta de Peso Desejada (kg) - Opcional:</span>
            <NumericInput
              value={targetWeightKg}
              allowDecimals={true}
              placeholder="Ex: 70,0"
              onChangeValue={(val) => setTargetWeightKg(val)}
              className="p-3 bg-[#07090C] border border-white/15 rounded-2xl text-white font-mono font-bold text-sm outline-none focus:border-white/40"
            />
          </label>

          {/* OBJETIVO FISIOLÓGICO */}
          <label className="flex flex-col gap-1 text-[11px] font-mono font-bold text-neutral-300">
            <span>Objetivo Principal:</span>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="p-3 bg-[#07090C] border border-white/15 rounded-2xl text-white font-bold text-xs outline-none"
            >
              <option value="Emagrecimento & Definição">Emagrecimento & Definição</option>
              <option value="Recomposição Corporal">Recomposição Corporal</option>
              <option value="Ganho de Massa Magra">Ganho de Massa Magra</option>
            </select>
          </label>

          {/* NÍVEL DE ATIVIDADE */}
          <label className="flex flex-col gap-1 text-[11px] font-mono font-bold text-neutral-300">
            <span>Nível de Atividade Física:</span>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="p-3 bg-[#07090C] border border-white/15 rounded-2xl text-white font-bold text-xs outline-none"
            >
              <option value="Sedentário (pouco exercício)">Sedentário (pouco exercício)</option>
              <option value="Leve (1-2x por semana)">Leve (1-2x por semana)</option>
              <option value="Moderado (3-4x por semana)">Moderado (3-4x por semana)</option>
              <option value="Intenso (5-6x por semana)">Intenso (5-6x por semana)</option>
            </select>
          </label>

          {/* BOTÃO CONCLUIR */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-4 rounded-2xl font-black text-sm text-black flex items-center justify-center gap-2 shadow-xl transition-all tap-haptic disabled:opacity-40"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 4px 20px -2px ${accentColor}40`
            }}
          >
            {loading ? (
              <span>Salvando Ficha...</span>
            ) : (
              <>
                <span>Concluir e Começar os Treinos</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
