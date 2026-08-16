// Gera content/vbs.ts a partir da planilha VBS Rev. 2.0 (Versak Business Snapshot).
// Uso: npm run vbs:import [-- caminho/para/arquivo.xlsx]
//
// Diferente da Rev. 1, esta planilha já traz ID/Bloco/Ordem/Tipo por linha —
// não precisamos de uma tabela paralela de mapeamento por número de linha.
// Nome, e-mail, WhatsApp e empresa continuam vindos da tela de abertura (não
// geram campo aqui); Cargo e CNPJ viram campos pequenos nos blocos abaixo.
import { readFileSync, writeFileSync } from "node:fs"
import * as XLSX from "xlsx"

const ARQUIVO = process.argv[2] ?? "C:/Users/mathe/Downloads/BANCO DE PERGUNTAS — VBS REV. 2.0 (1).xlsx"
const VERSAO = "vbs-r2"
const CODIGO_EVENTO_PADRAO = "salto_2026_08_17"

// ID da planilha -> { bloco de destino, id do campo no nosso sistema, placeholder opcional }
// IDs ausentes daqui (SYS*, CON*, ID01/03/04, EMP01) são tratados fora do conteúdo gerado.
const MAPA_CAMPO = {
  ID02: { bloco: "identificacao", id: "cargo" },
  EMP02: { bloco: "empresa", id: "cnpj" },
  PER01: { bloco: "perfil", id: "municipio" },
  PER02: { bloco: "perfil", id: "segmento" },
  PER03: { bloco: "perfil", id: "funcionarios" },
  PER04: { bloco: "perfil", id: "faturamento" },
  PER05: { bloco: "perfil", id: "tempo-atuacao" },
  PER06: { bloco: "perfil", id: "cliente-predominante" },
  PER07: { bloco: "perfil", id: "momento-atual" },
  PER08: { bloco: "perfil", id: "contratacao" },
  AUT01: { bloco: "autopercepcao", id: "conhecimento" },
  CST01: { bloco: "custos", id: "custo-mensal" },
  CST02: { bloco: "custos", id: "faturamento-minimo" },
  MRG01: { bloco: "margem", id: "produtos-lucrativos" },
  MRG02: { bloco: "margem", id: "impacto-desconto" },
  CLI01: { bloco: "cliente", id: "motivo-escolha" },
  CLI02: { bloco: "cliente", id: "sinais-satisfacao" },
  EFI01: { bloco: "eficiencia", id: "gargalos" },
  EFI02: { bloco: "eficiencia", id: "capacidade" },
  DAD01: { bloco: "dados", id: "numeros-atualizados" },
  DAD02: { bloco: "dados", id: "rotina-decisao" },
  PRI01: { bloco: "prioridades", id: "barreiras" },
  PRI02: { bloco: "prioridades", id: "problema-90-dias", placeholder: "Até 400 caracteres" },
  PRI03: { bloco: "prioridades", id: "resultados-desejados" },
  PRI04: { bloco: "prioridades", id: "prazo" },
  PRI05: { bloco: "prioridades", id: "impacto" },
  PRI06: { bloco: "prioridades", id: "disponibilidade" },
  PRI07: { bloco: "prioridades", id: "apoio" },
}

// Campos opcionais (todo o resto do MAPA_CAMPO é obrigatório).
const OPCIONAIS = new Set(["PER01", "EMP02"])

const NOME_BLOCO = {
  identificacao: "Identificação",
  empresa: "Empresa",
  perfil: "Perfil",
  autopercepcao: "Autopercepção",
  custos: "1. Custos",
  margem: "2. Margem",
  cliente: "3. Cliente",
  eficiencia: "4. Eficiência",
  dados: "5. Dados",
  prioridades: "Prioridades",
}
const ORDEM_BLOCOS = Object.keys(NOME_BLOCO)

const TIPO_PLANILHA_PARA_CAMPO = {
  lista: "opcoes",
  "texto curto": "texto",
  texto: "texto",
  CNPJ: "texto",
  "texto longo": "texto-longo",
  "múltipla escolha": "multipla-escolha",
  "escala 0–10": "escala",
  "escala VBS - lista": "opcoes",
}

const wb = XLSX.read(readFileSync(ARQUIVO), { type: "buffer" })
const linhas = XLSX.utils.sheet_to_json(wb.Sheets["Planilha1"], { header: 1, defval: "" })

// Consentimentos: CON01 vira o texto do checkbox principal; CON02/CON03 viram
// consentimentosExtras. Código do evento vem de SYS02 (com fallback fixo).
let consentimentoTexto = null
const consentimentosExtras = []
let codigoEvento = CODIGO_EVENTO_PADRAO

const camposPorBloco = new Map(ORDEM_BLOCOS.map((id) => [id, []]))

for (const row of linhas.slice(2)) {
  const [, id, , , pergunta, tipoPlanilha, opcoesTexto] = row
  const idStr = String(id ?? "").trim()
  if (!idStr) continue
  const perguntaStr = String(pergunta ?? "").trim()

  if (idStr === "SYS02") {
    const valor = String(opcoesTexto ?? "").trim()
    if (valor) codigoEvento = valor
    continue
  }
  if (idStr === "CON01") {
    consentimentoTexto = perguntaStr
    continue
  }
  if (idStr === "CON02") {
    consentimentosExtras.push({ chave: "anonimo", texto: perguntaStr, obrigatorio: true })
    continue
  }
  if (idStr === "CON03") {
    consentimentosExtras.push({ chave: "contato", texto: perguntaStr, obrigatorio: true })
    continue
  }

  const destino = MAPA_CAMPO[idStr]
  if (!destino) continue // SYS01, ID01/03/04, EMP01: tratados na abertura, sem campo gerado.

  const tipoCampo = TIPO_PLANILHA_PARA_CAMPO[String(tipoPlanilha ?? "").trim()]
  if (!tipoCampo) throw new Error(`Tipo desconhecido "${tipoPlanilha}" no campo ${idStr}`)
  if (!perguntaStr) throw new Error(`Pergunta vazia no campo ${idStr}`)

  const campo = {
    id: destino.id,
    rotulo: perguntaStr,
    tipo: tipoCampo,
    obrigatorio: !OPCIONAIS.has(idStr),
  }
  if (destino.placeholder) campo.placeholder = destino.placeholder

  if (idStr === "AUT01") {
    campo.opcoes = Array.from({ length: 11 }, (_, n) => String(n))
  } else if (tipoCampo === "opcoes" || tipoCampo === "multipla-escolha") {
    const opcoes = String(opcoesTexto ?? "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
    if (opcoes.length === 0) throw new Error(`Sem opções para o campo ${idStr}`)
    campo.opcoes = opcoes
  }

  const lista = camposPorBloco.get(destino.bloco)
  if (!lista) throw new Error(`Bloco desconhecido "${destino.bloco}" (campo ${idStr})`)
  lista.push(campo)
}

if (!consentimentoTexto) throw new Error("CON01 não encontrado na planilha")
if (consentimentosExtras.length !== 2) throw new Error(`Esperados 2 consentimentos extras, achei ${consentimentosExtras.length}`)

const blocos = ORDEM_BLOCOS.map((id) => {
  const campos = camposPorBloco.get(id) ?? []
  if (campos.length === 0) throw new Error(`Bloco ${id} sem campos`)
  const ids = new Set(campos.map((c) => c.id))
  if (ids.size !== campos.length) throw new Error(`Bloco ${id}: ids duplicados`)
  return { id, nome: NOME_BLOCO[id], campos }
})

const total = blocos.reduce((a, b) => a + b.campos.length, 0)
console.log(`Blocos: ${blocos.length} | Campos: ${total} | Código do evento: ${codigoEvento}`)

const ts = `// GERADO por scripts/import-vbs.mjs — não editar à mão. Fonte: ${ARQUIVO.split(/[\\/]/).pop()}
export type VbsTipoCampo = "texto" | "texto-longo" | "numero" | "opcoes" | "escala" | "multipla-escolha"
export type VbsCampo = {
  id: string
  rotulo: string
  tipo: VbsTipoCampo
  opcoes?: string[]
  obrigatorio: boolean
  placeholder?: string
}
export type VbsBloco = { id: string; nome: string; campos: VbsCampo[] }
export type VbsConsentimentoExtra = { chave: "anonimo" | "contato"; texto: string; obrigatorio: boolean }

export const VBS_VERSAO = ${JSON.stringify(VERSAO)}
export const VBS_CODIGO_EVENTO = ${JSON.stringify(codigoEvento)}
export const VBS_CONSENTIMENTO_TEXTO = ${JSON.stringify(consentimentoTexto)}
export const VBS_CONSENTIMENTOS_EXTRAS: VbsConsentimentoExtra[] = ${JSON.stringify(consentimentosExtras, null, 2)}
export const VBS_BLOCOS: VbsBloco[] = ${JSON.stringify(blocos, null, 2)}
`
writeFileSync("content/vbs.ts", ts)
console.log("content/vbs.ts gerado.")
