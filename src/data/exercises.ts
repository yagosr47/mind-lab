import { caseById } from '@/data/cases'
import { scenarioById } from '@/data/scenarios'
import { XP_BASE } from '@/lib/scoring'
import type {
  AttrKey,
  Difficulty,
  DifficultyConfig,
  Exercise,
  StatementPayload,
  TacticalPayload,
} from '@/types/lab'

/**
 * CATÁLOGO — 42 exercícios (3 por atributo, 14 atributos).
 *
 * Os payloads são os parâmetros que cada motor lê em tempo de execução.
 * Os três níveis sempre existem; o que muda é a densidade do estímulo, o
 * tempo de exposição, o cronômetro e a quantidade de ruído.
 */

type LevelSpec = [timeLimit: number | null, description: string, payload: Record<string, unknown>]

const LABEL: Record<Difficulty, DifficultyConfig['label']> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
}

function config(level: Difficulty, spec: LevelSpec): DifficultyConfig {
  const [timeLimitSec, description, payload] = spec
  return {
    level,
    label: LABEL[level],
    timeLimitSec,
    xpReward: XP_BASE[level],
    description,
    payload,
  }
}

function three(easy: LevelSpec, medium: LevelSpec, hard: LevelSpec): Record<Difficulty, DifficultyConfig> {
  return {
    easy: config('easy', easy),
    medium: config('medium', medium),
    hard: config('hard', hard),
  }
}

/** Recorta o dossiê e deriva as respostas a partir das falhas do caso. */
function audit(
  caseId: string,
  visible: number,
  required: number,
  redHerrings = false,
): Record<string, unknown> {
  const file = caseById(caseId)
  const payload: StatementPayload = {
    caseId,
    visible,
    required,
    answers: file.flaws.filter((index) => index < visible),
    reasons: file.reasons,
    correctReason: file.correctReason,
    redHerrings,
  }
  return { ...payload }
}

const TACTICAL_PRESETS: Record<Difficulty, Omit<TacticalPayload, 'scenarioId'>> = {
  easy: {
    rounds: 3,
    startSuspicion: 15,
    startAdvantage: 40,
    targetAdvantage: 60,
    suspicionLimit: 100,
    feedback: 'full',
  },
  medium: {
    rounds: 3,
    startSuspicion: 30,
    startAdvantage: 35,
    targetAdvantage: 72,
    suspicionLimit: 100,
    feedback: 'full',
    delayedConsequences: true,
  },
  hard: {
    rounds: 3,
    startSuspicion: 50,
    startAdvantage: 55,
    targetAdvantage: 85,
    suspicionLimit: 100,
    feedback: 'hidden',
  },
}

/** Payload tático com a meta ajustada ao número de turnos do cenário. */
function tactical(scenarioId: string, level: Difficulty): Record<string, unknown> {
  const scenario = scenarioById(scenarioId)
  const preset = TACTICAL_PRESETS[level]
  const rounds = Math.min(scenario.rounds.length, preset.rounds + 1)
  const targetBonus = Math.max(0, rounds - 3) * 6
  return {
    ...preset,
    rounds,
    targetAdvantage: preset.targetAdvantage + targetBonus,
    scenarioId,
  }
}

export const EXERCISES: Exercise[] = [
  /* ---------------------------------------------------------------- */
  /* INTELLIGENCE — Cognição e Padrões                                 */
  /* ---------------------------------------------------------------- */
  {
    id: 'int-matriz',
    attr: 'intelligence',
    title: 'Matriz de Sequência Abstrata',
    subtitle: 'Progressões geométricas em grade',
    engine: 'memory-matrix',
    instructions:
      'Uma sequência de células acende na grade. Memorize a ordem e reproduza o caminho na mesma sequência.',
    cognitivePrinciple:
      'Memória de trabalho visuoespacial. O cérebro armazena padrões como relações, não como pixels: quanto mais você agrupa em formas, mais células cabem no mesmo buffer.',
    difficulties: three(
      [null, '3x3 · 4s de exposição · 3 sequências', { gridSize: 3, exposureMs: 4000, mode: 'sequence', trials: 3, litCount: 4 }],
      [null, '4x4 · 2.5s de exposição · 4 sequências', { gridSize: 4, exposureMs: 2500, mode: 'sequence', trials: 4, litCount: 5 }],
      [null, '5x5 · 1.5s de exposição · 5 sequências', { gridSize: 5, exposureMs: 1500, mode: 'sequence', trials: 5, litCount: 6 }],
    ),
  },
  {
    id: 'int-nback',
    attr: 'intelligence',
    title: 'Dual N-Back Espacial',
    subtitle: 'Coincidência N posições atrás',
    engine: 'memory-matrix',
    instructions:
      'Posições aparecem uma de cada vez. Marque ACERTO sempre que a posição atual for igual à de N passos atrás.',
    cognitivePrinciple:
      'Atualização contínua da memória de trabalho. O N-Back mede a capacidade de manter e comparar informação em fluxo — o mesmo esforço exigido por leitura tática e escuta em reunião.',
    difficulties: three(
      [null, 'N = 1 · 12 estímulos · 1.0s por estímulo', { gridSize: 3, exposureMs: 900, mode: 'nback', trials: 12, litCount: 1, n: 1, streamMs: 1000 }],
      [null, 'N = 2 · 14 estímulos · 0.85s por estímulo', { gridSize: 3, exposureMs: 750, mode: 'nback', trials: 14, litCount: 1, n: 2, streamMs: 850 }],
      [null, 'N = 2 · 16 estímulos · 0.65s por estímulo', { gridSize: 4, exposureMs: 600, mode: 'nback', trials: 16, litCount: 1, n: 2, streamMs: 650 }],
    ),
  },
  {
    id: 'int-regras',
    attr: 'intelligence',
    title: 'Decodificador de Regras',
    subtitle: 'Leis ocultas em sequências',
    engine: 'rule-shift',
    instructions:
      'Uma regra oculta define qual carta combina com o estímulo. Descubra pelo erro qual atributo está valendo — e perceba quando ele muda.',
    cognitivePrinciple:
      'Aprendizagem por hipótese e teste. O cérebro tende a perseverar na primeira regra que funciona; detectar a troca de critério exige desligar a resposta antiga.',
    difficulties: three(
      [null, 'Regra fixa por 6 acertos · 20 rodadas', { changeEvery: 6, trials: 20, attributes: ['shape', 'count'] }],
      [null, 'Regra muda a cada 5 acertos · 25 rodadas', { changeEvery: 5, trials: 25, attributes: ['color', 'shape', 'count'] }],
      [null, 'Regra muda a cada 4 acertos · 30 rodadas · cartas ambíguas', { changeEvery: 4, trials: 30, ambiguous: true, attributes: ['color', 'shape', 'count'] }],
    ),
  },

  /* ---------------------------------------------------------------- */
  /* EMOTION — Leitura Fria                                            */
  /* ---------------------------------------------------------------- */
  {
    id: 'emo-incongruencia',
    attr: 'emotion',
    title: 'Incongruência Verbal',
    subtitle: 'Onde o tom contradiz o relato',
    engine: 'statement-audit',
    instructions:
      'Leia o depoimento e clique nas cláusulas que não fecham. Depois escolha o motivo técnico da falha.',
    cognitivePrinciple:
      'Leitura de vazamento emocional. Quando o afeto e o conteúdo seguem caminhos diferentes, o corpo entrega primeiro: a incongruência aparece na física da cena, não na emoção declarada.',
    difficulties: three(
      [null, '1 contradição em 4 cláusulas', audit('patamar-42', 4, 1)],
      [null, '2 contradições em 6 cláusulas', audit('patamar-42', 6, 2)],
      [45, '2 contradições em 8 cláusulas · cronômetro de 45s', audit('patamar-42', 8, 2, true)],
    ),
  },
  {
    id: 'emo-microsinais',
    attr: 'emotion',
    title: 'Triagem de Microsinais',
    subtitle: 'Tensão x neutralidade sob pressão',
    engine: 'stroop-reaction',
    instructions:
      'Classifique cada descrição como TENSÃO ou NEUTRO antes que a barra de tempo zere. Use as teclas 1 e 2.',
    cognitivePrinciple:
      'Reconhecimento de expressão sob restrição temporal. O julgamento rápido de microsinais depende de reconhecimento de padrão, não de análise consciente.',
    difficulties: three(
      [45, '10 estímulos · 3.0s cada', { task: 'classify', pool: 'microsignals', rounds: 10, roundMs: 3000 }],
      [45, '15 estímulos · 2.0s cada · estímulo piscante', { task: 'classify', pool: 'microsignals', rounds: 15, roundMs: 2000, blink: true }],
      [40, '20 estímulos · 1.3s cada · ruído visual', { task: 'classify', pool: 'microsignals', rounds: 20, roundMs: 1300, blink: true, distractors: true }],
    ),
  },
  {
    id: 'emo-termometro',
    attr: 'emotion',
    title: 'Termômetro de Vulnerabilidade',
    subtitle: 'Três perguntas, um gatilho dominante',
    engine: 'tactical-tree',
    instructions:
      'Conduza a conversa em três turnos e identifique o gatilho emocional dominante: ego, culpa, apego ou utilidade.',
    cognitivePrinciple:
      'Escuta ativa sob incerteza. O gatilho emocional raramente é declarado; ele aparece nas respostas que o interlocutor dá quando você oferece o assunto errado.',
    difficulties: three(
      [null, 'Feedback completo de cada escolha', tactical('termometro-vulnerabilidade', 'easy')],
      [null, 'Consequências de 2ª ordem ocultas até o fim', tactical('termometro-vulnerabilidade', 'medium')],
      [null, 'Começa com 50% de suspeita · meta de 85% de leitura', tactical('termometro-vulnerabilidade', 'hard')],
    ),
  },

  /* ---------------------------------------------------------------- */
  /* PROFILING — Perfis Psicológicos                                   */
  /* ---------------------------------------------------------------- */
  {
    id: 'pro-autopsia',
    attr: 'profiling',
    title: 'Autópsia de Ambiente',
    subtitle: 'Rotina, ofício e falhas pelo rastro',
    engine: 'statement-audit',
    instructions:
      'Analise a vistoria do imóvel e clique nas cláusulas que denunciam a rotina real dos moradores.',
    cognitivePrinciple:
      'Inferência a partir de vestígios. Objetos preservam hábitos: temperatura, umidade e posição contam uma rotina que o morador não relata.',
    difficulties: three(
      [null, '1 falha em 4 cláusulas', audit('apartamento-42', 4, 1)],
      [null, '2 falhas em 6 cláusulas', audit('apartamento-42', 6, 2)],
      [null, '2 falhas em 8 cláusulas · pistas falsas', audit('apartamento-42', 8, 2, true)],
    ),
  },
  {
    id: 'pro-assinatura',
    attr: 'profiling',
    title: 'Assinatura Comportamental',
    subtitle: 'A próxima ação de um perfil',
    engine: 'rule-shift',
    instructions:
      'Cada escolha revela parte do padrão do alvo. Descubra qual atributo ele prioriza e antecipe a decisão seguinte.',
    cognitivePrinciple:
      'Previsão comportamental por consistência de traço. Pessoas repetem o critério de decisão mesmo quando o contexto muda — o perfil é a regra, não o episódio.',
    difficulties: three(
      [null, 'Padrão estável · 6 acertos por ciclo', { changeEvery: 6, trials: 20, attributes: ['shape', 'count'] }],
      [null, 'Padrão revisado a cada 5 acertos', { changeEvery: 5, trials: 25, attributes: ['color', 'shape'] }],
      [null, 'Padrão revisado a cada 4 acertos · sinais ambíguos', { changeEvery: 4, trials: 28, ambiguous: true, attributes: ['color', 'shape', 'count'] }],
    ),
  },
  {
    id: 'pro-alavancas',
    attr: 'profiling',
    title: 'Mapeamento de Alavancas',
    subtitle: 'Ego, culpa, apego ou curiosidade',
    engine: 'tactical-tree',
    instructions:
      'Sondeie a diretora de compras em três turnos e descubra qual alavanca move a decisão dela.',
    cognitivePrinciple:
      'Motivação dominante. Todo perfil responde a mais de um incentivo, mas apenas um reduz a resistência sem aumentar a vigilância.',
    difficulties: three(
      [null, 'Impacto visível em cada escolha', tactical('mapeamento-alavancas', 'easy')],
      [null, 'Efeitos de 2ª ordem revelados só no fim', tactical('mapeamento-alavancas', 'medium')],
      [null, 'Suspeita inicial de 50% · meta de 85%', tactical('mapeamento-alavancas', 'hard')],
    ),
  },

  /* ---------------------------------------------------------------- */
  /* SELF — Controle de Impulsos                                       */
  /* ---------------------------------------------------------------- */
  {
    id: 'self-stroop',
    attr: 'self',
    title: 'Protocolo Stroop',
    subtitle: 'Inibição da resposta automática',
    engine: 'stroop-reaction',
    instructions:
      'A palavra diz uma cor, a tinta mostra outra. Responda a COR DA TINTA. Quando a regra inverter, responda a PALAVRA.',
    cognitivePrinciple:
      'Inibição de resposta. O conflito cor/palavra força o córtex pré-frontal a bloquear a leitura automática — o mesmo músculo usado para não responder a uma provocação.',
    difficulties: three(
      [45, '10 estímulos · 3.0s · regra fixa', { task: 'ink', rounds: 10, roundMs: 3000 }],
      [45, '15 estímulos · 2.0s · regra inverte em estímulos piscantes', { task: 'ink', rounds: 15, roundMs: 2000, reverse: true, blink: true }],
      [40, '20 estímulos · 1.3s · regra alterna + ruído visual', { task: 'ink', rounds: 20, roundMs: 1300, reverse: true, blink: true, distractors: true }],
    ),
  },
  {
    id: 'self-provocacao',
    attr: 'self',
    title: 'Filtro de Provocação',
    subtitle: 'Compostura sob confronto hostil',
    engine: 'tactical-tree',
    instructions:
      'Responda às provocações de um cliente furioso sem morder nenhuma isca de ego. Três turnos, seis testemunhas.',
    cognitivePrinciple:
      'Regulação emocional em contexto social. Cada isca aceita transfere autoridade ao provocador; responder ao conteúdo, e não ao insulto, mantém o controle da conversa.',
    difficulties: three(
      [null, 'Consequências explícitas de cada fala', tactical('filtro-provocacao', 'easy')],
      [null, 'Impacto real revelado apenas no fim', tactical('filtro-provocacao', 'medium')],
      [null, 'Suspeita em 50% · meta de 85% sem estourar', tactical('filtro-provocacao', 'hard')],
    ),
  },
  {
    id: 'self-ruido',
    attr: 'self',
    title: 'Foco sob Ruído',
    subtitle: 'Coordenadas com alertas falsos',
    engine: 'memory-matrix',
    instructions:
      'Memorize as células acesas enquanto alertas falsos piscam na grade. Depois, reproduza exatamente o padrão.',
    cognitivePrinciple:
      'Atenção seletiva. Alertas irrelevantes competem pelo mesmo recurso atencional; ignorar o ruído é uma decisão ativa, não passiva.',
    difficulties: three(
      [null, '4x4 · 4s de exposição · sem distratores', { gridSize: 4, exposureMs: 4000, mode: 'recall', trials: 3, litCount: 4 }],
      [null, '4x4 · 2.5s · alertas falsos ativos', { gridSize: 4, exposureMs: 2500, mode: 'recall', trials: 4, litCount: 5, distractors: true }],
      [null, '5x5 · 1.5s · alertas falsos de alta frequência', { gridSize: 5, exposureMs: 1500, mode: 'recall', trials: 5, litCount: 6, distractors: true }],
    ),
  },

  /* ---------------------------------------------------------------- */
  /* MANIPULATION — Persuasão e Enquadramento                          */
  /* ---------------------------------------------------------------- */
  {
    id: 'man-framing',
    attr: 'manipulation',
    title: 'Arquitetura de Escolha',
    subtitle: 'A ideia dele, a decisão sua',
    engine: 'tactical-tree',
    instructions:
      'Conduza o sócio até a opção desejada sem apresentá-la como sua. Se ele perceber a condução, a suspeita sobe.',
    cognitivePrinciple:
      'Efeito de autoria. Uma escolha defendida publicamente se torna mais resistente que a mesma escolha imposta — porque o autor precisa manter coerência consigo.',
    difficulties: three(
      [null, 'Feedbacks completos por turno', tactical('arquitetura-escolha', 'easy')],
      [null, 'Consequências de 2ª ordem ocultas', tactical('arquitetura-escolha', 'medium')],
      [null, 'Suspeita inicial de 50% · meta de 85%', tactical('arquitetura-escolha', 'hard')],
    ),
  },
  {
    id: 'man-vies',
    attr: 'manipulation',
    title: 'Detector de Viés',
    subtitle: 'Escassez, reciprocidade e culpa',
    engine: 'statement-audit',
    instructions:
      'Ouça a ligação comercial e clique nas cláusulas que usam gatilho psicológico. Depois nomeie o viés empregado.',
    cognitivePrinciple:
      'Reconhecimento de influência. Gatilhos funcionam reduzindo tempo de análise: escassez e prazo curto atacam a capacidade de decidir com calma.',
    difficulties: three(
      [null, '1 gatilho em 4 cláusulas', audit('lote-escassez', 4, 1)],
      [null, '2 gatilhos em 6 cláusulas', audit('lote-escassez', 6, 2)],
      [45, '2 gatilhos em 8 cláusulas · 45s de cronômetro', audit('lote-escassez', 8, 2, true)],
    ),
  },
  {
    id: 'man-negociacao',
    attr: 'manipulation',
    title: 'Negociação Assimétrica',
    subtitle: 'Concessões de quem sabe mais',
    engine: 'tactical-tree',
    instructions:
      'Extraia três concessões de um parceiro que tem mais informação. Cada lance altera a vantagem e a desconfiança.',
    cognitivePrinciple:
      'Assimetria de informação. Quem sabe menos negocia melhor quando troca exigência por informação — e pior quando tenta compensar a desvantagem com pressa.',
    difficulties: three(
      [null, 'Impacto de cada lance exposto', tactical('negociacao-assimetrica', 'easy')],
      [null, 'Custo real das concessões revelado no fim', tactical('negociacao-assimetrica', 'medium')],
      [null, 'Suspeita em 50% · meta de 85% de vantagem', tactical('negociacao-assimetrica', 'hard')],
    ),
  },

  /* ---------------------------------------------------------------- */
  /* FIELD — Improviso Tático                                          */
  /* ---------------------------------------------------------------- */
  {
    id: 'fld-recursos',
    attr: 'field',
    title: 'Recursos Escassos',
    subtitle: 'Escapar com três itens improvisados',
    engine: 'tactical-tree',
    instructions:
      'Um extintor, um cabo de rede e um crachá. Três turnos para sair do galpão antes que o cerco feche.',
    cognitivePrinciple:
      'Improviso sob restrição. A saída raramente usa o objeto para a função original; o pensamento tático busca propriedade física, não utilidade declarada.',
    difficulties: three(
      [null, 'Consequências visíveis de cada uso', tactical('recursos-escassos', 'easy')],
      [null, 'Efeitos colaterais revelados só no fechamento', tactical('recursos-escassos', 'medium')],
      [null, 'Suspeita inicial de 50% · saída exige 85%', tactical('recursos-escassos', 'hard')],
    ),
  },
  {
    id: 'fld-rota',
    attr: 'field',
    title: 'Rota de Contingência',
    subtitle: 'O mapa muda quando a saída fecha',
    engine: 'memory-matrix',
    instructions:
      'Memorize o mapa de bloqueios. Uma saída será fechada e você terá de apontar a única célula que mudou.',
    cognitivePrinciple:
      'Replanejamento espacial. Manter o mapa mental disponível enquanto ele é alterado exige memória de trabalho e inibição do mapa antigo.',
    difficulties: three(
      [null, '4x4 · 4s · 3 mapas', { gridSize: 4, exposureMs: 4000, mode: 'change', trials: 3, litCount: 5 }],
      [null, '5x5 · 2.5s · 4 mapas', { gridSize: 5, exposureMs: 2500, mode: 'change', trials: 4, litCount: 6 }],
      [null, '5x5 · 1.5s · 5 mapas · ruído', { gridSize: 5, exposureMs: 1500, mode: 'change', trials: 5, litCount: 7, distractors: true }],
    ),
  },
  {
    id: 'fld-virada',
    attr: 'field',
    title: 'Virada de Mesa',
    subtitle: 'Usar a restrição contra o adversário',
    engine: 'rule-shift',
    instructions:
      'O cenário impõe limites e o adversário explora a regra. Descubra qual critério ele está usando e vire a mesa.',
    cognitivePrinciple:
      'Inversão de restrição. Toda regra que limita também prevê; encontrar a brecha é inverter a intenção do sistema que te restringe.',
    difficulties: three(
      [null, 'Critério estável por 6 rodadas', { changeEvery: 6, trials: 20, attributes: ['shape', 'count'] }],
      [null, 'Critério revisto a cada 5 acertos', { changeEvery: 5, trials: 24, attributes: ['color', 'count'] }],
      [null, 'Critério revisto a cada 4 acertos · cartas ambíguas', { changeEvery: 4, trials: 28, ambiguous: true, attributes: ['color', 'shape', 'count'] }],
    ),
  },

  /* ---------------------------------------------------------------- */
  /* SENSORY — Percepção Rápida                                        */
  /* ---------------------------------------------------------------- */
  {
    id: 'sen-flash',
    attr: 'sensory',
    title: 'Flash de Cena',
    subtitle: 'O único elemento alterado',
    engine: 'memory-matrix',
    instructions:
      'Observe a grade acesa por poucos segundos. Depois de oculta, uma célula muda: aponte qual foi.',
    cognitivePrinciple:
      'Memória icônica e comparação de cenas. A detecção de mudança depende de comparar a imagem retida com a nova, não de olhar mais tempo.',
    difficulties: three(
      [null, '4x4 · 2.0s de exposição · 3 cenas', { gridSize: 4, exposureMs: 2000, mode: 'change', trials: 3, litCount: 4 }],
      [null, '4x4 · 1.6s · 4 cenas', { gridSize: 4, exposureMs: 1600, mode: 'change', trials: 4, litCount: 5 }],
      [null, '5x5 · 1.2s · 5 cenas · ruído', { gridSize: 5, exposureMs: 1200, mode: 'change', trials: 5, litCount: 6, distractors: true }],
    ),
  },
  {
    id: 'sen-varredura',
    attr: 'sensory',
    title: 'Varredura Periférica',
    subtitle: 'Anomalias na borda da cena',
    engine: 'stroop-reaction',
    instructions:
      'Classifique cada detalhe como ANOMALIA ou ESPERADO enquanto o centro da tela pisca para desviar sua atenção.',
    cognitivePrinciple:
      'Atenção periférica. A visão periférica detecta movimento e quebra de padrão antes de identificar objeto — treinar isso é treinar alerta, não foco.',
    difficulties: three(
      [45, '10 estímulos · 3.0s · sem distração', { task: 'classify', pool: 'periferia', rounds: 10, roundMs: 3000 }],
      [45, '15 estímulos · 2.0s · ruído central', { task: 'classify', pool: 'periferia', rounds: 15, roundMs: 2000, distractors: true }],
      [40, '20 estímulos · 1.3s · ruído + piscada', { task: 'classify', pool: 'periferia', rounds: 20, roundMs: 1300, distractors: true, blink: true }],
    ),
  },
  {
    id: 'sen-antecipacao',
    attr: 'sensory',
    title: 'Leitura de Antecipação',
    subtitle: 'O detalhe antes da ação',
    engine: 'statement-audit',
    instructions:
      'No registro de observação, clique nas cláusulas que denunciam movimento iminente. Depois escolha o motivo técnico.',
    cognitivePrinciple:
      'Antecipação por preparação motora. Peso, pés e cotovelo se organizam antes do gesto; o corpo avisa a intenção alguns segundos antes.',
    difficulties: three(
      [null, '1 indício em 4 cláusulas', audit('saguao-hotel', 4, 1)],
      [null, '2 indícios em 6 cláusulas', audit('saguao-hotel', 6, 2)],
      [45, '2 indícios em 8 cláusulas · 45s', audit('saguao-hotel', 8, 2, true)],
    ),
  },

  /* ---------------------------------------------------------------- */
  /* REASONING — Dedução e Abdução                                     */
  /* ---------------------------------------------------------------- */
  {
    id: 'rea-hipoteses',
    attr: 'reasoning',
    title: 'Eliminação de Hipóteses',
    subtitle: 'Quatro álibis, um cruzamento',
    engine: 'statement-audit',
    instructions:
      'Cruze os depoimentos com o registro do sistema e clique nas cláusulas que sobrevivem ao confronto.',
    cognitivePrinciple:
      'Dedução por eliminação. O raciocínio correto não confirma a hipótese favorita: ele procura o dado que a destruiria e verifica se ela sobrevive.',
    difficulties: three(
      [null, '1 inconsistência em 4 cláusulas', audit('predio-9andar', 4, 1)],
      [null, '2 inconsistências em 6 cláusulas', audit('predio-9andar', 6, 2)],
      [null, '2 inconsistências em 8 cláusulas · pistas falsas', audit('predio-9andar', 8, 2, true)],
    ),
  },
  {
    id: 'rea-silogismo',
    attr: 'reasoning',
    title: 'Silogismo sob Pressão',
    subtitle: 'Validade formal em 1.3 segundos',
    engine: 'stroop-reaction',
    instructions:
      'Julgue cada argumento como VÁLIDO ou FALÁCIA antes que o tempo acabe. Não julgue o conteúdo, julgue a forma.',
    cognitivePrinciple:
      'Validade versus verdade. O cérebro aceita argumentos com conclusão plausível mesmo quando a forma é inválida; separar forma de conteúdo exige esforço deliberado.',
    difficulties: three(
      [45, '10 argumentos · 3.0s cada', { task: 'classify', pool: 'silogismos', rounds: 10, roundMs: 3000 }],
      [45, '15 argumentos · 2.0s · estímulo piscante', { task: 'classify', pool: 'silogismos', rounds: 15, roundMs: 2000, blink: true }],
      [40, '20 argumentos · 1.3s · ruído visual', { task: 'classify', pool: 'silogismos', rounds: 20, roundMs: 1300, blink: true, distractors: true }],
    ),
  },
  {
    id: 'rea-causal',
    attr: 'reasoning',
    title: 'Cadeia Causal',
    subtitle: 'Causa raiz por variável isolada',
    engine: 'rule-shift',
    instructions:
      'Isole uma variável por rodada. A causa raiz é o atributo que continua prevendo a falha quando os outros mudam.',
    cognitivePrinciple:
      'Inferência causal. Correlação muda de máscara; isolar variáveis é o único caminho para separar causa de coincidência.',
    difficulties: three(
      [null, 'Variável estável · 6 rodadas por ciclo', { changeEvery: 6, trials: 20, attributes: ['color', 'shape'] }],
      [null, 'Variável dominante muda a cada 5 acertos', { changeEvery: 5, trials: 24, attributes: ['color', 'shape', 'count'] }],
      [null, 'Muda a cada 4 acertos · sinais ambíguos', { changeEvery: 4, trials: 28, ambiguous: true, attributes: ['color', 'shape', 'count'] }],
    ),
  },

  /* ---------------------------------------------------------------- */
  /* DECEPTION — Atuação e Álibis                                      */
  /* ---------------------------------------------------------------- */
  {
    id: 'dec-alibi',
    attr: 'deception',
    title: 'Sustentação de Álibi',
    subtitle: 'Quatro perguntas, uma versão',
    engine: 'tactical-tree',
    instructions:
      'Sustente a mesma história por quatro perguntas. Cada incoerência aumenta a suspeita do investigador.',
    cognitivePrinciple:
      'Carga cognitiva da mentira. Manter uma narrativa falsa exige monitorar o que já foi dito; a mentira quebra na repetição, não na primeira resposta.',
    difficulties: three(
      [null, 'Feedback do investigador a cada resposta', tactical('sustentacao-alibi', 'easy')],
      [null, 'Consequências reais reveladas só no fim', tactical('sustentacao-alibi', 'medium')],
      [null, 'Começa com 50% de suspeita · alvo de 85%', tactical('sustentacao-alibi', 'hard')],
    ),
  },
  {
    id: 'dec-blefe',
    attr: 'deception',
    title: 'Blefe Calculado',
    subtitle: 'Vender a carta que não existe',
    engine: 'tactical-tree',
    instructions:
      'Você não tem o laudo. Ele não sabe disso. Conduza a negociação sem precisar provar o que não tem.',
    cognitivePrinciple:
      'Gestão de credibilidade. O blefe eficaz não é a negativa enfática: é a recusa calma em mostrar, sustentada por um limite de acesso plausível.',
    difficulties: three(
      [null, 'Impacto de cada fala visível', tactical('blefe-calculado', 'easy')],
      [null, 'Custo escondido revelado no fechamento', tactical('blefe-calculado', 'medium')],
      [null, 'Suspeita inicial de 50% · meta de 85%', tactical('blefe-calculado', 'hard')],
    ),
  },
  {
    id: 'dec-blindagem',
    attr: 'deception',
    title: 'Blindagem de Narrativa',
    subtitle: 'Remover a ponta solta antes da entrega',
    engine: 'statement-audit',
    instructions:
      'Este relato foi fabricado e tem duas pontas soltas. Clique nas cláusulas que precisam de revisão antes da entrega.',
    cognitivePrinciple:
      'Coerência interna. Narrativas falsas falham em detalhes verificáveis e em defesas antecipadas: quem se explica antes de ser acusado revela o que teme.',
    difficulties: three(
      [null, '1 ponta solta em 4 cláusulas', audit('galpao-duarte', 4, 1)],
      [null, '2 pontas soltas em 6 cláusulas', audit('galpao-duarte', 6, 2)],
      [null, '2 pontas soltas em 8 cláusulas · pistas falsas', audit('galpao-duarte', 8, 2, true)],
    ),
  },

  /* ---------------------------------------------------------------- */
  /* STRATEGY — Planos em Camadas                                      */
  /* ---------------------------------------------------------------- */
  {
    id: 'str-engenharia',
    attr: 'strategy',
    title: 'Engenharia de Contingência',
    subtitle: 'O fracasso da Fase 1 financia a Fase 2',
    engine: 'tactical-tree',
    instructions:
      'Três fases, um comitê que libera uma por vez. Faça o fracasso da primeira informação útil para a segunda.',
    cognitivePrinciple:
      'Plano em camadas. Estratégia não é prever o sucesso, é desenhar um sistema em que o erro produz vantagem em vez de prejuízo.',
    difficulties: three(
      [null, 'Custos e ganhos visíveis por fase', tactical('engenharia-contingencia', 'easy')],
      [null, 'Custo real de cada corte revelado no fim', tactical('engenharia-contingencia', 'medium')],
      [null, 'Suspeita inicial de 50% · meta de 85%', tactical('engenharia-contingencia', 'hard')],
    ),
  },
  {
    id: 'str-posicionamento',
    attr: 'strategy',
    title: 'Posicionamento Silencioso',
    subtitle: 'Alocar peças prevendo bloqueios',
    engine: 'memory-matrix',
    instructions:
      'Memorize a sequência de posições e reproduza a ordem exata de alocação no tabuleiro.',
    cognitivePrinciple:
      'Planejamento espacial antecipado. Posicionar bem é alocar recursos pensando na jogada seguinte, não na casa atual.',
    difficulties: three(
      [null, '4x4 · 4s · sequência de 4', { gridSize: 4, exposureMs: 4000, mode: 'sequence', trials: 3, litCount: 4 }],
      [null, '5x5 · 2.5s · sequência de 5', { gridSize: 5, exposureMs: 2500, mode: 'sequence', trials: 4, litCount: 5 }],
      [null, '5x5 · 1.5s · sequência de 6 · ruído', { gridSize: 5, exposureMs: 1500, mode: 'sequence', trials: 5, litCount: 6, distractors: true }],
    ),
  },
  {
    id: 'str-auditoria',
    attr: 'strategy',
    title: 'Auditoria de Ponto Cego',
    subtitle: 'A falha estrutural do plano perfeito',
    engine: 'statement-audit',
    instructions:
      'Leia o memorando e clique nas cláusulas que sustentam o plano sobre premissas não verificadas.',
    cognitivePrinciple:
      'Ponto cego de planejamento. O risco estrutural não está no que o plano faz, está no que ele presume garantido e por isso não testa.',
    difficulties: three(
      [null, '1 premissa frágil em 4 cláusulas', audit('plano-doca', 4, 1)],
      [null, '2 premissas frágeis em 6 cláusulas', audit('plano-doca', 6, 2)],
      [null, '2 premissas em 8 cláusulas · pistas falsas', audit('plano-doca', 8, 2, true)],
    ),
  },

  /* ---------------------------------------------------------------- */
  /* ADAPTABILITY — Recuperação Rápida                                 */
  /* ---------------------------------------------------------------- */
  {
    id: 'adp-mutacao',
    attr: 'adaptability',
    title: 'Mutação de Regras',
    subtitle: 'Critério que muda sem aviso',
    engine: 'rule-shift',
    instructions:
      'A regra desta sessão muda com frequência acima do normal. Mantenha a sequência de acertos mesmo sem saber quando ela troca.',
    cognitivePrinciple:
      'Flexibilidade cognitiva. Perseverar na regra antiga depois que ela deixa de valer é o principal custo de troca — treinar isso reduz o tempo de reorientação.',
    difficulties: three(
      [null, 'Muda a cada 4 acertos · 20 rodadas', { changeEvery: 4, trials: 20, attributes: ['color', 'shape'] }],
      [null, 'Muda a cada 3 acertos · 24 rodadas', { changeEvery: 3, trials: 24, attributes: ['color', 'shape', 'count'] }],
      [null, 'Muda a cada 2 acertos · 28 rodadas · cartas ambíguas', { changeEvery: 2, trials: 28, ambiguous: true, attributes: ['color', 'shape', 'count'] }],
    ),
  },
  {
    id: 'adp-colapso',
    attr: 'adaptability',
    title: 'Colapso do Plano A',
    subtitle: 'Metade dos recursos, dois turnos',
    engine: 'tactical-tree',
    instructions:
      'O parceiro traiu e levou metade dos recursos. Reorganize o que sobrou em dois turnos e entregue o possível.',
    cognitivePrinciple:
      'Recuperação sob choque. Replanejar rápido exige aceitar perda irrecuperável e realocar esforço no que ainda produz resultado.',
    difficulties: three(
      [null, 'Consequências explícitas por turno', tactical('colapso-plano-a', 'easy')],
      [null, 'Custo da traição revelado no fechamento', tactical('colapso-plano-a', 'medium')],
      [null, 'Suspeita inicial de 50% · entrega exige 85%', tactical('colapso-plano-a', 'hard')],
    ),
  },
  {
    id: 'adp-inversao',
    attr: 'adaptability',
    title: 'Inversão de Comando',
    subtitle: 'Seta e rótulo em conflito',
    engine: 'stroop-reaction',
    instructions:
      'Responda a direção da SETA. Quando o HUD ficar vermelho, responda a direção do TEXTO. O comando inverte sem aviso.',
    cognitivePrinciple:
      'Troca de tarefa. Alternar entre duas regras incompatíveis custa tempo de reconfiguração — e o custo cai com exposição repetida ao conflito.',
    difficulties: three(
      [45, '10 estímulos · 3.0s · inversão eventual', { task: 'direction', rounds: 10, roundMs: 3000, reverse: true }],
      [45, '15 estímulos · 2.0s · inversão frequente', { task: 'direction', rounds: 15, roundMs: 2000, reverse: true, blink: true }],
      [40, '20 estímulos · 1.3s · inversão + ruído', { task: 'direction', rounds: 20, roundMs: 1300, reverse: true, blink: true, distractors: true }],
    ),
  },

  /* ---------------------------------------------------------------- */
  /* SOCIAL — Dinâmica de Grupo                                        */
  /* ---------------------------------------------------------------- */
  {
    id: 'soc-lideranca',
    attr: 'social',
    title: 'Liderança por Procuração',
    subtitle: 'Resolver o impasse sem comandar',
    engine: 'tactical-tree',
    instructions:
      'Três facções em impasse. Faça a decisão sair da sala sem que ninguém possa dizer que a decisão foi sua.',
    cognitivePrinciple:
      'Influência sem autoridade. Quem empresta autoria aos outros reduz a resistência e mantém o acordo vivo depois que a reunião acaba.',
    difficulties: three(
      [null, 'Impacto visível de cada movimento', tactical('lideranca-procuracao', 'easy')],
      [null, 'Efeitos de 2ª ordem ocultos até o fim', tactical('lideranca-procuracao', 'medium')],
      [null, 'Suspeita inicial de 50% · meta de 85%', tactical('lideranca-procuracao', 'hard')],
    ),
  },
  {
    id: 'soc-hierarquia',
    attr: 'social',
    title: 'Leitura de Hierarquia',
    subtitle: 'Quem realmente detém o poder',
    engine: 'statement-audit',
    instructions:
      'Numa reunião sem apresentações, clique nas cláusulas que revelam a hierarquia real e escolha o critério.',
    cognitivePrinciple:
      'Hierarquia informal. Poder real se mede por microdeferência — pausas, olhares e quem controla o objeto de decisão — não por quem fala mais alto.',
    difficulties: three(
      [null, '1 sinal em 4 cláusulas', audit('sala-3', 4, 1)],
      [null, '2 sinais em 6 cláusulas', audit('sala-3', 6, 2)],
      [45, '2 sinais em 8 cláusulas · 45s', audit('sala-3', 8, 2, true)],
    ),
  },
  {
    id: 'soc-rapport',
    attr: 'social',
    title: 'Construção de Rapport',
    subtitle: 'Espelhar valores para abrir acesso',
    engine: 'tactical-tree',
    instructions:
      'O arquivista controla a sala restrita. Sem autoridade nem dinheiro, construa acesso espelhando o que ele valoriza.',
    cognitivePrinciple:
      'Rapport por similaridade. Espelhar linguagem e valores reduz a vigilância social, mas só funciona quando o espelhamento é sobre o outro, não sobre o seu objetivo.',
    difficulties: three(
      [null, 'Reação dele exposta a cada fala', tactical('construcao-rapport', 'easy')],
      [null, 'Custo do acesso revelado no fim', tactical('construcao-rapport', 'medium')],
      [null, 'Suspeita inicial de 50% · meta de 85%', tactical('construcao-rapport', 'hard')],
    ),
  },

  /* ---------------------------------------------------------------- */
  /* COUNTER — Detecção de Armadilhas                                  */
  /* ---------------------------------------------------------------- */
  {
    id: 'ctr-interrogatorio',
    attr: 'counter',
    title: 'Interrogatório Cruzado',
    subtitle: 'A contradição temporal exata',
    engine: 'statement-audit',
    instructions:
      'Dois depoimentos colhidos separadamente e um laudo pericial. Clique nas cláusulas que colidem com a perícia.',
    cognitivePrinciple:
      'Detecção de mentira por verificação. A mentira não está no nervosismo: está na divergência de detalhes que podem ser conferidos por terceiros.',
    difficulties: three(
      [null, '1 divergência em 4 cláusulas', audit('portaria-cruzada', 4, 1)],
      [null, '2 divergências em 6 cláusulas', audit('portaria-cruzada', 6, 2)],
      [45, '2 divergências em 8 cláusulas · 45s', audit('portaria-cruzada', 8, 2, true)],
    ),
  },
  {
    id: 'ctr-desarme',
    attr: 'counter',
    title: 'Desarme de Isca',
    subtitle: 'A oferta boa demais',
    engine: 'tactical-tree',
    instructions:
      'A oferta é gratuita, rápida e sem garantia. Encontre o gancho, inverta o golpe e não assine nada.',
    cognitivePrinciple:
      'Viés de reciprocidade. Oferta sem custo cria dívida implícita; desarmar a isca é tornar o custo explícito antes de aceitar o benefício.',
    difficulties: three(
      [null, 'Ganchos visíveis em cada escolha', tactical('desarme-isca', 'easy')],
      [null, 'Gancho real só revelado no fechamento', tactical('desarme-isca', 'medium')],
      [null, 'Suspeita inicial de 50% · meta de 85%', tactical('desarme-isca', 'hard')],
    ),
  },
  {
    id: 'ctr-blefe',
    attr: 'counter',
    title: 'Filtro de Blefe',
    subtitle: 'Sinal genuíno x ruído intencional',
    engine: 'stroop-reaction',
    instructions:
      'Separe sinais genuínos de ruído plantado em alta velocidade. Teclas 1 e 2. O ruído é desenhado para parecer sinal.',
    cognitivePrinciple:
      'Contra-blefe. Sinais genuínos são involuntários e desalinhados; o ruído é ensaiado, simétrico e conveniente demais para o momento.',
    difficulties: three(
      [45, '10 estímulos · 3.0s', { task: 'classify', pool: 'blefe', rounds: 10, roundMs: 3000 }],
      [45, '15 estímulos · 2.0s · estímulo piscante', { task: 'classify', pool: 'blefe', rounds: 15, roundMs: 2000, blink: true }],
      [40, '20 estímulos · 1.3s · ruído visual', { task: 'classify', pool: 'blefe', rounds: 20, roundMs: 1300, blink: true, distractors: true }],
    ),
  },

  /* ---------------------------------------------------------------- */
  /* FORESIGHT — Previsão de 2ª e 3ª Ordem                             */
  /* ---------------------------------------------------------------- */
  {
    id: 'frs-dominio',
    attr: 'foresight',
    title: 'Efeito Dominó',
    subtitle: 'A jogada que vence três turnos depois',
    engine: 'tactical-tree',
    instructions:
      'Você começa em desvantagem. Escolha a linha que pune a resposta natural do oponente, não a que ganha o turno atual.',
    cognitivePrinciple:
      'Previsão de segunda ordem. A melhor jogada imediata costuma ser a pior sequência; pensar em árvore é precificar a reação do outro.',
    difficulties: three(
      [null, 'Reações do oponente expostas', tactical('efeito-dominio', 'easy')],
      [null, 'Respostas reais reveladas só no fim', tactical('efeito-dominio', 'medium')],
      [null, 'Suspeita inicial de 50% · meta de 85%', tactical('efeito-dominio', 'hard')],
    ),
  },
  {
    id: 'frs-arvore',
    attr: 'foresight',
    title: 'Árvore de Decisão',
    subtitle: 'Antecipar a contramedida',
    engine: 'rule-shift',
    instructions:
      'Cada escolha revela a lógica do oponente. Descubra qual critério ele usa e antecipe a contramedida antes do primeiro movimento.',
    cognitivePrinciple:
      'Modelagem do oponente. Prever a resposta exige construir um modelo do outro e testá-lo — não projetar nele a sua própria lógica.',
    difficulties: three(
      [null, 'Critério estável · 6 acertos', { changeEvery: 6, trials: 20, attributes: ['shape', 'count'] }],
      [null, 'Critério revisto a cada 5 acertos', { changeEvery: 5, trials: 24, attributes: ['color', 'shape', 'count'] }],
      [null, 'Revisto a cada 4 acertos · cartas ambíguas', { changeEvery: 4, trials: 28, ambiguous: true, attributes: ['color', 'shape', 'count'] }],
    ),
  },
  {
    id: 'frs-consequencia',
    attr: 'foresight',
    title: 'Cálculo de Consequência',
    subtitle: 'O efeito colateral da decisão segura',
    engine: 'statement-audit',
    instructions:
      'Leia o memorando e clique nas cláusulas que escondem o custo de segunda ordem da decisão.',
    cognitivePrinciple:
      'Efeito colateral sistêmico. Decisões seguras no indicador principal costumam consumir folga invisível — capacidade, treinamento, confiança — que só falta depois.',
    difficulties: three(
      [null, '1 premissa oculta em 4 cláusulas', audit('memorando-turno', 4, 1)],
      [null, '2 premissas ocultas em 6 cláusulas', audit('memorando-turno', 6, 2)],
      [45, '2 premissas em 8 cláusulas · 45s', audit('memorando-turno', 8, 2, true)],
    ),
  },
]

export const EXERCISE_MAP: Record<string, Exercise> = EXERCISES.reduce(
  (map, exercise) => {
    map[exercise.id] = exercise
    return map
  },
  {} as Record<string, Exercise>,
)

export function exercisesForAttr(attr: AttrKey): Exercise[] {
  return EXERCISES.filter((exercise) => exercise.attr === attr)
}

export function exerciseById(id: string): Exercise | undefined {
  return EXERCISE_MAP[id]
}

export const ENGINE_LABEL: Record<Exercise['engine'], string> = {
  'stroop-reaction': 'Reação',
  'memory-matrix': 'Memória',
  'rule-shift': 'Regra oculta',
  'statement-audit': 'Auditoria',
  'tactical-tree': 'Tático',
}
