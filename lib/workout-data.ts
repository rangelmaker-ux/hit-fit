export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  sets: number;
  reps: string;
  restSeconds: number;
  muscleGroup: 'legs' | 'back' | 'shoulders' | 'glutes' | 'chest' | 'arms' | 'core';
  activeBodyParts: {
    front: string[];
    back: string[];
  };
  machines: {
    primary: {
      name: string;
      description: string;
      settingTips: string;
    };
    alternatives: {
      name: string;
      description: string;
    }[];
  };
  biomechanics: {
    setup: string;
    execution: string;
    breathing: string;
    commonMistake: string;
    proTip: string;
  };
  animationKey: 'squat' | 'legpress' | 'legext' | 'legcurl' | 'calf' | 'pulldown' | 'row' | 'singleRow' | 'biceps' | 'hammer' | 'shoulderPress' | 'lateralRaise' | 'facepull' | 'tricepsRope' | 'hipthrust' | 'bulgarian' | 'abductor' | 'benchpress' | 'inclineBench' | 'fly' | 'plank';
}

export interface DayWorkout {
  dayName: string;
  dayShort: string;
  title: string;
  subtitle: string;
  durationMin: number;
  focusTag: string;
  finishCardio: {
    name: string;
    type: 'HIIT' | 'Incline Walk' | 'StairMaster' | 'Steady Pace';
    durationMin: number;
    protocol: string;
    caloriesBurnTarget: number;
  };
  exercises: Exercise[];
}

export const WORKOUT_DAYS: DayWorkout[] = [
  // SEGUNDA-FEIRA: PERNA COMPLETA
  {
    dayName: 'Segunda-feira',
    dayShort: 'SEG',
    title: 'Perna Completa & Queima Alta',
    subtitle: 'Quadríceps, Isquiotibiais e Panturrilhas',
    durationMin: 60,
    focusTag: 'TREINO A · PERNA',
    finishCardio: {
      name: 'Esteira Inclinada Metabólica',
      type: 'Incline Walk',
      durationMin: 10,
      protocol: 'Inclinação de 10% a 12%, velocidade constante de 5.0 a 5.5 km/h sem segurar nas barras laterais.',
      caloriesBurnTarget: 120
    },
    exercises: [
      {
        id: 'leg-1',
        name: 'Agachamento (Smith ou Livre)',
        targetMuscle: 'Quadríceps & Glúteo Máximo',
        secondaryMuscles: ['Isquiotibiais', 'Panturrilha', 'Eretores da Espinha'],
        sets: 4,
        reps: '8 - 10',
        restSeconds: 75,
        muscleGroup: 'legs',
        activeBodyParts: {
          front: ['quads'],
          back: ['glutes', 'hamstrings']
        },
        machines: {
          primary: {
            name: 'Smith Machine (Barra Guiada)',
            description: 'Barra com trilho fixo e travas de segurança ajustáveis.',
            settingTips: 'Posicione as travas de segurança na altura do quadril agachado.'
          },
          alternatives: [
            {
              name: 'Rack de Agachamento Livre',
              description: 'Barra olímpica com apoio de ombro para maior ativação de estabilizadores.'
            },
            {
              name: 'Hack Squat 45°',
              description: 'Máquina articulada com encosto inclinado, poupando lombar.'
            }
          ]
        },
        biomechanics: {
          setup: 'Pés na largura dos ombros, pontas ligeiramente apontadas para fora (15°).',
          execution: 'Inicie descendo o quadril para trás como se fosse sentar, descendo até as coxas ficarem paralelas ao chão. Suba empurrando o chão pelos calcanhares.',
          breathing: 'Inspire na descida, segure o ar na virada e solte o ar empurrando o peso para cima.',
          commonMistake: 'Deixar os joelhos colapsarem para dentro (valgo dinâmico) ou tirar os calcanhares do chão.',
          proTip: 'Mantenha o peitoral estufado e o abdômen travado (brace abdominal) durante toda a descida.'
        },
        animationKey: 'squat'
      },
      {
        id: 'leg-2',
        name: 'Leg Press 45°',
        targetMuscle: 'Quadríceps & Glúteos',
        secondaryMuscles: ['Adutores', 'Posterior de coxa'],
        sets: 4,
        reps: '10 - 12',
        restSeconds: 60,
        muscleGroup: 'legs',
        activeBodyParts: {
          front: ['quads'],
          back: ['glutes']
        },
        machines: {
          primary: {
            name: 'Leg Press 45° de Anilhas',
            description: 'Plataforma inclinada sobre trilhos com suporte para anilhas.',
            settingTips: 'Ajuste o encosto para não arredondar a lombar na descida máxima.'
          },
          alternatives: [
            {
              name: 'Leg Press Horizontal com Placas',
              description: 'Banco deslizante sentado com seleção de pinos.'
            }
          ]
        },
        biomechanics: {
          setup: 'Pés no meio da plataforma, paralelos e afastados na linha dos ombros.',
          execution: 'Destrave a máquina e desça a plataforma controlando o peso até formar 90° nos joelhos. Empurre sem esticar as pernas 100%.',
          breathing: 'Puxe o ar na descida lenta; solte o ar na subida forte.',
          commonMistake: 'Tirar o glúteo e a lombar do encosto no final da descida (risco grave para a coluna).',
          proTip: 'Nunca trave os joelhos no topo (mantenha microflexão para manter a tensão constante).'
        },
        animationKey: 'legpress'
      },
      {
        id: 'leg-3',
        name: 'Cadeira Extensora',
        targetMuscle: 'Quadríceps Isolado',
        secondaryMuscles: ['Reto Femoral'],
        sets: 3,
        reps: '12 - 15',
        restSeconds: 50,
        muscleGroup: 'legs',
        activeBodyParts: {
          front: ['quads'],
          back: []
        },
        machines: {
          primary: {
            name: 'Cadeira Extensora Tradicional',
            description: 'Banco com rolo de espuma ajustável na altura do tornozelo.',
            settingTips: 'O eixo de rotação da máquina deve coincidir exatamente com a lateral do seu joelho.'
          },
          alternatives: [
            {
              name: 'Extensora Unilateral no Cabo',
              description: 'Cabo baixo com tornozeleira em pé.'
            }
          ]
        },
        biomechanics: {
          setup: 'Encoste as costas no banco e ajuste o rolo logo acima dos pés/tornozelos.',
          execution: 'Estenda as duas pernas até a linha horizontal, segure 1 a 2 segundos sentindo a coxa queimar e desça em 3 segundos.',
          breathing: 'Expire subindo; inspire descendo suavemente.',
          commonMistake: 'Dar tranco no peso no início do movimento em vez de contração controlada.',
          proTip: 'Segure firme nas manoplas laterais para o bumbum não levantar do banco.'
        },
        animationKey: 'legext'
      },
      {
        id: 'leg-4',
        name: 'Mesa ou Cadeira Flexora',
        targetMuscle: 'Isquiotibiais (Posterior de Coxa)',
        secondaryMuscles: ['Panturrilhas'],
        sets: 3,
        reps: '12',
        restSeconds: 50,
        muscleGroup: 'legs',
        activeBodyParts: {
          front: [],
          back: ['hamstrings']
        },
        machines: {
          primary: {
            name: 'Mesa Flexora (Deitado)',
            description: 'Aparelho deitado de barriga para baixo com rolete posterior no calcanhar.',
            settingTips: 'Ajuste a almofada 3 dedos acima do tendão de Aquiles.'
          },
          alternatives: [
            {
              name: 'Cadeira Flexora Sentada',
              description: 'Aparelho sentado com trava sobre as coxas.'
            },
            {
              name: 'Stiff com Halteres',
              description: 'Exercício livre com halteres focando no alongamento posterior.'
            }
          ]
        },
        biomechanics: {
          setup: 'Deite alinhado, segure nas manoplas dianteiras e apoie o rolete atrás do tornozelo.',
          execution: 'Puxe os calcanhares em direção ao glúteo, segure 1 segundo no topo e retorne sem deixar as placas baterem.',
          breathing: 'Solte o ar na puxada; puxe o ar ao retornar as pernas.',
          commonMistake: 'Empinar o quadril e descolar a barriga do banco para roubar o peso.',
          proTip: 'Mantenha os pés em dorsiflexão (dedos apontados para as canelas) para focar no posterior.'
        },
        animationKey: 'legcurl'
      },
      {
        id: 'leg-5',
        name: 'Panturrilha (Leg ou em Pé)',
        targetMuscle: 'Gastrocnêmio & Sóleo',
        secondaryMuscles: ['Tendão de Aquiles'],
        sets: 4,
        reps: '15 - 20',
        restSeconds: 45,
        muscleGroup: 'legs',
        activeBodyParts: {
          front: [],
          back: ['calves']
        },
        machines: {
          primary: {
            name: 'Gêmeos em Pé na Máquina',
            description: 'Apoio acolchoado nos ombros e degrau para os antepés.',
            settingTips: 'Altura dos apoios regulada para você conseguir esticar o tornozelo completamente.'
          },
          alternatives: [
            {
              name: 'Panturrilha no Leg Press',
              description: 'Apoio da ponta dos pés na borda inferior da plataforma.'
            },
            {
              name: 'Gêmeos Sentado (Cavalinho)',
              description: 'Banco com trava sobre os joelhos com foco no sóleo.'
            }
          ]
        },
        biomechanics: {
          setup: 'Apenas a ponta dos pés apoiada no degrau, calcanhares livres para descer bastante.',
          execution: 'Desça o máximo que puder para alongar a panturrilha por 1 segundo, e suba na ponta máxima dos dedos segurando 2 segundos no topo.',
          breathing: 'Expire subindo; inspire no alongamento lá embaixo.',
          commonMistake: 'Fazer repetições curtas e quicando sem amplitude.',
          proTip: 'A queimação profunda no topo é o sinal de recrutamento das fibras musculares densas.'
        },
        animationKey: 'calf'
      }
    ]
  },

  // TERÇA-FEIRA: COSTAS + BÍCEPS + ABDÔMEN
  {
    dayName: 'Terça-feira',
    dayShort: 'TER',
    title: 'Costas Definidas, Bíceps & Core',
    subtitle: 'Dorsal em V, Braquiais e Abdômen',
    durationMin: 60,
    focusTag: 'TREINO B · COSTAS & BRAÇOS',
    finishCardio: {
      name: 'Cardio Livre em Ritmo Moderado',
      type: 'Steady Pace',
      durationMin: 10,
      protocol: 'Bike ergométrica ou esteira ritmo 6.0 km/h para oxidação de gordura após esgotar o glicogênio.',
      caloriesBurnTarget: 90
    },
    exercises: [
      {
        id: 'back-1',
        name: 'Puxada Frontal na Polia',
        targetMuscle: 'Latíssimo do Dorso (Grande Dorsal)',
        secondaryMuscles: ['Bíceps', 'Trapézio inferior', 'Romboides'],
        sets: 4,
        reps: '10 - 12',
        restSeconds: 60,
        muscleGroup: 'back',
        activeBodyParts: {
          front: ['biceps'],
          back: ['lats', 'traps']
        },
        machines: {
          primary: {
            name: 'Polia Alta (Pulley)',
            description: 'Torre com cabo superior e banco com almofadas para travar os joelhos.',
            settingTips: 'Ajuste a almofada dos joelhos para seu corpo ficar 100% firme sem levantar.'
          },
          alternatives: [
            {
              name: 'Puxada Articulada Convergente',
              description: 'Máquina articulada com pegadas ergonômicas independentes.'
            },
            {
              name: 'Barra Fixa com Graviton (ou Elástico)',
              description: 'Para quem quer força funcional com suporte de contrapeso.'
            }
          ]
        },
        biomechanics: {
          setup: 'Pegada aberta pronada (palmas para frente), peito projetado para cima.',
          execution: 'Inicie o movimento deprimindo as escápulas e puxando a barra em direção à parte superior do peito. Não balance o tronco para trás.',
          breathing: 'Solte o ar na puxada; puxe o ar controlando a barra de volta ao alto.',
          commonMistake: 'Puxar com a força dos braços e arredondar as costas para a frente.',
          proTip: 'Imagine que está puxando com os cotovelos para baixo e para trás, e não com as mãos.'
        },
        animationKey: 'pulldown'
      },
      {
        id: 'back-2',
        name: 'Remada Baixa no Triângulo',
        targetMuscle: 'Miolo das Costas & Romboides',
        secondaryMuscles: ['Dorsal', 'Bíceps', 'Deltoide posterior'],
        sets: 4,
        reps: '10 - 12',
        restSeconds: 60,
        muscleGroup: 'back',
        activeBodyParts: {
          front: ['biceps'],
          back: ['midback', 'lats']
        },
        machines: {
          primary: {
            name: 'Remada Sentada no Cabo (Polia Baixa)',
            description: 'Banco reto no nível do chão com apoio para os pés e puxador cabo triângulo.',
            settingTips: 'Mantenha os joelhos com leve flexão para proteger a coluna.'
          },
          alternatives: [
            {
              name: 'Remada Cavalinho (T-Bar)',
              description: 'Barra com anilhas e pegada fechada com apoio de peito.'
            },
            {
              name: 'Remada Máquina Articulada',
              description: 'Aparelho com apoio peitoral que elimina a carga na lombar.'
            }
          ]
        },
        biomechanics: {
          setup: 'Sente com a postura ereta, segure o triângulo e mantenha o peito aberto.',
          execution: 'Puxe o triângulo em direção ao umbigo espremendo as escápulas atrás. Volte alongando as costas sem encurvar a coluna.',
          breathing: 'Expire trazendo o triângulo no abdômen; inspire retornando à frente.',
          commonMistake: 'Ficar balançando a coluna excessivamente para frente e para trás.',
          proTip: 'Aperte as costas no final da puxada como se estivesse segurando uma caneta entre as omoplatas.'
        },
        animationKey: 'row'
      },
      {
        id: 'back-3',
        name: 'Remada Unilateral (Serrote)',
        targetMuscle: 'Dorsal & Espessura das Costas',
        secondaryMuscles: ['Bíceps', 'Antebraço', 'Core'],
        sets: 3,
        reps: '10 cada lado',
        restSeconds: 50,
        muscleGroup: 'back',
        activeBodyParts: {
          front: ['biceps'],
          back: ['lats']
        },
        machines: {
          primary: {
            name: 'Banco Reto + Halter Livre',
            description: 'Apoio de joelho e mão no banco reto com peso livre.',
            settingTips: 'Mantenha o banco plano e selecione halteres bem balanceados.'
          },
          alternatives: [
            {
              name: 'Remada Unilateral na Polia Baixa',
              description: 'Tensão contínua com puxador estribo individual.'
            }
          ]
        },
        biomechanics: {
          setup: 'Apoie um joelho e a mão do mesmo lado no banco. A outra perna fica no chão firme.',
          execution: 'Segure o halter com o braço estendido e puxe o peso em direção ao bolso da calça, mantendo o cotovelo colado ao corpo.',
          breathing: 'Expire puxando o halter; inspire descendo suavemente.',
          commonMistake: 'Girar o tronco para cima no impulso para levantar o peso.',
          proTip: 'O movimento é em arco: suba trazendo o halter perto do quadril, e não no peito.'
        },
        animationKey: 'singleRow'
      },
      {
        id: 'back-4',
        name: 'Rosca Direta com Barra W',
        targetMuscle: 'Bíceps Braquial',
        secondaryMuscles: ['Braquial', 'Antebraços'],
        sets: 3,
        reps: '10 - 12',
        restSeconds: 45,
        muscleGroup: 'arms',
        activeBodyParts: {
          front: ['biceps', 'forearms'],
          back: []
        },
        machines: {
          primary: {
            name: 'Barra W Olímpica ou Montada',
            description: 'Barra com ondulações anatômicas que protegem os punhos.',
            settingTips: 'Escolha a pegada média onde seus polegares apontam suavemente para dentro.'
          },
          alternatives: [
            {
              name: 'Rosca no Cabo com Barra Reta',
              description: 'Polia baixa para manter a tensão constante no topo do movimento.'
            },
            {
              name: 'Rosca com Halteres Alternada',
              description: 'Permite rotação do punho (supinação) para pico do bíceps.'
            }
          ]
        },
        biomechanics: {
          setup: 'Em pé, pés paralelos, cotovelos colados nas laterais do corpo.',
          execution: 'Flexione os cotovelos levando a barra em direção aos ombros sem mexer os cotovelos de lugar. Desça em 3 segundos.',
          breathing: 'Expire ao subir a barra; inspire na descida controlada.',
          commonMistake: 'Jogar o quadril para frente para dar impulso (roubo lombar).',
          proTip: 'Imagine seus cotovelos parafusados nas costelas: só o antebraço se move.'
        },
        animationKey: 'biceps'
      },
      {
        id: 'back-5',
        name: 'Rosca Martelo com Halteres',
        targetMuscle: 'Braquial & Braquiorradial',
        secondaryMuscles: ['Bíceps', 'Pegada/Antebraço'],
        sets: 3,
        reps: '12',
        restSeconds: 45,
        muscleGroup: 'arms',
        activeBodyParts: {
          front: ['biceps', 'forearms'],
          back: []
        },
        machines: {
          primary: {
            name: 'Halteres Emborrachados',
            description: 'Par de halteres com pegada neutra (palmas voltadas uma para a outra).',
            settingTips: 'Pode ser feito em pé ou sentado com apoio nas costas.'
          },
          alternatives: [
            {
              name: 'Rosca Martelo na Corda (Polia Baixa)',
              description: 'Puxador corda na polia baixa com pegada firme.'
            }
          ]
        },
        biomechanics: {
          setup: 'Em pé ou sentado, halteres ao lado do corpo com as palmas voltadas para dentro.',
          execution: 'Suba os halteres mantendo a pegada em formato de martelo até o topo, aperte o músculo por 1 segundo e desça suavemente.',
          breathing: 'Solte o ar subindo; puxe o ar descendo.',
          commonMistake: 'Girar os punhos no meio da repetição.',
          proTip: 'Esse exercício dá volume na lateral do braço, fazendo o braço parecer mais grosso e desenhado.'
        },
        animationKey: 'hammer'
      },
      {
        id: 'back-6',
        name: 'Prancha Isométrica + Infra',
        targetMuscle: 'Reto Abdominal & Core Profundo',
        secondaryMuscles: ['Transverso abdominal', 'Lombar'],
        sets: 3,
        reps: '45s Prancha + 15 Infra',
        restSeconds: 45,
        muscleGroup: 'core',
        activeBodyParts: {
          front: ['abs'],
          back: ['lowerback']
        },
        machines: {
          primary: {
            name: 'Colchonete / Torre de Paralelas',
            description: 'Superfície acolchoada no chão ou apoio de cotovelo na torre de abdominais.',
            settingTips: 'Certifique-se de que o colchonete apoia bem os antebraços.'
          },
          alternatives: [
            {
              name: 'Abdominal na Bola Suíça',
              description: 'Maior recrutamento de estabilidade do core.'
            }
          ]
        },
        biomechanics: {
          setup: 'Antebraços no chão, corpo em linha reta da cabeça aos calcanhares.',
          execution: 'Contraia o abdômen e os glúteos com força máxima. No infra, deitado, eleve as pernas sem descolar a lombar do chão.',
          breathing: 'Mantenha respiração contínua e controlada sem prender o ar.',
          commonMistake: 'Deixar o quadril cair em direção ao chão (sobrecarrega a lombar).',
          proTip: 'Puxe o umbigo em direção às costas para acionar o transverso abdominal.'
        },
        animationKey: 'plank'
      }
    ]
  },

  // QUARTA-FEIRA: OMBROS + TRÍCEPS + HIIT
  {
    dayName: 'Quarta-feira',
    dayShort: 'QUA',
    title: 'Ombros 3D, Tríceps & HIIT Explosivo',
    subtitle: 'Deltoides, Tríceps Ferradura e Queima Rápida',
    durationMin: 60,
    focusTag: 'TREINO C · OMBROS & HIIT',
    finishCardio: {
      name: 'HIIT Protocolo 1x1 na Esteira',
      type: 'HIIT',
      durationMin: 12,
      protocol: '6 ciclos: 1 minuto em tiro de corrida acelerada (vel. 9 a 11 km/h) alternado com 1 minuto de caminhada de recuperação (vel. 5 km/h).',
      caloriesBurnTarget: 140
    },
    exercises: [
      {
        id: 'sh-1',
        name: 'Desenvolvimento com Halteres',
        targetMuscle: 'Deltoide Anterior & Médio',
        secondaryMuscles: ['Tríceps', 'Trapézio Superior'],
        sets: 4,
        reps: '10 - 12',
        restSeconds: 60,
        muscleGroup: 'shoulders',
        activeBodyParts: {
          front: ['shoulders', 'triceps'],
          back: ['traps']
        },
        machines: {
          primary: {
            name: 'Banco Regulável a 75° ou 80°',
            description: 'Banco com encosto ligeiramente inclinado para poupar a lombar.',
            settingTips: 'Evite o banco em 90° retos; a leve inclinação a 80° é muito mais segura.'
          },
          alternatives: [
            {
              name: 'Desenvolvimento em Máquina Articulada',
              description: 'Trajetória convergente com apoio de peito/costas.'
            },
            {
              name: 'Desenvolvimento na Barra Guiada (Smith)',
              description: 'Barra no Smith descendo na linha do queixo.'
            }
          ]
        },
        biomechanics: {
          setup: 'Sente-se com as costas apoiadas, halteres na altura das orelhas, cotovelos a 45° à frente do corpo.',
          execution: 'Empurre os halteres para cima até quase esticar os braços no topo. Desça até a altura das orelhas sentindo o ombro trabalhar.',
          breathing: 'Solte o ar subindo; puxe o ar descendo devagar.',
          commonMistake: 'Abrir demais os cotovelos para os lados (estresse na articulação do manguito rotador).',
          proTip: 'Não bata os halteres no alto; pare um pouco antes para manter a tensão nos deltoides.'
        },
        animationKey: 'shoulderPress'
      },
      {
        id: 'sh-2',
        name: 'Elevação Lateral no Cabo ou Halteres',
        targetMuscle: 'Deltoide Lateral (Ombro Redondo)',
        secondaryMuscles: ['Trapézio Superior'],
        sets: 4,
        reps: '12 - 15',
        restSeconds: 45,
        muscleGroup: 'shoulders',
        activeBodyParts: {
          front: ['shoulders'],
          back: []
        },
        machines: {
          primary: {
            name: 'Cross Over (Polia Baixa)',
            description: 'Cabo passando por trás ou pela frente do corpo com puxador estribo.',
            settingTips: 'A polia baixa mantém a tensão muscular desde o início da subida.'
          },
          alternatives: [
            {
              name: 'Elevação Lateral com Halteres',
              description: 'Exercício clássico com halteres leves a moderados.'
            },
            {
              name: 'Máquina de Elevação Lateral Sentado',
              description: 'Alavancas com almofadas apoiadas nos braços.'
            }
          ]
        },
        biomechanics: {
          setup: 'Tronco levemente inclinado para frente (5°), cotovelos com microflexão.',
          execution: 'Eleve os braços para os lados até a linha dos ombros, liderando o movimento com os cotovelos (e não com as mãos).',
          breathing: 'Expire subindo; inspire descendo suave em 2 segundos.',
          commonMistake: 'Usar peso excessivo e ficar dando trancos com o tronco.',
          proTip: 'Imagine que está despejando água de duas jarras no ponto mais alto.'
        },
        animationKey: 'lateralRaise'
      },
      {
        id: 'sh-3',
        name: 'Crucifixo Inverso (Peck Deck ou Cabo)',
        targetMuscle: 'Deltoide Posterior & Trapézio Médio',
        secondaryMuscles: ['Romboides', 'Manguito Rotador'],
        sets: 3,
        reps: '15',
        restSeconds: 45,
        muscleGroup: 'shoulders',
        activeBodyParts: {
          front: [],
          back: ['shoulders', 'midback']
        },
        machines: {
          primary: {
            name: 'Máquina Peck Deck Invertida (Voador Inverso)',
            description: 'Sentado de frente para o encosto com braços na altura dos ombros.',
            settingTips: 'Ajuste a altura do banco para que suas mãos fiquem na linha exata dos ombros.'
          },
          alternatives: [
            {
              name: 'Face Pull na Corda (Polia Alta)',
              description: 'Puxada em direção à testa afastando as pontas da corda.'
            },
            {
              name: 'Crucifixo Inverso com Halteres',
              description: 'Tronco inclinado a 45° com peito apoiado no banco.'
            }
          ]
        },
        biomechanics: {
          setup: 'Peito apoiado no banco da máquina, pegada neutra ou pronada com cotovelos quase retos.',
          execution: 'Abra os braços para trás até a linha do tronco, contraindo a parte de trás do ombro. Retorne sem deixar as anilhas baterem.',
          breathing: 'Solte o ar na abertura; puxe o ar ao fechar os braços.',
          commonMistake: 'Encolher os ombros no pescoço ativando só o trapézio superior.',
          proTip: 'Mantenha os ombros relaxados para baixo e foque em sentir a parte de trás do deltoide.'
        },
        animationKey: 'facepull'
      },
      {
        id: 'sh-4',
        name: 'Tríceps Corda na Polia Alta',
        targetMuscle: 'Tríceps (Cabeça Lateral)',
        secondaryMuscles: ['Antebraços'],
        sets: 4,
        reps: '12 - 15',
        restSeconds: 45,
        muscleGroup: 'arms',
        activeBodyParts: {
          front: [],
          back: ['triceps']
        },
        machines: {
          primary: {
            name: 'Polia Alta com Acessório Corda',
            description: 'Cabo superior com corda dupla de pontas emborrachadas.',
            settingTips: 'Regule a roldana na altura máxima para amplitude total.'
          },
          alternatives: [
            {
              name: 'Tríceps Barra Reta ou V',
              description: 'Permite mais estabilidade e cargas maiores.'
            }
          ]
        },
        biomechanics: {
          setup: 'Em pé, tronco levemente inclinado à frente, cotovelos fixados ao lado das costelas.',
          execution: 'Estenda os braços para baixo até o final e, no final, abra as pontas da corda para fora para máxima contração.',
          breathing: 'Expire estendendo o braço; inspire subindo até 90° no cotovelo.',
          commonMistake: 'Deixar os cotovelos irem para frente e para trás na repetição.',
          proTip: 'Segure 1 segundo no final com o tríceps totalmente espremido antes de voltar.'
        },
        animationKey: 'tricepsRope'
      }
    ]
  },

  // QUINTA-FEIRA: GLÚTEOS + ISQUIOTIBIAIS + ABDÔMEN
  {
    dayName: 'Quinta-feira',
    dayShort: 'QUI',
    title: 'Glúteos Máximos, Posterior & Cintura',
    subtitle: 'Hip Thrust, Cadeira Abdutora e Core',
    durationMin: 60,
    focusTag: 'TREINO D · GLÚTEOS & POSTERIOR',
    finishCardio: {
      name: 'Escada (StairMaster) Queima de Glúteos',
      type: 'StairMaster',
      durationMin: 10,
      protocol: 'Ritmo moderado/alto (nível 6 a 8), pisando com o pé inteiro no degrau e empurrando com o calcanhar.',
      caloriesBurnTarget: 110
    },
    exercises: [
      {
        id: 'glute-1',
        name: 'Elevação Pélvica (Hip Thrust)',
        targetMuscle: 'Glúteo Máximo',
        secondaryMuscles: ['Isquiotibiais', 'Eretores da Espinha'],
        sets: 4,
        reps: '10 - 12 (com pausa 2s)',
        restSeconds: 75,
        muscleGroup: 'glutes',
        activeBodyParts: {
          front: [],
          back: ['glutes', 'hamstrings']
        },
        machines: {
          primary: {
            name: 'Máquina Hip Thrust Dedicada',
            description: 'Aparelho com cinto acolchoado, apoio de costas fixo e plataforma de pés.',
            settingTips: 'Ajuste o cinto bem firme sobre a dobra do quadril (crista ilíaca).'
          },
          alternatives: [
            {
              name: 'Banco Livre + Barra com Espuma',
              description: 'Apoio das escápulas no banco e barra com protetor de quadril.'
            },
            {
              name: 'Elevação Pélvica no Smith Machine',
              description: 'Mais facilidade para travar e destravar o peso sozinho.'
            }
          ]
        },
        biomechanics: {
          setup: 'Escápulas apoiadas no banco, pés no chão na largura dos quadris, joelhos formando 90° no ponto mais alto.',
          execution: 'Empurre a barra para cima usando os glúteos até alinhar quadril, joelho e tronco. Segure 2 segundos no topo contraindo o bumbum com força e desça controlando.',
          breathing: 'Solte o ar subindo o quadril; puxe o ar descendo suavemente.',
          commonMistake: 'Hiperextender a lombar no topo em vez de contrair o glúteo.',
          proTip: 'Mantenha o queixo encostado no peito durante todo o movimento para proteger a coluna.'
        },
        animationKey: 'hipthrust'
      },
      {
        id: 'glute-2',
        name: 'Agachamento Búlgaro ou Sumô',
        targetMuscle: 'Glúteo Máximo & Quadríceps',
        secondaryMuscles: ['Adutores', 'Posterior de Coxa'],
        sets: 3,
        reps: '10 cada perna',
        restSeconds: 60,
        muscleGroup: 'glutes',
        activeBodyParts: {
          front: ['quads'],
          back: ['glutes']
        },
        machines: {
          primary: {
            name: 'Banco Reto ou Step + Halteres',
            description: 'Pé traseiro apoiado no banco e halteres nas mãos.',
            settingTips: 'Coloque um colchonete no chão para guiar o joelho de trás.'
          },
          alternatives: [
            {
              name: 'Agachamento Sumô no Step com Halter',
              description: 'Pés bem afastados sobre dois steps, descendo o halter até o meio.'
            }
          ]
        },
        biomechanics: {
          setup: 'Dê um passo à frente do banco e apoie o peito do pé de trás nele. Tronco ligeiramente inclinado para frente.',
          execution: 'Desça o joelho de trás em direção ao chão até a coxa da frente ficar paralela. Suba empurrando pelo calcanhar da frente.',
          breathing: 'Inspire na descida; expire na subida forte.',
          commonMistake: 'Dar passos muito curtos deixando o joelho da frente passar excessivamente da ponta dos pés.',
          proTip: 'A leve inclinação do tronco para a frente transfere o foco de tensão diretamente para o glúteo.'
        },
        animationKey: 'bulgarian'
      },
      {
        id: 'glute-3',
        name: 'Cadeira Abdutora (Tronco Inclinado)',
        targetMuscle: 'Glúteo Médio e Mínimo',
        secondaryMuscles: ['Tensor da Fáscia Lata'],
        sets: 4,
        reps: '15 - 20 (Drop-set na última)',
        restSeconds: 45,
        muscleGroup: 'glutes',
        activeBodyParts: {
          front: [],
          back: ['glutes']
        },
        machines: {
          primary: {
            name: 'Cadeira Abdutora de Placas',
            description: 'Aparelho sentado com apoios almofadados nas laterais externas dos joelhos.',
            settingTips: 'Ajuste a alavanca para começar com as pernas o mais fechadas possível para amplitude total.'
          },
          alternatives: [
            {
              name: 'Abdução de Quadril na Polia Baixa',
              description: 'Cabo baixo com tornozeleira em pé.'
            }
          ]
        },
        biomechanics: {
          setup: 'Sente com o bumbum na ponta do banco e incline o tronco ligeiramente para a frente (45°), segurando nas manoplas.',
          execution: 'Abra as pernas o máximo que puder empurrando com os joelhos. Segure 1 segundo aberto e feche em 3 segundos sem deixar o peso bater.',
          breathing: 'Solte o ar na abertura máxima; puxe o ar no fechamento controlado.',
          commonMistake: 'Empurrar com a ponta dos pés em vez de fazer força nos joelhos.',
          proTip: 'Inclinar o tronco à frente alonga o glúteo médio e ativa muito mais a lateral do bumbum.'
        },
        animationKey: 'abductor'
      }
    ]
  },

  // SEXTA-FEIRA: PEITO + BRAÇOS + CARDIO
  {
    dayName: 'Sexta-feira',
    dayShort: 'SEX',
    title: 'Peitoral Esculpido & Braços Completos',
    subtitle: 'Supino, Crucifixo e Desafio Semanal',
    durationMin: 60,
    focusTag: 'TREINO E · PEITO & BRAÇOS',
    finishCardio: {
      name: 'Desafio Semanal de Queima Rápida',
      type: 'HIIT',
      durationMin: 12,
      protocol: 'Tiros de 45 segundos em velocidade alta seguidos de 45 segundos de descanso ativo para queimar o máximo de calorias antes do fim de semana.',
      caloriesBurnTarget: 130
    },
    exercises: [
      {
        id: 'chest-1',
        name: 'Supino Reto (Barra ou Halteres)',
        targetMuscle: 'Peitoral Maior (Porção Média/Geral)',
        secondaryMuscles: ['Tríceps', 'Deltoide Anterior'],
        sets: 4,
        reps: '8 - 10',
        restSeconds: 75,
        muscleGroup: 'chest',
        activeBodyParts: {
          front: ['chest', 'shoulders', 'triceps'],
          back: []
        },
        machines: {
          primary: {
            name: 'Banco de Supino Reto com Barra Olímpica',
            description: 'Banco clássico com suportes verticais de barra.',
            settingTips: 'Deite de modo que seus olhos fiquem alinhados logo abaixo da barra guardada.'
          },
          alternatives: [
            {
              name: 'Supino Reto com Halteres',
              description: 'Permite maior amplitude de descida e protege os ombros.'
            },
            {
              name: 'Supino Máquina Articulada',
              description: 'Trajetória fixa sem risco da barra prender no peito.'
            }
          ]
        },
        biomechanics: {
          setup: 'Deite com os pés firmes no chão, junte as escápulas atrás das costas e faça uma ponte lombar natural.',
          execution: 'Tire a barra e desça controladamente até tocar suavemente a linha dos mamilos. Empurre para cima sem perder a postura das escápulas.',
          breathing: 'Inspire na descida da barra; expire empurrando o peso para cima.',
          commonMistake: 'Bater a barra com força no peito para pegar impulso de rebote.',
          proTip: 'Não aponte os cotovelos a 90° como um T; mantenha-os a 45° ou 60° em relação ao tronco.'
        },
        animationKey: 'benchpress'
      },
      {
        id: 'chest-2',
        name: 'Supino Inclinado com Halteres',
        targetMuscle: 'Peitoral Superior (Clavicular)',
        secondaryMuscles: ['Deltoide Anterior', 'Tríceps'],
        sets: 4,
        reps: '10 - 12',
        restSeconds: 60,
        muscleGroup: 'chest',
        activeBodyParts: {
          front: ['chest', 'shoulders', 'triceps'],
          back: []
        },
        machines: {
          primary: {
            name: 'Banco Inclinado a 30° ou 45° + Halteres',
            description: 'Banco com inclinação regulada para focar na parte de cima do peito.',
            settingTips: 'A inclinação ideal é de 30° a 40° para não roubar o trabalho para os ombros.'
          },
          alternatives: [
            {
              name: 'Supino Inclinado no Smith Machine',
              description: 'Mais estabilidade para focar no músculo com cargas progressivas.'
            }
          ]
        },
        biomechanics: {
          setup: 'Sente-se no banco inclinado com os halteres sobre os joelhos. Use os joelhos para chutar os halteres para cima.',
          execution: 'Desça os halteres nas laterais do peitoral superior e empurre para cima convergindo os pesos no topo.',
          breathing: 'Inspire descendo; solte o ar empurrando os halteres.',
          commonMistake: 'Inclinar o banco em 60° (vira treino de ombro em vez de peito superior).',
          proTip: 'No topo, concentre-se em espremer a parte superior do peito junta.'
        },
        animationKey: 'inclineBench'
      },
      {
        id: 'chest-3',
        name: 'Crucifixo / Peck Deck (Voador)',
        targetMuscle: 'Isolamento de Peitoral',
        secondaryMuscles: ['Deltoide Anterior'],
        sets: 3,
        reps: '12 - 15',
        restSeconds: 45,
        muscleGroup: 'chest',
        activeBodyParts: {
          front: ['chest'],
          back: []
        },
        machines: {
          primary: {
            name: 'Máquina Peck Deck (Voador Peitoral)',
            description: 'Aparelho sentado com braços alavancados e pegadores confortáveis.',
            settingTips: 'Ajuste a altura do banco para que as manoplas fiquem na linha média do peito.'
          },
          alternatives: [
            {
              name: 'Cross Over na Polia Média',
              description: 'Cabos trazendo os braços em abraço à frente do corpo.'
            },
            {
              name: 'Crucifixo Reto com Halteres',
              description: 'Deitado no banco reto abrindo os braços com cotovelos semiflexionados.'
            }
          ]
        },
        biomechanics: {
          setup: 'Costas bem apoiadas no encosto, cotovelos levemente flexionados.',
          execution: 'Feche os braços como se estivesse abraçando uma árvore grossa. Segure 1 segundo espremendo o peito no centro e abra devagar.',
          breathing: 'Solte o ar ao fechar os braços; puxe o ar ao abrir sentindo alongar o peito.',
          commonMistake: 'Esticar os braços 100% sobrecarregando a articulação do cotovelo.',
          proTip: 'Sinta o peitoral se esticar na fase aberta antes de começar a fechar.'
        },
        animationKey: 'fly'
      }
    ]
  }
];
