# Setores que atendemos — carrossel de cards com duotone dourado

Data: 2026-07-10
Status: Design aprovado pelo usuário (Matheus) via mockup interativo + escolhas de mecânica. Branch: `hero-visual-redesign`.

## Contexto

A seção "Mercados de atuação" (`components/sections/mercados.tsx`) hoje é um grid estático de 9 cards com ícone lucide + nome + segmentos (usando `GlowCard`/`IconBadge`). O usuário quer transformá-la num **carrossel interativo** onde cada card exibe o **nome do setor sobreposto a uma imagem de fundo temática**, e a imagem não aparece nas cores originais — é filtrada/mesclada com o dourado da marca (efeito **duotone**) para consistência visual.

Decisões fechadas com o usuário:
- **Imagens**: eu busco em banco gratuito (Unsplash). O filtro dourado é aplicado por **CSS** (duotone), então servem fotos normais.
- **Carrossel**: biblioteca **`embla-carousel-react`** (loop + arrasto + setas).
- **Segmentos** (ex.: "Autopeças, Metalurgia…"): aparecem **só no hover** (o card mostra só o nome por padrão).

## O que muda

1. **Imagens dos 9 setores** — baixadas do Unsplash (URLs já verificadas, ver abaixo), otimizadas com `sharp` (já é devDep) para `public/setores/<slug>.webp` (~640×960, cover, webp). O caminho de cada imagem entra em `content/home.ts` como um campo `imagem` por grupo.
2. **Duotone dourado (CSS)** — a imagem em `grayscale` + uma camada `bg-gold` com `mix-blend-mode: color` (recolore para monocromático dourado) + um segundo overlay sutil + um scrim escuro no rodapé para legibilidade do texto. No hover: zoom leve na imagem, borda dourada, e os segmentos são revelados. Classes em `theme/tokens.css` (`.setor-*`).
3. **Carrossel** — novo componente **client** `components/ui/setores-carousel.tsx` usando `embla-carousel-react` (`loop: true`, arrasto, `align: "start"`), com botões prev/next (setas lucide `ChevronLeft`/`ChevronRight`) e larguras de slide responsivas (mostra ~1,3 no mobile, ~2 no tablet, ~4 no desktop, com o próximo "espiando").
4. **`mercados.tsx` vira fino** — mantém `SectionHeading` (server) + `Reveal`, e renderiza `<SetoresCarousel grupos={mercados.grupos} />`. Saem o grid, o mapa `ICONES`, `GlowCard` e `IconBadge` desta seção.

## Arquitetura / decisões

- **Nova dependência**: `embla-carousel-react` (v8.6.0, compatível com React 19). **Sem** autoplay nesta entrega (loop + arrasto + setas bastam; autoplay fica como toggle futuro fácil — evita a complexidade de pausar em hover/foco e tratar reduced-motion).
- **Server vs client**: `mercados.tsx` continua Server Component (só `SectionHeading`/`Reveal`); apenas `setores-carousel.tsx` é `"use client"` (usa o hook `useEmblaCarousel`). Um Server Component pode renderizar o carrossel client normalmente.
- **Imagens locais**: as fotos são baixadas e otimizadas para `public/setores/` — o site serve arquivos locais (`/setores/x.webp`), **não** faz hotlink do Unsplash. Assim não é preciso configurar domínios remotos no `next.config` nem depender do Unsplash em runtime. Licença Unsplash permite uso comercial sem atribuição.
- **Cores/gradientes** do duotone ficam em `theme/tokens.css` (camada de tema). O componente só usa classes `.setor-*` + utilitários Tailwind.
- **`next/image`** com `fill` para as fotos (lazy, `sizes` responsivo). `alt=""` — a imagem é decorativa/atmosférica; o nome do setor é o conteúdo textual real.
- **Reduced motion**: o zoom de hover é uma `transition` (a regra global já zera a duração para quem prefere menos movimento). Arrasto do embla é iniciado pelo usuário. Sem autoplay, nada anima sozinho.
- **`GlowCard`/`IconBadge`/`SectionHeading`** permanecem no projeto (o plano confirma se `GlowCard` fica órfão; se ficar, é um primitivo reutilizável — mantido, não removido). A Mercados apenas deixa de usar `GlowCard`/`IconBadge`.

## Imagens (URLs Unsplash verificadas — HTTP 200 em 2026-07-10)

Base: `https://images.unsplash.com/<id>?w=640&h=960&fit=crop&q=72`. Slug = nome do arquivo em `public/setores/`.

| Setor | slug | Unsplash id |
|---|---|---|
| Indústria de Manufatura Seriada | `industria` | `photo-1565043666747-69f6646db940` |
| Engenharia e Projetos | `engenharia` | `photo-1581092160562-40aa08e78837` |
| Agronegócio | `agronegocio` | `photo-1500937386664-56d1dfef3854` |
| Construção Civil | `construcao` | `photo-1541888946425-d81bb19240f5` |
| Logística e Transporte | `logistica` | `photo-1601584115197-04ecc0da31d7` |
| Comércio | `comercio` | `photo-1441986300917-64674bd600d8` |
| Saúde | `saude` | `photo-1519494026892-80bbd2d6fd0d` |
| Serviços | `servicos` | `photo-1497215728101-856f4ea42174` |
| Tecnologia | `tecnologia` | `photo-1518770660439-4636190af475` |

Fallbacks verificados (200), caso alguma principal falhe no dia: indústria `photo-1504328345606-18bbc8c9d7d1`, agro `photo-1625246333195-78d9c38ad449`, logística `photo-1553413077-190dd305871c`, comércio `photo-1556742049-0cfed4f6a45d`, saúde `photo-1538108149393-fbbd81895907`, serviços `photo-1521737604893-d14cc237f11d`, tecnologia `photo-1526374965328-7f61d4dc18c5`. Se mesmo os fallbacks falharem, gravar um placeholder cinza e sinalizar para troca (o duotone dourado disfarça a diferença).

## Referência visual (do mockup aprovado)

**Duotone (`.setor-*` em `theme/tokens.css`)**
- `.setor-card`: `position:relative; overflow:hidden; border-radius:14px; border:1px solid rgba(232,169,62,.18); transition: border-color .35s;` — hover `border-color: rgba(232,169,62,.55);`
- `.setor-img`: `object-fit:cover; filter: grayscale(1) contrast(1.06); transition: transform .5s ease;` — hover (`.setor-card:hover .setor-img`) `transform: scale(1.07);`
- `.setor-gold`: `position:absolute; inset:0; background:#e8a93e; mix-blend-mode:color;`
- `.setor-gold2`: `position:absolute; inset:0; background: linear-gradient(180deg, rgba(232,169,62,.12), rgba(122,92,38,.22)); mix-blend-mode:overlay;`
- `.setor-scrim`: `position:absolute; inset:0; background: linear-gradient(to top, rgba(9,7,4,.96), rgba(9,7,4,.35) 46%, rgba(9,7,4,.08) 72%, transparent);`
- `.setor-seg`: `max-height:0; opacity:0; overflow:hidden; transition: all .4s ease;` — hover (`.setor-card:hover .setor-seg`) `max-height:60px; opacity:1;`

**Card / slide**
- Card: `.setor-card group h-80` (altura fixa 320px), `next/image fill object-cover`.
- Slide (embla): `min-w-0 flex-[0_0_78%] sm:flex-[0_0_44%] lg:flex-[0_0_23%]`; track `flex gap-4`.
- Corpo: `absolute inset-x-0 bottom-0 p-4`; nome `font-display text-base font-semibold text-white`; segmentos `.setor-seg text-xs text-[#e7d9bd]`.
- Setas: botões redondos (`h-10 w-10 rounded-full`), borda dourada translúcida, fundo `bg-panel/85` + `backdrop-blur`, ícone `text-gold`, `aria-label` "Anterior"/"Próximo", posicionados sobre as bordas laterais.

## Fora de escopo

- Autoplay do carrossel (fica como melhoria futura; a base já é embla).
- Páginas por setor / links nos cards (os cards são informativos).
- Outras seções — intocadas.
- Configurar imagens remotas no `next.config` (usamos imagens locais otimizadas).

## Verificação

Sem framework de testes unitários. Validação: `npx tsc --noEmit` + `npx eslint .` + `npm run build` limpos + verificação visual no dev server (desktop e mobile ~375px):
- Carrossel com os 9 setores; cada card com foto em **duotone dourado** (não nas cores originais) e o nome sobreposto.
- Arrasto/swipe funciona; setas prev/next funcionam; loop dá a volta.
- Hover: zoom leve + borda dourada + segmentos revelados.
- Sem scroll horizontal indevido na página no mobile (o overflow é do track do carrossel, controlado pelo embla).
- Imagens carregando de `public/setores/*.webp` (locais), lazy via `next/image`.
- Mercados/outras seções sem regressão.
