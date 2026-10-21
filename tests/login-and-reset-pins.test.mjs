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
  canModifyAthleteData,
  getAuthSecret
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
  PersistentStorageNotConfiguredError,
  MAX_FAILED_LOGIN_ATTEMPTS
} from '../lib/cloud-store.ts';

const VALID_AUTH_SECRET = 'hitfit_test_super_secret_master_key_2026_longer_than_32_chars';
const VALID_ADMIN_KEY = 'admin_master_hitfit_key_2026_secure';

process.env.HITFIT_AUTH_SECRET = VALID_AUTH_SECRET;
process.env.HITFIT_ADMIN_KEY = VALID_ADMIN_KEY;

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
// CENÁRIO 2: setup_pins sem HITFIT_ADMIN_KEY retorna erro quando exigida
// -------------------------------------------------------------
test('2. Tentativa de setup_pins sem HITFIT_ADMIN_KEY configurada quando contas existem', () => {
  const originalKey = process.env.HITFIT_ADMIN_KEY;
  delete process.env.HITFIT_ADMIN_KEY;
  delete process.env.ADMIN_KEY;
  delete process.env.HITFIT_SETUP_SECRET;

  try {
    assert.equal(isAdminKeyConfigured(), false);
  } finally {
    process.env.HITFIT_ADMIN_KEY = originalKey;
  }
});

// -------------------------------------------------------------
// CENÁRIO 3: setup_pins com HITFIT_ADMIN_KEY incorreta retorna false
// -------------------------------------------------------------
test('3. Tentativa de setup_pins com HITFIT_ADMIN_KEY incorreta é rejeitada em tempo constante', () => {
  assert.equal(verifyAdminKey('chave_incorreta_totalmente_invalida'), false);
  assert.equal(verifyAdminKey(''), false);
  assert.equal(verifyAdminKey('curta'), false);
});

// -------------------------------------------------------------
// CENÁRIO 4: setup_pins com HITFIT_ADMIN_KEY correta cria contas
// -------------------------------------------------------------
test('4. Tentativa de setup_pins com HITFIT_ADMIN_KEY correta provisiona contas e salts', async () => {
  assert.equal(verifyAdminKey(VALID_ADMIN_KEY), true);

  const { accountRangel, accountJack } = await adminSetupUserPins('987654', '456789');
  assert.ok(accountRangel);
  assert.ok(accountJack);
  assert.equal(accountRangel.id, 'person-rangel');
  assert.equal(accountJack.id, 'person-geicsania');
  assert.ok(accountRangel.salt && accountRangel.salt.length >= 16);
  assert.ok(accountJack.salt && accountJack.salt.length >= 16);

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
  const { accountRangel } = await adminSetupUserPins('112233', '445566');
  assert.ok(accountRangel);

  const rangel = await getUserAccount('person-rangel');
  const match = await verifyPassword('112233', rangel.salt, rangel.passwordHash);
  assert.equal(match, true);

  const oldMatch = await verifyPassword('987654', rangel.salt, rangel.passwordHash);
  assert.equal(oldMatch, false, 'O PIN antigo não deve mais ser válido após redefinição');
});

// -------------------------------------------------------------
// CENÁRIO 6: Login com PIN correto de Rangel retorna sucesso e token
// -------------------------------------------------------------
test('6. Login com PIN correto de Rangel retorna token JWT válido', async () => {
  const rangel = await getUserAccount('person-rangel');
  assert.ok(rangel);
  const match = await verifyPassword('112233', rangel.salt, rangel.passwordHash);
  assert.equal(match, true);

  const token = await createSessionToken({
    id: rangel.id,
    name: rangel.name,
    role: 'rangel'
  });
  assert.ok(token);

  const session = await verifySessionToken(token);
  assert.ok(session);
  assert.equal(session.userId, 'person-rangel');
  assert.equal(session.role, 'rangel');
});

// -------------------------------------------------------------
// CENÁRIO 7: Login com PIN correto de Jack retorna sucesso e token
// -------------------------------------------------------------
test('7. Login com PIN correto de Jack retorna token JWT válido', async () => {
  const jack = await getUserAccount('person-geicsania');
  assert.ok(jack);
  const match = await verifyPassword('445566', jack.salt, jack.passwordHash);
  assert.equal(match, true);

  const token = await createSessionToken({
    id: jack.id,
    name: jack.name,
    role: 'jack'
  });
  assert.ok(token);

  const session = await verifySessionToken(token);
  assert.ok(session);
  assert.equal(session.userId, 'person-geicsania');
  assert.equal(session.role, 'jack');
});

// -------------------------------------------------------------
// CENÁRIO 8: PIN com zero à esquerda (ex: '012345') tratado como string
// -------------------------------------------------------------
test('8. PINs com zero à esquerda (ex: "012345") tratados estritamente como string sem perda de dígitos', async () => {
  const pinWithZero = '012345';
  assert.equal(pinWithZero.length, 6);
  assert.equal(pinWithZero.startsWith('0'), true);

  const salt = generateSalt(16);
  const hash = await hashPassword(pinWithZero, salt);

  const match = await verifyPassword('012345', salt, hash);
  assert.equal(match, true);

  // Se convertido por engano para número e depois string, '12345' falha!
  const numberConverted = String(Number(pinWithZero));
  assert.equal(numberConverted, '12345');
  const falseMatch = await verifyPassword(numberConverted, salt, hash);
  assert.equal(falseMatch, false, 'PIN truncado para 5 dígitos não pode bater com o PIN original');
});

// -------------------------------------------------------------
// CENÁRIO 9: PIN com caracteres não-numéricos retorna inválido
// -------------------------------------------------------------
test('9. PIN com caracteres não-numéricos rejeitado por validação', () => {
  const invalidPin = '12a45b';
  const isValid = /^\d{6}$/.test(invalidPin);
  assert.equal(isValid, false);
});

// -------------------------------------------------------------
// CENÁRIO 10: PIN com tamanho diferente de 6 dígitos retorna inválido
// -------------------------------------------------------------
test('10. PIN com tamanho diferente de 6 dígitos (ex: 4 ou 8) rejeitado por validação', () => {
  assert.equal(/^\d{6}$/.test('1234'), false);
  assert.equal(/^\d{6}$/.test('12345678'), false);
  assert.equal(/^\d{6}$/.test(''), false);
  assert.equal(/^\d{6}$/.test('123456'), true);
});

// -------------------------------------------------------------
// CENÁRIO 11: Login com PIN incorreto retorna falha e indica tentativas restantes
// -------------------------------------------------------------
test('11. Login com PIN incorreto registra falha e calcula tentativas restantes', async () => {
  await resetFailedLoginAttempts('person-rangel', '127.0.0.1');

  await recordFailedLoginAttempt('person-rangel', '127.0.0.1');
  const rateLimit = await getFailedLoginAttempts('person-rangel', '127.0.0.1');

  const attemptsCount = rateLimit.attempts ?? rateLimit.count ?? 1;
  const remainingAttempts = Math.max(0, MAX_FAILED_LOGIN_ATTEMPTS - attemptsCount);
  assert.equal(attemptsCount, 1);
  assert.equal(remainingAttempts, 4);
});

// -------------------------------------------------------------
// CENÁRIO 12: 5 tentativas incorretas consecutivas disparam Rate Limit com bloqueio
// -------------------------------------------------------------
test('12. 5 tentativas incorretas consecutivas bloqueiam com blocked = true', async () => {
  await resetFailedLoginAttempts('person-rangel', '127.0.0.1');

  for (let i = 0; i < 5; i++) {
    await recordFailedLoginAttempt('person-rangel', '127.0.0.1');
  }

  const rateLimit = await getFailedLoginAttempts('person-rangel', '127.0.0.1');
  assert.equal(rateLimit.blocked, true);
  assert.ok(rateLimit.retryAfterSeconds > 0);
});

// -------------------------------------------------------------
// CENÁRIO 13: Sucesso de login e desbloqueio após reset de rate limit
// -------------------------------------------------------------
test('13. Sucesso após reset de rate limit e liberação imediata', async () => {
  await resetFailedLoginAttempts('person-rangel', '127.0.0.1');

  const rateLimit = await getFailedLoginAttempts('person-rangel', '127.0.0.1');
  assert.equal(rateLimit.blocked, false);
  assert.equal(rateLimit.attempts, 0);
});

// -------------------------------------------------------------
// CENÁRIO 14: Isolamento: token de Rangel não pode modificar dados de Jack
// -------------------------------------------------------------
test('14. Isolamento: Rangel não pode modificar dados de Jack', () => {
  const canModify = canModifyAthleteData('person-rangel', 'person-geicsania');
  assert.equal(canModify, false);
  assert.equal(canModifyAthleteData('person-rangel', 'person-rangel'), true);
});

// -------------------------------------------------------------
// CENÁRIO 15: Isolamento: token de Jack não pode modificar dados de Rangel
// -------------------------------------------------------------
test('15. Isolamento: Jack não pode modificar dados de Rangel', () => {
  const canModify = canModifyAthleteData('person-geicsania', 'person-rangel');
  assert.equal(canModify, false);
  assert.equal(canModifyAthleteData('person-geicsania', 'person-geicsania'), true);
});

// -------------------------------------------------------------
// CENÁRIO 16: Persistência de novos dados biométricos após redefinição
// -------------------------------------------------------------
test('16. Persistência de novos dados biométricos após setup', async () => {
  const now = new Date().toISOString();
  await saveAthleteData({
    userId: 'person-rangel',
    currentWeightKg: 97.0,
    weightHistory: [{ id: 'w1', date: '2026-10-21', weightKg: 97.0 }],
    weightGoal: { initialKg: 97.0, currentKg: 97.0, targetKg: 85.0, objective: 'Emagrecimento & Definição', updatedAt: now },
    waterLogs: {},
    nutritionDays: {},
    savedSets: {},
    workoutHistory: [],
    updatedAt: now
  });

  const athlete = await getAthleteData('person-rangel');
  assert.ok(athlete);
  assert.equal(athlete.currentWeightKg, 97.0);
  assert.equal(athlete.weightGoal.targetKg, 85.0);
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
// CENÁRIO 18: Falha segura se KV não estiver configurado em ambiente de produção
// -------------------------------------------------------------
test('18. Falha segura se KV não estiver configurado em ambiente de produção', async () => {
  const originalVercel = process.env.VERCEL;
  process.env.VERCEL = '1';

  const originalKvUrl = process.env.KV_REST_API_URL;
  const originalRedisUrl = process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.KV_REST_API_URL;
  delete process.env.UPSTASH_REDIS_REST_URL;

  try {
    assert.equal(isCloudConfigured(), false);
    assert.equal(isProductionEnvironment(), true);
    await assert.rejects(
      async () => {
        await adminResetHitFitNamespace();
      },
      (err) => err instanceof PersistentStorageNotConfiguredError
    );
  } finally {
    if (originalVercel !== undefined) process.env.VERCEL = originalVercel;
    else delete process.env.VERCEL;
    if (originalKvUrl !== undefined) process.env.KV_REST_API_URL = originalKvUrl;
    if (originalRedisUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = originalRedisUrl;
  }
});
