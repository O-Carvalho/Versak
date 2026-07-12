import { Container } from "@/components/ui/container"
import { SectionHeading } from "@/components/ui/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { quemSomos } from "@/content/home"

export function QuemSomos() {
  return (
    <section id="quem-somos" className="relative overflow-hidden border-t border-line py-24">
      <Container className="relative">
        <Reveal>
          <SectionHeading eyebrow={quemSomos.eyebrow} titulo={quemSomos.titulo} />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-text-muted">{quemSomos.texto}</p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quemSomos.valores.map((valor, i) => (
            <Reveal key={valor.letra} delay={i * 0.06}>
              <article className="qs-card h-full">
                <span aria-hidden className="qs-bloom" />
                <span aria-hidden className="qs-rim" />
                <span aria-hidden className="qs-letter">
                  {valor.letra}
                </span>
                <span aria-hidden className="qs-scrim" />
                <div className="qs-body">
                  <p className="qs-nome">{valor.nome}</p>
                  <p className="qs-desc">{valor.texto}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
