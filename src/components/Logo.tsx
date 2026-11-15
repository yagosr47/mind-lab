/** Marca MIND//LAB: bloco de tinta, M em osso e a barra de corte em tc. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden role="presentation">
      <rect x="0.5" y="0.5" width="47" height="47" fill="#0c0c10" stroke="rgba(255,255,255,0.18)" />
      <path
        d="M8 37V12l8.5 14L25 12v25"
        fill="none"
        stroke="#ece7dd"
        strokeWidth="2.6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path d="M33 38 44 10" stroke="#e6ff4a" strokeWidth="2.8" strokeLinecap="square" />
    </svg>
  )
}
