import { ATTR_KEYS } from '@/data/attributes'
import { INITIAL_SCORE, clampScore } from '@/lib/scoring'
import type { AttrKey, LabProgress, SessionRecord } from '@/types/lab'

export const STORAGE_KEY = 'mindlab:progress:v1'
export const STORAGE_VERSION = 1
const SESSION_CAP = 500

export function createInitialScores(): Record<AttrKey, number> {
  return ATTR_KEYS.reduce(
    (scores, key) => {
      scores[key] = INITIAL_SCORE
      return scores
    },
    {} as Record<AttrKey, number>,
  )
}

export function createInitialProgress(): LabProgress {
  return {
    version: STORAGE_VERSION,
    scores: createInitialScores(),
    sessions: [],
    streak: 0,
    lastSessionDay: null,
    createdAt: Date.now(),
  }
}

/** YYYY-MM-DD no fuso local. */
export function dayKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isYesterday(previous: string, today: string): boolean {
  const prev = new Date(`${previous}T12:00:00`)
  const now = new Date(`${today}T12:00:00`)
  const diff = now.getTime() - prev.getTime()
  return diff > 0 && diff <= 1000 * 60 * 60 * 36
}

export function nextStreak(progress: LabProgress, today = dayKey()): number {
  if (!progress.lastSessionDay) return 1
  if (progress.lastSessionDay === today) return Math.max(progress.streak, 1)
  if (isYesterday(progress.lastSessionDay, today)) return progress.streak + 1
  return 1
}

export function loadProgress(): LabProgress {
  if (typeof window === 'undefined') return createInitialProgress()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialProgress()
    return sanitize(JSON.parse(raw))
  } catch {
    return createInitialProgress()
  }
}

export function saveProgress(progress: LabProgress): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Modo privado ou cota cheia: a sessão vale para esta aba.
  }
}

function sanitize(input: unknown): LabProgress {
  const fallback = createInitialProgress()
  if (!input || typeof input !== 'object') return fallback
  const data = input as Partial<LabProgress>
  const scores = { ...fallback.scores }

  if (data.scores && typeof data.scores === 'object') {
    for (const key of ATTR_KEYS) {
      const value = (data.scores as Record<string, unknown>)[key]
      if (typeof value === 'number' && Number.isFinite(value)) {
        scores[key] = clampScore(value)
      }
    }
  }

  const sessions = Array.isArray(data.sessions)
    ? data.sessions.filter(isSession).slice(0, SESSION_CAP)
    : []

  return {
    version: STORAGE_VERSION,
    scores,
    sessions,
    streak: typeof data.streak === 'number' && data.streak >= 0 ? Math.floor(data.streak) : 0,
    lastSessionDay: typeof data.lastSessionDay === 'string' ? data.lastSessionDay : null,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
  }
}

function isSession(value: unknown): value is SessionRecord {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<SessionRecord>
  return (
    typeof session.id === 'string' &&
    typeof session.exerciseId === 'string' &&
    typeof session.attr === 'string' &&
    ATTR_KEYS.includes(session.attr as AttrKey) &&
    typeof session.difficulty === 'string' &&
    typeof session.accuracy === 'number' &&
    typeof session.scoreDelta === 'number' &&
    typeof session.timeSpentSec === 'number' &&
    typeof session.timestamp === 'number'
  )
}

export interface RecordInput {
  exerciseId: string
  attr: AttrKey
  difficulty: SessionRecord['difficulty']
  accuracy: number
  scoreDelta: number
  timeSpentSec: number
  now?: number
}

/** Aplica a sessão ao progresso: nota, histórico e sequência. */
export function applySession(progress: LabProgress, input: RecordInput): LabProgress {
  const now = input.now ?? Date.now()
  const today = dayKey(new Date(now))
  const session: SessionRecord = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    exerciseId: input.exerciseId,
    attr: input.attr,
    difficulty: input.difficulty,
    accuracy: Math.round(input.accuracy * 10) / 10,
    scoreDelta: Math.round(input.scoreDelta * 10) / 10,
    timeSpentSec: Math.round(input.timeSpentSec),
    timestamp: now,
  }

  return {
    ...progress,
    scores: {
      ...progress.scores,
      [input.attr]: clampScore(progress.scores[input.attr] + session.scoreDelta),
    },
    sessions: [session, ...progress.sessions].slice(0, SESSION_CAP),
    streak: nextStreak(progress, today),
    lastSessionDay: today,
  }
}

export function exportProgress(progress: LabProgress): string {
  return JSON.stringify({ ...progress, exportedAt: new Date().toISOString() }, null, 2)
}

export function parseProgress(raw: string): LabProgress {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Arquivo inválido: não é um JSON legível.')
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Arquivo inválido: estrutura não reconhecida.')
  }
  const data = parsed as Partial<LabProgress>
  if (!data.scores || typeof data.scores !== 'object') {
    throw new Error('Arquivo inválido: bloco de notas ausente.')
  }
  return sanitize(parsed)
}

export function clearProgress(): LabProgress {
  const fresh = createInitialProgress()
  saveProgress(fresh)
  return fresh
}
