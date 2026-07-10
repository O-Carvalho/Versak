export function OrbitalCore({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`hero-stage ${className}`}>
      <div className="hero-halo" />
      <div className="hero-sys">
        <div className="hero-ring hero-ring-1" />
        <div className="hero-ring hero-ring-2" />
        <div className="hero-ring hero-ring-3" />
      </div>
      <div className="hero-core" />
    </div>
  )
}
