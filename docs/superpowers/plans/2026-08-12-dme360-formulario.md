# DME 360 — Formulário de diagnóstico online — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Página `/dme360` no site da Versak com o questionário completo (245 perguntas, 7 dimensões), autosave local, pontuação fiel ao Excel, gravação no Supabase e e-mail-resumo para o Victor a cada envio.

**Architecture:** Conteúdo do questionário gerado por script a partir do xlsx (`content/dme360.ts`, commitado); motor de pontuação puro em `lib/dme360-score.ts` usado no client (tela final) e no servidor (fonte da verdade); wizard client em `components/dme360/`; route handler `POST /api/dme360` valida com zod, grava via REST do Supabase (fetch + service key) e dispara e-mail via Resend (fetch). Setup do Supabase/Resend é tarefa guiada com o usuário.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind v4 + `theme/tokens.css`; deps novas: `zod` (runtime, só servidor); devDeps novas: `xlsx`, `tsx`.

## Global Constraints

- Sem framework de testes no repo: validação por task = `npx tsc --noEmit` + `npx eslint .` + (quando visual) `npm run build` + checagem manual descrita. O motor de pontuação tem script próprio de verificação (`npx tsx scripts/verify-dme360-score.ts`).
- **Nenhuma cor hardcoded fora de `theme/tokens.css`** — o wizard usa classes `.dme-*` definidas lá + utilitários Tailwind de `--color-*`.
- Chave de resposta: `"<dimensaoId>:<codigo>"` (ex.: `"governanca:S1.1"`) — códigos S1.1… se repetem entre dimensões, o prefixo é obrigatório.
- Pontuação: média da subdimensão = média das perguntas; **média da dimensão = média das 7 médias de subdimensão**; IME 360 = Σ(média×peso); classificação `<2` Caótico, `<3` Consciente, `<4` Definido, `<4,5` Gerenciado, senão Otimizado; prioridade `<2` Crítica, `<3` Alta, `<4` Média, `<4,5` Baixa, senão Manutenção. Classificar sempre sobre o valor **não arredondado**.
- Segredos só no servidor: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `DME360_EMAIL_TO`, `DME360_EMAIL_FROM` — nunca importados em componente client, nunca commitados.
- Gravar no banco **antes** de tentar e-mail; falha de e-mail não falha a requisição (campo `email_enviado=false`).
- `tsconfig` tem `noUncheckedIndexedAccess: true` — indexações por variável usam `?? fallback` ou narrowing.
- Node do usuário: v24 (roda `.mjs` e, via `npx tsx`, os scripts `.ts`).
- Excel fonte: `C:\Users\mathe\OneDrive\Documentos\Versak\DME360_7D HIGHLIGHTS_VERSAK.xlsx` (um nível acima do repo).
- Branch de trabalho: `dme360`. Rodar comandos na raiz do repo (`versak-landing`). Se `npm run build` falhar com `EINVAL readlink .next/...` (artefato OneDrive): `rm -rf .next` e repetir. Não rodar build se o usuário estiver com `npm run dev` ativo na mesma pasta.

---

### Task 1: Script de importação do Excel → `content/dme360.ts`

**Files:**
- Create: `scripts/import-dme360.mjs`
- Create: `content/dme360.ts` (gerado pelo script, commitado)
- Modify: `package.json` (devDep `xlsx`, script `dme360:import`)

**Interfaces:**
- Produces (consumido pelas Tasks 2, 4, 5):
  - Tipos: `DmeQuestao { codigo: string; subdimensao: string; pergunta: string }`, `DmeDimensao { id: string; nome: string; descricao: string | null; peso: number; questoes: DmeQuestao[] }`, `DmeEscalaItem { nota: number; rotulo: string; descricao: string }`.
  - Constantes: `DME360_VERSAO = "highlights-v1"`, `DME360_ESCALA: DmeEscalaItem[]` (5 itens), `DME360_DIMENSOES: DmeDimensao[]` (7 itens, 245 questões no total).

- [ ] **Step 1: Instalar devDep e registrar npm script**

Run: `npm install -D xlsx`
Em `package.json` → `"scripts"`, adicionar: `"dme360:import": "node scripts/import-dme360.mjs"`.

- [ ] **Step 2: Criar `scripts/import-dme360.mjs`**

```js
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
```

- [ ] **Step 3: Rodar e conferir**

Run: `npm run dme360:import`
Expected: `Dimensões: 7 | Questões: 245` e arquivo gerado. Conferir por amostragem: `grep -c "codigo" content/dme360.ts` ≈ 245+; primeira pergunta de Governança = "Existe uma estrutura formal de pessoas responsáveis pela gestão da Governança?"; peso de `cliente` = 0.1.

- [ ] **Step 4: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint scripts/import-dme360.mjs content/dme360.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json scripts/import-dme360.mjs content/dme360.ts
git commit -m "feat: import DME360 questionnaire from Excel into generated content module"
```

---

### Task 2: Motor de pontuação + script de verificação

**Files:**
- Create: `lib/dme360-score.ts`
- Create: `scripts/verify-dme360-score.ts`
- Modify: `package.json` (devDep `tsx`, script `dme360:verify`)

**Interfaces:**
- Consumes: `DME360_DIMENSOES` (Task 1) — import **relativo** (`../content/dme360`) para os scripts rodarem via tsx.
- Produces (consumido pelas Tasks 4 e 5):

```ts
export type DmeRespostas = Record<string, number> // "governanca:S1.1" -> 1..5
export type DmeClassificacao = "Caótico" | "Consciente" | "Definido" | "Gerenciado" | "Otimizado"
export type DmePrioridade = "Crítica" | "Alta" | "Média" | "Baixa" | "Manutenção"
export type DmePontuacaoDimensao = {
  id: string; nome: string; media: number
  classificacao: DmeClassificacao; prioridade: DmePrioridade
  porSubdimensao: { subdimensao: string; media: number }[]
}
export type DmePontuacao = { porDimensao: DmePontuacaoDimensao[]; ime: number; classificacao: DmeClassificacao }
export function classificar(valor: number): DmeClassificacao
export function priorizar(valor: number): DmePrioridade
export function calcularPontuacao(respostas: DmeRespostas): DmePontuacao // lança Error se faltar resposta ou valor inválido
```

- [ ] **Step 1: Instalar tsx e registrar script**

Run: `npm install -D tsx`
Em `package.json` → `"scripts"`: `"dme360:verify": "tsx scripts/verify-dme360-score.ts"`.

- [ ] **Step 2: Criar `lib/dme360-score.ts`**

```ts
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
```

- [ ] **Step 3: Criar `scripts/verify-dme360-score.ts`**

```ts
import { DME360_DIMENSOES } from "../content/dme360"
import { calcularPontuacao, classificar } from "../lib/dme360-score"

let falhas = 0
function espera(nome: string, cond: boolean, detalhe = "") {
  if (cond) console.log(`OK  ${nome}`)
  else { falhas++; console.error(`ERRO ${nome} ${detalhe}`) }
}
const aprox = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) < tol

// Caso 1: todas as notas = 3 -> tudo 3, IME 3.00, "Definido"
const todas3: Record<string, number> = {}
for (const d of DME360_DIMENSOES) for (const q of d.questoes) todas3[`${d.id}:${q.codigo}`] = 3
const p1 = calcularPontuacao(todas3)
espera("caso1 ime=3", aprox(p1.ime, 3), String(p1.ime))
espera("caso1 classificacao", p1.classificacao === "Definido", p1.classificacao)
espera("caso1 todas dimensões=3", p1.porDimensao.every((d) => aprox(d.media, 3)))

// Caso 2 (pega o bug de média errada): Governança ESTRUTURA=5, resto tudo 1.
// Governança tem 7 subdimensões -> média = (5 + 1*6)/7 = 11/7 ≈ 1.5714286
// (média direta das 34 perguntas seria 58/34 ≈ 1.7059 — NÃO é isso que o Excel faz)
const caso2: Record<string, number> = {}
for (const d of DME360_DIMENSOES) for (const q of d.questoes) {
  caso2[`${d.id}:${q.codigo}`] = d.id === "governanca" && q.subdimensao === "ESTRUTURA" ? 5 : 1
}
const p2 = calcularPontuacao(caso2)
const gov = p2.porDimensao.find((d) => d.id === "governanca")
espera("caso2 governanca=11/7", gov !== undefined && aprox(gov.media, 11 / 7), String(gov?.media))
const imeEsperado = 0.15 * (11 / 7) + 0.15 * 5 * 1 + 0.1 * 1
espera("caso2 ime ponderado", aprox(p2.ime, imeEsperado), `${p2.ime} vs ${imeEsperado}`)
espera("caso2 classificacao Caótico", p2.classificacao === "Caótico", p2.classificacao)

// Caso 3: faixas de classificação nos limites
espera("classificar(1.99)", classificar(1.99) === "Caótico")
espera("classificar(2)", classificar(2) === "Consciente")
espera("classificar(3.999)", classificar(3.999) === "Definido")
espera("classificar(4)", classificar(4) === "Gerenciado")
espera("classificar(4.5)", classificar(4.5) === "Otimizado")

// Caso 4: resposta faltando -> erro
let lancou = false
try { calcularPontuacao({}) } catch { lancou = true }
espera("caso4 falta resposta lança erro", lancou)

if (falhas > 0) { console.error(`\n${falhas} verificação(ões) falharam`); process.exit(1) }
console.log("\nMotor de pontuação verificado.")
```

- [ ] **Step 4: Rodar verificação, tipos e lint**

Run: `npm run dme360:verify && npx tsc --noEmit && npx eslint lib/dme360-score.ts scripts/verify-dme360-score.ts`
Expected: todas as linhas `OK`, exit 0, tsc/eslint limpos.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json lib/dme360-score.ts scripts/verify-dme360-score.ts
git commit -m "feat: add DME360 scoring engine faithful to the Excel formulas, with verification script"
```

---

### Task 3: Estilos `.dme-*` em `theme/tokens.css`

**Files:**
- Modify: `theme/tokens.css` (acrescentar bloco ao final)

**Interfaces:**
- Produces: classes `.dme-card`, `.dme-option`, `.dme-option-ativa`, `.dme-progress`, `.dme-progress-fill` — consumidas pela Task 5.

- [ ] **Step 1: Acrescentar ao final de `theme/tokens.css`**

```css
/* ---- DME 360: formulário de diagnóstico ---- */
.dme-card {
  border: 1px solid var(--color-line);
  border-radius: 14px;
  background: var(--color-panel);
  padding: 20px;
}
.dme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 6px;
  border: 1px solid var(--color-line);
  border-radius: 10px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.dme-option:hover {
  border-color: var(--color-gold-dim);
  color: var(--color-text);
}
.dme-option-ativa {
  border-color: var(--color-gold);
  background: rgba(232, 169, 62, 0.12);
  color: var(--color-gold-bright);
}
.dme-progress {
  height: 6px;
  border-radius: 999px;
  background: var(--color-panel-raised);
  overflow: hidden;
}
.dme-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--color-gold-dim), var(--color-gold));
  transition: width 0.3s ease;
}
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit && npx eslint . && npm run build`
Expected: limpos (classes ainda sem uso).

- [ ] **Step 3: Commit**

```bash
git add theme/tokens.css
git commit -m "feat: add DME360 form styles to theme"
```

---

### Task 4: API `POST /api/dme360` + `supabase/schema.sql`

**Files:**
- Create: `app/api/dme360/route.ts`
- Create: `lib/dme360-email.ts`
- Create: `supabase/schema.sql`
- Modify: `package.json` (dep `zod`)

**Interfaces:**
- Consumes: `DME360_DIMENSOES`, `DME360_VERSAO` (Task 1); `calcularPontuacao`, `DmePontuacao` (Task 2).
- Produces (consumido pela Task 5): endpoint `POST /api/dme360` com corpo
  `{ lead: { nome, empresa, cargo?, email, whatsapp, consentimento: true }, respostas: Record<string, 1..5>, duracaoSegundos?: number, origem?: string }`
  → `200 { ok: true, ime: number, classificacao: string }` · `400 { ok: false, erro }` (payload inválido) · `503 { ok: false, erro }` (env não configurada) · `502 { ok: false, erro }` (falha ao gravar).

- [ ] **Step 1: Instalar zod**

Run: `npm install zod`

- [ ] **Step 2: Criar `supabase/schema.sql`**

```sql
-- DME 360 — envios do formulário público. Executar no SQL Editor do Supabase.
create table public.dme_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  empresa text not null,
  cargo text,
  email text not null,
  whatsapp text not null,
  consentimento boolean not null,
  respostas jsonb not null,
  pontuacao jsonb not null,
  ime numeric(4,2) not null,
  classificacao text not null,
  questionario_versao text not null,
  duracao_segundos integer,
  origem text not null default 'link',
  email_enviado boolean not null default false
);

alter table public.dme_submissions enable row level security;
-- Sem policies de propósito: anon/authenticated não leem nem escrevem.
-- Toda escrita/leitura passa pelo servidor com a service role key.
```

- [ ] **Step 3: Criar `lib/dme360-email.ts`**

```ts
import type { DmePontuacao } from "./dme360-score"

type Lead = { nome: string; empresa: string; cargo?: string; email: string; whatsapp: string }

export function montarEmailResumo(
  lead: Lead,
  pontuacao: DmePontuacao,
  versao: string,
  duracaoSegundos?: number,
): { assunto: string; html: string } {
  const f = (n: number) => n.toFixed(2).replace(".", ",")
  const linhas = pontuacao.porDimensao
    .map(
      (d) => `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${d.nome}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${f(d.media)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${d.classificacao}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${d.prioridade}</td>
      </tr>`,
    )
    .join("")
  const duracao = duracaoSegundos ? `${Math.round(duracaoSegundos / 60)} min` : "—"
  const assunto = `DME 360 — ${lead.empresa} (${lead.nome}) — IME ${f(pontuacao.ime)} ${pontuacao.classificacao}`
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:640px">
    <h2 style="margin:0 0 4px">Novo diagnóstico DME 360</h2>
    <p style="margin:0 0 16px;color:#666">Versão ${versao} · duração ${duracao}</p>
    <table style="border-collapse:collapse;margin-bottom:16px">
      <tr><td style="padding:2px 10px 2px 0"><b>Nome</b></td><td>${lead.nome}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>Empresa</b></td><td>${lead.empresa}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>Cargo</b></td><td>${lead.cargo ?? "—"}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>E-mail</b></td><td>${lead.email}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>WhatsApp</b></td><td>${lead.whatsapp}</td></tr>
    </table>
    <h3 style="margin:0 0 8px">IME 360: ${f(pontuacao.ime)} — ${pontuacao.classificacao}</h3>
    <table style="border-collapse:collapse;width:100%">
      <tr>
        <th style="padding:6px 10px;text-align:left;border-bottom:2px solid #333">Dimensão</th>
        <th style="padding:6px 10px;border-bottom:2px solid #333">Média</th>
        <th style="padding:6px 10px;text-align:left;border-bottom:2px solid #333">Classificação</th>
        <th style="padding:6px 10px;text-align:left;border-bottom:2px solid #333">Prioridade</th>
      </tr>
      ${linhas}
    </table>
    <p style="color:#666;margin-top:16px">Respostas completas gravadas no Supabase (tabela dme_submissions).</p>
  </div>`
  return { assunto, html }
}
```

Nota: os valores do lead vêm validados pelo zod (strings sem HTML relevante), e o e-mail é interno para o Victor — sem necessidade de sanitização adicional no MVP. Ainda assim, escapar `<` e `>` no lead é barato: aplicar `String(x).replaceAll("<", "&lt;").replaceAll(">", "&gt;")` nos 5 campos do lead ao montar o HTML.

- [ ] **Step 4: Criar `app/api/dme360/route.ts`**

```ts
import { NextResponse } from "next/server"
import { z } from "zod"
import { DME360_DIMENSOES, DME360_VERSAO } from "@/content/dme360"
import { calcularPontuacao } from "@/lib/dme360-score"
import { montarEmailResumo } from "@/lib/dme360-email"

const chavesQuestoes = DME360_DIMENSOES.flatMap((d) => d.questoes.map((q) => `${d.id}:${q.codigo}`))

const respostasShape = z.object(
  Object.fromEntries(chavesQuestoes.map((c) => [c, z.number().int().min(1).max(5)])),
)

const corpoSchema = z.object({
  lead: z.object({
    nome: z.string().trim().min(2).max(200),
    empresa: z.string().trim().min(2).max(200),
    cargo: z.string().trim().max(200).optional(),
    email: z.string().trim().email().max(200),
    whatsapp: z.string().trim().min(10).max(30),
    consentimento: z.literal(true),
  }),
  respostas: respostasShape,
  duracaoSegundos: z.number().int().positive().optional(),
  origem: z.string().trim().max(50).optional(),
})

export async function POST(request: Request) {
  const env = {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    resendKey: process.env.RESEND_API_KEY,
    emailTo: process.env.DME360_EMAIL_TO,
    emailFrom: process.env.DME360_EMAIL_FROM ?? "DME 360 <onboarding@resend.dev>",
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

  const pontuacao = calcularPontuacao(corpo.respostas)

  const registro = {
    nome: corpo.lead.nome,
    empresa: corpo.lead.empresa,
    cargo: corpo.lead.cargo ?? null,
    email: corpo.lead.email,
    whatsapp: corpo.lead.whatsapp,
    consentimento: corpo.lead.consentimento,
    respostas: corpo.respostas,
    pontuacao,
    ime: Number(pontuacao.ime.toFixed(2)),
    classificacao: pontuacao.classificacao,
    questionario_versao: DME360_VERSAO,
    duracao_segundos: corpo.duracaoSegundos ?? null,
    origem: corpo.origem ?? "link",
    email_enviado: false,
  }

  // 1) Grava primeiro — o dado nunca depende do e-mail.
  const insercao = await fetch(`${env.url}/rest/v1/dme_submissions`, {
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
    console.error("dme360: falha ao gravar no Supabase", insercao.status, await insercao.text())
    return NextResponse.json({ ok: false, erro: "Falha ao gravar. Tente novamente." }, { status: 502 })
  }
  const [linha] = (await insercao.json()) as { id: string }[]

  // 2) E-mail best-effort.
  if (env.resendKey && env.emailTo) {
    try {
      const { assunto, html } = montarEmailResumo(corpo.lead, pontuacao, DME360_VERSAO, corpo.duracaoSegundos)
      const envio = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.emailFrom, to: [env.emailTo], subject: assunto, html }),
      })
      if (envio.ok && linha) {
        await fetch(`${env.url}/rest/v1/dme_submissions?id=eq.${linha.id}`, {
          method: "PATCH",
          headers: {
            apikey: env.serviceKey,
            Authorization: `Bearer ${env.serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email_enviado: true }),
        })
      } else if (!envio.ok) {
        console.error("dme360: falha no e-mail", envio.status, await envio.text())
      }
    } catch (e) {
      console.error("dme360: erro no envio de e-mail", e)
    }
  }

  return NextResponse.json({
    ok: true,
    ime: Number(pontuacao.ime.toFixed(2)),
    classificacao: pontuacao.classificacao,
  })
}
```

- [ ] **Step 5: Verificar tipos, lint, build e comportamento sem envs**

Run: `npx tsc --noEmit && npx eslint app/api/dme360/route.ts lib/dme360-email.ts && npm run build`
Expected: limpos. Depois, com `npm run dev` rodando:

```bash
curl -s -X POST http://localhost:3000/api/dme360 -H "Content-Type: application/json" -d '{}'
```

Expected: `{"ok":false,"erro":"Configuração do banco pendente."}` (503 — envs ainda não existem).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json app/api/dme360/route.ts lib/dme360-email.ts supabase/schema.sql
git commit -m "feat: add DME360 submission API with Supabase persistence and Resend summary email"
```

---

### Task 5: Wizard `/dme360` (página + componente client)

**Files:**
- Create: `app/dme360/page.tsx`
- Create: `components/dme360/dme-wizard.tsx`

**Interfaces:**
- Consumes: `DME360_DIMENSOES`, `DME360_ESCALA`, `DME360_VERSAO` (Task 1); `calcularPontuacao` (Task 2); classes `.dme-*` (Task 3); `POST /api/dme360` (Task 4); `linkWhatsapp` de `@/content/site`.

- [ ] **Step 1: Criar `app/dme360/page.tsx`**

```tsx
import type { Metadata } from "next"
import { DmeWizard } from "@/components/dme360/dme-wizard"

export const metadata: Metadata = {
  title: "DME 360 — Diagnóstico de Maturidade Empresarial | Versak",
  description: "Responda o DME 360 e descubra o nível de maturidade da gestão da sua empresa.",
  robots: { index: false, follow: false },
}

export default function Dme360Page() {
  return (
    <main className="min-h-screen py-10 sm:py-16">
      <DmeWizard />
    </main>
  )
}
```

- [ ] **Step 2: Criar `components/dme360/dme-wizard.tsx`**

Comportamentos obrigatórios (o código abaixo é a implementação completa):

- Passos: `0` identificação · `1..7` dimensões · `8` tela final.
- Rascunho: `localStorage["dme360-draft-v1"]` = `{ versao, passo, lead, respostas, iniciadoEm }`; gravado a cada mudança (lead, resposta, passo); descartado se `versao !== DME360_VERSAO`; limpo após envio ok; aviso "Retomamos de onde você parou" quando carrega rascunho com respostas.
- Avanço bloqueado enquanto a dimensão tiver pergunta sem resposta (botão mostra "Faltam N").
- Envio: `POST /api/dme360`; sucesso → passo 8 com IME/classificação retornados pelo servidor; erro → mensagem e botão "Tentar de novo" (rascunho preservado).
- Origem: querystring `?o=...` (ex.: `?o=palestra`) capturada uma vez e enviada como `origem`.
- Rolagem para o topo ao trocar de passo.

```tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DME360_DIMENSOES, DME360_ESCALA, DME360_VERSAO } from "@/content/dme360"
import { linkWhatsapp } from "@/content/site"

type Lead = { nome: string; empresa: string; cargo: string; email: string; whatsapp: string; consentimento: boolean }
type Draft = { versao: string; passo: number; lead: Lead; respostas: Record<string, number>; iniciadoEm: number }

const CHAVE_DRAFT = "dme360-draft-v1"
const LEAD_VAZIO: Lead = { nome: "", empresa: "", cargo: "", email: "", whatsapp: "", consentimento: false }
const TOTAL_QUESTOES = DME360_DIMENSOES.reduce((a, d) => a + d.questoes.length, 0)

const DESCRICAO_FAIXA: Record<string, string> = {
  "Caótico": "Ausência de padrões, controles e previsibilidade; gestão reativa e dependente de pessoas-chave.",
  "Consciente": "Reconhecimento dos problemas e existência de iniciativas isoladas, ainda sem consistência.",
  "Definido": "Processos, práticas e responsabilidades formalizados; gestão parcialmente estruturada.",
  "Gerenciado": "Gestão sistemática baseada em indicadores, rituais e acompanhamento recorrente.",
  "Otimizado": "Melhoria contínua, inovação, aprendizado organizacional e alta performance sustentada.",
}

function carregarDraft(): Draft | null {
  try {
    const bruto = localStorage.getItem(CHAVE_DRAFT)
    if (!bruto) return null
    const draft = JSON.parse(bruto) as Draft
    return draft.versao === DME360_VERSAO ? draft : null
  } catch {
    return null
  }
}

export function DmeWizard() {
  const [pronto, setPronto] = useState(false)
  const [retomado, setRetomado] = useState(false)
  const [passo, setPasso] = useState(0)
  const [lead, setLead] = useState<Lead>(LEAD_VAZIO)
  const [respostas, setRespostas] = useState<Record<string, number>>({})
  const [iniciadoEm, setIniciadoEm] = useState<number>(() => Date.now())
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{ ime: number; classificacao: string } | null>(null)
  const origemRef = useRef("link")

  useEffect(() => {
    const draft = carregarDraft()
    if (draft) {
      setPasso(draft.passo)
      setLead(draft.lead)
      setRespostas(draft.respostas)
      setIniciadoEm(draft.iniciadoEm)
      if (Object.keys(draft.respostas).length > 0) setRetomado(true)
    }
    const origem = new URLSearchParams(window.location.search).get("o")
    if (origem) origemRef.current = origem.slice(0, 50)
    setPronto(true)
  }, [])

  useEffect(() => {
    if (!pronto || resultado) return
    const draft: Draft = { versao: DME360_VERSAO, passo, lead, respostas, iniciadoEm }
    localStorage.setItem(CHAVE_DRAFT, JSON.stringify(draft))
  }, [pronto, passo, lead, respostas, iniciadoEm, resultado])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [passo])

  const totalRespondidas = Object.keys(respostas).length
  const dimensaoAtual = passo >= 1 && passo <= 7 ? DME360_DIMENSOES[passo - 1] : undefined
  const faltamNaDimensao = useMemo(() => {
    if (!dimensaoAtual) return 0
    return dimensaoAtual.questoes.filter((q) => respostas[`${dimensaoAtual.id}:${q.codigo}`] === undefined).length
  }, [dimensaoAtual, respostas])

  const leadValido =
    lead.nome.trim().length >= 2 &&
    lead.empresa.trim().length >= 2 &&
    /.+@.+\..+/.test(lead.email) &&
    lead.whatsapp.replace(/\D/g, "").length >= 10 &&
    lead.consentimento

  async function enviar() {
    setEnviando(true)
    setErroEnvio(null)
    try {
      const resposta = await fetch("/api/dme360", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: {
            nome: lead.nome.trim(),
            empresa: lead.empresa.trim(),
            cargo: lead.cargo.trim() || undefined,
            email: lead.email.trim(),
            whatsapp: lead.whatsapp.trim(),
            consentimento: true,
          },
          respostas,
          duracaoSegundos: Math.round((Date.now() - iniciadoEm) / 1000),
          origem: origemRef.current,
        }),
      })
      const json = (await resposta.json()) as { ok: boolean; ime?: number; classificacao?: string; erro?: string }
      if (!resposta.ok || !json.ok || json.ime === undefined || !json.classificacao) {
        throw new Error(json.erro ?? "Falha no envio.")
      }
      localStorage.removeItem(CHAVE_DRAFT)
      setResultado({ ime: json.ime, classificacao: json.classificacao })
      setPasso(8)
    } catch (e) {
      setErroEnvio(e instanceof Error ? e.message : "Falha no envio. Verifique sua conexão.")
    } finally {
      setEnviando(false)
    }
  }

  if (!pronto) return null

  return (
    <div className="mx-auto w-full max-w-3xl px-5">
      <header className="mb-8 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold">Versak</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-text sm:text-3xl">
          DME 360 — Diagnóstico de Maturidade Empresarial
        </h1>
        {passo >= 1 && passo <= 7 && (
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-text-dim">
              <span>Dimensão {passo} de 7</span>
              <span>{totalRespondidas}/{TOTAL_QUESTOES} respondidas</span>
            </div>
            <div className="dme-progress">
              <div className="dme-progress-fill" style={{ width: `${(totalRespondidas / TOTAL_QUESTOES) * 100}%` }} />
            </div>
          </div>
        )}
      </header>

      {retomado && passo < 8 && (
        <p className="mb-6 rounded-md border border-gold-dim bg-panel px-4 py-2 text-center text-sm text-gold-bright">
          Retomamos de onde você parou.
        </p>
      )}

      {passo === 0 && (
        <section className="dme-card">
          <p className="text-sm leading-relaxed text-text-muted">
            Avalie a maturidade da gestão da sua empresa em 7 dimensões. São {TOTAL_QUESTOES} perguntas rápidas
            (35–45 minutos). Seu progresso fica salvo neste navegador — você pode pausar e voltar quando quiser.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(
              [
                ["nome", "Nome*", "text"],
                ["empresa", "Empresa*", "text"],
                ["cargo", "Cargo", "text"],
                ["email", "E-mail*", "email"],
                ["whatsapp", "WhatsApp*", "tel"],
              ] as const
            ).map(([campo, rotulo, tipo]) => (
              <label key={campo} className="flex flex-col gap-1 text-sm text-text-muted">
                {rotulo}
                <input
                  type={tipo}
                  value={lead[campo]}
                  onChange={(e) => setLead((l) => ({ ...l, [campo]: e.target.value }))}
                  className="rounded-md border border-line bg-panel px-3 py-2 text-text outline-none focus:border-gold-dim"
                />
              </label>
            ))}
          </div>
          <label className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-text-dim">
            <input
              type="checkbox"
              checked={lead.consentimento}
              onChange={(e) => setLead((l) => ({ ...l, consentimento: e.target.checked }))}
              className="mt-0.5"
            />
            Autorizo a Versak a usar estes dados para me apresentar o resultado do diagnóstico e entrar em contato.*
          </label>
          <button
            type="button"
            disabled={!leadValido}
            onClick={() => setPasso(1)}
            className="mt-6 w-full rounded-sm bg-gold px-6 py-3 font-display text-sm font-semibold tracking-wide text-bg transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-40"
          >
            Começar o diagnóstico
          </button>
        </section>
      )}

      {dimensaoAtual && (
        <section>
          <div className="dme-card mb-6">
            <h2 className="font-display text-xl font-semibold text-gold">{dimensaoAtual.nome}</h2>
            {dimensaoAtual.descricao && (
              <p className="mt-2 text-sm italic leading-relaxed text-text-muted">{dimensaoAtual.descricao}</p>
            )}
            <p className="mt-3 text-xs text-text-dim">
              Para cada pergunta, escolha de 1 ({DME360_ESCALA[0]?.rotulo}) a 5 ({DME360_ESCALA[4]?.rotulo}).
            </p>
          </div>

          {[...new Set(dimensaoAtual.questoes.map((q) => q.subdimensao))].map((sub) => (
            <div key={sub} className="mb-6">
              <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.18em] text-text-dim">
                {sub}
              </h3>
              <div className="flex flex-col gap-3">
                {dimensaoAtual.questoes
                  .filter((q) => q.subdimensao === sub)
                  .map((q) => {
                    const chave = `${dimensaoAtual.id}:${q.codigo}`
                    const valor = respostas[chave]
                    return (
                      <div key={chave} className="dme-card">
                        <p className="text-sm leading-relaxed text-text">{q.pergunta}</p>
                        <div className="mt-3 grid grid-cols-5 gap-2">
                          {DME360_ESCALA.map((item) => (
                            <button
                              key={item.nota}
                              type="button"
                              title={item.descricao}
                              onClick={() => setRespostas((r) => ({ ...r, [chave]: item.nota }))}
                              className={`dme-option ${valor === item.nota ? "dme-option-ativa" : ""}`}
                            >
                              <span className="font-display text-base font-bold">{item.nota}</span>
                              <span className="hidden text-[10px] sm:block">{item.rotulo}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setPasso((p) => p - 1)}
              className="rounded-sm border border-line px-5 py-3 font-display text-sm text-text-muted transition-colors hover:border-gold-dim hover:text-text"
            >
              Voltar
            </button>
            {passo < 7 ? (
              <button
                type="button"
                disabled={faltamNaDimensao > 0}
                onClick={() => setPasso((p) => p + 1)}
                className="rounded-sm bg-gold px-6 py-3 font-display text-sm font-semibold text-bg transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-40"
              >
                {faltamNaDimensao > 0 ? `Faltam ${faltamNaDimensao}` : "Próxima dimensão"}
              </button>
            ) : (
              <button
                type="button"
                disabled={faltamNaDimensao > 0 || enviando}
                onClick={enviar}
                className="rounded-sm bg-gold px-6 py-3 font-display text-sm font-semibold text-bg transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-40"
              >
                {enviando ? "Enviando..." : faltamNaDimensao > 0 ? `Faltam ${faltamNaDimensao}` : "Concluir e enviar"}
              </button>
            )}
          </div>
          {erroEnvio && (
            <p className="mt-4 text-center text-sm text-red-400">
              {erroEnvio} — seus dados continuam salvos neste navegador.
            </p>
          )}
        </section>
      )}

      {passo === 8 && resultado && (
        <section className="dme-card text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-text-dim">Seu IME 360</p>
          <p className="mt-2 font-display text-6xl font-bold text-gold">{resultado.ime.toFixed(2).replace(".", ",")}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-text">{resultado.classificacao}</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-muted">
            {DESCRICAO_FAIXA[resultado.classificacao] ?? ""}
          </p>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-text-muted">
            O relatório completo, dimensão por dimensão, será apresentado pela equipe Versak.
          </p>
          <a
            href={linkWhatsapp("Olá! Acabei de concluir o DME 360 e gostaria de conversar sobre o meu resultado.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-sm bg-gold px-6 py-3 font-display text-sm font-semibold text-bg transition-colors hover:bg-gold-bright"
          >
            Falar com a Versak no WhatsApp
          </a>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verificar tipos, lint e build**

Run: `npx tsc --noEmit && npx eslint app/dme360/page.tsx components/dme360/dme-wizard.tsx && npm run build`
Expected: limpos.

- [ ] **Step 4: Verificação manual (dev server)**

Com `npm run dev`: abrir `http://localhost:3000/dme360` e conferir:
- Passo 0: botão só habilita com obrigatórios + consentimento; visual dark/gold coerente com o site.
- Responder algumas perguntas, **recarregar a página** → aviso "Retomamos de onde você parou" e estado preservado.
- Avanço bloqueado com contador "Faltam N"; barra de progresso cresce.
- Responder **uma dimensão completa de verdade** (as demais podem ficar para o teste ponta a ponta da Task 6); confirmar que o botão da etapa 7 mostraria "Concluir e enviar".
- Para testar o caminho de envio sem preencher tudo: `curl` direto na API com payload incompleto já foi validado na Task 4; aqui basta confirmar que, com envs ausentes, um envio real (se feito) mostra o erro amigável e preserva o rascunho.
- Mobile ~375px: escala 1–5 utilizável, sem scroll horizontal.

- [ ] **Step 5: Commit**

```bash
git add app/dme360/page.tsx components/dme360/dme-wizard.tsx
git commit -m "feat: add DME360 wizard page with autosave, per-dimension steps and partial result screen"
```

---

### Task 6 (INTERATIVA — controlador + usuário, não despachar a subagente): Setup Supabase + Resend + teste ponta a ponta

**Files:**
- Create: `.env.local` (não commitado — já coberto pelo `.gitignore` via `.env*`)

**Pré-requisito:** Tasks 1–5 completas. Esta tarefa é conduzida em chat com o Matheus (ele declarou não saber configurar Supabase).

- [ ] **Step 1: Supabase (guiar o Matheus clique a clique)**
  1. Criar conta em supabase.com (login com GitHub é o caminho rápido).
  2. "New project": nome `versak`, região `South America (São Paulo)`, gerar senha forte do banco (guardar).
  3. Menu lateral → SQL Editor → New query → colar o conteúdo de `supabase/schema.sql` → Run. Esperado: "Success. No rows returned".
  4. Menu Project Settings → API: copiar `Project URL` e a chave `service_role` (secret).
  5. Criar `.env.local` na raiz do repo com:
     ```
     SUPABASE_URL=<Project URL>
     SUPABASE_SERVICE_ROLE_KEY=<service_role>
     ```
     (Matheus cola os valores direto no arquivo; alternativa: colar no chat e o controlador escreve o arquivo.)

- [ ] **Step 2: Resend (guiar o Matheus)**
  1. Criar conta em resend.com → API Keys → Create API key (permissão "Sending access").
  2. Adicionar ao `.env.local`:
     ```
     RESEND_API_KEY=<chave>
     DME360_EMAIL_TO=matheus.dev23@gmail.com
     ```
     (Sandbox do Resend só entrega para o e-mail do dono da conta — começar com o do Matheus.)
  3. Domains → Add domain → `versak.com.br` → anotar os registros DNS (SPF/DKIM) que o Resend pedir → adicionar onde o DNS do domínio é gerenciado → aguardar verificação.
  4. Quando verificado: trocar `DME360_EMAIL_TO=comercial@versak.com.br` e adicionar `DME360_EMAIL_FROM=DME 360 <dme360@versak.com.br>`.

- [ ] **Step 3: Teste ponta a ponta local**
  - `npm run dev` → preencher o formulário inteiro de verdade (ou com apoio do controlador) → enviar.
  - Conferir: resposta de sucesso na tela (IME + classificação); linha nova em Supabase → Table Editor → `dme_submissions` (respostas, pontuação, ime coerentes); e-mail recebido com o resumo; `email_enviado=true` na linha; rascunho do navegador limpo.

- [ ] **Step 4: Registrar no ledger que o ambiente local está validado.**

---

### Task 7 (INTERATIVA): Deploy preview na Vercel e entrega do link

- [ ] **Step 1:** Push da branch: `git push -u origin dme360` (se pedir credencial, o Matheus autentica).
- [ ] **Step 2:** No painel da Vercel (projeto do site): Settings → Environment Variables → adicionar `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `DME360_EMAIL_TO` (e `DME360_EMAIL_FROM` quando o domínio verificar) para **Preview e Production**.
- [ ] **Step 3:** Abrir o deploy de preview da branch `dme360` → testar `https://<preview>/dme360` ponta a ponta (envio real → Supabase + e-mail).
- [ ] **Step 4:** Entregar o link de preview para o Victor testar. Merge em `master` (produção) só após o OK dele — decisão do usuário.

---

## Resumo de arquivos

**Novos:** `scripts/import-dme360.mjs`, `content/dme360.ts` (gerado), `lib/dme360-score.ts`, `scripts/verify-dme360-score.ts`, `lib/dme360-email.ts`, `app/api/dme360/route.ts`, `app/dme360/page.tsx`, `components/dme360/dme-wizard.tsx`, `supabase/schema.sql`, `.env.local` (não versionado).

**Modificados:** `package.json`/`package-lock.json` (dep `zod`; devDeps `xlsx`, `tsx`; scripts `dme360:import`, `dme360:verify`), `theme/tokens.css` (bloco `.dme-*`).

**Intocados:** todo o site existente (`app/page.tsx`, seções, `content/site.ts`, `content/home.ts`).
