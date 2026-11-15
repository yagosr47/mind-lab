import { useCallback, useRef, useState } from 'react'
import { Kicker, Tag } from '@/components/ui/Primitives'
import { cx } from '@/lib/cx'
import type { EngineProps, RuleShiftPayload } from '@/types/lab'

type Rule = 'color' | 'shape' | 'count'
type CardColor = 'tc' | 'cold' | 'hot' | 'bone'
type CardShape = 'circle' | 'square' | 'triangle' | 'diamond'

interface Card {
  color: CardColor
  shape: CardShape
  count: number
}

const COLORS: CardColor[] = ['tc', 'cold', 'hot', 'bone']
const SHAPES: CardShape[] = ['circle', 'square', 'triangle', 'diamond']
const COUNTS = [1, 2, 3]
const ATTRS: Rule[] = ['color', 'shape', 'count']
const ATTR_LABEL: Record<Rule, string> = { color: 'Cor', shape: 'Forma', count: 'Quantidade' }

const FILL: Record<CardColor, string> = {
  tc: 'fill-tc',
  cold: 'fill-cold',
  hot: 'fill-hot',
  bone: 'fill-bone',
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomCard(): Card {
  return {
    color: randomItem(COLORS),
    shape: randomItem(SHAPES),
    count: randomItem(COUNTS),
  }
}

function differentValue(attribute: Rule, current: Card[Rule]): Card[Rule] {
  if (attribute === 'count') {
    const options = COUNTS.filter((value) => value !== current)
    return randomItem(options)
  }
  const options = (attribute === 'color' ? COLORS : SHAPES).filter((value) => value !== current)
  return randomItem(options) as Card[Rule]
}

function key(card: Card): string {
  return `${card.color}|${card.shape}|${card.count}`
}

function makeCorrect(stimulus: Card, rule: Rule): Card {
  const card = { ...stimulus }
  for (const attribute of ATTRS) {
    if (attribute !== rule) {
      ;(card[attribute] as Card[Rule]) = differentValue(attribute, stimulus[attribute])
    }
  }
  return card
}

function makeDistractor(stimulus: Card, rule: Rule): Card {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const card = randomCard()
    if (card[rule] === stimulus[rule]) continue
    if (key(card) === key(stimulus)) continue
    return card
  }
  return { ...stimulus, [rule]: differentValue(rule, stimulus[rule]) }
}

function buildTrial(
  rule: Rule,
  ambiguous = false,
): { stimulus: Card; cards: Card[]; correct: number } {
  const stimulus = randomCard()
  const correctCard = makeCorrect(stimulus, rule)
  const seen = new Set<string>([key(stimulus), key(correctCard)])
  const distractors: Card[] = []

  if (ambiguous) {
    // Gêmea visual: compartilha os dois atributos que não são a regra.
    const twin = { ...stimulus, [rule]: differentValue(rule, stimulus[rule]) } as Card
    if (!seen.has(key(twin))) {
      seen.add(key(twin))
      distractors.push(twin)
    }
  }

  while (distractors.length < 3) {
    const card = makeDistractor(stimulus, rule)
    if (seen.has(key(card))) continue
    seen.add(key(card))
    distractors.push(card)
  }

  const cards = [correctCard, ...distractors]
    .map((card) => ({ card, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((entry) => entry.card)

  return {
    stimulus,
    cards,
    correct: cards.findIndex((card) => key(card) === key(correctCard)),
  }
}

function Shape({ shape, color }: { shape: CardShape; color: CardColor }) {
  const fill = FILL[color]
  return (
    <svg viewBox="0 0 24 24" className={cx('h-full w-full', fill)} aria-hidden>
      {shape === 'circle' ? <circle cx="12" cy="12" r="9.5" /> : null}
      {shape === 'square' ? <rect x="2.5" y="2.5" width="19" height="19" /> : null}
      {shape === 'triangle' ? <polygon points="12,2 22,21 2,21" /> : null}
      {shape === 'diamond' ? <polygon points="12,1.5 22.5,12 12,22.5 1.5,12" /> : null}
    </svg>
  )
}

function CardFace({
  card,
  size = 'md',
  className,
  label,
}: {
  card: Card
  size?: 'md' | 'lg'
  className?: string
  label?: string
}) {
  const box = size === 'lg' ? 'h-32 w-32 sm:h-36 sm:w-36' : 'h-24 w-24 sm:h-28 sm:w-28'
  const glyph = size === 'lg' ? 'h-12 w-12' : 'h-9 w-9'

  return (
    <div className={cx('flex flex-col items-center gap-2', className)}>
      <div className={cx('flex items-center justify-center gap-1.5 border bg-ash/40 p-3 hairline', box)}>
        {Array.from({ length: card.count }).map((_, index) => (
          <span key={index} className={glyph}>
            <Shape shape={card.shape} color={card.color} />
          </span>
        ))}
      </div>
      {label ? <span className="font-mono text-[9px] tracking-[0.16em] text-mute uppercase">{label}</span> : null}
    </div>
  )
}

export function RuleShiftEngine({ config, onComplete }: EngineProps) {
  const payload = config.payload as unknown as RuleShiftPayload
  const attributes = payload.attributes.length > 0 ? payload.attributes : ATTRS
  const [rule, setRule] = useState<Rule>(() => randomItem(attributes))
  const [trial, setTrial] = useState(() => buildTrial(rule, payload.ambiguous))
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [sinceChange, setSinceChange] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const [result, setResult] = useState<'ok' | 'bad' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const correctRef = useRef(0)
  const doneRef = useRef(false)

  const finish = useCallback(
    (totalCorrect: number) => {
      if (doneRef.current) return
      doneRef.current = true
      setDone(true)
      onComplete({
        accuracy: Math.round((totalCorrect / Math.max(1, payload.trials)) * 100),
        note: `${totalCorrect}/${payload.trials} escolhas alinhadas à regra ativa`,
      })
    },
    [onComplete, payload.trials],
  )

  const choose = (cardIndex: number) => {
    if (result !== null || done) return
    const isCorrect = cardIndex === trial.correct
    setPick(cardIndex)
    setResult(isCorrect ? 'ok' : 'bad')
    if (isCorrect) {
      correctRef.current += 1
      setCorrectCount(correctRef.current)
    }

    const nextSince = sinceChange + (isCorrect ? 1 : 0)
    const nextIndex = index + 1

    window.setTimeout(() => {
      if (nextIndex >= payload.trials) {
        finish(correctRef.current)
        return
      }

      let nextRule = rule
      if (nextSince >= payload.changeEvery) {
        const options = attributes.filter((attribute) => attribute !== rule)
        nextRule = randomItem(options.length > 0 ? options : attributes)
        setSinceChange(0)
        if (config.level === 'easy') {
          setNotice('REGRA ALTERADA · reavalie o critério')
          window.setTimeout(() => setNotice(null), 1600)
        }
      } else {
        setSinceChange(nextSince)
      }

      setRule(nextRule)
      setTrial(buildTrial(nextRule, payload.ambiguous))
      setIndex(nextIndex)
      setPick(null)
      setResult(null)
    }, 720)
  }

  if (done) return null

  const progress = (index / Math.max(1, payload.trials)) * 100

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker>
          Rodada {String(index + 1).padStart(2, '0')} / {String(payload.trials).padStart(2, '0')}
        </Kicker>
        <div className="flex items-center gap-2">
          <Tag tone="cold">Acertos {correctCount}</Tag>
          <Tag>Critério oculto</Tag>
        </div>
      </div>

      <div className="h-[3px] w-full bg-ash">
        <div className="h-full bg-cold transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>

      {notice ? (
        <div className="animate-slam border border-hot/50 bg-hot/10 px-3 py-2 text-center font-mono text-[10px] tracking-[0.18em] text-hot uppercase">
          {notice}
        </div>
      ) : null}

      <p className="text-center text-sm text-mute">
        Descubra qual atributo liga a carta ao estímulo. A regra pode mudar sem aviso.
      </p>

      <div className="flex justify-center">
        <CardFace card={trial.stimulus} size="lg" label="Estímulo" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {trial.cards.map((card, cardIndex) => {
          const isPicked = pick === cardIndex
          const isAnswer = trial.correct === cardIndex
          const state =
            result !== null && isAnswer
              ? 'border-tc bg-tc/10'
              : isPicked
                ? 'border-hot bg-hot/10'
                : 'border-white/10 hover:border-white/40'

          return (
            <button
              key={`${key(card)}-${cardIndex}`}
              type="button"
              disabled={result !== null}
              onClick={() => choose(cardIndex)}
              className={cx(
                'flex flex-col items-center gap-2 border py-3 transition-colors disabled:cursor-default',
                state,
              )}
            >
              <CardFace card={card} />
              <span className="font-mono text-[9px] tracking-[0.18em] text-mute">
                {['A', 'B', 'C', 'D'][cardIndex]}
              </span>
            </button>
          )
        })}
      </div>

      <p className="text-center font-mono text-[10px] tracking-[0.16em] text-mute uppercase">
        {ATTR_LABEL[attributes[0]]} · {ATTR_LABEL[attributes[attributes.length - 1]]} · {payload.changeEvery}{' '}
        acertos alteram o critério
      </p>
    </div>
  )
}
