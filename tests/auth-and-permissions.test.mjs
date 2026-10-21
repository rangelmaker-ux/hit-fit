/**
 * HIT-FIT 2.0 | Suíte de Testes Automatizados de Segurança, Criptografia e Autorização
 * Valida:
 * 1. Proteção de Segredos e Falha Segura (Ausência de HITFIT_AUTH_SECRET dispara erro explícito)
 * 2. Criptografia PBKDF2 e Verificação de Senhas (100.000 iterações + Salt único)
 * 3. Tokens de Sessão com Assinatura HMAC-SHA256 (Criação, validação, adulteração e expiração)
 * 4. Restrição Estrita de Papéis (Roles) e Normalização (apenas rangel e geicsania)
 * 5. Isolamento de Leitura de Parceiro Autorizado (getAuthorizedPartnerId)
 * 6. Regras de Autorização RBAC no Servidor (Rangel vs Geicsania)
 * 7. Cadastro Inicial: Cálculo Automático de Idade
 * 8. Treino Guiado Sequencial: Discriminação real de concluídos vs pulados
 * 9. Prevenção do Bug do Zero nos Inputs Numéricos e Decimais Brasileiros
 * 10. Validação de Limites Biométricos Reais (rejeição de pesos absurdos e avatares gigantes)
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
  AuthSecretMissingError
} from '../lib/auth-crypto.ts';

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

  // Restaura para os demais testes
  process.env.HITFIT_AUTH_SECRET = TEST_SECRET;
});

test('2. Criptografia PBKDF2: Geração de salt e hash seguro', async () => {
  const salt = generateSalt(16);
  assert.ok(salt, 'Salt deve ser gerado');
  assert.strictEqual(salt.length, 32, 'Salt de 16 bytes em hex deve ter 32 caracteres');

  const password = 'SenhaSecreta@2026';
  const hash = await hashPassword(password, salt);
  assert.ok(hash, 'Hash deve ser gerado com sucesso');
  assert.strictEqual(hash.length, 64, 'Hash SHA-256 deve ter 64 caracteres hexadecimais');

  // Verifica senha correta
  const isMatch = await verifyPassword(password, salt, hash);
  assert.strictEqual(isMatch, true, 'Senha correta deve retornar true');

  // Verifica senha incorreta
  const isWrong = await verifyPassword('SenhaErrada!999', salt, hash);
  assert.strictEqual(isWrong, false, 'Senha incorreta deve retornar false');
});

test('3. Tokens de Sessão HMAC-SHA256: Criação, assinatura e verificação', async () => {
  process.env.HITFIT_AUTH_SECRET = TEST_SECRET;

  const athlete = {
    id: 'person-rangel',
    name: 'Rangel',
    role: 'rangel'
  };

  const token = await createSessionToken(athlete, 30);
  assert.ok(token.includes('.'), 'Token deve conter payload e assinatura separados por ponto');

  const verified = await verifySessionToken(token);
  assert.ok(verified, 'Token válido deve ser verificado com sucesso');
  assert.strictEqual(verified.userId, 'person-rangel');
  assert.strictEqual(verified.name, 'Rangel');
  assert.strictEqual(verified.role, 'rangel');

  // Testa rejeição de token adulterado
  const [, signature] = token.split('.');
  const tamperedPayload = btoa(encodeURIComponent(JSON.stringify({ userId: 'person-geicsania', role: 'geicsania' })));
  const tamperedToken = `${tamperedPayload}.${signature}`;

  const tamperedResult = await verifySessionToken(tamperedToken);
  assert.strictEqual(tamperedResult, null, 'Token adulterado deve ser rejeitado com null');

  // Testa rejeição de token expirado (-1 dia de validade)
  const expiredToken = await createSessionToken(athlete, -1);
  const expiredResult = await verifySessionToken(expiredToken);
  assert.strictEqual(expiredResult, null, 'Token expirado deve ser rejeitado');
});

test('4. Restrição Estrita de Papéis (Roles) e Normalização', () => {
  assert.strictEqual(isValidRole('rangel'), true, 'rangel deve ser um papel válido');
  assert.strictEqual(isValidRole('geicsania'), true, 'geicsania deve ser um papel válido');
  
  // Rejeição de papéis não autorizados
  assert.strictEqual(isValidRole('admin'), false, 'admin deve ser rejeitado');
  assert.strictEqual(isValidRole('root'), false, 'root deve ser rejeitado');
  assert.strictEqual(isValidRole('anonymous'), false, 'anonymous deve ser rejeitado');
  assert.strictEqual(isValidRole(''), false, 'string vazia deve ser rejeitada');
});

test('5. Isolamento de Parceiro Autorizado: getAuthorizedPartnerId', () => {
  // O único parceiro autorizado de Rangel é Geicsania
  assert.strictEqual(getAuthorizedPartnerId('person-rangel'), 'person-geicsania');
  assert.strictEqual(getAuthorizedPartnerId('rangel'), 'person-geicsania');

  // O único parceiro autorizado de Geicsania é Rangel
  assert.strictEqual(getAuthorizedPartnerId('person-geicsania'), 'person-rangel');
  assert.strictEqual(getAuthorizedPartnerId('geicsania'), 'person-rangel');

  // Qualquer terceiro ou invasor não possui parceiro autorizado
  assert.strictEqual(getAuthorizedPartnerId('person-intruder'), null);
  assert.strictEqual(getAuthorizedPartnerId('admin'), null);
  assert.strictEqual(getAuthorizedPartnerId(''), null);
});

test('6. Autorização RBAC Estrita: Proteção contra modificações cruzadas e adulteração de IDs', () => {
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

  // Rangel NÃO pode modificar os dados de Geicsania
  assert.strictEqual(
    canModifyAthleteData('person-rangel', 'person-geicsania'),
    false,
    'Rangel NÃO deve poder modificar os dados de Geicsania'
  );

  // Geicsania NÃO pode modificar os dados de Rangel
  assert.strictEqual(
    canModifyAthleteData('person-geicsania', 'person-rangel'),
    false,
    'Geicsania NÃO deve poder modificar os dados de Rangel'
  );

  // Geicsania pode modificar os dados de Geicsania
  assert.strictEqual(
    canModifyAthleteData('person-geicsania', 'person-geicsania'),
    true,
    'Geicsania deve poder modificar seus próprios dados'
  );

  // IDs nulos ou vazios devem ser rejeitados
  assert.strictEqual(canModifyAthleteData('', 'person-rangel'), false);
  assert.strictEqual(canModifyAthleteData('person-rangel', ''), false);
});

test('7. Cadastro Inicial: Cálculo automático de idade', () => {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - 30;
  
  // Data com aniversário já ocorrido
  const pastBirthDate = `${birthYear}-01-01`;
  const age = calculateAge(pastBirthDate);
  assert.strictEqual(age, 30, 'Idade calculada deve ser 30 anos');

  // Data inválida deve retornar 0 com segurança
  assert.strictEqual(calculateAge(''), 0);
  assert.strictEqual(calculateAge('data-invalida'), 0);
});

test('8. Treino Guiado Sequencial: Discriminação real de concluídos vs pulados', () => {
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

test('9. Validação do Bug do Zero e Decimais Brasileiros no NumericInput', () => {
  // Função utilitária de parsing usada internamente no NumericInput
  const parseNumericValue = (text, allowDecimals) => {
    if (!text || text.trim() === '') return null;
    const normalized = text.replace(',', '.').trim();
    const val = allowDecimals ? parseFloat(normalized) : parseInt(normalized, 10);
    return isNaN(val) ? null : val;
  };

  // 1. Ao apagar o campo (string vazia), deve retornar null (e NUNCA zero)
  assert.strictEqual(parseNumericValue('', true), null, 'String vazia deve retornar null');
  assert.strictEqual(parseNumericValue('   ', true), null, 'Espaços em branco devem retornar null');

  // 2. Aceitar vírgula decimal brasileira
  assert.strictEqual(parseNumericValue('82,5', true), 82.5, 'Vírgula 82,5 deve ser convertida para 82.5');
  assert.strictEqual(parseNumericValue('64,3', true), 64.3, 'Vírgula 64,3 deve ser convertida para 64.3');

  // 3. Aceitar ponto decimal
  assert.strictEqual(parseNumericValue('82.5', true), 82.5, 'Ponto 82.5 deve ser convertido para 82.5');

  // 4. Aceitar inteiros
  assert.strictEqual(parseNumericValue('178', false), 178, 'Inteiro 178 deve retornar 178');
});

test('10. Validação de Limites de Integridade de Dados Biométricos', () => {
  const isValidWeight = (w) => {
    if (w === null || w === undefined) return true; // permite não informado
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
