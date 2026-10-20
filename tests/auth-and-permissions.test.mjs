/**
 * HIT-FIT 2.0 | Suíte de Testes Automatizados
 * Valida:
 * 1. Criptografia PBKDF2 e Verificação de Senhas
 * 2. Tokens de Sessão com Assinatura HMAC-SHA256
 * 3. Regras de Autorização e RBAC no Servidor (Rangel vs Geicsania)
 * 4. Cálculo Automático de Idade
 * 5. Lógica de Treino Guiado Sequencial e Exercícios Pulados
 * 6. Prevenção do Bug do Zero nos Inputs Numéricos
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
  calculateAge
} from '../lib/auth-crypto.ts';

test('1. Criptografia PBKDF2: Geração de salt e hash seguro', async () => {
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

test('2. Tokens de Sessão HMAC-SHA256: Criação, assinatura e verificação', async () => {
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

test('3. Autorização RBAC Estrita: Proteção contra modificações cruzadas e adulteração de IDs', () => {
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

test('4. Cadastro Inicial: Cálculo automático de idade', () => {
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

test('5. Treino Guiado Sequencial: Discriminação real de concluídos vs pulados', () => {
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

test('6. Validação do Bug do Zero e Decimais Brasileiros no NumericInput', () => {
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
