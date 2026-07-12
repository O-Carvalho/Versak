import { ExternalLink, Mail } from "lucide-react"
import { Container } from "@/components/ui/container"
import { BackToTop } from "@/components/ui/back-to-top"
import { site } from "@/content/site"

export function Footer() {
  return (
    <footer className="relative border-t border-line py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, var(--color-gold-dim) 50%, transparent)" }}
      />
      <Container className="flex flex-col items-center justify-between gap-4 text-xs text-text-dim sm:flex-row">
        <p>
          © {new Date().getFullYear()} {site.nome} Serviços. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-6">
          <a href={`mailto:${site.email}`} className="flex items-center gap-1.5 hover:text-text-muted">
            <Mail className="h-4 w-4" />
            {site.email}
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-text-muted"
          >
            <ExternalLink className="h-4 w-4" />
            LinkedIn
          </a>
          <BackToTop />
        </div>
      </Container>
    </footer>
  )
}
