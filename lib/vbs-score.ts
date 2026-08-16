import { VBS_BLOCOS } from "@/content/vbs"
import type { Respostas } from "./wizard-types"

// Leitura simples e transparente, NÃO uma metodologia oficial da Versak: cada
// resposta da "escala VBS" (5 opções) vira um número de 0 a 3; "Não se
// aplica" fica fora da média. Serve só para o gráfico de radar da tela final.
const VALOR_OPCAO: Record<string, number> = {
  "Sei e acompanho com dados": 3,
  "Sei aproximadamente / acompanho parcialmente": 2,
  "Tenho percepção, mas não dados confiáveis": 1,
  "Não sei / não acompanho": 0,
}
const NOTA_MAXIMA = 3

const BLOCOS_DIAGNOSTICO = VBS_BLOCOS.filter((b) =>
  ["custos", "margem", "cliente", "eficiencia", "dados"].includes(b.id),
)

export type VbsPontuacaoDimensao = { id: string; nome: string; media: number | null }
export type VbsPontuacao = { notaMaxima: number; dimensoes: VbsPontuacaoDimensao[] }

export function calcularPontuacaoVbs(respostas: Respostas): VbsPontuacao {
  const dimensoes = BLOCOS_DIAGNOSTICO.map((bloco) => {
    const valores: number[] = []
    for (const campo of bloco.campos) {
      const resposta = respostas[`${bloco.id}:${campo.id}`]
      if (typeof resposta !== "string") continue
      const valor = VALOR_OPCAO[resposta]
      if (valor !== undefined) valores.push(valor)
    }
    const media = valores.length === 0 ? null : valores.reduce((a, b) => a + b, 0) / valores.length
    return { id: bloco.id, nome: bloco.nome.replace(/^\d+\.\s*/, ""), media }
  })
  return { notaMaxima: NOTA_MAXIMA, dimensoes }
}
