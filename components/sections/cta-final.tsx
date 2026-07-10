"use client"

import { motion } from "motion/react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/ui/reveal"
import { AmbientRing } from "@/components/ui/ambient-ring"
import { ctaFinal } from "@/content/home"
import { linkWhatsapp } from "@/content/site"

export function CtaFinal() {
  return (
    <section className="relative overflow-hidden border-t border-line py-24">
      <AmbientRing
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 opacity-[0.2]"
        raios={[80, 140, 200]}
        baseDuration={80}
      />

      <Container className="relative flex flex-col items-center gap-6 text-center">
        <Reveal>
          <h2 className="max-w-2xl font-display text-3xl font-bold text-text sm:text-4xl">{ctaFinal.titulo}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="font-display text-sm italic text-text-muted">&ldquo;{ctaFinal.citacao}&rdquo;</p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="relative">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gold/20 blur-2xl"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div whileHover={{ scale: 1.03 }} className="inline-block">
              <Button href={linkWhatsapp()} external>
                {ctaFinal.botao}
              </Button>
            </motion.div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
