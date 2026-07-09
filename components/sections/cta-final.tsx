import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/ui/reveal"
import { ctaFinal } from "@/content/home"
import { linkWhatsapp } from "@/content/site"

export function CtaFinal() {
  return (
    <section className="border-t border-line py-24">
      <Container className="flex flex-col items-center gap-6 text-center">
        <Reveal>
          <h2 className="max-w-2xl font-display text-3xl font-bold text-text sm:text-4xl">{ctaFinal.titulo}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="font-display text-sm italic text-text-muted">&ldquo;{ctaFinal.citacao}&rdquo;</p>
        </Reveal>
        <Reveal delay={0.2}>
          <Button href={linkWhatsapp()} external>
            {ctaFinal.botao}
          </Button>
        </Reveal>
      </Container>
    </section>
  )
}
