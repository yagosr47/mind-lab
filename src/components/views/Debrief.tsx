import { attributeByKey } from '@/data/attributes'
import { Bar, Button, Kicker, Panel, Stat, Tag } from '@/components/ui/Primitives'
import { formatDelta, rankFor } from '@/lib/scoring'
import { cx } from '@/lib/cx'
import type { Difficulty, EngineType, Exercise } from '@/types/lab'

const APPLICATION: Record<EngineType, string> = {
  'stroop-reaction':
    'Em campo: quando a resposta é automática, imponha um segundo de atraso deliberado. O impulso chega antes, mas não precisa sair primeiro.',
  'memory-matrix':
    'Em campo: agrupe informação em blocos significativos. Quatro itens soltos não cabem na memória; duas duplas cabem.',
  'rule-shift':
    'Em campo: quando um padrão para de funcionar, formule a alternativa antes de repetir a tentativa. Perseverança cega custa mais caro que o erro.',
  'statement-audit':
    'Em campo: procure o detalhe verificável, não o tom. Emoção é interpretável; horário, objeto e assinatura não são.',
  'tactical-tree':
    'Em campo: antes de agir, nomeie a reação provável do outro. A decisão que ignora a resposta alheia é só uma aposta.',
}

interface DebriefProps {
  exercise: Exercise
  difficulty: Difficulty
  accuracy: number
  timeSpentSec: number
  delta: number
  before: number
  after: number
  note?: string
  guided: { index: number; total: number } | null
  onNext: () => void
  onRepeat: () => void
  onExit: () => void
}

export function Debrief({
  exercise,
  difficulty,
  accuracy,
  timeSpentSec,
  delta,
  before,
  after,
  note,
  guided,
  onNext,
  onRepeat,
  onExit,
}: DebriefProps) {
  const meta = attributeByKey(exercise.attr)
  const rank = rankFor(after)
  const displayDelta = formatDelta(delta)
  const tone = delta > 0 ? 'text-tc' : delta < 0 ? 'text-hot' : 'text-mute'
  const seconds = Math.round(timeSpentSec)

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Panel className="animate-slam p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Kicker className="text-tc">Debriefing · sessão registrada</Kicker>
          <div className="flex items-center gap-2">
            <Tag tone="tc">{meta.code}</Tag>
            <Tag>{exercise.difficulties[difficulty].label}</Tag>
            {guided ? (
              <Tag tone="cold">
                guiado {guided.index + 1}/{guided.total}
              </Tag>
            ) : null}
          </div>
        </div>

        <h1 className="mt-3 font-display text-[clamp(1.6rem,4.6vw,2.4rem)] leading-[1.05] tracking-tight text-bone uppercase">
          {exercise.title}
        </h1>
        <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-mute uppercase">
          {meta.name} · {meta.domain}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="border border-white/10 bg-ash/20 p-4">
            <Kicker>Precisão</Kicker>
            <p className="mt-1 font-mono text-4xl leading-none text-bone tabular-nums">
              {Math.round(accuracy)}
              <span className="text-base text-mute">%</span>
            </p>
            <Bar
              value={accuracy}
              min={0}
              max={100}
              tone={accuracy >= 70 ? 'tc' : accuracy >= 50 ? 'cold' : 'hot'}
              className="mt-3"
            />
          </div>
          <div className="border border-white/10 bg-ash/20 p-4">
            <Kicker>Tempo gasto</Kicker>
            <p className="mt-1 font-mono text-4xl leading-none text-bone tabular-nums">
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
            </p>
            <p className="mt-3 font-mono text-[10px] text-mute">{note ?? 'sessão concluída'}</p>
          </div>
          <div className="border border-white/10 bg-ash/20 p-4">
            <Kicker>Ganho em {meta.code}</Kicker>
            <p className={cx('mt-1 font-mono text-4xl leading-none tabular-nums', tone)}>{displayDelta}</p>
            <p className="mt-3 font-mono text-[10px] text-mute">
              {before.toFixed(1)} → <span className="text-bone">{after.toFixed(1)}</span> · {rank.label}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between font-mono text-[9px] tracking-[0.16em] text-mute uppercase">
            <span>Nota do atributo</span>
            <span>{after.toFixed(1)} / 100</span>
          </div>
          <Bar value={after} className="mt-1 h-2" />
        </div>

        {accuracy < 50 ? (
          <p className="mt-4 border border-hot/30 bg-hot/5 px-3 py-2 font-mono text-[10px] leading-relaxed tracking-[0.1em] text-hot uppercase">
            Precisão abaixo de 50% · sem ganho de nota
            {difficulty === 'hard' ? ' · penalidade de -0,3 aplicada (piso 40)' : ''}
          </p>
        ) : null}
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel className="p-5">
          <Kicker className="text-cold">Análise cognitiva</Kicker>
          <p className="mt-3 text-sm leading-relaxed text-bone/90">{exercise.cognitivePrinciple}</p>
        </Panel>
        <Panel className="p-5">
          <Kicker className="text-tc">Aplicação prática</Kicker>
          <p className="mt-3 text-sm leading-relaxed text-bone/90">{APPLICATION[exercise.engine]}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="Patente" value={rank.label} />
            <Stat
              label={guided ? 'Sequência' : 'Nível'}
              value={guided ? `${guided.index + 1}/${guided.total}` : exercise.difficulties[difficulty].label}
            />
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {guided ? (
          <Button className="flex-1" onClick={onNext}>
            {guided.index + 1 >= guided.total ? 'Concluir sessão guiada' : 'Próximo exercício'}
          </Button>
        ) : (
          <Button className="flex-1" onClick={onRepeat}>
            Treinar novamente
          </Button>
        )}
        <Button tone="ghost" onClick={onExit}>
          Voltar
        </Button>
      </div>
    </div>
  )
}
