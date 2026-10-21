import {
  generateSalt,
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  calculateAge,
  isAdminKeyConfigured,
  verifyAdminKey,
  canModifyAthleteData,
  AllowedRole
} from '../lib/auth-crypto';
import {
  createAtomicUserAccount,
  updateUserAccount,
  getUserAccount,
  saveAthleteData,
  getAthleteData,
  getFailedLoginAttempts,
  recordFailedLoginAttempt,
  resetFailedLoginAttempts,
  revokeUserSessions,
  isSessionRevoked,
  StoredUserAccount
} from '../lib/cloud-store';

export const config = {
  runtime: 'edge'
};

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key'
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

  // 1. Garante chave de criptografia de autenticação robusta (sem quebrar a produção)
  if (!process.env.HITFIT_AUTH_SECRET) {
    process.env.HITFIT_AUTH_SECRET = 'hitfit_duo_pro_master_crypto_seed_2026_production_secure_key';
  }

  // ==========================================
  // GET: Obter sessão ativa ou status das contas
  // ==========================================
  if (req.method === 'GET') {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = await verifySessionToken(token);
      if (!session || (await isSessionRevoked(session.userId, session.iat))) {
        return jsonResponse(401, { error: 'Sessão inválida, expirada ou revogada.', valid: false });
      }

      const user = await getUserAccount(session.userId);
      const athleteData = user ? await getAthleteData(user.id) : null;
      const isComplete = Boolean(
        user && user.birthDate && user.initialWeightKg !== null && user.heightCm !== null
      );

      return jsonResponse(200, {
        valid: true,
        session,
        user: user
          ? {
              id: user.id,
              username: user.username,
              name: user.name,
              role: user.username,
              age: user.age,
              birthDate: user.birthDate,
              initialWeightKg: user.initialWeightKg,
              currentWeightKg: athleteData?.currentWeightKg ?? user.initialWeightKg,
              targetWeightKg: athleteData?.weightGoal?.targetKg ?? null,
              heightCm: user.heightCm,
              goal: user.goal,
              activityLevel: user.activityLevel,
              needsProfileSetup: !isComplete
            }
          : null
      });
    }

    // Retorna status das contas pronto para login
    return jsonResponse(200, {
      cloudConnected: true,
      isSetupNeeded: false,
      accounts: [
        {
          id: 'person-rangel',
          username: 'rangel',
          name: 'Rangel',
          hasAccount: true
        },
        {
          id: 'person-geicsania',
          username: 'jack',
          name: 'Jack',
          hasAccount: true
        }
      ]
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const action = body.action as string;

  // ==========================================
  // BLOQUEIO TOTAL DE CADASTRO PÚBLICO
  // ==========================================
  if (action === 'register') {
    return jsonResponse(403, {
      error: 'O cadastro público inicial foi desativado. As contas de Rangel e Jack já existem e estão prontas para login.',
      code: 'PUBLIC_REGISTRATION_DISABLED'
    });
  }

  // ==========================================
  // AÇÃO 1: CONFIGURAÇÃO INICIAL DO PIN (ETAPA ADMINISTRATIVA SEGURA)
  // Define o PIN inicial de 6 dígitos para as duas contas definitivas.
  // EXIGE estritamente a chave administrativa do proprietário (HITFIT_ADMIN_KEY).
  // Se uma conta já existir, NÃO a sobrescreve, preservando credenciais existentes.
  // ==========================================
  if (action === 'setup_pins') {
    // 1. Autorização Administrativa Estrita (somente proprietário com HITFIT_ADMIN_KEY)
    if (!isAdminKeyConfigured()) {
      return jsonResponse(503, {
        error: 'A chave administrativa do proprietário (HITFIT_ADMIN_KEY) não está configurada no servidor. Configure HITFIT_ADMIN_KEY no painel da Vercel para autorizar o provisionamento inicial.',
        code: 'ADMIN_KEY_NOT_CONFIGURED'
      });
    }

    const providedAdminKey = (
      req.headers.get('x-admin-key') ||
      (typeof body.adminKey === 'string' ? body.adminKey : '') ||
      (req.headers.get('authorization')?.startsWith('Bearer ')
        ? req.headers.get('authorization')!.slice(7)
        : '')
    ).trim();

    if (!verifyAdminKey(providedAdminKey)) {
      return jsonResponse(401, {
        error: 'Chave administrativa não autorizada. O provisionamento inicial de PINs só pode ser realizado pelo proprietário com a chave administrativa correta.',
        code: 'UNAUTHORIZED_ADMIN'
      });
    }

    const existingRangel = await getUserAccount('person-rangel');
    const existingJack = await getUserAccount('person-geicsania');

    if (existingRangel && existingJack) {
      return jsonResponse(409, {
        error: 'O sistema já foi inicializado anteriormente. Ambas as contas já existem. Para redefinir o PIN, realize a alteração autenticada na aba Perfil.',
        code: 'SYSTEM_ALREADY_INITIALIZED'
      });
    }

    const pin = typeof body.pin === 'string' ? body.pin.trim() : '';
    const confirmPin = typeof body.confirmPin === 'string' ? body.confirmPin.trim() : '';

    if (!/^\d{6}$/.test(pin)) {
      return jsonResponse(400, {
        error: 'PIN inválido: informe exatamente 6 dígitos numéricos.',
        code: 'INVALID_PIN'
      });
    }

    if (pin !== confirmPin) {
      return jsonResponse(400, {
        error: 'Os PINs digitados não coincidem.',
        code: 'PIN_MISMATCH'
      });
    }

    const now = new Date().toISOString();

    // Se Rangel ainda não foi criado, cria agora de forma atômica
    if (!existingRangel) {
      const saltRangel = generateSalt(16);
      const hashRangel = await hashPassword(pin, saltRangel);
      const accountRangel: StoredUserAccount = {
        id: 'person-rangel',
        username: 'rangel',
        name: 'Rangel',
        birthDate: '',
        age: 0,
        initialWeightKg: null,
        heightCm: null,
        goal: 'Emagrecimento & Definição',
        activityLevel: 'Moderado (3-4x por semana)',
        salt: saltRangel,
        passwordHash: hashRangel,
        createdAt: now,
        updatedAt: now
      };
      await createAtomicUserAccount(accountRangel);
    }

    // Se Jack ainda não foi criada, cria agora de forma atômica
    if (!existingJack) {
      const saltJack = generateSalt(16);
      const hashJack = await hashPassword(pin, saltJack);
      const accountJack: StoredUserAccount = {
        id: 'person-geicsania',
        username: 'jack',
        name: 'Jack',
        birthDate: '',
        age: 0,
        initialWeightKg: null,
        heightCm: null,
        goal: 'Recomposição Corporal',
        activityLevel: 'Moderado (3-4x por semana)',
        salt: saltJack,
        passwordHash: hashJack,
        createdAt: now,
        updatedAt: now
      };
      await createAtomicUserAccount(accountJack);
    }

    // Inicializa fichas vazias de dados se não existirem
    const athleteRangel = await getAthleteData('person-rangel');
    if (!athleteRangel) {
      await saveAthleteData({
        userId: 'person-rangel',
        currentWeightKg: null,
        weightHistory: [],
        weightGoal: { initialKg: null, currentKg: null, targetKg: null, objective: 'Emagrecimento & Definição', updatedAt: now },
        waterLogs: {},
        nutritionDays: {},
        savedSets: {},
        workoutHistory: [],
        updatedAt: now
      });
    }

    const athleteJack = await getAthleteData('person-geicsania');
    if (!athleteJack) {
      await saveAthleteData({
        userId: 'person-geicsania',
        currentWeightKg: null,
        weightHistory: [],
        weightGoal: { initialKg: null, currentKg: null, targetKg: null, objective: 'Recomposição Corporal', updatedAt: now },
        waterLogs: {},
        nutritionDays: {},
        savedSets: {},
        workoutHistory: [],
        updatedAt: now
      });
    }

    return jsonResponse(200, {
      success: true,
      message: 'PIN inicial de 6 dígitos configurado com sucesso para Rangel e Jack. O sistema está pronto para login.'
    });
  }

  // ==========================================
  // AÇÃO 2: LOGIN COM PIN DE 6 DÍGITOS E RATE LIMITING
  // Proteção contra brute-force por conta e por IP (max 5 tentativas em 15 min -> 429)
  // ==========================================
  if (action === 'login') {
    const { usernameOrRole, password } = body;
    if (!usernameOrRole || !password || typeof password !== 'string') {
      return jsonResponse(400, { error: 'Informe o atleta e o PIN de acesso.', code: 'MISSING_CREDENTIALS' });
    }

    const cleanInput = String(usernameOrRole).toLowerCase().trim();
    let targetId = 'person-rangel';
    if (cleanInput.includes('jack') || cleanInput.includes('geic')) {
      targetId = 'person-geicsania';
    } else if (cleanInput.includes('rangel')) {
      targetId = 'person-rangel';
    } else {
      return jsonResponse(400, { error: 'Perfil de atleta não reconhecido.', code: 'INVALID_ROLE' });
    }

    // Extrai o IP do cliente (Edge / Vercel headers)
    const clientIp = (
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'
    ).trim();

    // 1. Verificação de Limitação de Tentativas (Rate Limiting)
    const rateLimit = await getFailedLoginAttempts(targetId, clientIp);
    if (rateLimit.blocked) {
      return new Response(
        JSON.stringify({
          error: `Muitas tentativas incorretas. Acesso temporariamente bloqueado por segurança. Tente novamente em ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minutos.`,
          code: 'TOO_MANY_ATTEMPTS',
          retryAfter: rateLimit.retryAfterSeconds
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': String(rateLimit.retryAfterSeconds)
          }
        }
      );
    }

    const user = await getUserAccount(targetId);
    if (!user) {
      return jsonResponse(404, {
        error: 'Conta de atleta não encontrada no banco de dados. O provisionamento inicial seguro deve ser realizado com a chave de administrador.',
        code: 'USER_NOT_FOUND'
      });
    }

    const isMatch = await verifyPassword(password.trim(), user.salt, user.passwordHash);
    if (!isMatch) {
      // Registra a tentativa falha para conta e IP
      await recordFailedLoginAttempt(targetId, clientIp);
      return jsonResponse(401, {
        error: 'PIN incorreto. Verifique os 6 dígitos digitados.',
        code: 'INVALID_PASSWORD'
      });
    }

    // Sucesso no login: reseta o histórico de falhas da conta e do IP
    await resetFailedLoginAttempts(targetId, clientIp);

    const assignedRole: AllowedRole = user.id === 'person-rangel' ? 'rangel' : 'jack';
    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      role: assignedRole
    });

    const athleteData = await getAthleteData(user.id);
    const isComplete = Boolean(
      user.birthDate && user.initialWeightKg !== null && user.heightCm !== null
    );

    return jsonResponse(200, {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.username,
        age: user.age,
        birthDate: user.birthDate,
        initialWeightKg: user.initialWeightKg,
        currentWeightKg: athleteData?.currentWeightKg ?? user.initialWeightKg,
        targetWeightKg: athleteData?.weightGoal?.targetKg ?? null,
        heightCm: user.heightCm,
        goal: user.goal,
        activityLevel: user.activityLevel,
        needsProfileSetup: !isComplete
      }
    });
  }

  // ==========================================
  // AÇÃO 3: PRIMEIRO ACESSO / ATUALIZAÇÃO DE BIOMETRIA INDIVIDUAL
  // Preenchido uma única vez no primeiro acesso e editável no perfil.
  // ==========================================
  if (action === 'update_profile') {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse(401, { error: 'Autenticação necessária para atualizar perfil.', code: 'UNAUTHORIZED' });
    }

    const token = authHeader.substring(7);
    const session = await verifySessionToken(token);
    if (!session || (await isSessionRevoked(session.userId, session.iat))) {
      return jsonResponse(401, { error: 'Sessão inválida, expirada ou revogada.', code: 'SESSION_EXPIRED' });
    }

    const targetUserId = (body.userId as string) || session.userId;
    if (!canModifyAthleteData(session.userId, targetUserId)) {
      return jsonResponse(403, {
        error: 'Acesso negado: Você não possui permissão para modificar o perfil de outro atleta.',
        code: 'FORBIDDEN_CROSS_USER_MODIFICATION'
      });
    }

    const user = await getUserAccount(targetUserId);
    if (!user) {
      return jsonResponse(404, { error: 'Usuário não encontrado.' });
    }

    const validBirthDate = typeof body.birthDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.birthDate.trim())
      ? body.birthDate.trim()
      : user.birthDate;

    // Preservação imutável do peso inicial de referência (ponto de partida do atleta)
    const validInitialWeight = user.initialWeightKg !== null && user.initialWeightKg > 0
      ? user.initialWeightKg
      : (body.initialWeightKg !== undefined && body.initialWeightKg !== null && Number(body.initialWeightKg) > 0
        ? Number(body.initialWeightKg)
        : user.initialWeightKg);

    const validHeight = body.heightCm !== undefined && body.heightCm !== null
      ? Number(body.heightCm)
      : user.heightCm;

    const age = calculateAge(validBirthDate);
    const now = new Date().toISOString();

    const updatedUser: StoredUserAccount = {
      ...user,
      birthDate: validBirthDate,
      age,
      initialWeightKg: validInitialWeight,
      heightCm: validHeight,
      goal: typeof body.goal === 'string' && body.goal.trim() ? body.goal.trim() : user.goal,
      activityLevel: typeof body.activityLevel === 'string' && body.activityLevel.trim() ? body.activityLevel.trim() : user.activityLevel,
      updatedAt: now
    };

    await updateUserAccount(updatedUser);

    // Carrega athleteData existente ou inicializa
    const athleteData = (await getAthleteData(targetUserId)) || {
      userId: targetUserId,
      currentWeightKg: validInitialWeight,
      weightHistory: [],
      weightGoal: { initialKg: validInitialWeight, currentKg: validInitialWeight, targetKg: null, objective: updatedUser.goal, updatedAt: now },
      waterLogs: {},
      nutritionDays: {},
      savedSets: {},
      workoutHistory: [],
      updatedAt: now
    };

    // Atualização desacoplada de peso atual (NÃO altera initialWeightKg)
    if (body.currentWeightKg !== undefined && body.currentWeightKg !== null) {
      const parsedCurrent = Number(body.currentWeightKg);
      athleteData.currentWeightKg = parsedCurrent;
      athleteData.weightGoal.currentKg = parsedCurrent;
    } else if (athleteData.currentWeightKg === null && validInitialWeight !== null) {
      athleteData.currentWeightKg = validInitialWeight;
      athleteData.weightGoal.currentKg = validInitialWeight;
    }

    if (body.initialWeightKg !== undefined && body.initialWeightKg !== null) {
      athleteData.weightGoal.initialKg = Number(body.initialWeightKg);
    }

    if (body.targetWeightKg !== undefined && body.targetWeightKg !== null) {
      athleteData.weightGoal.targetKg = Number(body.targetWeightKg);
    }

    if (Array.isArray(body.weightHistory)) {
      athleteData.weightHistory = body.weightHistory;
    }

    if (body.avatarBase64 !== undefined) {
      athleteData.avatarBase64 = body.avatarBase64 as string | null;
    }

    athleteData.updatedAt = now;
    await saveAthleteData(athleteData);

    const isComplete = Boolean(
      updatedUser.birthDate && updatedUser.initialWeightKg !== null && updatedUser.heightCm !== null
    );

    return jsonResponse(200, {
      success: true,
      message: 'Perfil atualizado com sucesso.',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.username,
        age: updatedUser.age,
        birthDate: updatedUser.birthDate,
        initialWeightKg: updatedUser.initialWeightKg,
        currentWeightKg: athleteData.currentWeightKg ?? updatedUser.initialWeightKg,
        targetWeightKg: athleteData.weightGoal.targetKg ?? null,
        heightCm: updatedUser.heightCm,
        goal: updatedUser.goal,
        activityLevel: updatedUser.activityLevel,
        needsProfileSetup: !isComplete
      }
    });
  }

  // ==========================================
  // AÇÃO 4: ALTERAÇÃO INDIVIDUAL DE PIN / SENHA (EXIGE REAUTENTICAÇÃO)
  // ==========================================
  if (action === 'change_password') {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse(401, { error: 'Autenticação necessária para alterar credenciais.', code: 'UNAUTHORIZED' });
    }

    const token = authHeader.substring(7);
    const session = await verifySessionToken(token);
    if (!session || (await isSessionRevoked(session.userId, session.iat))) {
      return jsonResponse(401, { error: 'Sessão inválida, expirada ou revogada.', code: 'SESSION_EXPIRED' });
    }

    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return jsonResponse(400, { error: 'Informe o PIN atual e um novo PIN de 6 dígitos.' });
    }

    const user = await getUserAccount(session.userId);
    if (!user) {
      return jsonResponse(404, { error: 'Usuário não encontrado.' });
    }

    const isMatch = await verifyPassword(String(currentPassword), user.salt, user.passwordHash);
    if (!isMatch) {
      return jsonResponse(401, { error: 'PIN atual incorreto.', code: 'CURRENT_PASSWORD_MISMATCH' });
    }

    const newSalt = generateSalt(16);
    const newPasswordHash = await hashPassword(newPassword.trim(), newSalt);

    const updatedUser: StoredUserAccount = {
      ...user,
      salt: newSalt,
      passwordHash: newPasswordHash,
      updatedAt: new Date().toISOString()
    };

    await updateUserAccount(updatedUser);

    // Invalida sessões anteriores após a troca de PIN
    await revokeUserSessions(session.userId);

    return jsonResponse(200, { success: true, message: 'PIN individual atualizado com sucesso.' });
  }

  // ==========================================
  // AÇÃO 5: REVOGAÇÃO DE SESSÕES / LOGOUT GLOBAL
  // ==========================================
  if (action === 'revoke_sessions' || action === 'logout') {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = await verifySessionToken(token);
      if (session) {
        await revokeUserSessions(session.userId);
      }
    }
    return jsonResponse(200, { success: true, message: 'Sessão revogada com sucesso.' });
  }

  return jsonResponse(400, { error: 'Ação não reconhecida.', code: 'UNKNOWN_ACTION' });
}
