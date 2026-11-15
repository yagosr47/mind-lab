import { useRef, useState } from 'react'
import { Button, Kicker, Meter, Tag } from '@/components/ui/Primitives'
import { scenarioById, type ScenarioChoice } from '@/data/scenarios'
import { cx } from '@/lib/cx'
import type { EngineProps, TacticalPayload } from '@/types/lab'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

interface LogEntry {
  round: number
  label: string
  outcome: string
  suspicion: number
  advantage: number
}

export function TacticalTreeEngine({ config, onComplete }: EngineProps) {
  const payload = config.payload as unknown as TacticalPayload
  const scenario = scenarioById(payload.scenarioId)
  const rounds = scenario.rounds.slice(0, payload.rounds)

  const [roundIndex, setRoundIndex] = useState(0)
  const [suspicion, setSuspicion] = useState(payload.startSuspicion)
  const [advantage, setAdvantage] = useState(payload.startAdvantage)
  const [choice, setChoice] = useState<ScenarioChoice | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [finished, setFinished] = useState(false)
  const doneRef = useRef(false)

  const round = rounds[roundIndex]

  const pick = (option: ScenarioChoice) => {
    if (choice || finished) return
    setChoice(option)
    setSuspicion((current) => clamp(current + option.suspicion, 0, 100))
    setAdvantage((current) => clamp(current + option.advantage, 0, 100))
    setLog((current) => [
      ...current,
      {
        round: roundIndex + 1,
        label: option.label,
        outcome: option.outcome,
        suspicion: option.suspicion,
        advantage: option.advantage,
      },
    ])
  }

  const next = () => {
    if (roundIndex + 1 >= rounds.length) {
      setFinished(true)
      setChoice(null)
      return
    }
    setRoundIndex((index) => index + 1)
    setChoice(null)
  }

  const emit = () => {
    if (doneRef.current) return
    doneRef.current = true
    const won = advantage >= payload.targetAdvantage && suspicion < payload.suspicionLimit
    const ratio = Math.min(1, advantage / Math.max(1, payload.targetAdvantage))
    const safety = Math.max(0, 1 - suspicion / Math.max(1, payload.suspicionLimit))
    const base = ratio * 70 + safety * 20
    const accuracy = won ? Math.min(100, base + 10) : Math.min(78, Math.round(base))

    onComplete({
      accuracy: Math.round(accuracy),
      note: `Suspeita ${Math.round(suspicion)}% · Vantagem ${Math.round(advantage)}% · meta ${payload.targetAdvantage}%`,
    })
  }

  const feedback = payload.feedback
  const progress = ((roundIndex + (choice ? 1 : 0)) / Math.max(1, rounds.length)) * 100

  return (
    <div className="space-y-5">
      <div className="grid gap-4 border border-white/10 bg-coal p-4 sm:grid-cols-2">
        <Meter
          label="Suspeita / Risco"
          value={suspicion}
          tone="hot"
          hint={`Limite operacional: ${payload.suspicionLimit}%`}
        />
        <Meter
          label="Vantagem / Influência"
          value={advantage}
          tone="cold"
          hint={`Meta: ${payload.targetAdvantage}%`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker>
          Turno {String(Math.min(roundIndex + 1, rounds.length)).padStart(2, '0')} /{' '}
          {String(rounds.length).padStart(2, '0')}
        </Kicker>
        <div className="flex items-center gap-2">
          <Tag tone="bone">{scenario.opponent}</Tag>
          {payload.delayedConsequences ? <Tag tone="cold">2ª ordem oculta</Tag> : null}
        </div>
      </div>

      <div className="h-[3px] w-full bg-ash">
        <div className="h-full bg-tc transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>

      {!finished && round ? (
        <>
          <p className="border-l border-tc/50 pl-3 font-condensed text-lg leading-snug text-bone sm:text-xl">
            {round.prompt}
          </p>

          <div className="space-y-2">
            {round.choices.map((option, choiceIndex) => (
              <button
                key={option.label}
                type="button"
                aria-label={`Opção ${choiceIndex + 1}: ${option.label}`}
                disabled={choice !== null}
                onClick={() => pick(option)}
                className={cx(
                  'flex w-full items-start justify-between gap-4 border px-4 py-3 text-left transition-colors',
                  choice === option
                    ? 'border-tc bg-tc/10'
                    : choice
                      ? 'border-white/10 opacity-55'
                      : 'border-white/10 bg-coal hover:border-white/35 hover:bg-ash/60',
                )}
              >
                <span className="text-sm leading-relaxed text-bone">{option.label}</span>
                {feedback === 'full' ? (
                  <span className="shrink-0 font-mono text-[10px] tracking-[0.1em] whitespace-nowrap text-mute">
                    <span className="text-cold">+{option.advantage}</span>
                    {' / '}
                    <span className="text-hot">+{option.suspicion}</span>
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {choice && !finished ? (
        <div className="animate-rise border border-white/15 bg-ash/40 p-4">
          <Kicker>Resultado do turno</Kicker>
          <p className="mt-2 text-sm leading-relaxed text-bone">
            {feedback === 'hidden'
              ? 'O ambiente responde, mas o impacto não está instrumentado neste nível. Leia apenas os medidores.'
              : choice.outcome}
          </p>
          {feedback === 'full' ? (
            <p className="mt-2 font-mono text-[10px] tracking-[0.14em] text-mute uppercase">
              Vantagem <span className="text-cold">+{choice.advantage}</span> · Suspeita{' '}
              <span className="text-hot">+{choice.suspicion}</span>
            </p>
          ) : null}
          <Button className="mt-3 w-full sm:w-auto" onClick={next}>
            {roundIndex + 1 >= rounds.length ? 'Encerrar série' : 'Próximo turno'}
          </Button>
        </div>
      ) : null}

      {finished ? (
        <div className="animate-slam space-y-4 border border-white/15 bg-coal p-5">
          <div>
            <Kicker>Fim da simulação</Kicker>
            <p className="mt-1 font-condensed text-2xl tracking-[0.04em] text-bone uppercase">
              {advantage >= payload.targetAdvantage && suspicion < payload.suspicionLimit
                ? 'Objetivo atingido'
                : 'Objetivo não atingido'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Meter label="Suspeita final" value={suspicion} tone="hot" />
            <Meter label="Vantagem final" value={advantage} tone="cold" hint={`Meta ${payload.targetAdvantage}%`} />
          </div>
          <div className="space-y-2">
            {log.map((entry) => (
              <div key={`${entry.round}-${entry.label}`} className="border-l border-white/15 pl-3">
                <p className="font-mono text-[9px] tracking-[0.18em] text-mute uppercase">Turno {entry.round}</p>
                <p className="text-xs leading-relaxed text-bone/85">{entry.label}</p>
                <p className="text-xs leading-relaxed text-mute">{entry.outcome}</p>
              </div>
            ))}
          </div>
          <Button className="w-full" onClick={emit}>
            Registrar resultado
          </Button>
        </div>
      ) : null}
    </div>
  )
}
