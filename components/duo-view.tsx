"use client";

import React, { useState } from 'react';
import { 
  Flame, 
  Trophy, 
  HeartHandshake, 
  Download, 
  Upload, 
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { WORKOUT_DAYS } from '@/lib/workout-data';

interface DuoViewProps {
  people: { id: string; name: string }[];
  currentWeek: string;
  savedSets: Record<string, { done: boolean; weightKg?: string }>;
  accentColor?: string;
  onRestoreBackup?: (backupData: Record<string, string | null>) => void;
}

export function DuoView({
  people,
  currentWeek,
  savedSets,
  accentColor = '#c3f75a',
  onRestoreBackup
}: DuoViewProps) {
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  // Calcula estatísticas para cada perfil
  const person1 = people[0] || { id: 'person-rangel', name: 'Rangel' };
  const person2 = people[1] || { id: 'person-geicsania', name: 'Geicsania' };

  const getPersonProgress = (personId: string) => {
    let totalCompletedSets = 0;
    const daysTrained = new Set<number>();

    WORKOUT_DAYS.forEach((day, dIdx) => {
      let daySets = 0;
      day.exercises.forEach((ex) => {
        for (let s = 0; s < ex.sets; s++) {
          const key = `${currentWeek}:${personId}:${dIdx}:${ex.id}:${s}`;
          if (savedSets[key]?.done) {
            totalCompletedSets++;
            daySets++;
          }
        }
      });
      if (daySets >= 4) {
        daysTrained.add(dIdx);
      }
    });

    return { totalCompletedSets, daysTrained };
  };

  const p1Stats = getPersonProgress(person1.id);
  const p2Stats = getPersonProgress(person2.id);

  // Dias em que ambos treinaram juntos
  const daysTogether = [0, 1, 2, 3, 4].filter(
    (d) => p1Stats.daysTrained.has(d) && p2Stats.daysTrained.has(d)
  );

  // Função para exportar backup completo dos dados locais
  const handleExportBackup = () => {
    try {
      const backupObj: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('hitfit-') || key.startsWith('rj-'))) {
          backupObj[key] = localStorage.getItem(key);
        }
      }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `hitfit-duo-backup-${currentWeek}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setBackupSuccess('Backup exportado com sucesso no seu dispositivo!');
      setTimeout(() => setBackupSuccess(null), 4000);
    } catch {
      alert('Não foi possível gerar o arquivo de backup.');
    }
  };

  // Função para importar backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        Object.keys(parsed).forEach((key) => {
          localStorage.setItem(key, parsed[key]);
        });
        if (onRestoreBackup) onRestoreBackup(parsed);
        setBackupSuccess('Dados restaurados com sucesso! Atualizando app...');
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-5 text-neutral-100 pb-20 animate-in fade-in duration-300">
      
      {/* HERO CARD: SINERGIA DO CASAL */}
      <div 
        className="p-5 rounded-3xl border relative overflow-hidden flex flex-col gap-4 shadow-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(195,247,90,0.12), rgba(255,46,147,0.12) 60%, rgba(13,16,13,0.95))',
          borderColor: 'rgba(255,255,255,0.12)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake size={20} className="text-white" />
            <span className="text-[11px] font-black uppercase tracking-widest text-neutral-300">
              CONEXÃO & CONSISTÊNCIA
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono">
            {currentWeek}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {person1.name} & {person2.name}
            </h2>
            <p className="text-xs text-neutral-300 mt-0.5">
              Treinando juntos na mesma direção.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-2xl border border-white/10">
            <Flame size={16} className="text-amber-400" />
            <span className="text-sm font-black font-mono text-white">
              {daysTogether.length} dias juntos
            </span>
          </div>
        </div>

        {/* Resumo da Semana Lado a Lado */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Rangel */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-[#c3f75a]/30 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <strong className="text-sm text-white">{person1.name}</strong>
              <span className="w-2.5 h-2.5 rounded-full bg-[#c3f75a] shadow-[0_0_8px_#c3f75a]" />
            </div>
            <div className="text-xl font-black font-mono text-[#c3f75a]">
              {p1Stats.daysTrained.size} / 5 <small className="text-xs font-normal text-neutral-400">dias</small>
            </div>
            <span className="text-[10px] text-neutral-400">{p1Stats.totalCompletedSets} séries concluídas</span>
          </div>

          {/* Geicsania */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-[#ff2e93]/30 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <strong className="text-sm text-white">{person2.name}</strong>
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff2e93] shadow-[0_0_8px_#ff2e93]" />
            </div>
            <div className="text-xl font-black font-mono text-[#ff2e93]">
              {p2Stats.daysTrained.size} / 5 <small className="text-xs font-normal text-neutral-400">dias</small>
            </div>
            <span className="text-[10px] text-neutral-400">{p2Stats.totalCompletedSets} séries concluídas</span>
          </div>
        </div>
      </div>

      {/* CALENDÁRIO CONJUNTO DA SEMANA */}
      <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Calendar size={15} style={{ color: accentColor }} />
            Calendário Semanal do Casal
          </span>
          <span className="text-[10px] text-neutral-400">Segunda a Sexta</span>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-1">
          {WORKOUT_DAYS.map((day, dIdx) => {
            const p1Done = p1Stats.daysTrained.has(dIdx);
            const p2Done = p2Stats.daysTrained.has(dIdx);
            const bothDone = p1Done && p2Done;

            return (
              <div 
                key={day.dayShort}
                className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  bothDone
                    ? 'bg-[#182415] border-amber-400/50 shadow-md'
                    : 'bg-black/40 border-white/5'
                }`}
              >
                <span className="text-[10px] font-bold text-neutral-400">{day.dayShort}</span>
                <span className="text-xs font-black font-mono text-white">{dIdx + 1}</span>

                {/* Badges de quem treinou */}
                <div className="flex items-center gap-1 mt-1">
                  <span 
                    className={`w-2 h-2 rounded-full ${p1Done ? 'bg-[#c3f75a]' : 'bg-white/10'}`}
                    title={p1Done ? `${person1.name} treinou` : 'Pendente'}
                  />
                  <span 
                    className={`w-2 h-2 rounded-full ${p2Done ? 'bg-[#ff2e93]' : 'bg-white/10'}`}
                    title={p2Done ? `${person2.name} treinou` : 'Pendente'}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-400 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#c3f75a]" /> {person1.name}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ff2e93]" /> {person2.name}
          </span>
          <span className="flex items-center gap-1 text-amber-300 font-semibold">
            ★ Ambos Concluíram
          </span>
        </div>
      </div>

      {/* CONQUISTAS E METAS DO CASAL */}
      <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Trophy size={15} />
            Conquistas Desbloqueáveis
          </span>
          <span className="text-[10px] text-neutral-400">Evolução conjunta</span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          {/* Conquista 1 */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
              daysTogether.length >= 1 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-white/5 text-neutral-600'
            }`}>
              {daysTogether.length >= 1 ? '✓' : '1'}
            </div>
            <div className="flex-1">
              <strong className="text-xs font-bold text-white block">Sintonia de Academia</strong>
              <span className="text-[10px] text-neutral-400">Treinar juntos pelo menos 1 dia na semana</span>
            </div>
            {daysTogether.length >= 1 && <span className="text-[10px] font-bold text-amber-400 uppercase">Ativo</span>}
          </div>

          {/* Conquista 2 */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
              daysTogether.length >= 3 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-white/5 text-neutral-600'
            }`}>
              {daysTogether.length >= 3 ? '✓' : '3'}
            </div>
            <div className="flex-1">
              <strong className="text-xs font-bold text-white block">Casal Imparável</strong>
              <span className="text-[10px] text-neutral-400">Concluir pelo menos 3 dias de treino juntos</span>
            </div>
            {daysTogether.length >= 3 && <span className="text-[10px] font-bold text-amber-400 uppercase">Ativo</span>}
          </div>

          {/* Conquista 3 */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
              p1Stats.daysTrained.size === 5 && p2Stats.daysTrained.size === 5 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-white/5 text-neutral-600'
            }`}>
              5/5
            </div>
            <div className="flex-1">
              <strong className="text-xs font-bold text-white block">Semana de Ouro (5 de 5)</strong>
              <span className="text-[10px] text-neutral-400">Ambos completarem todos os treinos de Seg a Sex</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEGURANÇA E BACKUP DE DADOS (REGRA 12) */}
      <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-400" />
            Backup & Segurança dos Dados
          </span>
          <span className="text-[10px] text-neutral-400">Armazenamento Local</span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Seus treinos, cargas, biometria e histórico são salvos neste aparelho. Faça backup periódico para trocar de celular sem perder nada:
        </p>

        {backupSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center">
            {backupSuccess}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportBackup}
            className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors border border-white/10"
          >
            <Download size={14} />
            <span>Exportar Backup</span>
          </button>

          <label className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors border border-white/10 cursor-pointer">
            <Upload size={14} />
            <span>Restaurar Backup</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportBackup} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

    </div>
  );
}
