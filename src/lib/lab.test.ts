import { describe, expect, it } from 'vitest'
import { ATTRIBUTES, ATTR_KEYS } from '@/data/attributes'
import { CASES } from '@/data/cases'
import { EXERCISES } from '@/data/exercises'
import { SCENARIOS } from '@/data/scenarios'
import {
  DIFFICULTIES,
  INITIAL_SCORE,
  MAX_SCORE,
  MIN_SCORE,
  XP_BASE,
  averageScore,
  clampScore,
  diminishingFactor,
  rankFor,
  scoreDelta,
} from '@/lib/scoring'
import { createInitialProgress, applySession, parseProgress, exportProgress, dayKey } from '@/lib/storage'
import type { Difficulty, StatementPayload, TacticalPayload } from '@/types/lab'

const ENGINE_TYPES = [
  'stroop-reaction',
  'memory-matrix',
  'rule-shift',
  'statement-audit',
  'tactical-tree',
]

describe('catálogo de exercícios', () => {
  it('cobre os 14 atributos com exatamente 3 exercícios válidos cada', () => {
    expect(ATTR_KEYS).toHaveLength(14)
    expect(EXERCISES).toHaveLength(42)

    for (const attr of ATTR_KEYS) {
      const exercises = EXERCISES.filter((exercise) => exercise.attr === attr)
      expect(exercises, `atributo ${attr}`).toHaveLength(3)
    }

    const ids = new Set(EXERCISES.map((exercise) => exercise.id))
    expect(ids.size).toBe(EXERCISES.length)

    for (const exercise of EXERCISES) {
      expect(exercise.id.length).toBeGreaterThan(0)
      expect(exercise.title.length).toBeGreaterThan(0)
      expect(exercise.subtitle.length).toBeGreaterThan(0)
      expect(exercise.instructions.length).toBeGreaterThan(20)
      expect(exercise.cognitivePrinciple.length).toBeGreaterThan(20)
      expect(ENGINE_TYPES).toContain(exercise.engine)
      expect(ATTR_KEYS).toContain(exercise.attr)
    }
  })

  it('atribui os 5 motores a todos os atributos', () => {
    const engines = new Set(EXERCISES.map((exercise) => exercise.engine))
    expect([...engines].sort()).toEqual([...ENGINE_TYPES].sort())
  })

  it('possui configuração completa para fácil, médio e difícil', () => {
    for (const exercise of EXERCISES) {
      for (const level of DIFFICULTIES) {
        const config = exercise.difficulties[level]
        expect(config, `${exercise.id} · ${level}`).toBeDefined()
        expect(config.level).toBe(level)
        expect(config.label).toBe({ easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }[level])
        expect(config.xpReward).toBe(XP_BASE[level])
        expect(config.description.length).toBeGreaterThan(5)
        expect(config.timeLimitSec === null || config.timeLimitSec > 0).toBe(true)
        expect(config.payload).toBeTypeOf('object')
        expect(Object.keys(config.payload).length).toBeGreaterThan(0)
      }
    }
  })

  it('mantém os payloads de auditoria coerentes com os dossiês', () => {
    const audits = EXERCISES.filter((exercise) => exercise.engine === 'statement-audit')
    expect(audits.length).toBeGreaterThanOrEqual(10)

    for (const exercise of audits) {
      const fallback = CASES.find((item) => item.id === exercise.id)
      expect(fallback).toBeUndefined()

      for (const level of DIFFICULTIES) {
        const payload = exercise.difficulties[level].payload as unknown as StatementPayload
        const file = CASES.find((item) => item.id === payload.caseId)
        expect(file, `${exercise.id} · ${payload.caseId}`).toBeDefined()
        if (!file) continue

        expect(payload.visible).toBeLessThanOrEqual(file.segments.length)
        expect(payload.required).toBeLessThanOrEqual(payload.visible)
        expect(payload.answers.length).toBe(payload.required)
        for (const answer of payload.answers) {
          expect(answer).toBeLessThan(payload.visible)
          expect(file.flaws).toContain(answer)
        }
        expect(payload.reasons).toHaveLength(3)
        expect(payload.correctReason).toBeGreaterThanOrEqual(0)
        expect(payload.correctReason).toBeLessThan(3)
      }
    }
  })

  it('mantém os cenários táticos dentro do número de turnos disponíveis', () => {
    const tactical = EXERCISES.filter((exercise) => exercise.engine === 'tactical-tree')
    expect(tactical.length).toBeGreaterThanOrEqual(14)

    for (const exercise of tactical) {
      for (const level of DIFFICULTIES) {
        const payload = exercise.difficulties[level].payload as unknown as TacticalPayload
        const scenario = SCENARIOS.find((item) => item.id === payload.scenarioId)
        expect(scenario, `${exercise.id} · ${payload.scenarioId}`).toBeDefined()
        if (!scenario) continue

        expect(payload.rounds).toBeGreaterThanOrEqual(2)
        expect(payload.rounds).toBeLessThanOrEqual(scenario.rounds.length)
        expect(payload.targetAdvantage).toBeGreaterThan(payload.startAdvantage)
        expect(payload.suspicionLimit).toBeLessThanOrEqual(100)
        for (const round of scenario.rounds) {
          expect(round.choices).toHaveLength(3)
        }
      }
    }

    // Difícil: começa com 50 de suspeita e exige 85+ de vantagem.
    for (const exercise of tactical) {
      const payload = exercise.difficulties.hard.payload as unknown as TacticalPayload
      expect(payload.startSuspicion).toBeGreaterThanOrEqual(50)
      expect(payload.targetAdvantage).toBeGreaterThanOrEqual(85)
    }
  })

  it('respeita os parâmetros de escala dos motores por dificuldade', () => {
    const memory = EXERCISES.filter((exercise) => exercise.engine === 'memory-matrix')
    for (const exercise of memory) {
      const easy = exercise.difficulties.easy.payload as Record<string, unknown>
      const hard = exercise.difficulties.hard.payload as Record<string, unknown>
      expect(Number(hard.gridSize)).toBeGreaterThanOrEqual(Number(easy.gridSize))
      if (easy.mode !== 'nback') {
        expect(Number(hard.exposureMs)).toBeLessThan(Number(easy.exposureMs))
      }
    }

    const stroop = EXERCISES.filter((exercise) => exercise.engine === 'stroop-reaction')
    for (const exercise of stroop) {
      const easy = exercise.difficulties.easy.payload as Record<string, unknown>
      const hard = exercise.difficulties.hard.payload as Record<string, unknown>
      expect(Number(hard.rounds)).toBeGreaterThan(Number(easy.rounds))
      expect(Number(hard.roundMs)).toBeLessThan(Number(easy.roundMs))
    }
  })
})

describe('fórmula de pontuação', () => {
  it('começa todos os atributos em 50', () => {
    const scores = createInitialProgress().scores
    for (const attr of ATTR_KEYS) {
      expect(scores[attr]).toBe(INITIAL_SCORE)
    }
    expect(averageScore(scores)).toBe(50)
  })

  it('aplica retorno decrescente: nota mais alta rende menos', () => {
    const low = scoreDelta({ accuracy: 90, difficulty: 'hard', currentScore: 52 })
    const mid = scoreDelta({ accuracy: 90, difficulty: 'hard', currentScore: 75 })
    const high = scoreDelta({ accuracy: 90, difficulty: 'hard', currentScore: 92 })

    expect(low).toBeGreaterThan(mid)
    expect(mid).toBeGreaterThan(high)
    expect(high).toBeGreaterThan(0)

    expect(diminishingFactor(50)).toBeGreaterThan(diminishingFactor(75))
    expect(diminishingFactor(75)).toBeGreaterThan(diminishingFactor(95))
    expect(diminishingFactor(100)).toBeLessThanOrEqual(0.08 + 1e-9)
    expect(diminishingFactor(100)).toBeGreaterThanOrEqual(0.08 - 1e-9)
  })

  it('não ganha pontos com precisão abaixo de 50%', () => {
    for (const difficulty of ['easy', 'medium'] as Difficulty[]) {
      expect(scoreDelta({ accuracy: 49, difficulty, currentScore: 70 })).toBe(0)
      expect(scoreDelta({ accuracy: 0, difficulty, currentScore: 70 })).toBe(0)
    }
    expect(scoreDelta({ accuracy: 49, difficulty: 'hard', currentScore: 70 })).toBe(-0.3)
  })

  it('mantém o resultado sempre dentro de [40, 100]', () => {
    for (const current of [40, 41, 50, 75, 90, 99, 100]) {
      for (const accuracy of [0, 25, 49, 50, 75, 100]) {
        for (const difficulty of DIFFICULTIES) {
          const delta = scoreDelta({ accuracy, difficulty, currentScore: current })
          const next = clampScore(current + delta)
          expect(next).toBeGreaterThanOrEqual(MIN_SCORE)
          expect(next).toBeLessThanOrEqual(MAX_SCORE)
          expect(next).toBeCloseTo(current + delta, 5)
        }
      }
    }

    // Piso: falhas repetidas no Difícil nunca caem abaixo de 40.
    let score = 41
    for (let index = 0; index < 20; index += 1) {
      score = clampScore(score + scoreDelta({ accuracy: 10, difficulty: 'hard', currentScore: score }))
    }
    expect(score).toBe(MIN_SCORE)

    // Teto: sessões perfeitas param em 100.
    score = 99
    for (let index = 0; index < 20; index += 1) {
      score = clampScore(score + scoreDelta({ accuracy: 100, difficulty: 'hard', currentScore: score }))
    }
    expect(score).toBe(MAX_SCORE)
  })

  it('mapeia patentes por faixa de nota', () => {
    expect(rankFor(50).label).toBe('Observador')
    expect(rankFor(59).label).toBe('Observador')
    expect(rankFor(60).label).toBe('Analítico')
    expect(rankFor(74).label).toBe('Analítico')
    expect(rankFor(75).label).toBe('Estrategista')
    expect(rankFor(84).label).toBe('Estrategista')
    expect(rankFor(85).label).toBe('Mestre Tático')
    expect(rankFor(92).label).toBe('Mestre Tático')
    expect(rankFor(93).label).toBe('Nível Gênio')
    expect(rankFor(100).label).toBe('Nível Gênio')
  })
})

describe('progresso persistido', () => {
  it('registra sessão, atualiza a nota e a sequência', () => {
    const initial = createInitialProgress()
    const next = applySession(initial, {
      exerciseId: 'int-matriz',
      attr: 'intelligence',
      difficulty: 'medium',
      accuracy: 80,
      scoreDelta: 1.8,
      timeSpentSec: 42,
      now: new Date('2026-01-10T12:00:00').getTime(),
    })

    expect(next.scores.intelligence).toBeCloseTo(51.8, 1)
    expect(next.sessions).toHaveLength(1)
    expect(next.sessions[0].exerciseId).toBe('int-matriz')
    expect(next.streak).toBe(1)
    expect(next.lastSessionDay).toBe('2026-01-10')

    const sameDay = applySession(next, {
      exerciseId: 'int-nback',
      attr: 'intelligence',
      difficulty: 'easy',
      accuracy: 90,
      scoreDelta: 1,
      timeSpentSec: 30,
      now: new Date('2026-01-10T18:00:00').getTime(),
    })
    expect(sameDay.streak).toBe(1)

    const nextDay = applySession(sameDay, {
      exerciseId: 'int-regras',
      attr: 'intelligence',
      difficulty: 'hard',
      accuracy: 90,
      scoreDelta: 2,
      timeSpentSec: 30,
      now: new Date('2026-01-11T09:00:00').getTime(),
    })
    expect(nextDay.streak).toBe(2)
  })

  it('exporta e reimporta o progresso sem perder dados', () => {
    const progress = applySession(createInitialProgress(), {
      exerciseId: 'emo-microsinais',
      attr: 'emotion',
      difficulty: 'easy',
      accuracy: 75,
      scoreDelta: 1.2,
      timeSpentSec: 20,
      now: Date.now(),
    })

    const restored = parseProgress(exportProgress(progress))
    expect(restored.scores).toEqual(progress.scores)
    expect(restored.sessions).toHaveLength(1)
    expect(restored.sessions[0].accuracy).toBe(75)
  })

  it('rejeita arquivos inválidos na importação', () => {
    expect(() => parseProgress('não é json')).toThrow()
    expect(() => parseProgress('{"foo":1}')).toThrow(/notas/)
  })

  it('normaliza notas fora da faixa ao importar', () => {
    const restored = parseProgress(
      JSON.stringify({
        scores: { ...createInitialProgress().scores, intelligence: 250, emotion: -10 },
        sessions: [],
      }),
    )
    expect(restored.scores.intelligence).toBe(MAX_SCORE)
    expect(restored.scores.emotion).toBe(MIN_SCORE)
  })

  it('usa data local no formato YYYY-MM-DD', () => {
    expect(dayKey(new Date('2026-03-05T23:50:00'))).toBe('2026-03-05')
  })
})

describe('dossiês e cenários', () => {
  it('todo dossiê tem 8 cláusulas, 2 falhas e 3 motivos', () => {
    expect(CASES).toHaveLength(10)
    for (const file of CASES) {
      expect(file.segments).toHaveLength(8)
      expect(file.flaws).toHaveLength(2)
      expect(file.flaws[0]).toBeLessThan(4)
      expect(file.flaws[1]).toBeLessThan(6)
      expect(file.reasons).toHaveLength(3)
      expect(file.correctReason).toBeGreaterThanOrEqual(0)
      expect(file.correctReason).toBeLessThan(3)
      expect(file.explanation.length).toBeGreaterThan(30)
    }
  })

  it('todo cenário tático tem 3 turnos e 3 escolhas', () => {
    expect(SCENARIOS).toHaveLength(14)
    for (const scenario of SCENARIOS) {
      expect(scenario.brief.length).toBeGreaterThan(20)
      expect(scenario.rounds.length).toBeGreaterThanOrEqual(3)
      for (const round of scenario.rounds) {
        expect(round.choices).toHaveLength(3)
        for (const choice of round.choices) {
          expect(choice.label.length).toBeGreaterThan(5)
          expect(choice.outcome.length).toBeGreaterThan(10)
          expect(choice.advantage).toBeGreaterThan(0)
          expect(choice.suspicion).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('cada atributo tem metadados completos', () => {
    for (const meta of ATTRIBUTES) {
      expect(meta.code).toHaveLength(3)
      expect(meta.name.length).toBeGreaterThan(3)
      expect(meta.domain.length).toBeGreaterThan(3)
      expect(meta.summary.length).toBeGreaterThan(30)
      expect(meta.benchmarks.length).toBeGreaterThanOrEqual(3)
    }
  })
})
