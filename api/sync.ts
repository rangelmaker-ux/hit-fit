import {
  verifySessionToken,
  canModifyAthleteData,
  getAuthorizedPartnerId,
  isAuthSecretConfigured
} from '../lib/auth-crypto';
import {
  saveAthleteData,
  getAthleteData,
  PersistentStorageNotConfiguredError,
  PersistentStorageWriteError,
  isCloudConfigured
} from '../lib/cloud-store';
import type { StoredAthleteData, CloudSavedSetState } from '../lib/cloud-store';

export const config = {
  runtime: 'edge'
};

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function jsonResponse(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders
  });
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 1. Exige segredo de autenticação configurado exclusivamente no ambiente
  if (!isAuthSecretConfigured()) {
    return jsonResponse(500, {
      error: 'CONFIGURAÇÃO DE SEGURANÇA AUSENTE: HITFIT_AUTH_SECRET não configurado ou menor que 32 caracteres.',
      code: 'AUTH_SECRET_NOT_CONFIGURED'
    });
  }

  // 2. Exige banco permanente em ambiente de produção (sem fallbacks em memória)
  if (!isCloudConfigured() && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
    return jsonResponse(503, {
      error: 'BANCO DE DADOS INDISPONÍVEL: KV_REST_API_URL e KV_REST_API_TOKEN não configurados no servidor.',
      code: 'PERSISTENT_STORAGE_NOT_CONFIGURED'
    });
  }

  // 3. Verificação Estrita do Token de Sessão em qualquer operação
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return jsonResponse(401, {
      error: 'Não autorizado: Token de autenticação ausente ou inválido.',
      code: 'UNAUTHORIZED'
    });
  }

  const token = authHeader.substring(7);
  const session = await verifySessionToken(token);
  if (!session) {
    return jsonResponse(401, {
      error: 'Sessão expirada ou assinatura do token inválida. Faça login novamente.',
      code: 'SESSION_EXPIRED'
    });
  }

  const authenticatedUserId = session.userId;

  // ==========================================
  // GET: PULL DATA (Buscar dados do atleta + parceiro autorizado)
  // ==========================================
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const requestedPartnerId = url.searchParams.get('partnerId');

    let partnerData: StoredAthleteData | null = null;
    if (requestedPartnerId) {
      const allowedPartnerId = getAuthorizedPartnerId(authenticatedUserId);

      // REGRA DE SEGURANÇA E PRIVACIDADE:
      // Apenas a dupla configurada possui permissão de leitura mútua.
      // Qualquer outro partnerId deve ser bloqueado com 403 Forbidden.
      if (!allowedPartnerId || requestedPartnerId !== allowedPartnerId) {
        return jsonResponse(403, {
          error: `Acesso negado: O atleta autenticado (${authenticatedUserId}) não possui autorização para consultar dados de terceiros (${requestedPartnerId}).`,
          code: 'FORBIDDEN_UNAUTHORIZED_PARTNER_READ',
          authenticatedUser: authenticatedUserId,
          requestedPartner: requestedPartnerId
        });
      }

      partnerData = await getAthleteData(allowedPartnerId);
    }

    const myData = await getAthleteData(authenticatedUserId);

    return jsonResponse(200, {
      success: true,
      athlete: myData,
      partner: partnerData
        ? {
            ...partnerData,
            isReadOnly: true // Garantia explícita de que o parceiro é somente leitura
          }
        : null,
      serverTimestamp: Date.now()
    });
  }

  // ==========================================
  // POST: PUSH DATA (Salvar dados com confirmação durável)
  // ==========================================
  if (req.method === 'POST') {
    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const targetUserId = body.userId as string;

    if (!targetUserId || typeof targetUserId !== 'string') {
      return jsonResponse(400, {
        error: 'Identificador do atleta (userId) é obrigatório e deve ser uma string válida.',
        code: 'MISSING_USER_ID'
      });
    }

    // REGRA DE SEGURANÇA FUNDAMENTAL (RBAC):
    // Impede ataques por chamadas diretas às APIs e adulteração de identificadores enviados pelo cliente.
    // Rangel pode salvar SOMENTE dados de Rangel. Jéssania pode salvar SOMENTE dados de Jéssania.
    if (!canModifyAthleteData(authenticatedUserId, targetUserId)) {
      return jsonResponse(403, {
        error: `Acesso negado: O usuário autenticado (${session.name}) não possui permissão para modificar os dados de outro atleta (${targetUserId}).`,
        code: 'FORBIDDEN_CROSS_USER_MODIFICATION',
        authenticatedUser: session.userId,
        targetUser: targetUserId
      });
    }

    // Validação estrita de tipos e limites para integridade do banco
    let validatedWeight: number | null = null;
    if (body.currentWeightKg !== undefined && body.currentWeightKg !== null) {
      const parsedWeight = Number(body.currentWeightKg);
      if (isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 400) {
        return jsonResponse(400, {
          error: 'Valor de peso inválido. Deve ser um número entre 20 e 400 kg.',
          code: 'INVALID_WEIGHT_VALUE'
        });
      }
      validatedWeight = Math.round(parsedWeight * 100) / 100;
    }

    let validatedAvatar: string | null | undefined = undefined;
    if (body.avatarBase64 !== undefined) {
      if (body.avatarBase64 === null) {
        validatedAvatar = null;
      } else if (typeof body.avatarBase64 === 'string') {
        if (body.avatarBase64.length > 2_000_000) {
          return jsonResponse(400, {
            error: 'Foto de perfil excede o limite permitido (máx 2MB em base64).',
            code: 'AVATAR_PAYLOAD_TOO_LARGE'
          });
        }
        validatedAvatar = body.avatarBase64;
      }
    }

    // Busca dados existentes do armazenamento permanente
    const currentStored = (await getAthleteData(targetUserId)) || {
      userId: targetUserId,
      currentWeightKg: null,
      weightHistory: [],
      weightGoal: { initialKg: null, currentKg: null, targetKg: null, objective: '', updatedAt: '' },
      waterLogs: {},
      nutritionDays: {},
      savedSets: {},
      selectedVariants: {},
      workoutHistory: [],
      updatedAt: new Date().toISOString()
    };

    // Validação e mesclagem de selectedVariants
    const mergedVariants: Record<string, string> = { ...(currentStored.selectedVariants || {}) };
    if (body.selectedVariants && typeof body.selectedVariants === 'object' && !Array.isArray(body.selectedVariants)) {
      for (const [k, v] of Object.entries(body.selectedVariants as Record<string, unknown>)) {
        if (typeof k === 'string' && typeof v === 'string' && k.length <= 60 && v.length <= 100) {
          mergedVariants[k.trim()] = v.trim();
        }
      }
    }

    // Validação e reconciliação segura de savedSets (RBAC & anti-sobrescrita cega)
    const mergedSavedSets: Record<string, CloudSavedSetState> = { ...(currentStored.savedSets || {}) };
    if (body.savedSets && typeof body.savedSets === 'object' && !Array.isArray(body.savedSets)) {
      const incoming = body.savedSets as Record<string, unknown>;
      for (const [key, val] of Object.entries(incoming)) {
        if (!key || typeof key !== 'string' || !val || typeof val !== 'object') {
          continue;
        }

        // SEGURANÇA RBAC: O atleta autenticado só pode salvar séries do seu próprio perfil
        // Padrão de chave de série: `${weekKey}:${userId}:${day}:${exId}:${set}`
        const parts = key.split(':');
        if (parts.length >= 2) {
          const keyUserId = parts[1];
          if (keyUserId !== authenticatedUserId || keyUserId !== targetUserId) {
            // Rejeita tentativas de gravar chaves forjadas para outro atleta
            continue;
          }
        }

        const candidate = val as Partial<CloudSavedSetState>;
        const existing = mergedSavedSets[key];

        const candidateDone = Boolean(candidate.done);
        const candidateWeight = typeof candidate.weightKg === 'string' ? candidate.weightKg : (candidate.weightKg !== undefined ? String(candidate.weightKg) : undefined);
        const candidateVariant = typeof candidate.variantId === 'string' ? candidate.variantId : undefined;
        const candidateEquipment = typeof candidate.equipmentName === 'string' ? candidate.equipmentName : undefined;
        const candidateExercise = typeof candidate.exerciseName === 'string' ? candidate.exerciseName : undefined;
        const candidateReps = typeof candidate.reps === 'string' ? candidate.reps : undefined;
        const candidateCompletedAt = typeof candidate.completedAt === 'string' ? candidate.completedAt : undefined;

        if (!existing) {
          mergedSavedSets[key] = {
            done: candidateDone,
            weightKg: candidateWeight,
            variantId: candidateVariant,
            equipmentName: candidateEquipment,
            exerciseName: candidateExercise,
            reps: candidateReps,
            completedAt: candidateCompletedAt
          };
        } else {
          const candTime = candidateCompletedAt ? new Date(candidateCompletedAt).getTime() : 0;
          const existTime = existing.completedAt ? new Date(existing.completedAt).getTime() : 0;

          if (candTime >= existTime || (candidateDone && !existing.done)) {
            mergedSavedSets[key] = {
              done: candidateDone,
              weightKg: candidateWeight !== undefined ? candidateWeight : existing.weightKg,
              variantId: candidateVariant || existing.variantId,
              equipmentName: candidateEquipment || existing.equipmentName,
              exerciseName: candidateExercise || existing.exerciseName,
              reps: candidateReps || existing.reps,
              completedAt: candidateCompletedAt || (candidateDone ? existing.completedAt || new Date().toISOString() : undefined)
            };
          } else if (!candidateDone && existing.done) {
            if (candTime > existTime) {
              mergedSavedSets[key] = {
                done: false,
                weightKg: candidateWeight !== undefined ? candidateWeight : existing.weightKg
              };
            }
          }
        }
      }
    }

    const updatedData: StoredAthleteData = {
      ...currentStored,
      userId: targetUserId,
      avatarBase64: validatedAvatar !== undefined ? validatedAvatar : currentStored.avatarBase64,
      currentWeightKg: validatedWeight !== null ? validatedWeight : currentStored.currentWeightKg,
      weightHistory: Array.isArray(body.weightHistory) ? body.weightHistory : currentStored.weightHistory,
      weightGoal: body.weightGoal && typeof body.weightGoal === 'object'
        ? (body.weightGoal as StoredAthleteData['weightGoal'])
        : currentStored.weightGoal,
      waterLogs: body.waterLogs && typeof body.waterLogs === 'object'
        ? (body.waterLogs as Record<string, number>)
        : currentStored.waterLogs,
      nutritionDays: body.nutritionDays && typeof body.nutritionDays === 'object'
        ? (body.nutritionDays as Record<string, unknown>)
        : currentStored.nutritionDays,
      savedSets: mergedSavedSets,
      selectedVariants: mergedVariants,
      workoutHistory: Array.isArray(body.workoutHistory) ? body.workoutHistory : currentStored.workoutHistory,
      customWorkouts: body.customWorkouts !== undefined ? body.customWorkouts : currentStored.customWorkouts,
      updatedAt: new Date().toISOString()
    };

    // Gravação no armazenamento permanente em nuvem com confirmação obrigatória
    try {
      await saveAthleteData(updatedData);
    } catch (saveError) {
      if (saveError instanceof PersistentStorageNotConfiguredError) {
        return jsonResponse(503, {
          error: saveError.message,
          code: 'PERSISTENT_STORAGE_NOT_CONFIGURED'
        });
      }
      if (saveError instanceof PersistentStorageWriteError) {
        return jsonResponse(500, {
          error: saveError.message,
          code: 'PERSISTENT_STORAGE_WRITE_FAILED'
        });
      }
      return jsonResponse(500, {
        error: `Erro ao persistir dados: ${saveError instanceof Error ? saveError.message : String(saveError)}`,
        code: 'INTERNAL_PERSISTENCE_ERROR'
      });
    }

    return jsonResponse(200, {
      success: true,
      updatedAt: updatedData.updatedAt,
      message: 'Dados sincronizados com sucesso no armazenamento permanente em nuvem.'
    });
  }

  return jsonResponse(405, { error: 'Método não permitido' });
}
