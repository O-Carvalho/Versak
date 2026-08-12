// Gera content/dme360.ts a partir da planilha DME360 Highlights.
// Uso: npm run dme360:import [-- caminho/para/arquivo.xlsx]
import { readFileSync, writeFileSync } from "node:fs"
import * as XLSX from "xlsx"

const ARQUIVO = process.argv[2] ?? "../DME360_7D HIGHLIGHTS_VERSAK.xlsx"
const VERSAO = "highlights-v1"

// aba da planilha -> { id estável, nome exibido, nome na aba Pesos }
const DIMENSOES = [
  { aba: "Governança e Cultura", id: "governanca", nome: "Governança e Cultura", pesoNome: "Governança" },
  { aba: "Estratégia", id: "estrategia", nome: "Estratégia", pesoNome: "Estratégia" },
  { aba: "Pessoas", id: "pessoas", nome: "Pessoas", pesoNome: "Pessoas" },
  { aba: "Comercial", id: "comercial", nome: "Comercial", pesoNome: "Comercial" },
  { aba: "Financeiro", id: "financeiro", nome: "Financeiro", pesoNome: "Financeiro" },
  { aba: "Operações", id: "operacoes", nome: "Operações", pesoNome: "Operações" },
  { aba: "Cliente", id: "cliente", nome: "Cliente", pesoNome: "Cliente" },
]
const SUBDIMENSOES_VALIDAS = new Set([
  "ESTRUTURA", "PROCESSOS", "INDICADORES", "PESSOAS", "TECNOLOGIA", "MELHORIA CONTÍNUA", "PERFORMANCE",
])

const wb = XLSX.read(readFileSync(ARQUIVO), { type: "buffer" })
const linhas = (aba) => XLSX.utils.sheet_to_json(wb.Sheets[aba], { header: 1, defval: "" })

// Pesos
const pesos = new Map()
for (const row of linhas("Pesos").slice(3)) {
  const [nome, peso] = [String(row[0]).trim(), Number(row[1])]
  if (nome && nome !== "Total" && Number.isFinite(peso)) pesos.set(nome, peso)
}
const somaPesos = [...pesos.values()].reduce((a, b) => a + b, 0)
if (Math.abs(somaPesos - 1) > 1e-9) throw new Error(`Pesos somam ${somaPesos}, esperado 1`)

// Escala (aba Instruções, linhas com nota 1..5)
const escala = []
for (const row of linhas("Instruções")) {
  const nota = Number(row[0])
  if (Number.isInteger(nota) && nota >= 1 && nota <= 5 && String(row[1]).trim()) {
    escala.push({ nota, rotulo: String(row[1]).trim(), descricao: String(row[2]).trim() })
  }
}
if (escala.length !== 5) throw new Error(`Escala com ${escala.length} itens, esperado 5`)

// Dimensões e questões
const dims = DIMENSOES.map(({ aba, id, nome, pesoNome }) => {
  const rows = linhas(aba)
  const descRaw = String(rows[1]?.[0] ?? "").trim().replace(/^"|"$/g, "")
  const descricao = descRaw.length > 20 ? descRaw : null
  const questoes = []
  for (const row of rows.slice(3)) {
    const numero = Number(row[0])
    const codigo = String(row[1]).trim()
    const subdimensao = String(row[2]).trim().toUpperCase()
    const pergunta = String(row[4]).trim()
    if (!Number.isInteger(numero) || !codigo || !pergunta) continue
    if (!SUBDIMENSOES_VALIDAS.has(subdimensao)) throw new Error(`Subdimensão desconhecida em ${aba}: "${subdimensao}"`)
    questoes.push({ codigo, subdimensao, pergunta })
  }
  if (questoes.length < 30) throw new Error(`${aba}: só ${questoes.length} questões extraídas`)
  const codigos = new Set(questoes.map((q) => q.codigo))
  if (codigos.size !== questoes.length) throw new Error(`${aba}: códigos duplicados`)
  const peso = pesos.get(pesoNome)
  if (!Number.isFinite(peso)) throw new Error(`Peso não encontrado para ${pesoNome}`)
  return { id, nome, descricao, peso, questoes }
})

const total = dims.reduce((a, d) => a + d.questoes.length, 0)
console.log(`Dimensões: ${dims.length} | Questões: ${total}`)
if (total !== 245) console.warn(`AVISO: esperado 245 questões, extraídas ${total} — confirme a planilha.`)

const ts = `// GERADO por scripts/import-dme360.mjs — não editar à mão. Fonte: ${ARQUIVO.split(/[\\/]/).pop()}
export type DmeQuestao = { codigo: string; subdimensao: string; pergunta: string }
export type DmeDimensao = { id: string; nome: string; descricao: string | null; peso: number; questoes: DmeQuestao[] }
export type DmeEscalaItem = { nota: number; rotulo: string; descricao: string }

export const DME360_VERSAO = ${JSON.stringify(VERSAO)}
export const DME360_ESCALA: DmeEscalaItem[] = ${JSON.stringify(escala, null, 2)}
export const DME360_DIMENSOES: DmeDimensao[] = ${JSON.stringify(dims, null, 2)}
`
writeFileSync("content/dme360.ts", ts)
console.log("content/dme360.ts gerado.")
