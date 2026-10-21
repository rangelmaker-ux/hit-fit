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
  username: 'rangel' | 'geicsania';
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
  savedSets: Record<string, { done: boolean; weightKg?: string }>;
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
 * Executa comando REST no Upstash Redis / Vercel KV com validação rigorosa de erro
 */
async function kvExecute(command: string, ...args: (string | number)[]): Promise<unknown> {
  const endpoint = getKvEndpoint();
  if (!endpoint) {
    throw new PersistentStorageNotConfiguredError();
  }

  const encodedArgs = args.map((arg) => encodeURIComponent(String(arg))).join('/');
  const targetUrl = `${endpoint.url}/${command}/${encodedArgs}`;

  let res: Response;
  try {
    res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${endpoint.token}`
      }
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

/**
 * Cria a conta de um usuário de forma ATÔMICA
 * Utiliza SET ... NX para garantir que a conta NÃO seja sobrescrita caso já exista.
 * Retorna true se a conta foi criada, ou false se a conta já existia (impedindo sobrescrita).
 */
export async function createAtomicUserAccount(user: StoredUserAccount): Promise<boolean> {
  if (!isCloudConfigured()) {
    throw new PersistentStorageNotConfiguredError();
  }

  const userJson = JSON.stringify(user);

  // Executa SET hitfit:user:<id> <json> NX (só cria se não existir)
  const result = await kvExecute('SET', `hitfit:user:${user.id}`, userJson, 'NX');

  if (result === 'OK' || result === true) {
    // Espelha no username para busca rápida
    await kvExecute('SET', `hitfit:user:${user.username}`, userJson);
    return true;
  }

  // Se o retorno for null ou diferente de OK, o registro já existia!
  return false;
}

/**
 * Atualiza uma conta de usuário já existente (exige confirmação de gravação)
 */
export async function updateUserAccount(user: StoredUserAccount): Promise<void> {
  if (!isCloudConfigured()) {
    throw new PersistentStorageNotConfiguredError();
  }

  const userJson = JSON.stringify(user);
  await kvExecute('SET', `hitfit:user:${user.id}`, userJson);
  await kvExecute('SET', `hitfit:user:${user.username}`, userJson);
}

/**
 * Busca a conta de um usuário de forma consistente no banco permanente
 */
export async function getUserAccount(idOrUsername: string): Promise<StoredUserAccount | null> {
  if (!isCloudConfigured()) {
    return null;
  }

  const clean = idOrUsername.toLowerCase().trim();
  const raw = await kvExecute('GET', `hitfit:user:${clean}`);
  if (!raw) return null;

  try {
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as StoredUserAccount);
  } catch {
    return null;
  }
}

/**
 * Salva ou sincroniza os dados do atleta na nuvem com confirmação durável obrigatória
 */
export async function saveAthleteData(data: StoredAthleteData): Promise<void> {
  if (!isCloudConfigured()) {
    throw new PersistentStorageNotConfiguredError();
  }

  const dataJson = JSON.stringify(data);
  const result = await kvExecute('SET', `hitfit:data:${data.userId}`, dataJson);

  if (result !== 'OK' && result !== true && typeof result !== 'string') {
    throw new PersistentStorageWriteError('Confirmação de gravação permanente não obtida.');
  }
}

/**
 * Obtém os dados completos do atleta diretamente do armazenamento permanente
 */
export async function getAthleteData(userId: string): Promise<StoredAthleteData | null> {
  if (!isCloudConfigured()) {
    return null;
  }

  const raw = await kvExecute('GET', `hitfit:data:${userId}`);
  if (!raw) return null;

  try {
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as StoredAthleteData);
  } catch {
    return null;
  }
}

/**
 * Lista todos os usuários cadastrados de forma consistente a partir do banco permanente
 */
export async function listAllUsers(): Promise<StoredUserAccount[]> {
  if (!isCloudConfigured()) {
    return [];
  }

  const users: StoredUserAccount[] = [];
  for (const id of ['person-rangel', 'person-geicsania']) {
    const u = await getUserAccount(id);
    if (u) {
      users.push(u);
    }
  }

  return users;
}
