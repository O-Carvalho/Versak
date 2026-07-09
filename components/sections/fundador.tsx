import { Container } from "@/components/ui/container"
import { Reveal } from "@/components/ui/reveal"
import { fundador } from "@/content/home"

export function Fundador() {
  return (
    <section id="fundador" className="border-t border-line py-24">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <Reveal>
          <div>
            <span className="flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {fundador.eyebrow}
            </span>
            <p className="mt-4 font-display text-3xl font-bold text-text">{fundador.nome}</p>
            <p className="mt-1 text-sm text-text-muted">{fundador.cargo}</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {fundador.numeros.map((n, i) => (
            <Reveal key={n.rotulo} delay={i * 0.06}>
              <div>
                <p className="font-display text-2xl font-bold text-gold">{n.valor}</p>
                <p className="mt-1 text-xs leading-relaxed text-text-dim">{n.rotulo}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
