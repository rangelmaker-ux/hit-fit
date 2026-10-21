import {
  generateSalt,
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  calculateAge,
  isAdminKeyConfigured,
  verifyAdminKey,
  isAuthSecretConfigured,
  canModifyAthleteData
} from '../lib/auth-crypto';
import type { AllowedRole } from '../lib/auth-crypto';
import {
  updateUserAccount,
  getUserAccount,
  saveAthleteData,
  getAthleteData,
  getFailedLoginAttempts,
  recordFailedLoginAttempt,
  resetFailedLoginAttempts,
  revokeUserSessions,
  isSessionRevoked,
  adminResetHitFitNamespace,
  adminSetupUserPins,
  isCloudConfigured,
  isProductionEnvironment
} from '../lib/cloud-store';
import type { StoredUserAccount } from '../lib/cloud-store';

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

  // ==========================================
  // GET: Obter sessão ativa ou status real das contas
  // ==========================================
  if (req.method === 'GET') {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (!isAuthSecretConfigured()) {
        return jsonResponse(401, { error: 'Sessão inválida (chave de autenticação ausente).', valid: false });
      }
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

    // Consulta verídica às contas no Redis / KV
    let userRangel: StoredUserAccount | null = null;
    let userJack: StoredUserAccount | null = null;
    if (isCloudConfigured()) {
      userRangel = await getUserAccount('person-rangel');
      userJack = await getUserAccount('person-geicsania');
    }
    const hasRangel = Boolean(userRangel);
    const hasJack = Boolean(userJack);
    const isSetupNeeded = !hasRangel || !hasJack;

    const providedAdminKey = (
      req.headers.get('x-admin-key') ||
      (req.headers.get('authorization')?.startsWith('Bearer ')
        ? req.headers.get('authorization')!.slice(7)
        : '')
    ).trim();

    const isAuthorizedAdmin = isAdminKeyConfigured() && verifyAdminKey(providedAdminKey);

    const envAudit = {
      isVercel: Boolean(process.env.VERCEL),
      hasHitfitAuthSecret: Boolean(process.env.HITFIT_AUTH_SECRET && process.env.HITFIT_AUTH_SECRET.length >= 32),
      hasKvRestApiUrl: Boolean(process.env.KV_REST_API_URL),
      hasKvRestApiToken: Boolean(process.env.KV_REST_API_TOKEN),
      hasUpstashUrl: Boolean(process.env.UPSTASH_REDIS_REST_URL),
      hasUpstashToken: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
      hasHitfitAdminKey: Boolean(process.env.HITFIT_ADMIN_KEY),
      hasAuthSecretConfigured: isAuthSecretConfigured(),
      envKeyNames: Object.keys(process.env).filter(k => !k.includes('TOKEN') && !k.includes('SECRET') && !k.includes('KEY')).sort()
    };

    return jsonResponse(200, {
      cloudConnected: isCloudConfigured(),
      isSetupNeeded,
      adminKeyConfigured: isAdminKeyConfigured(),
      authSecretConfigured: isAuthSecretConfigured(),
      envAudit,
      ...(isAuthorizedAdmin
        ? {
            audit: {
              personRangel: userRangel
                ? {
                    id: userRangel.id,
                    username: userRangel.username,
                    hasSalt: Boolean(userRangel.salt && userRangel.salt.length >= 16),
                    hasHash: Boolean(userRangel.passwordHash && userRangel.passwordHash.length >= 32),
                    updatedAt: userRangel.updatedAt
                  }
                : null,
              personJack: userJack
                ? {
                    id: userJack.id,
                    username: userJack.username,
                    hasSalt: Boolean(userJack.salt && userJack.salt.length >= 16),
                    hasHash: Boolean(userJack.passwordHash && userJack.passwordHash.length >= 32),
                    updatedAt: userJack.updatedAt
                  }
                : null
            }
          }
        : {}),
      accounts: [
        {
          id: 'person-rangel',
          username: 'rangel',
          name: userRangel?.name || 'Rangel',
          hasAccount: hasRangel
        },
        {
          id: 'person-geicsania',
          username: 'jack',
          name: userJack?.name || 'Jack',
          hasAccount: hasJack
        }
      ]
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' });
  }

  // 1. Verificação de segredo para operações de mutação/autenticação
  if (!isAuthSecretConfigured()) {
    return jsonResponse(500, {
      error: 'A chave de segurança de autenticação (HITFIT_AUTH_SECRET) não está configurada no servidor ou possui menos de 32 caracteres. Configure HITFIT_AUTH_SECRET no painel da Vercel.',
      code: 'AUTH_SECRET_NOT_CONFIGURED'
    });
  }

  // 2. Proteção de persistência: em produção, falhar se o armazenamento persistente não estiver disponível
  if (isProductionEnvironment() && !isCloudConfigured()) {
    return jsonResponse(503, {
      error: 'Armazenamento persistente (KV / Redis) não configurado no ambiente de produção.',
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

  function getProvidedAdminKey(): string {
    return (
      req.headers.get('x-admin-key') ||
      (typeof body.adminKey === 'string' ? body.adminKey : '') ||
      (req.headers.get('authorization')?.startsWith('Bearer ')
        ? req.headers.get('authorization')!.slice(7)
        : '')
    ).trim();
  }

  // ==========================================
  // BLOQUEIO TOTAL DE CADASTRO PÚBLICO
  // ==========================================
  if (action === 'register') {
    return jsonResponse(403, {
      error: 'O cadastro público inicial foi desativado. As contas de Rangel e Jack são exclusivas e gerenciadas pelo proprietário.',
      code: 'PUBLIC_REGISTRATION_DISABLED'
    });
  }

  // ==========================================
  // AÇÃO ADMINISTRATIVA: RESET TOTAL DO NAMESPACE HIT-FIT
  // Permite apagar dados de forma segura sem risco de atingir outros apps no Redis.
  // ==========================================
  if (action === 'admin_reset') {
    if (!isAdminKeyConfigured()) {
      return jsonResponse(503, {
        error: 'A chave administrativa do proprietário (HITFIT_ADMIN_KEY) não está configurada no servidor.',
        code: 'ADMIN_KEY_NOT_CONFIGURED'
      });
    }

    const providedKey = getProvidedAdminKey();
    if (!verifyAdminKey(providedKey)) {
      return jsonResponse(401, {
        error: 'Chave administrativa incorreta ou não fornecida.',
        code: 'UNAUTHORIZED_ADMIN'
      });
    }

    const resetResult = await adminResetHitFitNamespace({
      deleteUsers: body.deleteUsers !== false,
      deleteData: body.deleteData !== false,
      clearRateLimits: true
    });

    return jsonResponse(200, {
      success: true,
      message: 'Namespace hitfit:* reinicializado com sucesso.',
      deletedCount: resetResult.deletedCount,
      deletedKeys: resetResult.deletedKeys
    });
  }

  // ==========================================
  // AÇÃO ADMINISTRATIVA: CONFIGURAÇÃO / REDEFINIÇÃO DE PINs
  // Define ou redefine os PINs de 6 dígitos para Rangel e Jack.
  // Se for primeiro setup com banco zerado, permite ao proprietário provisionar.
  // Se as contas já existem ou a chave estiver configurada, exige HITFIT_ADMIN_KEY.
  // ==========================================
  if (action === 'setup_pins' || action === 'admin_setup_pins') {
    const existingRangel = await getUserAccount('person-rangel');
    const existingJack = await getUserAccount('person-geicsania');
    const isFirstSetup = !existingRangel && !existingJack;

    if (!isFirstSetup || isAdminKeyConfigured()) {
      if (!isAdminKeyConfigured()) {
        return jsonResponse(503, {
          error: 'A chave administrativa do proprietário (HITFIT_ADMIN_KEY) não está configurada no servidor. Configure HITFIT_ADMIN_KEY no painel da Vercel para autorizar o gerenciamento de PINs.',
          code: 'ADMIN_KEY_NOT_CONFIGURED'
        });
      }

      const providedAdminKey = getProvidedAdminKey();
      if (!verifyAdminKey(providedAdminKey)) {
        return jsonResponse(401, {
          error: 'Chave administrativa não autorizada. O provisionamento e redefinição de PINs só pode ser realizado pelo proprietário com a chave correta.',
          code: 'UNAUTHORIZED_ADMIN'
        });
      }
    }

    const pinRangel = (
      typeof body.pinRangel === 'string'
        ? body.pinRangel
        : typeof body.pin === 'string'
        ? body.pin
        : ''
    ).trim();

    const pinJack = (
      typeof body.pinJack === 'string'
        ? body.pinJack
        : typeof body.pin === 'string'
        ? body.pin
        : ''
    ).trim();

    if (!/^\d{6}$/.test(pinRangel)) {
      return jsonResponse(400, {
        error: 'PIN de Rangel inválido: informe exatamente 6 dígitos numéricos.',
        code: 'INVALID_PIN_RANGEL'
      });
    }

    if (!/^\d{6}$/.test(pinJack)) {
      return jsonResponse(400, {
        error: 'PIN de Jack inválido: informe exatamente 6 dígitos numéricos.',
        code: 'INVALID_PIN_JACK'
      });
    }

    const resetData = body.resetData === true;
    const { accountRangel, accountJack } = await adminSetupUserPins(pinRangel, pinJack, { resetData });

    const now = new Date().toISOString();
    const athleteRangel = await getAthleteData('person-rangel');
    if (!athleteRangel || resetData) {
      await saveAthleteData({
        userId: 'person-rangel',
        currentWeightKg: accountRangel.initialWeightKg,
        weightHistory: [],
        weightGoal: { initialKg: accountRangel.initialWeightKg, currentKg: accountRangel.initialWeightKg, targetKg: null, objective: accountRangel.goal, updatedAt: now },
        waterLogs: {},
        nutritionDays: {},
        savedSets: {},
        workoutHistory: [],
        updatedAt: now
      });
    }

    const athleteJack = await getAthleteData('person-geicsania');
    if (!athleteJack || resetData) {
      await saveAthleteData({
        userId: 'person-geicsania',
        currentWeightKg: accountJack.initialWeightKg,
        weightHistory: [],
        weightGoal: { initialKg: accountJack.initialWeightKg, currentKg: accountJack.initialWeightKg, targetKg: null, objective: accountJack.goal, updatedAt: now },
        waterLogs: {},
        nutritionDays: {},
        savedSets: {},
        workoutHistory: [],
        updatedAt: now
      });
    }

    // Reseta qualquer bloqueio de IP do administrador
    const clientIp = (
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'
    ).trim();
    await resetFailedLoginAttempts('person-rangel', clientIp);
    await resetFailedLoginAttempts('person-geicsania', clientIp);

    return jsonResponse(200, {
      success: true,
      message: 'PINs de 6 dígitos configurados com sucesso para Rangel e Jack. O sistema está pronto para login.'
    });
  }

  // ==========================================
  // AÇÃO: LOGIN COM PIN DE 6 DÍGITOS E RATE LIMITING
  // Proteção contra brute-force por conta e por IP (max 5 tentativas em 15 min -> 429)
  // ==========================================
  if (action === 'login') {
    const { usernameOrRole, password } = body;
    if (!usernameOrRole || password === undefined || password === null) {
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

    const cleanPin = (typeof password === 'string' ? password : String(password)).trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      return jsonResponse(400, {
        error: 'PIN inválido: informe exatamente 6 dígitos numéricos.',
        code: 'INVALID_PIN_FORMAT'
      });
    }

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
        error: 'Conta de atleta não encontrada no banco de dados. Utilize a chave administrativa para inicializar o cadastro.',
        code: 'USER_NOT_FOUND'
      });
    }

    const isMatch = await verifyPassword(cleanPin, user.salt, user.passwordHash);
    if (!isMatch) {
      await recordFailedLoginAttempt(targetId, clientIp);
      const updatedRateLimit = await getFailedLoginAttempts(targetId, clientIp);
      const attemptsCount = updatedRateLimit.attempts ?? (updatedRateLimit as { count?: number }).count ?? 1;
      const remainingAttempts = Math.max(0, 5 - attemptsCount);

      return jsonResponse(401, {
        error: remainingAttempts > 0
          ? `PIN incorreto. Você tem mais ${remainingAttempts} tentativa(s) antes do bloqueio temporário.`
          : 'PIN incorreto. Limite de tentativas atingido. Acesso temporariamente bloqueado.',
        code: 'INVALID_PASSWORD',
        remainingAttempts
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
