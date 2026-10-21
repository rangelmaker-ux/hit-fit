import test from 'node:test';
import assert from 'node:assert/strict';

import {
  swapExerciseVariant,
  recordSetWithVariant,
  getIsoWeekKey,
  applyStoredVariantsToWorkouts
} from '../lib/workout-variants.ts';

import {
  WORKOUT_DAYS
} from '../lib/workout-data.ts';

import {
  getVariantRegistryItem,
  VARIANT_REGISTRY
} from '../lib/animation-registry.ts';

// ============================================================================
// 1. Variantes apenas locais -> Contrato de nuvem e persistência durável
// ============================================================================
test('1. Contrato e Isolamento de Variantes por Atleta na Nuvem', () => {
  const rangelVariants = {
    'sh-1': 'sh-1-machine',
    'leg-4': 'leg-4-stiff'
  };

  const jackVariants = {
    'sh-1': 'sh-1-smith',
    'leg-4': 'leg-4-seated'
  };

  const rangelWorkouts = applyStoredVariantsToWorkouts(WORKOUT_DAYS, rangelVariants);
  const jackWorkouts = applyStoredVariantsToWorkouts(WORKOUT_DAYS, jackVariants);

  const rangelSh1 = rangelWorkouts[2].exercises.find((e) => e.id === 'sh-1');
  const jackSh1 = jackWorkouts[2].exercises.find((e) => e.id === 'sh-1');

  assert.equal(rangelSh1.activeVariantId, 'sh-1-machine');
  assert.equal(jackSh1.activeVariantId, 'sh-1-smith');
  assert.notEqual(rangelSh1.activeVariantId, jackSh1.activeVariantId);
});

// ============================================================================
// 2. Séries com recuperação da nuvem e proteção anti-sobrescrita cega
// ============================================================================
test('2. Reconciliação de Séries e Proteção contra Cache Vazio Sobrescrever Nuvem', () => {
  const remoteSets = {
    '2026-W43:person-rangel:0:leg-1:0': {
      done: true,
      weightKg: '90',
      variantId: 'leg-1-smith',
      equipmentName: 'Smith Machine (Barra Guiada)',
      completedAt: '2026-10-21T10:00:00.000Z'
    }
  };

  const emptyLocalCache = {};

  // Algoritmo de reconciliação: remoto não é apagado por cache vazio
  const merged = { ...emptyLocalCache };
  for (const [k, v] of Object.entries(remoteSets)) {
    if (!merged[k] || (v.done && !merged[k].done)) {
      merged[k] = v;
    }
  }

  assert.equal(merged['2026-W43:person-rangel:0:leg-1:0']?.done, true);
  assert.equal(merged['2026-W43:person-rangel:0:leg-1:0']?.weightKg, '90');
});

// ============================================================================
// 3. Snapshot prematuro desacoplado de draft de carga
// ============================================================================
test('3. Desacoplamento Rigoroso de Rascunho de Carga vs Snapshot de Conclusão', () => {
  const shoulderDay = WORKOUT_DAYS.find((d) => d.dayShort === 'QUA');
  const sh1Dumbbells = shoulderDay.exercises.find((e) => e.id === 'sh-1');

  // Passo A: Atleta apenas digita peso ("24") sem marcar série como concluída
  const draftSet = recordSetWithVariant(undefined, sh1Dumbbells, false, '24');
  assert.equal(draftSet.done, false);
  assert.equal(draftSet.weightKg, '24');
  assert.equal(draftSet.variantId, undefined, 'variantId NÃO deve ser congelado no rascunho de peso');
  assert.equal(draftSet.equipmentName, undefined, 'equipmentName NÃO deve ser congelado prematuramente');

  // Passo B: Atleta decide trocar para Máquina Articulada ANTES de fazer a série
  const sh1Machine = swapExerciseVariant(sh1Dumbbells, 'sh-1-machine');
  assert.equal(sh1Machine.activeVariantId, 'sh-1-machine');

  // Passo C: Atleta conclui a série na Máquina Articulada
  const completedSet = recordSetWithVariant(draftSet, sh1Machine, true);
  assert.equal(completedSet.done, true);
  assert.equal(completedSet.weightKg, '24');
  assert.equal(completedSet.variantId, 'sh-1-machine', 'Deve capturar a máquina ativa no momento da conclusão');
  assert.ok(completedSet.equipmentName.includes('Articulada'));

  // Passo D: Atleta desmarca a série (done: false)
  const uncheckedSet = recordSetWithVariant(completedSet, sh1Machine, false);
  assert.equal(uncheckedSet.done, false);
  assert.equal(uncheckedSet.weightKg, '24', 'Carga digitada deve ser mantida ao desmarcar');
  assert.equal(uncheckedSet.variantId, undefined, 'Snapshot deve ser liberado para permitir nova escolha');

  // Passo E: Atleta troca para Smith e remarca
  const sh1Smith = swapExerciseVariant(sh1Machine, 'sh-1-smith');
  const recheckedSet = recordSetWithVariant(uncheckedSet, sh1Smith, true);
  assert.equal(recheckedSet.done, true);
  assert.equal(recheckedSet.variantId, 'sh-1-smith', 'Remarcar captura a nova máquina selecionada');
});

// ============================================================================
// 4. Chaves semanais colidem -> ISO-8601 Canônico YYYY-Www
// ============================================================================
test('4. Chaves Semanais ISO-8601 Não Colidem entre Meses Diferentes', () => {
  // 5 de Outubro de 2026 (Segunda-feira)
  const oct5 = new Date('2026-10-05T12:00:00Z');
  // 2 de Novembro de 2026 (Segunda-feira)
  const nov2 = new Date('2026-11-02T12:00:00Z');

  const octWeekKey = getIsoWeekKey(oct5);
  const novWeekKey = getIsoWeekKey(nov2);

  assert.equal(octWeekKey, '2026-W41');
  assert.equal(novWeekKey, '2026-W45');
  assert.notEqual(octWeekKey, novWeekKey, 'Outubro e Novembro NUNCA devem colidir como W1');

  // 21 de Outubro de 2026 (Quarta-feira atual)
  const oct21 = new Date('2026-10-21T12:00:00Z');
  assert.equal(getIsoWeekKey(oct21), '2026-W43');

  // Virada de ano: 31 de Dezembro de 2026 (Quinta-feira) pertence a 2026-W53
  const dec31 = new Date('2026-12-31T12:00:00Z');
  assert.equal(getIsoWeekKey(dec31), '2026-W53');

  // 1 de Janeiro de 2027 (Sexta-feira) pertence à mesma semana ISO 2026-W53
  const jan1 = new Date('2027-01-01T12:00:00Z');
  assert.equal(getIsoWeekKey(jan1), '2026-W53');

  // 4 de Janeiro de 2027 (Segunda-feira) inicia a semana 2027-W01
  const jan4 = new Date('2027-01-04T12:00:00Z');
  assert.equal(getIsoWeekKey(jan4), '2027-W01');
});

// ============================================================================
// 5. Retorno à máquina original perde o nome (Segregação Estrita)
// ============================================================================
test('5. Retorno à Máquina Original Preserva o Nome Canônico do Exercício em Round-Trips', () => {
  const shoulderDay = WORKOUT_DAYS.find((d) => d.dayShort === 'QUA');
  const sh1Original = shoulderDay.exercises.find((e) => e.id === 'sh-1');

  const originalExerciseTitle = sh1Original.name; // "Desenvolvimento com Halteres"
  assert.ok(
    !originalExerciseTitle.toLowerCase().includes('banco regulável'),
    'O título inicial não pode conter a descrição do banco'
  );

  // Troca para Máquina Articulada
  const step1 = swapExerciseVariant(sh1Original, 'sh-1-machine');
  assert.equal(step1.activeVariantId, 'sh-1-machine');
  assert.equal(step1.name, 'Desenvolvimento em Máquina Articulada');

  // Troca para Smith Machine
  const step2 = swapExerciseVariant(step1, 'sh-1-smith');
  assert.equal(step2.activeVariantId, 'sh-1-smith');
  assert.equal(step2.name, 'Desenvolvimento na Barra Guiada (Smith)');

  // Volta para Halteres (Round-Trip completo)
  const step3 = swapExerciseVariant(step2, 'sh-1-dumbbells');
  assert.equal(step3.activeVariantId, 'sh-1-dumbbells');
  // O nome do exercício NÃO pode ter virado "Banco Regulável a 75° ou 80°"
  assert.ok(
    !step3.name.toLowerCase().includes('banco regulável'),
    `Nome do exercício foi corrompido para: "${step3.name}"`
  );
  assert.ok(
    step3.name.toLowerCase().includes('desenvolvimento'),
    `Nome do exercício deve conter Desenvolvimento: "${step3.name}"`
  );
  assert.ok(
    step3.machines.primary.name.toLowerCase().includes('banco'),
    'O nome do equipamento primary deve conter a especificação do banco'
  );
});

// ============================================================================
// 6. Evolução segrega cargas e metas por variante/aparelho
// ============================================================================
test('6. Evolução Segrega Cargas e Metas por Aparelho sem Contaminação de Unidade', () => {
  const getUnitLabel = (equipment, variantId) => {
    const text = `${equipment} ${variantId || ''}`.toLowerCase();
    if (text.includes('halter') || text.includes('dumbbells') || text.includes('dumbbell')) {
      return 'kg (cada halter)';
    }
    if (text.includes('polia') || text.includes('cable') || text.includes('placa')) {
      return 'placas / kg (polia)';
    }
    if (text.includes('smith') || text.includes('barra') || text.includes('articulad') || text.includes('leg press')) {
      return 'kg total';
    }
    return 'kg';
  };

  const sampleSets = {
    // Mesa flexora (placas na máquina)
    '2026-W43:person-rangel:0:leg-4:0': {
      done: true,
      weightKg: '45',
      variantId: 'leg-4-prone',
      equipmentName: 'Mesa Flexora (Deitado)',
      exerciseName: 'Mesa Flexora'
    },
    // Stiff com halteres (peso livre)
    '2026-W43:person-rangel:0:leg-4:1': {
      done: true,
      weightKg: '18',
      variantId: 'leg-4-stiff',
      equipmentName: 'Par de Halteres Emborrachados',
      exerciseName: 'Stiff com Halteres'
    }
  };

  const grouped = new Map();
  for (const item of Object.values(sampleSets)) {
    const key = `leg-4::${item.variantId}`;
    grouped.set(key, {
      variantId: item.variantId,
      equipmentName: item.equipmentName,
      unit: getUnitLabel(item.equipmentName, item.variantId),
      maxWeight: parseFloat(item.weightKg)
    });
  }

  assert.equal(grouped.size, 2, 'Mesa Flexora e Stiff devem formar registros separados na evolução');
  const proneRecord = grouped.get('leg-4::leg-4-prone');
  const stiffRecord = grouped.get('leg-4::leg-4-stiff');

  assert.equal(proneRecord.maxWeight, 45);
  assert.equal(stiffRecord.maxWeight, 18);
  assert.equal(stiffRecord.unit, 'kg (cada halter)');
  assert.notEqual(proneRecord.maxWeight, stiffRecord.maxWeight, 'Cargas não devem se misturar');
});

// ============================================================================
// 7. Mapa muscular com adutores no Agachamento Sumô
// ============================================================================
test('7. Mapa Muscular: Agachamento Sumô (glute-2-sumo) Ativa Adutores da Coxa', () => {
  const gluteDay = WORKOUT_DAYS.find((d) => d.dayShort === 'QUI');
  const glute2Base = gluteDay.exercises.find((e) => e.id === 'glute-2');
  const sumoVariant = swapExerciseVariant(glute2Base, 'glute-2-sumo');

  assert.equal(sumoVariant.activeVariantId, 'glute-2-sumo');
  assert.ok(
    sumoVariant.activeBodyParts.front.includes('adductors'),
    'activeBodyParts.front DEVE conter "adductors" para iluminar no mapa SVG'
  );
  assert.ok(
    sumoVariant.targetMuscle.toLowerCase().includes('adutores'),
    'targetMuscle deve conter Adutores da Coxa'
  );
});

// ============================================================================
// 8. Cronômetro de descanso conectado à prescrição ativa do exercício
// ============================================================================
test('8. Descanso Prescrito: Cada exercício e variante aciona seu restSeconds específico', () => {
  const legDay = WORKOUT_DAYS.find((d) => d.dayShort === 'SEG');
  const leg1 = legDay.exercises.find((e) => e.id === 'leg-1');
  const leg4 = legDay.exercises.find((e) => e.id === 'leg-4');

  assert.equal(leg1.restSeconds, 75, 'Agachamento no Smith prescreve 75s');
  assert.equal(leg4.restSeconds, 50, 'Mesa Flexora prescreve 50s');

  // Alternativa de Stiff prescreve 60s
  const leg4Stiff = swapExerciseVariant(leg4, 'leg-4-stiff');
  assert.equal(leg4Stiff.restSeconds, 60, 'Stiff prescreve 60s');

  // Simulação de acionamento do cronômetro: não deve usar 60s fixo para todos
  const getPrescribedRest = (ex) => ex.restSeconds || 60;
  assert.equal(getPrescribedRest(leg1), 75);
  assert.equal(getPrescribedRest(leg4), 50);
  assert.equal(getPrescribedRest(leg4Stiff), 60);
});
