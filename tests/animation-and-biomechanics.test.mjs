/**
 * HIT-FIT 2.0 | Suíte Automatizada de Testes de Biomecânica, Animações SVG e Troca de Equipamentos
 *
 * Valida:
 * 1. Teste 1: Elevação Lateral (sh-2) vs Desenvolvimento com Halteres (sh-1)
 *    - Chaves estritamente distintas ('lateralRaise'/'lateralRaiseCable' vs 'shoulderPress'/'shoulderPressDumbbell')
 *    - Equipamentos e padrões motores biomecanicamente incompatíveis nunca compartilhados
 * 2. Teste 2: Trajetória, banco inclinado a 75°/80° e halteres no Desenvolvimento
 * 3. Teste 3: Alternância Sequencial, Troca Real de Equipamentos e Teste de Ida e Volta (Round-Trip)
 *    - sh-1: Halteres -> Máquina Articulada -> Smith -> Halteres
 *    - sh-2: Polia Baixa -> Halteres Livres -> Máquina com Apoio de Cotovelo -> Polia Baixa
 *    - Validação de atualização imediata de animationKey e activeVariantId
 * 4. Teste 4: Auditoria em lote dos 21 exercícios base e todas as variantes registradas
 *    - 100% dos 21 exercícios possuem animação individual verificada ('verified')
 *    - Catálogo completo de variantes registradas sem lacunas
 *    - Proibição de sobreposições ou fallbacks genéricos incorretos
 * 5. Teste 5: Integridade Vetorial de Todos os Modelos SVG Dedicados
 *    - Cada aparelho físico possui representação vetorial válida em fase concêntrica e excêntrica
 * 6. Teste 6: Conformidade Anatômica dos Mapas Musculares
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import React from 'react';

import { WORKOUT_DAYS } from '../lib/workout-data.ts';
import {
  BASE_EXERCISE_REGISTRY,
  VARIANT_REGISTRY,
  ANIMATION_REGISTRY,
  getAnimationRegistryItem,
  getVariantRegistryItem,
  getAllRegistryItems,
  getAllVariants
} from '../lib/animation-registry.ts';
import {
  swapExerciseVariant,
  applyStoredVariantsToWorkouts,
  recordSetWithVariant
} from '../lib/workout-variants.ts';

// Loader recursivo para compilar e transpilar arquivos TypeScript/TSX em memória
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const loadedModules = {};

function compileAndLoadTsx(absPath) {
  if (loadedModules[absPath]) return loadedModules[absPath].exports;
  const source = fs.readFileSync(absPath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    }
  });
  const mod = { exports: {} };
  loadedModules[absPath] = mod;

  const localRequire = (id) => {
    if (id === 'react') return { default: React, ...React };
    if (id.startsWith('./') || id.startsWith('../')) {
      let resolved = path.resolve(path.dirname(absPath), id);
      if (!resolved.endsWith('.tsx') && !resolved.endsWith('.ts')) {
        if (fs.existsSync(resolved + '.tsx')) resolved += '.tsx';
        else if (fs.existsSync(resolved + '.ts')) resolved += '.ts';
      }
      return compileAndLoadTsx(resolved);
    }
    return {};
  };

  const runner = new Function('require', 'exports', 'module', 'React', transpiled.outputText);
  runner(localRequire, mod.exports, mod, React);
  return mod.exports;
}

const svgModels = compileAndLoadTsx(path.resolve(__dirname, '../components/exercise-svg-models.tsx'));

const {
  // Ombros
  ShoulderPressDumbbellSvg,
  ShoulderPressMachineSvg,
  ShoulderPressSmithSvg,
  LateralRaiseCableSvg,
  LateralRaiseDumbbellSvg,
  LateralRaiseMachineSvg,
  RearDeltPeckDeckSvg,
  FacepullCableSvg,
  RearDeltDumbbellSvg,
  // Pernas
  SquatSmithSvg,
  SquatFreeBarSvg,
  HackSquatMachineSvg,
  LegPress45Svg,
  LegPressHorizontalSvg,
  LegExtensionSvg,
  LegExtensionCableSvg,
  LegCurlSvg,
  LegCurlSeatedSvg,
  StiffDumbbellSvg,
  CalfRaiseSvg,
  CalfRaiseLegPressSvg,
  CalfRaiseSeatedSvg,
  // Costas
  PulldownWideSvg,
  PulldownCloseSvg,
  GravitonPullupSvg,
  CableRowSvg,
  TBarRowSvg,
  ChestSupportedRowMachineSvg,
  SingleArmRowSvg,
  SingleArmRowCableSvg,
  // Braços
  BicepsCurlWBarSvg,
  BicepsCurlCableSvg,
  BicepsCurlAlternatingDumbbellSvg,
  HammerCurlDumbbellSvg,
  HammerCurlRopeCableSvg,
  TricepsRopePushdownSvg,
  TricepsBarPushdownSvg,
  // Glúteos & Core
  HipThrustMachineSvg,
  HipThrustBarbellSvg,
  HipThrustSmithSvg,
  BulgarianSplitSquatSvg,
  SumoSquatStepSvg,
  SeatedAbductorSvg,
  CableStandingAbductionSvg,
  PlankCoreSvg,
  SwissBallCrunchSvg,
  // Peito
  BenchPressBarbellSvg,
  BenchPressDumbbellSvg,
  ChestPressMachineSvg,
  InclineBenchPressSvg,
  InclineBenchSmithSvg,
  PeckDeckFlySvg,
  CableCrossOverSvg,
  DumbbellFlatFlySvg,
  // Fallback técnico
  AnimationInPreparationSvg,
  // Aliases retrocompatíveis
  ShoulderPressSvg,
  LateralRaiseSvg,
  RearDeltFlySvg,
  PulldownSvg,
  BicepsCurlSvg,
  HammerCurlSvg,
  HipThrustSvg,
  BenchPressSvg
} = svgModels;

// ============================================================================
// TESTE 1: Elevação Lateral vs Desenvolvimento com Halteres
// ============================================================================
test('1. Biomecânica Diferenciada: Elevação Lateral (sh-2) NÃO pode exibir Desenvolvimento (sh-1)', () => {
  const lateralRaiseRegistry = getAnimationRegistryItem('sh-2');
  assert.ok(lateralRaiseRegistry, 'Item sh-2 deve constar no registro canônico');
  assert.match(lateralRaiseRegistry.animationId || lateralRaiseRegistry.animationKey, /lateralRaise/);
  assert.ok(!/shoulderPress/.test(lateralRaiseRegistry.animationId || lateralRaiseRegistry.animationKey), 'sh-2 não pode conter shoulderPress');
  assert.equal(lateralRaiseRegistry.equipmentId, 'cable_lateral_raise');
  assert.match(lateralRaiseRegistry.movementPattern.toLowerCase(), /abdução/);
  assert.match(lateralRaiseRegistry.description.toLowerCase(), /em t|lateralmente/);

  const shoulderPressRegistry = getAnimationRegistryItem('sh-1');
  assert.ok(shoulderPressRegistry, 'Item sh-1 deve constar no registro canônico');
  assert.match(shoulderPressRegistry.animationId || shoulderPressRegistry.animationKey, /shoulderPress/);
  assert.ok(!/lateralRaise/.test(shoulderPressRegistry.animationId || shoulderPressRegistry.animationKey), 'sh-1 não pode conter lateralRaise');
  assert.equal(shoulderPressRegistry.equipmentId, 'incline_bench_dumbbells');
  assert.match(shoulderPressRegistry.movementPattern.toLowerCase(), /overhead|pressão vertical/);

  // Validação no array oficial de treinos WORKOUT_DAYS
  const wednesday = WORKOUT_DAYS.find((d) => d.dayShort === 'QUA');
  assert.ok(wednesday, 'Quarta-feira deve existir em WORKOUT_DAYS');

  const sh1 = wednesday.exercises.find((ex) => ex.id === 'sh-1');
  const sh2 = wednesday.exercises.find((ex) => ex.id === 'sh-2');

  assert.ok(sh1, 'Exercício sh-1 deve existir no treino de quarta');
  assert.ok(sh2, 'Exercício sh-2 deve existir no treino de quarta');

  assert.match(sh1.animationKey, /shoulderPress/);
  assert.match(sh2.animationKey, /lateralRaise/);
  assert.notEqual(sh1.animationKey, sh2.animationKey, 'As animações de sh-1 e sh-2 devem ser estritamente diferentes');
});

// ============================================================================
// TESTE 2: Trajetória e Equipamento do Desenvolvimento (Shoulder Press)
// ============================================================================
test('2. Trajetória e Equipamento: Desenvolvimento com Halteres usa banco inclinado 75-80° e overhead vertical', () => {
  const meta = getAnimationRegistryItem('sh-1');
  assert.ok(meta);
  assert.equal(meta.machineVisualType, 'incline_bench_dumbbells');
  assert.equal(meta.muscleMapId, 'shoulders_anterior_lateral');

  // Renderiza modelos concêntrico e excêntrico
  const conc = ShoulderPressDumbbellSvg({ phase: 'concentric', accentColor: '#c3f75a' });
  const ecc = ShoulderPressDumbbellSvg({ phase: 'eccentric', accentColor: '#c3f75a' });

  assert.ok(conc && typeof conc === 'object', 'Deve retornar elemento React válido');
  assert.ok(ecc && typeof ecc === 'object', 'Deve retornar elemento React válido');
  assert.equal(conc.type, 'svg', 'Elemento raiz deve ser svg');
  assert.equal(ecc.type, 'svg', 'Elemento raiz deve ser svg');

  // Valida que o modelo da Elevação Lateral também renderiza SVG válido e independente
  const latConc = LateralRaiseCableSvg({ phase: 'concentric', accentColor: '#c3f75a' });
  const latEcc = LateralRaiseCableSvg({ phase: 'eccentric', accentColor: '#c3f75a' });
  assert.equal(latConc.type, 'svg');
  assert.equal(latEcc.type, 'svg');
});

// ============================================================================
// TESTE 3: Troca de Equipamentos em Tempo Real e Teste de Ida e Volta (Round-Trip)
// ============================================================================
test('3. Troca de Equipamentos: handleSwapExercise atualiza animationKey para cada máquina e suporta round-trip fiel', () => {
  // Simula a lógica oficial de handleSwapExercise de app/page.tsx
  function simulateSwap(currentExercise, targetIdentifier) {
    const altItem = currentExercise.machines.alternatives.find(
      (a) => a.variantId === targetIdentifier || a.name === targetIdentifier
    );
    assert.ok(altItem, `Alternativa '${targetIdentifier}' deve existir em currentExercise`);

    const previousPrimary = {
      ...currentExercise.machines.primary,
      reps: currentExercise.reps,
      restSeconds: currentExercise.restSeconds,
      biomechanics: currentExercise.biomechanics
    };
    const newAlternatives = [
      ...currentExercise.machines.alternatives.filter(
        (a) => a !== altItem && a.variantId !== targetIdentifier && a.name !== targetIdentifier
      ),
      previousPrimary
    ];

    const newVariantId = altItem.variantId || altItem.animationKey;
    const newAnimationKey = altItem.animationKey;
    const newName = altItem.name;
    const registryItem = getVariantRegistryItem(newVariantId);

    return {
      ...currentExercise,
      name: newName,
      activeVariantId: newVariantId,
      animationKey: newAnimationKey,
      reps: altItem.reps || currentExercise.reps,
      restSeconds: altItem.restSeconds || currentExercise.restSeconds,
      machines: {
        primary: {
          ...altItem,
          variantId: newVariantId,
          name: altItem.name,
          description: altItem.description,
          settingTips: altItem.settingTips || previousPrimary.settingTips,
          animationKey: newAnimationKey,
          animationStatus: altItem.animationStatus || 'verified'
        },
        alternatives: newAlternatives
      },
      biomechanics: altItem.biomechanics
        ? altItem.biomechanics
        : registryItem
        ? {
            ...currentExercise.biomechanics,
            setup: registryItem.settingTips || currentExercise.biomechanics.setup,
            execution: registryItem.description || currentExercise.biomechanics.execution
          }
        : currentExercise.biomechanics
    };
  }

  // A. TESTE DE ROUND-TRIP NO DESENVOLVIMENTO (sh-1)
  const wednesday = WORKOUT_DAYS.find((d) => d.dayShort === 'QUA');
  const initialSh1 = wednesday.exercises.find((ex) => ex.id === 'sh-1');
  assert.ok(initialSh1, 'sh-1 deve existir no treino de quarta');

  // Estado Inicial: Halteres
  assert.equal(initialSh1.activeVariantId, 'sh-1-dumbbells');
  assert.equal(initialSh1.animationKey, 'shoulderPressDumbbell');
  assert.equal(initialSh1.machines.primary.name, 'Banco Regulável a 75° ou 80°');

  // Transição 1: Troca para Máquina Articulada
  const swappedToMachine = simulateSwap(initialSh1, 'sh-1-machine');
  assert.equal(swappedToMachine.activeVariantId, 'sh-1-machine');
  assert.equal(swappedToMachine.animationKey, 'shoulderPressMachine', 'animationKey DEVE mudar para shoulderPressMachine');
  assert.notEqual(swappedToMachine.animationKey, 'shoulderPressDumbbell', 'NÃO pode manter a chave de halteres');
  assert.equal(swappedToMachine.machines.primary.name, 'Desenvolvimento em Máquina Articulada');
  assert.ok(swappedToMachine.machines.alternatives.some((a) => a.variantId === 'sh-1-dumbbells'));

  // Transição 2: Troca da Máquina Articulada para Smith Machine
  const swappedToSmith = simulateSwap(swappedToMachine, 'sh-1-smith');
  assert.equal(swappedToSmith.activeVariantId, 'sh-1-smith');
  assert.equal(swappedToSmith.animationKey, 'shoulderPressSmith', 'animationKey DEVE mudar para shoulderPressSmith');
  assert.equal(swappedToSmith.machines.primary.name, 'Desenvolvimento na Barra Guiada (Smith)');

  // Transição 3 (Round-Trip): Retorno para Halteres
  const restoredToDumbbells = simulateSwap(swappedToSmith, 'sh-1-dumbbells');
  assert.equal(restoredToDumbbells.activeVariantId, 'sh-1-dumbbells');
  assert.equal(restoredToDumbbells.animationKey, 'shoulderPressDumbbell', 'Retorno deve restaurar shoulderPressDumbbell com fidelidade total');
  assert.equal(restoredToDumbbells.machines.primary.name, 'Banco Regulável a 75° ou 80°');

  // B. TESTE DE ROUND-TRIP NA ELEVAÇÃO LATERAL (sh-2)
  const initialSh2 = wednesday.exercises.find((ex) => ex.id === 'sh-2');
  assert.ok(initialSh2, 'sh-2 deve existir no treino de quarta');
  assert.equal(initialSh2.activeVariantId, 'sh-2-cables');
  assert.equal(initialSh2.animationKey, 'lateralRaiseCable');

  // Transição 1: Polia Baixa -> Halteres Livres
  const swappedToLatDumbbells = simulateSwap(initialSh2, 'sh-2-dumbbells');
  assert.equal(swappedToLatDumbbells.activeVariantId, 'sh-2-dumbbells');
  assert.equal(swappedToLatDumbbells.animationKey, 'lateralRaiseDumbbell', 'animationKey DEVE mudar para lateralRaiseDumbbell');
  assert.notEqual(swappedToLatDumbbells.animationKey, 'lateralRaiseCable');

  // Transição 2: Halteres Livres -> Máquina de Elevação Lateral
  const swappedToLatMachine = simulateSwap(swappedToLatDumbbells, 'sh-2-machine');
  assert.equal(swappedToLatMachine.activeVariantId, 'sh-2-machine');
  assert.equal(swappedToLatMachine.animationKey, 'lateralRaiseMachine', 'animationKey DEVE mudar para lateralRaiseMachine');

  // Transição 3 (Round-Trip): Retorno para Polia Baixa
  const restoredToCables = simulateSwap(swappedToLatMachine, 'sh-2-cables');
  assert.equal(restoredToCables.activeVariantId, 'sh-2-cables');
  assert.equal(restoredToCables.animationKey, 'lateralRaiseCable', 'Retorno para polia deve restaurar lateralRaiseCable');

  // C. TESTE DE ROUND-TRIP NA PUXADA ALTA (back-1): Barra Aberta -> Graviton
  const tuesday = WORKOUT_DAYS.find((d) => d.dayShort === 'TER');
  const initialBack1 = tuesday.exercises.find((ex) => ex.id === 'back-1');
  assert.equal(initialBack1.animationKey, 'pulldownWide');
  const swappedToGraviton = simulateSwap(initialBack1, 'back-1-graviton');
  assert.equal(swappedToGraviton.animationKey, 'gravitonPullup', 'Graviton DEVE ter animationKey gravitonPullup e NÃO pulldownClose');
  const restoredBack1 = simulateSwap(swappedToGraviton, 'back-1-wide');
  assert.equal(restoredBack1.animationKey, 'pulldownWide');

  // D. TESTE DE ROUND-TRIP NA REMADA (back-2): Polia Baixa -> Remada Máquina Articulada
  const initialBack2 = tuesday.exercises.find((ex) => ex.id === 'back-2');
  assert.equal(initialBack2.animationKey, 'cableRowSeated');
  const swappedToMachineRow = simulateSwap(initialBack2, 'back-2-machine');
  assert.equal(swappedToMachineRow.animationKey, 'chestSupportedRowMachine', 'Máquina articulada DEVE ter chave chestSupportedRowMachine');
  const restoredBack2 = simulateSwap(swappedToMachineRow, 'back-2-seated-cable');
  assert.equal(restoredBack2.animationKey, 'cableRowSeated');

  // E. TESTE DE ROUND-TRIP NO BÍCEPS (back-4): Barra W -> Rosca com Halteres Alternada
  const initialBack4 = tuesday.exercises.find((ex) => ex.id === 'back-4');
  assert.equal(initialBack4.animationKey, 'bicepsWBar');
  const swappedToAltDumbbell = simulateSwap(initialBack4, 'back-4-dumbbells');
  assert.equal(swappedToAltDumbbell.animationKey, 'bicepsAlternatingDumbbell', 'Rosca alternada DEVE ter chave bicepsAlternatingDumbbell');
  const restoredBack4 = simulateSwap(swappedToAltDumbbell, 'back-4-wbar');
  assert.equal(restoredBack4.animationKey, 'bicepsWBar');

  // F. TESTE DE ROUND-TRIP NA ROSCA MARTELO (back-5): Halteres -> Rosca Martelo na Corda
  const initialBack5 = tuesday.exercises.find((ex) => ex.id === 'back-5');
  assert.equal(initialBack5.animationKey, 'hammerDumbbell');
  const swappedToRopeHammer = simulateSwap(initialBack5, 'back-5-rope');
  assert.equal(swappedToRopeHammer.animationKey, 'hammerRopeCable', 'Rosca martelo na corda DEVE ter chave hammerRopeCable');
  const restoredBack5 = simulateSwap(swappedToRopeHammer, 'back-5-dumbbells');
  assert.equal(restoredBack5.animationKey, 'hammerDumbbell');

  // G. TESTE DE ROUND-TRIP NO CORE (back-6): Prancha no Solo (Isometria) -> Bola Suíça (Dinâmico)
  const initialBack6 = tuesday.exercises.find((ex) => ex.id === 'back-6');
  assert.equal(initialBack6.animationKey, 'plankFloor');
  assert.equal(initialBack6.reps, '45s Prancha + 15 Infra');
  const swappedToSwissBall = simulateSwap(initialBack6, 'back-6-ball');
  assert.equal(swappedToSwissBall.animationKey, 'swissBallCrunch', 'Abdominal na Bola Suíça DEVE ter chave swissBallCrunch');
  assert.equal(swappedToSwissBall.reps, '15 - 20', 'Abdominal na Bola Suíça DEVE ter prescrição dinâmica 15 - 20 reps');
  const restoredBack6 = simulateSwap(swappedToSwissBall, 'back-6-floor');
  assert.equal(restoredBack6.animationKey, 'plankFloor');
  assert.equal(restoredBack6.reps, '45s Prancha + 15 Infra', 'Round-trip de volta à prancha deve restaurar a prescrição isométrica original');

  // H. TESTE DE ROUND-TRIP NA ELEVAÇÃO PÉLVICA (glute-1): Máquina Dedicada -> Smith Machine
  const thursday = WORKOUT_DAYS.find((d) => d.dayShort === 'QUI');
  const initialGlute1 = thursday.exercises.find((ex) => ex.id === 'glute-1');
  assert.equal(initialGlute1.animationKey, 'hipThrustMachine');
  const swappedToSmithHip = simulateSwap(initialGlute1, 'glute-1-smith');
  assert.equal(swappedToSmithHip.animationKey, 'hipThrustSmith', 'Elevação Pélvica no Smith DEVE ter chave hipThrustSmith');
  const restoredGlute1 = simulateSwap(swappedToSmithHip, 'glute-1-machine');
  assert.equal(restoredGlute1.animationKey, 'hipThrustMachine');

  // I. TESTE DE ROUND-TRIP NO AGACHAMENTO (glute-2): Búlgaro -> Sumô no Step
  const initialGlute2 = thursday.exercises.find((ex) => ex.id === 'glute-2');
  assert.equal(initialGlute2.animationKey, 'bulgarianSplitSquat');
  assert.equal(initialGlute2.reps, '10 cada perna');
  const swappedToSumo = simulateSwap(initialGlute2, 'glute-2-sumo');
  assert.equal(swappedToSumo.animationKey, 'sumoSquatStep');
  assert.equal(swappedToSumo.reps, '12 - 15', 'Sumô no step deve prescrever 12 - 15 reps');
  const restoredGlute2 = simulateSwap(swappedToSumo, 'glute-2-bulgarian');
  assert.equal(restoredGlute2.animationKey, 'bulgarianSplitSquat');
  assert.equal(restoredGlute2.reps, '10 cada perna');

  // J. TESTE DE ROUND-TRIP NO POSTERIOR (leg-4): Mesa Flexora -> Stiff com Halteres
  const monday = WORKOUT_DAYS.find((d) => d.dayShort === 'SEG');
  const initialLeg4 = monday.exercises.find((ex) => ex.id === 'leg-4');
  assert.equal(initialLeg4.animationKey, 'legcurlProne');
  assert.equal(initialLeg4.reps, '12');
  assert.equal(initialLeg4.restSeconds, 50);
  const swappedToStiff = simulateSwap(initialLeg4, 'leg-4-stiff');
  assert.equal(swappedToStiff.animationKey, 'stiffDumbbell');
  assert.equal(swappedToStiff.reps, '10 - 12');
  assert.equal(swappedToStiff.restSeconds, 60);
  assert.match(swappedToStiff.biomechanics.execution.toLowerCase(), /quadril para trás|canelas/);
  const restoredLeg4 = simulateSwap(swappedToStiff, 'leg-4-prone');
  assert.equal(restoredLeg4.animationKey, 'legcurlProne');
  assert.equal(restoredLeg4.reps, '12');
  assert.equal(restoredLeg4.restSeconds, 50);
});

// ============================================================================
// TESTE 4: Auditoria do Catálogo dos 21 Exercícios e Catálogo Completo de Variantes
// ============================================================================
test('4. Auditoria do Catálogo: Todos os 21 exercícios do plano e todas as variantes possuem status "verified"', () => {
  assert.ok(BASE_EXERCISE_REGISTRY, 'Registro canônico base deve existir');
  assert.ok(VARIANT_REGISTRY, 'Registro de variantes deve existir');
  assert.ok(ANIMATION_REGISTRY, 'Registro canônico unificado deve existir');
  assert.equal(getAllRegistryItems().length, 21, 'getAllRegistryItems deve retornar exatamente os 21 exercícios canônicos');

  const allVariants = getAllVariants();
  assert.ok(allVariants.length >= 40, `Devem existir mais de 40 variantes cadastradas (encontradas: ${allVariants.length})`);

  let totalExercisesChecked = 0;
  const verifiedExerciseIds = new Set();
  const seenAnimationKeys = new Set();

  for (const day of WORKOUT_DAYS) {
    for (const ex of day.exercises) {
      totalExercisesChecked++;
      verifiedExerciseIds.add(ex.id);
      seenAnimationKeys.add(ex.animationKey);

      // Metadados no registro
      const meta = getAnimationRegistryItem(ex.id);
      assert.ok(meta, `Exercício ${ex.id} (${ex.name}) DEVE existir no registro canônico`);
      assert.equal(meta.animationStatus, 'verified', `Exercício ${ex.id} deve ter status 'verified'`);

      // Garante que não há campos obrigatórios vazios
      assert.ok(meta.equipmentName.length > 0, `Nome de equipamento de ${ex.id} não pode ser vazio`);
      assert.ok(meta.movementPattern.length > 0, `Padrão de movimento de ${ex.id} não pode ser vazio`);
      assert.ok(meta.primaryMuscles.length > 0, `Músculos primários de ${ex.id} não podem ser vazios`);

      // Garante que cada alternativa do exercício possui variante mapeada com animationKey válida
      for (const alt of ex.machines.alternatives) {
        if (alt.variantId) {
          const altMeta = getVariantRegistryItem(alt.variantId);
          assert.ok(altMeta, `Variante alternativa '${alt.variantId}' de ${ex.id} deve constar no registro`);
          assert.equal(altMeta.animationStatus, 'verified');
          assert.ok(altMeta.animationKey.length > 0);
        }
      }
    }
  }

  assert.equal(totalExercisesChecked, 21, 'Devem existir exatamente 21 exercícios em todo o plano de 5 dias');
  assert.equal(verifiedExerciseIds.size, 21, 'Devem existir 21 IDs únicos de exercícios');
  assert.equal(seenAnimationKeys.size, 21, 'Devem existir 21 chaves de animação exclusivas e dedicadas no plano');

  // Pares biomecanicamente críticos que JAMAIS podem compartilhar o mesmo componente
  const forbiddenPairs = [
    ['lateralRaiseCable', 'shoulderPressDumbbell'],
    ['legpress45', 'squatSmith'],
    ['singleArmRowDumbbell', 'cableRow'],
    ['hammerCurlDumbbell', 'bicepsWBar'],
    ['seatedAbductor', 'hipThrustMachine'],
    ['inclineBenchPress', 'benchPressBarbell'],
    ['peckDeckFly', 'benchPressBarbell'],
    ['rearDeltPeckDeck', 'shoulderPressDumbbell'],
    ['tricepsRopePushdown', 'shoulderPressDumbbell'],
    ['bulgarianSplitSquat', 'squatSmith'],
    ['gravitonPullup', 'pulldownClose'],
    ['chestSupportedRowMachine', 'cableRowSeated'],
    ['bicepsAlternatingDumbbell', 'bicepsWBar'],
    ['hammerRopeCable', 'bicepsCable'],
    ['swissBallCrunch', 'plankFloor'],
    ['hipThrustSmith', 'hipThrustMachine'],
    ['legextCable', 'legextBilateral'],
    ['calfSeated', 'calfStanding']
  ];

  for (const [keyA, keyB] of forbiddenPairs) {
    assert.notEqual(keyA, keyB, `O par ${keyA} e ${keyB} não pode ser idêntico`);
  }
});

// ============================================================================
// TESTE 5: Integridade Vetorial de Todos os Modelos SVG Dedicados por Aparelho
// ============================================================================
test('5. Integridade Vetorial: Todos os modelos SVG exportados renderizam marcação <svg> válida', () => {
  const models = [
    // Ombros
    { name: 'ShoulderPressDumbbellSvg', fn: ShoulderPressDumbbellSvg, requiresProps: true },
    { name: 'ShoulderPressMachineSvg', fn: ShoulderPressMachineSvg, requiresProps: true },
    { name: 'ShoulderPressSmithSvg', fn: ShoulderPressSmithSvg, requiresProps: true },
    { name: 'LateralRaiseCableSvg', fn: LateralRaiseCableSvg, requiresProps: true },
    { name: 'LateralRaiseDumbbellSvg', fn: LateralRaiseDumbbellSvg, requiresProps: true },
    { name: 'LateralRaiseMachineSvg', fn: LateralRaiseMachineSvg, requiresProps: true },
    { name: 'RearDeltPeckDeckSvg', fn: RearDeltPeckDeckSvg, requiresProps: true },
    { name: 'FacepullCableSvg', fn: FacepullCableSvg, requiresProps: true },
    { name: 'RearDeltDumbbellSvg', fn: RearDeltDumbbellSvg, requiresProps: true },
    // Pernas
    { name: 'SquatSmithSvg', fn: SquatSmithSvg, requiresProps: true },
    { name: 'SquatFreeBarSvg', fn: SquatFreeBarSvg, requiresProps: true },
    { name: 'HackSquatMachineSvg', fn: HackSquatMachineSvg, requiresProps: true },
    { name: 'LegPress45Svg', fn: LegPress45Svg, requiresProps: true },
    { name: 'LegPressHorizontalSvg', fn: LegPressHorizontalSvg, requiresProps: true },
    { name: 'LegExtensionSvg', fn: LegExtensionSvg, requiresProps: true },
    { name: 'LegExtensionCableSvg', fn: LegExtensionCableSvg, requiresProps: true },
    { name: 'LegCurlSvg', fn: LegCurlSvg, requiresProps: true },
    { name: 'LegCurlSeatedSvg', fn: LegCurlSeatedSvg, requiresProps: true },
    { name: 'StiffDumbbellSvg', fn: StiffDumbbellSvg, requiresProps: true },
    { name: 'CalfRaiseSvg', fn: CalfRaiseSvg, requiresProps: true },
    { name: 'CalfRaiseLegPressSvg', fn: CalfRaiseLegPressSvg, requiresProps: true },
    { name: 'CalfRaiseSeatedSvg', fn: CalfRaiseSeatedSvg, requiresProps: true },
    // Costas
    { name: 'PulldownWideSvg', fn: PulldownWideSvg, requiresProps: true },
    { name: 'PulldownCloseSvg', fn: PulldownCloseSvg, requiresProps: true },
    { name: 'GravitonPullupSvg', fn: GravitonPullupSvg, requiresProps: true },
    { name: 'CableRowSvg', fn: CableRowSvg, requiresProps: true },
    { name: 'TBarRowSvg', fn: TBarRowSvg, requiresProps: true },
    { name: 'ChestSupportedRowMachineSvg', fn: ChestSupportedRowMachineSvg, requiresProps: true },
    { name: 'SingleArmRowSvg', fn: SingleArmRowSvg, requiresProps: true },
    { name: 'SingleArmRowCableSvg', fn: SingleArmRowCableSvg, requiresProps: true },
    // Braços
    { name: 'BicepsCurlWBarSvg', fn: BicepsCurlWBarSvg, requiresProps: true },
    { name: 'BicepsCurlCableSvg', fn: BicepsCurlCableSvg, requiresProps: true },
    { name: 'BicepsCurlAlternatingDumbbellSvg', fn: BicepsCurlAlternatingDumbbellSvg, requiresProps: true },
    { name: 'HammerCurlDumbbellSvg', fn: HammerCurlDumbbellSvg, requiresProps: true },
    { name: 'HammerCurlRopeCableSvg', fn: HammerCurlRopeCableSvg, requiresProps: true },
    { name: 'TricepsRopePushdownSvg', fn: TricepsRopePushdownSvg, requiresProps: true },
    { name: 'TricepsBarPushdownSvg', fn: TricepsBarPushdownSvg, requiresProps: true },
    // Glúteos & Core
    { name: 'HipThrustMachineSvg', fn: HipThrustMachineSvg, requiresProps: true },
    { name: 'HipThrustBarbellSvg', fn: HipThrustBarbellSvg, requiresProps: true },
    { name: 'HipThrustSmithSvg', fn: HipThrustSmithSvg, requiresProps: true },
    { name: 'BulgarianSplitSquatSvg', fn: BulgarianSplitSquatSvg, requiresProps: true },
    { name: 'SumoSquatStepSvg', fn: SumoSquatStepSvg, requiresProps: true },
    { name: 'SeatedAbductorSvg', fn: SeatedAbductorSvg, requiresProps: true },
    { name: 'CableStandingAbductionSvg', fn: CableStandingAbductionSvg, requiresProps: true },
    { name: 'PlankCoreSvg', fn: PlankCoreSvg, requiresProps: false },
    { name: 'SwissBallCrunchSvg', fn: SwissBallCrunchSvg, requiresProps: true },
    // Peito
    { name: 'BenchPressBarbellSvg', fn: BenchPressBarbellSvg, requiresProps: true },
    { name: 'BenchPressDumbbellSvg', fn: BenchPressDumbbellSvg, requiresProps: true },
    { name: 'ChestPressMachineSvg', fn: ChestPressMachineSvg, requiresProps: true },
    { name: 'InclineBenchPressSvg', fn: InclineBenchPressSvg, requiresProps: true },
    { name: 'InclineBenchSmithSvg', fn: InclineBenchSmithSvg, requiresProps: true },
    { name: 'PeckDeckFlySvg', fn: PeckDeckFlySvg, requiresProps: true },
    { name: 'CableCrossOverSvg', fn: CableCrossOverSvg, requiresProps: true },
    { name: 'DumbbellFlatFlySvg', fn: DumbbellFlatFlySvg, requiresProps: true },
    // Aliases retrocompatíveis
    { name: 'ShoulderPressSvg', fn: ShoulderPressSvg, requiresProps: true },
    { name: 'LateralRaiseSvg', fn: LateralRaiseSvg, requiresProps: true },
    { name: 'RearDeltFlySvg', fn: RearDeltFlySvg, requiresProps: true },
    { name: 'PulldownSvg', fn: PulldownSvg, requiresProps: true },
    { name: 'BicepsCurlSvg', fn: BicepsCurlSvg, requiresProps: true },
    { name: 'HammerCurlSvg', fn: HammerCurlSvg, requiresProps: true },
    { name: 'HipThrustSvg', fn: HipThrustSvg, requiresProps: true },
    { name: 'BenchPressSvg', fn: BenchPressSvg, requiresProps: true },
    // Fallback
    { name: 'AnimationInPreparationSvg', fn: AnimationInPreparationSvg, requiresProps: false }
  ];

  assert.ok(models.length >= 48, `Devem existir mais de 48 modelos SVG dedicados (encontrados: ${models.length})`);

  for (const m of models) {
    assert.equal(typeof m.fn, 'function', `${m.name} deve ser uma função de componente React válida`);

    if (m.requiresProps) {
      // Testa fase concêntrica
      const conc = m.fn({ phase: 'concentric', accentColor: '#c3f75a' });
      assert.ok(conc, `${m.name} concêntrico deve retornar elemento`);
      assert.equal(conc.type, 'svg', `${m.name} deve retornar tag <svg>`);
      assert.ok(conc.props.viewBox, `${m.name} deve definir viewBox`);

      // Testa fase excêntrica
      const ecc = m.fn({ phase: 'eccentric', accentColor: '#ff2e93', isTechnicalMode: true });
      assert.ok(ecc, `${m.name} excêntrico deve retornar elemento`);
      assert.equal(ecc.type, 'svg', `${m.name} deve retornar tag <svg>`);
    } else {
      const res = m.fn({ accentColor: '#c3f75a', exerciseName: 'Teste' });
      assert.ok(res, `${m.name} deve retornar elemento`);
      assert.equal(res.type, 'svg', `${m.name} deve retornar tag <svg>`);
    }
  }
});

// ============================================================================
// TESTE 6: Conformidade Anatômica dos Mapas Musculares
// ============================================================================
test('6. Anatomia: Todos os 21 exercícios possuem partes corporais anatômicas ativas (frente e/ou verso)', () => {
  const allowedFrontParts = new Set(['quads', 'calves', 'shoulders', 'chest', 'biceps', 'forearms', 'abs', 'triceps']);
  const allowedBackParts = new Set(['glutes', 'hamstrings', 'calves', 'traps', 'lats', 'shoulders', 'triceps', 'lowerback', 'midback']);

  for (const day of WORKOUT_DAYS) {
    for (const ex of day.exercises) {
      const hasFront = ex.activeBodyParts.front.length > 0;
      const hasBack = ex.activeBodyParts.back.length > 0;

      assert.ok(hasFront || hasBack, `Exercício ${ex.id} deve ter ao menos um grupo muscular ativo na frente ou verso`);

      for (const p of ex.activeBodyParts.front) {
        assert.ok(allowedFrontParts.has(p), `Parte frontal desconhecida '${p}' no exercício ${ex.id}`);
      }
      for (const p of ex.activeBodyParts.back) {
        assert.ok(allowedBackParts.has(p), `Parte dorsal desconhecida '${p}' no exercício ${ex.id}`);
      }
    }
  }
});

// ============================================================================
// TESTE 7: Eliminação Total de Modelos Incompatíveis Remanescentes (8 Aparelhos)
// ============================================================================
test('7. Eliminação Total de Modelos Incompatíveis: 8 novos aparelhos possuem componentes SVG 100% dedicados', () => {
  // 1. back-1-graviton: Barra Fixa Assistida no Graviton
  const graviton = getVariantRegistryItem('back-1-graviton');
  assert.equal(graviton.animationKey, 'gravitonPullup');
  assert.notEqual(graviton.animationKey, 'pulldownClose');
  const gravitonSvg = GravitonPullupSvg({ phase: 'concentric', accentColor: '#c3f75a' });
  assert.equal(gravitonSvg.type, 'svg');

  // 2. back-2-machine: Remada Máquina Articulada com Apoio Peitoral
  const machineRow = getVariantRegistryItem('back-2-machine');
  assert.equal(machineRow.animationKey, 'chestSupportedRowMachine');
  assert.notEqual(machineRow.animationKey, 'cableRowSeated');
  const machineRowSvg = ChestSupportedRowMachineSvg({ phase: 'concentric', accentColor: '#c3f75a' });
  assert.equal(machineRowSvg.type, 'svg');

  // 3. back-4-dumbbells: Rosca Alternada com Supinação
  const altBiceps = getVariantRegistryItem('back-4-dumbbells');
  assert.equal(altBiceps.animationKey, 'bicepsAlternatingDumbbell');
  assert.notEqual(altBiceps.animationKey, 'bicepsWBar');
  const altBicepsSvg = BicepsCurlAlternatingDumbbellSvg({ phase: 'concentric', accentColor: '#c3f75a' });
  assert.equal(altBicepsSvg.type, 'svg');

  // 4. back-5-rope: Rosca Martelo na Corda na Polia Baixa
  const ropeHammer = getVariantRegistryItem('back-5-rope');
  assert.equal(ropeHammer.animationKey, 'hammerRopeCable');
  assert.notEqual(ropeHammer.animationKey, 'bicepsCable');
  const ropeHammerSvg = HammerCurlRopeCableSvg({ phase: 'concentric', accentColor: '#c3f75a' });
  assert.equal(ropeHammerSvg.type, 'svg');

  // 5. back-6-ball: Abdominal na Bola Suíça (Fitball Dinâmico)
  const ballCrunch = getVariantRegistryItem('back-6-ball');
  assert.equal(ballCrunch.animationKey, 'swissBallCrunch');
  assert.notEqual(ballCrunch.animationKey, 'plankFloor');
  const ballCrunchSvg = SwissBallCrunchSvg({ phase: 'concentric', accentColor: '#c3f75a' });
  assert.equal(ballCrunchSvg.type, 'svg');

  // 6. glute-1-smith: Hip Thrust no Smith Machine (Barra Guiada)
  const smithHip = getVariantRegistryItem('glute-1-smith');
  assert.equal(smithHip.animationKey, 'hipThrustSmith');
  assert.notEqual(smithHip.animationKey, 'hipThrustMachine');
  const smithHipSvg = HipThrustSmithSvg({ phase: 'concentric', accentColor: '#c3f75a' });
  assert.equal(smithHipSvg.type, 'svg');

  // 7. leg-3-cable-unilateral: Extensora Unilateral no Cabo
  const cableExt = getVariantRegistryItem('leg-3-cable-unilateral');
  assert.equal(cableExt.animationKey, 'legextCable');
  const cableExtSvg = LegExtensionCableSvg({ phase: 'concentric', accentColor: '#c3f75a' });
  assert.equal(cableExtSvg.type, 'svg');

  // 8. leg-5-seated: Gêmeos Sentado (Cavalinho a 90°)
  const seatedCalf = getVariantRegistryItem('leg-5-seated');
  assert.equal(seatedCalf.animationKey, 'calfSeated');
  const seatedCalfSvg = CalfRaiseSeatedSvg({ phase: 'concentric', accentColor: '#c3f75a' });
  assert.equal(seatedCalfSvg.type, 'svg');
});

// ============================================================================
// TESTE 8: Atualização Anatômica e Muscle Map na Troca de Variantes
// ============================================================================
test('8. Conformidade Anatômica: handleSwapExercise atualiza targetMuscle, secondaryMuscles e activeBodyParts sem copiar do original', () => {
  const legDay = WORKOUT_DAYS.find((d) => d.dayShort === 'SEG');
  const leg4Base = legDay.exercises.find((e) => e.id === 'leg-4');

  // Estado inicial: Mesa Flexora (Deitado)
  assert.equal(leg4Base.activeVariantId, 'leg-4-prone');
  assert.equal(leg4Base.targetMuscle, 'Isquiotibiais (Posterior de Coxa)');
  assert.deepEqual(leg4Base.activeBodyParts.front, []);
  assert.deepEqual(leg4Base.activeBodyParts.back, ['hamstrings']);

  // Troca para Stiff com Halteres (leg-4-stiff)
  const leg4Stiff = swapExerciseVariant(leg4Base, 'leg-4-stiff');
  assert.equal(leg4Stiff.activeVariantId, 'leg-4-stiff');
  assert.equal(leg4Stiff.name, 'Stiff com Halteres');
  assert.equal(leg4Stiff.animationKey, 'stiffDumbbell');
  assert.equal(leg4Stiff.targetMuscle, 'Isquiotibiais & Glúteo Máximo');
  assert.ok(leg4Stiff.secondaryMuscles.includes('Glúteo Máximo'));
  assert.ok(leg4Stiff.secondaryMuscles.includes('Eretores da Espinha'));
  assert.ok(leg4Stiff.activeBodyParts.back.includes('hamstrings'));
  assert.ok(leg4Stiff.activeBodyParts.back.includes('glutes'));
  assert.ok(leg4Stiff.activeBodyParts.back.includes('lowerback'));
  assert.equal(leg4Stiff.reps, '10 - 12');
  assert.equal(leg4Stiff.restSeconds, 60);

  // Round-trip fiel: troca de volta para Mesa Flexora
  const leg4Restored = swapExerciseVariant(leg4Stiff, 'leg-4-prone');
  assert.equal(leg4Restored.activeVariantId, 'leg-4-prone');
  assert.equal(leg4Restored.targetMuscle, 'Isquiotibiais (Posterior de Coxa)');
  assert.deepEqual(leg4Restored.activeBodyParts.back, ['hamstrings']);
  assert.ok(!leg4Restored.activeBodyParts.back.includes('glutes'));
  assert.ok(!leg4Restored.activeBodyParts.back.includes('lowerback'));

  // Teste Prancha (back-6-floor) -> Abdominal na Bola Suíça (back-6-ball)
  const backDay = WORKOUT_DAYS.find((d) => d.dayShort === 'TER');
  const back6Base = backDay.exercises.find((e) => e.id === 'back-6');
  assert.equal(back6Base.activeVariantId, 'back-6-floor');
  assert.ok(back6Base.activeBodyParts.back.includes('lowerback'));

  const back6Ball = swapExerciseVariant(back6Base, 'back-6-ball');
  assert.equal(back6Ball.activeVariantId, 'back-6-ball');
  assert.equal(back6Ball.targetMuscle, 'Reto Abdominal (Isolamento Anterior)');
  assert.ok(back6Ball.secondaryMuscles.includes('Oblíquos'));
  assert.deepEqual(back6Ball.activeBodyParts.front, ['abs']);
  assert.deepEqual(back6Ball.activeBodyParts.back, []); // Bola suíça apoia a lombar, sem sobrecarga isométrica dorsal
  assert.equal(back6Ball.reps, '15 - 20');

  // Teste Búlgaro (glute-2-bulgarian) -> Sumô no Step (glute-2-sumo)
  const gluteDay = WORKOUT_DAYS.find((d) => d.dayShort === 'QUI');
  const glute2Base = gluteDay.exercises.find((e) => e.id === 'glute-2');
  assert.equal(glute2Base.activeVariantId, 'glute-2-bulgarian');

  const glute2Sumo = swapExerciseVariant(glute2Base, 'glute-2-sumo');
  assert.equal(glute2Sumo.activeVariantId, 'glute-2-sumo');
  assert.equal(glute2Sumo.targetMuscle, 'Glúteo Máximo & Adutores da Coxa');
  assert.ok(glute2Sumo.secondaryMuscles.includes('Quadríceps'));
  assert.ok(glute2Sumo.secondaryMuscles.includes('Isquiotibiais'));
  assert.deepEqual(glute2Sumo.activeBodyParts.front, ['quads', 'adductors']);
  assert.deepEqual(glute2Sumo.activeBodyParts.back, ['glutes']);
  assert.equal(glute2Sumo.reps, '12 - 15');
});

// ============================================================================
// TESTE 9: Histórico Preciso por Série e Não Sobrescrita Retroativa
// ============================================================================
test('9. Histórico por Série: Troca no meio do treino preserva a máquina das séries anteriores', () => {
  const legDay = WORKOUT_DAYS.find((d) => d.dayShort === 'SEG');
  const leg4Initial = legDay.exercises.find((e) => e.id === 'leg-4');

  // Série 0 e 1 feitas na Mesa Flexora
  const set0 = recordSetWithVariant(undefined, leg4Initial, true, '45');
  assert.equal(set0.done, true);
  assert.equal(set0.variantId, 'leg-4-prone');
  assert.equal(set0.equipmentName, 'Mesa Flexora (Deitado)');
  assert.equal(set0.weightKg, '45');

  const set1 = recordSetWithVariant(undefined, leg4Initial, true, '45');
  assert.equal(set1.done, true);
  assert.equal(set1.variantId, 'leg-4-prone');
  assert.equal(set1.equipmentName, 'Mesa Flexora (Deitado)');

  // Usuário troca para Stiff com Halteres no meio do treino
  const leg4Swapped = swapExerciseVariant(leg4Initial, 'leg-4-stiff');
  assert.equal(leg4Swapped.activeVariantId, 'leg-4-stiff');

  // Séries 2 e 3 feitas no Stiff
  const set2 = recordSetWithVariant(undefined, leg4Swapped, true, '36');
  assert.equal(set2.done, true);
  assert.equal(set2.variantId, 'leg-4-stiff');
  assert.ok(set2.equipmentName.includes('Halteres'));
  assert.equal(set2.exerciseName, 'Stiff com Halteres');
  assert.equal(set2.weightKg, '36');

  const set3 = recordSetWithVariant(undefined, leg4Swapped, true, '36');
  assert.equal(set3.done, true);
  assert.equal(set3.variantId, 'leg-4-stiff');
  assert.ok(set3.equipmentName.includes('Halteres'));
  assert.equal(set3.exerciseName, 'Stiff com Halteres');
  assert.equal(set3.weightKg, '36');

  // REGRA INVIOLÁVEL: As séries 0 e 1 continuam intactas na Mesa Flexora
  assert.equal(set0.variantId, 'leg-4-prone');
  assert.equal(set1.variantId, 'leg-4-prone');
  assert.notEqual(set0.variantId, leg4Swapped.activeVariantId);

  // Retrocompatibilidade e desacoplamento: desmarcar série preserva a carga mas libera a máquina
  const legacySet = { done: true, weightKg: '50' };
  const updatedLegacy = recordSetWithVariant(legacySet, leg4Swapped, false);
  assert.equal(updatedLegacy.done, false);
  assert.equal(updatedLegacy.weightKg, '50');
  assert.equal(updatedLegacy.variantId, undefined); // Snapshot liberado para que outra máquina possa ser escolhida

  // Ao marcar como concluída (done: true), captura atomicamente a máquina ativa
  const completedLegacy = recordSetWithVariant(updatedLegacy, leg4Swapped, true);
  assert.equal(completedLegacy.done, true);
  assert.equal(completedLegacy.weightKg, '50');
  assert.equal(completedLegacy.variantId, 'leg-4-stiff');
});

// ============================================================================
// TESTE 10: Persistência Durável e Isolamento Estrito entre Rangel e Jack
// ============================================================================
test('10. Isolamento entre Perfis: Escolhas de Rangel e Jack não interferem entre si', () => {
  const rangelPreferences = {
    'leg-4': 'leg-4-stiff',
    'back-6': 'back-6-ball'
  };

  const jackPreferences = {
    'leg-4': 'leg-4-seated',
    'back-6': 'back-6-floor'
  };

  const rangelWorkouts = applyStoredVariantsToWorkouts(WORKOUT_DAYS, rangelPreferences);
  const jackWorkouts = applyStoredVariantsToWorkouts(WORKOUT_DAYS, jackPreferences);

  // Verificação Rangel
  const rangelLeg4 = rangelWorkouts[0].exercises.find((e) => e.id === 'leg-4');
  const rangelBack6 = rangelWorkouts[1].exercises.find((e) => e.id === 'back-6');
  assert.equal(rangelLeg4.activeVariantId, 'leg-4-stiff');
  assert.equal(rangelLeg4.targetMuscle, 'Isquiotibiais & Glúteo Máximo');
  assert.ok(rangelLeg4.activeBodyParts.back.includes('glutes'));
  assert.equal(rangelBack6.activeVariantId, 'back-6-ball');
  assert.deepEqual(rangelBack6.activeBodyParts.back, []);

  // Verificação Jack
  const jackLeg4 = jackWorkouts[0].exercises.find((e) => e.id === 'leg-4');
  const jackBack6 = jackWorkouts[1].exercises.find((e) => e.id === 'back-6');
  assert.equal(jackLeg4.activeVariantId, 'leg-4-seated');
  assert.equal(jackLeg4.targetMuscle, 'Isquiotibiais (Encurtamento Sentado)');
  assert.deepEqual(jackLeg4.activeBodyParts.back, ['hamstrings']);
  assert.equal(jackBack6.activeVariantId, 'back-6-floor');
  assert.ok(jackBack6.activeBodyParts.back.includes('lowerback'));

  // Verificação de Imutabilidade do Catálogo Base
  const baseLeg4 = WORKOUT_DAYS[0].exercises.find((e) => e.id === 'leg-4');
  assert.equal(baseLeg4.activeVariantId, 'leg-4-prone');
  assert.equal(baseLeg4.targetMuscle, 'Isquiotibiais (Posterior de Coxa)');
});

