import { Container } from "@/components/ui/container"
import { SectionHeading } from "@/components/ui/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { SetoresCarousel } from "@/components/ui/setores-carousel"
import { mercados } from "@/content/home"

export function Mercados() {
  return (
    <section id="mercados" className="border-t border-line py-24">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={mercados.eyebrow} titulo={mercados.titulo} subtitulo={mercados.subtitulo} />
        </Reveal>
        <SetoresCarousel grupos={mercados.grupos} />
      </Container>
    </section>
  )
}
