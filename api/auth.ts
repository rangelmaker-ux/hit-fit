import type { IncomingMessage, ServerResponse } from 'http';
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken
} from '../lib/auth-crypto';
import {
  saveUserAccount,
  getUserAccount,
  listAllUsers,
  saveAthleteData,
  getAthleteData,
  StoredUserAccount
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

/**
 * Calcula a idade com base na data de nascimento (YYYY-MM-DD)
 */
export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
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

  // GET: Obter sessão atual via Authorization Bearer token ou listar status de usuários registrados
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = await verifySessionToken(token);
      if (!session) {
        return sendJson(res, 401, { error: 'Sessão inválida ou expirada', valid: false });
      }

      const user = await getUserAccount(session.userId);
      return sendJson(res, 200, {
        valid: true,
        session,
        user: user
          ? {
              id: user.id,
              username: user.username,
              name: user.name,
              age: user.age,
              birthDate: user.birthDate,
              initialWeightKg: user.initialWeightKg,
              heightCm: user.heightCm,
              goal: user.goal,
              activityLevel: user.activityLevel
            }
          : null
      });
    }

    // Se não passou token, retorna quais contas já foram ativadas
    const allUsers = await listAllUsers();
    return sendJson(res, 200, {
      activeAccounts: allUsers.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        hasAccount: true
      }))
    });
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Método não permitido' });
  }

  const body = await parseBody(req);
  const action = body.action as string;

  // AÇÃO 1: CADASTRO INICIAL (REGISTER)
  if (action === 'register') {
    const {
      role, // 'rangel' | 'geicsania'
      name,
      birthDate,
      initialWeightKg,
      heightCm,
      goal,
      activityLevel,
      password,
      avatarBase64
    } = body;

    if (!role || !password || typeof password !== 'string' || password.length < 6) {
      return sendJson(res, 400, {
        error: 'Dados incompletos: selecione o atleta e informe uma senha de no mínimo 6 caracteres.'
      });
    }

    const username = role === 'geicsania' ? 'geicsania' : 'rangel';
    const userId = `person-${username}`;
    const cleanName = (typeof name === 'string' && name.trim()) || (username === 'rangel' ? 'Rangel' : 'Geicsania');

    const age = calculateAge(typeof birthDate === 'string' ? birthDate : '');
    const weight = Number(initialWeightKg) || (username === 'rangel' ? 82 : 64);
    const height = Number(heightCm) || (username === 'rangel' ? 178 : 165);

    // Gera salt e hash criptográfico PBKDF2
    const salt = generateSalt(16);
    const passwordHash = await hashPassword(password, salt);

    const now = new Date().toISOString();
    const newUser: StoredUserAccount = {
      id: userId,
      username,
      name: cleanName,
      birthDate: typeof birthDate === 'string' ? birthDate : '',
      age,
      initialWeightKg: weight,
      heightCm: height,
      goal: typeof goal === 'string' ? goal : 'Emagrecimento & Definição',
      activityLevel: typeof activityLevel === 'string' ? activityLevel : 'Moderado',
      salt,
      passwordHash,
      createdAt: now,
      updatedAt: now
    };

    await saveUserAccount(newUser);

    // Cria registro inicial do atleta se não existir
    const existingData = await getAthleteData(userId);
    if (!existingData) {
      await saveAthleteData({
        userId,
        avatarBase64: typeof avatarBase64 === 'string' ? avatarBase64 : null,
        currentWeightKg: weight,
        weightHistory: [
          {
            id: `weight-${Date.now()}`,
            date: now.split('T')[0],
            weightKg: weight,
            notes: 'Pesagem inicial do cadastro'
          }
        ],
        weightGoal: {
          initialKg: weight,
          currentKg: weight,
          targetKg: Math.round((weight - 5) * 10) / 10,
          objective: newUser.goal,
          updatedAt: now
        },
        waterLogs: {},
        nutritionDays: {},
        savedSets: {},
        workoutHistory: [],
        updatedAt: now
      });
    }

    // Emite token de sessão criptográfico
    const token = await createSessionToken({
      id: userId,
      name: cleanName,
      role: username
    });

    return sendJson(res, 201, {
      success: true,
      token,
      user: {
        id: userId,
        username,
        name: cleanName,
        age,
        birthDate: newUser.birthDate,
        initialWeightKg: weight,
        heightCm: height,
        goal: newUser.goal,
        activityLevel: newUser.activityLevel
      }
    });
  }

  // AÇÃO 2: LOGIN COM SENHA REAL
  if (action === 'login') {
    const { usernameOrRole, password } = body;
    if (!usernameOrRole || !password || typeof password !== 'string') {
      return sendJson(res, 400, { error: 'Informe o atleta e a senha.' });
    }

    const normalized = (usernameOrRole as string).toLowerCase().includes('geic') ? 'geicsania' : 'rangel';
    const user = await getUserAccount(normalized);

    if (!user) {
      return sendJson(res, 404, {
        error: `Conta de ${normalized === 'rangel' ? 'Rangel' : 'Geicsania'} ainda não foi ativada. Realize o cadastro inicial.`
      });
    }

    const isMatch = await verifyPassword(password, user.salt, user.passwordHash);
    if (!isMatch) {
      return sendJson(res, 401, { error: 'Senha incorreta. Tente novamente.' });
    }

    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      role: user.username
    });

    return sendJson(res, 200, {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        age: user.age,
        birthDate: user.birthDate,
        initialWeightKg: user.initialWeightKg,
        heightCm: user.heightCm,
        goal: user.goal,
        activityLevel: user.activityLevel
      }
    });
  }

  return sendJson(res, 400, { error: 'Ação não reconhecida.' });
}
