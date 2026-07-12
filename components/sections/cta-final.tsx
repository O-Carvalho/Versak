"use client"

import { motion } from "motion/react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/ui/reveal"
import { ctaFinal } from "@/content/home"
import { linkWhatsapp } from "@/content/site"

export function CtaFinal() {
  return (
    <section className="cta-invertido border-t border-line py-24">
      <Container className="flex flex-col items-center gap-6 text-center">
        <Reveal>
          <h2 className="max-w-2xl font-display text-3xl font-bold text-bg sm:text-4xl">{ctaFinal.titulo}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="cta-invertido-quote font-display text-sm italic">&ldquo;{ctaFinal.citacao}&rdquo;</p>
        </Reveal>
        <Reveal delay={0.2}>
          <motion.div whileHover={{ scale: 1.03 }} className="inline-block">
            <Button href={linkWhatsapp()} external variant="dark">
              {ctaFinal.botao}
            </Button>
          </motion.div>
        </Reveal>
      </Container>
    </section>
  )
}
