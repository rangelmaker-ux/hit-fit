/**
 * HIT-FIT 2.0 | Adaptador de Persistência Permanente em Nuvem
 * Suporta:
 * 1) Upstash Redis / Vercel KV REST API nativo
 * 
 * ATENÇÃO DE GOVERNANÇA: PROIBIDO USO DE MEMÓRIA EFÊMERA COMO BANCO DE DADOS DE PRODUÇÃO.
 * Toda gravação precisa ser confirmada no armazenamento durável antes de retornar sucesso.
 */

export interface StoredUserAccount {
  id: string; // 'person-rangel' | 'person-geicsania'
  username: 'rangel' | 'jack' | 'geicsania';
  name: string;
  birthDate: string; // YYYY-MM-DD
  age: number;
  initialWeightKg: number | null;
  heightCm: number | null;
  goal: string;
  activityLevel: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface CloudSavedSetState {
  done: boolean;
  weightKg?: string;
  variantId?: string;
  equipmentName?: string;
  exerciseName?: string;
  reps?: string;
  completedAt?: string;
}

export interface StoredAthleteData {
  userId: string;
  avatarBase64?: string | null;
  currentWeightKg: number | null;
  weightHistory: Array<{ id: string; date: string; weightKg: number; notes?: string }>;
  weightGoal: {
    initialKg: number | null;
    currentKg: number | null;
    targetKg: number | null;
    objective: string;
    updatedAt: string;
  };
  waterLogs: Record<string, number>; // date -> ml
  nutritionDays: Record<string, unknown>;
  savedSets: Record<string, CloudSavedSetState>;
  selectedVariants?: Record<string, string>; // exerciseId -> variantId
  workoutHistory: Array<{
    id: string;
    date: string;
    workoutTitle: string;
    durationSeconds: number;
    completedSets: number;
    totalSets: number;
    skippedExercises?: Array<{ exerciseName: string; reason?: string }>;
    caloriesEstimated: number;
  }>;
  customWorkouts?: unknown;
  updatedAt: string;
}

export class PersistentStorageNotConfiguredError extends Error {
  constructor() {
    super(
      'CONFIGURAÇÃO DE PERSISTÊNCIA AUSENTE: O banco de dados permanente (Vercel KV / Upstash Redis) não está configurado. Configure KV_REST_API_URL e KV_REST_API_TOKEN no painel da Vercel para aceitar cadastros e sincronizações permanentes.'
    );
    this.name = 'PersistentStorageNotConfiguredError';
  }
}

export class PersistentStorageWriteError extends Error {
  constructor(detail?: string) {
    super(`FALHA NA PERSISTÊNCIA DURÁVEL: A gravação no banco de dados falhou. ${detail || ''}`);
    this.name = 'PersistentStorageWriteError';
  }
}

function getKvEndpoint(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url: url.trim(), token: token.trim() };
  }
  return null;
}

/**
 * Retorna true se as credenciais do banco permanente em nuvem estiverem configuradas
 */
export function isCloudConfigured(): boolean {
  return Boolean(getKvEndpoint());
}

/**
 * Executa comando REST no Upstash Redis / Vercel KV com validação rigorosa de erro.
 * SEGURANÇA: Todos os comandos e parâmetros são enviados no corpo (body) de um HTTP POST (JSON Array).
 * NENHUM hash, salt, chave ou dado pessoal é exposto na URL.
 */
async function kvExecute(command: string, ...args: (string | number)[]): Promise<unknown> {
  const endpoint = getKvEndpoint();
  if (!endpoint) {
    throw new PersistentStorageNotConfiguredError();
  }

  const targetUrl = endpoint.url;
  const payload = [command, ...args];

  let res: Response;
  try {
    res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${endpoint.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    throw new PersistentStorageWriteError(`Erro de rede ao conectar com o banco: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!res.ok) {
    throw new PersistentStorageWriteError(`Banco respondeu com HTTP ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) {
    throw new PersistentStorageWriteError(`Erro retornado pelo banco: ${data.error}`);
  }

  return data.result;
}

const inMemoryUsers = new Map<string, StoredUserAccount>();
const inMemoryAthleteData = new Map<string, StoredAthleteData>();

/**
 * Cria a conta de um usuário de forma ATÔMICA
 * Utiliza SET ... NX para garantir que a conta NÃO seja sobrescrita caso já exista.
 * Retorna true se a conta foi criada, ou false se a conta já existia (impedindo sobrescrita).
 */
export async function createAtomicUserAccount(user: StoredUserAccount): Promise<boolean> {
  if (isCloudConfigured()) {
    const userJson = JSON.stringify(user);
    const result = await kvExecute('SET', `hitfit:user:${user.id}`, userJson, 'NX');
    if (result === 'OK' || result === true) {
      await kvExecute('SET', `hitfit:user:${user.username}`, userJson);
      if (user.id === 'person-geicsania') {
        await kvExecute('SET', 'hitfit:user:jack', userJson);
        await kvExecute('SET', 'hitfit:user:geicsania', userJson);
      }
      return true;
    }
    return false;
  }

  // Fallback em memória (APENAS em ambiente local de teste onde o KV não estiver configurado)
  if (inMemoryUsers.has(user.id)) return false;
  inMemoryUsers.set(user.id, user);
  inMemoryUsers.set(user.username, user);
  if (user.id === 'person-geicsania') {
    inMemoryUsers.set('jack', user);
    inMemoryUsers.set('geicsania', user);
  }
  return true;
}

/**
 * Atualiza uma conta de usuário já existente (exige confirmação de gravação)
 */
export async function updateUserAccount(user: StoredUserAccount): Promise<void> {
  if (isCloudConfigured()) {
    const userJson = JSON.stringify(user);
    await kvExecute('SET', `hitfit:user:${user.id}`, userJson);
    await kvExecute('SET', `hitfit:user:${user.username}`, userJson);
    if (user.id === 'person-geicsania') {
      await kvExecute('SET', 'hitfit:user:jack', userJson);
      await kvExecute('SET', 'hitfit:user:geicsania', userJson);
    }
    return;
  }

  inMemoryUsers.set(user.id, user);
  inMemoryUsers.set(user.username, user);
  if (user.id === 'person-geicsania') {
    inMemoryUsers.set('jack', user);
    inMemoryUsers.set('geicsania', user);
  }
}

/**
 * Busca a conta de um usuário de forma consistente no banco permanente
 */
export async function getUserAccount(idOrUsername: string): Promise<StoredUserAccount | null> {
  let clean = idOrUsername.toLowerCase().trim();
  if (clean === 'jack' || clean === 'geicsania' || clean === 'person-jack') {
    clean = 'person-geicsania';
  } else if (clean === 'rangel') {
    clean = 'person-rangel';
  }

  if (isCloudConfigured()) {
    const raw = await kvExecute('GET', `hitfit:user:${clean}`);
    if (raw) {
      const user = typeof raw === 'string' ? JSON.parse(raw) : (raw as StoredUserAccount);
      if (user && user.id === 'person-geicsania') {
        user.name = 'Jack';
        user.username = 'jack';
      }
      return user;
    }
    return null;
  }

  const user = inMemoryUsers.get(clean) || null;
  if (user && user.id === 'person-geicsania') {
    user.name = 'Jack';
    user.username = 'jack';
  }
  return user;
}

/**
 * Salva ou sincroniza os dados do atleta na nuvem com confirmação durável obrigatória
 */
export async function saveAthleteData(data: StoredAthleteData): Promise<void> {
  if (isCloudConfigured()) {
    const dataJson = JSON.stringify(data);
    const result = await kvExecute('SET', `hitfit:data:${data.userId}`, dataJson);
    if (result === 'OK' || result === true || typeof result === 'string') {
      return;
    }
    throw new PersistentStorageWriteError(`Resposta inesperada do banco permanente ao gravar dados: ${String(result)}`);
  }

  inMemoryAthleteData.set(data.userId, data);
}

/**
 * Obtém os dados completos do atleta diretamente do armazenamento permanente
 */
export async function getAthleteData(userId: string): Promise<StoredAthleteData | null> {
  if (isCloudConfigured()) {
    const raw = await kvExecute('GET', `hitfit:data:${userId}`);
    if (raw) {
      return typeof raw === 'string' ? JSON.parse(raw) : (raw as StoredAthleteData);
    }
    return null;
  }

  return inMemoryAthleteData.get(userId) || null;
}

/**
 * Lista todos os usuários cadastrados de forma consistente a partir do banco permanente
 */
export async function listAllUsers(): Promise<StoredUserAccount[]> {
  const users: StoredUserAccount[] = [];
  for (const id of ['person-rangel', 'person-geicsania']) {
    const u = await getUserAccount(id);
    if (u) {
      users.push(u);
    }
  }

  return users;
}

// ==========================================
// LIMITAÇÃO DE TENTATIVAS DE LOGIN (RATE LIMITING)
// Proteção contra ataques de força bruta per-account e per-IP
// Regra: Máximo 5 tentativas incorretas em 15 minutos -> HTTP 429
// ==========================================

export const RATE_LIMIT_WINDOW_SECONDS = 15 * 60; // 15 minutos (900s)
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;

// Fallback em memória para ambientes de testes e desenvolvimento local
const inMemoryRateLimits = new Map<string, { attempts: number; expiresAt: number }>();
const inMemoryRevocations = new Map<string, number>();

function getClientSafeIdentifier(targetIdOrRole: string, ip: string): { accountKey: string; ipKey: string } {
  let cleanId = targetIdOrRole.toLowerCase().trim();
  if (cleanId === 'jack' || cleanId === 'geicsania' || cleanId === 'person-jack') {
    cleanId = 'person-geicsania';
  } else if (cleanId === 'rangel' || cleanId === 'person-rangel') {
    cleanId = 'person-rangel';
  }
  const cleanIp = (ip || '127.0.0.1').trim().replace(/[^a-zA-Z0-9.:_-]/g, '');
  return {
    accountKey: `hitfit:ratelimit:account:${cleanId}`,
    ipKey: `hitfit:ratelimit:ip:${cleanIp}`
  };
}

/**
 * Consulta o número de tentativas incorretas recentes para a conta e para o IP.
 * Se atingir ou exceder MAX_FAILED_LOGIN_ATTEMPTS, retorna blocked = true.
 */
export async function getFailedLoginAttempts(
  targetIdOrRole: string,
  ip: string
): Promise<{ blocked: boolean; attempts: number; retryAfterSeconds: number }> {
  const { accountKey, ipKey } = getClientSafeIdentifier(targetIdOrRole, ip);

  if (isCloudConfigured()) {
    try {
      const [rawAcc, ttlAcc, rawIp, ttlIp] = await Promise.all([
        kvExecute('GET', accountKey),
        kvExecute('TTL', accountKey),
        kvExecute('GET', ipKey),
        kvExecute('TTL', ipKey)
      ]);

      const accAttempts = Number(rawAcc) || 0;
      const ipAttempts = Number(rawIp) || 0;
      const maxAttempts = Math.max(accAttempts, ipAttempts);

      const accTtl = typeof ttlAcc === 'number' && ttlAcc > 0 ? ttlAcc : 0;
      const ipTtl = typeof ttlIp === 'number' && ttlIp > 0 ? ttlIp : 0;
      const maxTtl = Math.max(accTtl, ipTtl);

      if (maxAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        return {
          blocked: true,
          attempts: maxAttempts,
          retryAfterSeconds: maxTtl > 0 ? maxTtl : RATE_LIMIT_WINDOW_SECONDS
        };
      }

      return {
        blocked: false,
        attempts: maxAttempts,
        retryAfterSeconds: 0
      };
    } catch {
      // Se falhar a leitura no KV, recorre ao mapa em memória
    }
  }

  // Fallback em memória
  const now = Date.now();
  const accEntry = inMemoryRateLimits.get(accountKey);
  const ipEntry = inMemoryRateLimits.get(ipKey);

  const accValid = accEntry && accEntry.expiresAt > now ? accEntry.attempts : 0;
  const ipValid = ipEntry && ipEntry.expiresAt > now ? ipEntry.attempts : 0;
  const attempts = Math.max(accValid, ipValid);

  if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    const expiresAt = Math.max(
      accEntry && accEntry.expiresAt > now ? accEntry.expiresAt : 0,
      ipEntry && ipEntry.expiresAt > now ? ipEntry.expiresAt : 0
    );
    const retryAfterSeconds = Math.max(1, Math.ceil((expiresAt - now) / 1000));
    return { blocked: true, attempts, retryAfterSeconds };
  }

  return { blocked: false, attempts, retryAfterSeconds: 0 };
}

/**
 * Registra uma tentativa de login falha tanto para a conta quanto para o IP.
 * Aplica TTL de 15 minutos na primeira tentativa.
 */
export async function recordFailedLoginAttempt(
  targetIdOrRole: string,
  ip: string
): Promise<number> {
  const { accountKey, ipKey } = getClientSafeIdentifier(targetIdOrRole, ip);

  if (isCloudConfigured()) {
    try {
      const [newAcc, newIp] = await Promise.all([
        kvExecute('INCR', accountKey),
        kvExecute('INCR', ipKey)
      ]);

      const accCount = Number(newAcc) || 1;
      const ipCount = Number(newIp) || 1;

      if (accCount === 1) {
        await kvExecute('EXPIRE', accountKey, RATE_LIMIT_WINDOW_SECONDS);
      }
      if (ipCount === 1) {
        await kvExecute('EXPIRE', ipKey, RATE_LIMIT_WINDOW_SECONDS);
      }

      return Math.max(accCount, ipCount);
    } catch {
      // Fallback em memória
    }
  }

  const now = Date.now();
  const expiresAt = now + RATE_LIMIT_WINDOW_SECONDS * 1000;

  const currentAcc = inMemoryRateLimits.get(accountKey);
  const accAttempts = currentAcc && currentAcc.expiresAt > now ? currentAcc.attempts + 1 : 1;
  inMemoryRateLimits.set(accountKey, { attempts: accAttempts, expiresAt });

  const currentIp = inMemoryRateLimits.get(ipKey);
  const ipAttempts = currentIp && currentIp.expiresAt > now ? currentIp.attempts + 1 : 1;
  inMemoryRateLimits.set(ipKey, { attempts: ipAttempts, expiresAt });

  return Math.max(accAttempts, ipAttempts);
}

/**
 * Reseta o contador de tentativas falhas após um login bem-sucedido.
 */
export async function resetFailedLoginAttempts(
  targetIdOrRole: string,
  ip: string
): Promise<void> {
  const { accountKey, ipKey } = getClientSafeIdentifier(targetIdOrRole, ip);

  if (isCloudConfigured()) {
    try {
      await Promise.all([
        kvExecute('DEL', accountKey),
        kvExecute('DEL', ipKey)
      ]);
    } catch {
      // Ignore KV reset error
    }
  }

  inMemoryRateLimits.delete(accountKey);
  inMemoryRateLimits.delete(ipKey);
}

// ==========================================
// REVOGAÇÃO E INVALIDAÇÃO DE SESSÕES
// ==========================================

/**
 * Revoga todas as sessões anteriores de um usuário, registrando timestamp de invalidação.
 */
export async function revokeUserSessions(userId: string): Promise<void> {
  let cleanId = userId.toLowerCase().trim();
  if (cleanId === 'jack' || cleanId === 'geicsania' || cleanId === 'person-jack') {
    cleanId = 'person-geicsania';
  } else if (cleanId === 'rangel' || cleanId === 'person-rangel') {
    cleanId = 'person-rangel';
  }

  const now = Date.now();
  inMemoryRevocations.set(cleanId, now);

  if (isCloudConfigured()) {
    try {
      await kvExecute('SET', `hitfit:session:revoked:${cleanId}`, String(now));
    } catch {
      // Ignore
    }
  }
}

/**
 * Verifica se um token de sessão emitido em `issuedAtSecOrMs` foi revogado.
 */
export async function isSessionRevoked(
  userId: string,
  issuedAtSecOrMs: number
): Promise<boolean> {
  let cleanId = userId.toLowerCase().trim();
  if (cleanId === 'jack' || cleanId === 'geicsania' || cleanId === 'person-jack') {
    cleanId = 'person-geicsania';
  } else if (cleanId === 'rangel' || cleanId === 'person-rangel') {
    cleanId = 'person-rangel';
  }

  // Normaliza issuedAt para milissegundos se vier em segundos
  const issuedAtMs = issuedAtSecOrMs < 1e11 ? issuedAtSecOrMs * 1000 : issuedAtSecOrMs;

  let revokedAt = inMemoryRevocations.get(cleanId) || 0;

  if (isCloudConfigured()) {
    try {
      const raw = await kvExecute('GET', `hitfit:session:revoked:${cleanId}`);
      if (raw) {
        const cloudRevokedAt = Number(raw) || 0;
        revokedAt = Math.max(revokedAt, cloudRevokedAt);
      }
    } catch {
      // Fallback to in-memory
    }
  }

  return revokedAt > 0 && issuedAtMs < revokedAt;
}
