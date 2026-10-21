"use client";

import React, { useState, useId } from 'react';
import { Dumbbell, ShieldCheck, Lock, Sparkles, Camera, Upload, AlertCircle, ArrowRight, Eye, EyeOff, Calendar } from 'lucide-react';
import { NumericInput } from '@/components/ui/numeric-input';
import { compressAndCropAvatar, saveAvatar } from '@/lib/avatar-storage';
import { registerAthlete, loginAthlete, AuthenticatedUser } from '@/lib/auth-client';

interface OnboardingAuthViewProps {
  onAuthenticated: (user: AuthenticatedUser) => void;
  onRestoreBackup?: () => void;
}

export function OnboardingAuthView({ onAuthenticated, onRestoreBackup }: OnboardingAuthViewProps) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [selectedRole, setSelectedRole] = useState<'rangel' | 'geicsania'>('rangel');

  // Campos do Cadastro
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [goal, setGoal] = useState('Emagrecimento & Definição');
  const [activityLevel, setActivityLevel] = useState('Moderado (3-4x por semana)');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  // Estado de submissão e erros
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const galleryInputId = useId();
  const cameraInputId = useId();

  const accentColor = selectedRole === 'geicsania' ? '#FF267A' : '#C4F53C';

  // Cálculo automático da idade
  const calculateAge = (dateStr: string): number | null => {
    if (!dateStr) return null;
    const b = new Date(dateStr);
    if (isNaN(b.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - b.getFullYear();
    const m = today.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < b.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const calculatedAge = calculateAge(birthDate);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressAndCropAvatar(file);
      setAvatarPreview(compressed);
      setAvatarBase64(compressed);
    } catch {
      setErrorMessage('Falha ao processar a foto. Tente outra imagem.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!password || password.length < 6) {
          setErrorMessage('A senha precisa ter no mínimo 6 caracteres.');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage('As senhas digitadas não coincidem.');
          setLoading(false);
          return;
        }

        const fallbackName = selectedRole === 'rangel' ? 'Rangel' : 'Geicsania';
        const finalName = fullName.trim() || fallbackName;

        const res = await registerAthlete({
          role: selectedRole,
          name: finalName,
          birthDate,
          initialWeightKg: weightKg ?? null,
          heightCm: heightCm ?? null,
          goal,
          activityLevel,
          password,
          avatarBase64
        });

        if (!res.success || !res.user) {
          setErrorMessage(res.error || 'Erro ao realizar cadastro.');
          setLoading(false);
          return;
        }

        // Salva avatar localmente no IndexedDB
        if (avatarBase64) {
          await saveAvatar(res.user.id, avatarBase64);
        }

        onAuthenticated(res.user);
      } else {
        // Modo Login
        if (!password) {
          setErrorMessage('Digite sua senha de acesso.');
          setLoading(false);
          return;
        }

        const res = await loginAthlete(selectedRole, password);
        if (!res.success || !res.user) {
          setErrorMessage(res.error || 'Senha incorreta.');
          setLoading(false);
          return;
        }

        onAuthenticated(res.user);
      }
    } catch {
      setErrorMessage('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg min-h-screen flex flex-col justify-center px-4 py-8 animate-in fade-in duration-300">
      
      {/* CABEÇALHO BRANDING */}
      <div className="flex flex-col items-center text-center gap-2 mb-6">
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center font-black shadow-2xl border transition-all duration-300"
          style={{
            backgroundColor: `${accentColor}18`,
            borderColor: `${accentColor}40`,
            color: accentColor
          }}
        >
          <Dumbbell size={28} />
        </div>

        <div>
          <span
            className="text-[10px] font-mono font-black tracking-widest uppercase px-3 py-1 rounded-full border inline-block mt-2"
            style={{
              backgroundColor: `${accentColor}10`,
              borderColor: `${accentColor}30`,
              color: accentColor
            }}
          >
            SISTEMA DE TREINO EM CASAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            HIT-FIT <span style={{ color: accentColor }}>DUO PRO</span>
          </h1>
          <p className="text-xs text-neutral-400 max-w-xs mt-1">
            {mode === 'register'
              ? 'Cadastro individual protegido com senha real e sincronização na nuvem.'
              : 'Acesso autenticado ao seu cockpit esportivo.'}
          </p>
        </div>
      </div>

      {/* SELETOR DE MODO (CADASTRO / LOGIN) */}
      <div className="flex bg-[#0E121A] p-1.5 rounded-2xl border border-white/10 mb-5">
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrorMessage(null);
          }}
          className={`flex-1 py-2.5 text-xs font-mono font-bold rounded-xl transition-all tap-haptic ${
            mode === 'register'
              ? 'bg-white/15 text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Criar Conta
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMessage(null);
          }}
          className={`flex-1 py-2.5 text-xs font-mono font-bold rounded-xl transition-all tap-haptic ${
            mode === 'login'
              ? 'bg-white/15 text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Entrar (Login)
        </button>
      </div>

      {/* SELETOR DE ATLETA (RANGEL / GEICSANIA) */}
      <div className="flex flex-col gap-2 mb-5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold px-1">
          Identidade do Atleta
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setSelectedRole('rangel')}
            className={`p-3.5 rounded-2xl border text-left transition-all tap-haptic flex items-center justify-between ${
              selectedRole === 'rangel'
                ? 'bg-[#0E121A] border-[#C4F53C] shadow-[0_0_15px_rgba(196,245,60,0.15)]'
                : 'bg-[#0A0D14] border-white/10 text-neutral-400 hover:border-white/20'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono text-[#C4F53C] font-bold block uppercase">
                Perfil 01
              </span>
              <strong className="text-sm font-black text-white block">Rangel</strong>
            </div>
            <div
              className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: selectedRole === 'rangel' ? '#C4F53C' : '#555' }}
            >
              {selectedRole === 'rangel' && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#C4F53C]" />
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('geicsania')}
            className={`p-3.5 rounded-2xl border text-left transition-all tap-haptic flex items-center justify-between ${
              selectedRole === 'geicsania'
                ? 'bg-[#0E121A] border-[#FF267A] shadow-[0_0_15px_rgba(255,38,122,0.15)]'
                : 'bg-[#0A0D14] border-white/10 text-neutral-400 hover:border-white/20'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono text-[#FF267A] font-bold block uppercase">
                Perfil 02
              </span>
              <strong className="text-sm font-black text-white block">Geicsania</strong>
            </div>
            <div
              className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: selectedRole === 'geicsania' ? '#FF267A' : '#555' }}
            >
              {selectedRole === 'geicsania' && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF267A]" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* MENSAGEM DE ERRO SE HOUVER */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ===================== CAMPOS EXCLUSIVOS DO CADASTRO ===================== */}
        {mode === 'register' && (
          <>
            {/* FOTO DE PERFIL */}
            <div className="p-4 rounded-2xl bg-[#0E121A] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full border-2 overflow-hidden flex items-center justify-center relative bg-black/40"
                  style={{ borderColor: accentColor }}
                >
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-black text-neutral-400">
                      {selectedRole === 'rangel' ? 'R' : 'G'}
                    </span>
                  )}
                </div>
                <div>
                  <strong className="text-xs font-bold text-white block">Foto de Perfil</strong>
                  <span className="text-[10px] text-neutral-400 block font-mono">
                    Corte circular 1:1 otimizado
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  id={galleryInputId}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
                <label
                  htmlFor={galleryInputId}
                  className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 tap-haptic cursor-pointer"
                  title="Galeria"
                >
                  <Upload size={16} />
                </label>

                <input
                  id={cameraInputId}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
                <label
                  htmlFor={cameraInputId}
                  className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 tap-haptic cursor-pointer"
                  title="Câmera"
                >
                  <Camera size={16} />
                </label>
              </div>
            </div>

            {/* NOME COMPLETO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold px-1">
                Nome do Atleta
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={selectedRole === 'rangel' ? 'Rangel Maker' : 'Geicsania'}
                className="w-full px-4 py-3 rounded-2xl bg-[#0E121A] border border-white/10 text-white placeholder-neutral-500 font-bold text-sm focus:outline-none focus:border-white/30"
              />
            </div>

            {/* DATA DE NASCIMENTO & CÁLCULO DE IDADE */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1">
                  <Calendar size={11} />
                  Data de Nascimento
                </label>
                {calculatedAge !== null && (
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border"
                    style={{
                      backgroundColor: `${accentColor}15`,
                      borderColor: `${accentColor}40`,
                      color: accentColor
                    }}
                  >
                    {calculatedAge} anos de idade
                  </span>
                )}
              </div>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#0E121A] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white/30"
              />
            </div>

            {/* PESO INICIAL E ALTURA (COM NUMERICINPUT) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold px-1">
                  Peso Inicial (kg)
                </label>
                <div className="p-1 rounded-2xl bg-[#0E121A] border border-white/10">
                  <NumericInput
                    value={weightKg}
                    onChange={setWeightKg}
                    allowDecimals={true}
                    placeholder="ex: 82,5"
                    className="w-full px-3 py-2 text-center text-sm font-mono font-bold bg-transparent text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold px-1">
                  Altura (cm)
                </label>
                <div className="p-1 rounded-2xl bg-[#0E121A] border border-white/10">
                  <NumericInput
                    value={heightCm}
                    onChange={setHeightCm}
                    allowDecimals={false}
                    placeholder="ex: 178"
                    className="w-full px-3 py-2 text-center text-sm font-mono font-bold bg-transparent text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* OBJETIVO DE TREINO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold px-1">
                Objetivo Principal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#0E121A] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-white/30"
              >
                <option value="Emagrecimento & Definição">Emagrecimento & Definição (Déficit Calórico)</option>
                <option value="Hipertrofia Muscular">Hipertrofia Muscular (Ganho de Massa)</option>
                <option value="Recomposição Corporal">Recomposição Corporal (Equilíbrio)</option>
                <option value="Condicionamento & Longevidade">Condicionamento Físico & Longevidade</option>
              </select>
            </div>

            {/* NÍVEL DE ATIVIDADE */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold px-1">
                Frequência de Treino
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#0E121A] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-white/30"
              >
                <option value="Moderado (3-4x por semana)">Moderado (3 a 4x na semana)</option>
                <option value="Intenso (5x por semana - HIT-FIT 5D)">Intenso (Ficha 5 Dias HIT-FIT)</option>
                <option value="Atleta (6-7x por semana)">Atleta de Alta Frequência (6-7x)</option>
              </select>
            </div>
          </>
        )}

        {/* SENHA (COMUM A CADASTRO E LOGIN) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1">
              <Lock size={11} />
              {mode === 'register' ? 'Criar Senha Segura' : 'Senha de Acesso'}
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-1"
            >
              {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
              <span>{showPassword ? 'Ocultar' : 'Exibir'}</span>
            </button>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full px-4 py-3 rounded-2xl bg-[#0E121A] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white/30"
          />
        </div>

        {/* CONFIRMAÇÃO DE SENHA NO CADASTRO */}
        {mode === 'register' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold px-1">
              Confirmar Senha
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              className="w-full px-4 py-3 rounded-2xl bg-[#0E121A] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white/30"
            />
          </div>
        )}

        {/* BOTÃO DE SUBMISSÃO */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-5 rounded-2xl font-black text-sm text-[#07090C] shadow-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-98 mt-2"
          style={{ backgroundColor: accentColor }}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
              <span>Processando...</span>
            </div>
          ) : (
            <>
              <span>{mode === 'register' ? 'Criar Conta e Acessar Cockpit' : 'Entrar no Aplicativo'}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

      </form>

      {/* RODAPÉ COM OPÇÃO DE RESTAURAÇÃO DE BACKUP */}
      <div className="flex flex-col items-center gap-3 mt-8 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
          <ShieldCheck size={13} style={{ color: accentColor }} />
          <span>Criptografia PBKDF2 + Armazenamento Protegido</span>
        </div>

        {onRestoreBackup && (
          <button
            type="button"
            onClick={onRestoreBackup}
            className="text-[11px] font-mono text-neutral-400 hover:text-white flex items-center gap-1.5 p-2 rounded-xl bg-white/[0.04] tap-haptic"
          >
            <Sparkles size={13} />
            <span>Restaurar histórico prévio via backup JSON</span>
          </button>
        )}
      </div>

    </div>
  );
}
