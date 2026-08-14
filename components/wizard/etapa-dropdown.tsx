"use client"

import { useEffect, useRef, useState } from "react"
import { etapaCompleta, faltamNaEtapa, camposObrigatorios } from "@/lib/wizard-progress"
import type { Questionario, Respostas } from "@/lib/wizard-types"

type Props = {
  questionario: Questionario
  etapaAtual: number
  respostas: Respostas
  onSelecionar: (indice: number) => void
}

export function EtapaDropdown({ questionario, etapaAtual, respostas, onSelecionar }: Props) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener("mousedown", aoClicarFora)
    return () => document.removeEventListener("mousedown", aoClicarFora)
  }, [aberto])

  const atual = questionario.etapas[etapaAtual]
  const obrigatoriosAtuais = atual ? camposObrigatorios(atual).length : 0
  const respondidosAtuais = atual ? obrigatoriosAtuais - faltamNaEtapa(atual, respostas) : 0

  return (
    <div className="relative w-full" ref={ref}>
      <button type="button" className="wz-dd-toggle" onClick={() => setAberto((a) => !a)}>
        <span className="min-w-0">
          <span className="block truncate text-[13.5px] font-semibold">{atual?.nome ?? "—"}</span>
          <span className="mt-0.5 block font-display text-[10.5px] tracking-wide text-text-dim">
            {respondidosAtuais} / {obrigatoriosAtuais} respondidas
          </span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 text-text-dim transition-transform ${aberto ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className={`wz-dd-panel ${aberto ? "wz-dd-panel-aberto" : ""}`}>
        {questionario.etapas.map((etapa, i) => {
          const total = camposObrigatorios(etapa).length
          const feitos = total - faltamNaEtapa(etapa, respostas)
          const completa = etapaCompleta(etapa, respostas)
          const eAtual = i === etapaAtual
          return (
            <button
              key={etapa.id}
              type="button"
              className={`wz-dd-item ${eAtual ? "wz-dd-item-atual" : ""}`}
              onClick={() => {
                setAberto(false)
                onSelecionar(i)
              }}
            >
              <span
                className={`wz-dd-idx ${eAtual ? "wz-dd-idx-atual" : completa ? "wz-dd-idx-feito" : ""}`}
              >
                {completa && !eAtual ? "✓" : i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate">{etapa.nome}</span>
              <span className="shrink-0 font-display text-[10.5px] text-text-dim">
                {feitos}/{total}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
