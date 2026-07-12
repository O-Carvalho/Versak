# Dores — cards de vidro com número metálico 3D e malha de conexão

Data: 2026-07-10
Status: Design aprovado pelo usuário (Matheus) via mockup interativo. Branch: `hero-visual-redesign`.

## Contexto

A seção "Principais dores que atuamos" (`components/sections/dores.tsx`) hoje mostra as 10 dores como `GlowCard`s com ícone `AlertTriangle`, num grid 3 colunas onde os itens de índice 3 e 4 ocupam 2 colunas (bento). O usuário considera "blocos secos, sem impacto e desiguais" — quer cards iguais e um tratamento visual mais rico, na mesma identidade já aplicada ao Hero (vidro + malha de dados) e a Quem Somos (número/letra metálica 3D), sem animação elaborada.

Decisão de conteúdo já fechada: **manter as 10 dores curtas como estão** (só rótulos, sem descrição). Nenhuma mudança em `content/home.ts`.

## O que muda

1. **Cards iguais de vidro** — mesmo material dos cards flutuantes do Hero (`.hero-glass`: `backdrop-blur`, gradiente âmbar translúcido, borda dourada, sombra), com altura mínima uniforme para todos ficarem do mesmo tamanho. Remove-se o bento (os `col-span-2` dos itens 3 e 4) — causa do "desigual".
2. **Número metálico 3D** (`01`–`10`) por card — reaproveita a técnica das letras de Quem Somos (gradiente dourado metálico + extrusão via `drop-shadow`), em tamanho pequeno (~46px) como âncora visual e elo de identidade. **Substitui o ícone `AlertTriangle`** (o número passa a ser o único marcador).
3. **Malha de conexão no fundo** — linhas finas + nós dourados (mesma linguagem da malha de dados do Hero), estáticos e sutis, atrás do grid, dando a sensação de "processo conectando a página". Mantém-se também o brilho radial dourado que a seção já tem.
4. **Eyebrow sem o ponto** — o "Diagnóstico honesto" deixa de ter o ponto dourado antes dele (só nesta seção; as outras seções que usam `SectionHeading` mantêm o ponto). Para isso a Dores passa a renderizar o próprio cabeçalho (eyebrow + título) em vez de usar `SectionHeading`.
5. **Hover simples** — leve elevação (`translateY(-4px)`) + brilho na borda. Entrada mantém o `Reveal` (fade-in ao rolar) com stagger.

## Arquitetura / decisões

- **Cores/gradientes/sombras** ficam em `theme/tokens.css` (camada de tema). Adiciona-se `.dores-num` (número metálico) e `.dores-net` (cor das linhas/nós da malha). O card reutiliza a classe existente `.hero-glass`; o hover é feito com utilitários Tailwind + o token `--shadow-gold-glow`.
- **`dores.tsx` continua Server Component** exceto pelo `Reveal` (já client) que envolve cada item — nenhum hook novo, o hover é 100% CSS. O componente não precisa de `"use client"`.
- **Malha de conexão**: SVG inline em `dores.tsx` (poucos nós/linhas, estático), estilizado por `.dores-net`. Não reutiliza `HeroBackdrop` (que traz aurora/blobs/pulsos específicos do hero) para não acoplar; a linguagem visual é a mesma, a implementação é local e mínima.
- **`GlowCard`, `IconBadge`, `AlertTriangle`** deixam de ser usados na Dores (continuam no projeto, usados por Mercados). `SectionHeading` continua no projeto (usado por Quem Somos e Mercados); a Dores apenas para de usá-lo.
- **Movimento reduzido**: sem animação contínua nova (a malha é estática, o hover é transição). O `Reveal` já respeita `MotionConfig reducedMotion="user"`. Nada extra necessário.

## Referência visual (valores do mockup aprovado)

Definidos em `theme/tokens.css`, consumidos por `dores.tsx`.

**Número metálico (`.dores-num`)**
- `font-family: var(--font-display); font-weight: 700; font-size: 46px; line-height: 1;`
- `background: linear-gradient(172deg,#6b4a1a,#d9a852 16%,#e8a93e 34%,#a3741f 50%,#d9a852 66%,#b9822b 82%,#5c3f15);`
- `-webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;`
- `filter: drop-shadow(1px 1px 0 #5e4418) drop-shadow(2px 2px 0 #4f3a13) drop-shadow(3px 4px 0 #33240b) drop-shadow(5px 6px 6px rgba(0,0,0,.55));`

**Malha (`.dores-net`)**
- container: `opacity: .5;`
- `.dores-net line { stroke: rgba(232,169,62,.22); stroke-width: 1; }`
- `.dores-net circle { fill: #e8a93e; }`
- SVG `viewBox="0 0 760 460"`, `preserveAspectRatio="xMidYMid slice"`, ~5 nós + ~4 linhas (poucas, sutis), `aria-hidden`, `pointer-events-none`, atrás do conteúdo.

**Card**
- base: classe `.hero-glass` (já existe) + `flex items-center gap-4 p-4 min-h-[5.25rem] h-full`.
- hover: `transition-all duration-300 hover:-translate-y-1 hover:border-gold-dim hover:shadow-[var(--shadow-gold-glow)]`.

**Rótulo da dor**
- `text-sm font-medium leading-snug text-text-muted` (ou `#e7dcc6` equivalente via `text-text-muted`).

**Grid**
- `grid gap-4 sm:grid-cols-2` (2 colunas no desktop, 5 linhas; 1 coluna no mobile). `max-w-4xl mx-auto`. Sem `col-span`.

**Cabeçalho (sem `SectionHeading`)**
- eyebrow: `font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-gold` — **sem** o `<span>` do ponto.
- título: `font-display text-3xl font-semibold text-text sm:text-4xl`, centralizado.

**Número formatado**: `String(i + 1).padStart(2, "0")` → `01`…`10`.

## Fora de escopo

- Outras seções (Hero, Quem Somos, Mercados, ROI, Fundador, CTA, Footer) — intocadas.
- Conteúdo das dores (`content/home.ts`) — inalterado.
- Estender a malha de conexão para outras seções — possível futuro; aqui fica só na Dores.
- Animações elaboradas (parallax, malha animada) — a malha é estática; só o hover/entrada animam.

## Verificação

Sem framework de testes unitários. Validação: `npx tsc --noEmit` + `npx eslint .` + `npm run build` limpos + verificação visual no dev server (desktop e mobile ~375px):
- 10 cards de vidro **iguais** (mesmo tamanho), cada um com número metálico 3D e o rótulo da dor; sem ícone de alerta; sem bento/spans.
- Malha de conexão dourada sutil atrás do grid + brilho radial.
- Eyebrow "Diagnóstico honesto" **sem** o ponto dourado.
- Hover: leve elevação + brilho na borda.
- Sem scroll horizontal no mobile; `GlowCard`/`IconBadge` ainda funcionando em Mercados.
