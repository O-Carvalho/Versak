# VBS + casca de wizard compartilhada — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar `/vbs` (ficha Versak Business Snapshot, 45 campos, 4 blocos) sobre uma casca de wizard reutilizável fiel ao protótipo aprovado pelo Victor, e em seguida migrar o `/dme360` já existente para a mesma casca.

**Architecture:** Um modelo único (`Questionario` → `Etapa` → `Campo`) descreve os dois instrumentos. Conteúdo gerado de xlsx por script (`content/vbs.ts`, `content/dme360.ts` já existe), adaptadores puros convertem cada conteúdo para o modelo, e uma casca client (`components/wizard/`) renderiza qualquer `Questionario` com trilho, anel de progresso, dropdown de etapas, autosave e "salvar e sair". Cada instrumento tem sua rota, sua API e sua tabela.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind v4 + `theme/tokens.css`; deps existentes: `zod`, `xlsx` (dev), `tsx` (dev). Nenhuma dependência nova.

## Global Constraints

- Sem framework de testes no repo: validação por task = `npx tsc --noEmit` + `npx eslint .` + `npm run build` + checagem manual descrita. Adaptadores têm script próprio (`npm run vbs:verify`).
- **Nenhuma cor hardcoded fora de `theme/tokens.css`** — componentes usam classes `.wz-*` definidas lá + utilitários Tailwind de `--color-*`.
- Chave de resposta: `"<etapaId>:<campoId>"` (ex.: `"perfil:segmento"`, `"governanca:S1.1"`). Vale para os dois instrumentos.
- Respostas: `Record<string, string | number>`. Campos `escala` guardam **número**; todos os outros guardam **string**.
- Progresso e bloqueio de avanço contam **apenas campos obrigatórios**.
- Segredos só no servidor: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `DME360_EMAIL_TO`, `DME360_EMAIL_FROM` — nunca importados em componente client, nunca commitados.
- Gravar no banco **antes** de tentar e-mail; falha de e-mail não falha a requisição (`email_enviado=false`). `AbortSignal.timeout(5000)` em toda chamada externa; `export const maxDuration = 10` em todo route handler.
- `tsconfig` tem `noUncheckedIndexedAccess: true` — indexações por variável usam `?? fallback` ou narrowing.
- Node do usuário: v24. Excel do VBS: `C:\Users\mathe\Downloads\VBS_Versak_Ficha Cadastral (1).xlsx`.
- Branch de trabalho: `dme360` (já contém spec, plano e as 5 tasks do DME360). Rodar comandos na raiz do repo. Se `npm run build` falhar com `EINVAL readlink .next/...` (artefato OneDrive): `rm -rf .next` e repetir.
- Fontes Oswald (`font-display`) e Inter (`font-body`) já carregadas no root layout — não adicionar `<link>` de fonte.

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `scripts/import-vbs.mjs` | Lê o xlsx do VBS e **gera** `content/vbs.ts` |
| `content/vbs.ts` | Gerado e commitado: 4 blocos, 45 campos, listas |
| `lib/wizard-types.ts` | Tipos do modelo compartilhado |
| `lib/wizard-progress.ts` | Funções puras de progresso/completude |
| `lib/vbs-questionario.ts` | Adaptador: `VBS_BLOCOS` → `Questionario` |
| `lib/dme360-questionario.ts` | Adaptador: `DME360_DIMENSOES` → `Questionario` (Fase B) |
| `scripts/verify-vbs.ts` | Verificação do conteúdo + adaptador |
| `components/wizard/use-wizard-draft.ts` | Autosave versionado em localStorage |
| `components/wizard/progress-ring.tsx` | Anel SVG de progresso |
| `components/wizard/etapa-dropdown.tsx` | Navegação entre etapas |
| `components/wizard/campo-input.tsx` | Renderiza um campo conforme o tipo |
| `components/wizard/wizard-rail.tsx` | Trilho lateral completo |
| `components/wizard/wizard.tsx` | Orquestra telas, estado, autosave, envio |
| `app/vbs/page.tsx` | Página `/vbs` |
| `app/api/vbs/route.ts` | Recebe, valida, grava, envia e-mail |
| `lib/vbs-email.ts` | Monta o e-mail-resumo da ficha |

---

### Task 1: Importar o VBS do Excel → `content/vbs.ts`

**Files:**
- Create: `scripts/import-vbs.mjs`
- Create: `content/vbs.ts` (gerado pelo script, commitado)
- Modify: `package.json` (script `vbs:import`)

**Interfaces:**
- Produces (consumido pela Task 2):
  - Tipos: `VbsTipoCampo = "texto" | "texto-longo" | "numero" | "opcoes"`, `VbsCampo { id: string; rotulo: string; tipo: VbsTipoCampo; opcoes?: string[]; obrigatorio: boolean }`, `VbsBloco { id: string; nome: string; campos: VbsCampo[] }`.
  - Constantes: `VBS_VERSAO = "vbs-r1"`, `VBS_BLOCOS: VbsBloco[]` (4 blocos, 45 campos no total).

- [ ] **Step 1: Registrar o npm script**

Em `package.json` → `"scripts"`, adicionar após `"dme360:verify"`:

```json
"vbs:import": "node scripts/import-vbs.mjs"
```

- [ ] **Step 2: Criar `scripts/import-vbs.mjs`**

```js
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
```

- [ ] **Step 3: Rodar e conferir**

Run: `npm run vbs:import`
Expected: `Blocos: 4 | Campos: 45` e o arquivo gerado, **sem** a linha de AVISO.

Conferir por amostragem em `content/vbs.ts`:
- `identificacao` tem 6 campos e o primeiro é `razao-social` com rótulo `"Razão social"`.
- `perfil` tem 9 campos; `segmento` tem 10 opções e a primeira é `"Indústria Seriada"`.
- `panorama` tem 22 campos; `panorama-01` tem rótulo `"A empresa possui missão, visão e valores definidos?"` e opções `["Sim","Parcialmente","Não","Não se aplica"]`.
- `objetivos` tem 8 campos; `horizonte` tem 5 opções e a primeira é `"Até 3 meses"`.

- [ ] **Step 4: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint scripts/import-vbs.mjs content/vbs.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json scripts/import-vbs.mjs content/vbs.ts
git commit -m "feat: import VBS questionnaire from Excel into generated content module"
```

---

### Task 2: Modelo compartilhado + adaptador do VBS + verificação

**Files:**
- Create: `lib/wizard-types.ts`
- Create: `lib/wizard-progress.ts`
- Create: `lib/vbs-questionario.ts`
- Create: `scripts/verify-vbs.ts`
- Modify: `package.json` (script `vbs:verify`)

**Interfaces:**
- Consumes: `VBS_BLOCOS`, `VBS_VERSAO` de `content/vbs.ts` (Task 1) — import **relativo** (`../content/vbs`) para o script rodar via tsx.
- Produces (consumido pelas Tasks 4, 5 e 6):

```ts
// lib/wizard-types.ts
export type CampoOpcao = { valor: string | number; rotulo: string; legenda?: string; descricao?: string }
export type CampoTipo = "texto" | "texto-longo" | "numero" | "opcoes" | "escala"
export type Campo = {
  chave: string
  rotulo: string
  tipo: CampoTipo
  opcoes?: CampoOpcao[]
  obrigatorio: boolean
  grupo?: string
  placeholder?: string
}
export type Etapa = { id: string; nome: string; descricao?: string | null; campos: Campo[] }
export type Questionario = {
  id: string
  versao: string
  rotuloEtapa: string
  tempoEstimado: string
  etapas: Etapa[]
}
export type Respostas = Record<string, string | number>
export type WizardLead = { nome: string; empresa: string; email: string; whatsapp: string; consentimento: boolean }

// lib/wizard-progress.ts
export function respondido(valor: string | number | undefined): boolean
export function camposObrigatorios(etapa: Etapa): Campo[]
export function faltamNaEtapa(etapa: Etapa, respostas: Respostas): number
export function etapaCompleta(etapa: Etapa, respostas: Respostas): boolean
export function progressoObrigatorio(q: Questionario, respostas: Respostas): { respondidos: number; total: number; pct: number }
export function gruposDaEtapa(etapa: Etapa): { grupo: string | null; campos: Campo[] }[]

// lib/vbs-questionario.ts
export const VBS_QUESTIONARIO: Questionario
```

- [ ] **Step 1: Registrar o npm script**

Em `package.json` → `"scripts"`, adicionar após `"vbs:import"`:

```json
"vbs:verify": "tsx scripts/verify-vbs.ts"
```

- [ ] **Step 2: Criar `lib/wizard-types.ts`**

```ts
// Modelo único que descreve qualquer questionário da Versak (VBS, DME 360).
// A casca do wizard só conhece estes tipos — nunca o conteúdo específico.

export type CampoOpcao = {
  valor: string | number
  rotulo: string // texto principal do botão (número, na escala)
  legenda?: string // texto pequeno sob o rótulo (rótulo de maturidade, na escala)
  descricao?: string // tooltip
}

export type CampoTipo = "texto" | "texto-longo" | "numero" | "opcoes" | "escala"

export type Campo = {
  chave: string // "<etapaId>:<campoId>"
  rotulo: string
  tipo: CampoTipo
  opcoes?: CampoOpcao[] // obrigatório quando tipo é "opcoes" ou "escala"
  obrigatorio: boolean
  grupo?: string // subdivisão dentro da etapa (subdimensão, no DME 360)
  placeholder?: string
}

export type Etapa = {
  id: string
  nome: string
  descricao?: string | null
  campos: Campo[]
}

export type Questionario = {
  id: string // "vbs" | "dme360"
  versao: string
  rotuloEtapa: string // "Bloco" | "Dimensão"
  tempoEstimado: string // "5 a 10 minutos"
  etapas: Etapa[]
}

export type Respostas = Record<string, string | number>

export type WizardLead = {
  nome: string
  empresa: string
  email: string
  whatsapp: string
  consentimento: boolean
}
```

- [ ] **Step 3: Criar `lib/wizard-progress.ts`**

```ts
import type { Campo, Etapa, Questionario, Respostas } from "./wizard-types"

/** Uma resposta conta como dada quando não é undefined nem string vazia. */
export function respondido(valor: string | number | undefined): boolean {
  if (valor === undefined) return false
  if (typeof valor === "string") return valor.trim() !== ""
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
```

- [ ] **Step 4: Criar `lib/vbs-questionario.ts`**

```ts
import { VBS_BLOCOS, VBS_VERSAO } from "../content/vbs"
import type { Campo, Etapa, Questionario } from "./wizard-types"

export const VBS_QUESTIONARIO: Questionario = {
  id: "vbs",
  versao: VBS_VERSAO,
  rotuloEtapa: "Bloco",
  tempoEstimado: "5 a 10 minutos",
  etapas: VBS_BLOCOS.map(
    (bloco): Etapa => ({
      id: bloco.id,
      nome: bloco.nome,
      descricao: null,
      campos: bloco.campos.map(
        (campo): Campo => ({
          chave: `${bloco.id}:${campo.id}`,
          rotulo: campo.rotulo,
          tipo: campo.tipo,
          opcoes: campo.opcoes?.map((o) => ({ valor: o, rotulo: o })),
          obrigatorio: campo.obrigatorio,
        }),
      ),
    }),
  ),
}
```

- [ ] **Step 5: Criar `scripts/verify-vbs.ts`**

```ts
import { VBS_QUESTIONARIO } from "../lib/vbs-questionario"
import { etapaCompleta, faltamNaEtapa, progressoObrigatorio, respondido } from "../lib/wizard-progress"
import type { Respostas } from "../lib/wizard-types"

let falhas = 0
function espera(nome: string, cond: boolean, detalhe = "") {
  if (cond) console.log(`OK  ${nome}`)
  else {
    falhas++
    console.error(`ERRO ${nome} ${detalhe}`)
  }
}

const q = VBS_QUESTIONARIO
const todosCampos = q.etapas.flatMap((e) => e.campos)

espera("4 etapas", q.etapas.length === 4, String(q.etapas.length))
espera("45 campos", todosCampos.length === 45, String(todosCampos.length))
espera("versao vbs-r1", q.versao === "vbs-r1", q.versao)

const panorama = q.etapas.find((e) => e.id === "panorama")
espera("panorama existe", panorama !== undefined)
espera("panorama tem 22 campos", panorama?.campos.length === 22, String(panorama?.campos.length))
espera(
  "panorama todo obrigatório com 4 opções",
  panorama !== undefined &&
    panorama.campos.every((c) => c.obrigatorio && c.tipo === "opcoes" && c.opcoes?.length === 4),
)

espera(
  "todo campo de opções tem opções não vazias",
  todosCampos.filter((c) => c.tipo === "opcoes").every((c) => (c.opcoes?.length ?? 0) > 0),
)
espera(
  "nenhum campo de texto tem opções",
  todosCampos.filter((c) => c.tipo !== "opcoes" && c.tipo !== "escala").every((c) => c.opcoes === undefined),
)

const chaves = new Set(todosCampos.map((c) => c.chave))
espera("chaves únicas", chaves.size === todosCampos.length, `${chaves.size} de ${todosCampos.length}`)
espera(
  "toda chave no formato etapa:campo",
  todosCampos.every((c) => /^[a-z0-9-]+:[a-z0-9-]+$/.test(c.chave)),
)

// 2 (bloco 1) + 5 (bloco 2) + 22 (bloco 3) + 4 (bloco 4) = 33
const obrigatorios = todosCampos.filter((c) => c.obrigatorio)
espera("33 campos obrigatórios", obrigatorios.length === 33, String(obrigatorios.length))

// respondido()
espera("respondido('') = false", respondido("") === false)
espera("respondido('  ') = false", respondido("  ") === false)
espera("respondido(undefined) = false", respondido(undefined) === false)
espera("respondido(0) = true", respondido(0) === true)
espera("respondido('Sim') = true", respondido("Sim") === true)

// Progresso: vazio -> 0%, tudo preenchido -> 100%
const vazio: Respostas = {}
const p0 = progressoObrigatorio(q, vazio)
espera("progresso vazio = 0%", p0.pct === 0 && p0.respondidos === 0, JSON.stringify(p0))
espera("total do progresso = nº de obrigatórios", p0.total === obrigatorios.length, String(p0.total))

const cheio: Respostas = {}
for (const c of obrigatorios) cheio[c.chave] = c.opcoes?.[0]?.valor ?? "preenchido"
const p1 = progressoObrigatorio(q, cheio)
espera("progresso cheio = 100%", p1.pct === 100, JSON.stringify(p1))
espera(
  "todas as etapas completas com obrigatórios preenchidos",
  q.etapas.every((e) => etapaCompleta(e, cheio)),
)

// Uma etapa fica incompleta ao remover um obrigatório
const primeiraObrigatoria = obrigatorios[0]
if (primeiraObrigatoria) {
  const parcial: Respostas = { ...cheio }
  delete parcial[primeiraObrigatoria.chave]
  const etapaDoCampo = q.etapas.find((e) => e.campos.some((c) => c.chave === primeiraObrigatoria.chave))
  espera(
    "remover 1 obrigatório deixa a etapa incompleta",
    etapaDoCampo !== undefined && faltamNaEtapa(etapaDoCampo, parcial) === 1,
  )
}

if (falhas > 0) {
  console.error(`\n${falhas} verificação(ões) falharam`)
  process.exit(1)
}
console.log("\nQuestionário VBS verificado.")
```

- [ ] **Step 6: Rodar verificação, tipos e lint**

Run: `npm run vbs:verify && npx tsc --noEmit && npx eslint lib scripts/verify-vbs.ts`
Expected: todas as linhas `OK`, exit 0, tsc/eslint limpos.

Se alguma contagem falhar, **não altere o número esperado no script para fechar a conta** — a divergência significa que a tabela `CAMPOS` da Task 1 saiu diferente do combinado. Confira a tabela, corrija a origem e rode de novo.

- [ ] **Step 7: Commit**

```bash
git add package.json lib/wizard-types.ts lib/wizard-progress.ts lib/vbs-questionario.ts scripts/verify-vbs.ts
git commit -m "feat: add shared wizard model, progress helpers and VBS questionnaire adapter"
```

---

### Task 3: Estilos `.wz-*` em `theme/tokens.css`

**Files:**
- Modify: `theme/tokens.css` (3 tokens novos no bloco `@theme` + bloco de classes no final)

**Interfaces:**
- Produces (consumido pelas Tasks 4 e 6): tokens `--color-rail`, `--color-line-soft`, `--color-danger`; classes `.wz-ambient`, `.wz-ghost-ring`, `.wz-card`, `.wz-eyebrow`, `.wz-input`, `.wz-btn-gold`, `.wz-btn-ghost`, `.wz-rail`, `.wz-ring-bg`, `.wz-ring-fg`, `.wz-dd-toggle`, `.wz-dd-panel`, `.wz-dd-panel-aberto`, `.wz-dd-item`, `.wz-dd-item-atual`, `.wz-dd-idx`, `.wz-dd-idx-feito`, `.wz-dd-idx-atual`, `.wz-qcard`, `.wz-opt`, `.wz-opt-escala`, `.wz-opt-ativa`, `.wz-erro`.

- [ ] **Step 1: Acrescentar os 3 tokens dentro do bloco `@theme`**

Em `theme/tokens.css`, logo após a linha `--color-line: #332b1e;`, inserir:

```css
  --color-line-soft: #211b12;
  --color-rail: #100d08;
  --color-danger: #c0644a;
```

- [ ] **Step 2: Acrescentar o bloco de classes ao final de `theme/tokens.css`**

```css
/* ---- Wizard: casca compartilhada (VBS e DME 360) ---- */
.wz-ambient {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse 1100px 700px at 8% -15%, rgba(232, 169, 62, 0.1), transparent 55%),
    radial-gradient(ellipse 900px 700px at 105% 115%, rgba(232, 169, 62, 0.07), transparent 55%),
    var(--color-bg);
}
.wz-ambient::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image:
    linear-gradient(var(--color-line-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-line-soft) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 900px 600px at 20% 20%, black, transparent 70%);
}
.wz-ghost-ring {
  position: absolute;
  right: -160px;
  top: 50%;
  transform: translateY(-50%);
  width: 640px;
  height: 640px;
  border-radius: 50%;
  border: 1px solid rgba(232, 169, 62, 0.1);
  pointer-events: none;
}
.wz-ghost-ring::before {
  content: "";
  position: absolute;
  inset: 60px;
  border-radius: 50%;
  border: 1px solid rgba(232, 169, 62, 0.08);
}
.wz-card {
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  border-radius: 6px;
  padding: 44px;
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.5);
}
.wz-eyebrow {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-gold);
  display: flex;
  align-items: center;
  gap: 9px;
}
.wz-eyebrow::before {
  content: "";
  width: 18px;
  height: 1px;
  background: var(--color-gold);
}
.wz-input {
  width: 100%;
  background: var(--color-rail);
  border: 1px solid var(--color-line);
  border-radius: 3px;
  color: var(--color-text);
  font-size: 15px;
  padding: 13px 15px;
  transition: border-color 0.15s;
}
.wz-input:focus {
  outline: none;
  border-color: var(--color-gold);
}
.wz-input::placeholder {
  color: var(--color-text-dim);
}
.wz-btn-gold,
.wz-btn-ghost {
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 15px 30px;
  border-radius: 3px;
  cursor: pointer;
  border: none;
  transition: 0.15s;
}
.wz-btn-gold {
  background: var(--color-gold);
  color: var(--color-bg);
  font-weight: 600;
}
.wz-btn-gold:hover:not(:disabled) {
  background: var(--color-gold-bright);
  transform: translateY(-1px);
}
.wz-btn-gold:disabled {
  background: var(--color-line);
  color: var(--color-text-dim);
  cursor: not-allowed;
  transform: none;
}
.wz-btn-ghost {
  background: transparent;
  border: 1px solid var(--color-line);
  color: var(--color-text-muted);
}
.wz-btn-ghost:hover:not(:disabled) {
  border-color: var(--color-gold-dim);
  color: var(--color-text);
}
.wz-btn-ghost:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.wz-rail {
  background: var(--color-rail);
  border-right: 1px solid var(--color-line);
  background-image: radial-gradient(ellipse 500px 400px at 30% 0%, rgba(232, 169, 62, 0.08), transparent 60%);
}
.wz-ring-bg {
  fill: none;
  stroke: var(--color-line);
  stroke-width: 4;
}
.wz-ring-fg {
  fill: none;
  stroke: var(--color-gold);
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.wz-dd-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--color-panel-raised);
  border: 1px solid var(--color-line);
  border-radius: 5px;
  padding: 13px 14px;
  cursor: pointer;
  transition: border-color 0.15s;
  color: var(--color-text);
  text-align: left;
}
.wz-dd-toggle:hover {
  border-color: var(--color-gold-dim);
}
.wz-dd-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 8px);
  background: var(--color-panel-raised);
  border: 1px solid var(--color-line);
  border-radius: 5px;
  overflow: hidden;
  z-index: 20;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.6);
  max-height: 0;
  opacity: 0;
  pointer-events: none;
  transition: 0.18s ease;
}
.wz-dd-panel-aberto {
  max-height: 340px;
  opacity: 1;
  pointer-events: auto;
  overflow-y: auto;
}
.wz-dd-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.1s;
  border-top: 1px solid var(--color-line-soft);
  color: var(--color-text-dim);
  font-size: 13px;
  width: 100%;
  text-align: left;
  background: transparent;
}
.wz-dd-item:first-child {
  border-top: none;
}
.wz-dd-item:hover {
  background: var(--color-rail);
}
.wz-dd-item-atual {
  color: var(--color-text);
  background: var(--color-rail);
}
.wz-dd-idx {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid var(--color-line);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 10px;
  flex-shrink: 0;
}
.wz-dd-idx-feito {
  background: var(--color-gold-dim);
  border-color: var(--color-gold-dim);
  color: var(--color-bg);
}
.wz-dd-idx-atual {
  background: var(--color-gold);
  border-color: var(--color-gold);
  color: var(--color-bg);
}
.wz-qcard {
  border-top: 1px solid var(--color-line-soft);
  padding: 30px 0;
}
.wz-qcard:first-of-type {
  border-top: none;
  padding-top: 0;
}
.wz-opt {
  text-align: center;
  padding: 13px 12px;
  border: 1px solid var(--color-line);
  border-radius: 4px;
  cursor: pointer;
  transition: 0.12s;
  background: var(--color-panel);
  color: var(--color-text-muted);
  font-size: 13.5px;
}
.wz-opt:hover {
  border-color: var(--color-gold-dim);
  color: var(--color-text);
  transform: translateY(-1px);
}
.wz-opt-escala {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 14px 4px;
}
.wz-opt-ativa {
  background: var(--color-gold);
  border-color: var(--color-gold);
  color: var(--color-bg);
}
.wz-erro {
  color: var(--color-danger);
  font-size: 13px;
}
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit && npx eslint . && npm run build`
Expected: limpos (classes ainda sem uso).

- [ ] **Step 4: Commit**

```bash
git add theme/tokens.css
git commit -m "feat: add shared wizard shell styles to theme"
```

---

### Task 4: Casca do wizard + página `/vbs` navegável

**Files:**
- Create: `components/wizard/use-wizard-draft.ts`
- Create: `components/wizard/progress-ring.tsx`
- Create: `components/wizard/etapa-dropdown.tsx`
- Create: `components/wizard/campo-input.tsx`
- Create: `components/wizard/wizard-rail.tsx`
- Create: `components/wizard/wizard.tsx`
- Create: `app/vbs/page.tsx`

**Interfaces:**
- Consumes: `Questionario`, `Etapa`, `Campo`, `Respostas`, `WizardLead` de `@/lib/wizard-types`; `respondido`, `faltamNaEtapa`, `etapaCompleta`, `progressoObrigatorio`, `gruposDaEtapa` de `@/lib/wizard-progress`; `VBS_QUESTIONARIO` de `@/lib/vbs-questionario`; classes `.wz-*` (Task 3).
- Produces (consumido pelas Tasks 5 e 6):

```tsx
// components/wizard/wizard.tsx
export type WizardEnvioDados = {
  lead: WizardLead
  respostas: Respostas
  duracaoSegundos: number
  origem: string
}
export type WizardProps<TResultado> = {
  questionario: Questionario
  titulo: string
  aberturaTitulo: string
  aberturaTexto: string
  onEnviar: (dados: WizardEnvioDados) => Promise<TResultado>
  telaFinal: (resultado: TResultado) => React.ReactNode
}
export function Wizard<TResultado>(props: WizardProps<TResultado>): React.ReactElement | null
```

- [ ] **Step 1: Criar `components/wizard/use-wizard-draft.ts`**

```ts
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
```

- [ ] **Step 2: Criar `components/wizard/progress-ring.tsx`**

```tsx
const RAIO = 60
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

export function ProgressRing({ pct, className = "" }: { pct: number; className?: string }) {
  const offset = CIRCUNFERENCIA - (CIRCUNFERENCIA * pct) / 100
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90">
        <circle className="wz-ring-bg" cx="66" cy="66" r={RAIO} />
        <circle
          className="wz-ring-fg"
          cx="66"
          cy="66"
          r={RAIO}
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-semibold leading-none sm:text-3xl">{pct}%</span>
        <span className="mt-1 hidden text-[9.5px] uppercase tracking-[0.1em] text-text-dim sm:block">Completo</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Criar `components/wizard/etapa-dropdown.tsx`**

```tsx
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
```

- [ ] **Step 4: Criar `components/wizard/campo-input.tsx`**

```tsx
"use client"

import type { Campo } from "@/lib/wizard-types"

type Props = {
  campo: Campo
  valor: string | number | undefined
  onChange: (valor: string | number) => void
}

export function CampoInput({ campo, valor, onChange }: Props) {
  if (campo.tipo === "escala" || campo.tipo === "opcoes") {
    const escala = campo.tipo === "escala"
    const opcoes = campo.opcoes ?? []
    return (
      <div className={escala ? "grid grid-cols-5 gap-2" : "flex flex-wrap gap-2"}>
        {opcoes.map((opcao) => {
          const ativa = valor === opcao.valor
          return (
            <button
              key={String(opcao.valor)}
              type="button"
              title={opcao.descricao}
              onClick={() => onChange(opcao.valor)}
              className={`wz-opt ${escala ? "wz-opt-escala" : ""} ${ativa ? "wz-opt-ativa" : ""}`}
            >
              <span className={escala ? "font-display text-lg font-semibold" : ""}>{opcao.rotulo}</span>
              {opcao.legenda && <span className="hidden text-[10px] sm:block">{opcao.legenda}</span>}
            </button>
          )
        })}
      </div>
    )
  }

  if (campo.tipo === "texto-longo") {
    return (
      <textarea
        className="wz-input"
        rows={3}
        value={String(valor ?? "")}
        placeholder={campo.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  return (
    <input
      type={campo.tipo === "numero" ? "number" : "text"}
      className="wz-input"
      value={String(valor ?? "")}
      placeholder={campo.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
```

- [ ] **Step 5: Criar `components/wizard/wizard-rail.tsx`**

```tsx
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
```

- [ ] **Step 6: Criar `components/wizard/wizard.tsx`**

```tsx
"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { CampoInput } from "./campo-input"
import { EtapaDropdown } from "./etapa-dropdown"
import { useWizardDraft, type WizardTela } from "./use-wizard-draft"
import { WizardRail } from "./wizard-rail"
import { etapaCompleta, faltamNaEtapa, gruposDaEtapa, progressoObrigatorio } from "@/lib/wizard-progress"
import type { Questionario, Respostas, WizardLead } from "@/lib/wizard-types"

export type WizardEnvioDados = {
  lead: WizardLead
  respostas: Respostas
  duracaoSegundos: number
  origem: string
}

export type WizardProps<TResultado> = {
  questionario: Questionario
  titulo: string
  aberturaTitulo: string
  aberturaTexto: string
  onEnviar: (dados: WizardEnvioDados) => Promise<TResultado>
  telaFinal: (resultado: TResultado) => ReactNode
}

const LEAD_VAZIO: WizardLead = { nome: "", empresa: "", email: "", whatsapp: "", consentimento: false }

export function Wizard<TResultado>({
  questionario,
  titulo,
  aberturaTitulo,
  aberturaTexto,
  onEnviar,
  telaFinal,
}: WizardProps<TResultado>) {
  const { pronto, inicial, salvar, limpar } = useWizardDraft(questionario.id, questionario.versao)

  const [tela, setTela] = useState<WizardTela>("abertura")
  const [etapaAtual, setEtapaAtual] = useState(0)
  const [lead, setLead] = useState<WizardLead>(LEAD_VAZIO)
  const [respostas, setRespostas] = useState<Respostas>({})
  const [iniciadoEm, setIniciadoEm] = useState(() => Date.now())
  const [retomado, setRetomado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [resultado, setResultado] = useState<TResultado | null>(null)
  const origemRef = useRef("link")

  // Carrega rascunho e origem uma única vez.
  useEffect(() => {
    if (!pronto) return
    if (inicial) {
      setTela(inicial.tela === "concluido" ? "questionario" : inicial.tela)
      setEtapaAtual(inicial.etapaAtual)
      setLead(inicial.lead)
      setRespostas(inicial.respostas)
      setIniciadoEm(inicial.iniciadoEm)
      if (Object.keys(inicial.respostas).length > 0) setRetomado(true)
    }
    const origem = new URLSearchParams(window.location.search).get("o")
    if (origem) origemRef.current = origem.slice(0, 50)
  }, [pronto, inicial])

  // Autosave a cada mudança relevante (não persiste a tela final).
  useEffect(() => {
    if (!pronto || resultado) return
    salvar({ versao: questionario.versao, tela, etapaAtual, lead, respostas, iniciadoEm })
  }, [pronto, resultado, salvar, questionario.versao, tela, etapaAtual, lead, respostas, iniciadoEm])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [etapaAtual, tela])

  const progresso = useMemo(() => progressoObrigatorio(questionario, respostas), [questionario, respostas])
  const etapa = questionario.etapas[etapaAtual]
  const faltam = etapa ? faltamNaEtapa(etapa, respostas) : 0
  const ultimaEtapa = etapaAtual === questionario.etapas.length - 1
  const tudoCompleto = questionario.etapas.every((e) => etapaCompleta(e, respostas))

  const leadValido =
    lead.nome.trim().length >= 2 &&
    lead.empresa.trim().length >= 2 &&
    /.+@.+\..+/.test(lead.email) &&
    lead.whatsapp.replace(/\D/g, "").length >= 10 &&
    lead.consentimento

  const responder = useCallback((chave: string, valor: string | number) => {
    setRespostas((r) => ({ ...r, [chave]: valor }))
  }, [])

  async function enviar() {
    setEnviando(true)
    setErroEnvio(null)
    try {
      // Campos de texto opcionais vazios não são enviados.
      const limpas: Respostas = {}
      for (const [chave, valor] of Object.entries(respostas)) {
        if (typeof valor === "string" && valor.trim() === "") continue
        limpas[chave] = typeof valor === "string" ? valor.trim() : valor
      }
      const res = await onEnviar({
        lead: {
          nome: lead.nome.trim(),
          empresa: lead.empresa.trim(),
          email: lead.email.trim(),
          whatsapp: lead.whatsapp.trim(),
          consentimento: true,
        },
        respostas: limpas,
        duracaoSegundos: Math.max(0, Math.round((Date.now() - iniciadoEm) / 1000)),
        origem: origemRef.current,
      })
      limpar()
      setResultado(res)
      setTela("concluido")
    } catch (e) {
      setErroEnvio(e instanceof Error ? e.message : "Falha no envio. Verifique sua conexão.")
    } finally {
      setEnviando(false)
    }
  }

  if (!pronto) return null

  // ---------- Abertura ----------
  if (tela === "abertura") {
    const campos = [
      ["nome", "Seu nome", "text", "Como podemos te chamar"],
      ["empresa", "Empresa", "text", "Nome da empresa avaliada"],
      ["email", "E-mail", "email", "voce@empresa.com.br"],
      ["whatsapp", "WhatsApp", "tel", "(00) 00000-0000"],
    ] as const
    return (
      <div className="wz-ambient flex min-h-screen items-center justify-center p-6 sm:p-8">
        <div className="wz-ghost-ring hidden sm:block" />
        <div className="relative z-10 w-full max-w-[520px]">
          <div className="wz-card !p-7 sm:!p-11">
            <p className="wz-eyebrow mb-3.5">{titulo}</p>
            <h1 className="mb-4 text-[26px] font-semibold italic leading-tight sm:text-[28px]">{aberturaTitulo}</h1>
            <p className="mb-5 text-[14.5px] leading-relaxed text-text-muted">{aberturaTexto}</p>

            <div className="mb-7 grid grid-cols-2 overflow-hidden rounded-sm border border-line sm:grid-cols-3">
              {[
                [String(progresso.total), "Campos"],
                [String(questionario.etapas.length), `${questionario.rotuloEtapa}s`],
                [questionario.tempoEstimado, "Tempo estimado"],
              ].map(([n, l]) => (
                <div key={l} className="border-line bg-panel-raised px-3 py-4 text-center [&+&]:border-l">
                  <p className="font-display text-lg font-semibold text-gold">{n}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.06em] text-text-muted">{l}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {campos.map(([campo, rotulo, tipo, placeholder]) => (
                <label key={campo} className="flex flex-col gap-1.5">
                  <span className="font-display text-[10.5px] uppercase tracking-[0.12em] text-text-muted">
                    {rotulo}*
                  </span>
                  <input
                    type={tipo}
                    className="wz-input"
                    placeholder={placeholder}
                    value={lead[campo]}
                    onChange={(e) => setLead((l) => ({ ...l, [campo]: e.target.value }))}
                  />
                </label>
              ))}
            </div>

            <label className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-text-dim">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={lead.consentimento}
                onChange={(e) => setLead((l) => ({ ...l, consentimento: e.target.checked }))}
              />
              Autorizo a Versak a usar estes dados para me apresentar o resultado e entrar em contato.*
            </label>

            <p className="mt-4 text-xs leading-relaxed text-text-dim">
              Seu progresso é salvo automaticamente. Se fechar a aba, retoma exatamente de onde parou, neste mesmo
              navegador.
            </p>

            <button
              type="button"
              className="wz-btn-gold mt-6 w-full"
              disabled={!leadValido}
              onClick={() => setTela("questionario")}
            >
              {retomado ? "Continuar de onde parei" : "Iniciar"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Pausa ----------
  if (tela === "pausa") {
    const faltamTotal = progresso.total - progresso.respondidos
    const primeiroNome = lead.nome.trim().split(" ")[0]
    return (
      <div className="wz-ambient flex min-h-screen items-center justify-center p-6 sm:p-8">
        <div className="wz-ghost-ring hidden sm:block" />
        <div className="relative z-10 w-full max-w-[520px]">
          <div className="wz-card !p-7 sm:!p-11">
            <p className="wz-eyebrow mb-3.5">Progresso salvo</p>
            <h1 className="mb-4 text-[26px] font-semibold italic">
              {primeiroNome ? `Até já, ${primeiroNome}!` : "Até já!"}
            </h1>
            <p className="text-[14.5px] leading-relaxed text-text-muted">
              {faltamTotal > 0
                ? `Você já respondeu ${progresso.respondidos} campos. O restante fica te esperando, sem pressa.`
                : "Você já respondeu tudo — pode voltar quando quiser para revisar antes de concluir."}
            </p>

            <div className="my-7 grid grid-cols-3 overflow-hidden rounded-sm border border-line">
              {[
                [String(progresso.respondidos), "Respondidas"],
                [String(faltamTotal), "Faltam"],
                [`${progresso.pct}%`, "Concluído"],
              ].map(([n, l]) => (
                <div key={l} className="border-line bg-panel-raised px-3 py-4 text-center [&+&]:border-l">
                  <p className="font-display text-xl font-semibold text-gold">{n}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.06em] text-text-muted">{l}</p>
                </div>
              ))}
            </div>

            <p className="mb-6 text-xs leading-relaxed text-text-dim">
              Pode fechar esta aba com tranquilidade. Quando quiser continuar, volte a este mesmo link, neste mesmo
              navegador, e retomamos exatamente de onde você parou.
            </p>
            <button type="button" className="wz-btn-gold w-full" onClick={() => setTela("questionario")}>
              Voltar a responder
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Concluído ----------
  if (tela === "concluido" && resultado !== null) {
    return (
      <div className="wz-ambient flex min-h-screen items-center justify-center p-6 sm:p-8">
        <div className="wz-ghost-ring hidden sm:block" />
        <div className="relative z-10 w-full max-w-[560px]">
          <div className="wz-card !p-7 sm:!p-11">{telaFinal(resultado)}</div>
        </div>
      </div>
    )
  }

  // ---------- Questionário ----------
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <WizardRail
        questionario={questionario}
        etapaAtual={etapaAtual}
        respostas={respostas}
        pct={progresso.pct}
        onSelecionarEtapa={setEtapaAtual}
        onSalvarESair={() => setTela("pausa")}
      />

      <main className="min-w-0 flex-1 px-5 pb-24 pt-8 sm:px-8 lg:max-w-[840px] lg:px-16 lg:pt-14">
        <div className="mb-5 lg:hidden">
          <EtapaDropdown
            questionario={questionario}
            etapaAtual={etapaAtual}
            respostas={respostas}
            onSelecionar={setEtapaAtual}
          />
        </div>

        <p className="mb-8 font-display text-[11.5px] uppercase tracking-[0.1em] text-text-dim">
          {etapa?.nome} — {etapa?.campos.length} {etapa?.campos.length === 1 ? "campo" : "campos"}
        </p>

        {etapa?.descricao && (
          <p className="mb-8 text-sm italic leading-relaxed text-text-muted">{etapa.descricao}</p>
        )}

        {retomado && (
          <p className="mb-8 rounded border border-gold-dim bg-panel px-4 py-2.5 text-center text-sm text-gold-bright">
            Retomamos de onde você parou.
          </p>
        )}

        {etapa &&
          gruposDaEtapa(etapa).map((bloco, i) => (
            <section key={bloco.grupo ?? `grupo-${i}`}>
              {bloco.grupo && (
                <h2 className="mb-3 mt-8 font-display text-xs uppercase tracking-[0.18em] text-text-dim">
                  {bloco.grupo}
                </h2>
              )}
              {bloco.campos.map((campo) => (
                <div key={campo.chave} className="wz-qcard">
                  <p className="mb-5 max-w-[560px] text-[16px] font-medium leading-relaxed sm:text-[18px]">
                    {campo.rotulo}
                    {!campo.obrigatorio && <span className="ml-2 text-xs text-text-dim">(opcional)</span>}
                  </p>
                  <CampoInput
                    campo={campo}
                    valor={respostas[campo.chave]}
                    onChange={(valor) => responder(campo.chave, valor)}
                  />
                </div>
              ))}
            </section>
          ))}

        <div className="mt-9 flex max-w-[560px] items-center justify-between gap-4 border-t border-line pt-7">
          <button
            type="button"
            className="wz-btn-ghost"
            disabled={etapaAtual === 0}
            onClick={() => setEtapaAtual((i) => Math.max(0, i - 1))}
          >
            Voltar
          </button>
          <span className="hidden font-display text-[11.5px] tracking-wide text-text-dim sm:block">
            {progresso.respondidos} de {progresso.total}
          </span>
          {ultimaEtapa ? (
            <button
              type="button"
              className="wz-btn-gold"
              disabled={!tudoCompleto || enviando}
              onClick={enviar}
            >
              {enviando ? "Enviando..." : faltam > 0 ? `Faltam ${faltam}` : "Concluir"}
            </button>
          ) : (
            <button
              type="button"
              className="wz-btn-gold"
              disabled={faltam > 0}
              onClick={() => setEtapaAtual((i) => i + 1)}
            >
              {faltam > 0 ? `Faltam ${faltam}` : `Próximo ${questionario.rotuloEtapa.toLowerCase()}`}
            </button>
          )}
        </div>

        {erroEnvio && (
          <p className="wz-erro mt-5 max-w-[560px] text-center">
            {erroEnvio} — seus dados continuam salvos neste navegador.
          </p>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 7: Criar `app/vbs/page.tsx` (envio ainda desligado)**

Nesta task o `onEnviar` só devolve `null` — a API entra na Task 5. Isso permite navegar e testar o fluxo inteiro antes de ligar o backend.

`Wizard` recebe funções como props (`onEnviar`, `telaFinal`), e um Server Component não pode passar função para um Client Component. Por isso a página fica fina e delega para um wrapper client.

Criar `app/vbs/page.tsx`:

```tsx
import type { Metadata } from "next"
import { VbsClient } from "@/components/wizard/vbs-client"

export const metadata: Metadata = {
  title: "VBS — Versak Business Snapshot",
  description: "Um retrato rápido do contexto e da gestão da sua empresa.",
  robots: { index: false, follow: false },
}

export default function VbsPage() {
  return <VbsClient />
}
```

E criar `components/wizard/vbs-client.tsx`:

```tsx
"use client"

import { Wizard } from "./wizard"
import { VBS_QUESTIONARIO } from "@/lib/vbs-questionario"

export function VbsClient() {
  return (
    <Wizard<null>
      questionario={VBS_QUESTIONARIO}
      titulo="Versak Business Snapshot"
      aberturaTitulo="Vamos mapear a sua empresa."
      aberturaTexto="Um retrato rápido do contexto do seu negócio: identificação, perfil, panorama de gestão e prioridades. Não existe resposta certa — quanto mais honesto, mais útil é a conversa que vem depois."
      onEnviar={async () => null}
      telaFinal={() => <p>Envio ainda não implementado.</p>}
    />
  )
}
```

**Nota para o implementador:** o arquivo `components/wizard/vbs-client.tsx` é substituído na Task 5 pela versão com envio real. Está aqui só para tornar a Task 4 testável no navegador.

- [ ] **Step 8: Verificar tipos, lint e build**

Run: `npx tsc --noEmit && npx eslint . && npm run build`
Expected: limpos.

- [ ] **Step 9: Verificação manual no navegador**

Com `npm run dev`, abrir `http://localhost:3000/vbs` e conferir:
- Abertura: os 3 números aparecem (33 campos, 4 Blocos, "5 a 10 minutos"); o botão só habilita com nome, empresa, e-mail, WhatsApp e o checkbox.
- Bloco 1: campos de texto aparecem; os opcionais mostram "(opcional)".
- Botão "Próximo bloco" fica em "Faltam N" até preencher Razão social e Cidade/Estado.
- Anel de progresso cresce ao responder; dropdown do trilho mostra a fração de cada bloco e ✓ nos completos.
- Clicar em "Salvar e sair" → tela de pausa com Respondidas / Faltam / % — voltar funciona.
- **Recarregar a página no meio** → volta na mesma etapa, com as respostas, e aparece "Retomamos de onde você parou".
- Bloco 3: as 22 perguntas mostram os 4 botões (Sim / Parcialmente / Não / Não se aplica).
- Mobile 375px: trilho vira barra no topo, dropdown aparece acima das perguntas, sem scroll horizontal.

- [ ] **Step 10: Commit**

```bash
git add components/wizard app/vbs
git commit -m "feat: add shared wizard shell and navigable VBS page"
```

---

### Task 5: API do VBS + tabela + e-mail (Fase A completa)

**Files:**
- Create: `lib/vbs-email.ts`
- Create: `app/api/vbs/route.ts`
- Modify: `supabase/schema.sql` (acrescentar a tabela do VBS)
- Modify: `components/wizard/vbs-client.tsx` (ligar o envio e a tela final)

**Interfaces:**
- Consumes: `VBS_QUESTIONARIO` (Task 2); `Wizard`, `WizardEnvioDados` (Task 4); `linkWhatsapp` de `@/content/site` — assinatura `linkWhatsapp(mensagem?: string): string`.
- Produces: endpoint `POST /api/vbs` com corpo `{ lead: { nome, empresa, email, whatsapp, consentimento: true }, respostas: Record<string, string|number>, duracaoSegundos?: number, origem?: string }` → `200 { ok: true }` · `400 { ok: false, erro }` · `503 { ok: false, erro }` · `502 { ok: false, erro }`.

- [ ] **Step 1: Acrescentar a tabela ao final de `supabase/schema.sql`**

```sql

-- VBS — Versak Business Snapshot (ficha de contexto, sem pontuação).
create table public.vbs_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  empresa text not null,
  email text not null,
  whatsapp text not null,
  consentimento boolean not null,
  respostas jsonb not null,
  questionario_versao text not null,
  duracao_segundos integer,
  origem text not null default 'link',
  email_enviado boolean not null default false
);

alter table public.vbs_submissions enable row level security;
-- Sem policies de propósito: anon/authenticated não leem nem escrevem.
-- Toda escrita/leitura passa pelo servidor com a service role key.
```

- [ ] **Step 2: Criar `lib/vbs-email.ts`**

```ts
import type { Questionario, Respostas, WizardLead } from "./wizard-types"

const esc = (s: string) => s.replaceAll("<", "&lt;").replaceAll(">", "&gt;")

export function montarEmailVbs(
  lead: WizardLead,
  questionario: Questionario,
  respostas: Respostas,
  duracaoSegundos?: number,
): { assunto: string; html: string } {
  const duracao = duracaoSegundos ? `${Math.max(1, Math.round(duracaoSegundos / 60))} min` : "—"
  const assunto = `VBS — ${lead.empresa} (${lead.nome})`

  const blocos = questionario.etapas
    .map((etapa) => {
      const linhas = etapa.campos
        .map((campo) => {
          const valor = respostas[campo.chave]
          const texto = valor === undefined || valor === "" ? "—" : esc(String(valor))
          return `<tr>
            <td style="padding:6px 10px;border-bottom:1px solid #eee;width:48%;color:#555">${esc(campo.rotulo)}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #eee"><b>${texto}</b></td>
          </tr>`
        })
        .join("")
      return `<h3 style="margin:22px 0 6px">${esc(etapa.nome)}</h3>
        <table style="border-collapse:collapse;width:100%">${linhas}</table>`
    })
    .join("")

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:680px">
    <h2 style="margin:0 0 4px">Nova ficha VBS</h2>
    <p style="margin:0 0 16px;color:#666">Versão ${esc(questionario.versao)} · duração ${duracao}</p>
    <table style="border-collapse:collapse;margin-bottom:8px">
      <tr><td style="padding:2px 10px 2px 0"><b>Nome</b></td><td>${esc(lead.nome)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>Empresa</b></td><td>${esc(lead.empresa)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>E-mail</b></td><td>${esc(lead.email)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>WhatsApp</b></td><td>${esc(lead.whatsapp)}</td></tr>
    </table>
    ${blocos}
    <p style="color:#666;margin-top:20px">Ficha completa gravada no Supabase (tabela vbs_submissions).</p>
  </div>`

  return { assunto, html }
}
```

- [ ] **Step 3: Criar `app/api/vbs/route.ts`**

```ts
import { NextResponse } from "next/server"
import { z } from "zod"
import { montarEmailVbs } from "@/lib/vbs-email"
import { VBS_QUESTIONARIO } from "@/lib/vbs-questionario"

export const maxDuration = 10

// O gabarito de respostas vem do próprio questionário: campo obrigatório é
// exigido; campo de opções só aceita um dos valores da sua lista.
const respostasShape: Record<string, z.ZodTypeAny> = {}
for (const etapa of VBS_QUESTIONARIO.etapas) {
  for (const campo of etapa.campos) {
    let esquema: z.ZodTypeAny
    if (campo.opcoes && campo.opcoes.length > 0) {
      const validos = campo.opcoes.map((o) => String(o.valor))
      esquema = z.string().refine((v) => validos.includes(v), { message: `Opção inválida em ${campo.chave}` })
    } else {
      esquema = z.string().trim().min(1).max(2000)
    }
    respostasShape[campo.chave] = campo.obrigatorio ? esquema : esquema.optional()
  }
}

const corpoSchema = z.object({
  lead: z.object({
    nome: z.string().trim().min(2).max(200),
    empresa: z.string().trim().min(2).max(200),
    email: z.string().trim().email().max(200),
    whatsapp: z.string().trim().min(10).max(30),
    consentimento: z.literal(true),
  }),
  respostas: z.object(respostasShape),
  duracaoSegundos: z.number().int().nonnegative().optional(),
  origem: z.string().trim().max(50).optional(),
})

export async function POST(request: Request) {
  const env = {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    resendKey: process.env.RESEND_API_KEY,
    emailTo: process.env.DME360_EMAIL_TO,
    emailFrom: process.env.DME360_EMAIL_FROM ?? "Versak <onboarding@resend.dev>",
  }
  if (!env.url || !env.serviceKey) {
    return NextResponse.json({ ok: false, erro: "Configuração do banco pendente." }, { status: 503 })
  }

  let corpo
  try {
    corpo = corpoSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ ok: false, erro: "Dados inválidos." }, { status: 400 })
  }

  const registro = {
    nome: corpo.lead.nome,
    empresa: corpo.lead.empresa,
    email: corpo.lead.email,
    whatsapp: corpo.lead.whatsapp,
    consentimento: corpo.lead.consentimento,
    respostas: corpo.respostas,
    questionario_versao: VBS_QUESTIONARIO.versao,
    duracao_segundos: corpo.duracaoSegundos ?? null,
    origem: corpo.origem ?? "link",
    email_enviado: false,
  }

  // 1) Grava primeiro — o dado nunca depende do e-mail.
  const insercao = await fetch(`${env.url}/rest/v1/vbs_submissions`, {
    method: "POST",
    headers: {
      apikey: env.serviceKey,
      Authorization: `Bearer ${env.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(registro),
  })
  if (!insercao.ok) {
    console.error("vbs: falha ao gravar no Supabase", insercao.status, await insercao.text())
    return NextResponse.json({ ok: false, erro: "Falha ao gravar. Tente novamente." }, { status: 502 })
  }
  const [linha] = (await insercao.json()) as { id: string }[]

  // 2) E-mail best-effort.
  if (env.resendKey && env.emailTo) {
    try {
      const { assunto, html } = montarEmailVbs(
        corpo.lead,
        VBS_QUESTIONARIO,
        corpo.respostas,
        corpo.duracaoSegundos,
      )
      const envio = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.emailFrom, to: [env.emailTo], subject: assunto, html }),
        signal: AbortSignal.timeout(5000),
      })
      if (envio.ok && linha) {
        await fetch(`${env.url}/rest/v1/vbs_submissions?id=eq.${linha.id}`, {
          method: "PATCH",
          headers: {
            apikey: env.serviceKey,
            Authorization: `Bearer ${env.serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email_enviado: true }),
          signal: AbortSignal.timeout(5000),
        })
      } else if (!envio.ok) {
        console.error("vbs: falha no e-mail", envio.status, await envio.text())
      }
    } catch (e) {
      console.error("vbs: erro no envio de e-mail", e)
    }
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Substituir `components/wizard/vbs-client.tsx` pela versão com envio**

```tsx
"use client"

import { Wizard, type WizardEnvioDados } from "./wizard"
import { VBS_QUESTIONARIO } from "@/lib/vbs-questionario"
import { linkWhatsapp } from "@/content/site"

async function enviarVbs(dados: WizardEnvioDados): Promise<true> {
  const resposta = await fetch("/api/vbs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  })
  const json = (await resposta.json()) as { ok: boolean; erro?: string }
  if (!resposta.ok || !json.ok) throw new Error(json.erro ?? "Falha no envio.")
  return true
}

export function VbsClient() {
  return (
    <Wizard<true>
      questionario={VBS_QUESTIONARIO}
      titulo="Versak Business Snapshot"
      aberturaTitulo="Vamos mapear a sua empresa."
      aberturaTexto="Um retrato rápido do contexto do seu negócio: identificação, perfil, panorama de gestão e prioridades. Não existe resposta certa — quanto mais honesto, mais útil é a conversa que vem depois."
      onEnviar={enviarVbs}
      telaFinal={() => (
        <div className="text-center">
          <p className="wz-eyebrow justify-center">Ficha recebida</p>
          <h1 className="mt-4 text-[26px] font-semibold italic">Obrigado! Recebemos o seu snapshot.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-muted">
            A equipe Versak vai analisar as respostas e entrar em contato para apresentar a leitura do cenário da sua
            empresa e os próximos passos.
          </p>
          <a
            href={linkWhatsapp("Olá! Acabei de enviar o VBS e gostaria de conversar sobre o resultado.")}
            target="_blank"
            rel="noopener noreferrer"
            className="wz-btn-gold mt-7 inline-block"
          >
            Falar com a Versak no WhatsApp
          </a>
        </div>
      )}
    />
  )
}
```

- [ ] **Step 5: Verificar tipos, lint, build e o caminho sem envs**

Run: `npx tsc --noEmit && npx eslint . && npm run build`
Expected: limpos. Depois, com `npm run dev` rodando:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/vbs -H "Content-Type: application/json" -d '{}'
```

Expected: `503` (as env vars ainda não existem — isso é sucesso, não bug; o setup real é a Task 7).

- [ ] **Step 6: Commit**

```bash
git add supabase/schema.sql lib/vbs-email.ts app/api/vbs components/wizard/vbs-client.tsx
git commit -m "feat: add VBS submission API with Supabase persistence and summary email"
```

---

### Task 6: Migrar o `/dme360` para a casca (Fase B)

**Files:**
- Create: `lib/dme360-questionario.ts`
- Create: `components/dme360/dme360-client.tsx`
- Modify: `app/dme360/page.tsx`
- Delete: `components/dme360/dme-wizard.tsx`

**Interfaces:**
- Consumes: `DME360_DIMENSOES`, `DME360_ESCALA`, `DME360_VERSAO` de `@/content/dme360` — tipos `DmeDimensao { id, nome, descricao: string | null, peso, questoes: { codigo, subdimensao, pergunta }[] }` e `DmeEscalaItem { nota: number; rotulo: string; descricao: string }`; `Wizard`, `WizardEnvioDados` (Task 4); `POST /api/dme360` (já existente) que responde `{ ok: true, ime: number, classificacao: string }`.
- Produces: `DME360_QUESTIONARIO: Questionario`.

- [ ] **Step 1: Criar `lib/dme360-questionario.ts`**

```ts
import { DME360_DIMENSOES, DME360_ESCALA, DME360_VERSAO } from "../content/dme360"
import type { Campo, CampoOpcao, Etapa, Questionario } from "./wizard-types"

const OPCOES_ESCALA: CampoOpcao[] = DME360_ESCALA.map((item) => ({
  valor: item.nota,
  rotulo: String(item.nota),
  legenda: item.rotulo,
  descricao: item.descricao,
}))

export const DME360_QUESTIONARIO: Questionario = {
  id: "dme360",
  versao: DME360_VERSAO,
  rotuloEtapa: "Dimensão",
  tempoEstimado: "35 a 45 minutos",
  etapas: DME360_DIMENSOES.map(
    (dim): Etapa => ({
      id: dim.id,
      nome: dim.nome,
      descricao: dim.descricao,
      campos: dim.questoes.map(
        (q): Campo => ({
          chave: `${dim.id}:${q.codigo}`,
          rotulo: q.pergunta,
          tipo: "escala",
          opcoes: OPCOES_ESCALA,
          obrigatorio: true,
          grupo: q.subdimensao,
        }),
      ),
    }),
  ),
}
```

- [ ] **Step 2: Criar `components/dme360/dme360-client.tsx`**

```tsx
"use client"

import { Wizard, type WizardEnvioDados } from "@/components/wizard/wizard"
import { DME360_QUESTIONARIO } from "@/lib/dme360-questionario"
import { DME360_ESCALA } from "@/content/dme360"
import { linkWhatsapp } from "@/content/site"

type ResultadoDme = { ime: number; classificacao: string }

async function enviarDme360(dados: WizardEnvioDados): Promise<ResultadoDme> {
  const resposta = await fetch("/api/dme360", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  })
  const json = (await resposta.json()) as {
    ok: boolean
    ime?: number
    classificacao?: string
    erro?: string
  }
  if (!resposta.ok || !json.ok || json.ime === undefined || !json.classificacao) {
    throw new Error(json.erro ?? "Falha no envio.")
  }
  return { ime: json.ime, classificacao: json.classificacao }
}

export function Dme360Client() {
  return (
    <Wizard<ResultadoDme>
      questionario={DME360_QUESTIONARIO}
      titulo="Diagnóstico 360º"
      aberturaTitulo="Vamos mapear a maturidade da sua gestão."
      aberturaTexto="Você vai avaliar a sua empresa em 7 dimensões, numa escala de 1 a 5. Não existe resposta certa — quanto mais honesto, mais preciso é o diagnóstico."
      onEnviar={enviarDme360}
      telaFinal={(resultado) => (
        <div className="text-center">
          <p className="wz-eyebrow justify-center">Seu IME 360</p>
          <p className="mt-4 font-display text-6xl font-bold text-gold">
            {resultado.ime.toFixed(2).replace(".", ",")}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold">{resultado.classificacao}</p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-muted">
            {DME360_ESCALA.find((e) => e.rotulo === resultado.classificacao)?.descricao ?? ""}
          </p>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-text-muted">
            O relatório completo, dimensão por dimensão, será apresentado pela equipe Versak.
          </p>
          <a
            href={linkWhatsapp("Olá! Acabei de concluir o DME 360 e gostaria de conversar sobre o meu resultado.")}
            target="_blank"
            rel="noopener noreferrer"
            className="wz-btn-gold mt-7 inline-block"
          >
            Falar com a Versak no WhatsApp
          </a>
        </div>
      )}
    />
  )
}
```

- [ ] **Step 3: Substituir o conteúdo de `app/dme360/page.tsx`**

```tsx
import type { Metadata } from "next"
import { Dme360Client } from "@/components/dme360/dme360-client"

export const metadata: Metadata = {
  title: "DME 360 — Diagnóstico de Maturidade Empresarial | Versak",
  description: "Responda o DME 360 e descubra o nível de maturidade da gestão da sua empresa.",
  robots: { index: false, follow: false },
}

export default function Dme360Page() {
  return <Dme360Client />
}
```

- [ ] **Step 4: Remover o wizard antigo e os estilos que ficaram órfãos**

```bash
git rm components/dme360/dme-wizard.tsx
```

Em `theme/tokens.css`, remover o bloco `/* ---- DME 360: formulário de diagnóstico ---- */` inteiro (as classes `.dme-card`, `.dme-option`, `.dme-option:hover`, `.dme-option-ativa`, `.dme-progress`, `.dme-progress-fill`) — nada mais as usa. Confirmar antes com:

Run: `npx eslint . && grep -rn "dme-card\|dme-option\|dme-progress" --include="*.tsx" --include="*.ts" .`
Expected: nenhum resultado no grep.

- [ ] **Step 5: Verificar tipos, lint e build**

Run: `npx tsc --noEmit && npx eslint . && npm run build && npm run dme360:verify`
Expected: limpos; a verificação do motor de pontuação continua com todas as linhas `OK` (esta task não toca em `lib/dme360-score.ts`).

- [ ] **Step 6: Verificação manual no navegador**

Com `npm run dev`, abrir `http://localhost:3000/dme360` e conferir:
- Abertura mostra 245 campos, 7 Dimensões, "35 a 45 minutos".
- Dimensão 1 mostra a descrição da dimensão e os cabeçalhos de subdimensão (ESTRUTURA, PROCESSOS, …).
- A escala aparece com os 5 botões numerados e o rótulo de maturidade abaixo (Caótico … Otimizado) em telas ≥640px.
- Responder uma dimensão inteira libera "Próxima dimensão"; o anel sobe.
- Recarregar no meio retoma o estado.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: migrate DME360 page to the shared wizard shell"
```

---

### Task 7 (INTERATIVA — controlador + usuário, não despachar a subagente): Setup Supabase + Resend + teste ponta a ponta

Esta tarefa é feita **junto com o Matheus** no chat: ele executa os cliques, o controlador orienta passo a passo e verifica cada retorno.

- [ ] **Step 1: Criar o projeto no Supabase**

1. Acessar `https://supabase.com` → **Start your project** → entrar com GitHub ou e-mail.
2. **New project** → Organization: a pessoal → Name: `versak` → Database Password: gerar e **guardar no gerenciador de senhas** → Region: `South America (São Paulo)` → **Create new project**. A criação leva ~2 minutos.

- [ ] **Step 2: Rodar o schema**

1. No menu lateral: **SQL Editor** → **New query**.
2. Colar o conteúdo **inteiro** de `supabase/schema.sql` (as duas tabelas: `dme_submissions` e `vbs_submissions`).
3. **Run**. Esperado: `Success. No rows returned`.
4. Conferir em **Table Editor**: as duas tabelas aparecem, ambas com o cadeado de RLS ativo.

- [ ] **Step 3: Copiar as chaves**

Em **Project Settings** → **API**:
- `Project URL` → vira `SUPABASE_URL`
- `service_role` (em Project API keys, campo oculto — clicar em Reveal) → vira `SUPABASE_SERVICE_ROLE_KEY`

⚠️ A `service_role` ignora RLS. Ela só pode existir em `.env.local` e nas env vars da Vercel — nunca em código, nunca no git, nunca no navegador.

- [ ] **Step 4: Criar a conta no Resend e a API key**

1. `https://resend.com` → Sign up.
2. **API Keys** → **Create API Key** → nome `versak-site`, permissão `Sending access` → copiar (só aparece uma vez) → vira `RESEND_API_KEY`.
3. **Domains** → **Add Domain** → `versak.com.br` → o Resend mostra registros DNS (SPF/DKIM). Matheus adiciona esses registros onde o DNS do domínio é gerenciado. A verificação pode levar de minutos a algumas horas.
4. **Enquanto o domínio não verifica:** o remetente fica `Versak <onboarding@resend.dev>` (padrão do código) e o destinatário precisa ser o e-mail da própria conta Resend (limitação do sandbox). Depois de verificado, trocar `DME360_EMAIL_FROM` para `Versak <diagnostico@versak.com.br>` e `DME360_EMAIL_TO` para o e-mail comercial do Victor.

- [ ] **Step 5: Escrever `.env.local`**

Criar na raiz do repo o arquivo `.env.local` (já coberto por `.gitignore` na linha `.env*`):

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=cole-a-service-role-aqui
RESEND_API_KEY=cole-a-api-key-aqui
DME360_EMAIL_TO=email-da-conta-resend@exemplo.com
DME360_EMAIL_FROM=Versak <onboarding@resend.dev>
```

Confirmar que não vaza: `git status` não deve listar `.env.local`.

- [ ] **Step 6: Teste ponta a ponta do VBS**

1. Reiniciar o `npm run dev` (env vars só são lidas na inicialização).
2. Abrir `http://localhost:3000/vbs`, preencher a abertura e **responder a ficha inteira** (5–10 min).
3. Conferir os três resultados:
   - Tela de agradecimento aparece.
   - **Supabase → Table Editor → vbs_submissions**: uma linha nova, com `respostas` preenchido e `email_enviado = true`.
   - E-mail chegou na caixa de `DME360_EMAIL_TO`, com a ficha agrupada pelos 4 blocos.
4. Recarregar `/vbs`: deve começar do zero (o rascunho foi limpo no envio bem-sucedido).

- [ ] **Step 7: Teste ponta a ponta do DME 360 (amostral)**

Responder as 245 perguntas na mão leva 35–45 min, e preencher pelo console do navegador não é confiável (o React não vê alterações feitas direto no DOM). Validar o caminho via API, com um payload completo gerado por script.

Criar `scripts/teste-dme360-e2e.ts`:

```ts
import { DME360_DIMENSOES } from "../content/dme360"

const respostas: Record<string, number> = {}
for (const d of DME360_DIMENSOES) for (const q of d.questoes) respostas[`${d.id}:${q.codigo}`] = 3

const resposta = await fetch("http://localhost:3000/api/dme360", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    lead: {
      nome: "Teste Ponta a Ponta",
      empresa: "Versak Teste",
      email: "teste@versak.com.br",
      whatsapp: "11999998888",
      consentimento: true,
    },
    respostas,
    duracaoSegundos: 120,
    origem: "teste",
  }),
})
console.log(resposta.status, await resposta.text())
```

Run (com o dev server ativo): `npx tsx scripts/teste-dme360-e2e.ts`
Expected: `200 {"ok":true,"ime":3,"classificacao":"Definido"}` e uma linha nova em `dme_submissions`.

Depois de confirmar, apagar o script e a linha de teste no Supabase:

```bash
rm scripts/teste-dme360-e2e.ts
```

- [ ] **Step 8: Registrar o estado**

Anotar no chat quais env vars ficaram configuradas e se o domínio do Resend já verificou (isso define se a Task 8 usa o remetente sandbox ou o definitivo).

---

### Task 8 (INTERATIVA): Deploy na Vercel e entrega do link

- [ ] **Step 1: Subir a branch**

```bash
git push -u origin dme360
```

- [ ] **Step 2: Configurar as env vars na Vercel**

No projeto do site em `vercel.com` → **Settings** → **Environment Variables**, adicionar as 5 variáveis do `.env.local` marcando **Preview** e **Production** nas duas. Salvar.

- [ ] **Step 3: Testar o deploy de preview**

A Vercel gera um deploy da branch automaticamente. Abrir `https://<preview>.vercel.app/vbs` e:
1. Preencher a ficha inteira, enviar, conferir linha no Supabase + e-mail.
2. Testar em celular de verdade (não só no simulador): trilho no topo, botões da escala clicáveis, sem scroll horizontal.
3. Abrir `/dme360` e conferir que a casca carrega e a primeira dimensão responde.

- [ ] **Step 4: Entregar ao Victor**

Mandar o link de preview do `/vbs` para o Victor validar o conteúdo da ficha e o texto das telas. **Não fazer merge antes do aval dele.**

- [ ] **Step 5: Merge em produção (só após o aval)**

```bash
git checkout master
git merge dme360
git push
```

Depois do deploy: conferir `https://versak.com.br/vbs` e `https://versak.com.br/dme360` funcionando, e mandar o link definitivo para o Victor usar na palestra.

---

## Notas de execução

- **Ordem obrigatória:** Tasks 1→5 entregam o VBS (prazo do Victor). A Task 6 (migração do DME 360) só depois. As Tasks 7 e 8 são interativas e fecham as duas fases juntas.
- **Se a Task 5 terminar e o prazo apertar**, é legítimo pular direto para as Tasks 7 e 8 com só o VBS pronto, e fazer a Task 6 depois — o `/dme360` antigo continua funcionando até ser migrado.
- Nenhuma task altera `lib/dme360-score.ts`, `app/api/dme360/route.ts`, `lib/dme360-email.ts`, `content/dme360.ts` ou `scripts/import-dme360.mjs`. O motor de pontuação e a API do DME 360 seguem exatamente como estão.
