import { Container } from "@/components/ui/container"
import { SectionHeading } from "@/components/ui/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { mercados } from "@/content/home"

export function Mercados() {
  return (
    <section id="mercados" className="border-t border-line py-24">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={mercados.eyebrow} titulo={mercados.titulo} subtitulo={mercados.subtitulo} />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mercados.grupos.map((grupo, i) => (
            <Reveal key={grupo.nome} delay={i * 0.05}>
              <div className="h-full rounded-md border border-line bg-panel p-5 transition-colors hover:border-gold-dim">
                <p className="font-display text-sm font-semibold text-text">{grupo.nome}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-text-dim">{grupo.segmentos}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
