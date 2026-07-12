# Hero — núcleo orbital 3D + backdrop de dados, e Header com logo vetorizada

Data: 2026-07-10
Status: Design aprovado pelo usuário (Matheus) via mockups interativos. Branch: `hero-visual-redesign`.

## Contexto

Dois ajustes na landing page da Versak, ambos na branch `hero-visual-redesign`:

- **Bloco A — Hero** (`components/sections/hero.tsx`): o build atual divergiu do protótipo aprovado pelo Victor (fundo frio/chapado, anéis 360 "duros" com aparência robótica, cards com borda seca e animação travada/atrasada). O usuário quer voltar à direção aprovada e modernizá-la: fundo quente com profundidade, um **núcleo orbital 3D** (evolução do 360 que o Victor gosta), uma **malha esparsa de pontos que se interligam** (dados conectando o sistema), **cards de vidro** flutuando de forma fluida, contraste forte, e o **indicador SCROLL** de volta. Tema visual preso a Dados/Segurança/Processo. Técnica: **CSS/SVG faux-3D** (leve, sem dependência de runtime, recolorível pelo tema).
- **Bloco B — Header** (`components/sections/header.tsx`): hoje mostra só o texto "VERSAK". Inserir o emblema da marca. O arquivo é PNG e precisa virar **SVG vetorial** (via traçado/potrace) para qualidade e nitidez.

## Bloco A — Hero

### A.1 Conteúdo (`content/home.ts`, objeto `hero`)

- **Remover o campo `eyebrow`** (`"Diagnóstico 360º"`) — deixa de ser usado.
- **Título sem a vírgula**: trocar a parte `{ texto: ", com processos ", destaque: false }` por `{ texto: " com processos ", destaque: false }`. Resultado renderizado: "Sua empresa **lucrando mais** com processos **mais eficientes**." (mantém o ponto final).
- `descricao`, `estatisticas`, `cartoes` — inalterados.

### A.2 Coluna de texto (esquerda)

- **Remover o eyebrow** do JSX (o `motion.span` com o ponto dourado + `hero.eyebrow`).
- Título, descrição, CTAs e estatísticas — mantêm posição e comportamento atuais (entrada animada via `motion`).

### A.3 Backdrop da seção (atrás de tudo, `aria-hidden`)

Substitui o `AmbientRing` que o hero usava (o `AmbientRing` **continua existindo** e sendo usado por ROI Banner, Fundador e CTA Final — não remover o componente, só parar de usá-lo no hero). Camadas, de trás pra frente:

1. **Aurora quente** — brilho radial âmbar dando profundidade/vinheta (volta ao calor aprovado pelo Victor) + 2 "blobs" desfocados deslocando-se devagar.
2. **Malha de dados** (SVG) — ~7 nós dourados + linhas finas conectando; animação sutil de "interligando": opacidade das linhas pulsando em sequência + 2 pontos-pulso viajando pelas linhas (`animateMotion`). Opacidade baixa (~0.55), fica como textura de fundo, não polui o texto.

### A.4 Visual principal (coluna direita) — núcleo orbital 3D + cards de vidro

- **Núcleo orbital 3D** (`components/ui/orbital-core.tsx`, novo — componente de apresentação, puro CSS, sem hooks): 3 anéis concêntricos em perspectiva 3D (`transform-style: preserve-3d` + `rotateX/rotateY` em eixos diferentes), girando em velocidades/direções distintas (contínuo, ritmo orgânico), em torno de um **núcleo dourado** (orb com gradiente radial + glow) e um **halo pulsante** sutil atrás. Cada anel tem um **nó orbitando** (ponto dourado com brilho).
- **3 cards de vidro** (feature cards) consumindo `hero.cartoes`, com ícones lucide: Retorno garantido → `TrendingUp`; Processos inteligentes → `CheckCircle2`; Decisões por dados → `BarChart3` (ícone de dados, substitui o `ShieldCheck` atual). Estilo "vidro": `backdrop-blur`, fundo em gradiente âmbar translúcido, borda dourada fina, sombra suave. Reutilizam `IconBadge` para o ícone.

### A.5 Fluidez da animação (corrige o "delay"/travada)

Causa atual: a flutuação (`y: [0,-6,0]`) começa ~0.9s depois da entrada, com keyframes discretos e um deslize lateral (`x: 32`) que "assenta" — gera o stall e o aspecto mecânico.

Correção:
- **Flutuação contínua desde o load**, em CSS (`@keyframes` translateY suave, `ease-in-out`, durações diferentes por card para dessincronizar) — sem "start atrasado".
- **Entrada** dos cards só por **opacidade** (fade-in curto), separada da flutuação — assim não há stall entre entrar e flutuar, e nada de deslize lateral que assenta.
- Anéis giram em CSS contínuo (sem `linear` robótico brigando com entrada); ritmos distintos dão organicidade.
- **Parallax no mouse**: fora de escopo nesta entrega (possível melhoria futura).

### A.6 Indicador SCROLL

Adicionar o "SCROLL ↓" centralizado no rodapé do hero (label em `font-display`, uppercase, `tracking` largo, cor `text-dim`, com uma linha/seta dourada abaixo).

## Bloco B — Header com logo vetorizada

### B.1 Vetorização do PNG → SVG (potrace)

- Pré-requisito: o usuário coloca o PNG da logo na raiz do projeto (ex.: `logo-versak.png`). O emblema é **monocromático dourado sobre transparente** — ideal para traçado.
- Adicionar `potrace` e `jimp` como **devDependencies** e um script (`scripts/trace-logo.mjs`) que: carrega o PNG (jimp), compõe sobre fundo branco (transparente→branco), binariza (pixels do emblema→preto), roda `potrace` (`turdSize` para remover ruído/pontinhos) e extrai o `<path d="…">`.
- Gerar `components/ui/logo.tsx` — componente React de apresentação retornando o SVG traçado, com `viewBox` correto e `fill="currentColor"` (recolore pelo tema; recebe `className` para tamanho/cor). Commitar o `logo.tsx` gerado. O implementador **verifica visualmente** que o traçado bate com o PNG e limpa artefatos (ajustando `turdSize`/`threshold` se preciso).

### B.2 Integração no header (`components/sections/header.tsx`)

- Trocar o `<span>{site.nome.toUpperCase()}</span>` atual por: **emblema (`<Logo>`) à esquerda + wordmark "VERSAK" ao lado**, ambos em ouro (`text-gold`), dentro de um link para o topo (`href="#"` ou `/`). Emblema com altura ~`h-9` (≈36px) alinhado ao wordmark. Mantém o texto por legibilidade e SEO.
- Restante do header (nav, sublinhado animado, efeito de scroll, WhatsApp, MobileNav) — inalterado.

## Arquitetura / decisões

- **Cores/gradientes/sombras/keyframes** do hero (orbital, aurora, malha, glass, float, scroll) ficam em `theme/tokens.css` (camada de tema — único lugar com literais de cor permitidos). Os componentes consomem classes utilitárias; nada de hex "hardcoded" fora de tokens.css.
- **Componentes de apresentação puros (sem `"use client"`)**: `orbital-core.tsx` e a `logo.tsx` são só markup+CSS. Podem ser renderizados dentro do `hero.tsx`/`header.tsx` (que são client) sem virar client eles mesmos.
- **Backdrop do hero**: extrair para `components/ui/hero-backdrop.tsx` (aurora + malha SVG) para manter `hero.tsx` focado. Também de apresentação (CSS/SVG, sem hooks).
- **`AmbientRing`, `IconBadge`, `GlowCard`** permanecem no projeto (usados por outras seções). Só o hero deixa de usar `AmbientRing`.
- **potrace/jimp** são devDependencies (não entram no bundle de cliente). O deliverable versionado é o `logo.tsx`.
- Reduced motion: a regra global `@media (prefers-reduced-motion: reduce)` em `theme/tokens.css` já zera as animações novas (anéis, blobs, malha, float, pulsos) — sem tratamento extra.

## Referência visual (valores do mockup aprovado)

Base para o plano (definidos em `theme/tokens.css`, consumidos pelos componentes):

**Aurora / fundo**
- `background: radial-gradient(120% 90% at 72% 34%, rgba(232,169,62,.20), rgba(140,96,30,.08) 38%, transparent 66%), radial-gradient(80% 70% at 10% 90%, rgba(232,169,62,.07), transparent 60%)`
- Blobs: `filter: blur(46px)`; blob1 `rgba(232,169,62,.16)`, blob2 `rgba(201,139,44,.12)`; drift lento (`translate` ±16px, `scale` ~1.1) em 12s/15s `ease-in-out infinite`.

**Malha de dados (SVG)**
- Linhas `stroke: rgba(232,169,62,.30)`, `stroke-width:1`; algumas com pulso de opacidade `0.15↔0.8` em 6s (escalonado 3s).
- Nós `fill:#e8a93e`, `r` 3.5–4.5, twinkle opacidade `0.45↔1` em 4s.
- 2 pontos-pulso `fill:#f5cc81`, `r:3`, `animateMotion` por caminhos de nós (4s e 5s).
- Camada com `opacity:.55`.

**Núcleo orbital**
- Stage: `perspective: 900px`; sistema `210px` quadrado, `transform-style: preserve-3d`.
- Anéis: `border:1.5px solid rgba(232,169,62,.32/.24/.40)`; tamanhos 100%/74%/48%.
  - r1 `rotateX(68deg)` girando 360° em 16s; r2 `rotateY(66deg)` 24s reverse; r3 `rotateX(28deg) rotateY(42deg)` 12s. Keyframes preservam o tilt e variam só `rotateZ`.
  - Nó por anel: ponto `#f5cc81` `7px` com `box-shadow: 0 0 12px 2px rgba(232,169,62,.8)` no topo do anel.
- Núcleo: `66px`, `background: radial-gradient(circle at 36% 30%, #fdeecb, #e8a93e 46%, #9a6a1c 82%)`, `box-shadow: 0 0 46px 10px rgba(232,169,62,.5), inset -6px -8px 14px rgba(90,60,15,.7)`.
- Halo: `150px`, `radial-gradient(circle, rgba(232,169,62,.35), transparent 68%)`, `blur(6px)`, pulso opacidade/scale em 4s.

**Cards de vidro**
- `border:1px solid rgba(232,169,62,.22)`; `background: linear-gradient(150deg, rgba(43,34,18,.82), rgba(18,14,8,.66))`; `backdrop-filter: blur(9px)`; `box-shadow: 0 16px 34px -14px rgba(0,0,0,.75)`; `border-radius:12px`.
- Ícone: `IconBadge` (fundo `rgba(232,169,62,.14)`, ícone `text-gold`).
- Float: `translateY` `0↔-9px` em 5–6.2s `ease-in-out infinite`, fases diferentes; entrada só por opacidade.
- **Desktop (lg+)**: cards posicionados flutuando ao redor do stage (top-direita, meio-esquerda, base-direita). **Mobile (<lg)**: stage do núcleo centralizado e os 3 cards empilhados em coluna abaixo (sem posição absoluta), para não vazar/estourar scroll horizontal.

**Título/estatísticas**: mantêm as fontes atuais do site (o headline usa a fonte de display já configurada). Destaques em `text-gold`.

## Fora de escopo

- Outras seções (Quem Somos, Dores, Mercados, ROI Banner, Fundador, CTA Final, Footer) — intocadas.
- Parallax no mouse no hero (possível futuro).
- 3D real (react-three-fiber) / assets pré-renderizados — descartados; a técnica é CSS/SVG faux-3D.
- Redesenhar a logo à mão — ela é vetorizada a partir do PNG fornecido; se o traçado não ficar bom, o fallback é ajustar parâmetros do potrace (não redesenhar do zero neste escopo).
- Mudança de conteúdo textual além do título do hero (remoção da vírgula) e remoção do eyebrow.

## Verificação

Sem framework de testes unitários. Validação: `npx tsc --noEmit` + `npx eslint .` + `npm run build` limpos + verificação visual no dev server (desktop e mobile ~375px):
- Hero: título sem vírgula, sem eyebrow; núcleo orbital girando fluido; aurora quente + malha de pontos interligando ao fundo; 3 cards de vidro flutuando contínuo (sem stall) com os ícones corretos (crescimento / check / dados); SCROLL no rodapé; sem scroll horizontal no mobile; `AmbientRing` ainda funcionando nas outras seções.
- Header: emblema vetorizado (SVG nítido, recolorido no ouro) + "VERSAK" ao lado, linkando para o topo; nav/scroll/mobile inalterados.
