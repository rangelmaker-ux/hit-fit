"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Trash2,
  Shield,
  UsersRound,
  Lock,
  LogOut
} from 'lucide-react';
import { getAvatar, saveAvatar, deleteAvatar, compressImageFile } from '@/lib/avatar-storage';
import { NumericInput } from '@/components/ui/numeric-input';
import { DuoView } from '@/components/duo-view';
import {
  getUnifiedBiometrics,
  saveUnifiedBiometrics,
  parseHeight,
  formatHeight,
  formatWeight,
  BIOMETRICS_EVENT,
  UnifiedBiometrics
} from '@/lib/biometrics';
import { AuthenticatedUser } from '@/lib/auth-client';

interface ProfileViewProps {
  profileId: string;
  athleteName: string;
  accentColor: string;
  isReadOnly?: boolean;
  people: { id: string; name: string }[];
  currentWeek: string;
  savedSets: Record<string, { done: boolean; weightKg?: string }>;
  currentUser?: AuthenticatedUser | null;
  onUserUpdated?: (user: AuthenticatedUser) => void;
  onAvatarUpdated?: () => void;
  onLogout?: () => void;
}

export function ProfileView({
  profileId,
  athleteName,
  accentColor,
  isReadOnly = false,
  people,
  currentWeek,
  savedSets,
  currentUser,
  onUserUpdated,
  onAvatarUpdated,
  onLogout
}: ProfileViewProps) {
  // Foto de Perfil via IndexedDB
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Carrega Avatar do IndexedDB ao montar ou trocar de perfil
  useEffect(() => {
    let active = true;
    getAvatar(profileId).then((url) => {
      if (active) setAvatarUrl(url);
    });
    return () => {
      active = false;
    };
  }, [profileId]);

  // Perfil Biométrico Unificado derivado no render
  const [, setBioVersion] = useState(0);
  const bio = getUnifiedBiometrics(profileId, currentUser);

  const [editingBio, setEditingBio] = useState(false);

  // Campos temporários em edição
  const [editWeight, setEditWeight] = useState<number | null>(null);
  const [editHeightMeters, setEditHeightMeters] = useState<number | null>(null);
  const [editAge, setEditAge] = useState<number | null>(null);
  const [editTargetWeight, setEditTargetWeight] = useState<number | null>(null);

  // Escuta evento global de atualização biométrica
  useEffect(() => {
    const handleBiometricsChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ profileId: string; biometrics: UnifiedBiometrics }>;
      if (customEvent.detail?.profileId === profileId) {
        setBioVersion((v) => v + 1);
      }
    };
    window.addEventListener(BIOMETRICS_EVENT, handleBiometricsChange);
    return () => window.removeEventListener(BIOMETRICS_EVENT, handleBiometricsChange);
  }, [profileId]);

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsUploading(true);

    try {
      const compressed = await compressImageFile(file);
      setPreviewFile(compressed);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Erro ao processar imagem.');
    } finally {
      setIsUploading(false);
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  const handleConfirmAvatar = async () => {
    if (isReadOnly || !previewFile) return;

    try {
      await saveAvatar(profileId, previewFile);
      setAvatarUrl(previewFile);
      setPreviewFile(null);
      onAvatarUpdated?.();
    } catch {
      setErrorMsg('Erro ao salvar foto no banco de dados local.');
    }
  };

  const handleRemoveAvatar = async () => {
    if (isReadOnly) return;
    try {
      await deleteAvatar(profileId);
      setAvatarUrl(null);
      setPreviewFile(null);
      onAvatarUpdated?.();
    } catch {
      setErrorMsg('Erro ao remover foto.');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-neutral-100 pb-20 animate-in fade-in">
      
      {/* MODO SOMENTE LEITURA */}
      {isReadOnly && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Lock size={15} />
            <span className="font-bold">Modo Somente Leitura (Perfil de {athleteName})</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider font-black px-2 py-0.5 rounded bg-amber-500/20">
            Protegido
          </span>
        </div>
      )}

      {/* INPUTS DE ARQUIVO OCULTOS */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSelectFile}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleSelectFile}
        className="hidden"
      />

      {/* MODAL DE PRÉ-VISUALIZAÇÃO DA FOTO */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-[#0E121A] border border-[rgba(255,255,255,0.12)] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
              Confirmar Foto de Perfil
            </span>

            {/* Preview Redondo */}
            <div
              className="w-36 h-36 rounded-full overflow-hidden border-2 shadow-2xl"
              style={{ borderColor: accentColor }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewFile} alt="Preview" className="w-full h-full object-cover" />
            </div>

            <p className="text-xs text-neutral-400">
              A imagem foi centralizada e otimizada com acabamento circular.
            </p>

            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              <button
                onClick={() => setPreviewFile(null)}
                className="py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-neutral-300 tap-haptic"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAvatar}
                className="py-2.5 px-3 rounded-xl text-xs font-bold text-black shadow-md tap-haptic"
                style={{ backgroundColor: accentColor }}
              >
                Salvar Foto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARD DO PERFIL COM FOTO CIRCULAR PREMIUM */}
      <div className="relative p-6 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col items-center text-center gap-4 overflow-hidden">
        
        {/* Luz ambiente */}
        <div
          className="absolute -top-20 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        {/* Avatar Circular com Borda de Alta Precisão */}
        <div className="relative group">
          <div
            className="w-28 h-28 rounded-full p-1 border-2 shadow-2xl flex items-center justify-center transition-transform duration-300"
            style={{
              borderColor: `${accentColor}80`,
              boxShadow: `0 0 24px -4px ${accentColor}35`
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={athleteName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center font-black text-3xl shadow-inner"
                style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
              >
                {athleteName[0]}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
            {athleteName}
          </h2>
          <span className="text-xs font-mono text-neutral-400 mt-0.5 block">
            {bio.gender === 'female' ? 'Atleta Feminina' : 'Atleta Masculino'} · {formatWeight(bio.currentWeightKg)} · {formatHeight(bio.heightCm)}
          </span>
        </div>

        {/* AÇÕES DE FOTO (SE NÃO FOR SOMENTE LEITURA) */}
        {!isReadOnly && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06] w-full justify-center">
            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={isUploading}
              className="py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono font-bold text-white flex items-center gap-1.5 transition-all tap-haptic border border-white/10"
              title="Escolher da Galeria"
            >
              <ImageIcon size={14} style={{ color: accentColor }} />
              <span>Galeria</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploading}
              className="py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono font-bold text-white flex items-center gap-1.5 transition-all tap-haptic border border-white/10"
              title="Tirar Foto com a Câmera"
            >
              <Camera size={14} style={{ color: accentColor }} />
              <span>Câmera</span>
            </button>

            {avatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all tap-haptic border border-rose-500/20"
                title="Remover Foto Atual"
              >
                <Trash2 size={13} />
                <span>Remover</span>
              </button>
            )}
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
            {errorMsg}
          </p>
        )}
      </div>

      {/* DADOS BIOMÉTRICOS & CONFIGURAÇÕES */}
      <div className="p-5 rounded-3xl bg-[#0E121A] border border-[rgba(255,255,255,0.08)] shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: accentColor }} />
            <h3 className="text-sm font-mono font-black uppercase tracking-wider text-white">
              Parâmetros Biométricos
            </h3>
          </div>

          {!isReadOnly && (
            <button
              onClick={async () => {
                if (editingBio) {
                  const parsedH = parseHeight(editHeightMeters);
                  await saveUnifiedBiometrics(
                    profileId,
                    {
                      currentWeightKg: editWeight,
                      weightKg: editWeight,
                      heightCm: parsedH.cm,
                      heightMeters: parsedH.meters,
                      targetWeightKg: editTargetWeight
                    },
                    currentUser,
                    onUserUpdated
                  );
                  setEditingBio(false);
                } else {
                  setEditWeight(bio.currentWeightKg || null);
                  setEditHeightMeters(bio.heightMeters || null);
                  setEditAge(bio.age || null);
                  setEditTargetWeight(bio.targetWeightKg || null);
                  setEditingBio(true);
                }
              }}
              className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 border border-white/10 tap-haptic"
            >
              {editingBio ? 'Concluir' : 'Editar'}
            </button>
          )}
        </div>

        {editingBio && !isReadOnly ? (
          <div className="grid grid-cols-2 gap-3 text-xs animate-in fade-in">
            <label className="flex flex-col gap-1 text-[10px] font-mono text-neutral-400">
              <span>PESO (kg):</span>
              <NumericInput
                value={editWeight}
                allowDecimals={true}
                placeholder="Ex: 97,0"
                min={20}
                max={300}
                onChangeValue={(val) => setEditWeight(val)}
                className="p-2.5 bg-[#07090C] border border-white/15 rounded-xl text-white font-mono font-bold text-base outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-[10px] font-mono text-neutral-400">
              <span>ALTURA (m):</span>
              <NumericInput
                value={editHeightMeters}
                allowDecimals={true}
                placeholder="Ex: 1,78"
                min={0.5}
                max={2.5}
                onChangeValue={(val) => setEditHeightMeters(val)}
                className="p-2.5 bg-[#07090C] border border-white/15 rounded-xl text-white font-mono font-bold text-base outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-[10px] font-mono text-neutral-400">
              <span>IDADE (anos):</span>
              <NumericInput
                value={editAge}
                allowDecimals={false}
                placeholder="Ex: 29"
                onChangeValue={(val) => setEditAge(val)}
                className="p-2.5 bg-[#07090C] border border-white/15 rounded-xl text-white font-mono font-bold text-base outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-[10px] font-mono text-neutral-400">
              <span>META DE PESO (kg):</span>
              <NumericInput
                value={editTargetWeight}
                allowDecimals={true}
                placeholder="Ex: 85,0"
                min={20}
                max={300}
                onChangeValue={(val) => setEditTargetWeight(val)}
                className="p-2.5 bg-[#07090C] border border-white/15 rounded-xl text-white font-mono font-bold text-base outline-none"
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.04]">
              <span className="text-[8px] font-mono uppercase text-neutral-400 block">PESO</span>
              <strong className="text-sm font-mono font-bold text-white mt-0.5 block">{formatWeight(bio.currentWeightKg)}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.04]">
              <span className="text-[8px] font-mono uppercase text-neutral-400 block">ALTURA (m)</span>
              <strong className="text-sm font-mono font-bold text-white mt-0.5 block">{formatHeight(bio.heightCm)}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.04]">
              <span className="text-[8px] font-mono uppercase text-neutral-400 block">IDADE</span>
              <strong className="text-sm font-mono font-bold text-white mt-0.5 block">{bio.age > 0 ? `${bio.age} anos` : '-- anos'}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.04]">
              <span className="text-[8px] font-mono uppercase text-neutral-400 block">META</span>
              <strong className="text-sm font-mono font-bold text-sky-300 mt-0.5 block">{formatWeight(bio.targetWeightKg)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* MODO DUO CASAL INTEGRADO COM CONQUISTAS E BACKUP JSON */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-1">
          <UsersRound size={16} style={{ color: accentColor }} />
          <h3 className="text-sm font-mono font-black uppercase tracking-wider text-white">
            Espaço Duo Casal & Sincronização
          </h3>
        </div>

        <DuoView
          people={people}
          currentWeek={currentWeek}
          savedSets={savedSets}
          accentColor={accentColor}
        />
      </div>

      {/* BOTÃO DE LOGOUT / SAIR DA CONTA */}
      {onLogout && (
        <div className="pt-2">
          <button
            onClick={onLogout}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono font-bold text-xs flex items-center justify-center gap-2 tap-haptic transition-colors"
          >
            <LogOut size={15} />
            <span>Encerrar Sessão (Sair da Conta)</span>
          </button>
        </div>
      )}

    </div>
  );
}
