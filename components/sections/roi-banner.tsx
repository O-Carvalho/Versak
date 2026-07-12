// components/sections/roi-banner.tsx
"use client"

import { motion } from "motion/react"
import { Container } from "@/components/ui/container"
import { Reveal } from "@/components/ui/reveal"
import { AmbientRing } from "@/components/ui/ambient-ring"
import { CountUp } from "@/components/ui/count-up"
import { roi } from "@/content/home"

export function RoiBanner() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-panel py-20">
      <AmbientRing
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-[0.15]"
        raios={[70, 120, 170]}
        baseDuration={90}
      />

      <Container className="relative text-center">
        <Reveal>
          <p className="mx-auto max-w-3xl font-display text-2xl font-semibold leading-snug text-text sm:text-3xl">
            {roi.titulo}
            <motion.span
              className="mt-1 block text-gold"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {roi.destaquePrefixo} <CountUp value={roi.multiplicador} /> {roi.destaqueSufixo}
            </motion.span>
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 text-xs uppercase tracking-wide text-text-dim">{roi.nota}</p>
        </Reveal>
      </Container>
    </section>
  )
}
