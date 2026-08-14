import type { Metadata } from "next"
import { Dme360Client } from "@/components/dme360/dme360-client"

export const metadata: Metadata = {
  title: "DME 360 — Diagnóstico de Maturidade Empresarial | Versak",
  description: "Responda o DME 360 e descubra o nível de maturidade da gestão da sua empresa.",
  robots: { index: false, follow: false },
}

export default function Dme360Page() {
  return <Dme360Client />
}
