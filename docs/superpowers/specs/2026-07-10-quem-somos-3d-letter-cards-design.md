# Quem Somos — cartões com letra 3D metálica e brilho no hover

Data: 2026-07-10
Status: Design aprovado pelo usuário (Matheus) via mockup interativo. Branch: `hero-visual-redesign`.

## Contexto

A seção Quem Somos (`components/sections/quem-somos.tsx`, na branch `hero-visual-redesign`) hoje mostra 6 cartões dos valores VERSAK, cada um com: um `IconBadge` (ícone lucide), a letra pequena em dourado, o nome e o texto, dentro de um `GlowCard`. O usuário considera esses cartões visualmente pobres e pediu um tratamento mais impactante, inspirado em (a) um card de e-commerce onde o produto (tênis) é o herói visual do cartão, e (b) um vídeo de referência de hover.

O visual final foi validado num mockup interativo aprovado pelo usuário.

## O que muda (resumo)

1. **Remover os ícones** (`IconBadge`) de cada cartão — e o mapa `ICONES` e imports associados.
2. **A letra do valor (V/E/R/S/A/K) vira o herói do cartão**: grande, em ouro metálico com profundidade 3D (extrusão via sombras em camadas), posicionada no canto superior direito como elemento de fundo do cartão.
3. **Hover com brilho de gradiente dourado** que sobe do rodapé: parado o cartão é 100% estático; ao passar o mouse, um brilho (bloom) dourado desfocado preenche a parte inferior (até ~70% da altura, some antes do topo), com um gradiente que flui de um lado ao outro (dourado escuro ↔ dourado claro) continuamente enquanto o mouse está sobre o cartão, mais um "rim" de brilho na borda inferior e um leve glow externo.
4. **Remover a marca d'água "VERSAK"** de fundo da seção — as letras dos cartões passam a carregar esse motivo (decisão aprovada pelo usuário).
5. **Contraste do texto**: nome e descrição em branco/quase-branco, com sombra sutil e um scrim escuro atrás do texto para legibilidade sobre a letra e o brilho.

Nenhuma mudança em `content/home.ts`: `quemSomos.valores` já tem `{ letra, nome, texto }`, que é tudo que o novo cartão consome.

## Arquitetura / decisões

- **Continua Server Component.** O efeito de hover é 100% CSS (`:hover` + `@keyframes`), sem JS. Não precisa de `"use client"`. O wrapper `Reveal` (client, fade-in ao rolar) e o stagger por índice continuam como estão.
- **Cores/gradientes/sombras ficam na camada de tema** (`theme/tokens.css`), respeitando a regra "nenhuma cor hardcoded fora de `theme/tokens.css`". Os valores dourados metálicos (highlights/sombras) e o keyframe global de animação são definidos lá como custom properties + classes utilitárias + keyframes; o componente apenas referencia essas classes/vars.
- **Não reutiliza `GlowCard`** para estes cartões: a interação é bespoke (bloom animado, rim, scrim, letra 3D). `GlowCard` continua existindo e sendo usado nas outras seções (Dores, Mercados) — não é tocado. Isso evita acoplar uma primitiva compartilhada a um efeito específico de uma seção.
- **`overflow-hidden` no cartão** recorta a letra grande (que sangra pelos cantos) e o bloom — comportamento desejado.
- **Movimento reduzido**: o `@media (prefers-reduced-motion: reduce)` global já em `theme/tokens.css` zera durações de animação; para esses usuários o gradiente não fica fluindo, mas o bloom ainda aparece estático no hover. Comportamento aceitável, nenhum tratamento extra necessário.

## Especificação visual (valores exatos, do mockup aprovado)

Definidos como classes/custom-properties em `theme/tokens.css` (camada de tema), consumidos pelo componente.

### Cartão (`.qs-card` + utilitários Tailwind no componente)
- `position: relative; overflow: hidden; isolation: isolate;`
- altura mínima ~ `15.75rem` (≈252px); borda `1px solid var(--color-line)`; `border-radius: 16px`; fundo `var(--color-panel)`.
- transição: `border-color .5s, box-shadow .5s, transform .5s`.
- hover: `transform: translateY(-3px);` borda para `var(--color-gold-dim)`; `box-shadow: 0 24px 60px -24px rgba(232,169,62,.55)`.

### Letra 3D metálica (`.qs-letter`)
- `font-family: var(--font-oswald); font-weight: 700; line-height: 1;`
- tamanho: `clamp(9rem, 22vw, 11.5rem)` (≈144–184px; ~184px no desktop, encolhe no mobile sem quebrar o layout — o excedente é recortado pelo `overflow-hidden`).
- posição: canto superior direito (`position:absolute; top:-26px; right:0; z-index:2`).
- preenchimento metálico (background-clip:text) — gradiente com bandas de brilho/sombra:
  `linear-gradient(172deg,#8a6526 0%,#f8e6b4 15%,#e8a93e 32%,#b9822b 47%,#fbeec6 63%,#d29a34 79%,#7a5620 100%)`
  com `-webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;`
- extrusão 3D (pilha de `drop-shadow`):
  `drop-shadow(1px 1px 0 #6b4e1c) drop-shadow(2px 2px 0 #5e4418) drop-shadow(3px 3px 0 #4f3a13) drop-shadow(5px 5px 0 #3d2c0e) drop-shadow(7px 8px 0 #291d07) drop-shadow(10px 13px 12px rgba(0,0,0,.6))`
- no hover a pilha de sombra intensifica levemente (versão mais escura/profunda), transição `.5s`.

### Brilho inferior (`.qs-bloom`)
- `position:absolute; left:0; right:0; bottom:0; height:70%; z-index:1; opacity:0;`
- `background: linear-gradient(100deg,#6b4e1c,#e8a93e 42%,#f7d79a 55%,#e8a93e 70%,#6b4e1c); background-size:230% 100%;`
- `filter: blur(30px);`
- fade no topo: `mask-image: linear-gradient(to top,#000 18%,transparent 92%)` (+ `-webkit-mask-image`).
- hover: `opacity:.9; animation: qs-flow 3.2s ease-in-out infinite;`

### Rim de brilho na borda inferior (`.qs-rim`)
- `position:absolute; left:8%; right:8%; bottom:-4px; height:6px; z-index:1; opacity:0;`
- `background: linear-gradient(100deg,#9a6f22,#f7d79a 50%,#9a6f22); background-size:230% 100%; filter: blur(7px);`
- hover: `opacity:1; animation: qs-flow 3.2s ease-in-out infinite;`

### Keyframe global
```css
@keyframes qs-flow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Scrim de legibilidade (`.qs-scrim`)
- `position:absolute; left:0; right:0; bottom:0; height:60%; z-index:3; pointer-events:none;`
- `background: linear-gradient(to top, rgba(9,7,4,.88), rgba(9,7,4,.5) 45%, transparent);`

### Texto (z-index:4, acima de tudo)
- nome: `font-family: var(--font-oswald); font-weight:600; font-size:20px; color:#fff; text-shadow:0 2px 12px rgba(0,0,0,.75);`
- descrição: `font-size:13px; line-height:1.5; color:#efe6d3; text-shadow:0 1px 8px rgba(0,0,0,.85);` no hover → `#fff`.
- padding do corpo do texto: `20px`; `max-width` da descrição ~ `18ch`.

## Estrutura do cartão (ordem de camadas)

```
<article class="qs-card">           z-index base
  <span class="qs-bloom" aria-hidden />   z1
  <span class="qs-rim"  aria-hidden />    z1
  <span class="qs-letter" aria-hidden>{letra}</span>   z2
  <span class="qs-scrim" aria-hidden />   z3
  <div class="qs-body">               z4
    <p class="qs-nome">{nome}</p>
    <p class="qs-desc">{texto}</p>
  </div>
</article>
```
- A letra é decorativa (`aria-hidden`), pois é redundante com o `nome` para leitores de tela — o nome do valor é o conteúdo semântico.
- O grid da seção e o `SectionHeading` + parágrafo introdutório permanecem; só o bloco de cartões e a marca d'água mudam.

## Arquivos afetados

- **Modificar `theme/tokens.css`**: adicionar as classes `.qs-card`/`.qs-letter`/`.qs-bloom`/`.qs-rim`/`.qs-scrim`/`.qs-body`/`.qs-nome`/`.qs-desc` (ou custom-properties equivalentes) e o keyframe `@keyframes qs-flow`, na camada de tema onde os literais dourados são permitidos.
- **Reescrever `components/sections/quem-somos.tsx`**: remover imports de lucide, `IconBadge`, `GlowCard` e o mapa `ICONES`; remover a marca d'água da seção; renderizar o novo cartão consumindo `quemSomos.valores`; manter `Container`, `SectionHeading`, o parágrafo introdutório, o `Reveal` e o stagger.
- Nenhuma mudança em `content/home.ts`.

## Fora de escopo

- Outras seções (Dores, Mercados, Hero, etc.) — intocadas.
- `GlowCard`/`IconBadge` continuam existindo para as outras seções; não são removidos do projeto.
- Letras 3D reais (WebGL/three.js) ou imagens PNG pré-renderizadas — descartados; a abordagem é CSS faux-3D metálico (Approach A), aprovada.
- Mudança de conteúdo textual dos valores.

## Verificação

Sem framework de testes unitários no projeto. Validação: `npx tsc --noEmit` + `npx eslint .` + `npm run build` limpos, mais verificação visual no dev server (desktop e mobile ~375px), confirmando: cartões estáticos em repouso; hover com bloom dourado fluindo lado a lado até ~70% da altura, rim e glow externo; letra metálica 3D legível junto ao texto; sem scroll horizontal no mobile; sem marca d'água de fundo.
