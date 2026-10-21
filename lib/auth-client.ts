/**
 * HIT-FIT 2.0 | Cliente de Autenticação Segura e Sincronização em Nuvem
 * Integração com /api/auth e /api/sync com resiliência offline e tokens JWT/HMAC
 */

export interface AuthenticatedUser {
  id: string; // 'person-rangel' | 'person-geicsania'
  username: 'rangel' | 'jack' | 'geicsania';
  name: string; // 'Rangel' | 'Jack'
  role: 'rangel' | 'jack' | 'geicsania';
  age: number;
  birthDate?: string;
  initialWeightKg: number | null;
  currentWeightKg?: number | null;
  targetWeightKg?: number | null;
  heightCm: number | null;
  goal: string;
  activityLevel: string;
  needsProfileSetup?: boolean;
}

interface AuthResponse {
  success?: boolean;
  error?: string;
  token?: string;
  user?: AuthenticatedUser;
  valid?: boolean;
}

export interface SetupStatusResponse {
  cloudConnected: boolean;
  isSetupNeeded: boolean;
  adminKeyConfigured?: boolean;
  audit?: Record<string, unknown>;
  accounts?: Array<{
    id: string;
    username: string;
    name: string;
    hasAccount: boolean;
  }>;
  error?: string;
}

const TOKEN_KEY = 'hitfit_auth_token_v2';
const USER_KEY = 'hitfit_auth_user_v2';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser(): AuthenticatedUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthenticatedUser | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * Consulta o status do sistema (banco conectado e se o setup de PIN inicial é necessário)
 */
export async function checkSetupStatus(): Promise<SetupStatusResponse> {
  try {
    const res = await fetch('/api/auth', {
      method: 'GET'
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        cloudConnected: false,
        isSetupNeeded: false,
        error: (errData as { error?: string }).error || `HTTP ${res.status}`
      };
    }
    return (await res.json()) as SetupStatusResponse;
  } catch (err) {
    return {
      cloudConnected: false,
      isSetupNeeded: false,
      error: err instanceof Error ? err.message : 'Falha ao conectar com o servidor'
    };
  }
}

/**
 * Configura o PIN inicial de 6 dígitos para Rangel e Jack (etapa administrativa restrita ao proprietário)
 */
export async function setupInitialPins(
  pin: string,
  confirmPin: string,
  adminKey: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminKey.trim()
      },
      body: JSON.stringify({ action: 'setup_pins', pin, confirmPin, adminKey: adminKey.trim() })
    });

    const data = (await res.json()) as { success?: boolean; message?: string; error?: string };
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Falha ao configurar PIN inicial.' };
    }

    return { success: true, message: data.message };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha na conexão com o servidor.'
    };
  }
}

export interface AdminSetupPinsPayload {
  adminKey: string;
  pinRangel: string;
  pinJack: string;
  resetData?: boolean;
}

/**
 * Redefine ou configura PINs administrativos individuais para Rangel e Jack sem exigir PIN anterior.
 */
export async function adminSetupPins(
  payload: AdminSetupPinsPayload
): Promise<{ success: boolean; message?: string; error?: string; code?: string; status?: number }> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': payload.adminKey.trim()
      },
      body: JSON.stringify({
        action: 'admin_setup_pins',
        adminKey: payload.adminKey.trim(),
        pinRangel: payload.pinRangel.trim(),
        pinJack: payload.pinJack.trim(),
        resetData: payload.resetData === true
      })
    });

    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
      error?: string;
      code?: string;
    };

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Erro HTTP ${res.status}`,
        code: data.code,
        status: res.status
      };
    }

    return { success: true, message: data.message, status: 200 };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha de conexão com o servidor.',
      status: 0
    };
  }
}

/**
 * Reinicializa de forma estrita e segura o namespace hitfit:* no banco em nuvem (Redis)
 */
export async function adminResetHitFit(
  adminKey: string,
  options?: { deleteUsers?: boolean; deleteData?: boolean }
): Promise<{ success: boolean; message?: string; error?: string; deletedCount?: number }> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminKey.trim()
      },
      body: JSON.stringify({
        action: 'admin_reset',
        adminKey: adminKey.trim(),
        deleteUsers: options?.deleteUsers !== false,
        deleteData: options?.deleteData !== false
      })
    });

    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
      error?: string;
      deletedCount?: number;
    };

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || `Erro HTTP ${res.status}` };
    }

    return { success: true, message: data.message, deletedCount: data.deletedCount };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha de conexão com o servidor.'
    };
  }
}

export interface LoginResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  code?: string;
  status?: number;
  remainingAttempts?: number;
  retryAfter?: number;
}

/**
 * Realiza login com PIN de 6 dígitos via /api/auth com captura de status e tentativas
 */
export async function loginAthlete(
  usernameOrRole: string,
  pin: string
): Promise<LoginResult> {
  try {
    const cleanPin = (typeof pin === 'string' ? pin : String(pin)).trim();
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', usernameOrRole, password: cleanPin })
    });

    const data = (await res.json().catch(() => ({}))) as AuthResponse & {
      code?: string;
      remainingAttempts?: number;
      retryAfter?: number;
    };

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || (res.status === 401 ? 'PIN incorreto.' : `Erro HTTP ${res.status}`),
        code: data.code,
        status: res.status,
        remainingAttempts: data.remainingAttempts,
        retryAfter: data.retryAfter
      };
    }

    if (data.token) setStoredToken(data.token);
    if (data.user) setStoredUser(data.user);
    return { success: true, user: data.user, status: 200 };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Falha de conexão com o servidor.';
    return { success: false, error: errMsg, status: 0 };
  }
}

/**
 * Atualiza os dados biométricos individuais no primeiro acesso após login
 */
export async function updateAthleteProfile(payload: {
  userId: string;
  birthDate?: string;
  initialWeightKg?: number | null;
  currentWeightKg?: number | null;
  heightCm?: number | null;
  targetWeightKg?: number | null;
  goal?: string;
  activityLevel?: string;
  avatarBase64?: string | null;
  weightHistory?: Array<{ id: string; date: string; weightKg: number; notes?: string }>;
}): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
  const token = getStoredToken();
  if (!token) return { success: false, error: 'Sessão não autenticada.' };

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'update_profile', ...payload })
    });

    const data = (await res.json()) as AuthResponse;
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Falha ao atualizar perfil.' };
    }

    if (data.user) {
      setStoredUser(data.user);
    }
    return { success: true, user: data.user };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao salvar dados de perfil.'
    };
  }
}

/**
 * Encerra a sessão
 */
export function logoutAthlete(): void {
  setStoredToken(null);
  setStoredUser(null);
  pendingSyncPayload = null;
  persistPendingSync(null);
  if (syncRetryTimer) {
    clearTimeout(syncRetryTimer);
    syncRetryTimer = null;
  }
  isSyncProcessing = false;
  notifySyncStatus('synced');
}

/**
 * Revoga todas as sessões anteriores no servidor e encerra localmente
 */
export async function revokeAllSessions(): Promise<boolean> {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'revoke_sessions' })
      });
    } catch {
      // Falha offline ignorada
    }
  }
  logoutAthlete();
  return true;
}

/**
 * Valida a sessão atual com o backend
 */
export async function checkSession(): Promise<AuthenticatedUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      logoutAthlete();
      return null;
    }

    const data = (await res.json()) as AuthResponse;
    if (data.valid && data.user) {
      setStoredUser(data.user);
      return data.user;
    }

    logoutAthlete();
    return null;
  } catch {
    // Se offline, mantém a sessão do storage local temporariamente
    return getStoredUser();
  }
}

export type SyncStatusType = 'synced' | 'syncing' | 'offline' | 'error';

type SyncStatusListener = (status: SyncStatusType) => void;
const syncStatusListeners = new Set<SyncStatusListener>();
let currentSyncStatus: SyncStatusType = 'synced';

export function getSyncStatus(): SyncStatusType {
  return currentSyncStatus;
}

export function subscribeSyncStatus(listener: SyncStatusListener): () => void {
  syncStatusListeners.add(listener);
  listener(currentSyncStatus);
  return () => {
    syncStatusListeners.delete(listener);
  };
}

function notifySyncStatus(status: SyncStatusType) {
  currentSyncStatus = status;
  syncStatusListeners.forEach((fn) => {
    try {
      fn(status);
    } catch {}
  });
}

const PENDING_SYNC_STORAGE_KEY = 'hitfit_pending_sync_queue_v2';

function loadPendingSync(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PENDING_SYNC_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistPendingSync(payload: Record<string, unknown> | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (payload && Object.keys(payload).length > 0) {
      localStorage.setItem(PENDING_SYNC_STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(PENDING_SYNC_STORAGE_KEY);
    }
  } catch {}
}

// Fila resiliente de sincronização em segundo plano (evita concorrência e perda de dados offline)
let isSyncProcessing = false;
let pendingSyncPayload: Record<string, unknown> | null = typeof window !== 'undefined' ? loadPendingSync() : null;
let syncRetryTimer: ReturnType<typeof setTimeout> | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    const pending = loadPendingSync();
    if (pending) {
      pendingSyncPayload = { ...(pendingSyncPayload || {}), ...pending };
      processSyncQueue();
    }
  });
}

async function processSyncQueue(): Promise<void> {
  if (isSyncProcessing) return;
  if (!pendingSyncPayload) {
    pendingSyncPayload = loadPendingSync();
  }
  if (!pendingSyncPayload) {
    notifySyncStatus('synced');
    return;
  }

  const token = getStoredToken();
  if (!token) {
    notifySyncStatus('offline');
    return;
  }

  isSyncProcessing = true;
  notifySyncStatus('syncing');

  const payloadToSend = { ...pendingSyncPayload };
  pendingSyncPayload = null;
  persistPendingSync(null);

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payloadToSend)
    });

    if (res.ok) {
      notifySyncStatus('synced');
      isSyncProcessing = false;
      if (pendingSyncPayload) {
        processSyncQueue();
      }
    } else {
      // Falha do servidor (4xx / 5xx)
      if (res.status === 401) {
        notifySyncStatus('offline');
      } else {
        notifySyncStatus('error');
      }
      isSyncProcessing = false;
      // Reenfileira para retry se não houver um novo payload sobrescrevendo
      if (!pendingSyncPayload) {
        pendingSyncPayload = payloadToSend;
        persistPendingSync(pendingSyncPayload);
        if (!syncRetryTimer) {
          syncRetryTimer = setTimeout(() => {
            syncRetryTimer = null;
            processSyncQueue();
          }, 4000);
        }
      }
    }
  } catch {
    // Falha de rede (offline)
    notifySyncStatus('offline');
    isSyncProcessing = false;
    if (!pendingSyncPayload) {
      pendingSyncPayload = payloadToSend;
      persistPendingSync(pendingSyncPayload);
      if (!syncRetryTimer) {
        syncRetryTimer = setTimeout(() => {
          syncRetryTimer = null;
          processSyncQueue();
        }, 5000);
      }
    }
  }
}

/**
 * Sincroniza dados com a nuvem (Push) com verificação de autorização e fila resiliente
 */
export async function pushSyncData(payload: Record<string, unknown>): Promise<boolean> {
  const token = getStoredToken();
  if (!token) {
    notifySyncStatus('offline');
    // Salva na fila pendente para quando o usuário reconectar ou autenticar
    pendingSyncPayload = {
      ...(pendingSyncPayload || loadPendingSync() || {}),
      ...payload
    };
    persistPendingSync(pendingSyncPayload);
    return false;
  }

  // Agrega payload pendente com o novo para não perder campos parciais
  pendingSyncPayload = {
    ...(pendingSyncPayload || loadPendingSync() || {}),
    ...payload
  };
  persistPendingSync(pendingSyncPayload);

  processSyncQueue();
  return true;
}

export interface CloudAthletePayload {
  userId: string;
  avatarBase64?: string | null;
  currentWeightKg: number | null;
  weightHistory?: Array<{ id: string; date: string; weightKg: number; notes?: string }>;
  weightGoal?: {
    initialKg: number | null;
    currentKg: number | null;
    targetKg: number | null;
    objective: string;
    updatedAt: string;
  };
  waterLogs?: Record<string, number>;
  nutritionDays?: Record<string, unknown>;
  savedSets?: Record<string, {
    done: boolean;
    weightKg?: string;
    variantId?: string;
    equipmentName?: string;
    exerciseName?: string;
    reps?: string;
    completedAt?: string;
  }>;
  selectedVariants?: Record<string, string>;
  workoutHistory?: Array<unknown>;
  updatedAt?: string;
  isReadOnly?: boolean;
}

/**
 * Busca dados atualizados da nuvem (Pull)
 */
export async function pullSyncData(partnerId?: string): Promise<{
  athlete: CloudAthletePayload | null;
  partner: CloudAthletePayload | null;
} | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const url = partnerId ? `/api/sync?partnerId=${encodeURIComponent(partnerId)}` : '/api/sync';
    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      if (res.status === 401) notifySyncStatus('offline');
      return null;
    }
    const data = (await res.json()) as {
      athlete: CloudAthletePayload | null;
      partner: CloudAthletePayload | null;
    };
    notifySyncStatus('synced');
    return data;
  } catch {
    notifySyncStatus('offline');
    return null;
  }
}
