import {
  generateSalt,
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  calculateAge,
  isAuthSecretConfigured,
  canModifyAthleteData,
  AllowedRole
} from '../lib/auth-crypto';
import {
  createAtomicUserAccount,
  updateUserAccount,
  getUserAccount,
  listAllUsers,
  saveAthleteData,
  getAthleteData,
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

  // ==========================================
  // GET: Obter sessão ativa ou status das contas
  // ==========================================
  if (req.method === 'GET') {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = await verifySessionToken(token);
      if (!session) {
        return jsonResponse(401, { error: 'Sessão inválida ou expirada.', valid: false });
      }

      const user = await getUserAccount(session.userId);
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
              heightCm: user.heightCm,
              goal: user.goal,
              activityLevel: user.activityLevel,
              needsProfileSetup: !isComplete
            }
          : null
      });
    }

    // Retorna status das contas e necessidade de setup de PIN inicial
    const allUsers = await listAllUsers();
    const hasRangel = Boolean(allUsers.find((u) => u.id === 'person-rangel'));
    const hasJack = Boolean(allUsers.find((u) => u.id === 'person-geicsania'));
    const isSetupNeeded = !hasRangel || !hasJack;

    return jsonResponse(200, {
      cloudConnected: isCloudConfigured(),
      isSetupNeeded,
      accounts: [
        {
          id: 'person-rangel',
          username: 'rangel',
          name: 'Rangel',
          hasAccount: hasRangel
        },
        {
          id: 'person-geicsania',
          username: 'jack',
          name: 'Jack',
          hasAccount: hasJack
        }
      ]
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' });
  }

  // 2. Operações de Escrita exigem persistência em nuvem real configurada
  if (!isCloudConfigured()) {
    return jsonResponse(503, {
      error: 'Banco de dados permanente pendente de ativação: configure KV_REST_API_URL e KV_REST_API_TOKEN no painel da Vercel para aceitar autenticações e persistência.',
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
  // Uma vez inicializado, o endpoint é permanentemente bloqueado contra reconfiguração pública.
  // ==========================================
  if (action === 'setup_pins') {
    const existingRangel = await getUserAccount('person-rangel');
    const existingJack = await getUserAccount('person-geicsania');

    if (existingRangel && existingJack) {
      return jsonResponse(409, {
        error: 'O sistema já foi inicializado anteriormente. Utilize a tela de login.',
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

    // Gera hashes independentes com salts distintos para Rangel e Jack
    const saltRangel = generateSalt(16);
    const hashRangel = await hashPassword(pin, saltRangel);

    const saltJack = generateSalt(16);
    const hashJack = await hashPassword(pin, saltJack);

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

    if (existingRangel) {
      await updateUserAccount(accountRangel);
    } else {
      await createAtomicUserAccount(accountRangel);
    }

    if (existingJack) {
      await updateUserAccount(accountJack);
    } else {
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
  // AÇÃO 2: LOGIN COM PIN DE 6 DÍGITOS
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

    const user = await getUserAccount(targetId);
    if (!user) {
      return jsonResponse(404, {
        error: 'Contas ainda não inicializadas pelo proprietário.',
        code: 'SETUP_REQUIRED'
      });
    }

    const isMatch = await verifyPassword(password.trim(), user.salt, user.passwordHash);
    if (!isMatch) {
      return jsonResponse(401, {
        error: 'PIN incorreto. Verifique os 6 dígitos digitados.',
        code: 'INVALID_PASSWORD'
      });
    }

    const assignedRole: AllowedRole = user.id === 'person-rangel' ? 'rangel' : 'jack';
    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      role: assignedRole
    });

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
    if (!session) {
      return jsonResponse(401, { error: 'Sessão inválida ou expirada.', code: 'SESSION_EXPIRED' });
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

    const validWeight = body.initialWeightKg !== undefined && body.initialWeightKg !== null
      ? Number(body.initialWeightKg)
      : user.initialWeightKg;

    const validHeight = body.heightCm !== undefined && body.heightCm !== null
      ? Number(body.heightCm)
      : user.heightCm;

    const age = calculateAge(validBirthDate);
    const now = new Date().toISOString();

    const updatedUser: StoredUserAccount = {
      ...user,
      birthDate: validBirthDate,
      age,
      initialWeightKg: validWeight,
      heightCm: validHeight,
      goal: typeof body.goal === 'string' && body.goal.trim() ? body.goal.trim() : user.goal,
      activityLevel: typeof body.activityLevel === 'string' && body.activityLevel.trim() ? body.activityLevel.trim() : user.activityLevel,
      updatedAt: now
    };

    await updateUserAccount(updatedUser);

    // Se forneceu peso inicial ou meta, atualiza também a ficha do atleta
    const athleteData = (await getAthleteData(targetUserId)) || {
      userId: targetUserId,
      currentWeightKg: validWeight,
      weightHistory: [],
      weightGoal: { initialKg: validWeight, currentKg: validWeight, targetKg: null, objective: updatedUser.goal, updatedAt: now },
      waterLogs: {},
      nutritionDays: {},
      savedSets: {},
      workoutHistory: [],
      updatedAt: now
    };

    if (body.targetWeightKg !== undefined && body.targetWeightKg !== null) {
      athleteData.weightGoal.targetKg = Number(body.targetWeightKg);
    }
    if (validWeight !== null) {
      athleteData.currentWeightKg = validWeight;
      if (athleteData.weightHistory.length === 0) {
        athleteData.weightHistory.push({
          id: `weight-${Date.now()}`,
          date: now.split('T')[0],
          weightKg: validWeight,
          notes: 'Pesagem inicial do perfil'
        });
      }
    }
    if (body.avatarBase64 !== undefined) {
      athleteData.avatarBase64 = body.avatarBase64 as string | null;
    }
    athleteData.updatedAt = now;
    await saveAthleteData(athleteData);

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
        heightCm: updatedUser.heightCm,
        goal: updatedUser.goal,
        activityLevel: updatedUser.activityLevel,
        needsProfileSetup: false
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
    if (!session) {
      return jsonResponse(401, { error: 'Sessão inválida ou expirada.', code: 'SESSION_EXPIRED' });
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

    return jsonResponse(200, { success: true, message: 'PIN individual atualizado com sucesso.' });
  }

  return jsonResponse(400, { error: 'Ação não reconhecida.', code: 'UNKNOWN_ACTION' });
}
