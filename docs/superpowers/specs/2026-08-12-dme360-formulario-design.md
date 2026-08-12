# DME 360 — Formulário de diagnóstico online (MVP palestra)

Data: 2026-08-12
Status: Design aprovado pelo usuário (Matheus). Branch: `dme360` (a partir de `master`, que já contém o redesign publicado em versak.com.br).

## Contexto

Victor (fundador da Versak) fará uma palestra para ~60 empresários em 1–2 semanas e precisa de uma página avulsa com o formulário do **DME 360 Highlights** (Diagnóstico de Maturidade Empresarial) funcionando: um link que ele manda pessoa a pessoa, o empresário responde, o resultado resumido aparece na tela e os dados completos chegam para o Victor. A fonte é a planilha `DME360_7D HIGHLIGHTS_VERSAK.xlsx` (cópia na raiz da pasta `Versak/`).

Existe uma base futura (`versak-dashboard`, esqueleto React+Supabase com auth/admin), mas ela não está operacional e não cabe no prazo. **Decisão:** o MVP vive no site atual (Next.js), gravando num banco Supabase que será o mesmo do dashboard na fase 2 — nada do MVP é descartável.

## Decisões fechadas com o usuário

- Prazo: 1–2 semanas (palestra do Victor).
- **Rota `/dme360`** no site atual, fora do menu (link direto). Evita conflito com a âncora `#diagnostico` da home.
- **245 perguntas completas** do Excel (7 dimensões × ~35).
- **Resultado parcial na tela**: só IME 360 + classificação + CTA WhatsApp. Detalhe por dimensão fica com o Victor.
- **E-mail por envio + banco**: cada envio grava no Supabase e dispara e-mail-resumo para `comercial@versak.com.br`.
- Matheus não sabe configurar Supabase → o plano inclui tarefa guiada (SQL pronto + passo-a-passo de cliques + acompanhamento em chat).
- Fase 2 (fora deste escopo): Hotmart/Eduzz → código de acesso → liberação automática; admin no dashboard lendo a mesma tabela.

## Estrutura do questionário (extraída do Excel)

- **7 dimensões** (abas): Governança e Cultura (34 q), Estratégia (37), Pessoas (34), Comercial (35), Financeiro (35), Operações (35), Cliente (35) = **245 perguntas**.
- Cada dimensão tem **7 subdimensões**: Estrutura, Processos, Indicadores, Pessoas, Tecnologia, Melhoria Contínua, Performance.
- Cada pergunta: `numero`, `codigo` (S1.1…), `subdimensao`, `pergunta`. Resposta: nota inteira **1–5**.
- Cada aba tem na linha 2 um texto descritivo da dimensão (aspas do Victor) — usado como abertura da etapa. A aba Cliente não tem descrição (tratar como opcional).
- Pesos (aba Pesos): Governança 0,15 · Estratégia 0,15 · Pessoas 0,15 · Comercial 0,15 · Financeiro 0,15 · Operações 0,15 · Cliente 0,10 (soma 1,00).
- Escala de maturidade (aba Instruções): 1 Caótico · 2 Consciente · 3 Definido · 4 Gerenciado · 5 Otimizado (com descrições).

### Motor de pontuação (fiel às fórmulas do Excel)

Extraído das fórmulas reais (a aba Resumo Executivo do arquivo está com `#REF!` quebrados; a intenção é inequívoca pelas fórmulas das abas de dimensão — avisar o Victor que a planilha em si está quebrada, a ferramenta substitui):

1. **Média da subdimensão** = média das notas das perguntas daquela subdimensão (`AVERAGEIF` por Subdimensão).
2. **Média da dimensão** = **média das 7 médias de subdimensão** (`AVERAGE(J20:J26)`) — não é a média direta das 245 perguntas (subdimensões têm tamanhos desiguais).
3. **IME 360** = soma de (média da dimensão × peso).
4. **Classificação** (por dimensão e para o IME): `<2` Caótico · `<3` Consciente · `<4` Definido · `<4,5` Gerenciado · senão Otimizado.
5. **Prioridade** (por dimensão, para o e-mail do Victor): `<2` Crítica · `<3` Alta · `<4` Média · `<4,5` Baixa · senão Manutenção.

## Arquitetura

### Conteúdo do questionário: `content/dme360.ts` gerado por script

- Script one-off `scripts/import-dme360.mjs` (devDep `xlsx`): lê o arquivo Excel e **gera** `content/dme360.ts` com: dimensões (id, nome, descrição, peso), perguntas (código, subdimensão, texto), escala (valores, rótulos, descrições), faixas de classificação/prioridade e `versao` (constante `"highlights-v1"`).
- O TS gerado é commitado (o site não lê Excel em runtime). Quando o Victor atualizar a planilha: roda-se o script de novo e sobe nova versão.
- npm script: `dme360:import`. O caminho do xlsx é argumento (default: `../DME360_7D HIGHLIGHTS_VERSAK.xlsx` — mover a cópia para dentro da pasta Versak/ raiz já existente).

### Página `/dme360` (App Router)

- `app/dme360/page.tsx`: Server Component fino (metadata com `robots: { index: false }` — link não indexado; título "DME 360 — Versak") que renderiza o componente client do wizard.
- `components/dme360/dme-wizard.tsx` (client): todo o fluxo.
  - **Passo 0 — abertura/identificação**: branding (dark/gold do site), explicação curta (o que é, ~35–45 min, pode pausar e voltar), campos: nome*, empresa*, cargo (opcional), e-mail*, WhatsApp*, checkbox de consentimento LGPD* (texto curto: dados usados pela Versak para retorno do diagnóstico). Validação simples no client (e-mail com formato válido, obrigatórios preenchidos).
  - **Passos 1–7 — uma dimensão por passo**: título + descrição da dimensão; perguntas agrupadas por subdimensão (cabeçalho de grupo); cada pergunta com 5 botões (1–5) mostrando número + rótulo de maturidade; obrigatório responder todas para avançar (botão "Próxima dimensão" desabilitado com contador "faltam N"); barra de progresso global (respondidas/245) e indicação do passo (ex.: "Dimensão 3 de 7").
  - **Autosave**: cada mudança grava em `localStorage` (lead + respostas + passo atual + timestamps). Ao abrir a página com rascunho salvo: retoma de onde parou (aviso discreto "retomamos de onde você parou"). Limpa após envio com sucesso.
  - **Envio (após passo 7)**: calcula pontuação no client (exibição) e envia `POST /api/dme360` com lead + respostas brutas; o servidor **recalcula** a pontuação (fonte da verdade) antes de gravar.
  - **Tela final**: IME 360 (número com 2 casas), classificação com descrição da faixa, CTA WhatsApp (link `linkWhatsapp()` já existente com mensagem específica do diagnóstico), aviso "o relatório completo por dimensão será apresentado pela equipe Versak".
  - Estados de erro: falha de rede no envio → mantém dados, botão tentar de novo (nada se perde: rascunho continua no localStorage).
- Estilo: identidade existente (tokens dark/gold, cartões de vidro leves). Novas classes `.dme-*` em `theme/tokens.css` (regra do projeto: cor hardcoded só lá). Sem animações pesadas — legibilidade primeiro (245 perguntas).

### Motor de pontuação compartilhado

- `lib/dme360-score.ts`: função pura `calcularPontuacao(respostas) → { porSubdimensao, porDimensao (média+classificação+prioridade), ime, classificacao }`. Usada pelo client (tela final) e pelo servidor (gravação/e-mail). Testável de forma isolada (script de verificação com caso conhecido, já que o repo não tem framework de teste).

### API `POST /api/dme360` (route handler)

- Validação com `zod` (dependência nova, uso só no servidor): shape do lead, consentimento true, respostas completas (245 chaves, valores 1–5, códigos batendo com `content/dme360.ts`).
- Fluxo: valida → recalcula pontuação → **grava no Supabase** (client `@supabase/supabase-js` com `SUPABASE_SERVICE_ROLE_KEY`, só no servidor) → tenta enviar e-mail (Resend via `fetch`, sem SDK) → responde `{ ok: true }`. Falha no e-mail **não** falha a requisição: grava `email_enviado: false` e loga (dado nunca se perde; reenvio manual depois).
- Sem rate-limit no MVP (link distribuído pessoalmente; risco baixo — registrado como melhoria futura).

### Banco (Supabase)

- Projeto novo (free tier, região São Paulo). Arquivo versionado `supabase/schema.sql`:

```sql
create table public.dme_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  empresa text not null,
  cargo text,
  email text not null,
  whatsapp text not null,
  consentimento boolean not null,
  respostas jsonb not null,          -- { "governanca:S1.1": 3, ... }
  pontuacao jsonb not null,          -- saída completa do motor (subdimensões, dimensões, prioridades)
  ime numeric(4,2) not null,
  classificacao text not null,
  questionario_versao text not null,
  duracao_segundos integer,
  origem text not null default 'link',
  email_enviado boolean not null default false
);
alter table public.dme_submissions enable row level security;
-- Nenhuma policy: anon/authenticated sem acesso. Escrita/leitura só via service role (servidor).
```

- **Setup guiado para o Matheus** (tarefa própria no plano): criar conta supabase.com → New project (região `sa-east-1`) → SQL Editor → colar `supabase/schema.sql` → Run → copiar `Project URL` e `service_role key` para `.env.local` (e depois para as env vars do projeto na Vercel). Instruções passo-a-passo escritas + acompanhamento em chat.

### E-mail (Resend)

- Envio server-side via `fetch` para a API do Resend. Destinatário: `comercial@versak.com.br`. Conteúdo: lead completo, tabela por dimensão (média, classificação, prioridade), IME 360 + classificação, versão do questionário, data/duração.
- Setup guiado: conta Resend → adicionar domínio `versak.com.br` → Matheus adiciona os registros DNS indicados (onde o DNS do domínio é gerenciado) → API key em `.env.local`/Vercel. **Fallback até o domínio verificar**: remetente sandbox do Resend com destinatário o e-mail do próprio Matheus (limitação do sandbox), trocando para `comercial@` após verificação — flag por env var (`DME360_EMAIL_TO`).

### Env vars

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `DME360_EMAIL_TO` — em `.env.local` (dev) e no projeto Vercel (produção). `.env*` já está no `.gitignore`.

### Deploy

Branch `dme360` → push → **Vercel Preview** (link para o Victor testar o formulário de ponta a ponta) → ajustes → merge em `master` (produção). Fluxo padrão do projeto.

## Fora de escopo (fase 2, registrado)

- Hotmart/Eduzz, código de acesso, liberação/entrega automática ao comprador.
- Painel admin (dashboard) para o Victor navegar pelos envios — MVP: e-mail + tabela no Supabase (o Table Editor do Supabase já permite ver/exportar).
- Versão reduzida do questionário; multi-idioma; rate-limiting; PDF do relatório.

## Verificação

Sem framework de testes no repo. Validação: `npx tsc --noEmit` + `npx eslint .` + `npm run build` limpos por tarefa; script de verificação do motor de pontuação com caso de teste conhecido (ex.: todas as notas 3 → todas as médias 3, IME 3,00, "Definido"; caso misto com valores desiguais por subdimensão conferido à mão); teste manual completo no navegador (desktop + mobile ~375px): preencher, fechar/reabrir (autosave), enviar, conferir linha no Supabase e e-mail recebido; tela final correta; rascunho limpo após envio.
