import type { IncomingMessage, ServerResponse } from 'http';
import { verifySessionToken, canModifyAthleteData } from '../lib/auth-crypto';
import {
  saveAthleteData,
  getAthleteData,
  StoredAthleteData
} from '../lib/cloud-store';

interface RequestWithBody extends IncomingMessage {
  body?: unknown;
}

async function parseBody(req: RequestWithBody): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

export default async function handler(req: RequestWithBody, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // 1. Verificação Estrita do Token de Sessão em qualquer operação
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendJson(res, 401, {
      error: 'Não autorizado: Token de autenticação ausente ou inválido.',
      code: 'UNAUTHORIZED'
    });
  }

  const token = authHeader.substring(7);
  const session = await verifySessionToken(token);
  if (!session) {
    return sendJson(res, 401, {
      error: 'Sessão expirada ou assinatura do token inválida. Faça login novamente.',
      code: 'SESSION_EXPIRED'
    });
  }

  const authenticatedUserId = session.userId;

  // GET: PULL DATA (Buscar dados do atleta autenticado + dados do parceiro em modo leitura)
  if (req.method === 'GET') {
    const url = new URL(req.url || '/', 'http://localhost');
    const partnerId = url.searchParams.get('partnerId');

    const myData = await getAthleteData(authenticatedUserId);

    let partnerData: StoredAthleteData | null = null;
    if (partnerId) {
      partnerData = await getAthleteData(partnerId);
    }

    return sendJson(res, 200, {
      success: true,
      athlete: myData,
      partner: partnerData
        ? {
            ...partnerData,
            isReadOnly: true // Garantia de que o parceiro é somente leitura
          }
        : null,
      serverTimestamp: Date.now()
    });
  }

  // POST: PUSH DATA (Salvar dados de treino, peso, água, metas, etc.)
  if (req.method === 'POST') {
    const body = await parseBody(req);
    const targetUserId = body.userId as string;

    if (!targetUserId) {
      return sendJson(res, 400, {
        error: 'Identificador do atleta (userId) é obrigatório.',
        code: 'MISSING_USER_ID'
      });
    }

    // REGRA DE SEGURANÇA FUNDAMENTAL (RBAC):
    // Impede ataques por chamadas diretas às APIs e adulteração de identificadores enviados pelo cliente.
    // Rangel pode salvar SOMENTE dados de Rangel. Jéssania pode salvar SOMENTE dados de Jéssania.
    if (!canModifyAthleteData(authenticatedUserId, targetUserId)) {
      return sendJson(res, 403, {
        error: `Acesso negado: O usuário autenticado (${session.name}) não possui permissão para modificar os dados de outro atleta (${targetUserId}).`,
        code: 'FORBIDDEN_CROSS_USER_MODIFICATION',
        authenticatedUser: session.userId,
        targetUser: targetUserId
      });
    }

    // Atualiza os dados persistentes no servidor
    const currentStored = (await getAthleteData(targetUserId)) || {
      userId: targetUserId,
      currentWeightKg: 0,
      weightHistory: [],
      weightGoal: { initialKg: 0, currentKg: 0, targetKg: 0, objective: '', updatedAt: '' },
      waterLogs: {},
      nutritionDays: {},
      savedSets: {},
      workoutHistory: [],
      updatedAt: new Date().toISOString()
    };

    const updatedData: StoredAthleteData = {
      ...currentStored,
      userId: targetUserId,
      avatarBase64: body.avatarBase64 !== undefined ? (body.avatarBase64 as string | null) : currentStored.avatarBase64,
      currentWeightKg: body.currentWeightKg !== undefined ? Number(body.currentWeightKg) : currentStored.currentWeightKg,
      weightHistory: Array.isArray(body.weightHistory) ? body.weightHistory : currentStored.weightHistory,
      weightGoal: body.weightGoal ? (body.weightGoal as StoredAthleteData['weightGoal']) : currentStored.weightGoal,
      waterLogs: body.waterLogs ? (body.waterLogs as Record<string, number>) : currentStored.waterLogs,
      nutritionDays: body.nutritionDays ? (body.nutritionDays as Record<string, unknown>) : currentStored.nutritionDays,
      savedSets: body.savedSets ? (body.savedSets as Record<string, { done: boolean; weightKg?: string }>) : currentStored.savedSets,
      workoutHistory: Array.isArray(body.workoutHistory) ? body.workoutHistory : currentStored.workoutHistory,
      customWorkouts: body.customWorkouts !== undefined ? body.customWorkouts : currentStored.customWorkouts,
      updatedAt: new Date().toISOString()
    };

    await saveAthleteData(updatedData);

    return sendJson(res, 200, {
      success: true,
      updatedAt: updatedData.updatedAt,
      message: 'Dados sincronizados com sucesso na nuvem.'
    });
  }

  return sendJson(res, 405, { error: 'Método não permitido' });
}
