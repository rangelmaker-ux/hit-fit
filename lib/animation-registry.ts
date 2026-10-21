/**
 * HIT-FIT 2.0 | Registro Canônico de Mapeamento de Equipamentos, Variantes e Biomecânica
 *
 * Cada equipamento e variante possui identidade unívoca:
 * - variantId: Identificador estável permanente da variante (ex: 'sh-1-dumbbells', 'sh-1-machine')
 * - exerciseId: Identificador do exercício-mãe (ex: 'sh-1', 'sh-2')
 * - exerciseName: Nome descritivo da variante
 * - equipmentName: Nome do aparelho físico
 * - equipmentCategory: Categoria biomecânica do equipamento
 * - animationKey: Chave de renderização vetorial SVG dedicada
 * - machineVisualType: Identificador visual do aparelho
 * - movementPattern: Padrão biomecânico do movimento
 * - primaryMuscles: Agonistas primários
 * - secondaryMuscles: Sinergistas
 * - animationStatus: 'verified' | 'in_preparation'
 */

export type AnimationStatus = 'verified' | 'in_preparation';

export interface EquipmentVariantMeta {
  variantId: string;
  exerciseId: string;
  exerciseName: string;
  equipmentName: string;
  equipmentCategory?:
    | 'free_weights'
    | 'cable_pulley'
    | 'selectorized_machine'
    | 'plate_loaded'
    | 'smith_machine'
    | 'bodyweight';
  movementPattern: string;
  animationKey: string;
  machineVisualType: string;
  animationStatus: AnimationStatus;
  description: string;
  settingTips?: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  animationId?: string;
  equipmentId?: string;
  muscleMapId?: string;
  targetMuscle?: string;
  activeBodyParts?: {
    front: string[];
    back: string[];
  };
  sets?: number;
  reps?: string;
  restSeconds?: number;
}

export const VARIANT_REGISTRY: Record<string, EquipmentVariantMeta> = {
  // ==========================================================================
  // SEGUNDA-FEIRA: PERNA COMPLETA
  // ==========================================================================
  'leg-1-smith': {
    variantId: 'leg-1-smith',
    exerciseId: 'leg-1',
    exerciseName: 'Agachamento no Smith Machine',
    equipmentName: 'Smith Machine (Barra Guiada)',
    equipmentCategory: 'smith_machine',
    movementPattern: 'Flexão/extensão tripla guiada em trilho vertical',
    animationKey: 'squatSmith',
    machineVisualType: 'smith_machine',
    animationStatus: 'verified',
    description: 'Barra guiada sobre trilhos verticais com travas de segurança.',
    settingTips: 'Posicione as travas de segurança na altura do quadril agachado.',
    primaryMuscles: ['Quadríceps', 'Glúteo Máximo'],
    secondaryMuscles: ['Isquiotibiais', 'Panturrilha']
  },
  'leg-1-free-bar': {
    variantId: 'leg-1-free-bar',
    exerciseId: 'leg-1',
    exerciseName: 'Rack de Agachamento Livre',
    equipmentName: 'Rack de Agachamento Livre com Barra Olímpica',
    equipmentCategory: 'free_weights',
    movementPattern: 'Agachamento livre com equilíbrio e estabilização de core',
    animationKey: 'squatFree',
    machineVisualType: 'free_barbell_rack',
    animationStatus: 'verified',
    description: 'Barra olímpica livre sobre os ombros em suporte aberto.',
    settingTips: 'Apoie a barra sobre os trapézios médios e trave os cotovelos para baixo.',
    primaryMuscles: ['Quadríceps', 'Glúteo Máximo'],
    secondaryMuscles: ['Eretores da Espinha', 'Core']
  },
  'leg-1-hack': {
    variantId: 'leg-1-hack',
    exerciseId: 'leg-1',
    exerciseName: 'Hack Squat 45°',
    equipmentName: 'Máquina Hack Squat Inclinada',
    equipmentCategory: 'plate_loaded',
    movementPattern: 'Agachamento inclinado com encosto e suporte nos ombros',
    animationKey: 'hackSquat',
    machineVisualType: 'hack_squat_45',
    animationStatus: 'verified',
    description: 'Trenó Hack inclinado a 45° com apoio de costas e ombro.',
    settingTips: 'Mantenha os pés no centro da plataforma para ênfase em quadríceps.',
    primaryMuscles: ['Quadríceps (Vastos)'],
    secondaryMuscles: ['Glúteo Máximo']
  },

  'leg-2-45': {
    variantId: 'leg-2-45',
    exerciseId: 'leg-2',
    exerciseName: 'Leg Press 45° de Anilhas',
    equipmentName: 'Leg Press 45° de Anilhas',
    equipmentCategory: 'plate_loaded',
    movementPattern: 'Extensão de quadril e joelhos empurrando trenó a 45°',
    animationKey: 'legpress45',
    machineVisualType: 'leg_press_45',
    animationStatus: 'verified',
    description: 'Trenó diagonal deslizando em trilho inclinado.',
    settingTips: 'Encosto regulado para não descolar a lombar na descida.',
    primaryMuscles: ['Quadríceps', 'Glúteo Máximo'],
    secondaryMuscles: ['Adutores', 'Isquiotibiais']
  },
  'leg-2-horizontal': {
    variantId: 'leg-2-horizontal',
    exerciseId: 'leg-2',
    exerciseName: 'Leg Press Horizontal com Placas',
    equipmentName: 'Leg Press Horizontal Sentado',
    equipmentCategory: 'selectorized_machine',
    movementPattern: 'Empurrada horizontal em linha reta a 0° contra placas',
    animationKey: 'legpressHorizontal',
    machineVisualType: 'horizontal_leg_press',
    animationStatus: 'verified',
    description: 'Banco deslizante sentado com plataforma vertical fixa.',
    settingTips: 'Ajuste a distância do banco para iniciar em flexão de 90° de joelho.',
    primaryMuscles: ['Quadríceps'],
    secondaryMuscles: ['Glúteos']
  },

  'leg-3-bilateral': {
    variantId: 'leg-3-bilateral',
    exerciseId: 'leg-3',
    exerciseName: 'Cadeira Extensora Tradicional',
    equipmentName: 'Cadeira Extensora Tradicional',
    equipmentCategory: 'selectorized_machine',
    movementPattern: 'Extensão bilateral isolada de joelhos',
    animationKey: 'legextBilateral',
    machineVisualType: 'leg_extension_chair',
    animationStatus: 'verified',
    description: 'Cadeira com encosto e rolete acolchoado sobre as canelas.',
    settingTips: 'Alinhe o eixo de rotação da máquina com a articulação do joelho.',
    primaryMuscles: ['Quadríceps (Reto Femoral, Vastos)'],
    secondaryMuscles: []
  },
  'leg-3-cable-unilateral': {
    variantId: 'leg-3-cable-unilateral',
    exerciseId: 'leg-3',
    exerciseName: 'Extensora Unilateral no Cabo',
    equipmentName: 'Polia Baixa com Tornozeleira',
    equipmentCategory: 'cable_pulley',
    movementPattern: 'Extensão unilateral de joelho com resistência de cabo',
    animationKey: 'legextCable',
    machineVisualType: 'cable_unilateral_ext',
    animationStatus: 'verified',
    description: 'Cabo baixo com tornozeleira em pé estendendo a perna à frente.',
    settingTips: 'Posicione a polia na altura do tornozelo e segure no suporte da torre.',
    primaryMuscles: ['Quadríceps (Unilateral)'],
    secondaryMuscles: []
  },

  'leg-4-prone': {
    variantId: 'leg-4-prone',
    exerciseId: 'leg-4',
    exerciseName: 'Mesa Flexora (Deitado)',
    equipmentName: 'Mesa Flexora Prone',
    equipmentCategory: 'selectorized_machine',
    movementPattern: 'Flexão isolada de joelhos em decúbito ventral',
    animationKey: 'legcurlProne',
    machineVisualType: 'prone_leg_curl',
    animationStatus: 'verified',
    description: 'Banco horizontal onde o atleta deita de bruços e flexiona os calcanhares.',
    settingTips: 'Rolete posicionado 3 dedos acima do tendão de Aquiles.',
    targetMuscle: 'Isquiotibiais (Posterior de Coxa)',
    primaryMuscles: ['Isquiotibiais'],
    secondaryMuscles: ['Gastrocnêmio'],
    activeBodyParts: {
      front: [],
      back: ['hamstrings']
    },
    reps: '12',
    restSeconds: 50
  },
  'leg-4-seated': {
    variantId: 'leg-4-seated',
    exerciseId: 'leg-4',
    exerciseName: 'Cadeira Flexora Sentada',
    equipmentName: 'Cadeira Flexora Sentada',
    equipmentCategory: 'selectorized_machine',
    movementPattern: 'Flexão de joelhos sentado com trava superior na coxa',
    animationKey: 'legcurlSeated',
    machineVisualType: 'seated_leg_curl',
    animationStatus: 'verified',
    description: 'Aparelho sentado com rolete descendo sob as panturrilhas.',
    settingTips: 'Aperte a trava sobre as coxas para impedir que o quadril levante.',
    targetMuscle: 'Isquiotibiais (Encurtamento Sentado)',
    primaryMuscles: ['Isquiotibiais'],
    secondaryMuscles: ['Gastrocnêmio'],
    activeBodyParts: {
      front: [],
      back: ['hamstrings']
    },
    reps: '12',
    restSeconds: 50
  },
  'leg-4-stiff': {
    variantId: 'leg-4-stiff',
    exerciseId: 'leg-4',
    exerciseName: 'Stiff com Halteres',
    equipmentName: 'Par de Halteres Emborrachados',
    equipmentCategory: 'free_weights',
    movementPattern: 'Flexão de quadril com pernas estendidas e halteres rente às canelas',
    animationKey: 'stiffDumbbell',
    machineVisualType: 'standing_dumbbells_stiff',
    animationStatus: 'verified',
    description: 'Exercício livre com halteres descendo com quadril empurrado para trás.',
    settingTips: 'Mantenha a coluna reta e sinta o alongamento forte no posterior.',
    targetMuscle: 'Isquiotibiais & Glúteo Máximo',
    primaryMuscles: ['Isquiotibiais', 'Glúteo Máximo'],
    secondaryMuscles: ['Glúteo Máximo', 'Eretores da Espinha', 'Antebraço'],
    activeBodyParts: {
      front: [],
      back: ['hamstrings', 'glutes', 'lowerback']
    },
    reps: '10 - 12',
    restSeconds: 60
  },

  'leg-5-standing': {
    variantId: 'leg-5-standing',
    exerciseId: 'leg-5',
    exerciseName: 'Gêmeos em Pé na Máquina',
    equipmentName: 'Máquina de Panturrilha em Pé',
    equipmentCategory: 'selectorized_machine',
    movementPattern: 'Flexão plantar com apoio nos ombros em degrau',
    animationKey: 'calfStanding',
    machineVisualType: 'standing_calf_machine',
    animationStatus: 'verified',
    description: 'Apoio nos ombros com antepés no degrau para amplitude máxima.',
    settingTips: 'Desça os calcanhares abaixo da linha do degrau para alongamento profundo.',
    primaryMuscles: ['Gastrocnêmio', 'Sóleo'],
    secondaryMuscles: []
  },
  'leg-5-legpress': {
    variantId: 'leg-5-legpress',
    exerciseId: 'leg-5',
    exerciseName: 'Panturrilha no Leg Press',
    equipmentName: 'Plataforma do Leg Press 45°',
    equipmentCategory: 'plate_loaded',
    movementPattern: 'Flexão plantar com pontas dos pés na borda do trenó a 45°',
    animationKey: 'calfLegPress',
    machineVisualType: 'legpress_calf',
    animationStatus: 'verified',
    description: 'Atleta sentado no Leg Press empurrando com a ponta dos pés.',
    settingTips: 'Mantenha a trava de segurança engatada num nível seguro.',
    primaryMuscles: ['Gastrocnêmio'],
    secondaryMuscles: ['Sóleo']
  },
  'leg-5-seated': {
    variantId: 'leg-5-seated',
    exerciseId: 'leg-5',
    exerciseName: 'Gêmeos Sentado (Cavalinho)',
    equipmentName: 'Máquina de Panturrilha Sentado (Cavalinho)',
    equipmentCategory: 'selectorized_machine',
    movementPattern: 'Flexão plantar com joelhos flexionados a 90° com foco no sóleo',
    animationKey: 'calfSeated',
    machineVisualType: 'seated_calf_machine',
    animationStatus: 'verified',
    description: 'Banco com trava sobre os joelhos com foco no sóleo.',
    settingTips: 'Ajuste a almofada firmemente acima dos joelhos antes de destravar o peso.',
    primaryMuscles: ['Sóleo', 'Gastrocnêmio'],
    secondaryMuscles: ['Tendão de Aquiles']
  },

  // ==========================================================================
  // TERÇA-FEIRA: COSTAS, BÍCEPS & CORE
  // ==========================================================================
  'back-1-wide': {
    variantId: 'back-1-wide',
    exerciseId: 'back-1',
    exerciseName: 'Puxada Frontal Barra Aberta',
    equipmentName: 'Polia Alta (Pulley) com Barra Curva',
    equipmentCategory: 'cable_pulley',
    movementPattern: 'Tração vertical com pegada aberta pronada até a clavícula',
    animationKey: 'pulldownWide',
    machineVisualType: 'high_pulley_lat',
    animationStatus: 'verified',
    description: 'Barra curva de pegada ampla puxada em direção ao tórax superior.',
    settingTips: 'Ajuste a almofada sobre as coxas para travar o quadril.',
    primaryMuscles: ['Latíssimo do Dorso'],
    secondaryMuscles: ['Bíceps', 'Redondo Maior']
  },
  'back-1-close-triangle': {
    variantId: 'back-1-close-triangle',
    exerciseId: 'back-1',
    exerciseName: 'Puxada com Triângulo (Pegada Neutra)',
    equipmentName: 'Polia Alta com Puxador Triângulo',
    equipmentCategory: 'cable_pulley',
    movementPattern: 'Tração vertical fechada convergindo no centro do peito',
    animationKey: 'pulldownClose',
    machineVisualType: 'pulldown_triangle',
    animationStatus: 'verified',
    description: 'Puxador triângulo fechado permitindo pegada neutra e maior amplitude.',
    settingTips: 'Puxe focando em levar os cotovelos para baixo e para trás.',
    primaryMuscles: ['Latíssimo do Dorso', 'Braquial'],
    secondaryMuscles: ['Bíceps']
  },
  'back-1-graviton': {
    variantId: 'back-1-graviton',
    exerciseId: 'back-1',
    exerciseName: 'Barra Fixa com Graviton (ou Elástico)',
    equipmentName: 'Aparelho Graviton com Plataforma de Contrapeso',
    equipmentCategory: 'selectorized_machine',
    movementPattern: 'Tração vertical em suspensão com suporte de contrapeso',
    animationKey: 'gravitonPullup',
    machineVisualType: 'graviton_pullup',
    animationStatus: 'verified',
    description: 'Barra fixa assistida com plataforma móvel para redução do peso corporal.',
    settingTips: 'Selecione a carga de auxílio adequada e suba com os joelhos na almofada.',
    primaryMuscles: ['Latíssimo do Dorso'],
    secondaryMuscles: ['Bíceps', 'Braquiorradial']
  },

  'back-2-seated-cable': {
    variantId: 'back-2-seated-cable',
    exerciseId: 'back-2',
    exerciseName: 'Remada Sentada no Cabo (Polia Baixa)',
    equipmentName: 'Remada Baixa no Triângulo',
    equipmentCategory: 'cable_pulley',
    movementPattern: 'Tração horizontal rente ao abdômen com retração escapular',
    animationKey: 'cableRowSeated',
    machineVisualType: 'low_pulley_row',
    animationStatus: 'verified',
    description: 'Banco reto baixo com apoio nos pés e cabo tracionando no umbigo.',
    settingTips: 'Mantenha os joelhos semiflexionados e peito aberto.',
    primaryMuscles: ['Rombóides', 'Trapézio Médio', 'Latíssimo do Dorso'],
    secondaryMuscles: ['Bíceps']
  },
  'back-2-tbar': {
    variantId: 'back-2-tbar',
    exerciseId: 'back-2',
    exerciseName: 'Remada Cavalinho (T-Bar)',
    equipmentName: 'Barra em T Fixada no Solo com Anilhas',
    equipmentCategory: 'plate_loaded',
    movementPattern: 'Remada curvada no solo com pegada neutra na barra T',
    animationKey: 'tbarRow',
    machineVisualType: 't_bar_row_floor',
    animationStatus: 'verified',
    description: 'Barra em T inclinada no solo com anilhas e pegador duplo.',
    settingTips: 'Trave a lombar a 45° sem arredondar a coluna durante a puxada.',
    primaryMuscles: ['Miolo das Costas', 'Rombóides'],
    secondaryMuscles: ['Eretores da Espinha', 'Bíceps']
  },
  'back-2-machine': {
    variantId: 'back-2-machine',
    exerciseId: 'back-2',
    exerciseName: 'Remada Máquina Articulada',
    equipmentName: 'Máquina de Remada Articulada com Apoio Peitoral',
    equipmentCategory: 'selectorized_machine',
    movementPattern: 'Remada horizontal com peito apoiado sem sobrecarga lombar',
    animationKey: 'chestSupportedRowMachine',
    machineVisualType: 'chest_supported_row',
    animationStatus: 'verified',
    description: 'Aparelho com apoio peitoral que elimina a carga na lombar.',
    settingTips: 'Ajuste a altura do banco para que os pegadores fiquem na linha do peito.',
    primaryMuscles: ['Rombóides', 'Trapézio Médio', 'Latíssimo do Dorso'],
    secondaryMuscles: ['Bíceps']
  },

  'back-3-dumbbell': {
    variantId: 'back-3-dumbbell',
    exerciseId: 'back-3',
    exerciseName: 'Remada Unilateral com Halter (Serrote)',
    equipmentName: 'Banco Reto + Halter Livre',
    equipmentCategory: 'free_weights',
    movementPattern: 'Puxada sagital unilateral com 3 pontos de apoio no banco',
    animationKey: 'singleArmRowDumbbell',
    machineVisualType: 'flat_bench_single_dumbbell',
    animationStatus: 'verified',
    description: 'Atleta inclinado com apoio de joelho e mão no banco reto.',
    settingTips: 'Puxe o halter em direção ao bolso da calça sem girar o tronco.',
    primaryMuscles: ['Latíssimo do Dorso'],
    secondaryMuscles: ['Redondo Maior', 'Bíceps']
  },
  'back-3-cable': {
    variantId: 'back-3-cable',
    exerciseId: 'back-3',
    exerciseName: 'Remada Unilateral na Polia Baixa',
    equipmentName: 'Polia Baixa com Puxador Estribo',
    equipmentCategory: 'cable_pulley',
    movementPattern: 'Puxada unilateral contínua na polia baixa com estribo',
    animationKey: 'singleArmRowCable',
    machineVisualType: 'cable_single_arm_row',
    animationStatus: 'verified',
    description: 'Atleta puxando cabo da polia baixa com tensão uniforme em todo o arco.',
    settingTips: 'Foque em apertar a escápula para trás no final do movimento.',
    primaryMuscles: ['Latíssimo do Dorso'],
    secondaryMuscles: ['Bíceps', 'Core']
  },

  'back-4-wbar': {
    variantId: 'back-4-wbar',
    exerciseId: 'back-4',
    exerciseName: 'Rosca Direta com Barra W',
    equipmentName: 'Barra W Olímpica ou Montada',
    equipmentCategory: 'free_weights',
    movementPattern: 'Flexão pura dos cotovelos com pegada semi-supinada anatômica',
    animationKey: 'bicepsWBar',
    machineVisualType: 'w_bar_biceps',
    animationStatus: 'verified',
    description: 'Atleta em pé com barra W flexionando os braços sem balançar o tronco.',
    settingTips: 'Mantenha os cotovelos fixados na lateral das costelas.',
    primaryMuscles: ['Bíceps Braquial'],
    secondaryMuscles: ['Braquial']
  },
  'back-4-cable': {
    variantId: 'back-4-cable',
    exerciseId: 'back-4',
    exerciseName: 'Rosca no Cabo com Barra Reta',
    equipmentName: 'Polia Baixa com Barra Reta Curta',
    equipmentCategory: 'cable_pulley',
    movementPattern: 'Flexão de cotovelos com cabo baixo mantendo tensão constante no topo',
    animationKey: 'bicepsCable',
    machineVisualType: 'low_pulley_biceps',
    animationStatus: 'verified',
    description: 'Cabo baixo tracionando a barra curta com resistência contínua.',
    settingTips: 'Dê um pequeno passo para trás para o cabo não encostar na polia.',
    primaryMuscles: ['Bíceps Braquial'],
    secondaryMuscles: ['Braquiorradial']
  },
  'back-4-dumbbells': {
    variantId: 'back-4-dumbbells',
    exerciseId: 'back-4',
    exerciseName: 'Rosca com Halteres Alternada',
    equipmentName: 'Par de Halteres com Supinação',
    equipmentCategory: 'free_weights',
    movementPattern: 'Flexão de cotovelos com rotação de punho (supinação) para pico do bíceps',
    animationKey: 'bicepsAlternatingDumbbell',
    machineVisualType: 'alternating_dumbbells',
    animationStatus: 'verified',
    description: 'Atleta flexionando halteres alternadamente girando as palmas para cima no topo.',
    settingTips: 'Gire o punho trazendo o mindinho em direção ao ombro.',
    primaryMuscles: ['Bíceps Braquial'],
    secondaryMuscles: ['Braquial', 'Antebraço']
  },

  'back-5-dumbbells': {
    variantId: 'back-5-dumbbells',
    exerciseId: 'back-5',
    exerciseName: 'Rosca Martelo com Halteres',
    equipmentName: 'Par de Halteres Emborrachados',
    equipmentCategory: 'free_weights',
    movementPattern: 'Flexão de cotovelos com punhos em posição neutra vertical',
    animationKey: 'hammerDumbbell',
    machineVisualType: 'neutral_dumbbells',
    animationStatus: 'verified',
    description: 'Halteres verticais subindo sem rotação de punho para braquial e antebraço.',
    settingTips: 'Controle a descida em 3 segundos sem balançar os ombros.',
    primaryMuscles: ['Braquial', 'Braquiorradial'],
    secondaryMuscles: ['Bíceps Braquial']
  },
  'back-5-rope': {
    variantId: 'back-5-rope',
    exerciseId: 'back-5',
    exerciseName: 'Rosca Martelo na Corda (Polia Baixa)',
    equipmentName: 'Polia Baixa com Puxador Corda',
    equipmentCategory: 'cable_pulley',
    movementPattern: 'Flexão de cotovelos em pegada neutra na corda com tensão constante',
    animationKey: 'hammerRopeCable',
    machineVisualType: 'rope_hammer_curl',
    animationStatus: 'verified',
    description: 'Corda conectada na polia baixa mantendo as mãos na vertical.',
    settingTips: 'Mantenha os cotovelos travados na lateral do tronco.',
    primaryMuscles: ['Braquial', 'Braquiorradial'],
    secondaryMuscles: ['Bíceps Braquial']
  },

  'back-6-floor': {
    variantId: 'back-6-floor',
    exerciseId: 'back-6',
    exerciseName: 'Prancha Isométrica no Solo',
    equipmentName: 'Colchonete / Solo',
    equipmentCategory: 'bodyweight',
    movementPattern: 'Contração isométrica de estabilização do core em linha reta',
    animationKey: 'plankFloor',
    machineVisualType: 'isometric_floor_mat',
    animationStatus: 'verified',
    description: 'Corpo reto estático apoiado sobre antebraços e pontas dos pés.',
    settingTips: 'Puxe o umbigo para dentro e contraia os glúteos.',
    targetMuscle: 'Reto Abdominal & Core Profundo',
    primaryMuscles: ['Reto Abdominal', 'Transverso do Abdômen'],
    secondaryMuscles: ['Transverso abdominal', 'Lombar', 'Glúteos'],
    activeBodyParts: {
      front: ['abs'],
      back: ['lowerback']
    },
    reps: '45s Prancha + 15 Infra',
    restSeconds: 45
  },
  'back-6-ball': {
    variantId: 'back-6-ball',
    exerciseId: 'back-6',
    exerciseName: 'Abdominal na Bola Suíça',
    equipmentName: 'Bola Suíça (Fitball)',
    equipmentCategory: 'bodyweight',
    movementPattern: 'Flexão de tronco com apoio lombar na curvatura da bola para maior amplitude',
    animationKey: 'swissBallCrunch',
    machineVisualType: 'swiss_ball_core',
    animationStatus: 'verified',
    description: 'Apoio da região lombar sobre a curvatura da bola com pés firmes no chão.',
    settingTips: 'Deite com a lombar encaixada no centro da bola e contraia o abdômen ao subir.',
    targetMuscle: 'Reto Abdominal (Isolamento Anterior)',
    primaryMuscles: ['Reto Abdominal'],
    secondaryMuscles: ['Oblíquos', 'Transverso do Abdômen'],
    activeBodyParts: {
      front: ['abs'],
      back: []
    },
    reps: '15 - 20',
    restSeconds: 45
  },

  // ==========================================================================
  // QUARTA-FEIRA: OMBROS & TRÍCEPS (Equipamentos Diferenciados!)
  // ==========================================================================
  'sh-1-dumbbells': {
    variantId: 'sh-1-dumbbells',
    exerciseId: 'sh-1',
    exerciseName: 'Desenvolvimento com Halteres no Banco',
    equipmentName: 'Banco Regulável a 75°/80° + Halteres Livres',
    equipmentCategory: 'free_weights',
    movementPattern: 'Pressão overhead vertical com dois halteres livres',
    animationKey: 'shoulderPressDumbbell',
    machineVisualType: 'incline_bench_dumbbells',
    animationStatus: 'verified',
    description: 'Banco inclinado a 75°-80° com atleta empurrando halteres livres para o alto.',
    settingTips: 'Mantenha os cotovelos a 45° à frente do corpo e não bata os halteres.',
    primaryMuscles: ['Deltoide Anterior', 'Deltoide Médio'],
    secondaryMuscles: ['Tríceps Braquial']
  },
  'sh-1-machine': {
    variantId: 'sh-1-machine',
    exerciseId: 'sh-1',
    exerciseName: 'Desenvolvimento em Máquina Articulada',
    equipmentName: 'Máquina Articulada de Desenvolvimento de Ombros',
    equipmentCategory: 'plate_loaded',
    movementPattern: 'Pressão vertical convergente em alavancas mecânicas guiadas',
    animationKey: 'shoulderPressMachine',
    machineVisualType: 'articulated_shoulder_press',
    animationStatus: 'verified',
    description: 'Aparelho com alavancas independentes guiadas em trajetória convergente.',
    settingTips: 'Ajuste a altura do banco para as manoplas iniciarem na altura das orelhas.',
    primaryMuscles: ['Deltoide Anterior', 'Deltoide Lateral'],
    secondaryMuscles: ['Tríceps Braquial']
  },
  'sh-1-smith': {
    variantId: 'sh-1-smith',
    exerciseId: 'sh-1',
    exerciseName: 'Desenvolvimento no Smith Machine',
    equipmentName: 'Smith Machine com Banco 80°',
    equipmentCategory: 'smith_machine',
    movementPattern: 'Pressão vertical overhead guiada em trilhos com barra contínua',
    animationKey: 'shoulderPressSmith',
    machineVisualType: 'smith_shoulder_press',
    animationStatus: 'verified',
    description: 'Barra guiada no Smith descendo na linha do queixo/nariz.',
    settingTips: 'Posicione o banco ligeiramente atrás da linha vertical da barra.',
    primaryMuscles: ['Deltoide Anterior'],
    secondaryMuscles: ['Tríceps', 'Trapézio Superior']
  },

  'sh-2-cables': {
    variantId: 'sh-2-cables',
    exerciseId: 'sh-2',
    exerciseName: 'Elevação Lateral no Cabo / Polia Baixa',
    equipmentName: 'Cross Over / Polia Baixa com Estribos',
    equipmentCategory: 'cable_pulley',
    movementPattern: 'Abdução de ombro até 90° tracionando cabos cruzados',
    animationKey: 'lateralRaiseCable',
    machineVisualType: 'cable_lateral_raise',
    animationStatus: 'verified',
    description: 'Cabos cruzados saindo da base com tensão constante desde o início.',
    settingTips: 'Passe o cabo por trás do corpo e suba até a linha do ombro.',
    primaryMuscles: ['Deltoide Lateral (Cabeça Média)'],
    secondaryMuscles: ['Supraespinhal']
  },
  'sh-2-dumbbells': {
    variantId: 'sh-2-dumbbells',
    exerciseId: 'sh-2',
    exerciseName: 'Elevação Lateral com Halteres',
    equipmentName: 'Par de Halteres Livres',
    equipmentCategory: 'free_weights',
    movementPattern: 'Abdução pura de braços em "T" com halteres livres sem cabos',
    animationKey: 'lateralRaiseDumbbell',
    machineVisualType: 'free_dumbbell_lateral_raise',
    animationStatus: 'verified',
    description: 'Atleta em pé elevando halteres lateralmente até 90° liderando pelos cotovelos.',
    settingTips: 'Incline o tronco levemente para a frente (5°) para isolar a cabeça lateral.',
    primaryMuscles: ['Deltoide Lateral'],
    secondaryMuscles: ['Trapézio Superior']
  },
  'sh-2-machine': {
    variantId: 'sh-2-machine',
    exerciseId: 'sh-2',
    exerciseName: 'Máquina de Elevação Lateral Sentado',
    equipmentName: 'Máquina Específica de Deltoide Lateral',
    equipmentCategory: 'selectorized_machine',
    movementPattern: 'Abdução de ombros com almofadas de cotovelo em alavancas guiadas',
    animationKey: 'lateralRaiseMachine',
    machineVisualType: 'seated_lateral_machine',
    animationStatus: 'verified',
    description: 'Aparelho sentado com apoios almofadados sob os cotovelos elevando alavancas.',
    settingTips: 'Alinhe o pivô da máquina com a lateral da cabeça do seu ombro.',
    primaryMuscles: ['Deltoide Lateral'],
    secondaryMuscles: []
  },

  'sh-3-peck-deck': {
    variantId: 'sh-3-peck-deck',
    exerciseId: 'sh-3',
    exerciseName: 'Crucifixo Inverso no Peck Deck',
    equipmentName: 'Máquina Peck Deck Invertida (Voador Inverso)',
    equipmentCategory: 'selectorized_machine',
    movementPattern: 'Abdução horizontal de ombros empurrando alavancas para trás',
    animationKey: 'rearDeltPeckDeck',
    machineVisualType: 'rear_delt_peck_deck',
    animationStatus: 'verified',
    description: 'Atleta sentado de frente para o encosto abrindo os braços para trás.',
    settingTips: 'Mantenha as manoplas na altura exata dos ombros.',
    primaryMuscles: ['Deltoide Posterior'],
    secondaryMuscles: ['Rombóides', 'Trapézio Médio']
  },
  'sh-3-facepull': {
    variantId: 'sh-3-facepull',
    exerciseId: 'sh-3',
    exerciseName: 'Face Pull na Corda (Polia Alta)',
    equipmentName: 'Polia Alta com Acessório Corda',
    equipmentCategory: 'cable_pulley',
    movementPattern: 'Puxada ao nível dos olhos afastando as pontas da corda',
    animationKey: 'facepullCable',
    machineVisualType: 'high_pulley_rope_facepull',
    animationStatus: 'verified',
    description: 'Polia alta com corda sendo puxada em direção aos olhos com cotovelos altos.',
    settingTips: 'Foque na rotação externa dos ombros no final da puxada.',
    primaryMuscles: ['Deltoide Posterior', 'Manguito Rotador'],
    secondaryMuscles: ['Trapézio Superior']
  },
  'sh-3-dumbbells': {
    variantId: 'sh-3-dumbbells',
    exerciseId: 'sh-3',
    exerciseName: 'Crucifixo Inverso com Halteres',
    equipmentName: 'Par de Halteres Livres',
    equipmentCategory: 'free_weights',
    movementPattern: 'Abdução horizontal curvado com tronco a 45°',
    animationKey: 'rearDeltDumbbell',
    machineVisualType: 'bent_over_dumbbells',
    animationStatus: 'verified',
    description: 'Tronco inclinado com halteres abrindo em cruz para trás.',
    settingTips: 'Não encolha os ombros no pescoço; mantenha as escápulas firmes.',
    primaryMuscles: ['Deltoide Posterior'],
    secondaryMuscles: ['Rombóides']
  },

  'sh-4-rope': {
    variantId: 'sh-4-rope',
    exerciseId: 'sh-4',
    exerciseName: 'Tríceps Corda na Polia Alta',
    equipmentName: 'Polia Alta com Corda Dupla',
    equipmentCategory: 'cable_pulley',
    movementPattern: 'Extensão de cotovelos com afastamento das pontas no final',
    animationKey: 'tricepsRopePushdown',
    machineVisualType: 'high_pulley_rope_triceps',
    animationStatus: 'verified',
    description: 'Cabo superior com corda abrindo para fora na extensão máxima.',
    settingTips: 'Trave os cotovelos nas costelas; só os antebraços se movem.',
    primaryMuscles: ['Tríceps Braquial (Cabeça Lateral)'],
    secondaryMuscles: []
  },
  'sh-4-bar': {
    variantId: 'sh-4-bar',
    exerciseId: 'sh-4',
    exerciseName: 'Tríceps Barra Reta ou V',
    equipmentName: 'Polia Alta com Barra Reta ou V',
    equipmentCategory: 'cable_pulley',
    movementPattern: 'Extensão de cotovelos com pegada rígida em barra',
    animationKey: 'tricepsBarPushdown',
    machineVisualType: 'high_pulley_bar_triceps',
    animationStatus: 'verified',
    description: 'Barra rígida permitindo maior sobrecarga com trajetória fixa para baixo.',
    settingTips: 'Mantenha os punhos firmes sem hiperestender.',
    primaryMuscles: ['Tríceps Braquial'],
    secondaryMuscles: []
  },

  // ==========================================================================
  // QUINTA-FEIRA: GLÚTEOS & POSTERIOR
  // ==========================================================================
  'glute-1-machine': {
    variantId: 'glute-1-machine',
    exerciseId: 'glute-1',
    exerciseName: 'Elevação Pélvica na Máquina Hip Thrust',
    equipmentName: 'Máquina Hip Thrust Dedicada',
    equipmentCategory: 'selectorized_machine',
    movementPattern: 'Extensão terminal de quadril com cinto acolchoado e apoio fixo',
    animationKey: 'hipThrustMachine',
    machineVisualType: 'hip_thrust_machine',
    animationStatus: 'verified',
    description: 'Máquina ergonômica com cinto acolchoado e apoio de costas giratório.',
    settingTips: 'Aperte o cinto firme sobre a crista ilíaca.',
    primaryMuscles: ['Glúteo Máximo'],
    secondaryMuscles: ['Isquiotibiais']
  },
  'glute-1-barbell': {
    variantId: 'glute-1-barbell',
    exerciseId: 'glute-1',
    exerciseName: 'Elevação Pélvica com Barra Livre',
    equipmentName: 'Banco Reto + Barra Olímpica com Espuma',
    equipmentCategory: 'free_weights',
    movementPattern: 'Extensão de quadril com escápulas no banco e barra na pelve',
    animationKey: 'hipThrustBarbell',
    machineVisualType: 'flat_bench_hip_thrust',
    animationStatus: 'verified',
    description: 'Banco livre com barra e protetor espesso de quadril.',
    settingTips: 'Posicione as escápulas na borda do banco e queixo no peito no topo.',
    primaryMuscles: ['Glúteo Máximo'],
    secondaryMuscles: ['Isquiotibiais', 'Eretores da Espinha']
  },
  'glute-1-smith': {
    variantId: 'glute-1-smith',
    exerciseId: 'glute-1',
    exerciseName: 'Elevação Pélvica no Smith Machine',
    equipmentName: 'Smith Machine (Barra Guiada) com Banco Reto',
    equipmentCategory: 'smith_machine',
    movementPattern: 'Extensão de quadril com barra guiada facilitando travar e destravar o peso',
    animationKey: 'hipThrustSmith',
    machineVisualType: 'smith_hip_thrust',
    animationStatus: 'verified',
    description: 'Mais facilidade para travar e destravar o peso sozinho em trilhos guiados.',
    settingTips: 'Posicione as travas de segurança logo abaixo da altura de extensão completa.',
    primaryMuscles: ['Glúteo Máximo'],
    secondaryMuscles: ['Isquiotibiais']
  },

  'glute-2-bulgarian': {
    variantId: 'glute-2-bulgarian',
    exerciseId: 'glute-2',
    exerciseName: 'Agachamento Búlgaro no Banco Reto',
    equipmentName: 'Banco Reto + Halteres Livres',
    equipmentCategory: 'free_weights',
    movementPattern: 'Agachamento unilateral com pé traseiro elevado no banco',
    animationKey: 'bulgarianSplitSquat',
    machineVisualType: 'bulgarian_split_bench',
    animationStatus: 'verified',
    description: 'Posição afundo com peito do pé no banco e joelho dianteiro descendo a 90°.',
    settingTips: 'Dê um passo longo para frente para enfatizar o glúteo.',
    targetMuscle: 'Glúteo Máximo & Quadríceps',
    primaryMuscles: ['Glúteo Máximo', 'Quadríceps'],
    secondaryMuscles: ['Adutores', 'Posterior de Coxa'],
    activeBodyParts: {
      front: ['quads'],
      back: ['glutes']
    },
    reps: '10 cada perna',
    restSeconds: 60
  },
  'glute-2-sumo': {
    variantId: 'glute-2-sumo',
    exerciseId: 'glute-2',
    exerciseName: 'Agachamento Sumô no Step com Halter',
    equipmentName: 'Steps Paralelos + Halter Central Pesado',
    equipmentCategory: 'free_weights',
    movementPattern: 'Agachamento amplo com pés rodados para fora descendo halter no centro',
    animationKey: 'sumoSquatStep',
    machineVisualType: 'sumo_step_squat',
    animationStatus: 'verified',
    description: 'Pés afastados sobre dois steps permitindo amplitude profunda do halter.',
    settingTips: 'Joelhos apontam exatamente na direção da ponta dos pés.',
    targetMuscle: 'Glúteo Máximo & Adutores da Coxa',
    primaryMuscles: ['Glúteo Máximo', 'Adutores da Coxa'],
    secondaryMuscles: ['Quadríceps', 'Isquiotibiais'],
    activeBodyParts: {
      front: ['quads', 'adductors'],
      back: ['glutes']
    },
    reps: '12 - 15',
    restSeconds: 60
  },

  'glute-3-machine': {
    variantId: 'glute-3-machine',
    exerciseId: 'glute-3',
    exerciseName: 'Cadeira Abdutora de Placas',
    equipmentName: 'Cadeira Abdutora de Placas',
    equipmentCategory: 'selectorized_machine',
    movementPattern: 'Abdução de quadril contra almofadas laterais externas',
    animationKey: 'seatedAbductorMachine',
    machineVisualType: 'seated_abductor_chair',
    animationStatus: 'verified',
    description: 'Atleta sentado abrindo os joelhos lateralmente contra a carga de placas.',
    settingTips: 'Incline o tronco levemente para a frente para ativar o glúteo médio.',
    primaryMuscles: ['Glúteo Médio', 'Glúteo Mínimo'],
    secondaryMuscles: ['Tensor da Fáscia Lata']
  },
  'glute-3-cable': {
    variantId: 'glute-3-cable',
    exerciseId: 'glute-3',
    exerciseName: 'Abdução de Quadril na Polia Baixa',
    equipmentName: 'Polia Baixa com Tornozeleira',
    equipmentCategory: 'cable_pulley',
    movementPattern: 'Abdução lateral de perna em pé com cabo na tornozeleira',
    animationKey: 'cableStandingAbduction',
    machineVisualType: 'cable_standing_abduction',
    animationStatus: 'verified',
    description: 'Atleta em pé ao lado da torre abduzindo a perna externamente sob tensão contínua.',
    settingTips: 'Segure firme na barra da torre e mantenha a bacia alinhada.',
    primaryMuscles: ['Glúteo Médio'],
    secondaryMuscles: ['Glúteo Mínimo']
  },

  // ==========================================================================
  // SEXTA-FEIRA: PEITORAL & BRAÇOS
  // ==========================================================================
  'chest-1-barbell': {
    variantId: 'chest-1-barbell',
    exerciseId: 'chest-1',
    exerciseName: 'Supino Reto com Barra Olímpica',
    equipmentName: 'Banco de Supino Reto com Barra Olímpica',
    equipmentCategory: 'free_weights',
    movementPattern: 'Empurrada horizontal simétrica com barra olímpica',
    animationKey: 'benchPressBarbell',
    machineVisualType: 'flat_barbell_bench',
    animationStatus: 'verified',
    description: 'Banco clássico com barra olímpica descendo na linha dos mamilos.',
    settingTips: 'Mantenha os pés cravados no chão e faça arco leve na coluna.',
    primaryMuscles: ['Peitoral Maior (Esternal)'],
    secondaryMuscles: ['Deltoide Anterior', 'Tríceps']
  },
  'chest-1-dumbbells': {
    variantId: 'chest-1-dumbbells',
    exerciseId: 'chest-1',
    exerciseName: 'Supino Reto com Halteres',
    equipmentName: 'Banco Reto + Par de Halteres Livres',
    equipmentCategory: 'free_weights',
    movementPattern: 'Empurrada horizontal com halteres independentes e maior amplitude',
    animationKey: 'benchPressDumbbell',
    machineVisualType: 'flat_bench_dumbbells',
    animationStatus: 'verified',
    description: 'Halteres independentes permitindo descida profunda e convergência no topo.',
    settingTips: 'Desça com os cotovelos a 75° do tronco (nunca a 90° abertos).',
    primaryMuscles: ['Peitoral Maior'],
    secondaryMuscles: ['Tríceps', 'Deltoide Anterior']
  },
  'chest-1-machine': {
    variantId: 'chest-1-machine',
    exerciseId: 'chest-1',
    exerciseName: 'Supino Máquina Articulada',
    equipmentName: 'Máquina Articulada de Supino Sentado',
    equipmentCategory: 'plate_loaded',
    movementPattern: 'Empurrada horizontal guiada com manoplas convergentes',
    animationKey: 'chestPressMachine',
    machineVisualType: 'seated_chest_press_machine',
    animationStatus: 'verified',
    description: 'Aparelho sentado com encosto vertical e alavancas empurrando para frente.',
    settingTips: 'Ajuste a altura do banco para as manoplas ficarem na linha média do peito.',
    primaryMuscles: ['Peitoral Maior'],
    secondaryMuscles: ['Tríceps']
  },

  'chest-2-dumbbells': {
    variantId: 'chest-2-dumbbells',
    exerciseId: 'chest-2',
    exerciseName: 'Supino Inclinado com Halteres',
    equipmentName: 'Banco Inclinado a 30° ou 45° + Halteres',
    equipmentCategory: 'free_weights',
    movementPattern: 'Empurrada no plano inclinado com foco no peitoral superior',
    animationKey: 'inclineBenchDumbbell',
    machineVisualType: 'incline_chest_bench',
    animationStatus: 'verified',
    description: 'Banco inclinado a 30°-45° com halteres convergindo para cima.',
    settingTips: 'Evite inclinação acima de 45° para não transferir para os ombros.',
    primaryMuscles: ['Peitoral Maior (Porção Clavicular)'],
    secondaryMuscles: ['Deltoide Anterior', 'Tríceps']
  },
  'chest-2-smith': {
    variantId: 'chest-2-smith',
    exerciseId: 'chest-2',
    exerciseName: 'Supino Inclinado no Smith Machine',
    equipmentName: 'Smith Machine com Banco Inclinado',
    equipmentCategory: 'smith_machine',
    movementPattern: 'Empurrada inclinada guiada em trilhos com barra contínua',
    animationKey: 'inclineBenchSmith',
    machineVisualType: 'incline_smith_bench',
    animationStatus: 'verified',
    description: 'Banco inclinado dentro do Smith com barra descendo na clavícula.',
    settingTips: 'Trave a barra na altura que permita toque suave no peito.',
    primaryMuscles: ['Peitoral Clavicular'],
    secondaryMuscles: ['Deltoide Anterior', 'Tríceps']
  },

  'chest-3-peck-deck': {
    variantId: 'chest-3-peck-deck',
    exerciseId: 'chest-3',
    exerciseName: 'Crucifixo / Peck Deck (Voador Peitoral)',
    equipmentName: 'Máquina Peck Deck (Voador)',
    equipmentCategory: 'selectorized_machine',
    movementPattern: 'Adução horizontal dos ombros fechando braços em arco à frente',
    animationKey: 'peckDeckFly',
    machineVisualType: 'peck_deck_fly_machine',
    animationStatus: 'verified',
    description: 'Alavancas mecânicas fechando no centro com peito aberto.',
    settingTips: 'Mantenha os cotovelos com leve flexão para proteger a articulação.',
    primaryMuscles: ['Peitoral Maior (Fibras Esternais)'],
    secondaryMuscles: ['Deltoide Anterior']
  },
  'chest-3-crossover': {
    variantId: 'chest-3-crossover',
    exerciseId: 'chest-3',
    exerciseName: 'Cross Over na Polia Média',
    equipmentName: 'Duas Torres de Cabo Cross Over',
    equipmentCategory: 'cable_pulley',
    movementPattern: 'Adução horizontal em cabo com grande amplitude de cruzamento',
    animationKey: 'cableCrossOver',
    machineVisualType: 'cable_crossover_towers',
    animationStatus: 'verified',
    description: 'Torres duplas de cabo convergindo punhos à frente do tórax.',
    settingTips: 'Dê um passo firme à frente e cruze levemente as mãos no centro.',
    primaryMuscles: ['Peitoral Maior'],
    secondaryMuscles: ['Deltoide Anterior']
  },
  'chest-3-dumbbells': {
    variantId: 'chest-3-dumbbells',
    exerciseId: 'chest-3',
    exerciseName: 'Crucifixo Reto com Halteres',
    equipmentName: 'Banco Reto + Par de Halteres Livres',
    equipmentCategory: 'free_weights',
    movementPattern: 'Abertura em arco amplo horizontal deitado no banco reto',
    animationKey: 'dumbbellFlatFly',
    machineVisualType: 'flat_bench_fly_dumbbells',
    animationStatus: 'verified',
    description: 'Atleta deitado abrindo os braços em abraço amplo até sentir o peito alongar.',
    settingTips: 'Não estique os cotovelos completamente; mantenha ângulo fixo de 15°.',
    primaryMuscles: ['Peitoral Maior'],
    secondaryMuscles: ['Deltoide Anterior']
  }
};

/**
 * Registro dos 21 Exercícios Base do HIT-FIT 2.0 (Retrocompatibilidade e auditoria canônica)
 */
export const BASE_EXERCISE_REGISTRY: Record<string, EquipmentVariantMeta> = {
  'leg-1': {
    variantId: 'leg-1-smith',
    exerciseId: 'leg-1',
    exerciseName: 'Agachamento no Smith Machine',
    equipmentName: 'Smith Machine (Barra Guiada)',
    equipmentId: 'smith_machine',
    animationId: 'squat',
    animationKey: 'squatSmith',
    muscleMapId: 'legs_quadriceps_glutes',
    movementPattern: 'Flexão e extensão de joelhos e quadril em trilho vertical guiado',
    machineVisualType: 'smith_machine',
    animationStatus: 'verified',
    description: 'Barra guiada deslizando verticalmente com travas de segurança ajustáveis.',
    settingTips: 'Posicione as travas de segurança na altura do quadril agachado.',
    primaryMuscles: ['Quadríceps', 'Glúteo Máximo'],
    secondaryMuscles: ['Isquiotibiais', 'Panturrilha']
  },
  'leg-2': {
    variantId: 'leg-2-45',
    exerciseId: 'leg-2',
    exerciseName: 'Leg Press 45°',
    equipmentName: 'Aparelho Leg Press 45° de Anilhas',
    equipmentId: 'leg_press_45_machine',
    animationId: 'legpress',
    animationKey: 'legpress45',
    muscleMapId: 'legs_quads_heavy',
    movementPattern: 'Empurrar carga na plataforma inclinada a 45° com flexão de joelhos',
    machineVisualType: 'leg_press_45_machine',
    animationStatus: 'verified',
    description: 'Plataforma deslizante a 45° com encosto fixo e travas laterais.',
    settingTips: 'Mantenha os calcanhares apoiados na base e destrave as alavancas laterais.',
    primaryMuscles: ['Quadríceps', 'Glúteo Máximo'],
    secondaryMuscles: ['Isquiotibiais']
  },
  'leg-3': {
    variantId: 'leg-3-machine',
    exerciseId: 'leg-3',
    exerciseName: 'Cadeira Extensora',
    equipmentName: 'Cadeira Extensora de Placas',
    equipmentId: 'leg_extension_machine',
    animationId: 'extension',
    animationKey: 'legExtension',
    muscleMapId: 'legs_quads_isolation',
    movementPattern: 'Extensão isolada de joelhos sentado com rolo sobre a tíbia',
    machineVisualType: 'leg_extension_machine',
    animationStatus: 'verified',
    description: 'Banco com encosto ajustável e rolo acolchoado na tíbia.',
    settingTips: 'Alinhe o eixo da máquina com o centro do seu joelho.',
    primaryMuscles: ['Quadríceps (Isolado)'],
    secondaryMuscles: ['Reto Femoral']
  },
  'leg-4': {
    variantId: 'leg-4-lying',
    exerciseId: 'leg-4',
    exerciseName: 'Mesa Flexora',
    equipmentName: 'Mesa Flexora Deitada',
    equipmentId: 'lying_leg_curl_bench',
    animationId: 'curl',
    animationKey: 'legCurl',
    muscleMapId: 'legs_hamstrings',
    movementPattern: 'Flexão isolada de joelhos deitado de bruços trazendo o rolo aos glúteos',
    machineVisualType: 'lying_leg_curl_bench',
    animationStatus: 'verified',
    description: 'Banco horizontal ou com leve quebra angular e rolo na panturrilha.',
    settingTips: 'Ajuste o rolo de modo que fique logo abaixo da panturrilha, sem tocar o tendão de Aquiles.',
    primaryMuscles: ['Isquiotibiais (Posterior de Coxa)'],
    secondaryMuscles: ['Gastrocnêmio']
  },
  'leg-5': {
    variantId: 'leg-5-standing',
    exerciseId: 'leg-5',
    exerciseName: 'Panturrilha em Pé ou no Smith',
    equipmentName: 'Máquina de Panturrilha em Pé / Smith com Step',
    equipmentId: 'standing_calf_machine',
    animationId: 'calf',
    animationKey: 'calfRaise',
    muscleMapId: 'legs_calves_gastrocnemius',
    movementPattern: 'Flexão plantar com amplitude máxima sobre bloco ou step',
    machineVisualType: 'standing_calf_machine',
    animationStatus: 'verified',
    description: 'Apoio sobre ombros e step sob a ponta dos pés para máxima excursão articular.',
    settingTips: 'Posicione as almofadas firmes sobre os ombros e apoie a bola do pé no bloco.',
    primaryMuscles: ['Panturrilha (Gastrocnêmio e Sóleo)'],
    secondaryMuscles: ['Tibial Posterior']
  },
  'back-1': {
    variantId: 'back-1-wide',
    exerciseId: 'back-1',
    exerciseName: 'Puxada Alta Aberta',
    equipmentName: 'Torre de Puxada Alta (Lat Pulldown) com Barra Longa',
    equipmentId: 'lat_pulldown_machine',
    animationId: 'pulldown',
    animationKey: 'pulldownWide',
    muscleMapId: 'back_latissimus_dorsi',
    movementPattern: 'Tração vertical de cima para baixo em direção à clavícula',
    machineVisualType: 'lat_pulldown_machine',
    animationStatus: 'verified',
    description: 'Torre de cabo alto com barra reta ou curva e rolos de travamento nas coxas.',
    settingTips: 'Ajuste os rolos para que suas coxas fiquem firmemente travadas.',
    primaryMuscles: ['Latíssimo do Dorso (Dorsal)'],
    secondaryMuscles: ['Bíceps', 'Redondo Maior', 'Trapézio']
  },
  'back-2': {
    variantId: 'back-2-cable',
    exerciseId: 'back-2',
    exerciseName: 'Remada Baixa no Triângulo',
    equipmentName: 'Remada Sentada na Polia Baixa com Puxador Triângulo',
    equipmentId: 'seated_cable_row_bench',
    animationId: 'row',
    animationKey: 'cableRow',
    muscleMapId: 'back_rhomboids_traps',
    movementPattern: 'Tração horizontal trazendo as mãos ao abdômen com retração escapular',
    machineVisualType: 'seated_cable_row_bench',
    animationStatus: 'verified',
    description: 'Banco longo com apoio para os pés e polia baixa frontal.',
    settingTips: 'Apoie os pés firmes nas sapatas mantendo os joelhos levemente destravados.',
    primaryMuscles: ['Latíssimo do Dorso', 'Rombóides', 'Trapézio Médio'],
    secondaryMuscles: ['Bíceps', 'Braquial']
  },
  'back-3': {
    variantId: 'back-3-dumbbell',
    exerciseId: 'back-3',
    exerciseName: 'Remada Unilateral com Halter',
    equipmentName: 'Banco Plano + Halteres Monobloco',
    equipmentId: 'flat_bench_single_dumbbell',
    animationId: 'singleRow',
    animationKey: 'singleArmRowDumbbell',
    muscleMapId: 'back_lats_unilateral',
    movementPattern: 'Puxada unilateral apoiado no banco trazendo o cotovelo rente à costela',
    machineVisualType: 'flat_bench_single_dumbbell',
    animationStatus: 'verified',
    description: 'Banco reto estável para apoio unilateral de joelho e mão.',
    settingTips: 'Mantenha o banco horizontal e apoie o joelho do mesmo lado do apoio de mão.',
    primaryMuscles: ['Latíssimo do Dorso'],
    secondaryMuscles: ['Rombóides', 'Deltoide Posterior', 'Bíceps']
  },
  'back-4': {
    variantId: 'back-4-wbar',
    exerciseId: 'back-4',
    exerciseName: 'Rosca Direta com Barra W',
    equipmentName: 'Barra W Olímpica ou Montada',
    equipmentId: 'w_bar_biceps',
    animationId: 'biceps',
    animationKey: 'bicepsWBar',
    muscleMapId: 'arms_biceps_brachii',
    movementPattern: 'Flexão de cotovelos em pé mantendo braços alinhados ao tronco',
    machineVisualType: 'w_bar_biceps',
    animationStatus: 'verified',
    description: 'Barra sinuosa de pegada semi-supinada para menor estresse nos punhos.',
    settingTips: 'Segure nas curvas internas da barra para acomodar a anatomia dos punhos.',
    primaryMuscles: ['Bíceps Braquial'],
    secondaryMuscles: ['Braquial', 'Braquiorradial']
  },
  'back-5': {
    variantId: 'back-5-dumbbells',
    exerciseId: 'back-5',
    exerciseName: 'Rosca Martelo com Halteres',
    equipmentName: 'Par de Halteres com Pegada Neutra',
    equipmentId: 'free_dumbbells_hammer',
    animationId: 'hammer',
    animationKey: 'hammerCurlDumbbell',
    muscleMapId: 'arms_brachioradialis',
    movementPattern: 'Flexão de cotovelos com polegares voltados para o teto (pegada neutra)',
    machineVisualType: 'free_dumbbells_hammer',
    animationStatus: 'verified',
    description: 'Halteres livres segurados na vertical paralelos ao corpo.',
    settingTips: 'Mantenha os cotovelos fixados às costelas durante toda a subida.',
    primaryMuscles: ['Braquiorradial', 'Braquial'],
    secondaryMuscles: ['Bíceps Braquial']
  },
  'back-6': {
    variantId: 'back-6-floor',
    exerciseId: 'back-6',
    exerciseName: 'Prancha Isométrica + Abdominal Infra',
    equipmentName: 'Colchonete / Torre de Paralelas',
    equipmentId: 'isometric_floor_mat',
    animationId: 'plank',
    animationKey: 'plankFloor',
    muscleMapId: 'core_rectus_abdominis',
    movementPattern: 'Estabilização isométrica anterior do core no solo e flexão de quadril',
    machineVisualType: 'isometric_floor_mat',
    animationStatus: 'verified',
    description: 'Corpo estático sustentado sobre antebraços e pontas dos pés, coluna alinhada em linha reta.',
    settingTips: 'Certifique-se de que o colchonete apoia bem os antebraços.',
    primaryMuscles: ['Reto Abdominal', 'Transverso do Abdômen'],
    secondaryMuscles: ['Glúteos', 'Oblíquos']
  },
  'sh-1': {
    variantId: 'sh-1-dumbbells',
    exerciseId: 'sh-1',
    exerciseName: 'Desenvolvimento com Halteres',
    equipmentName: 'Banco Regulável a 75°/80° + Halteres',
    equipmentId: 'incline_bench_dumbbells',
    animationId: 'shoulderPress',
    animationKey: 'shoulderPressDumbbell',
    muscleMapId: 'shoulders_anterior_lateral',
    movementPattern: 'Pressão vertical acima da cabeça (Overhead Press) a partir da linha dos ombros',
    machineVisualType: 'incline_bench_dumbbells',
    animationStatus: 'verified',
    description: 'Atleta sentado no banco quase vertical empurrando os halteres diretamente para o alto.',
    settingTips: 'Evite o banco em 90° retos; a leve inclinação a 80° é muito mais segura.',
    primaryMuscles: ['Deltoide Anterior', 'Deltoide Lateral'],
    secondaryMuscles: ['Tríceps Braquial', 'Trapézio Superior']
  },
  'sh-2': {
    variantId: 'sh-2-cables',
    exerciseId: 'sh-2',
    exerciseName: 'Elevação Lateral no Cabo ou Halteres',
    equipmentName: 'Cross Over / Polia Baixa ou Halteres',
    equipmentId: 'cable_lateral_raise',
    animationId: 'lateralRaise',
    animationKey: 'lateralRaiseCable',
    muscleMapId: 'shoulders_lateral_deltoid',
    movementPattern: 'Abdução do ombro elevando os braços lateralmente até 90° (altura dos ombros)',
    machineVisualType: 'cable_lateral_raise',
    animationStatus: 'verified',
    description: 'Braços partindo da lateral do quadril e subindo lateralmente em abdução até a linha dos ombros (em T).',
    settingTips: 'Ajuste a polia no nível mais baixo ou utilize halteres com cotovelos levemente flexionados.',
    primaryMuscles: ['Deltoide Lateral (Cabeça Média)'],
    secondaryMuscles: ['Supraespinhal', 'Trapézio Superior']
  },
  'sh-3': {
    variantId: 'sh-3-peckdeck',
    exerciseId: 'sh-3',
    exerciseName: 'Crucifixo Inverso (Peck Deck ou Cabo)',
    equipmentName: 'Máquina Peck Deck Invertida (Voador Inverso)',
    equipmentId: 'rear_delt_peck_deck',
    animationId: 'facepull',
    animationKey: 'rearDeltPeckDeck',
    muscleMapId: 'shoulders_posterior_deltoid',
    movementPattern: 'Abdução horizontal dos ombros com os braços estendidos para trás',
    machineVisualType: 'rear_delt_peck_deck',
    animationStatus: 'verified',
    description: 'Atleta sentado de frente para o encosto empurrando as alavancas para trás com os cotovelos altos.',
    settingTips: 'Regule a altura do banco para que os pegadores fiquem na altura do peito.',
    primaryMuscles: ['Deltoide Posterior'],
    secondaryMuscles: ['Rombóides', 'Trapézio Médio/Inferior', 'Manguito Rotador']
  },
  'sh-4': {
    variantId: 'sh-4-rope',
    exerciseId: 'sh-4',
    exerciseName: 'Tríceps Corda na Polia Alta',
    equipmentName: 'Polia Alta com Acessório Corda',
    equipmentId: 'high_pulley_rope_triceps',
    animationId: 'tricepsRope',
    animationKey: 'tricepsRopePushdown',
    muscleMapId: 'arms_triceps',
    movementPattern: 'Extensão dos cotovelos de cima para baixo com separação da corda no final',
    machineVisualType: 'high_pulley_rope_triceps',
    animationStatus: 'verified',
    description: 'Polia alta com corda sendo empurrada para baixo até estender os cotovelos e abrir as pontas.',
    settingTips: 'Fixe a corda na polia alta e incline o tronco ligeiramente à frente.',
    primaryMuscles: ['Tríceps Braquial (Cabeça Lateral, Medial e Longa)'],
    secondaryMuscles: ['Ancôneo']
  },
  'glute-1': {
    variantId: 'glute-1-machine',
    exerciseId: 'glute-1',
    exerciseName: 'Elevação Pélvica (Hip Thrust)',
    equipmentName: 'Máquina Hip Thrust Dedicada / Banco Reto',
    equipmentId: 'hip_thrust_bench_machine',
    animationId: 'hipthrust',
    animationKey: 'hipThrustMachine',
    muscleMapId: 'glutes_maximum',
    movementPattern: 'Extensão de quadril com escápulas apoiadas no banco e barra na pelve',
    machineVisualType: 'hip_thrust_bench_machine',
    animationStatus: 'verified',
    description: 'Quadril subindo do chão até ficar 100% alinhado horizontalmente com o joelho e ombros.',
    settingTips: 'Ajuste o cinto acolchoado ou posicione a barra exatamente na dobra do quadril.',
    primaryMuscles: ['Glúteo Máximo'],
    secondaryMuscles: ['Isquiotibiais', 'Eretores da Espinha']
  },
  'glute-2': {
    variantId: 'glute-2-bulgarian',
    exerciseId: 'glute-2',
    exerciseName: 'Agachamento Búlgaro ou Sumô',
    equipmentName: 'Banco Reto ou Step + Halteres',
    equipmentId: 'bulgarian_split_bench',
    animationId: 'bulgarian',
    animationKey: 'bulgarianSplitSquat',
    muscleMapId: 'glutes_quads_split',
    movementPattern: 'Agachamento unilateral com pé de trás apoiado no banco elevado',
    machineVisualType: 'bulgarian_split_bench',
    animationStatus: 'verified',
    description: 'Posição afundo com peito do pé traseiro no banco e descida vertical do joelho dianteiro.',
    settingTips: 'Mantenha o banco firme a cerca de 40 cm do chão e apoie o dorso do pé.',
    primaryMuscles: ['Glúteo Máximo', 'Quadríceps da Perna da Frente'],
    secondaryMuscles: ['Isquiotibiais', 'Adutores']
  },
  'glute-3': {
    variantId: 'glute-3-machine',
    exerciseId: 'glute-3',
    exerciseName: 'Cadeira Abdutora (Tronco Inclinado)',
    equipmentName: 'Cadeira Abdutora de Placas',
    equipmentId: 'seated_abductor_chair',
    animationId: 'abductor',
    animationKey: 'seatedAbductor',
    muscleMapId: 'glutes_medius_minimus',
    movementPattern: 'Abdução do quadril abrindo as pernas contra almofadas externas',
    machineVisualType: 'seated_abductor_chair',
    animationStatus: 'verified',
    description: 'Atleta sentado com tronco levemente inclinado abrindo os joelhos lateralmente contra as placas.',
    settingTips: 'Regule as almofadas na parte externa dos joelhos e posicione o pino na abertura desejada.',
    primaryMuscles: ['Glúteo Médio', 'Glúteo Mínimo'],
    secondaryMuscles: ['Tensor da Fáscia Lata', 'Piriforme']
  },
  'chest-1': {
    variantId: 'chest-1-barbell',
    exerciseId: 'chest-1',
    exerciseName: 'Supino Reto (Barra ou Halteres)',
    equipmentName: 'Banco de Supino Reto com Barra Olímpica',
    equipmentId: 'flat_barbell_bench',
    animationId: 'benchpress',
    animationKey: 'benchPressBarbell',
    muscleMapId: 'chest_pectoralis_major',
    movementPattern: 'Empurrar horizontal perpendicular ao tronco em banco plano',
    machineVisualType: 'flat_barbell_bench',
    animationStatus: 'verified',
    description: 'Atleta deitado de costas no banco reto empurrando a barra olímpica verticalmente.',
    settingTips: 'Ajuste a altura dos suportes da barra para que fique ao alcance dos braços levemente flexionados.',
    primaryMuscles: ['Peitoral Maior (Porção Esternocostal)'],
    secondaryMuscles: ['Deltoide Anterior', 'Tríceps Braquial']
  },
  'chest-2': {
    variantId: 'chest-2-dumbbells',
    exerciseId: 'chest-2',
    exerciseName: 'Supino Inclinado com Halteres',
    equipmentName: 'Banco Inclinado a 30° ou 45° + Halteres',
    equipmentId: 'incline_chest_bench',
    animationId: 'inclineBench',
    animationKey: 'inclineBenchPress',
    muscleMapId: 'chest_clavicular_head',
    movementPattern: 'Empurrar no plano inclinado com foco na porção superior do peito',
    machineVisualType: 'incline_chest_bench',
    animationStatus: 'verified',
    description: 'Banco inclinado a 30°-45° com atleta empurrando halteres em trajetória convergente.',
    settingTips: 'Regule a inclinação do encosto para 30° ou 45°.',
    primaryMuscles: ['Peitoral Maior (Porção Clavicular Superior)'],
    secondaryMuscles: ['Deltoide Anterior', 'Tríceps Braquial']
  },
  'chest-3': {
    variantId: 'chest-3-peckdeck',
    exerciseId: 'chest-3',
    exerciseName: 'Crucifixo / Peck Deck (Voador)',
    equipmentName: 'Máquina Peck Deck (Voador Peitoral)',
    equipmentId: 'peck_deck_fly_machine',
    animationId: 'fly',
    animationKey: 'peckDeckFly',
    muscleMapId: 'chest_isolated_fly',
    movementPattern: 'Adução horizontal dos ombros trazendo os braços em arco para frente do tórax',
    machineVisualType: 'peck_deck_fly_machine',
    animationStatus: 'verified',
    description: 'Braços abertos em arco fechando à frente do tórax com as mãos se aproximando no centro.',
    settingTips: 'Regule o banco para que os pegadores fiquem alinhados com o meio do tórax.',
    primaryMuscles: ['Peitoral Maior (Fibras Esternais)'],
    secondaryMuscles: ['Deltoide Anterior']
  }
};

/**
 * Registro Completo de Todas as Variantes e Exercícios
 */
export const ANIMATION_REGISTRY: Record<string, EquipmentVariantMeta> = {
  ...BASE_EXERCISE_REGISTRY,
  ...VARIANT_REGISTRY
};

/**
 * Recupera variante pelo variantId ou exerciseId
 */
export function getVariantRegistryItem(variantId: string): EquipmentVariantMeta | null {
  if (VARIANT_REGISTRY[variantId]) {
    return VARIANT_REGISTRY[variantId];
  }
  if (BASE_EXERCISE_REGISTRY[variantId]) {
    return BASE_EXERCISE_REGISTRY[variantId];
  }
  if (ANIMATION_REGISTRY[variantId]) {
    return ANIMATION_REGISTRY[variantId];
  }

  // Busca por animationKey ou animationId
  const byKey = Object.values(ANIMATION_REGISTRY).find(
    (v) => v.animationKey === variantId || v.animationId === variantId
  );
  if (byKey) return byKey;

  // Busca pelo exerciseId
  const byExId = Object.values(BASE_EXERCISE_REGISTRY).find((v) => v.exerciseId === variantId) ||
                 Object.values(VARIANT_REGISTRY).find((v) => v.exerciseId === variantId);
  if (byExId) return byExId;

  // Busca por nome
  const cleanInput = variantId.toLowerCase().trim();
  const byName = Object.values(ANIMATION_REGISTRY).find((v) =>
    v.exerciseName.toLowerCase().includes(cleanInput) || v.equipmentName.toLowerCase().includes(cleanInput)
  );
  if (byName) return byName;

  return null;
}

/**
 * Retorna todas as variantes cadastradas para um exercício específico
 */
export function getVariantsForExercise(exerciseId: string): EquipmentVariantMeta[] {
  return Object.values(VARIANT_REGISTRY).filter((v) => v.exerciseId === exerciseId);
}

/**
 * Retorna todas as variantes registradas no catálogo (todas as opções de aparelhos)
 */
export function getAllVariants(): EquipmentVariantMeta[] {
  return Object.values(VARIANT_REGISTRY);
}

/**
 * Retorna os 21 exercícios canônicos do plano base
 */
export function getAllRegistryItems(): EquipmentVariantMeta[] {
  return Object.values(BASE_EXERCISE_REGISTRY);
}

// Aliases para retrocompatibilidade
export const getAnimationRegistryItem = getVariantRegistryItem;

