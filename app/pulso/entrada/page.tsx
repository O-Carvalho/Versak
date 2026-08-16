import type { Metadata } from "next"
import { PulsoClient } from "@/components/pulso/pulso-client"

export const metadata: Metadata = {
  title: "Pulso de Entrada — Versak",
  robots: { index: false, follow: false },
}

export default function PulsoEntradaPage() {
  return (
    <PulsoClient
      tipo="entrada"
      eyebrow="Antes de começar, uma pergunta"
      titulo="Antes de começar, uma pergunta:"
      pergunta="De 0 a 10, quanto você considera que conhece os números e os processos da sua empresa?"
      legenda="Aponte a câmera do celular e responda. Leva menos de 1 minuto."
    />
  )
}
