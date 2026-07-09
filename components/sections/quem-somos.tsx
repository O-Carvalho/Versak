import { Container } from "@/components/ui/container"
import { SectionHeading } from "@/components/ui/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { quemSomos } from "@/content/home"

export function QuemSomos() {
  return (
    <section id="quem-somos" className="border-t border-line py-24">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={quemSomos.eyebrow} titulo={quemSomos.titulo} />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-text-muted">{quemSomos.texto}</p>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {quemSomos.valores.map((valor, i) => (
            <Reveal key={valor.letra} delay={i * 0.06}>
              <div className="flex h-full flex-col gap-3 bg-panel p-6">
                <span className="font-display text-3xl font-bold text-gold">{valor.letra}</span>
                <p className="font-display text-sm font-semibold text-text">{valor.nome}</p>
                <p className="text-sm text-text-muted">{valor.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
