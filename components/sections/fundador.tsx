import Image from "next/image"
import { Container } from "@/components/ui/container"
import { Reveal } from "@/components/ui/reveal"
import { AmbientRing } from "@/components/ui/ambient-ring"
import { CountUp } from "@/components/ui/count-up"
import { fundador } from "@/content/home"

export function Fundador() {
  return (
    <section id="fundador" className="border-t border-line py-24">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <Reveal>
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
            <div className="relative h-56 w-56 flex-shrink-0">
              <AmbientRing
                className="pointer-events-none absolute inset-0 opacity-60"
                raios={[80, 108]}
                baseDuration={100}
              />
              <div className="absolute inset-11 overflow-hidden rounded-full border-2 border-gold-dim">
                <Image
                  src="/fundador/victor-saura.jpg"
                  alt={fundador.nome}
                  fill
                  sizes="224px"
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <span className="flex items-center justify-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-gold lg:justify-start">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {fundador.eyebrow}
              </span>
              <p className="mt-4 font-display text-3xl font-bold text-text">{fundador.nome}</p>
              <p className="mt-1 text-sm text-text-muted">{fundador.cargo}</p>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {fundador.numeros.map((n, i) => (
            <Reveal key={n.rotulo} delay={i * 0.08}>
              <div className="border-b-2 border-transparent pb-2 transition-colors duration-300 hover:border-gold">
                <p className="font-display text-2xl font-bold text-gold">
                  <CountUp value={n.valor} />
                </p>
                <p className="mt-1 text-xs leading-relaxed text-text-dim">{n.rotulo}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
