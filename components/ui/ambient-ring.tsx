"use client"

import { motion } from "motion/react"

export function AmbientRing({
  className = "pointer-events-none absolute -right-40 -top-24 h-[520px] w-[520px] opacity-[0.35] sm:-right-20",
  raios = [90, 150, 210, 270],
  baseDuration = 60,
}: {
  className?: string
  raios?: number[]
  baseDuration?: number
}) {
  return (
    <div aria-hidden className={className}>
      {raios.map((r, i) => (
        <motion.span
          key={r}
          className="absolute rounded-full border border-gold-dim"
          style={{
            width: r * 2,
            height: r * 2,
            left: `calc(50% - ${r}px)`,
            top: `calc(50% - ${r}px)`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: baseDuration + i * 20, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-gold" />
        </motion.span>
      ))}
    </div>
  )
}
