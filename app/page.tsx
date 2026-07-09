import { Header } from "@/components/sections/header"
import { Hero } from "@/components/sections/hero"
import { QuemSomos } from "@/components/sections/quem-somos"
import { Dores } from "@/components/sections/dores"
import { Mercados } from "@/components/sections/mercados"
import { RoiBanner } from "@/components/sections/roi-banner"
import { Fundador } from "@/components/sections/fundador"
import { CtaFinal } from "@/components/sections/cta-final"
import { Footer } from "@/components/sections/footer"

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <QuemSomos />
        <Dores />
        <Mercados />
        <RoiBanner />
        <Fundador />
        <CtaFinal />
      </main>
      <Footer />
    </>
  )
}
