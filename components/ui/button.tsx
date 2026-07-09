import Link from "next/link"
import type { ReactNode } from "react"

type ButtonProps = {
  href: string
  children: ReactNode
  variant?: "primary" | "ghost"
  external?: boolean
}

export function Button({ href, children, variant = "primary", external = false }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 font-display text-sm font-semibold tracking-wide transition-colors"
  const styles =
    variant === "primary"
      ? "bg-gold text-bg hover:bg-gold-bright"
      : "border border-line text-text-muted hover:border-gold-dim hover:text-text"

  return (
    <Link
      href={href}
      className={`${base} ${styles}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  )
}
