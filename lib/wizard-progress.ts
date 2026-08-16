import type { Campo, Etapa, Questionario, Respostas } from "./wizard-types"

/** Uma resposta conta como dada quando não é undefined, string vazia, nem array vazio (múltipla escolha). */
export function respondido(valor: string | number | string[] | undefined): boolean {
  if (valor === undefined) return false
  if (typeof valor === "string") return valor.trim() !== ""
  if (Array.isArray(valor)) return valor.length > 0
  return true
}

export function camposObrigatorios(etapa: Etapa): Campo[] {
  return etapa.campos.filter((c) => c.obrigatorio)
}

export function faltamNaEtapa(etapa: Etapa, respostas: Respostas): number {
  return camposObrigatorios(etapa).filter((c) => !respondido(respostas[c.chave])).length
}

export function etapaCompleta(etapa: Etapa, respostas: Respostas): boolean {
  return faltamNaEtapa(etapa, respostas) === 0
}

export function progressoObrigatorio(
  q: Questionario,
  respostas: Respostas,
): { respondidos: number; total: number; pct: number } {
  let total = 0
  let respondidos = 0
  for (const etapa of q.etapas) {
    for (const campo of camposObrigatorios(etapa)) {
      total++
      if (respondido(respostas[campo.chave])) respondidos++
    }
  }
  const pct = total === 0 ? 0 : Math.round((respondidos / total) * 100)
  return { respondidos, total, pct }
}

/** Agrupa os campos da etapa preservando a ordem original; grupo null = sem subdivisão. */
export function gruposDaEtapa(etapa: Etapa): { grupo: string | null; campos: Campo[] }[] {
  const saida: { grupo: string | null; campos: Campo[] }[] = []
  for (const campo of etapa.campos) {
    const grupo = campo.grupo ?? null
    const ultimo = saida[saida.length - 1]
    if (ultimo && ultimo.grupo === grupo) ultimo.campos.push(campo)
    else saida.push({ grupo, campos: [campo] })
  }
  return saida
}
