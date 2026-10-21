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

/**
 * Realiza login com PIN de 6 dígitos via /api/auth
 */
export async function loginAthlete(
  usernameOrRole: string,
  pin: string
): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', usernameOrRole, password: pin })
    });

    const data = (await res.json()) as AuthResponse;
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'PIN incorreto ou usuário não encontrado.' };
    }

    if (data.token) setStoredToken(data.token);
    if (data.user) setStoredUser(data.user);
    return { success: true, user: data.user };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Falha de conexão com o servidor.';
    return { success: false, error: errMsg };
  }
}

/**
 * Atualiza os dados biométricos individuais no primeiro acesso após login
 */
export async function updateAthleteProfile(payload: {
  userId: string;
  birthDate: string;
  initialWeightKg: number | null;
  heightCm: number | null;
  targetWeightKg?: number | null;
  goal: string;
  activityLevel: string;
  avatarBase64?: string | null;
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

/**
 * Sincroniza dados com a nuvem (Push) com verificação de autorização
 */
export async function pushSyncData(payload: Record<string, unknown>): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Busca dados atualizados da nuvem (Pull)
 */
export async function pullSyncData(partnerId?: string): Promise<{
  athlete: Record<string, unknown> | null;
  partner: Record<string, unknown> | null;
} | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const url = partnerId ? `/api/sync?partnerId=${encodeURIComponent(partnerId)}` : '/api/sync';
    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return null;
    return (await res.json()) as {
      athlete: Record<string, unknown> | null;
      partner: Record<string, unknown> | null;
    };
  } catch {
    return null;
  }
}
