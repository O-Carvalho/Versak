import type { Metadata } from "next"
import { PulsoClient } from "@/components/pulso/pulso-client"

export const metadata: Metadata = {
  title: "Pulso de Saída — Versak",
  robots: { index: false, follow: false },
}

export default function PulsoSaidaPage() {
  return (
    <PulsoClient
      tipo="saida"
      eyebrow="Antes de encerrar, a mesma escala"
      titulo="Antes de encerrar, a mesma escala:"
      pergunta="Depois do encontro de hoje, de 0 a 10, quanto você percebe que ainda precisa conhecer melhor sua empresa?"
      legenda="Sua resposta ajuda a medir a sensibilização produzida pela Masterclass."
    />
  )
}
