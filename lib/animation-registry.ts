/**
 * HIT-FIT 2.0 | Registro Canônico de Mapeamento de Animações, Equipamentos e Biomecânica
 * Cada exercício possui identidade unívoca:
 * - exerciseId: Identificador do exercício no plano de treino
 * - exerciseName: Nome descritivo oficial
 * - equipmentId: Identificador do equipamento
 * - equipmentName: Nome da máquina / aparelho físico
 * - movementPattern: Padrão biomecânico do movimento
 * - animationId: Chave de renderização vetorial SVG específica
 * - muscleMapId: Identificador para renderização anatômica
 * - primaryMuscles: Músculos agonistas primários
 * - secondaryMuscles: Músculos sinergistas auxiliares
 * - animationStatus: 'verified' (animação específica validada) | 'in_preparation' (em preparação)
 */

export type AnimationStatus = 'verified' | 'in_preparation';

export interface AnimationRegistryItem {
  exerciseId: string;
  exerciseName: string;
  equipmentId: string;
  equipmentName: string;
  movementPattern: string;
  animationId: string;
  muscleMapId: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  animationStatus: AnimationStatus;
  machineVisualType:
    | 'smith_machine'
    | 'leg_press_45'
    | 'leg_extension_chair'
    | 'prone_leg_curl_bench'
    | 'standing_calf_machine'
    | 'high_pulley_lat'
    | 'low_pulley_seated_row'
    | 'flat_bench_dumbbell'
    | 'w_bar_biceps'
    | 'neutral_dumbbells'
    | 'incline_bench_dumbbells'
    | 'cable_lateral_raise'
    | 'rear_delt_peck_deck'
    | 'high_pulley_rope_triceps'
    | 'hip_thrust_bench_machine'
    | 'bulgarian_split_bench'
    | 'seated_abductor_chair'
    | 'flat_barbell_bench'
    | 'incline_chest_bench'
    | 'peck_deck_fly_machine'
    | 'isometric_floor_mat';
  description: string;
}

export const ANIMATION_REGISTRY: Record<string, AnimationRegistryItem> = {
  'leg-1': {
    exerciseId: 'leg-1',
    exerciseName: 'Agachamento (Smith ou Livre)',
    equipmentId: 'smith_machine',
    equipmentName: 'Smith Machine (Barra Guiada)',
    movementPattern: 'Flexão e extensão tripla (quadril, joelhos, tornozelos) guiada em trilho vertical',
    animationId: 'squat',
    muscleMapId: 'legs_quads_glutes',
    primaryMuscles: ['Quadríceps', 'Glúteo Máximo'],
    secondaryMuscles: ['Isquiotibiais', 'Panturrilha', 'Eretores da Espinha'],
    animationStatus: 'verified',
    machineVisualType: 'smith_machine',
    description: 'Barra guiada sobre trilhos verticais com atleta agachando até 90° e empurrando o solo.'
  },
  'leg-2': {
    exerciseId: 'leg-2',
    exerciseName: 'Leg Press 45°',
    equipmentId: 'leg_press_45',
    equipmentName: 'Leg Press 45° de Anilhas',
    movementPattern: 'Extensão de quadril e joelhos empurrando trenó inclinado a 45°',
    animationId: 'legpress',
    muscleMapId: 'legs_quads_glutes',
    primaryMuscles: ['Quadríceps', 'Glúteo Máximo'],
    secondaryMuscles: ['Adutores', 'Isquiotibiais'],
    animationStatus: 'verified',
    machineVisualType: 'leg_press_45',
    description: 'Encosto reclinado a 45° com plataforma móvel deslizando em trilho diagonal.'
  },
  'leg-3': {
    exerciseId: 'leg-3',
    exerciseName: 'Cadeira Extensora',
    equipmentId: 'leg_extension_chair',
    equipmentName: 'Cadeira Extensora Tradicional',
    movementPattern: 'Extensão isolada de joelhos em cadeia cinética aberta',
    animationId: 'legext',
    muscleMapId: 'legs_quads_isolated',
    primaryMuscles: ['Quadríceps (Reto Femoral, Vastos)'],
    secondaryMuscles: ['Reto Femoral proximal'],
    animationStatus: 'verified',
    machineVisualType: 'leg_extension_chair',
    description: 'Cadeira com encosto vertical, eixo no joelho e rolete almofadado elevando as canelas.'
  },
  'leg-4': {
    exerciseId: 'leg-4',
    exerciseName: 'Mesa ou Cadeira Flexora',
    equipmentId: 'prone_leg_curl_bench',
    equipmentName: 'Mesa Flexora (Deitado)',
    movementPattern: 'Flexão isolada de joelhos em decúbito ventral',
    animationId: 'legcurl',
    muscleMapId: 'legs_hamstrings',
    primaryMuscles: ['Isquiotibiais (Bíceps Femoral, Semitendíneo, Semimembranáceo)'],
    secondaryMuscles: ['Gastrocnêmio'],
    animationStatus: 'verified',
    machineVisualType: 'prone_leg_curl_bench',
    description: 'Banco horizontal onde o atleta deita de bruços e flexiona as pernas trazendo o rolete aos glúteos.'
  },
  'leg-5': {
    exerciseId: 'leg-5',
    exerciseName: 'Panturrilha (Leg ou em Pé)',
    equipmentId: 'standing_calf_machine',
    equipmentName: 'Gêmeos em Pé na Máquina',
    movementPattern: 'Flexão plantar dos tornozelos sob carga vertical nos ombros',
    animationId: 'calf',
    muscleMapId: 'legs_calves',
    primaryMuscles: ['Gastrocnêmio', 'Sóleo'],
    secondaryMuscles: ['Tibial Posterior'],
    animationStatus: 'verified',
    machineVisualType: 'standing_calf_machine',
    description: 'Atleta em pé com antepés apoiados no degrau elevando os calcanhares sob almofadas nos ombros.'
  },
  'back-1': {
    exerciseId: 'back-1',
    exerciseName: 'Puxada Frontal na Polia',
    equipmentId: 'high_pulley_lat',
    equipmentName: 'Polia Alta (Pulley)',
    movementPattern: 'Adução e extensão de ombros com flexão de cotovelos de cima para baixo',
    animationId: 'pulldown',
    muscleMapId: 'back_lats',
    primaryMuscles: ['Latíssimo do Dorso (Dorsais)'],
    secondaryMuscles: ['Bíceps Braquial', 'Redondo Maior', 'Rombóides'],
    animationStatus: 'verified',
    machineVisualType: 'high_pulley_lat',
    description: 'Torre de cabo alto com barra reta curva puxada até a fúrcula esternal/clavícula.'
  },
  'back-2': {
    exerciseId: 'back-2',
    exerciseName: 'Remada Baixa no Triângulo',
    equipmentId: 'low_pulley_seated_row',
    equipmentName: 'Remada Sentada no Cabo (Polia Baixa)',
    movementPattern: 'Extensão horizontal de ombros e retração escapular puxando cabo rente ao abdômen',
    animationId: 'row',
    muscleMapId: 'back_rhomboids_lats',
    primaryMuscles: ['Rombóides', 'Trapézio Médio/Inferior', 'Latíssimo do Dorso'],
    secondaryMuscles: ['Bíceps', 'Braquial', 'Eretores da Espinha'],
    animationStatus: 'verified',
    machineVisualType: 'low_pulley_seated_row',
    description: 'Banco com apoio nos pés e roldana baixa onde o puxador triângulo é puxado ao umbigo.'
  },
  'back-3': {
    exerciseId: 'back-3',
    exerciseName: 'Remada Unilateral (Serrote)',
    equipmentId: 'flat_bench_dumbbell',
    equipmentName: 'Banco Reto + Halter Livre',
    movementPattern: 'Puxada unilateral de halter com apoio de joelho e mão no banco reto',
    animationId: 'singleRow',
    muscleMapId: 'back_unilateral_lat',
    primaryMuscles: ['Latíssimo do Dorso', 'Redondo Maior'],
    secondaryMuscles: ['Bíceps', 'Braquial', 'Deltoide Posterior'],
    animationStatus: 'verified',
    machineVisualType: 'flat_bench_dumbbell',
    description: 'Atleta inclinado com um joelho e mão no banco plano, puxando um halter verticalmente até a costela.'
  },
  'back-4': {
    exerciseId: 'back-4',
    exerciseName: 'Rosca Direta com Barra W',
    equipmentId: 'w_bar_biceps',
    equipmentName: 'Barra W Olímpica ou Montada',
    movementPattern: 'Flexão pura dos cotovelos com pegada semi-supinada na barra W',
    animationId: 'biceps',
    muscleMapId: 'arms_biceps',
    primaryMuscles: ['Bíceps Braquial'],
    secondaryMuscles: ['Braquial', 'Braquiorradial'],
    animationStatus: 'verified',
    machineVisualType: 'w_bar_biceps',
    description: 'Atleta em pé com cotovelos estáveis ao lado do tronco flexionando a barra W até a linha do peito.'
  },
  'back-5': {
    exerciseId: 'back-5',
    exerciseName: 'Rosca Martelo com Halteres',
    equipmentId: 'neutral_dumbbells',
    equipmentName: 'Halteres Emborrachados (Pegada Neutra)',
    movementPattern: 'Flexão dos cotovelos com punhos em posição neutra vertical (polegares para cima)',
    animationId: 'hammer',
    muscleMapId: 'arms_brachialis',
    primaryMuscles: ['Braquial', 'Braquiorradial'],
    secondaryMuscles: ['Bíceps Braquial'],
    animationStatus: 'verified',
    machineVisualType: 'neutral_dumbbells',
    description: 'Halteres mantidos em pegada neutra vertical subindo no plano sagital sem girar o punho.'
  },
  'back-6': {
    exerciseId: 'back-6',
    exerciseName: 'Prancha Isométrica + Infra',
    equipmentId: 'isometric_floor_mat',
    equipmentName: 'Colchonete / Solo',
    movementPattern: 'Contração isométrica de sustentação do core sem movimentação articular dinâmica',
    animationId: 'plank',
    muscleMapId: 'core_rectus_abdominis',
    primaryMuscles: ['Reto Abdominal', 'Transverso do Abdômen'],
    secondaryMuscles: ['Glúteos', 'Oblíquos', 'Eretores da Espinha'],
    animationStatus: 'verified',
    machineVisualType: 'isometric_floor_mat',
    description: 'Corpo estático sustentado sobre antebraços e pontas dos pés, coluna alinhada em linha reta.'
  },
  'sh-1': {
    exerciseId: 'sh-1',
    exerciseName: 'Desenvolvimento com Halteres',
    equipmentId: 'incline_bench_dumbbells',
    equipmentName: 'Banco Regulável a 75°/80° + Halteres',
    movementPattern: 'Pressão vertical acima da cabeça (Overhead Press) a partir da linha dos ombros',
    animationId: 'shoulderPress',
    muscleMapId: 'shoulders_anterior_lateral',
    primaryMuscles: ['Deltoide Anterior', 'Deltoide Lateral'],
    secondaryMuscles: ['Tríceps Braquial', 'Trapézio Superior'],
    animationStatus: 'verified',
    machineVisualType: 'incline_bench_dumbbells',
    description: 'Atleta sentado no banco quase vertical empurrando os halteres diretamente para o alto.'
  },
  'sh-2': {
    exerciseId: 'sh-2',
    exerciseName: 'Elevação Lateral no Cabo ou Halteres',
    equipmentId: 'cable_lateral_raise',
    equipmentName: 'Cross Over / Polia Baixa ou Halteres',
    movementPattern: 'Abdução do ombro elevando os braços lateralmente até 90° (altura dos ombros)',
    animationId: 'lateralRaise',
    muscleMapId: 'shoulders_lateral_deltoid',
    primaryMuscles: ['Deltoide Lateral (Cabeça Média)'],
    secondaryMuscles: ['Supraespinhal', 'Trapézio Superior'],
    animationStatus: 'verified',
    machineVisualType: 'cable_lateral_raise',
    description: 'Braços partindo da lateral do quadril e subindo lateralmente em abdução até a linha dos ombros (em T).'
  },
  'sh-3': {
    exerciseId: 'sh-3',
    exerciseName: 'Crucifixo Inverso (Peck Deck ou Cabo)',
    equipmentId: 'rear_delt_peck_deck',
    equipmentName: 'Máquina Peck Deck Invertida (Voador Inverso)',
    movementPattern: 'Abdução horizontal dos ombros com os braços estendidos para trás',
    animationId: 'facepull',
    muscleMapId: 'shoulders_posterior_deltoid',
    primaryMuscles: ['Deltoide Posterior'],
    secondaryMuscles: ['Rombóides', 'Trapézio Médio/Inferior', 'Manguito Rotador'],
    animationStatus: 'verified',
    machineVisualType: 'rear_delt_peck_deck',
    description: 'Atleta sentado de frente para o encosto empurrando as alavancas para trás com os cotovelos altos.'
  },
  'sh-4': {
    exerciseId: 'sh-4',
    exerciseName: 'Tríceps Corda na Polia Alta',
    equipmentId: 'high_pulley_rope_triceps',
    equipmentName: 'Polia Alta com Acessório Corda',
    movementPattern: 'Extensão dos cotovelos de cima para baixo com separação da corda no final',
    animationId: 'tricepsRope',
    muscleMapId: 'arms_triceps',
    primaryMuscles: ['Tríceps Braquial (Cabeça Lateral, Medial e Longa)'],
    secondaryMuscles: ['Ancôneo'],
    animationStatus: 'verified',
    machineVisualType: 'high_pulley_rope_triceps',
    description: 'Polia alta com corda sendo empurrada para baixo até estender os cotovelos e abrir as pontas.'
  },
  'glute-1': {
    exerciseId: 'glute-1',
    exerciseName: 'Elevação Pélvica (Hip Thrust)',
    equipmentId: 'hip_thrust_bench_machine',
    equipmentName: 'Máquina Hip Thrust Dedicada / Banco Reto',
    movementPattern: 'Extensão de quadril com escápulas apoiadas no banco e barra na pelve',
    animationId: 'hipthrust',
    muscleMapId: 'glutes_maximum',
    primaryMuscles: ['Glúteo Máximo'],
    secondaryMuscles: ['Isquiotibiais', 'Eretores da Espinha'],
    animationStatus: 'verified',
    machineVisualType: 'hip_thrust_bench_machine',
    description: 'Quadril subindo do chão até ficar 100% alinhado horizontalmente com o joelho e ombros.'
  },
  'glute-2': {
    exerciseId: 'glute-2',
    exerciseName: 'Agachamento Búlgaro ou Sumô',
    equipmentId: 'bulgarian_split_bench',
    equipmentName: 'Banco Reto ou Step + Halteres',
    movementPattern: 'Agachamento unilateral com pé de trás apoiado no banco elevado',
    animationId: 'bulgarian',
    muscleMapId: 'glutes_quads_split',
    primaryMuscles: ['Glúteo Máximo', 'Quadríceps da Perna da Frente'],
    secondaryMuscles: ['Isquiotibiais', 'Adutores'],
    animationStatus: 'verified',
    machineVisualType: 'bulgarian_split_bench',
    description: 'Posição afundo com peito do pé traseiro no banco e descida vertical do joelho dianteiro.'
  },
  'glute-3': {
    exerciseId: 'glute-3',
    exerciseName: 'Cadeira Abdutora (Tronco Inclinado)',
    equipmentId: 'seated_abductor_chair',
    equipmentName: 'Cadeira Abdutora de Placas',
    movementPattern: 'Abdução do quadril abrindo as pernas contra almofadas externas',
    animationId: 'abductor',
    muscleMapId: 'glutes_medius_minimus',
    primaryMuscles: ['Glúteo Médio', 'Glúteo Mínimo'],
    secondaryMuscles: ['Tensor da Fáscia Lata', 'Piriforme'],
    animationStatus: 'verified',
    machineVisualType: 'seated_abductor_chair',
    description: 'Atleta sentado com tronco levemente inclinado abrindo os joelhos lateralmente contra as placas.'
  },
  'chest-1': {
    exerciseId: 'chest-1',
    exerciseName: 'Supino Reto (Barra ou Halteres)',
    equipmentId: 'flat_barbell_bench',
    equipmentName: 'Banco de Supino Reto com Barra Olímpica',
    movementPattern: 'Empurrar horizontal perpendicular ao tronco em banco plano',
    animationId: 'benchpress',
    muscleMapId: 'chest_pectoralis_major',
    primaryMuscles: ['Peitoral Maior (Porção Esternocostal)'],
    secondaryMuscles: ['Deltoide Anterior', 'Tríceps Braquial'],
    animationStatus: 'verified',
    machineVisualType: 'flat_barbell_bench',
    description: 'Atleta deitado de costas no banco reto empurrando a barra olímpica verticalmente.'
  },
  'chest-2': {
    exerciseId: 'chest-2',
    exerciseName: 'Supino Inclinado com Halteres',
    equipmentId: 'incline_chest_bench',
    equipmentName: 'Banco Inclinado a 30° ou 45° + Halteres',
    movementPattern: 'Empurrar no plano inclinado com foco na porção superior do peito',
    animationId: 'inclineBench',
    muscleMapId: 'chest_clavicular_head',
    primaryMuscles: ['Peitoral Maior (Porção Clavicular Superior)'],
    secondaryMuscles: ['Deltoide Anterior', 'Tríceps Braquial'],
    animationStatus: 'verified',
    machineVisualType: 'incline_chest_bench',
    description: 'Banco inclinado a 30°-45° com atleta empurrando halteres em trajetória convergente.'
  },
  'chest-3': {
    exerciseId: 'chest-3',
    exerciseName: 'Crucifixo / Peck Deck (Voador)',
    equipmentId: 'peck_deck_fly_machine',
    equipmentName: 'Máquina Peck Deck (Voador Peitoral)',
    movementPattern: 'Adução horizontal dos ombros trazendo os braços em arco para frente do tórax',
    animationId: 'fly',
    muscleMapId: 'chest_isolated_fly',
    primaryMuscles: ['Peitoral Maior (Fibras Esternais)'],
    secondaryMuscles: ['Deltoide Anterior'],
    animationStatus: 'verified',
    machineVisualType: 'peck_deck_fly_machine',
    description: 'Braços abertos em arco fechando à frente do tórax com as mãos se aproximando no centro.'
  }
};

/**
 * Recupera os metadados canônicos de um exercício pela ID ou chave de animação
 */
export function getAnimationRegistryItem(
  exerciseIdOrKey: string
): AnimationRegistryItem | null {
  // 1. Busca por ID direto (ex: 'sh-2', 'leg-1')
  if (ANIMATION_REGISTRY[exerciseIdOrKey]) {
    return ANIMATION_REGISTRY[exerciseIdOrKey];
  }

  // 2. Busca por chave de animação (ex: 'lateralRaise', 'squat')
  const foundByKey = Object.values(ANIMATION_REGISTRY).find(
    (item) => item.animationId === exerciseIdOrKey
  );
  if (foundByKey) return foundByKey;

  // 3. Busca por nome do exercício
  const cleanInput = exerciseIdOrKey.toLowerCase().trim();
  const foundByName = Object.values(ANIMATION_REGISTRY).find((item) =>
    item.exerciseName.toLowerCase().includes(cleanInput)
  );
  if (foundByName) return foundByName;

  return null;
}

/**
 * Retorna todos os exercícios do registro
 */
export function getAllRegistryItems(): AnimationRegistryItem[] {
  return Object.values(ANIMATION_REGISTRY);
}
