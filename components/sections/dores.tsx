import { Container } from "@/components/ui/container"
import { Reveal } from "@/components/ui/reveal"
import { dores } from "@/content/home"

export function Dores() {
  return (
    <section id="solucoes" className="relative overflow-hidden border-t border-line bg-panel/40 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, var(--color-gold-dim) 0%, transparent 70%)" }}
      />

      <svg
        aria-hidden
        className="dores-net pointer-events-none absolute inset-0"
        viewBox="0 0 760 460"
        preserveAspectRatio="xMidYMid slice"
      >
        <line x1="120" y1="70" x2="360" y2="180" />
        <line x1="360" y1="180" x2="620" y2="120" />
        <line x1="360" y1="180" x2="300" y2="360" />
        <line x1="300" y1="360" x2="640" y2="400" />
        <circle cx="120" cy="70" r="3.5" />
        <circle cx="360" cy="180" r="4.5" />
        <circle cx="620" cy="120" r="3.5" />
        <circle cx="300" cy="360" r="4" />
        <circle cx="640" cy="400" r="3.5" />
      </svg>

      <Container className="relative">
        <Reveal>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              {dores.eyebrow}
            </span>
            <h2 className="font-display text-3xl font-semibold text-text sm:text-4xl">{dores.titulo}</h2>
          </div>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
          {dores.lista.map((item, i) => (
            <Reveal key={item} delay={i * 0.05} y={20}>
              <div className="hero-glass flex h-full min-h-[5.25rem] items-center gap-4 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-gold-dim hover:shadow-[var(--shadow-gold-glow)]">
                <span className="dores-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm font-medium leading-snug text-text-muted">{item}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
