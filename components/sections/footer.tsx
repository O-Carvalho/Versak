import { Container } from "@/components/ui/container"
import { site } from "@/content/site"

export function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <Container className="flex flex-col items-center justify-between gap-4 text-xs text-text-dim sm:flex-row">
        <p>
          © {new Date().getFullYear()} {site.nome} Serviços. Todos os direitos reservados.
        </p>
        <div className="flex gap-6">
          <a href={`mailto:${site.email}`} className="hover:text-text-muted">
            {site.email}
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-text-muted">
            LinkedIn
          </a>
        </div>
      </Container>
    </footer>
  )
}
