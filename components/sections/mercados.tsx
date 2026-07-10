import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  Building2,
  Cpu,
  Factory,
  HeartPulse,
  ShoppingCart,
  Truck,
  Wheat,
  Wrench,
} from "lucide-react"
import { Container } from "@/components/ui/container"
import { SectionHeading } from "@/components/ui/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { GlowCard } from "@/components/ui/glow-card"
import { IconBadge } from "@/components/ui/icon-badge"
import { mercados } from "@/content/home"

const ICONES: Record<string, LucideIcon> = {
  "Indústria de Manufatura Seriada": Factory,
  "Engenharia e Projetos": Wrench,
  "Agronegócio": Wheat,
  "Construção Civil": Building2,
  "Logística e Transporte": Truck,
  "Comércio": ShoppingCart,
  "Saúde": HeartPulse,
  "Serviços": Briefcase,
  "Tecnologia": Cpu,
}

export function Mercados() {
  return (
    <section id="mercados" className="border-t border-line py-24">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={mercados.eyebrow} titulo={mercados.titulo} subtitulo={mercados.subtitulo} />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*:nth-child(1)]:lg:col-span-2 [&>*:nth-child(9)]:lg:col-span-2">
          {mercados.grupos.map((grupo, i) => {
            // `noUncheckedIndexedAccess` makes this lookup type as `LucideIcon | undefined`;
            // all 9 `mercados.grupos` names above exist as ICONES keys, so the fallback
            // path is unreachable in practice. The `?? Briefcase` fallback keeps a future
            // content-only rename from crashing the page at runtime.
            const Icon = ICONES[grupo.nome] ?? Briefcase
            const linha = Math.floor(i / 3)
            return (
              <Reveal key={grupo.nome} delay={linha * 0.1 + (i % 3) * 0.05}>
                <GlowCard className="group h-full p-5">
                  <IconBadge
                    icon={Icon}
                    className="transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-gold/20"
                  />
                  <p className="mt-4 font-display text-sm font-semibold text-text">{grupo.nome}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-dim">{grupo.segmentos}</p>
                </GlowCard>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
