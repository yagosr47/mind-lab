import { useEffect, useRef, useState } from 'react'
import { Button, Kicker, Tag } from '@/components/ui/Primitives'
import { caseById } from '@/data/cases'
import { cx } from '@/lib/cx'
import type { EngineProps, StatementPayload } from '@/types/lab'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function StatementAuditEngine({ config, onComplete }: EngineProps) {
  const payload = config.payload as unknown as StatementPayload
  const file = caseById(payload.caseId)
  const segments = file.segments.slice(0, payload.visible)
  const answers = payload.answers.filter((index) => index < segments.length)
  const required = Math.min(payload.required, segments.length)

  const [selected, setSelected] = useState<number[]>([])
  const [phase, setPhase] = useState<'select' | 'reason'>('select')
  const [reason, setReason] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(config.timeLimitSec)
  const doneRef = useRef(false)

  const submit = (finalReason: number | null, current: number[]) => {
    if (doneRef.current) return
    doneRef.current = true
    const hits = current.filter((index) => answers.includes(index)).length
    const wrong = current.length - hits
    const selectionScore = Math.max(0, (hits / Math.max(1, answers.length)) * 70 - wrong * 12)
    const reasonScore = finalReason === payload.correctReason ? 30 : 0
    onComplete({
      accuracy: Math.round(clamp(selectionScore + reasonScore, 0, 100)),
      note: `${hits}/${answers.length} cláusulas corretas · motivo ${
        finalReason === payload.correctReason ? 'correto' : 'incorreto'
      }`,
    })
  }

  const submitRef = useRef({ submit, selected })
  useEffect(() => {
    submitRef.current = { submit, selected }
  })

  useEffect(() => {
    if (!config.timeLimitSec) return
    const interval = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current === null) return null
        if (current <= 1) {
          window.clearInterval(interval)
          submitRef.current.submit(null, submitRef.current.selected)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [config.timeLimitSec])

  const toggle = (index: number) => {
    if (phase !== 'select') return
    setSelected((current) => {
      if (current.includes(index)) return current.filter((item) => item !== index)
      if (current.length >= required) return current
      return [...current, index]
    })
  }

  const lowTime = timeLeft !== null && timeLeft <= 10

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Kicker>Dossiê · {file.title}</Kicker>
          <div className="flex items-center gap-2">
            <Tag tone={phase === 'select' ? 'tc' : 'cold'}>
              {phase === 'select' ? 'Etapa 1 · apontar' : 'Etapa 2 · motivo'}
            </Tag>
            {timeLeft !== null ? (
              <Tag tone={lowTime ? 'hot' : 'mute'}>
                T-{String(timeLeft).padStart(2, '0')}s
              </Tag>
            ) : null}
          </div>
        </div>

        <p className="border-l border-tc/50 pl-3 text-sm leading-relaxed text-mute">{file.brief}</p>

        {payload.redHerrings ? (
          <div className="border border-hot/30 bg-hot/5 px-3 py-2 font-mono text-[10px] tracking-[0.14em] text-hot/90 uppercase">
            Alerta: indícios secundários inseridos no dossiê. Nem toda cláusula estranha é falha.
          </div>
        ) : null}

        <div className="space-y-2">
          {segments.map((segment, index) => {
            const isSelected = selected.includes(index)
            return (
              <button
                key={`${segment.speaker}-${index}`}
                type="button"
                onClick={() => toggle(index)}
                disabled={phase !== 'select'}
                className={cx(
                  'group flex w-full items-start gap-3 border px-3 py-3 text-left transition-colors',
                  isSelected
                    ? 'border-tc bg-tc/[0.07]'
                    : 'border-white/10 bg-coal hover:border-white/30',
                  phase !== 'select' && 'cursor-default',
                )}
              >
                <span
                  className={cx(
                    'mt-0.5 shrink-0 font-mono text-[9px] tracking-[0.12em]',
                    isSelected ? 'text-tc' : 'text-mute',
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="mr-2 font-mono text-[9px] tracking-[0.18em] text-cold uppercase">
                    {segment.speaker}
                  </span>
                  <span className={cx('text-sm leading-relaxed', isSelected ? 'text-bone' : 'text-bone/85')}>
                    {segment.text}
                  </span>
                </span>
                {isSelected ? <span className="ml-auto shrink-0 font-mono text-[10px] text-tc">✓</span> : null}
              </button>
            )
          })}
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {phase === 'select' ? (
          <>
            <div className="border border-white/10 bg-coal p-4">
              <Kicker>Seleção</Kicker>
              <p className="mt-2 font-mono text-2xl tabular-nums text-bone">
                {selected.length}
                <span className="text-sm text-mute">/{required}</span>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-mute">
                Clique nas cláusulas que contêm contradição, incongruência, falácia ou pista
                comportamental.
              </p>
            </div>
            <Button
              className="w-full"
              disabled={selected.length !== required}
              onClick={() => setPhase('reason')}
            >
              Validar seleção
            </Button>
            <p className="font-mono text-[10px] leading-relaxed tracking-[0.12em] text-mute uppercase">
              Etapa 2: escolha o motivo técnico da falha. O motivo vale 30% da precisão.
            </p>
          </>
        ) : (
          <>
            <div className="border border-white/10 bg-coal p-4">
              <Kicker>Motivo técnico</Kicker>
              <div className="mt-3 space-y-2">
                {payload.reasons.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setReason(index)}
                    className={cx(
                      'flex w-full items-start gap-2 border px-3 py-2 text-left text-xs leading-relaxed transition-colors',
                      reason === index
                        ? 'border-tc bg-tc/10 text-bone'
                        : 'border-white/10 text-mute hover:border-white/30',
                    )}
                  >
                    <span className="font-mono text-[10px] text-tc">{String(index + 1)}</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full" disabled={reason === null} onClick={() => submit(reason, selected)}>
              Fechar laudo
            </Button>
            <Button tone="ghost" className="w-full" onClick={() => setPhase('select')}>
              Revisar cláusulas
            </Button>
          </>
        )}

        <div className="border border-white/10 bg-ash/30 p-3">
          <Kicker>Cláusulas apontadas</Kicker>
          <p className="mt-2 font-mono text-[11px] text-bone">
            {selected.length === 0 ? '—' : selected.map((index) => String(index + 1).padStart(2, '0')).join(' · ')}
          </p>
        </div>
      </aside>
    </div>
  )
}
