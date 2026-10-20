/**
 * HIT-FIT 2.0 | Adaptador de Persistência em Nuvem e Cache Local
 * Suporta:
 * 1) Vercel KV / Upstash Redis REST API (zero dependências extras de runtime)
 * 2) Fallback estruturado com espelhamento persistente
 */

export interface StoredUserAccount {
  id: string; // 'person-rangel' | 'person-geicsania'
  username: 'rangel' | 'geicsania';
  name: string;
  birthDate: string; // YYYY-MM-DD
  age: number;
  initialWeightKg: number;
  heightCm: number;
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
  currentWeightKg: number;
  weightHistory: Array<{ id: string; date: string; weightKg: number; notes?: string }>;
  weightGoal: {
    initialKg: number;
    currentKg: number;
    targetKg: number;
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

// Armazenamento em memória do processo para fallback rápido
const memoryUsers = new Map<string, StoredUserAccount>();
const memoryData = new Map<string, StoredAthleteData>();

function getKvEndpoint(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url, token };
  }
  return null;
}

/**
 * Executa comando REST no Vercel KV / Upstash Redis
 */
async function kvExecute(command: string, ...args: (string | number)[]): Promise<unknown> {
  const endpoint = getKvEndpoint();
  if (!endpoint) return null;

  try {
    const res = await fetch(`${endpoint.url}/${command}/${args.map(encodeURIComponent).join('/')}`, {
      headers: {
        Authorization: `Bearer ${endpoint.token}`
      }
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: unknown };
    return data.result;
  } catch {
    return null;
  }
}

export function isCloudConfigured(): boolean {
  return Boolean(getKvEndpoint());
}

/**
 * Salva ou atualiza a conta de um usuário
 */
export async function saveUserAccount(user: StoredUserAccount): Promise<void> {
  memoryUsers.set(user.id, user);
  memoryUsers.set(user.username, user);

  if (isCloudConfigured()) {
    await kvExecute('SET', `hitfit:user:${user.id}`, JSON.stringify(user));
    await kvExecute('SET', `hitfit:user:${user.username}`, JSON.stringify(user));
  }
}

/**
 * Busca a conta de um usuário por id ou username
 */
export async function getUserAccount(idOrUsername: string): Promise<StoredUserAccount | null> {
  if (memoryUsers.has(idOrUsername)) {
    return memoryUsers.get(idOrUsername)!;
  }

  if (isCloudConfigured()) {
    const raw = (await kvExecute('GET', `hitfit:user:${idOrUsername}`)) as string | null;
    if (raw) {
      try {
        const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
        memoryUsers.set(user.id, user);
        memoryUsers.set(user.username, user);
        return user;
      } catch {
        return null;
      }
    }
  }

  return null;
}

/**
 * Salva ou sincroniza os dados do atleta na nuvem
 */
export async function saveAthleteData(data: StoredAthleteData): Promise<void> {
  memoryData.set(data.userId, data);

  if (isCloudConfigured()) {
    await kvExecute('SET', `hitfit:data:${data.userId}`, JSON.stringify(data));
  }
}

/**
 * Obtém os dados completos do atleta
 */
export async function getAthleteData(userId: string): Promise<StoredAthleteData | null> {
  if (memoryData.has(userId)) {
    return memoryData.get(userId)!;
  }

  if (isCloudConfigured()) {
    const raw = (await kvExecute('GET', `hitfit:data:${userId}`)) as string | null;
    if (raw) {
      try {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        memoryData.set(userId, data);
        return data;
      } catch {
        return null;
      }
    }
  }

  return null;
}

/**
 * Lista todos os usuários cadastrados
 */
export async function listAllUsers(): Promise<StoredUserAccount[]> {
  const users: StoredUserAccount[] = [];
  const checkedIds = new Set<string>();

  for (const u of memoryUsers.values()) {
    if (!checkedIds.has(u.id)) {
      checkedIds.add(u.id);
      users.push(u);
    }
  }

  // Tenta buscar no KV caso ainda não estejam em memória
  if (users.length === 0 && isCloudConfigured()) {
    for (const id of ['person-rangel', 'person-geicsania']) {
      const u = await getUserAccount(id);
      if (u && !checkedIds.has(u.id)) {
        checkedIds.add(u.id);
        users.push(u);
      }
    }
  }

  return users;
}
