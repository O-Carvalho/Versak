"use client"

import { useCallback, useEffect, useState } from "react"
import type { Respostas, WizardLead } from "@/lib/wizard-types"

export type WizardTela = "abertura" | "questionario" | "pausa" | "concluido"

export type WizardDraft = {
  versao: string
  tela: WizardTela
  etapaAtual: number
  lead: WizardLead
  respostas: Respostas
  iniciadoEm: number
}

/**
 * Autosave versionado. Rascunho de versão diferente do questionário é
 * descartado (as chaves de resposta podem ter mudado).
 */
export function useWizardDraft(questionarioId: string, versao: string) {
  const chave = `wizard-draft-${questionarioId}-v1`
  const [pronto, setPronto] = useState(false)
  const [inicial, setInicial] = useState<WizardDraft | null>(null)

  useEffect(() => {
    try {
      const bruto = localStorage.getItem(chave)
      if (bruto) {
        const draft = JSON.parse(bruto) as WizardDraft
        if (draft.versao === versao) setInicial(draft)
      }
    } catch {
      // rascunho ilegível: começa do zero
    }
    setPronto(true)
  }, [chave, versao])

  const salvar = useCallback(
    (draft: WizardDraft) => {
      try {
        localStorage.setItem(chave, JSON.stringify(draft))
      } catch {
        // sem espaço ou storage bloqueado: segue sem persistir
      }
    },
    [chave],
  )

  const limpar = useCallback(() => {
    try {
      localStorage.removeItem(chave)
    } catch {
      // nada a fazer
    }
  }, [chave])

  return { pronto, inicial, salvar, limpar }
}
