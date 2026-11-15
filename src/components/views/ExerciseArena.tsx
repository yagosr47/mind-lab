import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import { MemoryMatrixEngine } from '@/components/engines/MemoryMatrixEngine'
import { RuleShiftEngine } from '@/components/engines/RuleShiftEngine'
import { StatementAuditEngine } from '@/components/engines/StatementAuditEngine'
import { StroopReactionEngine } from '@/components/engines/StroopReactionEngine'
import { TacticalTreeEngine } from '@/components/engines/TacticalTreeEngine'
import { Button, Kicker, Panel, Tag } from '@/components/ui/Primitives'
import { ENGINE_LABEL } from '@/data/exercises'
import { attributeByKey } from '@/data/attributes'
import { cx } from '@/lib/cx'
import type { Difficulty, EngineOutcome, EngineProps, Exercise } from '@/types/lab'

const ENGINES: Record<Exercise['engine'], ComponentType<EngineProps>> = {
  'stroop-reaction': StroopReactionEngine,
  'memory-matrix': MemoryMatrixEngine,
  'rule-shift': RuleShiftEngine,
  'statement-audit': StatementAuditEngine,
  'tactical-tree': TacticalTreeEngine,
}

const DIFFICULTY_TONE: Record<Difficulty, 'cold' | 'tc' | 'hot'> = {
  easy: 'cold',
  medium: 'tc',
  hard: 'hot',
}

export interface ArenaResult extends EngineOutcome {
  timeSpentSec: number
}

interface ArenaProps {
  exercise: Exercise
  difficulty: Difficulty
  onAbort: () => void
  onComplete: (result: ArenaResult) => void
}

function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safe / 60)
  const rest = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

export function ExerciseArena({ exercise, difficulty, onAbort, onComplete }: ArenaProps) {
  const config = exercise.difficulties[difficulty]
  const meta = attributeByKey(exercise.attr)
  const Engine = ENGINES[exercise.engine]

  const [started, setStarted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [abort, setAbort] = useState(false)
  const startedAt = useRef<number | null>(null)
  const completedRef = useRef(false)

  const finish = useCallback(
    (outcome: EngineOutcome) => {
      if (completedRef.current) return
      completedRef.current = true
      const spent = startedAt.current ? (Date.now() - startedAt.current) / 1000 : 0
      onComplete({ ...outcome, timeSpentSec: Math.max(1, spent) })
    },
    [onComplete],
  )

  useEffect(() => {
    if (!started) return
    const interval = window.setInterval(() => {
      if (!startedAt.current) return
      setElapsed((Date.now() - startedAt.current) / 1000)
    }, 250)
    return () => window.clearInterval(interval)
  }, [started])

  const remaining = config.timeLimitSec === null ? null : Math.max(0, config.timeLimitSec - elapsed)

  useEffect(() => {
    if (!started || config.timeLimitSec === null || completedRef.current) return
    if (elapsed > config.timeLimitSec + 3) {
      finish({ accuracy: 0, note: 'Cronômetro esgotado antes da conclusão' })
    }
  }, [config.timeLimitSec, elapsed, finish, started])

  const begin = () => {
    startedAt.current = Date.now()
    setStarted(true)
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Panel className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Kicker className="text-tc">Briefing · {meta.code}</Kicker>
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone={DIFFICULTY_TONE[difficulty]}>{config.label}</Tag>
              <Tag>{ENGINE_LABEL[exercise.engine]}</Tag>
              <Tag>{config.xpReward} XP base</Tag>
            </div>
          </div>

          <h1 className="mt-4 font-display text-[clamp(1.7rem,5vw,2.6rem)] leading-[1.05] tracking-tight text-bone uppercase">
            {exercise.title}
          </h1>
          <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-mute uppercase">
            {meta.name} · {meta.domain} · {exercise.subtitle}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="border border-white/10 bg-ash/20 p-4">
              <Kicker>Instruções</Kicker>
              <p className="mt-2 text-sm leading-relaxed text-bone/90">{exercise.instructions}</p>
            </div>
            <div className="border border-white/10 bg-ash/20 p-4">
              <Kicker>Parâmetros desta dificuldade</Kicker>
              <p className="mt-2 text-sm leading-relaxed text-bone/90">{config.description}</p>
              <dl className="mt-3 space-y-1 font-mono text-[10px] tracking-[0.12em] text-mute uppercase">
                <div className="flex justify-between">
                  <dt>Cronômetro</dt>
                  <dd>{config.timeLimitSec === null ? 'livre' : `${config.timeLimitSec}s`}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>XP de referência</dt>
                  <dd>{config.xpReward}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1 py-3" onClick={begin}>
              Iniciar série
            </Button>
            <Button tone="ghost" onClick={onAbort}>
              Voltar ao catálogo
            </Button>
          </div>
        </Panel>

        <p className="text-center font-mono text-[9px] tracking-[0.18em] text-mute uppercase">
          Modo foco total · o cronômetro começa ao iniciar · sair não registra progresso
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Panel className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone={DIFFICULTY_TONE[difficulty]}>{config.label}</Tag>
              <Tag>{meta.code}</Tag>
              <Kicker>{meta.name} · {ENGINE_LABEL[exercise.engine]}</Kicker>
            </div>
            <h1 className="mt-1 truncate font-condensed text-xl font-semibold tracking-[0.04em] text-bone uppercase sm:text-2xl">
              {exercise.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <Kicker>{remaining === null ? 'tempo' : 'restante'}</Kicker>
              <p
                className={cx(
                  'font-mono text-2xl leading-none tabular-nums',
                  remaining !== null && remaining <= 5 ? 'animate-blink text-hot' : 'text-bone',
                )}
              >
                {remaining === null ? formatClock(elapsed) : formatClock(remaining)}
              </p>
            </div>
            <Button tone="hot" className="px-3 py-2 text-xs" onClick={() => setAbort(true)}>
              Abortar
            </Button>
          </div>
        </div>

        {remaining !== null ? (
          <div className="mt-3 h-[2px] w-full bg-ash">
            <div
              className={cx('h-full transition-[width] duration-300', remaining <= 5 ? 'bg-hot' : 'bg-tc')}
              style={{
                width: `${Math.max(0, Math.min(100, (remaining / Math.max(1, config.timeLimitSec ?? 1)) * 100))}%`,
              }}
            />
          </div>
        ) : null}
      </Panel>

      {abort ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-hot/40 bg-hot/10 px-4 py-3">
          <p className="font-mono text-[11px] tracking-[0.12em] text-hot uppercase">
            Abortar encerra a sessão sem registrar progresso. Confirmar?
          </p>
          <div className="flex gap-2">
            <Button tone="hot" className="px-3 py-1.5 text-xs" onClick={onAbort}>
              Sim, abortar
            </Button>
            <Button tone="ghost" className="px-3 py-1.5 text-xs" onClick={() => setAbort(false)}>
              Continuar
            </Button>
          </div>
        </div>
      ) : null}

      <Panel className="grid-lines overflow-hidden p-4 sm:p-6" chamfer={false}>
        <div className="flex min-h-[42vh] flex-col justify-center">
          <Engine exercise={exercise} config={config} onComplete={finish} />
        </div>
      </Panel>

      <p className="text-center font-mono text-[9px] tracking-[0.18em] text-mute uppercase">
        {exercise.cognitivePrinciple.split('.')[0]}.
      </p>
    </div>
  )
}
