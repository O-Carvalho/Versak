import type { Metadata } from "next"
import { site } from "@/content/site"

type PageSeoInput = {
  titulo: string
  descricao?: string
  caminho?: string
}

export function buildMetadata({ titulo, descricao, caminho = "" }: PageSeoInput): Metadata {
  const url = `${site.url}${caminho}`
  const descricaoFinal = descricao ?? site.descricaoSeo

  return {
    title: titulo,
    description: descricaoFinal,
    alternates: { canonical: url },
    openGraph: {
      title: titulo,
      description: descricaoFinal,
      url,
      siteName: site.nome,
      locale: "pt_BR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descricaoFinal,
    },
  }
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.nome,
    description: site.descricaoSeo,
    url: site.url,
    email: site.email,
    areaServed: "BR",
  }
}
