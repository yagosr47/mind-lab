import type { AttributeMeta, AttrKey } from '@/types/lab'

/** Os 14 atributos mentais do MIND//LAB, na ordem do radar. */
export const ATTRIBUTES: AttributeMeta[] = [
  {
    key: 'intelligence',
    code: 'INT',
    name: 'Intelligence',
    domain: 'Cognição e Padrões',
    summary: 'Reconhecer estrutura escondida em sequências, grades e séries numéricas.',
    benchmarks: [
      { score: 65, label: 'Analista de padrões' },
      { score: 80, label: 'Pesquisador sênior' },
      { score: 90, label: 'Grandmaster de xadrez' },
      { score: 96, label: 'Pico de ficção: cálculo humano' },
    ],
  },
  {
    key: 'emotion',
    code: 'EMO',
    name: 'Emotion Recognition',
    domain: 'Leitura Fria',
    summary: 'Detectar o afeto real por trás do relato, do tom e da microexpressão.',
    benchmarks: [
      { score: 65, label: 'Entrevistador treinado' },
      { score: 80, label: 'Negociador de crises' },
      { score: 90, label: 'Perfilador clínico' },
      { score: 96, label: 'Pico de ficção: leitor de almas' },
    ],
  },
  {
    key: 'profiling',
    code: 'PRO',
    name: 'Profiling Skill',
    domain: 'Perfis Psicológicos',
    summary: 'Deduzir rotina, ofício e pontos de ruptura a partir de rastros materiais.',
    benchmarks: [
      { score: 65, label: 'Analista comportamental' },
      { score: 80, label: 'Investigador veterano' },
      { score: 90, label: 'Perfilador forense' },
      { score: 96, label: 'Pico de ficção: Holmes' },
    ],
  },
  {
    key: 'self',
    code: 'SLF',
    name: 'Self Management',
    domain: 'Controle de Impulsos',
    summary: 'Segurar a resposta automática e manter a compostura sob provocação.',
    benchmarks: [
      { score: 65, label: 'Profissional disciplinado' },
      { score: 80, label: 'Atirador de elite' },
      { score: 90, label: 'Negociador hostil' },
      { score: 96, label: 'Pico de ficção: estoico absoluto' },
    ],
  },
  {
    key: 'manipulation',
    code: 'MAN',
    name: 'Manipulation',
    domain: 'Persuasão e Enquadramento',
    summary: 'Construir o enquadramento em que a escolha desejada parece livre.',
    benchmarks: [
      { score: 65, label: 'Vendedor consultivo' },
      { score: 80, label: 'Estrategista de campanha' },
      { score: 90, label: 'Operador de influência' },
      { score: 96, label: 'Pico de ficção: arquiteto de escolhas' },
    ],
  },
  {
    key: 'field',
    code: 'FLD',
    name: 'Field Navigation',
    domain: 'Improviso Tático',
    summary: 'Transformar recursos escassos em rota de saída quando o plano quebra.',
    benchmarks: [
      { score: 65, label: 'Operador de campo' },
      { score: 80, label: 'Especialista em extração' },
      { score: 90, label: 'Instrutor de sobrevivência' },
      { score: 96, label: 'Pico de ficção: improviso total' },
    ],
  },
  {
    key: 'sensory',
    code: 'SEN',
    name: 'Sensory & Anticipation',
    domain: 'Percepção Rápida',
    summary: 'Registrar o detalhe periférico que denuncia o movimento antes dele acontecer.',
    benchmarks: [
      { score: 65, label: 'Olhar treinado' },
      { score: 80, label: 'Vigilante profissional' },
      { score: 90, label: 'Antecipador de conflito' },
      { score: 96, label: 'Pico de ficção: percepção absoluta' },
    ],
  },
  {
    key: 'reasoning',
    code: 'REA',
    name: 'Reasoning',
    domain: 'Dedução e Abdução',
    summary: 'Separar validade formal de plausibilidade e eliminar hipóteses por cruzamento.',
    benchmarks: [
      { score: 65, label: 'Analista lógico' },
      { score: 80, label: 'Auditor de risco' },
      { score: 90, label: 'Lógico de nível doutor' },
      { score: 96, label: 'Pico de ficção: dedução pura' },
    ],
  },
  {
    key: 'deception',
    code: 'DEC',
    name: 'Deception',
    domain: 'Atuação e Álibis',
    summary: 'Sustentar uma narrativa falsa coerente sob interrogatório e revisão.',
    benchmarks: [
      { score: 65, label: 'Blefador amador' },
      { score: 80, label: 'Ator de improviso' },
      { score: 90, label: 'Operador de identidade' },
      { score: 96, label: 'Pico de ficção: mentiroso perfeito' },
    ],
  },
  {
    key: 'strategy',
    code: 'STR',
    name: 'Long-Term Planning',
    domain: 'Planos em Camadas',
    summary: 'Projetar fases em que o fracasso da primeira financia a segunda.',
    benchmarks: [
      { score: 65, label: 'Coordenador de projeto' },
      { score: 80, label: 'Planejador de operações' },
      { score: 90, label: 'Estrategista de longo prazo' },
      { score: 96, label: 'Pico de ficção: arquiteto de cenários' },
    ],
  },
  {
    key: 'adaptability',
    code: 'ADP',
    name: 'Adaptability',
    domain: 'Recuperação Rápida',
    summary: 'Trocar de critério no meio da tarefa sem perder a sequência nem o ritmo.',
    benchmarks: [
      { score: 65, label: 'Operador versátil' },
      { score: 80, label: 'Especialista em crise' },
      { score: 90, label: 'Reorganizador de caos' },
      { score: 96, label: 'Pico de ficção: mutação instantânea' },
    ],
  },
  {
    key: 'social',
    code: 'SOC',
    name: 'Social Engineering',
    domain: 'Dinâmica de Grupo',
    summary: 'Ler hierarquia real em uma sala e mover facções sem assumir o comando.',
    benchmarks: [
      { score: 65, label: 'Facilitador de equipe' },
      { score: 80, label: 'Negociador político' },
      { score: 90, label: 'Operador de dinâmica de grupo' },
      { score: 96, label: 'Pico de ficção: poder invisível' },
    ],
  },
  {
    key: 'counter',
    code: 'CTR',
    name: 'Counter-Deception',
    domain: 'Detecção de Armadilhas',
    summary: 'Reconhecer a oferta boa demais e desarmar a isca antes de pisar nela.',
    benchmarks: [
      { score: 65, label: 'Leitor de blefe casual' },
      { score: 80, label: 'Contra-inteligência' },
      { score: 90, label: 'Auditor de manipulação' },
      { score: 96, label: 'Pico de ficção: detector de armadilhas' },
    ],
  },
  {
    key: 'foresight',
    code: 'FRS',
    name: 'Strategic Foresight',
    domain: 'Previsão de 2ª e 3ª Ordem',
    summary: 'Escolher a jogada que vence três turnos depois, não no turno atual.',
    benchmarks: [
      { score: 65, label: 'Analista de cenários' },
      { score: 80, label: 'Planejador de contingência' },
      { score: 90, label: 'Previsor estratégico' },
      { score: 96, label: 'Pico de ficção: cálculo de longo alcance' },
    ],
  },
]

export const ATTRIBUTE_MAP: Record<AttrKey, AttributeMeta> = ATTRIBUTES.reduce(
  (map, attribute) => {
    map[attribute.key] = attribute
    return map
  },
  {} as Record<AttrKey, AttributeMeta>,
)

export const ATTR_KEYS: AttrKey[] = ATTRIBUTES.map((attribute) => attribute.key)

export function attributeByKey(key: AttrKey): AttributeMeta {
  return ATTRIBUTE_MAP[key]
}
