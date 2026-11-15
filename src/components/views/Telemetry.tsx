import { useRef, useState } from 'react'
import { ATTRIBUTES, attributeByKey } from '@/data/attributes'
import { exerciseById } from '@/data/exercises'
import { Bar, Button, EmptyState, Kicker, Panel, SectionTitle, Stat, Tag } from '@/components/ui/Primitives'
import { averageAccuracy, formatDelta } from '@/lib/scoring'
import { dayKey, exportProgress, parseProgress } from '@/lib/storage'
import { cx } from '@/lib/cx'
import type { AttrKey, LabProgress } from '@/types/lab'

interface TelemetryProps {
  progress: LabProgress
  onImport: (progress: LabProgress) => void
  onReset: () => void
}

const DIFFICULTY_LABEL = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' } as const

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export function Telemetry({ progress, onImport, onReset }: TelemetryProps) {
  const [filter, setFilter] = useState<'all' | AttrKey>('all')
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const sessions = progress.sessions
  const visible = filter === 'all' ? sessions : sessions.filter((session) => session.attr === filter)
  const totalMinutes = Math.round(sessions.reduce((sum, session) => sum + session.timeSpentSec, 0) / 60)

  const download = () => {
    const blob = new Blob([exportProgress(progress)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `mindlab-progresso-${dayKey()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage({ tone: 'ok', text: 'Progresso exportado em JSON.' })
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const text = await file.text()
      const imported = parseProgress(text)
      onImport(imported)
      setMessage({ tone: 'ok', text: `Progresso importado · ${imported.sessions.length} sessões.` })
    } catch (error) {
      setMessage({
        tone: 'bad',
        text: error instanceof Error ? error.message : 'Não foi possível importar o arquivo.',
      })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <Panel className="p-5">
        <SectionTitle
          index="03"
          aside={
            <Kicker>
              {sessions.length} registro{sessions.length === 1 ? '' : 's'} local
              {sessions.length === 1 ? '' : 'is'}
            </Kicker>
          }
        >
          Histórico e telemetria
        </SectionTitle>

        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4">
          <Stat label="Sessões" value={sessions.length} hint="total acumulado" />
          <Stat label="Precisão média" value={averageAccuracy(sessions).toFixed(1)} unit="%" accent="cold" />
          <Stat label="Tempo treinado" value={totalMinutes} unit="min" />
          <Stat label="Sequência" value={progress.streak} unit="dias" accent="tc" />
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Kicker>Sessões realizadas</Kicker>
            <p className="mt-1 font-condensed text-lg tracking-[0.05em] text-bone uppercase">
              {visible.length} de {sessions.length}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="block">
              <span className="sr-only">Filtrar por atributo</span>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as 'all' | AttrKey)}
                className="border border-white/15 bg-ink px-3 py-2 font-mono text-[10px] tracking-[0.12em] text-bone uppercase focus:border-tc focus:outline-none"
              >
                <option value="all" className="bg-ink">
                  Todos os atributos
                </option>
                {ATTRIBUTES.map((meta) => (
                  <option key={meta.key} value={meta.key} className="bg-ink">
                    {meta.code} · {meta.name}
                  </option>
                ))}
              </select>
            </label>
            <Button tone="ghost" className="px-3 py-2 text-xs" onClick={download}>
              Exportar JSON
            </Button>
            <Button tone="ghost" className="px-3 py-2 text-xs" onClick={() => fileRef.current?.click()}>
              Importar
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
          </div>
        </div>

        {message ? (
          <p
            className={cx(
              'mt-3 border px-3 py-2 font-mono text-[10px] tracking-[0.1em] uppercase',
              message.tone === 'ok' ? 'border-tc/40 bg-tc/5 text-tc' : 'border-hot/40 bg-hot/5 text-hot',
            )}
          >
            {message.text}
          </p>
        ) : null}

        <div className="mt-4">
          {visible.length === 0 ? (
            <EmptyState
              title="Nenhuma sessão registrada"
              description="Conclua um exercício no catálogo para começar a construir sua telemetria. Tudo fica salvo no navegador."
            />
          ) : (
            <div>
              <div className="hidden grid-cols-[92px_minmax(0,1.6fr)_minmax(0,1.4fr)_72px_80px_72px_64px] gap-2 border-b border-white/10 pb-2 font-mono text-[9px] tracking-[0.16em] text-mute uppercase sm:grid">
                <span>Data</span>
                <span>Atributo</span>
                <span>Exercício</span>
                <span>Nível</span>
                <span>Precisão</span>
                <span>Ganho</span>
                <span>Tempo</span>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {visible.map((session) => {
                  const meta = attributeByKey(session.attr)
                  const exercise = exerciseById(session.exerciseId)
                  return (
                    <div
                      key={session.id}
                      className="grid grid-cols-2 gap-2 py-3 sm:grid-cols-[92px_minmax(0,1.6fr)_minmax(0,1.4fr)_72px_80px_72px_64px] sm:items-center"
                    >
                      <span className="font-mono text-[10px] text-mute tabular-nums">
                        {formatDate(session.timestamp)}
                      </span>
                      <span className="font-condensed text-sm tracking-[0.04em] text-bone uppercase">
                        {meta.code} · {meta.name}
                      </span>
                      <span className="col-span-2 truncate text-xs text-mute sm:col-span-1">
                        {exercise?.title ?? session.exerciseId}
                      </span>
                      <Tag tone={session.difficulty === 'hard' ? 'hot' : session.difficulty === 'easy' ? 'cold' : 'tc'}>
                        {DIFFICULTY_LABEL[session.difficulty]}
                      </Tag>
                      <span className="flex items-center gap-2 font-mono text-xs text-bone tabular-nums">
                        {session.accuracy.toFixed(0)}%
                        <span className="hidden w-10 sm:block">
                          <Bar
                            value={session.accuracy}
                            min={0}
                            max={100}
                            tone={session.accuracy >= 70 ? 'tc' : session.accuracy >= 50 ? 'cold' : 'hot'}
                            className="h-1"
                          />
                        </span>
                      </span>
                      <span
                        className={cx(
                          'font-mono text-xs tabular-nums',
                          session.scoreDelta > 0
                            ? 'text-tc'
                            : session.scoreDelta < 0
                              ? 'text-hot'
                              : 'text-mute',
                        )}
                      >
                        {formatDelta(session.scoreDelta)}
                      </span>
                      <span className="font-mono text-[10px] text-mute tabular-nums">
                        {session.timeSpentSec}s
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-lg">
            <Kicker className="text-hot">Zona de risco</Kicker>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              Resetar apaga notas, histórico e sequência deste navegador. Exporte o JSON antes se
              quiser preservar o progresso.
            </p>
          </div>

          {confirming ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.12em] text-hot uppercase">Confirmar reset?</span>
              <Button
                tone="hot"
                onClick={() => {
                  onReset()
                  setConfirming(false)
                  setMessage({ tone: 'ok', text: 'Progresso resetado. Todos os atributos voltaram a 50.0.' })
                }}
              >
                Apagar tudo
              </Button>
              <Button tone="ghost" onClick={() => setConfirming(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button tone="hot" onClick={() => setConfirming(true)}>
              Resetar progresso
            </Button>
          )}
        </div>
      </Panel>
    </div>
  )
}
