import { ATTRIBUTES } from '@/data/attributes'
import type { AttrKey } from '@/types/lab'

const SIZE = 360
const CENTER = SIZE / 2
const RADIUS = 122
const MIN = 40
const MAX = 100
const RINGS = [40, 55, 70, 85, 100]

function pointFor(value: number, index: number, total: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total
  const ratio = Math.max(0, Math.min(1, (value - MIN) / (MAX - MIN)))
  return {
    x: CENTER + Math.cos(angle) * RADIUS * ratio,
    y: CENTER + Math.sin(angle) * RADIUS * ratio,
  }
}

function polygon(values: number[]) {
  return values
    .map((value, index) => {
      const point = pointFor(value, index, values.length)
      return `${point.x.toFixed(1)},${point.y.toFixed(1)}`
    })
    .join(' ')
}

export function Radar({ scores }: { scores: Record<AttrKey, number> }) {
  const values = ATTRIBUTES.map((attribute) => scores[attribute.key])
  const total = ATTRIBUTES.length

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto h-auto w-full max-w-[420px]"
      role="img"
      aria-label="Radar dos 14 atributos mentais"
    >
      {RINGS.map((ring) => (
        <polygon
          key={ring}
          points={polygon(ATTRIBUTES.map(() => ring))}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={ring === 40 ? 1.4 : 0.8}
        />
      ))}

      {ATTRIBUTES.map((attribute, index) => {
        const edge = pointFor(MAX, index, total)
        return (
          <line
            key={attribute.key}
            x1={CENTER}
            y1={CENTER}
            x2={edge.x}
            y2={edge.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.8}
          />
        )
      })}

      {/* Fantasma: estado inicial (50 em todos os eixos). */}
      <polygon
        points={polygon(ATTRIBUTES.map(() => 50))}
        fill="none"
        stroke="rgba(236,231,221,0.45)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />

      {/* Polígono atual. */}
      <polygon
        points={polygon(values)}
        fill="rgba(230,255,74,0.14)"
        stroke="#e6ff4a"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />

      {values.map((value, index) => {
        const point = pointFor(value, index, total)
        return <circle key={index} cx={point.x} cy={point.y} r={2} fill="#e6ff4a" />
      })}

      {ATTRIBUTES.map((attribute, index) => {
        const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total
        const x = CENTER + Math.cos(angle) * (RADIUS + 26)
        const y = CENTER + Math.sin(angle) * (RADIUS + 26)
        const anchor = Math.abs(Math.cos(angle)) < 0.25 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end'

        return (
          <text
            key={attribute.key}
            x={x}
            y={y}
            fill="#93929a"
            fontSize={8.5}
            fontFamily="JetBrains Mono, monospace"
            letterSpacing="1.2"
            textAnchor={anchor}
            dominantBaseline="middle"
          >
            {attribute.code}
            <title>{`${attribute.name} · ${Math.round(scores[attribute.key])}`}</title>
          </text>
        )
      })}

      <text
        x={CENTER}
        y={CENTER - 6}
        fill="#93929a"
        fontSize={7}
        fontFamily="JetBrains Mono, monospace"
        textAnchor="middle"
        letterSpacing="1.5"
      >
        BASE
      </text>
      <text
        x={CENTER}
        y={CENTER + 7}
        fill="#ece7dd"
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
        textAnchor="middle"
        letterSpacing="1"
      >
        40
      </text>
    </svg>
  )
}
