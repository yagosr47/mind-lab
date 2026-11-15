import { useState } from 'react'
import { ATTRIBUTES, attributeByKey } from '@/data/attributes'
import { ENGINE_LABEL, exercisesForAttr } from '@/data/exercises'
import { Bar, Button, EmptyState, Kicker, Panel, SectionTitle, Tag } from '@/components/ui/Primitives'
import { DIFFICULTIES, RANKS, rankFor } from '@/lib/scoring'
import { cx } from '@/lib/cx'
import type { AttrKey, Difficulty, EngineType, Exercise, LabProgress } from '@/types/lab'

interface CatalogProps {
  progress: LabProgress
  initialAttr: AttrKey | null
  onStart: (exercise: Exercise, difficulty: Difficulty) => void
}

const ENGINE_OPTIONS: { value: 'all' | EngineType; label: string }[] = [
  { value: 'all', label: 'Todos os motores' },
  { value: 'stroop-reaction', label: 'Reação' },
  { value: 'memory-matrix', label: 'Memória' },
  { value: 'rule-shift', label: 'Regra oculta' },
  { value: 'statement-audit', label: 'Auditoria' },
  { value: 'tactical-tree', label: 'Tático' },
]

const DIFFICULTY_TONE: Record<Difficulty, 'tc' | 'cold' | 'hot'> = {
  easy: 'cold',
  medium: 'tc',
  hard: 'hot',
}

export function Catalog({ progress, initialAttr, onStart }: CatalogProps) {
  const [query, setQuery] = useState('')
  const [engine, setEngine] = useState<'all' | EngineType>('all')
  const [rankKey, setRankKey] = useState<string>('all')
  const [selected, setSelected] = useState<AttrKey | null>(initialAttr)
  const [levels, setLevels] = useState<Record<string, Difficulty>>({})

  const filtered = ATTRIBUTES.filter((meta) => {
    const score = progress.scores[meta.key]
    if (rankKey !== 'all' && rankFor(score).key !== rankKey) return false
    const exercises = exercisesForAttr(meta.key)
    if (engine !== 'all' && !exercises.some((exercise) => exercise.engine === engine)) return false
    if (query.trim().length > 0) {
      const term = query.trim().toLowerCase()
      return (
        meta.name.toLowerCase().includes(term) ||
        meta.domain.toLowerCase().includes(term) ||
        meta.code.toLowerCase().includes(term) ||
        exercises.some((exercise) => exercise.title.toLowerCase().includes(term))
      )
    }
    return true
  })

  const selectedMeta = selected ? attributeByKey(selected) : null
  const selectedExercises = selected ? exercisesForAttr(selected) : []
  const selectedScore = selected ? progress.scores[selected] : 0

  return (
    <div className="space-y-6">
      <Panel className="p-5">
        <SectionTitle
          index="02"
          aside={
            <Kicker>
              {filtered.length}/{ATTRIBUTES.length} atributos
            </Kicker>
          }
        >
          Treinar atributos
        </SectionTitle>

        <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_190px_190px]">
          <label className="relative block">
            <span className="sr-only">Buscar atributo ou exercício</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="BUSCAR ATRIBUTO, MOTOR OU EXERCÍCIO…"
              className="w-full border border-white/15 bg-ink px-3 py-2.5 font-mono text-[11px] tracking-[0.1em] text-bone uppercase placeholder:text-mute/70 focus:border-tc focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="sr-only">Filtrar por motor</span>
            <select
              value={engine}
              onChange={(event) => setEngine(event.target.value as 'all' | EngineType)}
              className="w-full appearance-none border border-white/15 bg-ink px-3 py-2.5 font-mono text-[11px] tracking-[0.1em] text-bone uppercase focus:border-tc focus:outline-none"
            >
              {ENGINE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-ink">
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Filtrar por patente</span>
            <select
              value={rankKey}
              onChange={(event) => setRankKey(event.target.value)}
              className="w-full appearance-none border border-white/15 bg-ink px-3 py-2.5 font-mono text-[11px] tracking-[0.1em] text-bone uppercase focus:border-tc focus:outline-none"
            >
              <option value="all" className="bg-ink">
                Todas as patentes
              </option>
              {RANKS.map((rank) => (
                <option key={rank.key} value={rank.key} className="bg-ink">
                  {rank.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum atributo encontrado"
          description="Ajuste a busca ou limpe os filtros para ver os 14 atributos do sistema."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((meta) => {
            const score = progress.scores[meta.key]
            const rank = rankFor(score)
            const exercises = exercisesForAttr(meta.key)

            return (
              <button
                key={meta.key}
                type="button"
                onClick={() => setSelected(meta.key)}
                className="group relative flex flex-col justify-between border border-white/10 bg-coal p-4 text-left transition-colors hover:border-tc/50 hover:bg-ash/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Kicker className="text-tc">{meta.code}</Kicker>
                    <Tag>{rank.label}</Tag>
                  </div>
                  <h3 className="mt-2 font-condensed text-lg leading-tight font-semibold tracking-[0.05em] text-bone uppercase">
                    {meta.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-[10px] tracking-[0.1em] text-mute uppercase">{meta.domain}</p>
                </div>

                <div className="mt-4">
                  <div className="flex items-end justify-between">
                    <span className="font-mono text-3xl leading-none text-bone tabular-nums">
                      {Math.round(score)}
                    </span>
                    <span className="font-mono text-[10px] text-mute">{score.toFixed(1)} / 100</span>
                  </div>
                  <Bar value={score} className="mt-2" />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-1">
                      {exercises.map((exercise) => (
                        <span
                          key={exercise.id}
                          title={`${exercise.title} · ${ENGINE_LABEL[exercise.engine]}`}
                          className="h-1 w-5 bg-white/20 transition-colors group-hover:bg-tc/60"
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[9px] tracking-[0.16em] text-mute uppercase">
                      3 exercícios →
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selectedMeta ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Fechar painel"
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-ink/85 backdrop-blur-[2px]"
          />
          <aside className="animate-rise relative h-full w-full max-w-lg overflow-y-auto border-l border-white/15 bg-coal">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-coal/95 px-5 py-4 backdrop-blur">
              <div>
                <Kicker className="text-tc">{selectedMeta.code} · ficha detalhada</Kicker>
                <h2 className="mt-1 font-display text-xl tracking-tight text-bone">{selectedMeta.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="border border-white/15 px-2.5 py-1 font-mono text-[10px] text-mute hover:border-white/40 hover:text-bone"
              >
                FECHAR ✕
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="text-sm leading-relaxed text-mute">{selectedMeta.summary}</p>
                <div className="mt-4 flex items-end justify-between">
                  <p className="font-mono text-4xl leading-none text-bone tabular-nums">
                    {selectedScore.toFixed(1)}
                  </p>
                  <div className="text-right">
                    <Tag tone="tc">{rankFor(selectedScore).label}</Tag>
                    <p className="mt-1 font-mono text-[9px] tracking-[0.14em] text-mute uppercase">
                      escala 40–100
                    </p>
                  </div>
                </div>
                <Bar value={selectedScore} className="mt-3 h-2" />
              </div>

              <div className="border border-white/10 bg-ash/20 p-3">
                <Kicker>Benchmark comparativo</Kicker>
                <ul className="mt-2 space-y-1.5">
                  {selectedMeta.benchmarks.map((anchor) => {
                    const reached = selectedScore >= anchor.score
                    return (
                      <li key={anchor.label} className="flex items-baseline gap-3">
                        <span
                          className={cx(
                            'w-7 shrink-0 font-mono text-[11px] tabular-nums',
                            reached ? 'text-tc' : 'text-mute',
                          )}
                        >
                          {anchor.score}
                        </span>
                        <span className="h-px flex-1 bg-white/10" />
                        <span
                          className={cx(
                            'text-right font-condensed text-xs tracking-[0.04em] uppercase',
                            reached ? 'text-bone' : 'text-mute',
                          )}
                        >
                          {anchor.label}
                        </span>
                      </li>
                    )
                  })}
                </ul>
                <p className="mt-2 font-mono text-[9px] text-mute">
                  Você está em {selectedScore.toFixed(1)} —{' '}
                  {selectedMeta.benchmarks.filter((anchor) => selectedScore >= anchor.score).length} de{' '}
                  {selectedMeta.benchmarks.length} referências atingidas.
                </p>
              </div>

              <div className="space-y-3">
                <Kicker>Exercícios do atributo</Kicker>
                {selectedExercises.map((exercise) => {
                  const level = levels[exercise.id] ?? 'medium'
                  return (
                    <div key={exercise.id} className="border border-white/10 bg-ink/60 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-condensed text-base leading-tight font-semibold tracking-[0.05em] text-bone uppercase">
                            {exercise.title}
                          </h4>
                          <p className="font-mono text-[9px] tracking-[0.14em] text-mute uppercase">
                            {exercise.subtitle} · {ENGINE_LABEL[exercise.engine]}
                          </p>
                        </div>
                        <Tag tone="cold">{exercise.difficulties[level].xpReward} XP</Tag>
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-mute">
                        {exercise.difficulties[level].description}
                      </p>

                      <div className="mt-3 grid grid-cols-3 gap-1">
                        {DIFFICULTIES.map((difficulty) => (
                          <button
                            key={difficulty}
                            type="button"
                            onClick={() => setLevels((current) => ({ ...current, [exercise.id]: difficulty }))}
                            className={cx(
                              'border px-2 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors',
                              level === difficulty
                                ? DIFFICULTY_TONE[difficulty] === 'hot'
                                  ? 'border-hot bg-hot/15 text-hot'
                                  : DIFFICULTY_TONE[difficulty] === 'cold'
                                    ? 'border-cold bg-cold/15 text-cold'
                                    : 'border-tc bg-tc/15 text-tc'
                                : 'border-white/12 text-mute hover:border-white/30 hover:text-bone',
                            )}
                          >
                            {exercise.difficulties[difficulty].label}
                          </button>
                        ))}
                      </div>

                      <Button className="mt-2 w-full" onClick={() => onStart(exercise, level)}>
                        Iniciar treino
                      </Button>
                    </div>
                  )
                })}
              </div>

              <p className="border-t border-white/10 pt-3 text-[11px] leading-relaxed text-mute">
                {selectedMeta.benchmarks[selectedMeta.benchmarks.length - 1].label} é a referência
                máxima deste atributo. A progressão aplica retorno decrescente: quanto maior a nota,
                menor o ganho por sessão.
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
