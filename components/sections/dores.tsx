import { Container } from "@/components/ui/container"
import { SectionHeading } from "@/components/ui/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { dores } from "@/content/home"

export function Dores() {
  return (
    <section id="solucoes" className="border-t border-line bg-panel/40 py-24">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={dores.eyebrow} titulo={dores.titulo} align="center" />
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-4xl gap-x-10 gap-y-4 sm:grid-cols-2">
          {dores.lista.map((item, i) => (
            <Reveal key={item} delay={i * 0.04}>
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                <p className="text-sm text-text-muted">{item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
