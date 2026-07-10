"use client"

import { useState } from "react"
import { motion, useMotionValueEvent, useScroll } from "motion/react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/ui/mobile-nav"
import { Logo } from "@/components/ui/logo"
import { site, linkWhatsapp } from "@/content/site"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 8)
  })

  return (
    <header
      className={`sticky top-0 z-40 border-b border-line/60 backdrop-blur transition-colors duration-300 ${
        scrolled ? "bg-bg/95" : "bg-bg/80"
      }`}
    >
      <Container className="relative flex h-20 items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 text-gold">
          <Logo className="h-9 w-auto" />
          <span className="font-display text-lg font-bold tracking-[0.15em]">{site.nome.toUpperCase()}</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" onMouseLeave={() => setHovered(null)}>
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHovered(item.href)}
              className="relative py-2 font-display text-xs font-medium uppercase tracking-wide text-text-muted transition-colors hover:text-text"
            >
              {item.label}
              {hovered === item.href && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gold"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button href={linkWhatsapp()} external variant="ghost">
            Falar no WhatsApp
          </Button>
          <MobileNav nav={site.nav} />
        </div>
      </Container>
    </header>
  )
}
