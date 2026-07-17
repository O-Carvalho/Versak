# 🏦 BANCO DE DESIGN — Template de Landing Pages

> **Base de origem:** projeto Versak (`versak-landing`). Este é um documento
> **vivo**: cada novo site feito a partir do template adiciona seus componentes
> e aprendizados aqui, virando um catálogo reaproveitável.

---

## 📌 Como usar este arquivo

Este arquivo tem **duas funções**:

1. **Contexto para colar em uma nova conversa do Claude Code.** Ao começar um
   site novo, cole este arquivo inteiro no início do chat e diga: *"Este é meu
   banco de design. Quero reaproveitar o efeito X / componente Y neste novo
   projeto."* O Claude passa a conhecer cada efeito, onde ele vive e como
   adaptá-lo, sem precisar reengenhar nada.
2. **Memória viva do que já foi construído.** Toda vez que um componente novo
   nasce (ou um existente ganha uma variação), ele entra na seção
   **[3. Componentes nascidos em clientes](#3-componentes-nascidos-em-clientes)**
   e no **[5. Registro de evolução](#5-registro-de-evolução)**.

**Regra de manutenção:** ao terminar um site, antes de fechar o projeto,
atualize as seções 3 e 5 deste arquivo. Se um efeito da seção 2 foi melhorado,
edite-o no lugar (não duplique).

### As 3 regras de ouro do template

1. **Cor só vive em `theme/tokens.css`.** Nenhum componente tem cor hardcoded
   fora dele. Reskin de cliente = editar os tokens, não os componentes.
2. **Texto/dados só vivem em `content/`.** Nenhuma string de negócio dentro de
   componente. Reskin de conteúdo = editar `content/`, não os componentes.
3. **"3D" é CSS puro, nunca WebGL.** Toda sensação de profundidade/3D do site
   vem de `transform`, `drop-shadow` empilhado, gradientes e `mix-blend-mode`.
   Zero three.js, zero canvas — decisão consciente por leveza e zero dependência
   pesada.

---

## 0. Filosofia visual

O template nasceu **dark + acento metálico dourado**, mas a estrutura vale para
qualquer par *fundo escuro + cor de valor*. Princípios que se mantêm entre
clientes:

- **Tema coerente acima de "moderno genérico".** Cada elemento decorativo
  precisa ser uma metáfora do que o cliente vende. Na Versak: Dados / Segurança
  / Processo (por isso a malha de pontos conectados e o núcleo orbital = o
  "diagnóstico 360º"). Num detailing, essas metáforas **não servem** e precisam
  ser trocadas — ver [regra de Tier 2](#4-regras-de-ouro-e-armadilhas).
- **Acento = valor; neutro = estrutura.** Aprendizado forte do BoxShine: usar a
  cor de acento (dourado) em *tudo* — chrome estrutural E indicadores de valor —
  é o que faz o site parecer "corporativo/consultoria". A correção é **estreitar
  o escopo semântico da cor de acento**: dourado só em preço, botão primário,
  números de destaque, estado selecionado e highlight do headline; um tom
  **neutro/prata** para eyebrows, ícones, setas, bordas de hover. Isso costuma
  ser um conserto maior do que trocar a cor em si.
- **Movimento com respeito ao usuário.** `MotionConfig reducedMotion="user"` no
  layout — quem tem "reduzir movimento" ativo no SO recebe tudo estático,
  automaticamente. Além disso há um bloco global em `tokens.css` que zera
  `animation-duration`/`transition-duration` em `prefers-reduced-motion`.

---

## 1. Fundação — design tokens

Tudo começa no bloco `@theme` do `theme/tokens.css` (Tailwind v4). Reskin de um
cliente = trocar estes valores; o resto do site herda.

```css
@theme {
  --color-bg: #0b0906;          /* fundo quase-preto */
  --color-panel: #151109;       /* superfície elevada nível 1 */
  --color-panel-raised: #1d1710;/* superfície elevada nível 2 */
  --color-line: #332b1e;        /* bordas/divisores */

  --color-gold: #e8a93e;        /* acento — valor/ação */
  --color-gold-bright: #f5cc81; /* acento claro (hover, brilho) */
  --color-gold-dim: #7a5c26;    /* acento apagado (bordas sutis) */

  --shadow-gold-glow: 0 0 24px -8px rgba(232, 169, 62, 0.35);

  --color-text: #f6f2e8;        /* texto principal */
  --color-text-muted: #b7ab92;  /* texto secundário */
  --color-text-dim: #736a57;    /* texto terciário/legendas */

  --font-display: var(--font-oswald); /* títulos condensados */
  --font-body: var(--font-inter);     /* corpo */
}
```

**Como extrair a paleta de um logo (lição BoxShine):** não "chute" as cores no
olho — amostre os pixels reais do PNG do logo (script com `sharp`) para o acento
e use o fundo exato do logo como `--color-bg`, evitando emenda visível entre
logo e página.

**Regra de acento semântico (lição BoxShine):** se o cliente disser que o design
"parece consultoria/parece o cliente anterior", adicione uma família neutra
(ex.: `--color-silver: #cfd4da`) e aplique a regra **acento = valor / neutro =
estrutura** de forma estrita antes de mexer na tonalidade.

---

## 2. Catálogo de efeitos assinatura

> Todos os caminhos de arquivo são relativos ao projeto de origem
> (`versak-landing`). As classes CSS moram em `theme/tokens.css`.

### 2.1 Núcleo orbital 3D — `OrbitalCore`

**O que é:** um núcleo dourado (esfera) com 3 anéis girando em eixos diferentes,
dando sensação de órbita 3D. Assinatura da marca Versak ("diagnóstico 360º").

**Arquivos:** `components/ui/orbital-core.tsx` + classes `hero-*` em `tokens.css`.

**Técnica:** um palco com `perspective`, um sistema com `transform-style:
preserve-3d`, e cada anel é uma borda circular animada com `rotateX/Y` fixo +
`rotateZ` girando. A profundidade é 100% CSS.

```css
.hero-stage { position: relative; aspect-ratio: 1; perspective: 900px; }
.hero-sys   { position: absolute; inset: 0; transform-style: preserve-3d; }
.hero-ring  { position: absolute; inset: 0; border-radius: 50%;
              border: 1.5px solid rgba(232,169,62,.32); }
.hero-ring::after {            /* o "satélite" que corre no anel */
  content: ""; position: absolute; top: -4px; left: 50%;
  width: 7px; height: 7px; border-radius: 50%; background: #f5cc81;
  box-shadow: 0 0 12px 2px rgba(232,169,62,.8);
}
.hero-ring-1 { animation: hero-spin-a 16s linear infinite; }
.hero-ring-2 { inset: 13%; animation: hero-spin-b 24s linear infinite; }
.hero-ring-3 { inset: 26%; animation: hero-spin-c 12s linear infinite; }

@keyframes hero-spin-a { from{transform:rotateX(68deg) rotateZ(0)}
                         to  {transform:rotateX(68deg) rotateZ(360deg)} }
@keyframes hero-spin-b { from{transform:rotateY(66deg) rotateZ(0)}
                         to  {transform:rotateY(66deg) rotateZ(-360deg)} }
@keyframes hero-spin-c { from{transform:rotateX(28deg) rotateY(42deg) rotateZ(0)}
                         to  {transform:rotateX(28deg) rotateY(42deg) rotateZ(360deg)} }

.hero-core { /* a esfera central */
  width: 66px; height: 66px; border-radius: 50%;
  background: radial-gradient(circle at 36% 30%, #fdeecb, #e8a93e 46%, #9a6a1c 82%);
  box-shadow: 0 0 46px 10px rgba(232,169,62,.5),
              inset -6px -8px 14px rgba(90,60,15,.7);
}
.hero-halo { animation: hero-halo 4s ease-in-out infinite; } /* brilho pulsante */
```

**Como reaproveitar:** recebe `className`, então dá pra reposicionar/ocultar por
breakpoint. A esfera + anéis funcionam como metáfora de "sistema/órbita/centro
de controle". Para um cliente onde isso não faz sentido, **troque o motivo**
(ver Tier 2) — não force.

**Armadilhas:**
- Em mobile fica solto e estranho quando aparece sozinho acima dos cards. Na
  Versak foi resolvido com `className="hidden lg:block"` (só desktop).
- `transform-style: preserve-3d` não sobrevive se algum ancestral tiver
  `overflow: hidden` no eixo errado — cuidado ao aninhar.

### 2.2 Cards de vidro — `.hero-glass`

**O que é:** cartão translúcido com desfoque de fundo, borda dourada sutil e
gradiente âmbar. Usado nos cards flutuantes do Hero e nos cards da seção Dores.

```css
.hero-glass {
  border: 1px solid rgba(232,169,62,.22);
  background: linear-gradient(150deg, rgba(43,34,18,.82), rgba(18,14,8,.66));
  backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px);
  box-shadow: 0 16px 34px -14px rgba(0,0,0,.75);
  border-radius: 12px;
}
```

**Como reaproveitar:** é uma classe utilitária pura — aplique em qualquer `div`.
Combine com as animações de flutuação (2.9 / abaixo) para os cards do hero.

**Flutuação sem "stall":** os cards do hero combinam fade-in + flutuação numa
**única** declaração `animation` (não em duas regras separadas), senão aparece um
atraso/trava que incomoda:

```css
.hero-float-1 { animation: hero-fade-in .6s ease-out both,
                           hero-float 5s ease-in-out infinite; }
@keyframes hero-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
@keyframes hero-fade-in { from{opacity:0} to{opacity:1} }
```

### 2.3 Letras / números metálicos 3D — `.qs-letter`, `.dores-num`

**O que é:** letra ou número gigante em ouro metálico com relevo/extrusão 3D.
Usado nas letras V-E-R-S-A-K de Quem Somos e nos números 01–10 de Dores. É a
técnica "3D oficial" do site.

**Técnica:** gradiente dourado em bandas recortado pelo texto
(`background-clip: text`) + **pilha de `drop-shadow`** deslocados que simula a
extrusão (cada sombra é uma "fatia" mais escura, empilhada na diagonal).

```css
.qs-letter {
  font-family: var(--font-display); font-weight: 700; line-height: 1;
  font-size: clamp(9rem, 22vw, 11.5rem);
  background: linear-gradient(172deg, #6b4a1a 0%, #d9a852 15%, #e8a93e 32%,
              #a3741f 47%, #d9a852 63%, #b9822b 79%, #5c3f15 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  /* a "extrusão": sombras sólidas empilhadas + uma sombra difusa no fim */
  filter: drop-shadow(1px 1px 0 #6b4e1c) drop-shadow(2px 2px 0 #5e4418)
          drop-shadow(3px 3px 0 #4f3a13) drop-shadow(5px 5px 0 #3d2c0e)
          drop-shadow(7px 8px 0 #291d07) drop-shadow(10px 13px 12px rgba(0,0,0,.6));
}
```

**Como reaproveitar:** funciona com qualquer glifo grande (letra, número, símbolo
de moeda). Ajuste as cores das bandas do gradiente e das sombras para o acento do
cliente. Para números de etapa/estatística, a mesma receita está em `.dores-num`
(menor, com menos camadas de sombra).

**Armadilha (Tier 2):** as **letras do nome** só funcionam como conceito se o
nome do cliente formar um acrônimo de valores (VERSAK = Versatilidade,
Estratégia, Respeito...). Se não formar, mantenha a *técnica* metálica mas troque
o *conteúdo* (ícones de valores, números, etc.).

### 2.4 Brilho dourado que "anda" atrás do card no hover — `.qs-bloom` + `.qs-rim`

> Este é o efeito que o cliente pediu para documentar: *"o efeito atrás do
> cartão com as letras onde anda"*.

**O que é:** ao passar o mouse no card de Quem Somos, um brilho dourado surge por
trás da letra e **flui lateralmente** (a luz "anda"), mais uma linha de brilho na
base (`rim`). Sem hover, o card fica 100% estático.

**Técnica:** o "andar" da luz é um gradiente com `background-size` maior que o
elemento (`230%`), animado deslocando `background-position` de 0% → 100% → 0%.
O `blur` transforma o gradiente nítido em brilho difuso; a `mask` some o brilho
suavemente para cima.

```css
@keyframes qs-flow {          /* o movimento da luz */
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.qs-bloom {                   /* o brilho grande atrás da letra */
  position: absolute; left: 0; right: 0; bottom: 0; height: 70%; z-index: 1;
  opacity: 0;                 /* invisível até o hover */
  background: linear-gradient(100deg, #6b4e1c, #e8a93e 42%, #f7d79a 55%, #e8a93e 70%, #6b4e1c);
  background-size: 230% 100%; /* maior que o card → há o que "deslocar" */
  filter: blur(30px);
  -webkit-mask-image: linear-gradient(to top, #000 18%, transparent 92%);
          mask-image: linear-gradient(to top, #000 18%, transparent 92%);
  transition: opacity .55s ease;
}
.qs-card:hover .qs-bloom { opacity: .9; animation: qs-flow 3.2s ease-in-out infinite; }

.qs-rim {                     /* a linha de brilho na base */
  position: absolute; left: 8%; right: 8%; bottom: -4px; height: 6px; z-index: 1;
  opacity: 0;
  background: linear-gradient(100deg, #9a6f22, #f7d79a 50%, #9a6f22);
  background-size: 230% 100%; filter: blur(7px); transition: opacity .55s ease;
}
.qs-card:hover .qs-rim { opacity: 1; animation: qs-flow 3.2s ease-in-out infinite; }
```

**Estrutura de camadas do card** (z-index de baixo pra cima):
`qs-bloom`/`qs-rim` (1) → `qs-letter` (2) → `qs-scrim` (3, gradiente escuro pra
legibilidade) → `qs-body` (4, nome + texto). O `.qs-card` usa
`overflow: hidden; isolation: isolate;` para conter o brilho.

**Como reaproveitar:** o par gradiente-largo + `qs-flow` (deslocar
`background-position`) é a receita genérica de "luz que anda". Serve para
qualquer superfície: barra de brilho, borda animada, sweep sobre um botão. É a
mesma ideia dos *light-sweep streaks* do BoxShine (seção 3).

**Armadilha:** o efeito é `:hover` puro — em touch não dispara, então **nunca**
esconda informação essencial só nele (ver 2.5/2.6 e a regra em §4). Aqui tudo
bem, porque é decorativo; o conteúdo do card está sempre visível.

### 2.5 Fotos em duotone dourado — `.setor-*`

**O que é:** foto colorida vira monocromática dourada (duotone), mantendo a
identidade sem "poluir" o layout com cores aleatórias. Usada nos cards do
carrossel de Setores.

**Técnica:** `grayscale` na imagem + uma camada de cor sólida em
`mix-blend-mode: color` por cima + um scrim escuro para o texto.

```css
.setor-img   { filter: grayscale(1) contrast(1.06); transition: transform .5s ease; }
.setor-card:hover .setor-img { transform: scale(1.07); }
.setor-gold  { position:absolute; inset:0; background:#e8a93e; mix-blend-mode: color; }
.setor-gold2 { position:absolute; inset:0;
               background: linear-gradient(180deg, rgba(232,169,62,.12), rgba(122,92,38,.22));
               mix-blend-mode: overlay; }
.setor-scrim { position:absolute; inset:0;
               background: linear-gradient(to top, rgba(9,7,4,.96), rgba(9,7,4,.35) 46%, transparent); }
```

**Como reaproveitar:** troque `#e8a93e` da `.setor-gold` pelo acento do cliente e
qualquer foto entra no mesmo "molde" visual. Ótimo para uniformizar fotos de
qualidade/origem diferentes (banco de imagens misturado).

### 2.6 Carrossel — `SetoresCarousel` (embla)

**O que é:** carrossel com loop, arrasto e setas. Sem autoplay (decisão
consciente). Cada slide é um card duotone (2.5) com nome + segmentos revelados no
hover.

**Arquivos:** `components/ui/setores-carousel.tsx` (usa `embla-carousel-react`).

**Pontos-chave da implementação:**
- Slides com `flex-[0_0_78%]` (mobile) → `44%` (sm) → `23%` (lg): controla quantos
  aparecem por vez.
- **Espaçamento via `padding` no slide, não `gap`** — com `loop: true`, o `gap`
  some na emenda do loop; padding não.
- Texto de segmentos revelado no hover **precisa de fallback em touch** (ver
  armadilha abaixo).

**Como reaproveitar:** é um shell genérico de carrossel — troque o conteúdo do
slide. Para serviços (detailing, clínica) vira "carrossel de serviços"; para
setores B2B (Versak) vira "mercados de atuação".

**Armadilha (corrigida na Versak):** revelar texto só em `:hover` deixa o texto
**invisível em telas de toque**. O fix é gatear o efeito por capacidade de hover:

```css
.setor-seg { color: #e7d9bd; }               /* sempre visível por padrão */
@media (hover: hover) {                        /* só onde há mouse de verdade */
  .setor-seg { max-height: 0; opacity: 0; overflow: hidden; transition: all .4s ease; }
  .setor-card:hover .setor-seg { max-height: 60px; opacity: 1; }
}
```

### 2.7 Malha de pontos conectados — `.hero-net`, `.dores-net`

**O que é:** SVG de linhas + nós dourados, alguns pulsando, e um ponto que corre
pela linha. Metáfora de "dados/processos conectando a página". Fundo do Hero e da
seção Dores.

**Técnica:** `<line>` e `<circle>` num SVG com `preserveAspectRatio="xMidYMid
slice"`; animação de `opacity` nos links/nós; um ponto viajante via
`<animateMotion path="...">`.

```css
.hero-net line   { stroke: rgba(232,169,62,.3); stroke-width: 1; }
.hero-net circle { fill: #e8a93e; }
.hero-net-link         { animation: hero-net-link 6s ease-in-out infinite; }
.hero-net-link-delayed { animation: hero-net-link 6s ease-in-out infinite 3s; } /* dessincroniza */
.hero-net-node         { animation: hero-net-node 4s ease-in-out infinite; }
@keyframes hero-net-link { 0%,100%{opacity:.15} 50%{opacity:.8} }
@keyframes hero-net-node { 0%,100%{opacity:.45} 50%{opacity:1} }
```
```html
<circle class="hero-net-pulse" r="3">
  <animateMotion dur="4s" repeatCount="indefinite" path="M90,70 L230,120 L150,250" />
</circle>
```
Em `prefers-reduced-motion`, o ponto viajante (`.hero-net-pulse`) é escondido via
`display: none`.

**Armadilha (Tier 2):** é uma metáfora **muito** específica de "dados". Num
detailing/estética não combina — no BoxShine foi trocada por streaks de luz. Não
reaproveite sem perguntar se a metáfora faz sentido.

### 2.8 Aurora + blobs de fundo — `.hero-aurora-bg`, `.hero-blob`

**O que é:** brilho radial quente atrás do hero + duas "bolhas" desfocadas que
flutuam lentamente, dando profundidade sem competir com o conteúdo.

```css
.hero-aurora-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(120% 90% at 72% 34%, rgba(232,169,62,.2), rgba(140,96,30,.08) 38%, transparent 66%),
    radial-gradient(80% 70% at 10% 90%, rgba(232,169,62,.07), transparent 60%);
}
.hero-blob   { position: absolute; border-radius: 50%; filter: blur(46px); }
.hero-blob-1 { animation: hero-blob-1 12s ease-in-out infinite; }
.hero-blob-2 { animation: hero-blob-2 15s ease-in-out infinite; }
```
Empacotado em `components/ui/hero-backdrop.tsx` (aurora + blobs + malha 2.7 juntos).

**Como reaproveitar:** é o fundo mais neutro/genérico do template — funciona em
quase qualquer cliente só trocando o acento. Bom ponto de partida quando a
metáfora específica (malha/órbita) não serve.

### 2.9 Anel ambiente giratório — `AmbientRing` (Framer Motion)

**O que é:** anéis concêntricos girando lentamente, versão "econômica" do núcleo
orbital, para ecoar a assinatura em seções internas (ROI Banner, Fundador).

**Arquivos:** `components/ui/ambient-ring.tsx`. Diferente do OrbitalCore (CSS
puro), este usa `motion` porque recebe `raios[]` e `baseDuration` variáveis e
gera N anéis programaticamente, cada um com `animate={{ rotate: ±360 }}`.

**Como reaproveitar:** props `className`, `raios`, `baseDuration`. É a forma de
repetir o motivo orbital em escala menor sem repetir o CSS do OrbitalCore.

### 2.10 Contador animado — `CountUp`

**O que é:** número que conta de 0 até o valor final quando entra na tela.

**Arquivos:** `components/ui/count-up.tsx`. Faz parse de `"+R$15MM"`, `"2x"`,
`"30+"` em prefixo/número/sufixo e anima só o número.

**Cuidados embutidos (não regredir):**
- **SSR mostra o valor real**, não "0" — o HTML inicial traz o valor final (bom
  para SEO / sem-JS); só no client ele reseta pra 0 (via `useLayoutEffect`, antes
  do paint) e anima até o valor. Regride fácil: se você renderizar "0" no
  servidor, crawlers leem "0x".
- `useInView` com `margin` **por eixo** (`"-80px 0px -80px 0px"`), nunca valor
  único (ver §4).

### 2.11 Reveal ao rolar — `Reveal`

**O que é:** wrapper que faz fade-in + subida quando o filho entra na viewport.
Usado em quase toda seção abaixo do hero.

**Arquivos:** `components/ui/reveal.tsx`. Props `delay`, `y`.

**Cuidado (bug já corrigido):** o `viewport.margin` **tem que ser por eixo**
(`"-80px 0px -80px 0px"`). Com valor único (`"-80px"`) a área de detecção encolhe
nos 4 lados e, em grids de 2 colunas no mobile, itens da coluna esquerda podem
nunca entrar em view.

### 2.12 Header com sublinhado animado + `MobileNav`

**O que é:** header sticky que escurece no scroll; no desktop, um sublinhado
dourado desliza suavemente entre os itens de nav no hover (efeito "magic line").

**Técnica:** o sublinhado é um único `motion.span` com `layoutId="nav-underline"`
— o Framer Motion anima a transição de posição entre os itens automaticamente
(shared layout). Estado `hovered` controla em qual item ele está.

**MobileNav** (`components/ui/mobile-nav.tsx`): menu hambúrguer que **fecha com
Escape e com clique/toque fora** (listener global só enquanto aberto), além de
fechar ao clicar num item. Padrão de acessibilidade a manter em todo cliente.

**Armadilhas:**
- Qualquer arquivo que use `motion.div`/`motion.span` direto precisa de
  `"use client"` no topo, mesmo que só renderize componentes client.
- Link do logo que "volta ao topo": use `onClick` + `window.scrollTo`, não
  `href="#"` puro (não rola de forma confiável).

### 2.13 Logo: vetorizar vs. `next/image`

Duas estratégias conforme o asset do cliente:

- **Ícone/marca simples → vetorizar** de PNG para SVG com `potrace`
  (`scripts/trace-logo.mjs`), virando `components/ui/logo.tsx` (herda
  `currentColor`, serve de favicon, escala sem perda). Foi o caso Versak.
- **Lockup completo (ícone + nome + tagline) → `next/image`.** Vetorizar um
  lockup vertical dá ruim no header horizontal. Melhor **recortar só o ícone** do
  PNG (fundo transparente via passe de alpha por luminosidade com `sharp`) e
  parear com o nome em texto HTML tingido no acento via `mask-image`. Foi o caso
  BoxShine.

---

## 3. Componentes nascidos em clientes

> Componentes que **não** existiam na Versak e nasceram durante um cliente.
> Passam a fazer parte do banco. Ao criar um novo, adicione aqui.

### 3.1 `ServiceBuilder` — orçamento/carrinho interativo *(origem: BoxShine)*

**O que é:** o cliente monta o próprio orçamento selecionando serviços de um
catálogo; o total e o CTA de WhatsApp se atualizam. É o principal ativo
reaproveitável do BoxShine.

**Reaproveitável para:** qualquer negócio de serviços com catálogo e preço
(pet shop, dentista, personal, buffet, estética). Tratar como **engine
genérica**, não código específico do BoxShine, ao estender.

**Padrão de dados associado:** todo número assumido/não confirmado pelo cliente
vive como constante nomeada em `content/premissas.ts` — nunca hardcoded no
componente. Valor `null` = a seção **não renderiza** aquela copy (nunca fabrica
placeholder). Conserto quando o cliente confirma = mudança de uma linha.

### 3.2 `Typewriter` — headline em máquina de escrever *(origem: BoxShine)*

**O que é:** headline que digita duas frases em sequência. **SSR-safe**: renderiza
a primeira frase inteira antes da hidratação (não quebra SEO nem pisca vazio).
Arquivo: `components/ui/typewriter.tsx`.

### 3.3 Streaks de luz / painel light-sweep *(origem: BoxShine)*

**O que é:** substituto do motivo orbital/malha para negócios de estética — faixas
de luz (dourada + prata + dourada fina) varrendo a coluna do hero, evocando
brilho/polimento em vez de "dados". Mesma família de técnica do `qs-flow` (2.4):
gradiente largo deslocando `background-position`.

### 3.4 Família de token neutro + regra semântica *(origem: BoxShine)*

`--color-silver: #cfd4da` e a regra **acento = valor / prata = estrutura**
(eyebrows, ícones, setas, bordas de hover em prata; dourado só em preço, botão
primário, números, estado selecionado, highlight). Ver §0.

### 3.5 Texto contornado/"vazado" — `.text-gold-outline` *(origem: BoxShine)*

Texto com contorno no acento (via `text-stroke`) e **fallback sólido** por
`@supports` para navegadores sem suporte a `-webkit-text-stroke`.

---

## 4. Regras de ouro e armadilhas

### Checklist de pré-voo (rodar em toda seção nova/adaptada)

- [ ] `useInView`/`whileInView` sempre com `margin` **por eixo**
      (`"-80px 0px -80px 0px"`), nunca valor único.
- [ ] Nenhum `href="#"` "morto" sem `onClick` real (use `preventDefault` +
      `scrollTo`, ou um `href` de verdade).
- [ ] Conteúdo com informação **nunca** escondido só atrás de `:hover` — em touch
      não há hover. Gatear com `@media (hover: hover)` ou dar alternativa de
      toque/foco.
- [ ] `CountUp`: SSR mostra o valor real, não "0".
- [ ] `col-span` em grid não funciona em **neto** do grid (item dentro de um
      wrapper como `Reveal`). Use seletor no wrapper/`nth-child` no container.
- [ ] Arquivo que usa `motion.div`/`motion.span` direto tem `"use client"`.
- [ ] Nunca rodar `next build` na mesma pasta com `next dev` ativo (corrompe o
      cache do webpack do dev server).
- [ ] Menu mobile fecha com Escape e com clique/toque fora.
- [ ] `tsc --noEmit` e `eslint .` limpos antes de considerar pronto.

### Lições de replicação (não repetir os erros)

- **Tier 2 = redesenhar o motivo, não só trocar o texto.** Todo elemento
  decorativo/animado herdado (órbita, malha, letras do nome) é um item que exige
  **redesign real** por cliente. Pergunte explicitamente *"essa metáfora visual
  ainda faz sentido para o negócio deste cliente?"* — do mesmo jeito que você já
  pergunta para a copy. Reaproveitar o motivo só re-skinado foi reclamado
  ("as animações não combinam com o serviço").
- **Nunca inventar fato operacional.** Não afirme como o serviço funciona (o que
  o cliente precisa fornecer, o que está incluso) sem estar nos docs do cliente
  ou confirmado. Escreva como placeholder/pergunta, não como fato plausível.
- **Trocar imagem em `public/` → renomear o arquivo.** Sobrescrever `carro.jpg`
  com bytes novos serve versão velha em cache (o otimizador `/_next/image` cacheia
  por URL). Sempre renomeie (`carro.jpg` → `corolla.jpg`) ao trocar asset.
- **Acento em tudo = "corporativo".** Se o cliente achar o design "parecido com o
  anterior", verifique se a cor de acento está em *tudo* (chrome + valor) antes de
  trocar a tonalidade. Estreitar o escopo semântico costuma resolver mais.
- **Reskin de cliente = repo novo e independente.** Nunca fork (o histórico do
  cliente anterior tem dados pessoais/fotos). Clonar o motor, apagar `.git`,
  reinicializar, e remover fotos/contatos do cliente anterior do `public/`.

---

## 5. Registro de evolução

> Uma entrada por site. Ao terminar um projeto, registre: o que reaproveitou, o
> que redesenhou (Tier 2), o que nasceu de novo, e a lição principal.

### 🟡 Versak — origem do template *(2026-07)*
- **Nasceu aqui:** todo o catálogo da seção 2 (OrbitalCore, hero-glass, letras/
  números metálicos 3D, brilho `qs-flow`, duotone, carrossel embla, malha de
  dados, aurora/blobs, AmbientRing, CountUp, Reveal, header magic-line, MobileNav,
  logo via potrace).
- **Metáforas:** Dados / Segurança / Processo (consultoria de gestão B2B).
- **Paleta:** dark + dourado.
- **Lição principal:** estabeleceu as 3 regras de ouro (cor→tokens, texto→content,
  3D→CSS puro). Auditoria posterior corrigiu bugs de mobile (Reveal margin,
  duotone em touch, href morto, CountUp SSR, órbita solta no mobile).

### 🟡 BoxShine — 1ª replicação real *(2026-07)*
- **Cliente:** detailing automotivo delivery (Ivan, Jundiaí/SP).
- **Reaproveitou (Tier 3):** `components/ui`, `lib/seo.ts`, padrão de `tokens.css`.
  Paleta preto+dourado já batia com a marca → tokens quase inalterados.
- **Redesenhou (Tier 2):** hero deixou de usar órbita/malha (metáfora de dados) →
  streaks de luz (metáfora de brilho/polimento). Seções B2B (Quem Somos, Dores,
  Mercados, ROI, CTA) **deletadas**, não só ocultadas.
- **Nasceu de novo:** `ServiceBuilder` (3.1), `Typewriter` (3.2), streaks de luz
  (3.3), token `--color-silver` + regra semântica (3.4), `.text-gold-outline`
  (3.5), padrão `content/premissas.ts`.
- **Lição principal:** motivo decorativo herdado é Tier 2 (redesenhar, não
  re-skinar); acento só em valor, neutro na estrutura; renomear asset ao trocar
  imagem em `public/`.

### ⬜ [Próximo cliente] — *(data)*
- **Cliente:**
- **Reaproveitou:**
- **Redesenhou (Tier 2):**
- **Nasceu de novo:**
- **Lição principal:**
```
```

---

**Documentos irmãos:** `docs/template-playbook.md` (método operacional de
replicação: estratégia de repo, tiers, passo a passo) e `README.md` (arquitetura
e visão geral). Este arquivo é o **como os efeitos são feitos**; o playbook é o
**como tocar um projeto novo**.
