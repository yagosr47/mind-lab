import { useEffect, useState } from 'react'
import { Logo } from '@/components/Logo'
import { Tag } from '@/components/ui/Primitives'
import { Catalog } from '@/components/views/Catalog'
import { Dashboard } from '@/components/views/Dashboard'
import { Debrief } from '@/components/views/Debrief'
import { ExerciseArena, type ArenaResult } from '@/components/views/ExerciseArena'
import { Telemetry } from '@/components/views/Telemetry'
import { exerciseById } from '@/data/exercises'
import { cx } from '@/lib/cx'
import { averageScore, scoreDelta } from '@/lib/scoring'
import {
  applySession,
  clearProgress,
  loadProgress,
  saveProgress,
} from '@/lib/storage'
import type {
  AttrKey,
  Difficulty,
  Exercise,
  GuidedStep,
  LabProgress,
  LabView,
} from '@/types/lab'

const TABS: { id: LabView; index: string; label: string }[] = [
  { id: 'dashboard', index: '01', label: 'Dashboard' },
  { id: 'catalog', index: '02', label: 'Treinar atributos' },
  { id: 'telemetry', index: '03', label: 'Histórico & telemetria' },
]

interface ActiveSession {
  exercise: Exercise
  difficulty: Difficulty
}

interface DebriefState {
  exercise: Exercise
  difficulty: Difficulty
  accuracy: number
  timeSpentSec: number
  delta: number
  before: number
  after: number
  note?: string
}

export function App() {
  const [progress, setProgress] = useState<LabProgress>(() => loadProgress())
  const [view, setView] = useState<LabView>('dashboard')
  const [active, setActive] = useState<ActiveSession | null>(null)
  const [debrief, setDebrief] = useState<DebriefState | null>(null)
  const [guided, setGuided] = useState<{ steps: GuidedStep[]; index: number } | null>(null)
  const [catalogAttr, setCatalogAttr] = useState<AttrKey | null>(null)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const overall = averageScore(progress.scores)

  const startExercise = (exercise: Exercise, difficulty: Difficulty) => {
    setActive({ exercise, difficulty })
  }

  const goToView = (next: LabView) => {
    setActive(null)
    setDebrief(null)
    setGuided(null)
    setCatalogAttr(null)
    setView(next)
  }

  const handleComplete = (result: ArenaResult) => {
    if (!active) return
    const { exercise, difficulty } = active
    const before = progress.scores[exercise.attr]
    const delta = scoreDelta({
      accuracy: result.accuracy,
      difficulty,
      currentScore: before,
    })
    const next = applySession(progress, {
      exerciseId: exercise.id,
      attr: exercise.attr,
      difficulty,
      accuracy: result.accuracy,
      scoreDelta: delta,
      timeSpentSec: result.timeSpentSec,
    })

    setProgress(next)
    setActive(null)
    setDebrief({
      exercise,
      difficulty,
      accuracy: result.accuracy,
      timeSpentSec: result.timeSpentSec,
      delta,
      before,
      after: next.scores[exercise.attr],
      note: result.note,
    })
  }

  const startGuided = (steps: GuidedStep[]) => {
    if (steps.length === 0) return
    const first = exerciseById(steps[0].exerciseId)
    if (!first) return
    setDebrief(null)
    setGuided({ steps, index: 0 })
    startExercise(first, steps[0].difficulty)
  }

  const advanceGuided = () => {
    if (!guided) return
    const nextIndex = guided.index + 1
    if (nextIndex >= guided.steps.length) {
      setGuided(null)
      setDebrief(null)
      setView('dashboard')
      return
    }
    const step = guided.steps[nextIndex]
    const exercise = exerciseById(step.exerciseId)
    setGuided({ ...guided, index: nextIndex })
    if (exercise) startExercise(exercise, step.difficulty)
  }

  const exitSession = () => {
    setActive(null)
    setDebrief(null)
    setGuided(null)
  }

  const handleImport = (imported: LabProgress) => {
    setProgress(imported)
    saveProgress(imported)
  }

  const handleReset = () => {
    setProgress(clearProgress())
    setDebrief(null)
    setActive(null)
    setGuided(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/92 backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="flex items-center justify-between gap-4 py-3">
            <button
              type="button"
              onClick={() => goToView('dashboard')}
              className="flex items-center gap-3 text-left"
            >
              <Logo className="h-9 w-9" />
              <span>
                <span className="block font-display text-base leading-none tracking-tight text-bone sm:text-lg">
                  MIND<span className="text-tc">//</span>LAB
                </span>
                <span className="mt-1 block font-mono text-[9px] tracking-[0.24em] text-mute uppercase">
                  treino cognitivo tático
                </span>
              </span>
            </button>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <span className="block font-mono text-[9px] tracking-[0.18em] text-mute uppercase">
                  overall
                </span>
                <span className="block font-mono text-lg leading-none text-tc tabular-nums">
                  {overall.toFixed(1)}
                </span>
              </div>
              <Tag tone="tc" className="hidden sm:inline-flex">
                local
              </Tag>
            </div>
          </div>

          <nav aria-label="Navegação principal" className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = view === tab.id && !active && !debrief
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => goToView(tab.id)}
                  disabled={Boolean(active)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cx(
                    'group relative flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                    isActive
                      ? 'border-tc text-bone'
                      : 'border-transparent text-mute hover:text-bone',
                  )}
                >
                  <span className={cx('font-mono text-[10px] tabular-nums', isActive ? 'text-tc' : 'text-mute')}>
                    {tab.index}
                  </span>
                  <span className="font-condensed text-xs font-semibold tracking-[0.12em] uppercase sm:text-sm">
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {active ? (
          <ExerciseArena
            key={`${active.exercise.id}-${active.difficulty}`}
            exercise={active.exercise}
            difficulty={active.difficulty}
            onAbort={exitSession}
            onComplete={handleComplete}
          />
        ) : debrief ? (
          <Debrief
            exercise={debrief.exercise}
            difficulty={debrief.difficulty}
            accuracy={debrief.accuracy}
            timeSpentSec={debrief.timeSpentSec}
            delta={debrief.delta}
            before={debrief.before}
            after={debrief.after}
            note={debrief.note}
            guided={guided ? { index: guided.index, total: guided.steps.length } : null}
            onNext={advanceGuided}
            onRepeat={() => startExercise(debrief.exercise, debrief.difficulty)}
            onExit={exitSession}
          />
        ) : view === 'dashboard' ? (
          <Dashboard
            progress={progress}
            onStart={startExercise}
            onStartGuided={startGuided}
            onOpenAttribute={(attr) => {
              setCatalogAttr(attr)
              setView('catalog')
            }}
          />
        ) : view === 'catalog' ? (
          <Catalog
            key={catalogAttr ?? 'catalog'}
            progress={progress}
            initialAttr={catalogAttr}
            onStart={startExercise}
          />
        ) : (
          <Telemetry progress={progress} onImport={handleImport} onReset={handleReset} />
        )}
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 font-mono text-[9px] tracking-[0.18em] text-mute uppercase">
          <span>MIND//LAB · 14 atributos · 42 exercícios · 5 motores</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-blink bg-tc" />
            dados locais · sem backend
          </span>
        </div>
      </footer>
    </div>
  )
}
