import type { ReactNode } from "react"

export function GlowCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-md border border-line bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-gold-dim hover:shadow-[0_0_24px_-8px_rgba(232,169,62,0.35)] ${className}`}
    >
      {children}
    </div>
  )
}
