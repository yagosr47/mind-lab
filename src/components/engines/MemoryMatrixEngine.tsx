import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Kicker, Tag } from '@/components/ui/Primitives'
import { cx } from '@/lib/cx'
import { createRng, nextSeed } from '@/lib/rng'
import type { EngineProps, MemoryPayload } from '@/types/lab'

type Phase = 'exposure' | 'answer' | 'feedback' | 'stream'

interface Trial {
  lit: number[]
  changed: number | null
  sequence: number[]
}

const ROWS = 'ABCDE'

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
  }
  return copy
}

function makeTrial(payload: MemoryPayload): Trial {
  const cells = payload.gridSize * payload.gridSize
  const count = Math.min(payload.litCount, Math.max(1, cells - 1))
  const pool = Array.from({ length: cells }, (_, index) => index)
  const lit = shuffle(pool).slice(0, count)
  const changedPool = pool.filter((cell) => !lit.includes(cell))
  const changed =
    payload.mode === 'change'
      ? changedPool[Math.floor(Math.random() * Math.max(1, changedPool.length))]
      : null

  return { lit, changed: changed ?? null, sequence: lit }
}

function buildStream(payload: MemoryPayload, seed: number): number[] {
  const rng = createRng(seed)
  const n = payload.n ?? 1
  const size = payload.gridSize
  const stream: number[] = []

  for (let index = 0; index < payload.trials; index += 1) {
    const previous = index >= n ? stream[index - n] : null
    const makeMatch = previous !== null && rng() < 0.35
    let next = Math.floor(rng() * size * size)
    if (makeMatch && previous !== null) next = previous
    else if (previous !== null && next === previous) next = (next + 1) % (size * size)
    stream.push(next)
  }

  return stream
}

function Matrix({
  size,
  lit,
  selected,
  noise,
  onCell,
  disabled,
}: {
  size: number
  lit: number[]
  selected: number[]
  noise: number | null
  onCell?: (index: number) => void
  disabled?: boolean
}) {
  const cells = Array.from({ length: size * size }, (_, index) => index)

  return (
    <div className="mx-auto w-full max-w-[430px]">
      <div className="mb-1 flex gap-1 pl-6">
        {Array.from({ length: size }, (_, column) => (
          <span
            key={column}
            className="flex-1 text-center font-mono text-[9px] tracking-[0.2em] text-mute"
          >
            {String(column + 1).padStart(2, '0')}
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <div className="flex w-5 flex-col">
          {Array.from({ length: size }, (_, row) => (
            <span
              key={row}
              className="flex flex-1 items-center justify-center font-mono text-[9px] text-mute"
            >
              {ROWS[row]}
            </span>
          ))}
        </div>
        <div
          className="grid flex-1 gap-1.5"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {cells.map((cell) => {
            const isLit = lit.includes(cell)
            const isSelected = selected.includes(cell)
            const isNoise = noise === cell

            return (
              <button
                key={cell}
                type="button"
                disabled={disabled || !onCell}
                onClick={() => onCell?.(cell)}
                aria-label={`Célula ${ROWS[Math.floor(cell / size)]}${cell % size + 1}`}
                className={cx(
                  'relative aspect-square border transition-all duration-150',
                  isSelected
                    ? 'border-cold bg-cold/25'
                    : isNoise
                      ? 'border-hot/70 bg-hot/25'
                      : isLit
                        ? 'border-tc bg-tc'
                        : 'border-white/10 bg-ash/40',
                  onCell && !disabled && 'hover:border-white/45 hover:bg-ash',
                  disabled && 'cursor-default',
                )}
              >
                {isSelected ? (
                  <span className="absolute inset-0 grid place-items-center font-mono text-[10px] text-cold">
                    ✓
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function MemoryMatrixEngine({ config, onComplete }: EngineProps) {
  const payload = config.payload as unknown as MemoryPayload
  const [streamSeed] = useState(() => nextSeed())
  const positions = useMemo(
    () => (payload.mode === 'nback' ? buildStream(payload, streamSeed) : []),
    [payload, streamSeed],
  )

  const [trialIndex, setTrialIndex] = useState(0)
  const [trial, setTrial] = useState<Trial>(() => makeTrial(payload))
  const [phase, setPhase] = useState<Phase>(payload.mode === 'nback' ? 'stream' : 'exposure')
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number[]>([])
  const [feedback, setFeedback] = useState<'ok' | 'bad' | null>(null)
  const [noise, setNoise] = useState<number | null>(null)
  const [streamIndex, setStreamIndex] = useState(0)
  const [hits, setHits] = useState(0)
  const [pressedAt, setPressedAt] = useState(-1)

  const scoreRef = useRef(0)
  const hitsRef = useRef(0)
  const pressedRef = useRef(false)
  const doneRef = useRef(false)
  const resolvedRef = useRef(false)

  const finish = useCallback(
    (accuracy: number, note: string) => {
      if (doneRef.current) return
      doneRef.current = true
      onComplete({ accuracy: Math.round(Math.max(0, Math.min(100, accuracy))), note })
    },
    [onComplete],
  )

  const closeTrial = useCallback(
    (trialScore: number) => {
      if (resolvedRef.current) return
      resolvedRef.current = true
      scoreRef.current += trialScore
      setFeedback(trialScore >= 60 ? 'ok' : 'bad')

      window.setTimeout(() => {
        const next = trialIndex + 1
        if (next >= payload.trials) {
          const accuracy = (scoreRef.current / payload.trials) * 100
          finish(accuracy, `${payload.trials} rodadas concluídas`)
          return
        }
        resolvedRef.current = false
        setFeedback(null)
        setSelected([])
        setStep(0)
        setTrialIndex(next)
        setTrial(makeTrial(payload))
        setPhase('exposure')
      }, 850)
    },
    [finish, payload, trialIndex],
  )

  /* Exposição: sequência animada ou padrão estático. */
  useEffect(() => {
    if (phase !== 'exposure') return
    const isSequence = payload.mode === 'sequence'

    if (!isSequence) {
      const timer = window.setTimeout(() => {
        setSelected([])
        setPhase('answer')
      }, payload.exposureMs)
      return () => window.clearTimeout(timer)
    }

    const dwell = Math.max(240, Math.round(payload.exposureMs / Math.max(1, trial.sequence.length)))
    const timer = window.setTimeout(() => {
      if (step + 1 < trial.sequence.length) {
        setStep((current) => current + 1)
        return
      }
      setStep(0)
      setPhase('answer')
    }, dwell)
    return () => window.clearTimeout(timer)
  }, [phase, payload.exposureMs, payload.mode, step, trial.sequence.length])

  /* Distratores durante a exposição. */
  useEffect(() => {
    if (!payload.distractors || phase !== 'exposure') return
    const interval = window.setInterval(() => {
      const total = payload.gridSize * payload.gridSize
      setNoise(Math.floor(Math.random() * total))
    }, 240)
    return () => {
      window.clearInterval(interval)
      setNoise(null)
    }
  }, [payload.distractors, payload.gridSize, phase])

  const chooseRecallCell = (cell: number) => {
    if (phase !== 'answer') return
    if (payload.mode === 'recall') {
      setSelected((current) =>
        current.includes(cell) ? current.filter((item) => item !== cell) : [...current, cell],
      )
      return
    }
    if (payload.mode === 'change') {
      setSelected([cell])
      closeTrial(cell === trial.changed ? 100 : 0)
      return
    }
    if (payload.mode === 'sequence') {
      const next = [...selected, cell]
      setSelected(next)
      if (next.length === trial.sequence.length) {
        const matches = next.filter((value, index) => value === trial.sequence[index]).length
        closeTrial((matches / trial.sequence.length) * 100)
      }
    }
  }

  const confirmRecall = () => {
    const hitsCount = selected.filter((cell) => trial.lit.includes(cell)).length
    const wrong = selected.length - hitsCount
    const raw = (hitsCount - wrong * 0.5) / Math.max(1, trial.lit.length)
    closeTrial(Math.max(0, Math.min(1, raw)) * 100)
  }

  /* Modo N-back: stream contínuo de posições. */
  useEffect(() => {
    if (payload.mode !== 'nback') return
    if (streamIndex >= positions.length) {
      finish((hitsRef.current / Math.max(1, positions.length)) * 100, `${hitsRef.current}/${positions.length} decisões corretas`)
      return
    }

    pressedRef.current = false
    const match = streamIndex >= (payload.n ?? 1) && positions[streamIndex] === positions[streamIndex - (payload.n ?? 1)]

    const timer = window.setTimeout(() => {
      const ok = pressedRef.current === match
      if (ok) {
        hitsRef.current += 1
        setHits(hitsRef.current)
      }
      setFeedback(ok ? 'ok' : 'bad')
      window.setTimeout(() => setFeedback(null), 220)
      setStreamIndex((index) => index + 1)
    }, payload.streamMs ?? 900)

    return () => window.clearTimeout(timer)
  }, [finish, payload.mode, payload.n, payload.streamMs, positions, streamIndex])

  const pressed = pressedAt === streamIndex

  const applyMatch = () => {
    if (pressedRef.current) return
    pressedRef.current = true
    setPressedAt(streamIndex)
  }

  const isStream = payload.mode === 'nback'
  const progress = isStream ? (streamIndex / Math.max(1, positions.length)) * 100 : (trialIndex / payload.trials) * 100
  const lit =
    phase === 'exposure'
      ? payload.mode === 'sequence'
        ? [trial.sequence[step]]
        : trial.lit
      : payload.mode === 'change'
        ? [...trial.lit, trial.changed ?? -1]
        : []
  const instruction = {
    recall: 'Memorize as células acesas. Depois, reproduza o mesmo padrão.',
    change: 'Memorize o padrão. Aponte a célula que mudou na segunda exposição.',
    sequence: 'Memorize a ordem. Depois, clique nas células na mesma sequência.',
    nback: `Marque ACERTO quando a posição atual repetir a de ${payload.n ?? 1} passo(s) atrás.`,
  }[payload.mode]

  if (isStream) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Kicker>
            Estímulo {String(Math.min(streamIndex + 1, positions.length)).padStart(2, '0')} /{' '}
            {String(positions.length).padStart(2, '0')}
          </Kicker>
          <Tag tone="cold">N = {payload.n ?? 1} · {((payload.streamMs ?? 900) / 1000).toFixed(2)}s</Tag>
        </div>

        <div className="h-[3px] w-full bg-ash">
          <div className="h-full bg-cold transition-[width] duration-200" style={{ width: `${progress}%` }} />
        </div>

        <p className="text-center text-sm text-mute">{instruction}</p>

        <div className="relative mx-auto grid max-w-[280px] gap-1.5" style={{ gridTemplateColumns: `repeat(${payload.gridSize}, minmax(0,1fr))` }}>
          {Array.from({ length: payload.gridSize * payload.gridSize }, (_, cell) => (
            <div
              key={cell}
              className={cx(
                'aspect-square border transition-colors duration-100',
                positions[streamIndex] === cell ? 'border-tc bg-tc' : 'border-white/10 bg-ash/40',
              )}
            />
          ))}
          {feedback ? (
            <div className={cx('pointer-events-none absolute inset-0 border-2', feedback === 'ok' ? 'border-tc' : 'border-hot')} />
          ) : null}
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button
            tone={pressed ? 'ghost' : 'primary'}
            onClick={applyMatch}
            disabled={pressed}
            className="w-full max-w-xs py-4"
          >
            {pressed ? 'Registrado' : 'Acerto (espaço)'}
          </Button>
          <p className="font-mono text-[10px] tracking-[0.16em] text-mute uppercase">
            Acertos registrados: <span className="text-bone">{hits}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker>
          Rodada {String(trialIndex + 1).padStart(2, '0')} / {String(payload.trials).padStart(2, '0')}
        </Kicker>
        <div className="flex items-center gap-2">
          <Tag tone="cold">{payload.gridSize}x{payload.gridSize}</Tag>
          <Tag>{payload.mode === 'change' ? 'Detecção de mudança' : payload.mode === 'sequence' ? 'Sequência' : 'Recordação'}</Tag>
        </div>
      </div>

      <div className="h-[3px] w-full bg-ash">
        <div className="h-full bg-cold" style={{ width: `${progress}%` }} />
      </div>

      <p className="text-center text-sm text-mute">
        {phase === 'exposure' ? instruction : payload.mode === 'recall' ? 'Selecione as células e confirme.' : instruction}
      </p>

      <div className="relative">
        <Matrix
          size={payload.gridSize}
          lit={lit.filter((cell) => cell >= 0)}
          selected={phase === 'exposure' ? [] : selected}
          noise={phase === 'exposure' ? noise : null}
          onCell={phase === 'answer' ? chooseRecallCell : undefined}
          disabled={phase !== 'answer'}
        />
        {payload.distractors && phase === 'exposure' ? (
          <span className="absolute -top-2 right-0 animate-flicker font-mono text-[9px] tracking-[0.2em] text-hot uppercase">
            sinal instável
          </span>
        ) : null}
        {feedback ? (
          <div
            className={cx(
              'pointer-events-none absolute inset-0 border-2',
              feedback === 'ok' ? 'border-tc bg-tc/5' : 'border-hot bg-hot/5',
            )}
          />
        ) : null}
      </div>

      {payload.mode === 'recall' && phase === 'answer' ? (
        <div className="flex flex-col items-center gap-2">
          <Button onClick={confirmRecall} disabled={selected.length === 0} className="w-full max-w-xs">
            Confirmar padrão ({selected.length}/{trial.lit.length})
          </Button>
          <Kicker>Clique para marcar e desmarcar</Kicker>
        </div>
      ) : null}

      {phase === 'exposure' ? (
        <p className="text-center font-mono text-[10px] tracking-[0.2em] text-tc uppercase">
          Exposição · {payload.mode === 'sequence' ? 'ordem' : 'padrão'} em curso
        </p>
      ) : null}

      {phase === 'answer' && payload.mode === 'sequence' ? (
        <p className="text-center font-mono text-[10px] tracking-[0.2em] text-mute uppercase">
          Ordem marcada: {selected.length}/{trial.sequence.length}
        </p>
      ) : null}
    </div>
  )
}
