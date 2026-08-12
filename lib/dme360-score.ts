import { DME360_DIMENSOES } from "../content/dme360"

export type DmeRespostas = Record<string, number>
export type DmeClassificacao = "Caótico" | "Consciente" | "Definido" | "Gerenciado" | "Otimizado"
export type DmePrioridade = "Crítica" | "Alta" | "Média" | "Baixa" | "Manutenção"
export type DmePontuacaoDimensao = {
  id: string
  nome: string
  media: number
  classificacao: DmeClassificacao
  prioridade: DmePrioridade
  porSubdimensao: { subdimensao: string; media: number }[]
}
export type DmePontuacao = {
  porDimensao: DmePontuacaoDimensao[]
  ime: number
  classificacao: DmeClassificacao
}

export function classificar(valor: number): DmeClassificacao {
  if (valor < 2) return "Caótico"
  if (valor < 3) return "Consciente"
  if (valor < 4) return "Definido"
  if (valor < 4.5) return "Gerenciado"
  return "Otimizado"
}

export function priorizar(valor: number): DmePrioridade {
  if (valor < 2) return "Crítica"
  if (valor < 3) return "Alta"
  if (valor < 4) return "Média"
  if (valor < 4.5) return "Baixa"
  return "Manutenção"
}

const media = (valores: number[]) => valores.reduce((a, b) => a + b, 0) / valores.length

export function calcularPontuacao(respostas: DmeRespostas): DmePontuacao {
  const porDimensao = DME360_DIMENSOES.map((dim) => {
    const porSub = new Map<string, number[]>()
    for (const q of dim.questoes) {
      const chave = `${dim.id}:${q.codigo}`
      const nota = respostas[chave]
      if (!Number.isInteger(nota) || nota === undefined || nota < 1 || nota > 5) {
        throw new Error(`Resposta ausente ou inválida para ${chave}`)
      }
      const lista = porSub.get(q.subdimensao) ?? []
      lista.push(nota)
      porSub.set(q.subdimensao, lista)
    }
    const porSubdimensao = [...porSub.entries()].map(([subdimensao, notas]) => ({
      subdimensao,
      media: media(notas),
    }))
    // Fiel ao Excel: média da dimensão = média das médias das subdimensões
    const mediaDim = media(porSubdimensao.map((s) => s.media))
    return {
      id: dim.id,
      nome: dim.nome,
      media: mediaDim,
      classificacao: classificar(mediaDim),
      prioridade: priorizar(mediaDim),
      porSubdimensao,
    }
  })

  const ime = DME360_DIMENSOES.reduce((soma, dim, i) => {
    const d = porDimensao[i]
    return soma + (d ? d.media * dim.peso : 0)
  }, 0)

  return { porDimensao, ime, classificacao: classificar(ime) }
}
