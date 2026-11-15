import type {
  AttrKey,
  Difficulty,
  DifficultyConfig,
  Exercise,
  SessionRecord,
} from '@/types/lab'

/** Todos os atributos começam nesta nota. */
export const INITIAL_SCORE = 50

/** Piso absoluto: nenhuma falha derruba a nota abaixo disso. */
export const MIN_SCORE = 40

export const MAX_SCORE = 100

/** XP base por dificuldade (também é o `xpReward` padrão do catálogo). */
export const XP_BASE: Record<Difficulty, number> = {
  easy: 15,
  medium: 30,
  hard: 55,
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
}

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export interface RankInfo {
  key: 'observer' | 'analyst' | 'strategist' | 'tactician' | 'genius'
  label: string
  min: number
  max: number
  code: string
  description: string
}

export const RANKS: RankInfo[] = [
  {
    key: 'observer',
    label: 'Observador',
    min: 0,
    max: 59,
    code: 'OP-01',
    description: 'Registra sinais, ainda sem modelo de leitura consistente.',
  },
  {
    key: 'analyst',
    label: 'Analítico',
    min: 60,
    max: 74,
    code: 'AN-02',
    description: 'Decompõe cenários e sustenta hipóteses sob supervisão.',
  },
  {
    key: 'strategist',
    label: 'Estrategista',
    min: 75,
    max: 84,
    code: 'ST-03',
    description: 'Planeja em camadas e antecipa a primeira reação do oponente.',
  },
  {
    key: 'tactician',
    label: 'Mestre Tático',
    min: 85,
    max: 92,
    code: 'MT-04',
    description: 'Opera em tempo real com leitura fria e contingência pronta.',
  },
  {
    key: 'genius',
    label: 'Nível Gênio',
    min: 93,
    max: 100,
    code: 'GN-05',
    description: 'Constrói cenários em vez de apenas reagir a eles.',
  },
]

/** Referências comparativas exibidas na ficha de cada atributo. */
export const BENCHMARK_ANCHORS: { score: number; label: string }[] = [
  { score: 50, label: 'Civil mediano' },
  { score: 65, label: 'Analista Júnior' },
  { score: 80, label: 'Investigador Veterano' },
  { score: 90, label: 'Mestre de Xadrez / Perfilador Clínico' },
  { score: 96, label: 'Pico de Ficção' },
]

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Arredonda para 1 casa decimal (a mesma precisão exibida na ficha). */
export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function clampScore(score: number): number {
  return clamp(round1(score), MIN_SCORE, MAX_SCORE)
}

export function rankFor(score: number): RankInfo {
  const safe = clamp(score, MIN_SCORE, MAX_SCORE)
  return RANKS.find((rank) => safe >= rank.min && safe <= rank.max) ?? RANKS[0]
}

/**
 * Curva de retorno decrescente.
 *
 * 1.0 na nota 50 (metade do potencial ainda disponível) e caindo até 0.08
 * perto de 100. Isso mantém o treino recompensador no começo sem permitir que
 * alguém chegue ao topo em poucas sessões.
 */
export function diminishingFactor(currentScore: number): number {
  const headroom = (MAX_SCORE - clamp(currentScore, MIN_SCORE, MAX_SCORE)) / 50
  return clamp(Math.pow(Math.max(headroom, 0), 0.9), 0.08, 1)
}

export interface ScoreInput {
  accuracy: number
  difficulty: Difficulty
  currentScore: number
  xpReward?: number
}

/**
 * Ganho (ou perda) de nota de um atributo após uma sessão.
 *
 * - Precisão < 50%: 0 no Fácil/Médio e -0.3 no Difícil (falha crítica).
 * - Precisão >= 50%: xp normalizado × desempenho × fator de retorno decrescente.
 * - O resultado final é sempre limitado a [40, 100].
 */
export function scoreDelta({
  accuracy,
  difficulty,
  currentScore,
  xpReward = XP_BASE[difficulty],
}: ScoreInput): number {
  const safeAccuracy = clamp(accuracy, 0, 100)
  const safeCurrent = clamp(currentScore, MIN_SCORE, MAX_SCORE)

  if (safeAccuracy < 50) {
    const penalty = difficulty === 'hard' ? -0.3 : 0
    return round1(clampScore(safeCurrent + penalty) - safeCurrent)
  }

  const performance = Math.pow(safeAccuracy / 100, 1.4)
  const raw =
    (xpReward / XP_BASE.easy) * performance * diminishingFactor(safeCurrent)

  const next = clampScore(safeCurrent + raw)
  return round1(next - safeCurrent)
}

export function averageScore(scores: Record<AttrKey, number>): number {
  const values = Object.values(scores)
  if (values.length === 0) return INITIAL_SCORE
  return round1(values.reduce((total, value) => total + value, 0) / values.length)
}

export function averageAccuracy(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0
  const total = sessions.reduce((sum, session) => sum + session.accuracy, 0)
  return round1(total / sessions.length)
}

/** 3 melhores e 3 piores atributos (desempate alfabético para estabilidade). */
export function strengthsAndWeaknesses(scores: Record<AttrKey, number>) {
  const entries = (Object.entries(scores) as [AttrKey, number][]).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )
  return {
    strengths: entries.slice(0, 3),
    weaknesses: entries.slice(-3).reverse(),
  }
}

export function formatDelta(delta: number): string {
  const rounded = round1(delta)
  if (rounded > 0) return `+${rounded.toFixed(1)}`
  if (rounded < 0) return rounded.toFixed(1)
  return '0.0'
}

export function exerciseById(
  exercises: Exercise[],
  id: string,
): Exercise | undefined {
  return exercises.find((exercise) => exercise.id === id)
}

export function defaultConfig(exercise: Exercise): DifficultyConfig {
  return exercise.difficulties.easy
}
