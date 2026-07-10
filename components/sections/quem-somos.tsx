import { BookOpen, Flame, Heart, KeyRound, Shuffle, Target } from "lucide-react"
import { Container } from "@/components/ui/container"
import { SectionHeading } from "@/components/ui/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { GlowCard } from "@/components/ui/glow-card"
import { IconBadge } from "@/components/ui/icon-badge"
import { quemSomos } from "@/content/home"

const ICONES = {
  V: Shuffle,
  E: Target,
  R: Heart,
  S: BookOpen,
  A: Flame,
  K: KeyRound,
} as const

export function QuemSomos() {
  return (
    <section id="quem-somos" className="relative overflow-hidden border-t border-line py-24">
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 -z-10 -translate-x-1/2 select-none whitespace-nowrap font-display text-[10rem] font-bold text-text opacity-[0.03] sm:text-[14rem]"
      >
        VERSAK
      </span>

      <Container className="relative">
        <Reveal>
          <SectionHeading eyebrow={quemSomos.eyebrow} titulo={quemSomos.titulo} />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-text-muted">{quemSomos.texto}</p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quemSomos.valores.map((valor, i) => {
            const Icon = ICONES[valor.letra as keyof typeof ICONES] ?? Target
            return (
              <Reveal key={valor.letra} delay={i * 0.06}>
                <GlowCard className="flex h-full flex-col gap-3 p-6">
                  <div className="flex items-center gap-3">
                    <IconBadge icon={Icon} />
                    <span className="font-display text-2xl font-bold text-gold">{valor.letra}</span>
                  </div>
                  <p className="font-display text-sm font-semibold text-text">{valor.nome}</p>
                  <p className="text-sm text-text-muted">{valor.texto}</p>
                </GlowCard>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
