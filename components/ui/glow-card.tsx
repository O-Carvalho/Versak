import type { ReactNode } from "react"

export function GlowCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-md border border-line bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-gold-dim hover:shadow-[var(--shadow-gold-glow)] ${className}`}
    >
      {children}
    </div>
  )
}
