"use client";

import React, { useState, useEffect } from 'react';
import { Dumbbell, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { getAvatar } from '@/lib/avatar-storage';
import {
  loginAthlete,
  AuthenticatedUser
} from '@/lib/auth-client';

interface AuthLoginViewProps {
  onAuthenticated: (user: AuthenticatedUser) => void;
}

export function AuthLoginView({ onAuthenticated }: AuthLoginViewProps) {
  const [selectedRole, setSelectedRole] = useState<'rangel' | 'jack'>('rangel');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [avatars, setAvatars] = useState<Record<string, string | null>>({});

  const isJack = selectedRole === 'jack';
  const accentColor = isJack ? '#FF267A' : '#C4F53C';

  useEffect(() => {
    let active = true;

    Promise.all([
      getAvatar('person-rangel'),
      getAvatar('person-geicsania')
    ]).then(([rangelUrl, jackUrl]) => {
      if (active) {
        setAvatars({
          rangel: rangelUrl,
          jack: jackUrl
        });
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (pin.length !== 6) {
      setErrorMessage('Digite o PIN de 6 dígitos completo.');
      return;
    }

    setLoading(true);

    const res = await loginAthlete(selectedRole, pin);
    if (!res.success || !res.user) {
      setLoading(false);
      setErrorMessage(res.error || 'PIN incorreto. Verifique os dígitos e tente novamente.');
      return;
    }

    // Sucesso: animação de feedback
    setAuthSuccess(true);
    setTimeout(() => {
      onAuthenticated(res.user!);
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[90vh] py-6 px-4 overflow-x-hidden">
      
      {/* LOGO HIT-FIT COM ANIMAÇÃO PREMIUM E BRILHO */}
      <div className="relative flex flex-col items-center mb-6 overflow-hidden p-2">
        <div className="relative">
          {/* Anel de Pulsação Contido (Sem Bleed Horizontal) */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#C4F53C]/20 via-transparent to-[#FF267A]/20 blur-md opacity-75" />
          
          <div className="relative w-20 h-20 rounded-3xl bg-[#0E121A] border border-white/10 flex items-center justify-center shadow-2xl">
            <Dumbbell className="w-10 h-10 text-white animate-bounce duration-1000" style={{ filter: `drop-shadow(0 0 12px ${accentColor})` }} />
          </div>
        </div>

        <div className="text-center mt-3">
          <span className="text-[10px] font-mono uppercase font-black tracking-[0.3em] text-neutral-400 block">
            TREINO & PERFORMANCE DUO
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-1.5 mt-0.5">
            <span>HIT</span>
            <span className="text-[#C4F53C]">-</span>
            <span className="text-white">FIT</span>
            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-neutral-300 ml-1">
              PRO
            </span>
          </h1>
        </div>
      </div>

      {/* TELA DE LOGIN PREMIUM (RANGEL OU JACK) */}
      <div className="w-full max-w-full bg-[#0E121A] rounded-3xl border border-white/10 p-6 shadow-2xl relative overflow-x-hidden">

        {/* SELETOR DE PERFIL: RANGEL VS JACK */}
        <div className="flex flex-col gap-2 mb-5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            SELECIONE QUEM ESTÁ ENTRANDO:
          </span>

          <div className="grid grid-cols-2 gap-3">
            {/* CARD RANGEL */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('rangel');
                setErrorMessage(null);
              }}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center tap-haptic ${
                selectedRole === 'rangel'
                  ? 'bg-[#141C15] border-[#C4F53C] shadow-[0_0_20px_rgba(196,245,60,0.15)]'
                  : 'bg-[#07090C] border-white/10 hover:border-white/20 opacity-70'
              }`}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg overflow-hidden border shadow-md"
                style={{
                  backgroundColor: selectedRole === 'rangel' ? '#C4F53C20' : 'rgba(255,255,255,0.05)',
                  borderColor: selectedRole === 'rangel' ? '#C4F53C' : 'rgba(255,255,255,0.1)',
                  color: '#C4F53C'
                }}
              >
                {avatars.rangel ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatars.rangel} alt="Rangel" className="w-full h-full object-cover" />
                ) : (
                  'R'
                )}
              </div>
              <div>
                <strong className="text-sm font-black text-white block">Rangel</strong>
                <span className="text-[10px] font-mono text-[#C4F53C] block">Performance</span>
              </div>
            </button>

            {/* CARD JACK */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('jack');
                setErrorMessage(null);
              }}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center tap-haptic ${
                selectedRole === 'jack'
                  ? 'bg-[#220E1A] border-[#FF267A] shadow-[0_0_20px_rgba(255,38,122,0.15)]'
                  : 'bg-[#07090C] border-white/10 hover:border-white/20 opacity-70'
              }`}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg overflow-hidden border shadow-md"
                style={{
                  backgroundColor: selectedRole === 'jack' ? '#FF267A20' : 'rgba(255,255,255,0.05)',
                  borderColor: selectedRole === 'jack' ? '#FF267A' : 'rgba(255,255,255,0.1)',
                  color: '#FF267A'
                }}
              >
                {avatars.jack ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatars.jack} alt="Jack" className="w-full h-full object-cover" />
                ) : (
                  'J'
                )}
              </div>
              <div>
                <strong className="text-sm font-black text-white block">Jack</strong>
                <span className="text-[10px] font-mono text-[#FF267A] block">Recomposição</span>
              </div>
            </button>
          </div>
        </div>

        {/* MENSAGEM DE ERRO (APENAS SE O PIN FOR DIGITADO INCORRETAMENTE) */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in shake">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* FORMULÁRIO DE PIN */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Lock size={13} style={{ color: accentColor }} />
                <span>PIN de 6 dígitos:</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
              >
                {showPin ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPin ? 'Ocultar' : 'Mostrar'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setPin(clean);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="• • • • • •"
                className="w-full p-4 bg-[#07090C] border border-white/15 rounded-2xl text-center text-2xl font-mono tracking-[0.4em] font-black text-white outline-none focus:border-white/40 transition-colors"
                style={{
                  borderColor: pin.length === 6 ? accentColor : undefined
                }}
              />
            </div>

            {/* Indicador visual de preenchimento dos 6 dígitos */}
            <div className="flex justify-center gap-2 mt-1">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: pin.length > idx ? accentColor : 'rgba(255,255,255,0.1)',
                    transform: pin.length > idx ? 'scale(1.2)' : 'scale(1)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* BOTÃO ENTRAR COM ANIMAÇÃO */}
          <button
            type="submit"
            disabled={loading || pin.length !== 6 || authSuccess}
            className="mt-2 w-full py-4 px-6 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all tap-haptic disabled:opacity-40"
            style={{
              backgroundColor: authSuccess ? '#10B981' : accentColor,
              color: '#000000',
              boxShadow: `0 4px 20px -2px ${accentColor}40`
            }}
          >
            {authSuccess ? (
              <>
                <CheckCircle2 size={18} className="animate-spin" />
                <span>Autenticado com Sucesso!</span>
              </>
            ) : loading ? (
              <>
                <Dumbbell size={18} className="animate-spin" />
                <span>Validando PIN...</span>
              </>
            ) : (
              <>
                <span>Entrar no HIT-FIT</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

      </div>

      {/* RODAPÉ ELEGANTE */}
      <footer className="mt-6 text-center text-[11px] text-neutral-400 font-mono">
        HIT-FIT 2.0 · Treino de Alta Performance para Casal
      </footer>

    </div>
  );
}
