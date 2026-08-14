"use client"

import { EtapaDropdown } from "./etapa-dropdown"
import { ProgressRing } from "./progress-ring"
import type { Questionario, Respostas } from "@/lib/wizard-types"

type Props = {
  questionario: Questionario
  etapaAtual: number
  respostas: Respostas
  pct: number
  onSelecionarEtapa: (indice: number) => void
  onSalvarESair: () => void
}

export function WizardRail({
  questionario,
  etapaAtual,
  respostas,
  pct,
  onSelecionarEtapa,
  onSalvarESair,
}: Props) {
  const etapa = questionario.etapas[etapaAtual]
  return (
    <aside className="wz-rail flex w-full shrink-0 flex-row items-center gap-4 border-b border-line px-5 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-[340px] lg:flex-col lg:items-stretch lg:gap-0 lg:border-b-0 lg:px-9 lg:py-11">
      <span className="hidden font-display text-lg font-bold tracking-[0.08em] lg:mb-12 lg:flex lg:items-center lg:gap-2.5">
        <span className="h-[7px] w-[7px] rounded-full bg-gold shadow-[0_0_0_4px_rgba(232,169,62,0.15)]" />
        VERSAK
      </span>

      <ProgressRing pct={pct} className="h-14 w-14 shrink-0 lg:mb-6 lg:h-[132px] lg:w-[132px]" />

      <div className="min-w-0 flex-1 lg:flex-none">
        <p className="hidden font-display text-[10.5px] uppercase tracking-[0.14em] text-gold-dim lg:mb-2 lg:block">
          {questionario.rotuloEtapa} {etapaAtual + 1} de {questionario.etapas.length}
        </p>
        <p className="truncate text-[15px] font-semibold italic lg:mb-7 lg:whitespace-normal lg:text-[22px]">
          {etapa?.nome ?? "—"}
        </p>
      </div>

      <div className="hidden lg:block">
        <p className="mb-2 font-display text-[10px] uppercase tracking-[0.12em] text-text-dim">
          Ir para um {questionario.rotuloEtapa.toLowerCase()}
        </p>
        <EtapaDropdown
          questionario={questionario}
          etapaAtual={etapaAtual}
          respostas={respostas}
          onSelecionar={onSelecionarEtapa}
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3 lg:ml-0 lg:mt-auto lg:flex-col lg:items-stretch lg:gap-3.5 lg:border-t lg:border-line lg:pt-5">
        <p className="hidden items-center gap-2 text-[11px] leading-relaxed text-text-dim lg:flex">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold opacity-70" />
          Progresso salvo automaticamente
        </p>
        <button
          type="button"
          onClick={onSalvarESair}
          className="rounded border border-line px-3 py-2.5 text-left font-display text-[10px] uppercase tracking-[0.05em] text-text-muted transition-colors hover:border-gold-dim hover:text-text lg:text-[11.5px]"
        >
          Salvar e sair
        </button>
      </div>
    </aside>
  )
}
