import { ATTRIBUTES, attributeByKey } from '@/data/attributes'
import { exercisesForAttr } from '@/data/exercises'
import { averageAccuracy, averageScore, rankFor, strengthsAndWeaknesses } from '@/lib/scoring'
import { cx } from '@/lib/cx'
import { Bar, Button, Kicker, Panel, SectionTitle, Stat, Tag } from '@/components/ui/Primitives'
import { Radar } from '@/components/ui/Radar'
import type { AttrKey, Difficulty, Exercise, GuidedStep, LabProgress } from '@/types/lab'

interface DashboardProps {
  progress: LabProgress
  onStart: (exercise: Exercise, difficulty: Difficulty) => void
  onStartGuided: (steps: GuidedStep[]) => void
  onOpenAttribute: (attr: AttrKey) => void
}

function dateLabel(timestamp: number | null): string {
  if (!timestamp) return 'sem registro'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(timestamp))
}

export function Dashboard({ progress, onStartGuided, onOpenAttribute }: DashboardProps) {
  const overall = averageScore(progress.scores)
  const rank = rankFor(overall)
  const { strengths, weaknesses } = strengthsAndWeaknesses(progress.scores)
  const sessions = progress.sessions
  const accuracy = averageAccuracy(sessions)
  const lastSession = sessions[0]?.timestamp ?? null
  const totalTime = Math.round(sessions.reduce((sum, session) => sum + session.timeSpentSec, 0) / 60)
  const nextRank = rank.key === 'genius' ? null : rank.max + 1

  const protocol: GuidedStep[] = weaknesses.map(([key, score], index) => {
    const pool = exercisesForAttr(key)
    const exercise = pool[(sessions.length + index) % pool.length]
    const difficulty: Difficulty = score < 62 ? 'easy' : 'medium'
    return { exerciseId: exercise.id, difficulty }
  })

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <Panel className="p-5">
          <SectionTitle index="01" aside={<Tag>Escala 40–100</Tag>}>
            Diagnóstico
          </SectionTitle>
          <div className="mt-4">
            <Radar scores={progress.scores} />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] tracking-[0.14em] text-mute uppercase">
            <span className="flex items-center gap-2">
              <span className="h-[2px] w-6 bg-tc" /> Estado atual
            </span>
            <span className="flex items-center gap-2">
              <span className="h-[2px] w-6 border-t border-dashed border-bone/60" /> Base 50
            </span>
          </div>
        </Panel>

        <div className="grid gap-4">
          <Panel className="flex flex-col justify-between p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Kicker>Overall rating</Kicker>
                <p className="mt-1 font-display text-[64px] leading-none tracking-tight text-tc tabular-nums">
                  {overall.toFixed(1)}
                </p>
              </div>
              <div className="text-right">
                <Kicker>Patente</Kicker>
                <p className="mt-1 font-condensed text-xl leading-tight font-semibold tracking-[0.08em] text-bone uppercase">
                  {rank.label}
                </p>
                <Tag className="mt-1">{rank.code}</Tag>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-1 flex justify-between font-mono text-[10px] tracking-[0.14em] text-mute uppercase">
                <span>{rank.label}</span>
                <span>{nextRank ? `próxima: ${nextRank}.0` : 'topo da escala'}</span>
              </div>
              <Bar value={overall} />
              <p className="mt-2 text-xs leading-relaxed text-mute">{rank.description}</p>
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">
              <Stat label="Sessões" value={sessions.length} hint="exercícios concluídos" />
              <Stat label="Precisão média" value={accuracy.toFixed(1)} unit="%" accent="cold" />
              <Stat label="Sequência" value={progress.streak} unit="dias" accent="tc" hint="streak atual" />
              <Stat
                label="Tempo total"
                value={totalTime}
                unit="min"
                hint={`última: ${dateLabel(lastSession)}`}
              />
            </div>
          </Panel>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <SectionTitle index="02">Forças e lacunas</SectionTitle>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <Kicker className="text-cold">Top 3 · forças</Kicker>
              <ul className="mt-3 space-y-3">
                {strengths.map(([key, score]) => {
                  const meta = attributeByKey(key)
                  return (
                    <li key={key}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-condensed text-sm tracking-[0.06em] text-bone uppercase">
                          {meta.code} · {meta.name}
                        </span>
                        <span className="font-mono text-xs text-cold tabular-nums">{score.toFixed(1)}</span>
                      </div>
                      <Bar value={score} tone="cold" className="mt-1" />
                    </li>
                  )
                })}
              </ul>
            </div>
            <div>
              <Kicker className="text-hot">Bottom 3 · lacunas</Kicker>
              <ul className="mt-3 space-y-3">
                {weaknesses.map(([key, score]) => {
                  const meta = attributeByKey(key)
                  return (
                    <li key={key}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-condensed text-sm tracking-[0.06em] text-bone uppercase">
                          {meta.code} · {meta.name}
                        </span>
                        <span className="font-mono text-xs text-hot tabular-nums">{score.toFixed(1)}</span>
                      </div>
                      <Bar value={score} tone="hot" className="mt-1" />
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </Panel>

        <Panel className="flex flex-col p-5">
          <SectionTitle index="03" aside={<Tag tone="tc">Protocolo diário</Tag>}>
            Sessão recomendada
          </SectionTitle>
          <p className="mt-3 text-sm leading-relaxed text-mute">
            Sequência automática montada sobre os seus três atributos mais fracos.
          </p>

          <ol className="mt-4 flex-1 space-y-2">
            {protocol.map((step, index) => {
              const exercise = exercisesForAttr(
                weaknesses[index][0],
              ).find((item) => item.id === step.exerciseId)
              if (!exercise) return null
              const meta = attributeByKey(exercise.attr)
              const difficultyLabel = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }[step.difficulty]

              return (
                <li
                  key={step.exerciseId}
                  className="flex items-center gap-3 border border-white/10 bg-ash/20 px-3 py-2.5"
                >
                  <span className="font-mono text-lg text-tc tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-condensed text-sm font-semibold tracking-[0.05em] text-bone uppercase">
                      {exercise.title}
                    </p>
                    <p className="font-mono text-[10px] tracking-[0.12em] text-mute uppercase">
                      {meta.code} · {meta.name} · {difficultyLabel}
                    </p>
                  </div>
                  <Tag tone="mute">{meta.code}</Tag>
                </li>
              )
            })}
          </ol>

          <Button className="mt-5 w-full" onClick={() => onStartGuided(protocol)}>
            Iniciar sessão guiada
          </Button>
        </Panel>
      </section>

      <Panel className="p-5">
        <SectionTitle index="04" aside={<Kicker>Nota exibida · 1 casa decimal</Kicker>}>
          Todos os atributos
        </SectionTitle>
        <div className="mt-3 divide-y divide-white/[0.06]">
          {ATTRIBUTES.map((meta) => {
            const score = progress.scores[meta.key]
            const attrRank = rankFor(score)
            return (
              <button
                key={meta.key}
                type="button"
                onClick={() => onOpenAttribute(meta.key)}
                className={cx(
                  'grid w-full grid-cols-[44px_minmax(0,1fr)_40px] items-center gap-3 py-2.5 text-left transition-colors hover:bg-ash/40 sm:grid-cols-[52px_minmax(0,1.4fr)_minmax(0,1fr)_110px_60px]',
                )}
              >
                <span className="font-mono text-[10px] tracking-[0.14em] text-mute">{meta.code}</span>
                <span className="font-condensed text-sm font-semibold tracking-[0.06em] text-bone uppercase">
                  {meta.name}
                  <span className="ml-2 hidden font-sans text-[11px] font-normal tracking-normal text-mute normal-case sm:inline">
                    {meta.domain}
                  </span>
                </span>
                <span className="hidden sm:block">
                  <Bar value={score} />
                </span>
                <span className="hidden font-mono text-[10px] tracking-[0.12em] text-mute uppercase sm:block">
                  {attrRank.label}
                </span>
                <span className="text-right font-mono text-sm text-bone tabular-nums sm:hidden">
                  {Math.round(score)}
                </span>
                <span className="hidden text-right font-mono text-sm text-bone tabular-nums sm:block">
                  {Math.round(score)}
                </span>
              </button>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
