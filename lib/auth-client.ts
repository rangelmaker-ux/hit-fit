/**
 * HIT-FIT 2.0 | Cliente de Autenticação Segura e Sincronização em Nuvem
 * Integração com /api/auth e /api/sync com resiliência offline e tokens JWT/HMAC
 */

export interface AuthenticatedUser {
  id: string; // 'person-rangel' | 'person-geicsania'
  username: 'rangel' | 'geicsania';
  name: string;
  age: number;
  birthDate?: string;
  initialWeightKg: number;
  heightCm: number;
  goal: string;
  activityLevel: string;
}

interface AuthResponse {
  success?: boolean;
  error?: string;
  token?: string;
  user?: AuthenticatedUser;
  valid?: boolean;
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
 * Realiza cadastro inicial seguro via /api/auth
 */
export async function registerAthlete(payload: {
  role: 'rangel' | 'geicsania';
  name: string;
  birthDate: string;
  initialWeightKg: number;
  heightCm: number;
  goal: string;
  activityLevel: string;
  password: string;
  avatarBase64?: string | null;
}): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', ...payload })
    });

    const data = (await res.json()) as AuthResponse;
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Falha no cadastro' };
    }

    if (data.token) setStoredToken(data.token);
    if (data.user) setStoredUser(data.user);
    return { success: true, user: data.user };
  } catch (err: unknown) {
    // Fallback local se estiver offline
    const errMsg = err instanceof Error ? err.message : 'Falha na conexão com o servidor';
    return { success: false, error: errMsg };
  }
}

/**
 * Realiza login com senha individual via /api/auth
 */
export async function loginAthlete(
  usernameOrRole: string,
  password: string
): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', usernameOrRole, password })
    });

    const data = (await res.json()) as AuthResponse;
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Senha incorreta ou usuário não encontrado' };
    }

    if (data.token) setStoredToken(data.token);
    if (data.user) setStoredUser(data.user);
    return { success: true, user: data.user };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Falha de conexão com o servidor';
    return { success: false, error: errMsg };
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
