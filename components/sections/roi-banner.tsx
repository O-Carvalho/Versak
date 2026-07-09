import { Container } from "@/components/ui/container"
import { Reveal } from "@/components/ui/reveal"
import { roi } from "@/content/home"

export function RoiBanner() {
  return (
    <section className="border-y border-line bg-panel py-20">
      <Container className="text-center">
        <Reveal>
          <p className="mx-auto max-w-3xl font-display text-2xl font-semibold leading-snug text-text sm:text-3xl">
            {roi.titulo} <span className="text-gold">{roi.destaque}</span>
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 text-xs uppercase tracking-wide text-text-dim">{roi.nota}</p>
        </Reveal>
      </Container>
    </section>
  )
}
