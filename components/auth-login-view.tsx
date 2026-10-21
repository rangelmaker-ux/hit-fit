"use client";

import React, { useState, useEffect } from 'react';
import { Dumbbell, Shield, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, KeyRound, X } from 'lucide-react';
import { getAvatar } from '@/lib/avatar-storage';
import {
  loginAthlete,
  setupInitialPins,
  checkSetupStatus,
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

  // Estado de configuração inicial protegida (proprietário)
  const [isSetupNeeded, setIsSetupNeeded] = useState(false);
  const [cloudConnected, setCloudConnected] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [setupPin, setSetupPin] = useState('');
  const [setupConfirmPin, setSetupConfirmPin] = useState('');
  const [setupSuccessMsg, setSetupSuccessMsg] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [checkingSetup, setCheckingSetup] = useState(true);

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

    checkSetupStatus()
      .then((status) => {
        if (active) {
          setCloudConnected(status.cloudConnected);
          setIsSetupNeeded(status.isSetupNeeded);
          setCheckingSetup(false);
        }
      })
      .catch(() => {
        if (active) setCheckingSetup(false);
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
    }, 700);
  };

  const handleSetupPins = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (!adminKey.trim()) {
      setAdminError('Informe a Chave Administrativa do Proprietário.');
      return;
    }

    if (!/^\d{6}$/.test(setupPin)) {
      setAdminError('O PIN deve conter exatamente 6 dígitos numéricos.');
      return;
    }

    if (setupPin !== setupConfirmPin) {
      setAdminError('A confirmação do PIN não confere.');
      return;
    }

    setLoading(true);
    const res = await setupInitialPins(setupPin, setupConfirmPin, adminKey);
    setLoading(false);

    if (!res.success) {
      setAdminError(res.error || 'Falha ao ativar contas. Verifique a chave administrativa.');
      return;
    }

    setSetupSuccessMsg('Contas de Rangel e Jack ativadas com sucesso!');
    setIsSetupNeeded(false);
    setShowAdminModal(false);
    setPin(setupPin);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[90vh] py-6 px-4 animate-in fade-in duration-500">
      
      {/* LOGO HIT-FIT COM ANIMAÇÃO PREMIUM E BRILHO */}
      <div className="relative flex flex-col items-center mb-6">
        <div className="relative">
          {/* Anéis de Pulsação Neon Duplos (Cyber Lime + Magenta) */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#C4F53C]/30 via-transparent to-[#FF267A]/30 blur-xl opacity-75 animate-pulse" />
          
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

      {/* AVISO SE PERSISTÊNCIA NA NUVEM PENDENTE */}
      {!cloudConnected && !checkingSetup && (
        <div className="w-full mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="block text-amber-200 font-bold mb-0.5">Atenção de Infraestrutura:</strong>
            As variáveis de banco permanente (Vercel KV / Upstash Redis) e segurança pendem de ativação no painel da Vercel (<code className="font-mono bg-black/40 px-1 py-0.5 rounded">HITFIT_AUTH_SECRET</code>, <code className="font-mono bg-black/40 px-1 py-0.5 rounded">KV_REST_API_URL</code>, <code className="font-mono bg-black/40 px-1 py-0.5 rounded">KV_REST_API_TOKEN</code>).
          </div>
        </div>
      )}

      {/* TELA DE LOGIN PREMIUM (RANGEL OU JACK) */}
      <div className="w-full bg-[#0E121A] rounded-3xl border border-white/10 p-6 shadow-2xl relative">
        
        {/* BANNER SE AS CONTAS PENDEM DE ATIVAÇÃO PELO PROPRIETÁRIO */}
        {isSetupNeeded && !checkingSetup && (
          <div className="mb-5 p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold">
              <KeyRound size={15} className="text-sky-400 shrink-0" />
              <span>Ativação Inicial do Proprietário</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              As contas de Rangel e Jack aguardam a ativação inicial com a chave administrativa do servidor.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowAdminModal(true);
                setAdminError(null);
              }}
              className="mt-1 py-2 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors tap-haptic"
            >
              <Shield size={13} />
              <span>Inserir Chave Administrativa e Ativar</span>
            </button>
          </div>
        )}

        {setupSuccessMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{setupSuccessMsg}</span>
          </div>
        )}

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

        {/* MENSAGEM DE ERRO */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-2 animate-in shake">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            {errorMessage.includes('ainda não inicializadas') && (
              <button
                type="button"
                onClick={() => {
                  setShowAdminModal(true);
                  setAdminError(null);
                }}
                className="mt-1 text-[11px] underline text-sky-300 hover:text-sky-200 text-left font-mono"
              >
                Ativar agora com a chave administrativa →
              </button>
            )}
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

      {/* MODAL ADMINISTRATIVO DE ATIVAÇÃO PROTEGIDA (HITFIT_ADMIN_KEY) */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0E121A] rounded-3xl border border-white/15 p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowAdminModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-[#C4F53C]" />
              <h2 className="text-lg font-black text-white">Ativação do Proprietário</h2>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              Provisionamento seguro das contas de <strong>Rangel</strong> e <strong>Jack</strong>. Requer a chave administrativa configurada no servidor.
            </p>

            {adminError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleSetupPins} className="flex flex-col gap-3.5">
              <label className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-300">
                  <span>Chave Administrativa (HITFIT_ADMIN_KEY):</span>
                  <button
                    type="button"
                    onClick={() => setShowAdminKey(!showAdminKey)}
                    className="text-neutral-400 hover:text-white text-[11px]"
                  >
                    {showAdminKey ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <input
                  type={showAdminKey ? 'text' : 'password'}
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Segredo administrativo do servidor"
                  className="w-full p-3 bg-[#07090C] border border-white/15 rounded-xl font-mono text-sm text-white outline-none focus:border-[#C4F53C]"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-mono font-bold text-neutral-300">PIN Inicial de 6 dígitos:</span>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={setupPin}
                  onChange={(e) => setSetupPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Ex: 123456"
                  className="w-full p-3 bg-[#07090C] border border-white/15 rounded-xl text-center text-lg font-mono tracking-widest font-black text-white outline-none focus:border-[#C4F53C]"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-mono font-bold text-neutral-300">Confirmar PIN:</span>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={setupConfirmPin}
                  onChange={(e) => setSetupConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Repita o PIN de 6 dígitos"
                  className="w-full p-3 bg-[#07090C] border border-white/15 rounded-xl text-center text-lg font-mono tracking-widest font-black text-white outline-none focus:border-[#C4F53C]"
                />
              </label>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-neutral-300 text-xs font-bold hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !adminKey || setupPin.length !== 6 || setupConfirmPin.length !== 6}
                  className="flex-1 py-3 rounded-xl bg-[#C4F53C] hover:bg-[#b0df32] text-black font-black text-xs disabled:opacity-40 shadow-lg transition-colors tap-haptic"
                >
                  {loading ? 'Validando...' : 'Ativar Contas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RODAPÉ ELEGANTE */}
      <footer className="mt-6 text-center text-[11px] text-neutral-400 font-mono">
        HIT-FIT 2.0 · Treino de Alta Performance para Casal
      </footer>

    </div>
  );
}
