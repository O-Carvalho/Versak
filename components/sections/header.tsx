import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { site, linkWhatsapp } from "@/content/site"

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/80 backdrop-blur">
      <Container className="flex h-20 items-center justify-between">
        <span className="font-display text-lg font-bold tracking-[0.15em] text-gold">
          {site.nome.toUpperCase()}
        </span>

        <nav className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-display text-xs font-medium uppercase tracking-wide text-text-muted transition-colors hover:text-text"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button href={linkWhatsapp()} external variant="ghost">
          Falar no WhatsApp
        </Button>
      </Container>
    </header>
  )
}
