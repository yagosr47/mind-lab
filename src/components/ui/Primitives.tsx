import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '@/lib/cx'

/* Painel base: superfície coal, borda seca e canto chanfrado. */
export function Panel({
  children,
  className,
  chamfer = true,
}: {
  children: ReactNode
  className?: string
  chamfer?: boolean
}) {
  return (
    <div
      className={cx(
        'relative bg-coal hairline',
        chamfer && 'chamfer',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'font-mono text-[10px] tracking-[0.22em] text-mute uppercase',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function SectionTitle({
  index,
  children,
  aside,
}: {
  index?: string
  children: ReactNode
  aside?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-b border-white/10 pb-3">
      <h2 className="min-w-0 font-condensed text-2xl font-semibold tracking-[0.06em] text-bone uppercase sm:text-3xl">
        {index ? <span className="mr-3 font-mono text-xs text-tc">{index}</span> : null}
        {children}
      </h2>
      {aside ? <div className="shrink-0 text-right">{aside}</div> : null}
    </div>
  )
}

export function Bar({
  value,
  min = 40,
  max = 100,
  tone = 'tc',
  className,
}: {
  value: number
  min?: number
  max?: number
  tone?: 'tc' | 'hot' | 'cold' | 'bone'
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  const fill = {
    tc: 'bg-tc',
    hot: 'bg-hot',
    cold: 'bg-cold',
    bone: 'bg-bone',
  }[tone]

  return (
    <div className={cx('relative h-[6px] w-full overflow-hidden bg-ash', className)}>
      <div
        className={cx('h-full transition-[width] duration-700 ease-out', fill)}
        style={{ width: `${pct}%` }}
      />
      <div className="absolute inset-0 grid grid-cols-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} className="border-r border-ink/70" />
        ))}
      </div>
    </div>
  )
}

export function Meter({
  label,
  value,
  tone,
  hint,
}: {
  label: string
  value: number
  tone: 'hot' | 'cold' | 'tc'
  hint?: string
}) {
  const color = { hot: 'text-hot', cold: 'text-cold', tc: 'text-tc' }[tone]
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <Kicker>{label}</Kicker>
        <span className={cx('font-mono text-sm tabular-nums', color)}>{Math.round(value)}%</span>
      </div>
      <Bar value={value} min={0} max={100} tone={tone} />
      {hint ? <p className="mt-1 font-mono text-[10px] text-mute">{hint}</p> : null}
    </div>
  )
}

export function Tag({
  children,
  tone = 'mute',
  className,
}: {
  children: ReactNode
  tone?: 'mute' | 'tc' | 'hot' | 'cold' | 'bone'
  className?: string
}) {
  const styles = {
    mute: 'border-white/15 text-mute',
    tc: 'border-tc/40 text-tc',
    hot: 'border-hot/40 text-hot',
    cold: 'border-cold/40 text-cold',
    bone: 'border-white/25 text-bone',
  }[tone]
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.16em] uppercase',
        styles,
        className,
      )}
    >
      {children}
    </span>
  )
}

type ButtonTone = 'primary' | 'ghost' | 'hot' | 'cold'

const BUTTON_TONES: Record<ButtonTone, string> = {
  primary: 'bg-tc text-ink hover:bg-[#f0ff7a] active:translate-y-px',
  ghost: 'border border-white/15 text-bone hover:border-white/35 hover:bg-ash',
  hot: 'border border-hot/45 text-hot hover:bg-hot/10',
  cold: 'border border-cold/45 text-cold hover:bg-cold/10',
}

export function Button({
  children,
  tone = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 font-condensed text-sm font-semibold tracking-[0.14em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        BUTTON_TONES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Stat({
  label,
  value,
  unit,
  hint,
  accent = 'bone',
}: {
  label: string
  value: string | number
  unit?: string
  hint?: string
  accent?: 'bone' | 'tc' | 'cold' | 'hot'
}) {
  const color = { bone: 'text-bone', tc: 'text-tc', cold: 'text-cold', hot: 'text-hot' }[accent]
  return (
    <div className="border-l border-white/10 pl-3">
      <Kicker>{label}</Kicker>
      <div className={cx('mt-1 font-mono text-2xl leading-none tabular-nums', color)}>
        {value}
        {unit ? <span className="ml-1 text-xs text-mute">{unit}</span> : null}
      </div>
      {hint ? <p className="mt-1 font-mono text-[10px] text-mute">{hint}</p> : null}
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-dashed border-white/15 px-6 py-12 text-center">
      <p className="font-condensed text-lg tracking-[0.08em] text-bone uppercase">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-mute">{description}</p>
    </div>
  )
}
