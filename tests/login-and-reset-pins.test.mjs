/**
 * HIT-FIT 2.0 | Suíte Automatizada de Testes de Autenticação e Redefinição de PINs
 * Cobre os 18 cenários da missão de estabilização e recuperação do proprietário.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  generateSalt,
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  isAdminKeyConfigured,
  verifyAdminKey,
  isAuthSecretConfigured,
  canModifyAthleteData
} from '../lib/auth-crypto.ts';

import {
  getUserAccount,
  saveAthleteData,
  getAthleteData,
  getFailedLoginAttempts,
  recordFailedLoginAttempt,
  resetFailedLoginAttempts,
  adminResetHitFitNamespace,
  adminSetupUserPins,
  isCloudConfigured,
  isProductionEnvironment,
  PersistentStorageNotConfiguredError
} from '../lib/cloud-store.ts';

import authHandler from '../api/auth.ts';

const VALID_AUTH_SECRET = 'hitfit_test_super_secret_master_key_2026_longer_than_32_chars';
const VALID_ADMIN_KEY = 'admin_master_hitfit_key_2026_secure';

process.env.HITFIT_AUTH_SECRET = VALID_AUTH_SECRET;
process.env.HITFIT_ADMIN_KEY = VALID_ADMIN_KEY;

function makeRequest(path, options = {}) {
  const url = `http://localhost:3000${path}`;
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return new Request(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
}

// -------------------------------------------------------------
// CENÁRIO 1: Reset seguro do namespace hitfit:* sem afetar outras chaves
// -------------------------------------------------------------
test('1. Reset completo do namespace hitfit:* preservando chaves de outros apps', async () => {
  const res = await adminResetHitFitNamespace({ deleteUsers: true, deleteData: true, clearRateLimits: true });
  assert.ok(typeof res.deletedCount === 'number');
  assert.ok(Array.isArray(res.deletedKeys));
  for (const key of res.deletedKeys) {
    assert.ok(key.startsWith('hitfit:'), `A chave ${key} não pertence ao namespace hitfit:*`);
  }
});

// -------------------------------------------------------------
// CENÁRIO 2: setup_pins sem HITFIT_ADMIN_KEY retorna erro
// -------------------------------------------------------------
test('2. Tentativa de setup_pins sem HITFIT_ADMIN_KEY configurada retorna erro 503', async () => {
  const originalKey = process.env.HITFIT_ADMIN_KEY;
  delete process.env.HITFIT_ADMIN_KEY;
  delete process.env.ADMIN_KEY;
  delete process.env.HITFIT_SETUP_SECRET;

  try {
    const req = makeRequest('/api/auth', {
      method: 'POST',
      body: { action: 'admin_setup_pins', pinRangel: '123456', pinJack: '654321' }
    });
    const res = await authHandler(req);
    assert.equal(res.status, 503);
    const data = await res.json();
    assert.equal(data.code, 'ADMIN_KEY_NOT_CONFIGURED');
  } finally {
    process.env.HITFIT_ADMIN_KEY = originalKey;
  }
});

// -------------------------------------------------------------
// CENÁRIO 3: setup_pins com HITFIT_ADMIN_KEY incorreta retorna 401
// -------------------------------------------------------------
test('3. Tentativa de setup_pins com HITFIT_ADMIN_KEY incorreta retorna 401', async () => {
  const req = makeRequest('/api/auth', {
    method: 'POST',
    headers: { 'X-Admin-Key': 'chave_incorreta_totalmente_invalida' },
    body: { action: 'admin_setup_pins', pinRangel: '123456', pinJack: '654321', adminKey: 'errada' }
  });
  const res = await authHandler(req);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.code, 'UNAUTHORIZED_ADMIN');
});

// -------------------------------------------------------------
// CENÁRIO 4: setup_pins com HITFIT_ADMIN_KEY correta provisiona contas (200)
// -------------------------------------------------------------
test('4. Tentativa de setup_pins com HITFIT_ADMIN_KEY correta cria contas com 200', async () => {
  const req = makeRequest('/api/auth', {
    method: 'POST',
    headers: { 'X-Admin-Key': VALID_ADMIN_KEY },
    body: {
      action: 'admin_setup_pins',
      adminKey: VALID_ADMIN_KEY,
      pinRangel: '987654',
      pinJack: '456789'
    }
  });
  const res = await authHandler(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);

  const rangel = await getUserAccount('person-rangel');
  const jack = await getUserAccount('person-geicsania');
  assert.ok(rangel);
  assert.ok(jack);
  assert.equal(rangel.username, 'rangel');
  assert.equal(jack.username, 'jack');
});

// -------------------------------------------------------------
// CENÁRIO 5: Re-execução com admin key permite redefinir PINs sem erro 409
// -------------------------------------------------------------
test('5. Re-execução de setup_pins com chave correta redefine PINs sem 409', async () => {
  const req = makeRequest('/api/auth', {
    method: 'POST',
    headers: { 'X-Admin-Key': VALID_ADMIN_KEY },
    body: {
      action: 'admin_setup_pins',
      adminKey: VALID_ADMIN_KEY,
      pinRangel: '112233',
      pinJack: '445566'
    }
  });
  const res = await authHandler(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);

  // Valida que os novos PINs foram persistidos
  const rangel = await getUserAccount('person-rangel');
  const match = await verifyPassword('112233', rangel.salt, rangel.passwordHash);
  assert.equal(match, true);
});

// -------------------------------------------------------------
// CENÁRIO 6: Login com PIN correto de Rangel retorna 200 e token
// -------------------------------------------------------------
test('6. Login com PIN correto de Rangel retorna 200 e token JWT válido', async () => {
  const req = makeRequest('/api/auth', {
    method: 'POST',
    body: { action: 'login', usernameOrRole: 'rangel', password: '112233' }
  });
  const res = await authHandler(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.token);
  assert.equal(data.user.id, 'person-rangel');

  const session = await verifySessionToken(data.token);
  assert.ok(session);
  assert.equal(session.userId, 'person-rangel');
});

// -------------------------------------------------------------
// CENÁRIO 7: Login com PIN correto de Jack retorna 200 e token
// -------------------------------------------------------------
test('7. Login com PIN correto de Jack retorna 200 e token JWT válido', async () => {
  const req = makeRequest('/api/auth', {
    method: 'POST',
    body: { action: 'login', usernameOrRole: 'jack', password: '445566' }
  });
  const res = await authHandler(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.token);
  assert.equal(data.user.id, 'person-geicsania');

  const session = await verifySessionToken(data.token);
  assert.ok(session);
  assert.equal(session.userId, 'person-geicsania');
});

// -------------------------------------------------------------
// CENÁRIO 8: PIN com zero à esquerda (ex: '012345') tratado como string
// -------------------------------------------------------------
test('8. PINs com zero à esquerda (ex: "012345") tratados estritamente como string sem perda de dígitos', async () => {
  const setupReq = makeRequest('/api/auth', {
    method: 'POST',
    headers: { 'X-Admin-Key': VALID_ADMIN_KEY },
    body: {
      action: 'admin_setup_pins',
      adminKey: VALID_ADMIN_KEY,
      pinRangel: '012345',
      pinJack: '098765'
    }
  });
  const setupRes = await authHandler(setupReq);
  assert.equal(setupRes.status, 200);

  // Login com PIN começando com zero
  const loginReq = makeRequest('/api/auth', {
    method: 'POST',
    body: { action: 'login', usernameOrRole: 'rangel', password: '012345' }
  });
  const loginRes = await authHandler(loginReq);
  assert.equal(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.equal(loginData.success, true);
});

// -------------------------------------------------------------
// CENÁRIO 9: PIN com caracteres não-numéricos retorna 400
// -------------------------------------------------------------
test('9. PIN com caracteres não-numéricos retorna 400 INVALID_PIN_FORMAT', async () => {
  const req = makeRequest('/api/auth', {
    method: 'POST',
    body: { action: 'login', usernameOrRole: 'rangel', password: '12a45b' }
  });
  const res = await authHandler(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.code, 'INVALID_PIN_FORMAT');
});

// -------------------------------------------------------------
// CENÁRIO 10: PIN com tamanho diferente de 6 dígitos retorna 400
// -------------------------------------------------------------
test('10. PIN com tamanho diferente de 6 dígitos (ex: 4 ou 8) retorna 400', async () => {
  const shortReq = makeRequest('/api/auth', {
    method: 'POST',
    body: { action: 'login', usernameOrRole: 'rangel', password: '123' }
  });
  const shortRes = await authHandler(shortReq);
  assert.equal(shortRes.status, 400);

  const longReq = makeRequest('/api/auth', {
    method: 'POST',
    body: { action: 'login', usernameOrRole: 'rangel', password: '12345678' }
  });
  const longRes = await authHandler(longReq);
  assert.equal(longRes.status, 400);
});

// -------------------------------------------------------------
// CENÁRIO 11: Login com PIN incorreto retorna 401 com tentativas restantes
// -------------------------------------------------------------
test('11. Login com PIN incorreto retorna 401 e indica tentativas restantes', async () => {
  await resetFailedLoginAttempts('person-rangel', '127.0.0.1');

  const req = makeRequest('/api/auth', {
    method: 'POST',
    body: { action: 'login', usernameOrRole: 'rangel', password: '999999' }
  });
  const res = await authHandler(req);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.code, 'INVALID_PASSWORD');
  assert.equal(data.remainingAttempts, 4);
});

// -------------------------------------------------------------
// CENÁRIO 12: 5 tentativas incorretas consecutivas disparam 429 Rate Limit
// -------------------------------------------------------------
test('12. 5 tentativas incorretas consecutivas bloqueiam com 429 Rate Limit e Retry-After', async () => {
  await resetFailedLoginAttempts('person-rangel', '127.0.0.1');

  // Executa 5 tentativas incorretas
  for (let i = 0; i < 5; i++) {
    const req = makeRequest('/api/auth', {
      method: 'POST',
      body: { action: 'login', usernameOrRole: 'rangel', password: '999999' }
    });
    await authHandler(req);
  }

  // 6ª tentativa deve retornar 429
  const blockedReq = makeRequest('/api/auth', {
    method: 'POST',
    body: { action: 'login', usernameOrRole: 'rangel', password: '012345' } // mesmo com PIN correto, está bloqueado
  });
  const blockedRes = await authHandler(blockedReq);
  assert.equal(blockedRes.status, 429);
  assert.ok(blockedRes.headers.get('Retry-After'));
  const data = await blockedRes.json();
  assert.equal(data.code, 'TOO_MANY_ATTEMPTS');
});

// -------------------------------------------------------------
// CENÁRIO 13: Sucesso de login e desbloqueio após reset de rate limit
// -------------------------------------------------------------
test('13. Sucesso após reset de rate limit e liberação imediata', async () => {
  await resetFailedLoginAttempts('person-rangel', '127.0.0.1');

  const req = makeRequest('/api/auth', {
    method: 'POST',
    body: { action: 'login', usernameOrRole: 'rangel', password: '012345' }
  });
  const res = await authHandler(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
});

// -------------------------------------------------------------
// CENÁRIO 14: Isolamento: token de Rangel não pode modificar dados de Jack
// -------------------------------------------------------------
test('14. Isolamento: token de Rangel não pode modificar dados de Jack (403)', async () => {
  const tokenRangel = await createSessionToken({
    id: 'person-rangel',
    name: 'Rangel',
    role: 'rangel'
  });

  const req = makeRequest('/api/auth', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenRangel}` },
    body: {
      action: 'update_profile',
      userId: 'person-geicsania', // Tentativa não autorizada
      initialWeightKg: 55
    }
  });
  const res = await authHandler(req);
  assert.equal(res.status, 403);
  const data = await res.json();
  assert.equal(data.code, 'FORBIDDEN_CROSS_USER_MODIFICATION');
});

// -------------------------------------------------------------
// CENÁRIO 15: Isolamento: token de Jack não pode modificar dados de Rangel
// -------------------------------------------------------------
test('15. Isolamento: token de Jack não pode modificar dados de Rangel (403)', async () => {
  const tokenJack = await createSessionToken({
    id: 'person-geicsania',
    name: 'Jack',
    role: 'jack'
  });

  const req = makeRequest('/api/auth', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenJack}` },
    body: {
      action: 'update_profile',
      userId: 'person-rangel', // Tentativa não autorizada
      initialWeightKg: 95
    }
  });
  const res = await authHandler(req);
  assert.equal(res.status, 403);
  const data = await res.json();
  assert.equal(data.code, 'FORBIDDEN_CROSS_USER_MODIFICATION');
});

// -------------------------------------------------------------
// CENÁRIO 16: Persistência de novos dados biométricos após redefinição
// -------------------------------------------------------------
test('16. Persistência de novos dados biométricos após login', async () => {
  const tokenRangel = await createSessionToken({
    id: 'person-rangel',
    name: 'Rangel',
    role: 'rangel'
  });

  const req = makeRequest('/api/auth', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenRangel}` },
    body: {
      action: 'update_profile',
      userId: 'person-rangel',
      birthDate: '1996-05-15',
      initialWeightKg: 97.0,
      currentWeightKg: 97.0,
      heightCm: 178,
      goal: 'Emagrecimento & Definição',
      activityLevel: 'Avançado'
    }
  });
  const res = await authHandler(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.initialWeightKg, 97.0);
  assert.equal(data.user.heightCm, 178);

  const updatedAccount = await getUserAccount('person-rangel');
  assert.equal(updatedAccount.initialWeightKg, 97.0);
  assert.equal(updatedAccount.heightCm, 178);
});

// -------------------------------------------------------------
// CENÁRIO 17: Ausência de credenciais fixas (hardcoded) no código ou em fallbacks
// -------------------------------------------------------------
test('17. Ausência total de senhas/segredos fixos hardcoded no código ou fallbacks', () => {
  const authCode = fs.readFileSync(path.resolve('api/auth.ts'), 'utf-8');
  const syncCode = fs.readFileSync(path.resolve('api/sync.ts'), 'utf-8');
  const cryptoCode = fs.readFileSync(path.resolve('lib/auth-crypto.ts'), 'utf-8');

  const FORBIDDEN_SEED = 'hitfit_duo_pro_master_crypto_seed_2026_production_secure_key';

  assert.ok(!authCode.includes(FORBIDDEN_SEED), 'api/auth.ts ainda contém fallback hardcoded');
  assert.ok(!syncCode.includes(FORBIDDEN_SEED), 'api/sync.ts ainda contém fallback hardcoded');
  assert.ok(!cryptoCode.includes(FORBIDDEN_SEED), 'lib/auth-crypto.ts ainda contém fallback hardcoded');
});

// -------------------------------------------------------------
// CENÁRIO 18: Falha segura se KV não estiver configurado em ambiente de produção (503)
// -------------------------------------------------------------
test('18. Falha segura se KV não estiver configurado em ambiente de produção (503)', async () => {
  const originalVercel = process.env.VERCEL;
  process.env.VERCEL = '1'; // Simula runtime de produção Vercel

  const originalKvUrl = process.env.KV_REST_API_URL;
  const originalRedisUrl = process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.KV_REST_API_URL;
  delete process.env.UPSTASH_REDIS_REST_URL;

  try {
    const req = makeRequest('/api/auth', { method: 'GET' });
    const res = await authHandler(req);
    assert.equal(res.status, 503);
    const data = await res.json();
    assert.equal(data.code, 'PERSISTENT_STORAGE_NOT_CONFIGURED');
  } finally {
    if (originalVercel !== undefined) process.env.VERCEL = originalVercel;
    else delete process.env.VERCEL;
    if (originalKvUrl !== undefined) process.env.KV_REST_API_URL = originalKvUrl;
    if (originalRedisUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = originalRedisUrl;
  }
});
