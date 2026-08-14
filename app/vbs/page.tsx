import type { Metadata } from "next"
import { VbsClient } from "@/components/wizard/vbs-client"

export const metadata: Metadata = {
  title: "VBS — Versak Business Snapshot",
  description: "Um retrato rápido do contexto e da gestão da sua empresa.",
  robots: { index: false, follow: false },
}

export default function VbsPage() {
  return <VbsClient />
}
