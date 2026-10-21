/**
 * HIT-FIT 2.0 | Módulo Criptográfico de Autenticação e Autorização Segura
 * Utiliza WebCrypto nativo (compatível com Node.js 18+, Edge e Browser)
 * PBKDF2 (SHA-256, 100.000 iterações) + Salt aleatório de 16 bytes
 * Assinatura criptográfica HMAC-SHA256 para tokens de sessão
 * 
 * ATENÇÃO DE GOVERNANÇA: NENHUM SEGREDO FIXO NO CÓDIGO-FONTE.
 * Exige a variável HITFIT_AUTH_SECRET configurada no ambiente do servidor.
 */

const PBKDF2_ITERATIONS = 100_000;
const HASH_LENGTH = 32; // 256 bits
const MIN_SECRET_LENGTH = 32;

export const ALLOWED_ROLES = ['rangel', 'geicsania'] as const;
export type AllowedRole = (typeof ALLOWED_ROLES)[number];

export class AuthSecretMissingError extends Error {
  constructor() {
    super(
      'CONFIGURAÇÃO CRÍTICA AUSENTE: A variável de ambiente HITFIT_AUTH_SECRET não está configurada no servidor ou possui menos de 32 caracteres. Configure HITFIT_AUTH_SECRET no painel da Vercel / ambiente de produção antes de emitir ou validar autenticações.'
    );
    this.name = 'AuthSecretMissingError';
  }
}

/**
 * Verifica se a variável de ambiente do segredo de autenticação está configurada com tamanho seguro
 */
export function isAuthSecretConfigured(): boolean {
  const secret = process.env.HITFIT_AUTH_SECRET;
  return Boolean(secret && secret.trim().length >= MIN_SECRET_LENGTH);
}

/**
 * Obtém o segredo de assinatura estritamente a partir das variáveis de ambiente
 * Lança erro caso o segredo esteja ausente ou seja inseguro.
 */
export function getAuthSecret(): string {
  const secret = process.env.HITFIT_AUTH_SECRET;
  if (!secret || secret.trim().length < MIN_SECRET_LENGTH) {
    throw new AuthSecretMissingError();
  }
  return secret.trim();
}

/**
 * Valida se a role solicitada pertence estritamente aos atletas autorizados
 */
export function isValidRole(role: string): role is AllowedRole {
  return ALLOWED_ROLES.includes(role as AllowedRole);
}

/**
 * Retorna o identificador do parceiro autorizado único para um dado atleta
 * Rangel <-> Geicsania (nenhum terceiro é aceito)
 */
export function getAuthorizedPartnerId(userId: string): string | null {
  const clean = userId.replace(/^person-/, '').toLowerCase().trim();
  if (clean === 'rangel') return 'person-geicsania';
  if (clean === 'geicsania') return 'person-rangel';
  return null;
}

/**
 * Converte ArrayBuffer para string hexadecimal
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converte string hexadecimal para Uint8Array com ArrayBuffer dedicado
 */
function hexToBuffer(hex: string): Uint8Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Gera um salt criptograficamente aleatório em formato hexadecimal
 */
export function generateSalt(length = 16): string {
  const buffer = new ArrayBuffer(length);
  const bytes = new Uint8Array(buffer);
  globalThis.crypto.getRandomValues(bytes);
  return bufferToHex(buffer);
}

/**
 * Gera o hash da senha utilizando PBKDF2 com SHA-256 e 100.000 iterações
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  const saltBuffer = hexToBuffer(salt);

  const baseKey = await globalThis.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    HASH_LENGTH * 8
  );

  return bufferToHex(derivedBits);
}

/**
 * Verifica se a senha fornecida corresponde ao hash armazenado (tempo constante)
 */
export async function verifyPassword(password: string, salt: string, storedHash: string): Promise<boolean> {
  const computedHash = await hashPassword(password, salt);
  if (computedHash.length !== storedHash.length) return false;

  let diff = 0;
  for (let i = 0; i < computedHash.length; i++) {
    diff |= computedHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return diff === 0;
}

export interface SessionPayload {
  userId: string;
  name: string;
  role: AllowedRole;
  iat: number; // Emitido em (timestamp ms)
  exp: number; // Expiração (timestamp ms)
}

/**
 * Cria uma chave HMAC para assinatura e validação de tokens
 * Exige segredo fornecido por variável de ambiente segura
 */
async function getHmacKey(): Promise<CryptoKey> {
  const secret = getAuthSecret();
  const enc = new TextEncoder();
  return globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Gera um token de sessão criptograficamente assinado com validade configurável (padrão: 30 dias)
 */
export async function createSessionToken(
  user: { id: string; name: string; role: AllowedRole },
  durationDays = 30
): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = {
    userId: user.id,
    name: user.name,
    role: user.role,
    iat: now,
    exp: now + durationDays * 24 * 60 * 60 * 1000
  };

  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = btoa(encodeURIComponent(payloadJson));

  const key = await getHmacKey();
  const signatureBuffer = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadBase64)
  );

  const signatureHex = bufferToHex(signatureBuffer);
  return `${payloadBase64}.${signatureHex}`;
}

/**
 * Valida o token de sessão, conferindo a assinatura HMAC e o tempo de expiração
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token || !token.includes('.')) return null;

  const [payloadBase64, signatureHex] = token.split('.');
  if (!payloadBase64 || !signatureHex) return null;

  try {
    const key = await getHmacKey();
    const signatureBytes = hexToBuffer(signatureHex);

    const isValid = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      new TextEncoder().encode(payloadBase64)
    );

    if (!isValid) return null;

    const payloadJson = decodeURIComponent(atob(payloadBase64));
    const payload: SessionPayload = JSON.parse(payloadJson);

    if (Date.now() > payload.exp) {
      return null; // Token expirado
    }

    if (!isValidRole(payload.role)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Validador de Autorização RBAC no Servidor:
 * Garante que o atleta autenticado só possa modificar seus próprios dados.
 * Retorna true apenas se authenticatedUserId coincidir exatamente com targetUserId.
 */
export function canModifyAthleteData(authenticatedUserId: string, targetUserId: string): boolean {
  if (!authenticatedUserId || !targetUserId) return false;
  
  // Normalização de IDs (ex: 'rangel' e 'person-rangel')
  const normalize = (id: string) => id.replace(/^person-/, '').toLowerCase().trim();
  return normalize(authenticatedUserId) === normalize(targetUserId);
}

/**
 * Calcula a idade com base na data de nascimento (YYYY-MM-DD)
 */
export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}
