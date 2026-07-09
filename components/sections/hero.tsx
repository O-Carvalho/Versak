"use client"

import { motion } from "motion/react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { AmbientRing } from "@/components/ui/ambient-ring"
import { hero } from "@/content/home"
import { linkWhatsapp } from "@/content/site"

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-20 sm:pt-28">
      <AmbientRing />

      <Container className="relative grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex w-fit items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-gold"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {hero.eyebrow}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl font-bold leading-[1.1] text-text sm:text-5xl lg:text-[3.4rem]"
          >
            {hero.titulo.map((parte, i) => (
              <span key={i} className={parte.destaque ? "text-gold" : undefined}>
                {parte.texto}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-text-muted"
          >
            {hero.descricao}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button href={linkWhatsapp()} external>
              Quero escalar minha empresa
            </Button>
            <Button href="#solucoes" variant="ghost">
              Ver como funciona
            </Button>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-14 grid grid-cols-3 gap-6 border-t border-line pt-8"
          >
            {hero.estatisticas.map((stat) => (
              <div key={stat.rotulo}>
                <dt className="sr-only">{stat.rotulo}</dt>
                <dd className="font-display text-2xl font-bold text-gold sm:text-3xl">{stat.valor}</dd>
                <p className="mt-1 text-xs uppercase tracking-wide text-text-dim">{stat.rotulo}</p>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="flex flex-col gap-4">
          {hero.cartoes.map((cartao, i) => (
            <motion.div
              key={cartao.titulo}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
              className="rounded-md border border-line bg-panel p-5"
              style={{ marginLeft: i % 2 === 1 ? "2rem" : 0 }}
            >
              <p className="font-display text-sm font-semibold text-text">{cartao.titulo}</p>
              <p className="mt-1 text-sm text-text-muted">{cartao.texto}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
