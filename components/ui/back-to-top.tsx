"use client"

import { ArrowUp } from "lucide-react"

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao início"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-line transition-colors hover:border-gold-dim hover:text-gold"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  )
}
