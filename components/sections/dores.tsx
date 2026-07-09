import { AlertTriangle } from "lucide-react"
import { Container } from "@/components/ui/container"
import { SectionHeading } from "@/components/ui/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { GlowCard } from "@/components/ui/glow-card"
import { IconBadge } from "@/components/ui/icon-badge"
import { dores } from "@/content/home"

// Indices 3 and 4 (the longer-text items) span 2 columns on lg to break visual
// monotony. Targeted via nth-child on the grid container (not on GlowCard's
// className) because GlowCard is nested inside Reveal's wrapper div, which is
// the actual grid child — col-span only affects direct grid children.
export function Dores() {
  return (
    <section id="solucoes" className="relative overflow-hidden border-t border-line bg-panel/40 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, var(--color-gold-dim) 0%, transparent 70%)" }}
      />

      <Container className="relative">
        <Reveal>
          <SectionHeading eyebrow={dores.eyebrow} titulo={dores.titulo} align="center" />
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*:nth-child(4)]:lg:col-span-2 [&>*:nth-child(5)]:lg:col-span-2">
          {dores.lista.map((item, i) => (
            <Reveal key={item} delay={i * 0.06} y={20}>
              <GlowCard className="flex h-full items-start gap-3 p-5">
                <IconBadge icon={AlertTriangle} />
                <p className="pt-2 text-sm text-text-muted">{item}</p>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
