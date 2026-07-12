# Playbook — replicando este projeto para um novo cliente

Este repositório nasceu como o site da Versak, mas foi desenhado desde o início
para virar **template-base** de landing pages institucionais B2B/serviços
(ver `README.md`). Este documento é o método operacional: o passo a passo que
você e eu seguimos toda vez que fechamos um cliente novo (ex.: a estética
automotiva) e queremos partir deste projeto em vez de começar do zero.

## 1. Estratégia de repositório: um repo novo e independente por cliente

**Não** reaproveite este mesmo repo/branch para o próximo cliente. Cada
cliente precisa de um repositório Git próprio, sem herdar o histórico de
commits deste — o histórico da Versak tem WhatsApp, e-mail e fotos reais dela,
e isso não deve vazar para o repo de outro cliente.

Forma recomendada — marcar este repo como **Template Repository** no GitHub:

1. No GitHub, no repo `versak-landing` → **Settings → General → Template repository** (marcar a caixa).
2. Para cada cliente novo: botão **"Use this template" → "Create a new repository"**, nome tipo `estetica-automotiva-landing`. Isso cria um repositório novo, com um único commit inicial, sem o histórico da Versak.
3. Clonar localmente, `npm install`, `npm run dev`, seguir o checklist da seção 3.

Se preferir não usar o recurso do GitHub: `git clone` deste repo para uma
pasta nova → apagar `.git` → `git init` → primeiro commit limpo.

## 2. O que muda por cliente vs. o que é motor fixo

### Tier 1 — sempre muda (obrigatório em todo cliente)

| Arquivo | O que trocar |
|---|---|
| `theme/tokens.css` | Toda a paleta (`--color-bg`, `--color-panel*`, `--color-gold*`, `--color-text*`) pela identidade visual do cliente novo. É o único lugar onde cor pode ser hardcoded — regra já seguida à risca neste projeto. |
| `content/site.ts` | `nome`, `tagline`, `descricaoSeo`, `url`, `whatsapp.numero`/`mensagemPadrao`, `email`, `linkedin`, labels e âncoras do `nav`. |
| `content/home.ts` | Todo o copy: hero, quemSomos, dores, mercados, roi, fundador, ctaFinal. |
| `components/ui/logo.tsx` | Vetorizar o logo do cliente (reaproveitar `scripts/trace-logo.mjs` — já recebe um PNG e devolve SVG). |
| `public/fundador/*`, `public/setores/*` | Fotos reais do cliente. `scripts/fetch-setores.mjs` pode servir de referência se for buscar fotos de banco de imagens, mas o ideal é usar fotos próprias do cliente sempre que possível. |
| `package.json` (`name`), `README.md` | Metadados do projeto. |

### Tier 2 — decidir com o cliente se o conceito se aplica (não é só trocar texto)

Estas seções foram desenhadas em cima de particularidades da Versak. Para um
cliente diferente (ex.: estética automotiva), a **mecânica visual** pode ser
reaproveitada, mas o **conceito por trás** precisa ser repensado:

- **Quem Somos (letras 3D metálicas V-E-R-S-A-K)**: só funciona porque o nome
  Versak vira um acrônimo de valores. Se o nome do cliente novo não permitir
  o mesmo truque, trocar a mecânica (ex.: ícones de valores em vez de letras
  do nome).
- **ROI Banner ("ROI mínimo 2x")**: prova social específica de consultoria de
  gestão. Para estética automotiva, provavelmente vira outra métrica (ex.:
  "+500 carros atendidos", "98% de satisfação", "X anos de mercado") — mesma
  mecânica de `CountUp` e destaque em ouro, número e contexto diferentes.
- **Fundador**: só inclua se o negócio realmente quer vender autoridade de
  uma pessoa. Confirmar com o cliente antes de manter a seção.
- **Carrossel de "Mercados de atuação"**: a Versak atende múltiplos segmentos
  B2B. Um negócio de serviço único (como estética automotiva) provavelmente
  troca isso por "Nossos serviços" (polimento, vitrificação, higienização
  etc.), mantendo a mecânica do carrossel com fotos em duotone.

### Tier 3 — raramente muda (motor do site)

`components/ui/*` (Button, Container, Reveal, CountUp, AmbientRing,
OrbitalCore, MobileNav, SetoresCarousel...), a estrutura dos arquivos em
`components/sections/*.tsx`, `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts`,
`next.config.ts`. Se algum desses precisar mudar por causa de um cliente
específico, é sinal de que algo ficou hardcoded fora de `content/`/`theme/` —
vale corrigir ali antes de seguir, para o template continuar genérico de
verdade (mesmo critério já usado durante todo o desenvolvimento da Versak).

## 3. Checklist de pré-voo — bugs já corrigidos que não podem voltar

Resultado da auditoria feita em 2026-07-12 (ver commit `fix: address audit
findings...`). Rodar mentalmente esta lista em qualquer seção nova ou
adaptada:

- [ ] Todo `useInView`/`whileInView` usa margin com eixo explícito
      (`"-80px 0px -80px 0px"`), nunca um valor único — margin de um valor só
      encolhe a detecção nos 4 lados e pode deixar itens de coluna esquerda
      em grids 2-col no mobile sem nunca entrar em view.
- [ ] Nenhum link "morto" com `href="#"` sem `onClick` real fazendo algo
      (`preventDefault` + `scrollTo`, ou um `href` de verdade).
- [ ] Conteúdo real (texto com informação, não decoração) nunca fica escondido
      atrás de `:hover` puro em CSS — em touchscreen não existe hover
      persistente. Usar `@media (hover: hover)` para gatear o efeito, ou dar
      alternativa por toque/foco.
- [ ] `CountUp`: o HTML inicial (SSR/no-JS) mostra o valor final real, não
      "0" — só reseta para 0 no client, via `useLayoutEffect`, antes da
      animação de contagem.
- [ ] `col-span`/`nth-child` em grid: se o item está dentro de um wrapper
      (ex.: `Reveal`), `col-span-*` no item não funciona porque o wrapper é o
      filho direto do grid. Usar seletor no wrapper/grid se precisar.
- [ ] Qualquer arquivo que use a sintaxe `motion.div`/`motion.span` (proxy do
      Framer Motion) direto precisa de `"use client"` no topo, mesmo que só
      renderize componentes client importados.
- [ ] Nunca rodar `next build` na mesma pasta em que o cliente/você tem
      `next dev` rodando — corrompe o cache do webpack do servidor de dev.
- [ ] Menu mobile fecha com `Escape` e com clique/toque fora dele.
- [ ] `tsc --noEmit` e `eslint .` limpos antes de considerar qualquer entrega
      pronta.

## 4. O método, passo a passo, para cada cliente novo

1. **Brainstorming de identidade visual** com o cliente: paleta, um "motivo
   visual" recorrente que vire a assinatura da marca (para a Versak foi o
   anel orbital dourado = metáfora de "diagnóstico 360º"), tom de voz, o que
   é proibido mostrar (para a Versak: nada fora do tema Dados/Segurança/
   Processo). Usar a skill `superpowers:brainstorming`.
2. Preencher `content/site.ts` e `content/home.ts` com o texto já aprovado
   pelo cliente — não escrever copy final direto no código sem aprovação.
3. Trocar `theme/tokens.css` pela paleta decidida.
4. Passar pelas seções do Tier 2 uma a uma, decidindo com o cliente se o
   conceito original se aplica ou precisa de adaptação.
5. Rodar o checklist de pré-voo (seção 3) em qualquer seção nova/adaptada.
6. `tsc --noEmit` + `eslint .` limpos, e conferência visual (desktop e
   mobile) antes de considerar pronto.
7. Deploy (Vercel — `git push`, sem configuração extra) e Lighthouse no ar.

## 5. Portfólio do Matheus (nota para mais tarde)

Quando for montar a página de portfólio, este projeto (ou um fork limpo dele)
pode virar um dos cases mostrados. Na hora, o recomendado é criar uma seção
de portfólio com screenshots + link do site da Versak no ar, **sem** copiar
código deste repositório para dentro do repositório do portfólio — só
referenciar/exibir as imagens e o link. Isso evita duplicar código e mantém
este repo como a única fonte de verdade do template.
