"use client"

import { motion } from "motion/react"
import { CheckCircle2, ChartColumn, TrendingUp } from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { HeroBackdrop } from "@/components/ui/hero-backdrop"
import { OrbitalCore } from "@/components/ui/orbital-core"
import { IconBadge } from "@/components/ui/icon-badge"
import { hero } from "@/content/home"
import { linkWhatsapp } from "@/content/site"

const cardIcons = [TrendingUp, CheckCircle2, ChartColumn]
const cardPos = [
  "lg:right-0 lg:top-6",
  "lg:left-0 lg:top-1/2 lg:-translate-y-1/2",
  "lg:bottom-4 lg:right-8",
]
const cardFloat = ["hero-float-1", "hero-float-2", "hero-float-3"]

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-20 sm:pt-28">
      <HeroBackdrop />

      <Container className="relative grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
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
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-text-muted"
          >
            {hero.descricao}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button href={linkWhatsapp()} external>
              Quero escalar minha empresa
            </Button>
            <Button href="#diagnostico" variant="ghost">
              Ver como funciona
            </Button>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
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

        <div className="relative flex flex-col items-center gap-6 lg:block">
          <OrbitalCore />
          <div className="grid w-full gap-4 lg:contents">
            {hero.cartoes.map((cartao, i) => {
              const Icon = cardIcons[i] ?? TrendingUp
              const pos = cardPos[i] ?? ""
              const float = cardFloat[i] ?? "hero-float-1"
              return (
                <div
                  key={cartao.titulo}
                  className={`hero-glass ${float} flex items-start gap-3 p-4 lg:absolute lg:min-h-24 lg:w-64 ${pos}`}
                >
                  <IconBadge icon={Icon} />
                  <div>
                    <p className="font-display text-sm font-semibold text-text">{cartao.titulo}</p>
                    <p className="mt-1 text-sm text-text-muted">{cartao.texto}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}
