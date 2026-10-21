import {
  generateSalt,
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  calculateAge,
  isAuthSecretConfigured,
  isValidRole,
  AllowedRole
} from '../lib/auth-crypto';
import {
  createAtomicUserAccount,
  updateUserAccount,
  getUserAccount,
  listAllUsers,
  saveAthleteData,
  isCloudConfigured,
  StoredUserAccount
} from '../lib/cloud-store';

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

  // 1. Verificação Prévia de Infraestrutura e Segredos (Falha Segura)
  if (!isAuthSecretConfigured()) {
    return jsonResponse(503, {
      error: 'Serviço de autenticação temporariamente indisponível: a variável HITFIT_AUTH_SECRET não está configurada no servidor. Configure HITFIT_AUTH_SECRET no painel da Vercel antes de operar.',
      code: 'AUTH_SECRET_MISSING'
    });
  }

  // GET: Obter sessão ativa ou listar contas ativadas
  if (req.method === 'GET') {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = await verifySessionToken(token);
      if (!session) {
        return jsonResponse(401, { error: 'Sessão inválida ou expirada.', valid: false });
      }

      const user = await getUserAccount(session.userId);
      return jsonResponse(200, {
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

    // Retorna status das contas e da infraestrutura sem expor dados sensíveis
    const allUsers = await listAllUsers();
    return jsonResponse(200, {
      cloudConnected: isCloudConfigured(),
      activeAccounts: allUsers.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        hasAccount: true
      }))
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' });
  }

  // 2. Operações de Escrita exigem persistência em nuvem real configurada
  if (!isCloudConfigured()) {
    return jsonResponse(503, {
      error: 'Banco de dados permanente pendente de ativação: configure KV_REST_API_URL e KV_REST_API_TOKEN no painel da Vercel para aceitar cadastros e persistência.',
      code: 'PERSISTENT_STORAGE_NOT_CONFIGURED'
    });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const action = body.action as string;

  // ==========================================
  // AÇÃO 1: CADASTRO INICIAL (ATÔMICO E PROTEGIDO CONTRA SOBRESCRITA)
  // ==========================================
  if (action === 'register') {
    const {
      role,
      name,
      birthDate,
      initialWeightKg,
      heightCm,
      goal,
      activityLevel,
      targetWeightKg,
      password,
      avatarBase64
    } = body;

    // Validação estrita da Role permitida (Rangel ou Geicsania exclusivamente)
    if (!role || typeof role !== 'string' || !isValidRole(role)) {
      return jsonResponse(400, {
        error: 'Identidade de atleta inválida. As contas são restritas a Rangel e Geicsania.',
        code: 'INVALID_ROLE'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return jsonResponse(400, {
        error: 'Senha inválida: informe uma senha de no mínimo 6 caracteres.',
        code: 'INVALID_PASSWORD'
      });
    }

    const assignedRole: AllowedRole = role;
    const userId = `person-${assignedRole}`;

    // REGRA DE PROTEÇÃO CONTRA SOBRESCRITA PÚBLICA:
    // O registro inicial de cada conta só pode ocorrer UMA ÚNICA VEZ.
    const existingAccount = await getUserAccount(userId);
    if (existingAccount) {
      return jsonResponse(409, {
        error: `A conta de ${assignedRole === 'rangel' ? 'Rangel' : 'Geicsania'} já foi ativada anteriormente. Utilize a tela de login ou a recuperação segura de acesso.`,
        code: 'ACCOUNT_ALREADY_REGISTERED'
      });
    }

    // Validação dos dados biométricos (SEM DADOS FICTÍCIOS OU VALORES INVENTADOS)
    const validWeight = initialWeightKg !== null && initialWeightKg !== undefined && !isNaN(Number(initialWeightKg))
      ? Number(initialWeightKg)
      : null;

    const validHeight = heightCm !== null && heightCm !== undefined && !isNaN(Number(heightCm))
      ? Number(heightCm)
      : null;

    const validBirthDate = typeof birthDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(birthDate.trim())
      ? birthDate.trim()
      : '';

    const age = calculateAge(validBirthDate);
    const cleanName = (typeof name === 'string' && name.trim()) || (assignedRole === 'rangel' ? 'Rangel' : 'Geicsania');

    // Criptografia da Senha com Salt Único e PBKDF2
    const salt = generateSalt(16);
    const passwordHash = await hashPassword(password, salt);
    const now = new Date().toISOString();

    const newUser: StoredUserAccount = {
      id: userId,
      username: assignedRole,
      name: cleanName,
      birthDate: validBirthDate,
      age,
      initialWeightKg: validWeight,
      heightCm: validHeight,
      goal: typeof goal === 'string' && goal.trim() ? goal.trim() : 'Emagrecimento & Definição',
      activityLevel: typeof activityLevel === 'string' && activityLevel.trim() ? activityLevel.trim() : 'Moderado',
      salt,
      passwordHash,
      createdAt: now,
      updatedAt: now
    };

    // Gravação ATÔMICA com SET ... NX (impede concorrência)
    const created = await createAtomicUserAccount(newUser);
    if (!created) {
      return jsonResponse(409, {
        error: 'Conflito de registro: esta conta foi ativada simultaneamente.',
        code: 'ACCOUNT_RACE_CONFLICT'
      });
    }

    // Inicializa a ficha do atleta no banco permanente
    const validTargetWeight = targetWeightKg !== null && targetWeightKg !== undefined && !isNaN(Number(targetWeightKg))
      ? Number(targetWeightKg)
      : null;

    await saveAthleteData({
      userId,
      avatarBase64: typeof avatarBase64 === 'string' ? avatarBase64 : null,
      currentWeightKg: validWeight,
      weightHistory: validWeight
        ? [
            {
              id: `weight-${Date.now()}`,
              date: now.split('T')[0],
              weightKg: validWeight,
              notes: 'Pesagem inicial do cadastro'
            }
          ]
        : [],
      weightGoal: {
        initialKg: validWeight,
        currentKg: validWeight,
        targetKg: validTargetWeight,
        objective: newUser.goal,
        updatedAt: now
      },
      waterLogs: {},
      nutritionDays: {},
      savedSets: {},
      workoutHistory: [],
      updatedAt: now
    });

    // Emissão do token de sessão assinado
    const token = await createSessionToken({
      id: userId,
      name: cleanName,
      role: assignedRole
    });

    return jsonResponse(201, {
      success: true,
      token,
      user: {
        id: userId,
        username: assignedRole,
        name: cleanName,
        age,
        birthDate: validBirthDate,
        initialWeightKg: validWeight,
        heightCm: validHeight,
        goal: newUser.goal,
        activityLevel: newUser.activityLevel
      }
    });
  }

  // ==========================================
  // AÇÃO 2: LOGIN COM SENHA REAL INDIVIDUAL
  // ==========================================
  if (action === 'login') {
    const { usernameOrRole, password } = body;
    if (!usernameOrRole || !password || typeof password !== 'string') {
      return jsonResponse(400, { error: 'Informe o atleta e a senha.', code: 'MISSING_CREDENTIALS' });
    }

    const normalized = (usernameOrRole as string).toLowerCase().includes('geic') ? 'geicsania' : 'rangel';
    if (!isValidRole(normalized)) {
      return jsonResponse(400, { error: 'Identidade de atleta inválida.', code: 'INVALID_ROLE' });
    }

    const user = await getUserAccount(normalized);
    if (!user) {
      return jsonResponse(404, {
        error: `A conta de ${normalized === 'rangel' ? 'Rangel' : 'Geicsania'} ainda não foi ativada. Realize o cadastro inicial.`,
        code: 'ACCOUNT_NOT_ACTIVATED'
      });
    }

    const isMatch = await verifyPassword(password, user.salt, user.passwordHash);
    if (!isMatch) {
      return jsonResponse(401, { error: 'Senha incorreta. Tente novamente.', code: 'INVALID_PASSWORD' });
    }

    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      role: user.username
    });

    return jsonResponse(200, {
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

  // ==========================================
  // AÇÃO 3: ALTERAÇÃO DE SENHA (EXIGE REAUTENTICAÇÃO)
  // ==========================================
  if (action === 'change_password') {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse(401, { error: 'Autenticação necessária para alterar credenciais.', code: 'UNAUTHORIZED' });
    }

    const token = authHeader.substring(7);
    const session = await verifySessionToken(token);
    if (!session) {
      return jsonResponse(401, { error: 'Sessão inválida ou expirada.', code: 'SESSION_EXPIRED' });
    }

    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return jsonResponse(400, { error: 'Informe a senha atual e uma nova senha válida (mínimo 6 caracteres).' });
    }

    const user = await getUserAccount(session.userId);
    if (!user) {
      return jsonResponse(404, { error: 'Usuário não encontrado.' });
    }

    const isMatch = await verifyPassword(String(currentPassword), user.salt, user.passwordHash);
    if (!isMatch) {
      return jsonResponse(401, { error: 'Senha atual incorreta.', code: 'CURRENT_PASSWORD_MISMATCH' });
    }

    // Gera novo salt e novo hash
    const newSalt = generateSalt(16);
    const newPasswordHash = await hashPassword(newPassword, newSalt);

    const updatedUser: StoredUserAccount = {
      ...user,
      salt: newSalt,
      passwordHash: newPasswordHash,
      updatedAt: new Date().toISOString()
    };

    await updateUserAccount(updatedUser);

    return jsonResponse(200, { success: true, message: 'Senha atualizada com sucesso.' });
  }

  return jsonResponse(400, { error: 'Ação não reconhecida.', code: 'UNKNOWN_ACTION' });
}
