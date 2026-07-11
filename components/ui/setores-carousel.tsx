"use client"

import { useCallback } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Grupo = { nome: string; segmentos: string; imagem: string }

export function SetoresCarousel({ grupos }: { grupos: readonly Grupo[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" })
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <div className="relative mt-12" role="region" aria-label="Setores que atendemos">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {grupos.map((grupo) => (
            <div key={grupo.nome} className="min-w-0 flex-[0_0_78%] sm:flex-[0_0_44%] lg:flex-[0_0_23%]">
              <article className="setor-card group">
                <Image
                  src={grupo.imagem}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 44vw, 23vw"
                  className="setor-img object-cover"
                />
                <span aria-hidden className="setor-gold" />
                <span aria-hidden className="setor-gold2" />
                <span aria-hidden className="setor-scrim" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-display text-base font-semibold leading-tight text-white">{grupo.nome}</p>
                  <p className="setor-seg text-xs leading-relaxed">{grupo.segmentos}</p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Anterior"
        className="absolute -left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold-dim bg-panel/85 text-gold backdrop-blur transition-colors hover:border-gold hover:bg-panel"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        aria-label="Próximo"
        className="absolute -right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold-dim bg-panel/85 text-gold backdrop-blur transition-colors hover:border-gold hover:bg-panel"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
