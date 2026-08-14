// Gera content/vbs.ts a partir da planilha VBS (Versak Business Snapshot).
// Uso: npm run vbs:import [-- caminho/para/arquivo.xlsx]
//
// O xlsx traz os rótulos e as listas suspensas, mas NÃO diz o tipo de cada
// campo nem quais são obrigatórios. Esse mapeamento é a tabela CAMPOS abaixo,
// referenciada pelo número da linha do Excel (1-indexed, aba "02 - VBS").
import { readFileSync, writeFileSync } from "node:fs"
import * as XLSX from "xlsx"

const ARQUIVO = process.argv[2] ?? "C:/Users/mathe/Downloads/VBS_Versak_Ficha Cadastral (1).xlsx"
const VERSAO = "vbs-r1"

const BLOCOS = [
  { id: "identificacao", nome: "Identificação da empresa" },
  { id: "perfil", nome: "Perfil do negócio" },
  { id: "panorama", nome: "Panorama empresarial" },
  { id: "objetivos", nome: "Objetivos e prioridades" },
]

// coluna da aba "Listas" (letra) -> índice 0-based
const COL = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7 }

// Linhas 11 (Nome do respondente) e 13 (Data do preenchimento) são omitidas de
// propósito: o contato vem da tela de boas-vindas e a data é gravada pelo servidor.
const CAMPOS = [
  { bloco: "identificacao", linha: 6, id: "razao-social", tipo: "texto", obrigatorio: true },
  { bloco: "identificacao", linha: 7, id: "nome-fantasia", tipo: "texto", obrigatorio: false },
  { bloco: "identificacao", linha: 8, id: "cnpj", tipo: "texto", obrigatorio: false },
  { bloco: "identificacao", linha: 9, id: "cidade-estado", tipo: "texto", obrigatorio: true },
  { bloco: "identificacao", linha: 10, id: "site", tipo: "texto", obrigatorio: false },
  { bloco: "identificacao", linha: 12, id: "cargo", tipo: "texto", obrigatorio: false },

  { bloco: "perfil", linha: 16, id: "segmento", tipo: "opcoes", lista: "B", obrigatorio: true },
  { bloco: "perfil", linha: 17, id: "produtos-servicos", tipo: "texto-longo", obrigatorio: false },
  { bloco: "perfil", linha: 18, id: "faturamento", tipo: "opcoes", lista: "C", obrigatorio: true },
  { bloco: "perfil", linha: 19, id: "funcionarios", tipo: "numero", obrigatorio: false },
  { bloco: "perfil", linha: 20, id: "clientes-ativos", tipo: "numero", obrigatorio: false },
  { bloco: "perfil", linha: 21, id: "mercado", tipo: "opcoes", lista: "D", obrigatorio: true },
  { bloco: "perfil", linha: 22, id: "tipo-cliente", tipo: "opcoes", lista: "E", obrigatorio: true },
  { bloco: "perfil", linha: 23, id: "tempo-atuacao", tipo: "numero", obrigatorio: false },
  { bloco: "perfil", linha: 24, id: "tendencia", tipo: "opcoes", lista: "H", obrigatorio: true },

  { bloco: "objetivos", linha: 51, id: "objetivo-1", tipo: "texto-longo", obrigatorio: true },
  { bloco: "objetivos", linha: 52, id: "objetivo-2", tipo: "texto-longo", obrigatorio: false },
  { bloco: "objetivos", linha: 53, id: "maior-dificuldade", tipo: "texto-longo", obrigatorio: true },
  { bloco: "objetivos", linha: 54, id: "area-melhoria", tipo: "texto", obrigatorio: false },
  { bloco: "objetivos", linha: 55, id: "impacto-esperado", tipo: "texto-longo", obrigatorio: false },
  { bloco: "objetivos", linha: 56, id: "prioridade", tipo: "opcoes", lista: "F", obrigatorio: true },
  { bloco: "objetivos", linha: 57, id: "horizonte", tipo: "opcoes", lista: "G", obrigatorio: true },
  { bloco: "objetivos", linha: 58, id: "observacao-final", tipo: "texto-longo", obrigatorio: false },
]

// Bloco 3: linhas 27..48, todas Sim/Parcialmente/Não/Não se aplica e obrigatórias.
const PANORAMA_PRIMEIRA = 27
const PANORAMA_ULTIMA = 48
for (let linha = PANORAMA_PRIMEIRA; linha <= PANORAMA_ULTIMA; linha++) {
  const n = String(linha - PANORAMA_PRIMEIRA + 1).padStart(2, "0")
  CAMPOS.push({ bloco: "panorama", linha, id: `panorama-${n}`, tipo: "opcoes", lista: "A", obrigatorio: true })
}

const wb = XLSX.read(readFileSync(ARQUIVO), { type: "buffer" })
const linhasDe = (aba) => XLSX.utils.sheet_to_json(wb.Sheets[aba], { header: 1, defval: "" })

// Listas suspensas: cada coluna da aba "Listas" é uma lista, com cabeçalho na linha 1.
const listasRows = linhasDe("Listas")
const listas = {}
for (const [letra, idx] of Object.entries(COL)) {
  const valores = listasRows
    .slice(1)
    .map((r) => String(r[idx] ?? "").trim())
    .filter((v) => v !== "")
  if (valores.length > 0) listas[letra] = valores
}

const vbsRows = linhasDe("02 - VBS")
const rotuloDaLinha = (linha) => String(vbsRows[linha - 1]?.[0] ?? "").trim()

const blocos = BLOCOS.map(({ id, nome }) => {
  const campos = CAMPOS.filter((c) => c.bloco === id).map((c) => {
    const rotulo = rotuloDaLinha(c.linha)
    if (!rotulo) throw new Error(`Linha ${c.linha} sem rótulo na aba "02 - VBS" (campo ${c.id})`)
    const campo = { id: c.id, rotulo, tipo: c.tipo, obrigatorio: c.obrigatorio }
    if (c.tipo === "opcoes") {
      const opcoes = listas[c.lista]
      if (!opcoes || opcoes.length === 0) throw new Error(`Lista "${c.lista}" vazia (campo ${c.id})`)
      campo.opcoes = opcoes
    }
    return campo
  })
  if (campos.length === 0) throw new Error(`Bloco ${id} sem campos`)
  const ids = new Set(campos.map((c) => c.id))
  if (ids.size !== campos.length) throw new Error(`Bloco ${id}: ids duplicados`)
  return { id, nome, campos }
})

const total = blocos.reduce((a, b) => a + b.campos.length, 0)
console.log(`Blocos: ${blocos.length} | Campos: ${total}`)
if (total !== 45) console.warn(`AVISO: esperado 45 campos, extraídos ${total} — confira a planilha.`)

const ts = `// GERADO por scripts/import-vbs.mjs — não editar à mão. Fonte: ${ARQUIVO.split(/[\\/]/).pop()}
export type VbsTipoCampo = "texto" | "texto-longo" | "numero" | "opcoes"
export type VbsCampo = {
  id: string
  rotulo: string
  tipo: VbsTipoCampo
  opcoes?: string[]
  obrigatorio: boolean
}
export type VbsBloco = { id: string; nome: string; campos: VbsCampo[] }

export const VBS_VERSAO = ${JSON.stringify(VERSAO)}
export const VBS_BLOCOS: VbsBloco[] = ${JSON.stringify(blocos, null, 2)}
`
writeFileSync("content/vbs.ts", ts)
console.log("content/vbs.ts gerado.")
