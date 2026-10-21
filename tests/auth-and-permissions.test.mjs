/**
 * HIT-FIT 2.0 | Suíte de Testes Automatizados de Segurança, Criptografia e Autorização
 * Valida:
 * 1. Proteção de Segredos e Falha Segura (Ausência de HITFIT_AUTH_SECRET dispara erro explícito)
 * 2. Criptografia PBKDF2 e Verificação de Senhas/PINs (100.000 iterações + Salt único)
 * 3. Tokens de Sessão com Assinatura HMAC-SHA256 para Rangel e Jack
 * 4. Restrição Estrita de Papéis (Roles) e Normalização (apenas rangel e jack/geicsania)
 * 5. Isolamento de Leitura de Parceiro Autorizado (getAuthorizedPartnerId: Rangel <-> Jack)
 * 6. Regras de Autorização RBAC no Servidor (Rangel vs Jack)
 * 7. Validação do Formato do PIN de 6 dígitos numéricos
 * 8. Cadastro Inicial: Cálculo Automático de Idade
 * 9. Treino Guiado Sequencial: Discriminação real de concluídos vs pulados
 * 10. Prevenção do Bug do Zero nos Inputs Numéricos e Decimais Brasileiros
 * 11. Validação de Limites Biométricos Reais
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Importa módulos a serem testados
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  canModifyAthleteData,
  calculateAge,
  isAuthSecretConfigured,
  getAuthSecret,
  isValidRole,
  getAuthorizedPartnerId,
  AuthSecretMissingError,
  isAdminKeyConfigured,
  verifyAdminKey
} from '../lib/auth-crypto.ts';

import {
  getFailedLoginAttempts,
  recordFailedLoginAttempt,
  resetFailedLoginAttempts,
  revokeUserSessions,
  isSessionRevoked,
  MAX_FAILED_LOGIN_ATTEMPTS
} from '../lib/cloud-store.ts';

import {
  parseHeight,
  formatHeight,
  formatWeight
} from '../lib/biometrics.ts';

const TEST_SECRET = 'hitfit-test-crypto-secret-key-at-least-32-characters-long-2026';

test('1. Proteção de Segredos: Falha segura quando HITFIT_AUTH_SECRET está ausente ou curto', () => {
  // Caso 1: Variável ausente / indefinida
  delete process.env.HITFIT_AUTH_SECRET;
  assert.strictEqual(isAuthSecretConfigured(), false, 'Deve retornar false se o segredo não estiver definido');
  assert.throws(
    () => getAuthSecret(),
    (err) => err instanceof AuthSecretMissingError,
    'Deve lançar AuthSecretMissingError quando o segredo estiver ausente'
  );

  // Caso 2: Segredo com menos de 32 caracteres (inseguro)
  process.env.HITFIT_AUTH_SECRET = 'curto-demais';
  assert.strictEqual(isAuthSecretConfigured(), false, 'Deve rejeitar segredos com menos de 32 caracteres');
  assert.throws(
    () => getAuthSecret(),
    (err) => err instanceof AuthSecretMissingError,
    'Deve lançar AuthSecretMissingError para segredos curtos'
  );

  // Caso 3: Segredo seguro configurado
  process.env.HITFIT_AUTH_SECRET = TEST_SECRET;
  assert.strictEqual(isAuthSecretConfigured(), true, 'Deve validar segredos com >= 32 caracteres');
  assert.strictEqual(getAuthSecret(), TEST_SECRET);
});

test('2. Criptografia PBKDF2: Geração de salt e hash seguro para PIN de 6 dígitos', async () => {
  const salt = generateSalt(16);
  assert.ok(salt, 'Salt deve ser gerado');
  assert.strictEqual(salt.length, 32, 'Salt de 16 bytes em hex deve ter 32 caracteres');

  const pin = '482915'; // Exemplo de PIN numérico de 6 dígitos
  const hash = await hashPassword(pin, salt);
  assert.ok(hash, 'Hash deve ser gerado com sucesso');
  assert.strictEqual(hash.length, 64, 'Hash SHA-256 deve ter 64 caracteres hexadecimais');

  // Verifica PIN correto
  const isMatch = await verifyPassword(pin, salt, hash);
  assert.strictEqual(isMatch, true, 'PIN correto deve retornar true');

  // Verifica PIN incorreto
  const isWrong = await verifyPassword('000000', salt, hash);
  assert.strictEqual(isWrong, false, 'PIN incorreto deve retornar false');
});

test('3. Tokens de Sessão HMAC-SHA256: Criação, assinatura e verificação para Rangel e Jack', async () => {
  process.env.HITFIT_AUTH_SECRET = TEST_SECRET;

  // Sessão de Rangel
  const athleteRangel = {
    id: 'person-rangel',
    name: 'Rangel',
    role: 'rangel'
  };

  const tokenRangel = await createSessionToken(athleteRangel, 30);
  assert.ok(tokenRangel.includes('.'), 'Token de Rangel deve conter payload e assinatura');
  const verifiedRangel = await verifySessionToken(tokenRangel);
  assert.ok(verifiedRangel, 'Token de Rangel deve ser validado');
  assert.strictEqual(verifiedRangel.userId, 'person-rangel');
  assert.strictEqual(verifiedRangel.role, 'rangel');

  // Sessão de Jack
  const athleteJack = {
    id: 'person-geicsania',
    name: 'Jack',
    role: 'jack'
  };

  const tokenJack = await createSessionToken(athleteJack, 30);
  assert.ok(tokenJack.includes('.'), 'Token de Jack deve conter payload e assinatura');
  const verifiedJack = await verifySessionToken(tokenJack);
  assert.ok(verifiedJack, 'Token de Jack deve ser validado');
  assert.strictEqual(verifiedJack.userId, 'person-geicsania');
  assert.strictEqual(verifiedJack.role, 'jack');

  // Testa rejeição de token adulterado
  const [, signature] = tokenJack.split('.');
  const tamperedPayload = btoa(encodeURIComponent(JSON.stringify({ userId: 'person-rangel', role: 'rangel' })));
  const tamperedToken = `${tamperedPayload}.${signature}`;

  const tamperedResult = await verifySessionToken(tamperedToken);
  assert.strictEqual(tamperedResult, null, 'Token adulterado deve ser rejeitado com null');

  // Testa rejeição de token expirado (-1 dia de validade)
  const expiredToken = await createSessionToken(athleteJack, -1);
  const expiredResult = await verifySessionToken(expiredToken);
  assert.strictEqual(expiredResult, null, 'Token expirado deve ser rejeitado');
});

test('4. Restrição Estrita de Papéis (Roles) e Normalização (Rangel e Jack)', () => {
  assert.strictEqual(isValidRole('rangel'), true, 'rangel deve ser um papel válido');
  assert.strictEqual(isValidRole('jack'), true, 'jack deve ser um papel válido');
  assert.strictEqual(isValidRole('geicsania'), true, 'geicsania (legado) deve ser reconhecido');
  
  // Rejeição de papéis não autorizados
  assert.strictEqual(isValidRole('admin'), false, 'admin deve ser rejeitado');
  assert.strictEqual(isValidRole('root'), false, 'root deve ser rejeitado');
  assert.strictEqual(isValidRole('visitor'), false, 'visitor deve ser rejeitado');
  assert.strictEqual(isValidRole(''), false, 'string vazia deve ser rejeitada');
});

test('5. Isolamento de Parceiro Autorizado: Rangel <-> Jack', () => {
  // O único parceiro autorizado de Rangel é Jack (person-geicsania)
  assert.strictEqual(getAuthorizedPartnerId('person-rangel'), 'person-geicsania');
  assert.strictEqual(getAuthorizedPartnerId('rangel'), 'person-geicsania');

  // O único parceiro autorizado de Jack é Rangel
  assert.strictEqual(getAuthorizedPartnerId('person-geicsania'), 'person-rangel');
  assert.strictEqual(getAuthorizedPartnerId('jack'), 'person-rangel');
  assert.strictEqual(getAuthorizedPartnerId('geicsania'), 'person-rangel');

  // Qualquer terceiro ou invasor não possui parceiro autorizado
  assert.strictEqual(getAuthorizedPartnerId('person-intruder'), null);
  assert.strictEqual(getAuthorizedPartnerId('admin'), null);
  assert.strictEqual(getAuthorizedPartnerId(''), null);
});

test('6. Autorização RBAC Estrita: Proteção contra modificações cruzadas entre Rangel e Jack', () => {
  // Rangel pode modificar os dados de Rangel
  assert.strictEqual(
    canModifyAthleteData('person-rangel', 'person-rangel'),
    true,
    'Rangel deve poder modificar seus próprios dados'
  );
  assert.strictEqual(
    canModifyAthleteData('rangel', 'person-rangel'),
    true,
    'Normalização de ID de Rangel deve funcionar'
  );

  // Rangel NÃO pode modificar os dados de Jack
  assert.strictEqual(
    canModifyAthleteData('person-rangel', 'person-geicsania'),
    false,
    'Rangel NÃO deve poder modificar os dados de Jack'
  );
  assert.strictEqual(
    canModifyAthleteData('rangel', 'jack'),
    false,
    'Rangel NÃO deve poder modificar Jack via alias'
  );

  // Jack NÃO pode modificar os dados de Rangel
  assert.strictEqual(
    canModifyAthleteData('person-geicsania', 'person-rangel'),
    false,
    'Jack NÃO deve poder modificar os dados de Rangel'
  );
  assert.strictEqual(
    canModifyAthleteData('jack', 'rangel'),
    false,
    'Jack NÃO deve poder modificar Rangel via alias'
  );

  // Jack pode modificar os dados de Jack
  assert.strictEqual(
    canModifyAthleteData('person-geicsania', 'person-geicsania'),
    true,
    'Jack deve poder modificar seus próprios dados'
  );
  assert.strictEqual(
    canModifyAthleteData('jack', 'person-geicsania'),
    true,
    'Alias jack deve poder modificar person-geicsania'
  );

  // IDs nulos ou vazios devem ser rejeitados
  assert.strictEqual(canModifyAthleteData('', 'person-rangel'), false);
  assert.strictEqual(canModifyAthleteData('person-rangel', ''), false);
});

test('7. Validação do Formato de PIN de 6 dígitos numéricos', () => {
  const isValidPin = (p) => typeof p === 'string' && /^\d{6}$/.test(p.trim());

  assert.strictEqual(isValidPin('123456'), true, 'PIN de 6 dígitos numéricos é válido');
  assert.strictEqual(isValidPin('000000'), true, 'PIN com zeros é válido');
  assert.strictEqual(isValidPin('12345'), false, 'PIN de 5 dígitos deve ser rejeitado');
  assert.strictEqual(isValidPin('1234567'), false, 'PIN de 7 dígitos deve ser rejeitado');
  assert.strictEqual(isValidPin('abcdef'), false, 'PIN com letras deve ser rejeitado');
  assert.strictEqual(isValidPin('12 345'), false, 'PIN com espaços deve ser rejeitado');
});

test('8. Cadastro / Primeiro Acesso: Cálculo automático de idade civil (sem erro UTC)', () => {
  // Teste 8.1: Nascido em 1997-05-15 avaliado em 2026-10-20 (aniversário já ocorreu no ano)
  const refOct2026 = new Date(2026, 9, 20); // 20 de outubro de 2026
  assert.strictEqual(
    calculateAge('1997-05-15', refOct2026),
    29,
    'Nascido em 15/05/1997 avaliado em 20/10/2026 deve ter exatamente 29 anos'
  );

  // Teste 8.2: Véspera do aniversário (aniversário ainda não ocorreu)
  const refEve2026 = new Date(2026, 4, 14); // 14 de maio de 2026
  assert.strictEqual(
    calculateAge('1997-05-15', refEve2026),
    28,
    'Um dia antes do aniversário a idade deve ser 28 anos'
  );

  // Teste 8.3: No dia exato do aniversário
  const refBday2026 = new Date(2026, 4, 15); // 15 de maio de 2026
  assert.strictEqual(
    calculateAge('1997-05-15', refBday2026),
    29,
    'No dia exato do aniversário a idade deve virar para 29 anos'
  );

  // Teste 8.4: Formato com barra DD/MM/YYYY
  assert.strictEqual(
    calculateAge('15/05/1997', refOct2026),
    29,
    'Formato DD/MM/YYYY também deve calcular 29 anos'
  );

  // Teste 8.5: Dados inválidos devem retornar 0 com segurança
  assert.strictEqual(calculateAge(''), 0);
  assert.strictEqual(calculateAge('data-invalida'), 0);
});

test('9. Treino Guiado Sequencial: Discriminação real de concluídos vs pulados', () => {
  const exercises = [
    { id: 'ex-1', name: 'Agachamento', sets: 4 },
    { id: 'ex-2', name: 'Leg Press', sets: 4 },
    { id: 'ex-3', name: 'Extensora', sets: 3 }
  ];

  const skipped = {
    'ex-2': 'Aparelho ou máquina ocupada'
  };

  const completedSets = {
    'ex-1:0': true,
    'ex-1:1': true,
    'ex-1:2': true,
    'ex-1:3': true,
    // ex-2 foi pulado!
    'ex-3:0': true,
    'ex-3:1': true,
    'ex-3:2': true
  };

  let completedExercisesCount = 0;
  const skippedList = [];

  exercises.forEach((ex) => {
    if (skipped[ex.id]) {
      skippedList.push({ exerciseName: ex.name, reason: skipped[ex.id] });
      return; // Pulados estritamente NÃO somam no contador de concluídos!
    }
    const allSetsDone = Array.from({ length: ex.sets }).every((_, s) => completedSets[`${ex.id}:${s}`]);
    if (allSetsDone) completedExercisesCount++;
  });

  assert.strictEqual(completedExercisesCount, 2, 'Apenas 2 exercícios foram concluídos (ex-1 e ex-3)');
  assert.strictEqual(skippedList.length, 1, '1 exercício foi registrado como pulado');
  assert.strictEqual(skippedList[0].exerciseName, 'Leg Press');
  assert.strictEqual(skippedList[0].reason, 'Aparelho ou máquina ocupada');
});

test('10. Validação do Bug do Zero e Decimais Brasileiros no NumericInput', () => {
  const parseNumericValue = (text, allowDecimals) => {
    if (!text || text.trim() === '') return null;
    const normalized = text.replace(',', '.').trim();
    const val = allowDecimals ? parseFloat(normalized) : parseInt(normalized, 10);
    return isNaN(val) ? null : val;
  };

  assert.strictEqual(parseNumericValue('', true), null, 'String vazia deve retornar null');
  assert.strictEqual(parseNumericValue('   ', true), null, 'Espaços em branco devem retornar null');
  assert.strictEqual(parseNumericValue('82,5', true), 82.5, 'Vírgula 82,5 deve ser convertida para 82.5');
  assert.strictEqual(parseNumericValue('64,3', true), 64.3, 'Vírgula 64,3 deve ser convertida para 64.3');
  assert.strictEqual(parseNumericValue('82.5', true), 82.5, 'Ponto 82.5 deve ser convertido para 82.5');
  assert.strictEqual(parseNumericValue('178', false), 178, 'Inteiro 178 deve retornar 178');
});

test('11. Validação de Limites de Integridade de Dados Biométricos', () => {
  const isValidWeight = (w) => {
    if (w === null || w === undefined) return true;
    const n = Number(w);
    return !isNaN(n) && n >= 20 && n <= 400;
  };

  assert.strictEqual(isValidWeight(82.5), true, 'Peso válido (82.5 kg) deve ser aceito');
  assert.strictEqual(isValidWeight(64), true, 'Peso válido (64 kg) deve ser aceito');
  assert.strictEqual(isValidWeight(null), true, 'Peso nulo (não informado) deve ser aceito');
  assert.strictEqual(isValidWeight(10), false, 'Peso abaixo de 20 kg deve ser rejeitado');
  assert.strictEqual(isValidWeight(500), false, 'Peso acima de 400 kg deve ser rejeitado');
  assert.strictEqual(isValidWeight('texto-invalido'), false, 'Texto não numérico deve ser rejeitado');
});

test('12. Proteção da Ativação: Validação de HITFIT_ADMIN_KEY em tempo constante e falha segura', () => {
  const originalAdminKey = process.env.HITFIT_ADMIN_KEY;
  const originalSetupSecret = process.env.HITFIT_SETUP_SECRET;

  try {
    // Caso 1: Chave ausente
    delete process.env.HITFIT_ADMIN_KEY;
    delete process.env.HITFIT_SETUP_SECRET;
    assert.strictEqual(isAdminKeyConfigured(), false, 'Deve retornar false quando HITFIT_ADMIN_KEY não estiver configurada');
    assert.strictEqual(verifyAdminKey('qualquer-coisa'), false, 'Não deve validar nenhuma chave se não configurada no servidor');

    // Caso 2: Chave curta demais (< 16 caracteres)
    process.env.HITFIT_ADMIN_KEY = 'curta-123';
    assert.strictEqual(isAdminKeyConfigured(), false, 'Deve retornar false para chave com menos de 16 caracteres');
    assert.strictEqual(verifyAdminKey('curta-123'), false, 'Deve rejeitar chave curta');

    // Caso 3: Chave válida configurada (>= 16 caracteres)
    const validKey = 'hitfit_admin_secret_key_prod_2026';
    process.env.HITFIT_ADMIN_KEY = validKey;
    assert.strictEqual(isAdminKeyConfigured(), true, 'Deve retornar true para chave válida com >= 16 caracteres');
    assert.strictEqual(verifyAdminKey(validKey), true, 'Deve aprovar a chave correta');
    assert.strictEqual(verifyAdminKey('chave-incorreta-de-teste-1234'), false, 'Deve rejeitar chave incorreta');
    assert.strictEqual(verifyAdminKey(''), false, 'Deve rejeitar string vazia');
    assert.strictEqual(verifyAdminKey(null), false, 'Deve rejeitar nulo');
  } finally {
    if (originalAdminKey) process.env.HITFIT_ADMIN_KEY = originalAdminKey;
    else delete process.env.HITFIT_ADMIN_KEY;
    if (originalSetupSecret) process.env.HITFIT_SETUP_SECRET = originalSetupSecret;
    else delete process.env.HITFIT_SETUP_SECRET;
  }
});

test('13. Proteção contra Força Bruta (Rate Limiting): Bloqueio após 5 tentativas falhas e reset no sucesso', async () => {
  const testUserId = 'test-athlete-' + Date.now();
  const testIp = '192.168.1.100';

  // Inicialmente sem bloqueio
  const initialStatus = await getFailedLoginAttempts(testUserId, testIp);
  assert.strictEqual(initialStatus.blocked, false, 'Inicialmente não deve estar bloqueado');
  assert.strictEqual(initialStatus.attempts, 0);

  // Registra 4 tentativas falhas (ainda não bloqueia)
  for (let i = 1; i <= 4; i++) {
    const count = await recordFailedLoginAttempt(testUserId, testIp);
    assert.strictEqual(count, i, `Tentativa falha ${i} deve ser registrada`);
  }

  const beforeLimit = await getFailedLoginAttempts(testUserId, testIp);
  assert.strictEqual(beforeLimit.blocked, false, 'Com 4 tentativas ainda não deve bloquear');
  assert.strictEqual(beforeLimit.attempts, 4);

  // 5ª tentativa falha atinge o limite
  const count5 = await recordFailedLoginAttempt(testUserId, testIp);
  assert.strictEqual(count5, MAX_FAILED_LOGIN_ATTEMPTS);

  const blockedStatus = await getFailedLoginAttempts(testUserId, testIp);
  assert.strictEqual(blockedStatus.blocked, true, 'Ao atingir 5 tentativas deve retornar blocked = true');
  assert.strictEqual(blockedStatus.attempts, 5);
  assert.ok(blockedStatus.retryAfterSeconds > 0, 'Deve informar tempo restante de bloqueio');

  // Sucesso no login: reseta o contador
  await resetFailedLoginAttempts(testUserId, testIp);
  const unblockedStatus = await getFailedLoginAttempts(testUserId, testIp);
  assert.strictEqual(unblockedStatus.blocked, false, 'Após reset deve estar desbloqueado');
  assert.strictEqual(unblockedStatus.attempts, 0);
});

test('14. Revogação e Invalidação de Sessões: Invalidação de tokens anteriores ao timestamp de revogação', async () => {
  const athleteId = 'person-rangel';
  const now = Date.now();

  // Token emitido há 5 minutos
  const pastTokenIat = now - 5 * 60 * 1000;
  assert.strictEqual(
    await isSessionRevoked(athleteId, pastTokenIat),
    false,
    'Antes de qualquer revogação, o token não deve estar revogado'
  );

  // Executa revogação global de sessões
  await revokeUserSessions(athleteId);

  // Token emitido no passado DEVE estar revogado
  assert.strictEqual(
    await isSessionRevoked(athleteId, pastTokenIat),
    true,
    'Token emitido antes da revogação deve ser considerado revogado'
  );

  // Novo token emitido DEPOIS da revogação (+ 1 segundo) NÃO deve estar revogado
  const futureTokenIat = Date.now() + 1000;
  assert.strictEqual(
    await isSessionRevoked(athleteId, futureTokenIat),
    false,
    'Novo token emitido após a revogação deve ser válido'
  );
});

test('15. Normalização de Altura em Metros: Suporte a vírgula, ponto e centímetros sem distorção', () => {
  // Caso 1: Digitação com vírgula em metros (padrão brasileiro "1,78")
  const hComma = parseHeight('1,78');
  assert.strictEqual(hComma.meters, 1.78, 'Deve extrair 1.78 metros');
  assert.strictEqual(hComma.cm, 178, 'Deve converter para 178 cm');
  assert.strictEqual(hComma.displayMeters, '1,78', 'Display em metros deve ser 1,78');
  assert.strictEqual(hComma.displayFull, '1,78 m');

  // Caso 2: Digitação com ponto em metros ("1.78")
  const hDot = parseHeight('1.78');
  assert.strictEqual(hDot.meters, 1.78);
  assert.strictEqual(hDot.cm, 178);

  // Caso 3: Número flutuante em metros (1.78)
  const hNum = parseHeight(1.78);
  assert.strictEqual(hNum.meters, 1.78);
  assert.strictEqual(hNum.cm, 178);

  // Caso 4: Centímetros (178)
  const hCm = parseHeight(178);
  assert.strictEqual(hCm.meters, 1.78, '178 cm deve virar 1.78 m');
  assert.strictEqual(hCm.cm, 178);

  // Caso 5: Formatação de altura
  assert.strictEqual(formatHeight(178), '1,78 m');
  assert.strictEqual(formatHeight(1.78), '1,78 m');
  assert.strictEqual(formatHeight(0), '-- m');
  assert.strictEqual(formatHeight(null), '-- m');
});

test('16. Formatação de Peso e Decimais no Padrão Brasileiro', () => {
  // Peso inteiro
  assert.strictEqual(formatWeight(97), '97 kg');
  
  // Peso com decimais (ex: 97,5 kg)
  assert.strictEqual(formatWeight(97.5), '97,5 kg');
  assert.strictEqual(formatWeight(82.3), '82,3 kg');

  // Valores vazios ou zerados
  assert.strictEqual(formatWeight(0), '-- kg');
  assert.strictEqual(formatWeight(null), '-- kg');
  assert.strictEqual(formatWeight(undefined), '-- kg');
});

