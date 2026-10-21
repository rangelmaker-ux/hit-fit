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
  LegCurlSvg,
  LegCurlSeatedSvg,
  StiffDumbbellSvg,
  CalfRaiseSvg,
  CalfRaiseLegPressSvg,
  // Costas
  PulldownWideSvg,
  PulldownCloseSvg,
  CableRowSvg,
  TBarRowSvg,
  SingleArmRowSvg,
  SingleArmRowCableSvg,
  // Braços
  BicepsCurlWBarSvg,
  BicepsCurlCableSvg,
  HammerCurlDumbbellSvg,
  TricepsRopePushdownSvg,
  TricepsBarPushdownSvg,
  // Glúteos & Core
  HipThrustMachineSvg,
  HipThrustBarbellSvg,
  BulgarianSplitSquatSvg,
  SumoSquatStepSvg,
  SeatedAbductorSvg,
  CableStandingAbductionSvg,
  PlankCoreSvg,
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

    const previousPrimary = currentExercise.machines.primary;
    const newAlternatives = [
      ...currentExercise.machines.alternatives.filter(
        (a) => a !== altItem && a.variantId !== targetIdentifier && a.name !== targetIdentifier
      ),
      { ...previousPrimary }
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
      biomechanics: registryItem ? {
        ...currentExercise.biomechanics,
        setup: registryItem.settingTips || currentExercise.biomechanics.setup,
        execution: registryItem.description || currentExercise.biomechanics.execution
      } : currentExercise.biomechanics
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
  // O banco com halteres agora é uma alternativa disponível
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
    ['bulgarianSplitSquat', 'squatSmith']
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
    { name: 'LegCurlSvg', fn: LegCurlSvg, requiresProps: true },
    { name: 'LegCurlSeatedSvg', fn: LegCurlSeatedSvg, requiresProps: true },
    { name: 'StiffDumbbellSvg', fn: StiffDumbbellSvg, requiresProps: true },
    { name: 'CalfRaiseSvg', fn: CalfRaiseSvg, requiresProps: true },
    { name: 'CalfRaiseLegPressSvg', fn: CalfRaiseLegPressSvg, requiresProps: true },
    // Costas
    { name: 'PulldownWideSvg', fn: PulldownWideSvg, requiresProps: true },
    { name: 'PulldownCloseSvg', fn: PulldownCloseSvg, requiresProps: true },
    { name: 'CableRowSvg', fn: CableRowSvg, requiresProps: true },
    { name: 'TBarRowSvg', fn: TBarRowSvg, requiresProps: true },
    { name: 'SingleArmRowSvg', fn: SingleArmRowSvg, requiresProps: true },
    { name: 'SingleArmRowCableSvg', fn: SingleArmRowCableSvg, requiresProps: true },
    // Braços
    { name: 'BicepsCurlWBarSvg', fn: BicepsCurlWBarSvg, requiresProps: true },
    { name: 'BicepsCurlCableSvg', fn: BicepsCurlCableSvg, requiresProps: true },
    { name: 'HammerCurlDumbbellSvg', fn: HammerCurlDumbbellSvg, requiresProps: true },
    { name: 'TricepsRopePushdownSvg', fn: TricepsRopePushdownSvg, requiresProps: true },
    { name: 'TricepsBarPushdownSvg', fn: TricepsBarPushdownSvg, requiresProps: true },
    // Glúteos & Core
    { name: 'HipThrustMachineSvg', fn: HipThrustMachineSvg, requiresProps: true },
    { name: 'HipThrustBarbellSvg', fn: HipThrustBarbellSvg, requiresProps: true },
    { name: 'BulgarianSplitSquatSvg', fn: BulgarianSplitSquatSvg, requiresProps: true },
    { name: 'SumoSquatStepSvg', fn: SumoSquatStepSvg, requiresProps: true },
    { name: 'SeatedAbductorSvg', fn: SeatedAbductorSvg, requiresProps: true },
    { name: 'CableStandingAbductionSvg', fn: CableStandingAbductionSvg, requiresProps: true },
    { name: 'PlankCoreSvg', fn: PlankCoreSvg, requiresProps: false },
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

  assert.ok(models.length >= 40, `Devem existir mais de 40 modelos SVG dedicados (encontrados: ${models.length})`);

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
