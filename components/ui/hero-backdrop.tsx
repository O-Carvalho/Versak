export function HeroBackdrop({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="hero-aurora-bg" />
      <span className="hero-blob hero-blob-1" />
      <span className="hero-blob hero-blob-2" />
      <svg className="hero-net" viewBox="0 0 680 380" preserveAspectRatio="xMidYMid slice">
        <line className="hero-net-link" x1="90" y1="70" x2="230" y2="120" />
        <line className="hero-net-link-delayed" x1="230" y1="120" x2="150" y2="250" />
        <line className="hero-net-link" x1="500" y1="60" x2="600" y2="150" />
        <line className="hero-net-link-delayed" x1="560" y1="280" x2="620" y2="200" />
        <line x1="90" y1="70" x2="150" y2="250" />
        <circle className="hero-net-node" cx="90" cy="70" r="3.5" />
        <circle className="hero-net-node" cx="230" cy="120" r="4.5" />
        <circle className="hero-net-node" cx="150" cy="250" r="3.5" />
        <circle className="hero-net-node" cx="500" cy="60" r="3.5" />
        <circle className="hero-net-node" cx="600" cy="150" r="4" />
        <circle className="hero-net-node" cx="620" cy="200" r="3.5" />
        <circle className="hero-net-node" cx="560" cy="280" r="4" />
        <circle className="hero-net-pulse" r="3">
          <animateMotion dur="4s" repeatCount="indefinite" path="M90,70 L230,120 L150,250" />
        </circle>
        <circle className="hero-net-pulse" r="3">
          <animateMotion dur="5s" repeatCount="indefinite" begin="1s" path="M500,60 L600,150 L620,200" />
        </circle>
      </svg>
    </div>
  )
}
