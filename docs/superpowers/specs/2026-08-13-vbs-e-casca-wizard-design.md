# VBS + casca de wizard compartilhada — Design

Data: 2026-08-13
Status: Aprovado pelo Matheus. Branch: `dme360` (continuação — o motor de pontuação, a API e o import do DME360 já estão commitados nela).

## Contexto

O Victor aprovou um protótipo HTML (`versak-highlights-prototipo_2.html`) com uma experiência de preenchimento muito superior à que existe hoje no `/dme360`: tela dividida com trilho fixo, anel de progresso, navegação por dropdown entre blocos, "salvar e sair" com tela de confirmação, e o aviso permanente de autosave. Como o questionário é longo, a chance de abandono é alta — o respondente precisa **sentir** que pode sair sem perder nada.

Além disso a prioridade mudou: antes do Highlights (245 perguntas, já implementado), o Victor precisa em **2–3 dias** de um instrumento menor, o **VBS — Versak Business Snapshot** (`VBS_Versak_Ficha Cadastral.xlsx`), uma ficha de contexto de 5–10 minutos.

**Decisão central:** o protótipo não é o design do VBS, é o design dos dois. Construímos a casca uma vez e alimentamos com dois conteúdos.

## Decisões fechadas com o usuário

- **Tela final do VBS: só agradecimento.** O Excel do VBS não tem fórmula de pontuação e não vamos inventar uma. O respondente vê confirmação + CTA WhatsApp; o Victor recebe a ficha inteira por e-mail.
- **Sem gate de código de acesso no VBS.** Link direto. A tela de código do protótipo fica para a fase Hotmart.
- **Resultado parcial continua valendo no Highlights.** O respondente vê IME 360 + classificação; o detalhe por dimensão fica com o Victor. A barra-por-pilar do protótipo era prévia visual, não decisão de negócio.
- **Ordem:** Fase A = VBS completo e funcionando. Fase B = migrar o `/dme360` para a casca nova.
- **Rota `/vbs`** (curta, fácil de mandar no WhatsApp).
- Duas tabelas separadas no Supabase (`vbs_submissions`, `dme_submissions`) — os instrumentos são diferentes; um tem nota, o outro não.

### Decisões tomadas pelo assistente e ratificadas

- **Contato não existe no Excel.** A ficha tem "Nome do respondente" e "Cargo", mas nenhum e-mail ou telefone — o Victor não teria como retornar. A tela de boas-vindas coleta **nome, empresa, e-mail, WhatsApp e aceite LGPD**. Em troca, saem do bloco 1 o campo "Nome do respondente" (duplicado) e "Data do preenchimento" (gravada automaticamente pelo servidor).
- **Obrigatoriedade** (ajustável): obrigatórios são Razão social, Cidade/Estado, os 5 campos de lista do bloco 2, as 22 perguntas do bloco 3, Prioridade percebida, Tempo desejado, Principal objetivo e Maior dificuldade. O resto é opcional — a ficha precisa caber em 5–10 minutos.
- **O anel de progresso conta apenas campos obrigatórios**, senão nunca chegaria a 100% para quem pula os opcionais.

## Estrutura do VBS (extraída do xlsx)

45 campos em 4 blocos (47 no Excel, menos os 2 removidos acima).

### Bloco 1 — Identificação da empresa (6)
Razão social* · Nome fantasia · CNPJ · Cidade / Estado* · Site / rede social · Cargo / função

### Bloco 2 — Perfil do negócio (9)
| Campo | Tipo |
|---|---|
| Segmento principal* | lista (10 opções) |
| Principais produtos ou serviços | texto longo |
| Porte de Faturamento Anual - mais recente* | lista (11 opções) |
| Número aproximado de funcionários | número |
| Número aproximado de clientes ativos | número |
| Mercado de atuação* | lista (5) |
| Tipo predominante de cliente* | lista (5) |
| Tempo de atuação da empresa (anos) | número |
| Tendência atual do negócio* | lista (4) |

### Bloco 3 — Panorama empresarial (22, todas obrigatórias)
22 perguntas fechadas, todas respondidas com **Sim · Parcialmente · Não · Não se aplica**. Vão de "A empresa possui missão, visão e valores definidos?" a "Há acompanhamento de produtividade e desempenho das equipes?".

### Bloco 4 — Objetivos e prioridades (8)
Principal objetivo para os próximos 12 meses* (texto longo) · Segundo objetivo prioritário (texto longo) · Maior dificuldade atual da empresa* (texto longo) · Área que mais precisa de melhoria (texto) · Impacto esperado com uma consultoria (texto longo) · Prioridade percebida* (lista 4) · Tempo desejado para alcançar resultados* (lista 5) · Observação final do respondente (texto longo)

### Listas suspensas (aba `Listas`)
`Resposta` (4) · `Seguimento Principal` (10) · `Porte de Faturamento` (11) · `Mercado` (5) · `Tipo de cliente` (5) · `Prioridade` (4) · `Horizonte` (5) · `Crescimento` (4). São geradas junto com os campos — nenhuma lista fica hardcoded no componente.

## Arquitetura

### Modelo compartilhado (`lib/wizard-types.ts`)

Os dois instrumentos reduzem à mesma forma. A casca só conhece isto:

```ts
export type CampoOpcao = { valor: string | number; rotulo: string; descricao?: string }
export type CampoTipo = "texto" | "texto-longo" | "numero" | "opcoes" | "escala"
export type Campo = {
  chave: string          // chave única da resposta
  rotulo: string
  tipo: CampoTipo
  opcoes?: CampoOpcao[]  // obrigatório quando tipo é "opcoes" ou "escala"
  obrigatorio: boolean
  grupo?: string         // subdimensão (só o Highlights usa)
  placeholder?: string
}
export type Etapa = { id: string; nome: string; descricao?: string | null; campos: Campo[] }
export type Questionario = {
  id: string             // "vbs" | "dme360"
  versao: string
  rotuloEtapa: string    // "Bloco" | "Dimensão"
  tempoEstimado: string  // "5 a 10 minutos"
  etapas: Etapa[]
}
```

`escala` e `opcoes` compartilham a estrutura; muda só o desenho do controle (5 botões numerados com legenda nas pontas × botões com rótulo por extenso). Adaptadores puros convertem cada conteúdo: `lib/vbs-questionario.ts` e `lib/dme360-questionario.ts`.

### Conteúdo gerado (`content/vbs.ts`)

`scripts/import-vbs.mjs` lê o xlsx e gera `content/vbs.ts` (commitado, como já é feito no DME360): blocos, campos com tipo/obrigatoriedade/opções, as 8 listas e `VBS_VERSAO = "vbs-r1"`. Mesma filosofia do `dme360:import` — quando o Victor revisar a ficha, roda o script de novo e sobe nova versão. npm script: `vbs:import`.

O mapeamento tipo-por-campo e a obrigatoriedade **moram no script**, numa tabela explícita por linha do Excel, porque o xlsx não carrega essa informação (as validações de lista dizem quais células têm dropdown, mas não o que é obrigatório nem o que é texto longo).

### Casca do wizard (`components/wizard/`)

- `wizard.tsx` — orquestra: recebe um `Questionario`, um handler de envio e o conteúdo da tela final; controla telas (boas-vindas → questionário → pausa → concluído), etapa atual, respostas e autosave.
- `wizard-rail.tsx` — trilho: logo, anel de progresso, nome da etapa atual, dropdown de navegação, linha "Progresso salvo automaticamente", botão "Salvar e sair".
- `progress-ring.tsx` — anel SVG com `stroke-dashoffset` animado (do protótipo).
- `etapa-dropdown.tsx` — navegação: ✓ nas etapas completas, contador `respondidas/total` em cada.
- `campo.tsx` — renderiza um campo conforme o tipo. Único lugar que conhece os 5 tipos.
- `use-wizard-draft.ts` — hook de autosave versionado em `localStorage` (`wizard-draft-<id>-v1`), descarta rascunho de versão diferente.

O `/dme360` atual (`components/dme360/dme-wizard.tsx`) é **substituído** na Fase B. O que sobrevive intacto: `lib/dme360-score.ts`, `app/api/dme360/route.ts`, `lib/dme360-email.ts`, `content/dme360.ts`, `scripts/import-dme360.mjs`.

### Estilos

Novas classes `.wz-*` em `theme/tokens.css` (regra do projeto: cor hardcoded só lá). Três tokens novos vindos do protótipo: `--color-rail: #100D08`, `--color-line-soft: #211B12`, `--color-danger: #C0644A`. As demais cores do protótipo já batem exatamente com os tokens existentes, e as fontes (Oswald + Inter) já são as do site.

Responsivo: abaixo de 900px o trilho vira barra horizontal no topo (anel reduzido, dropdown compacto, "salvar e sair" à direita), como no protótipo.

### API e banco

`POST /api/vbs` — valida com zod (lead + respostas conforme o gabarito de `content/vbs.ts`: obrigatórios presentes, valores de lista dentro das opções válidas), grava no Supabase, dispara e-mail para o Victor, responde `{ ok: true }`. Mesmo padrão já usado no `/api/dme360`: **grava primeiro, e-mail é best-effort**, com `AbortSignal.timeout` nas chamadas externas e `maxDuration` no route.

```sql
create table public.vbs_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  empresa text not null,
  email text not null,
  whatsapp text not null,
  consentimento boolean not null,
  respostas jsonb not null,           -- { "razao-social": "...", "panorama-01": "Sim", ... }
  questionario_versao text not null,
  duracao_segundos integer,
  origem text not null default 'link',
  email_enviado boolean not null default false
);
alter table public.vbs_submissions enable row level security;
-- Sem policies: acesso só pelo servidor com a service role key.
```

O e-mail para o Victor traz a ficha inteira agrupada pelos 4 blocos, campo e resposta, mais os dados de contato e a duração.

## Fases

**Fase A — VBS** (prazo do Victor): conteúdo gerado → modelo compartilhado → estilos → casca + página `/vbs` navegável → API + banco + e-mail. Entrega funcionando.

**Fase B — Highlights**: adaptador do DME360 + migração do `/dme360` para a casca, removendo o wizard antigo. Pontuação e API inalteradas.

Depois das duas: setup guiado do Supabase/Resend e deploy na Vercel (tarefas interativas com o Matheus).

## Fora de escopo (registrado)

- Gancho de abandono via Power Automate (lembrete para quem parou no meio). O protótipo tem o esqueleto; fica para a fase 2.
- Hotmart/Eduzz, código de acesso, liberação automática.
- Pontuação do VBS — não existe metodologia definida; se o Victor criar uma, entra depois sem mexer na casca.
- Painel admin, multi-idioma, rate-limiting, PDF.

## Verificação

Sem framework de testes no repo. Por tarefa: `npx tsc --noEmit` + `npx eslint .` + `npm run build` limpos. O adaptador do questionário ganha script próprio de verificação (`npm run vbs:verify`) conferindo contagem de blocos/campos, obrigatórios, e que toda lista suspensa tem opções não vazias. Teste manual no navegador (desktop + 375px): preencher parcialmente, "salvar e sair", reabrir e confirmar retomada; navegar pelo dropdown; conferir bloqueio de avanço com obrigatórios em falta; conferir que o anel chega a 100%. Ponta a ponta (linha no Supabase + e-mail) na tarefa de setup.
