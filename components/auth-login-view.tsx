"use client";

import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  X,
  RotateCcw
} from 'lucide-react';
import { getAvatar } from '@/lib/avatar-storage';
import {
  loginAthlete,
  adminSetupPins,
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
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [blockedRetryAfter, setBlockedRetryAfter] = useState<number | null>(null);
  const [avatars, setAvatars] = useState<Record<string, string | null>>({});

  // Estados do Modal de Recuperação Administrativa
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [pinRangel, setPinRangel] = useState('');
  const [confirmPinRangel, setConfirmPinRangel] = useState('');
  const [pinJack, setPinJack] = useState('');
  const [confirmPinJack, setConfirmPinJack] = useState('');
  const [resetData, setResetData] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

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

  // Timer para desbloqueio visual de rate limit
  useEffect(() => {
    if (!blockedRetryAfter || blockedRetryAfter <= 0) return;
    const interval = setInterval(() => {
      setBlockedRetryAfter((prev) => {
        if (!prev || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [blockedRetryAfter]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRemainingAttempts(null);

    if (pin.length !== 6) {
      setErrorMessage('Digite o PIN de 6 dígitos completo.');
      return;
    }

    setLoading(true);

    const res = await loginAthlete(selectedRole, pin);
    if (!res.success || !res.user) {
      setLoading(false);
      setErrorMessage(res.error || 'PIN incorreto. Verifique os dígitos e tente novamente.');
      if (res.remainingAttempts !== undefined) {
        setRemainingAttempts(res.remainingAttempts);
      }
      if (res.retryAfter) {
        setBlockedRetryAfter(res.retryAfter);
      }
      return;
    }

    // Sucesso: animação de feedback
    setAuthSuccess(true);
    setTimeout(() => {
      onAuthenticated(res.user!);
    }, 600);
  };

  const handleAdminResetPins = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoverySuccess(null);

    if (!adminKey.trim()) {
      setRecoveryError('Informe a chave administrativa (HITFIT_ADMIN_KEY).');
      return;
    }

    if (!/^\d{6}$/.test(pinRangel.trim())) {
      setRecoveryError('O novo PIN de Rangel deve ter exatamente 6 dígitos numéricos.');
      return;
    }

    if (pinRangel.trim() !== confirmPinRangel.trim()) {
      setRecoveryError('Os PINs digitados para Rangel não coincidem.');
      return;
    }

    if (!/^\d{6}$/.test(pinJack.trim())) {
      setRecoveryError('O novo PIN de Jack deve ter exatamente 6 dígitos numéricos.');
      return;
    }

    if (pinJack.trim() !== confirmPinJack.trim()) {
      setRecoveryError('Os PINs digitados para Jack não coincidem.');
      return;
    }

    setRecoveryLoading(true);

    const res = await adminSetupPins({
      adminKey: adminKey.trim(),
      pinRangel: pinRangel.trim(),
      pinJack: pinJack.trim(),
      resetData
    });

    setRecoveryLoading(false);

    if (!res.success) {
      setRecoveryError(res.error || 'Falha ao redefinir PINs. Verifique a chave administrativa.');
      return;
    }

    setRecoverySuccess('PINs de Rangel e Jack atualizados com sucesso no banco!');
    setTimeout(() => {
      setShowRecoveryModal(false);
      setRecoverySuccess(null);
      setErrorMessage(null);
      setPin(selectedRole === 'jack' ? pinJack.trim() : pinRangel.trim());
    }, 1200);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[90vh] py-6 px-4 overflow-x-hidden">
      
      {/* LOGO HIT-FIT COM ANIMAÇÃO PREMIUM E BRILHO */}
      <div className="relative flex flex-col items-center mb-6 overflow-hidden p-2">
        <div className="relative">
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

      {/* CARD PRINCIPAL DE LOGIN */}
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
                setPin('');
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
                setPin('');
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

        {/* FEEDBACK DE ERRO OU BLOQUEIO DE RATE LIMIT */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-1 animate-in shake">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
            {remainingAttempts !== null && remainingAttempts > 0 && (
              <span className="text-[11px] font-mono text-rose-200/90 pl-6">
                Restam {remainingAttempts} tentativa(s) antes do bloqueio temporário.
              </span>
            )}
            {blockedRetryAfter !== null && blockedRetryAfter > 0 && (
              <span className="text-[11px] font-mono text-amber-300 pl-6">
                Acesso bloqueado por segurança. Liberação em {Math.ceil(blockedRetryAfter / 60)} min ({blockedRetryAfter}s).
              </span>
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
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                disabled={loading || Boolean(blockedRetryAfter && blockedRetryAfter > 0)}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setPin(clean);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="• • • • • •"
                className="w-full p-4 bg-[#07090C] border border-white/15 rounded-2xl text-center font-mono tracking-[0.4em] font-black text-white outline-none focus:border-white/40 transition-colors disabled:opacity-40"
                style={{
                  fontSize: '24px',
                  touchAction: 'manipulation',
                  borderColor: pin.length === 6 ? accentColor : undefined
                }}
              />
            </div>

            {/* Indicador visual dos 6 dígitos preenchidos */}
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
            disabled={loading || pin.length !== 6 || authSuccess || Boolean(blockedRetryAfter && blockedRetryAfter > 0)}
            className="mt-2 w-full py-4 px-6 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all tap-haptic disabled:opacity-40"
            style={{
              backgroundColor: authSuccess ? '#10B981' : accentColor,
              color: '#000000',
              boxShadow: `0 4px 20px -2px ${accentColor}40`,
              touchAction: 'manipulation'
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

        {/* LINK DE RECUPERAÇÃO / REDEFINIÇÃO DE PIN PELO PROPRIETÁRIO */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] text-center">
          <button
            type="button"
            onClick={() => {
              setShowRecoveryModal(true);
              setRecoveryError(null);
              setRecoverySuccess(null);
            }}
            className="text-[11px] font-mono text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto tap-haptic"
            style={{ touchAction: 'manipulation' }}
          >
            <KeyRound size={13} className="text-[#C4F53C]" />
            <span>Esqueceu o PIN? Redefinir com Chave Administrativa</span>
          </button>
        </div>

      </div>

      {/* MODAL DE RECUPERAÇÃO ADMINISTRATIVA SEGURA */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0E121A] border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            
            {/* CABEÇALHO DO MODAL */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C4F53C]/10 border border-[#C4F53C]/30 flex items-center justify-center text-[#C4F53C]">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Recuperação de Acesso</h2>
                  <p className="text-[11px] font-mono text-neutral-400">Painel Administrativo do Proprietário</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Informe a chave <strong className="text-white font-mono">HITFIT_ADMIN_KEY</strong> configurada na Vercel para cadastrar novos PINs de 6 dígitos sem precisar informar o PIN antigo.
            </p>

            {recoveryError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-400" />
                <span>{recoveryError}</span>
              </div>
            )}

            {recoverySuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                <span>{recoverySuccess}</span>
              </div>
            )}

            {/* FORMULÁRIO DE REDEFINIÇÃO */}
            <form onSubmit={handleAdminResetPins} className="flex flex-col gap-3.5">
              
              {/* CHAVE ADMINISTRATIVA */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono font-bold text-neutral-300 flex items-center justify-between">
                  <span>CHAVE ADMINISTRATIVA (HITFIT_ADMIN_KEY):</span>
                  <button
                    type="button"
                    onClick={() => setShowAdminKey(!showAdminKey)}
                    className="text-neutral-400 hover:text-white flex items-center gap-1 text-[10px]"
                  >
                    {showAdminKey ? <EyeOff size={11} /> : <Eye size={11} />}
                    <span>{showAdminKey ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                </label>
                <input
                  type={showAdminKey ? 'text' : 'password'}
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Insira a chave mestra configurada"
                  className="w-full p-3 bg-[#07090C] border border-white/15 rounded-xl text-white font-mono text-sm outline-none focus:border-[#C4F53C]"
                  style={{ fontSize: '16px', touchAction: 'manipulation' }}
                />
              </div>

              {/* SEÇÃO RANGEL */}
              <div className="p-3 rounded-2xl bg-[#141C15]/70 border border-[#C4F53C]/30 flex flex-col gap-2">
                <span className="text-[11px] font-mono font-black text-[#C4F53C] uppercase tracking-wider">
                  NOVO PIN PARA RANGEL:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-0.5">PIN (6 dígitos):</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={pinRangel}
                      onChange={(e) => setPinRangel(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full p-2.5 bg-[#07090C] border border-white/15 rounded-xl text-white font-mono text-center tracking-[0.2em] font-black outline-none focus:border-[#C4F53C]"
                      style={{ fontSize: '18px', touchAction: 'manipulation' }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-0.5">Confirmar PIN:</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={confirmPinRangel}
                      onChange={(e) => setConfirmPinRangel(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full p-2.5 bg-[#07090C] border border-white/15 rounded-xl text-white font-mono text-center tracking-[0.2em] font-black outline-none focus:border-[#C4F53C]"
                      style={{ fontSize: '18px', touchAction: 'manipulation' }}
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO JACK */}
              <div className="p-3 rounded-2xl bg-[#220E1A]/70 border border-[#FF267A]/30 flex flex-col gap-2">
                <span className="text-[11px] font-mono font-black text-[#FF267A] uppercase tracking-wider">
                  NOVO PIN PARA JACK:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-0.5">PIN (6 dígitos):</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={pinJack}
                      onChange={(e) => setPinJack(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full p-2.5 bg-[#07090C] border border-white/15 rounded-xl text-white font-mono text-center tracking-[0.2em] font-black outline-none focus:border-[#FF267A]"
                      style={{ fontSize: '18px', touchAction: 'manipulation' }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-0.5">Confirmar PIN:</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={confirmPinJack}
                      onChange={(e) => setConfirmPinJack(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full p-2.5 bg-[#07090C] border border-white/15 rounded-xl text-white font-mono text-center tracking-[0.2em] font-black outline-none focus:border-[#FF267A]"
                      style={{ fontSize: '18px', touchAction: 'manipulation' }}
                    />
                  </div>
                </div>
              </div>

              {/* OPÇÃO DE REINICIALIZAÇÃO TOTAL DE DADOS */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="resetDataCheckbox"
                  checked={resetData}
                  onChange={(e) => setResetData(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-amber-500 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="resetDataCheckbox" className="text-xs text-amber-200 cursor-pointer select-none">
                  <strong>Reinicializar do zero:</strong> apagar biometria, históricos e treinos anteriores para começar limpo (autorizado pelo proprietário).
                </label>
              </div>

              {/* BOTÃO DE CONFIRMAÇÃO */}
              <button
                type="submit"
                disabled={recoveryLoading || !adminKey.trim() || pinRangel.length !== 6 || pinJack.length !== 6}
                className="mt-1 w-full py-3.5 px-4 rounded-xl font-black text-sm bg-[#C4F53C] text-black shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 transition-all tap-haptic"
                style={{ touchAction: 'manipulation' }}
              >
                {recoveryLoading ? (
                  <>
                    <RotateCcw size={16} className="animate-spin" />
                    <span>Salvando novos PINs no banco...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Salvar Novos PINs e Liberar Acesso</span>
                  </>
                )}
              </button>
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
