import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bar, Kicker, Tag } from '@/components/ui/Primitives'
import { poolById } from '@/data/pools'
import { cx } from '@/lib/cx'
import type { EngineProps, StroopPayload } from '@/types/lab'

type Task = StroopPayload['task']

interface Round {
  kind: 'ink' | 'direction' | 'classify'
  word?: string
  ink?: string
  arrow?: string
  label?: string
  text?: string
  options: string[]
  correct: number
  inverted: boolean
  blink: boolean
  roundMs: number
}

const COLORS = [
  { name: 'VERMELHO', hex: '#ff2e4d' },
  { name: 'CIANO', hex: '#3fd9ff' },
  { name: 'LIMÃO', hex: '#e6ff4a' },
  { name: 'VIOLETA', hex: '#a78bfa' },
]

const DIRECTIONS = [
  { name: 'ESQUERDA', arrow: '←' },
  { name: 'DIREITA', arrow: '→' },
  { name: 'CIMA', arrow: '↑' },
  { name: 'BAIXO', arrow: '↓' },
]

function pick<T>(items: T[], exclude = -1): number {
  if (items.length <= 1) return 0
  let index = Math.floor(Math.random() * items.length)
  if (index === exclude) index = (index + 1) % items.length
  return index
}

function buildRounds(payload: StroopPayload): Round[] {
  const total = Math.max(1, payload.rounds)
  const rounds: Round[] = []
  const pool = poolById(payload.pool)

  for (let index = 0; index < total; index += 1) {
    const blink = Boolean(payload.blink) && index % 3 === 0
    const inverted = Boolean(payload.reverse) && (payload.blink ? blink : index % 3 === 2)

    if (payload.task === 'ink' || payload.task === 'word') {
      const wordIndex = pick(COLORS)
      const inkIndex = pick(COLORS, wordIndex)
      const base = payload.task === 'word' ? wordIndex : inkIndex
      const correct = inverted ? (payload.task === 'word' ? inkIndex : wordIndex) : base
      rounds.push({
        kind: 'ink',
        word: COLORS[wordIndex].name,
        ink: COLORS[inkIndex].hex,
        options: COLORS.map((color) => color.name),
        correct,
        inverted,
        blink,
        roundMs: payload.roundMs,
      })
      continue
    }

    if (payload.task === 'direction') {
      const arrowIndex = pick(DIRECTIONS)
      const labelIndex = pick(DIRECTIONS, arrowIndex)
      rounds.push({
        kind: 'direction',
        arrow: DIRECTIONS[arrowIndex].arrow,
        label: DIRECTIONS[labelIndex].name,
        options: DIRECTIONS.map((direction) => direction.name),
        correct: inverted ? labelIndex : arrowIndex,
        inverted,
        blink,
        roundMs: payload.roundMs,
      })
      continue
    }

    const item = pool.items[Math.floor(Math.random() * pool.items.length)]
    rounds.push({
      kind: 'classify',
      text: item.text,
      options: [...pool.options],
      correct: inverted ? (item.answer === 0 ? 1 : 0) : item.answer,
      inverted,
      blink,
      roundMs: payload.roundMs,
    })
  }

  return rounds
}

function ruleLabel(round: Round, task: Task): string {
  if (round.kind === 'ink') return round.inverted ? 'Responda a palavra' : 'Responda a tinta'
  if (round.kind === 'direction') return round.inverted ? 'Responda o texto' : 'Responda a seta'
  if (task === 'classify') return round.inverted ? 'Categoria invertida' : 'Categoria padrão'
  return round.inverted ? 'Regra invertida' : 'Regra padrão'
}

export function StroopReactionEngine({ config, onComplete }: EngineProps) {
  const payload = config.payload as unknown as StroopPayload
  const rounds = useMemo(() => buildRounds(payload), [payload])
  const [roundIndex, setRoundIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(rounds[0]?.roundMs ?? 0)
  const [locked, setLocked] = useState(false)
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null)
  const [chosen, setChosen] = useState<number | null>(null)
  const [hits, setHits] = useState(0)
  const hitsRef = useRef(0)
  const resolvingRef = useRef(false)
  const doneRef = useRef(false)
  const round = rounds[roundIndex]

  const finish = useCallback(
    (totalHits: number) => {
      if (doneRef.current) return
      doneRef.current = true
      const accuracy = rounds.length === 0 ? 0 : (totalHits / rounds.length) * 100
      onComplete({
        accuracy: Math.round(accuracy),
        note: `${totalHits}/${rounds.length} respostas corretas`,
      })
    },
    [onComplete, rounds.length],
  )

  const resolve = useCallback(
    (choice: number | null) => {
      if (resolvingRef.current) return
      resolvingRef.current = true
      const current = rounds[roundIndex]
      setLocked(true)
      setChosen(choice)

      const isCorrect = choice !== null && choice === current.correct
      if (isCorrect) {
        hitsRef.current += 1
        setHits(hitsRef.current)
        setFlash('ok')
      } else {
        setFlash('bad')
      }

      window.setTimeout(() => {
        if (roundIndex + 1 >= rounds.length) {
          finish(hitsRef.current)
          return
        }
        resolvingRef.current = false
        setLocked(false)
        setFlash(null)
        setChosen(null)
        setRoundIndex((index) => index + 1)
        setTimeLeft(rounds[roundIndex + 1].roundMs)
      }, 430)
    },
    [finish, roundIndex, rounds],
  )

  useEffect(() => {
    if (locked || !round) return
    const startedAt = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const remaining = round.roundMs - (now - startedAt)
      setTimeLeft(Math.max(0, remaining))
      if (remaining <= 0) {
        resolve(null)
        return
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [locked, round, resolve])

  useEffect(() => {
    const arrows: Record<string, number> = {
      ArrowLeft: 0,
      ArrowRight: 1,
      ArrowUp: 2,
      ArrowDown: 3,
    }

    const onKey = (event: KeyboardEvent) => {
      if (locked || !round) return
      if (round.kind === 'direction' && event.key in arrows) {
        resolve(arrows[event.key])
        return
      }
      const numeric = Number.parseInt(event.key, 10)
      if (Number.isFinite(numeric) && numeric >= 1 && numeric <= round.options.length) {
        resolve(numeric - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [locked, resolve, round])

  if (!round) return null

  const progress = rounds.length === 0 ? 0 : (roundIndex / rounds.length) * 100
  const timeRatio = round.roundMs === 0 ? 0 : (timeLeft / round.roundMs) * 100

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Kicker>
            Rodada {String(roundIndex + 1).padStart(2, '0')} / {String(rounds.length).padStart(2, '0')}
          </Kicker>
          <Tag tone={round.inverted ? 'hot' : 'tc'}>{ruleLabel(round, payload.task)}</Tag>
        </div>
        <Kicker>
          Acertos <span className="text-bone">{String(hits).padStart(2, '0')}</span>
        </Kicker>
      </div>

      <div className="relative h-[3px] w-full bg-ash">
        <div className="h-full bg-tc" style={{ width: `${progress}%` }} />
      </div>

      <div className="relative overflow-hidden border border-white/10 bg-ink px-4 py-10 sm:py-14">
        {payload.distractors ? (
          <div aria-hidden className="pointer-events-none absolute inset-0 select-none opacity-[0.08]">
            <div className="grid h-full grid-cols-6 place-items-center font-mono text-[10px] text-bone">
              {Array.from({ length: 30 }).map((_, index) => (
                <span key={index}>{index % 3 === 0 ? '×' : index % 3 === 1 ? '+' : '·'}</span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="relative flex min-h-[132px] items-center justify-center">
          {round.kind === 'ink' ? (
            <span
              className={cx(
                'font-display text-[clamp(2.6rem,11vw,6rem)] leading-none tracking-tight uppercase',
                round.blink && 'animate-blink',
              )}
              style={{ color: round.ink }}
            >
              {round.word}
            </span>
          ) : null}

          {round.kind === 'direction' ? (
            <div className={cx('flex items-center gap-6', round.blink && 'animate-blink')}>
              <span className="text-[clamp(4rem,14vw,8rem)] leading-none text-tc">{round.arrow}</span>
              <span className="font-condensed text-[clamp(1.3rem,4vw,2.2rem)] tracking-[0.18em] text-bone uppercase">
                {round.label}
              </span>
            </div>
          ) : null}

          {round.kind === 'classify' ? (
            <p
              className={cx(
                'max-w-xl text-center font-condensed text-[clamp(1.4rem,4.4vw,2.4rem)] leading-tight text-bone',
                round.blink && 'animate-blink',
              )}
            >
              {round.text}
            </p>
          ) : null}
        </div>

        {flash ? (
          <div
            className={cx(
              'pointer-events-none absolute inset-0 border-2',
              flash === 'ok' ? 'border-tc bg-tc/10' : 'border-hot bg-hot/10',
            )}
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between font-mono text-[10px] tracking-[0.18em] text-mute uppercase">
          <span>Tempo da rodada</span>
          <span className="tabular-nums">{(timeLeft / 1000).toFixed(1)}s</span>
        </div>
        <Bar value={timeRatio} min={0} max={100} tone={timeRatio < 30 ? 'hot' : 'tc'} className="h-2" />
      </div>

      <div className={cx('grid gap-2', round.options.length > 2 ? 'grid-cols-2' : 'grid-cols-2')}>
        {round.options.map((option, index) => {
          const isChosen = chosen === index
          const isAnswer = round.correct === index
          const tone =
            locked && isAnswer
              ? 'border-tc text-tc bg-tc/10'
              : isChosen
                ? 'border-hot text-hot bg-hot/10'
                : 'border-white/15 text-bone hover:border-white/40 hover:bg-ash'

          return (
            <button
              key={option}
              type="button"
              disabled={locked}
              onClick={() => resolve(index)}
              className={cx(
                'group flex items-center justify-between border px-4 py-4 text-left transition-colors disabled:cursor-default',
                tone,
              )}
            >
              <span className="font-condensed text-base font-semibold tracking-[0.14em] uppercase">
                {option}
              </span>
              <span className="font-mono text-[10px] text-mute">[{index + 1}]</span>
            </button>
          )
        })}
      </div>

      <p className="text-center font-mono text-[10px] tracking-[0.14em] text-mute uppercase">
        Use as teclas 1–{round.options.length} ou clique na resposta
      </p>
    </div>
  )
}
