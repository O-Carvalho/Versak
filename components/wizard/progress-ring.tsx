const RAIO = 60
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

export function ProgressRing({ pct, className = "" }: { pct: number; className?: string }) {
  const offset = CIRCUNFERENCIA - (CIRCUNFERENCIA * pct) / 100
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90">
        <circle className="wz-ring-bg" cx="66" cy="66" r={RAIO} />
        <circle
          className="wz-ring-fg"
          cx="66"
          cy="66"
          r={RAIO}
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-semibold leading-none sm:text-3xl">{pct}%</span>
        <span className="mt-1 hidden text-[9.5px] uppercase tracking-[0.1em] text-text-dim sm:block">Completo</span>
      </div>
    </div>
  )
}
