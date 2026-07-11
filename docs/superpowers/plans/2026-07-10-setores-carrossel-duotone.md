# Setores que atendemos — carrossel duotone — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a seção "Mercados de atuação" num carrossel (embla) de cards, cada um com uma foto de fundo do setor filtrada em duotone dourado (grayscale + `mix-blend-mode: color`) e o nome sobreposto, com os segmentos revelados no hover.

**Architecture:** As 9 fotos são baixadas do Unsplash e otimizadas com `sharp` para `public/setores/*.webp` (imagens locais), com o caminho em `content/home.ts`. O duotone é CSS (`.setor-*` em `theme/tokens.css`). Um componente client `components/ui/setores-carousel.tsx` usa `embla-carousel-react`; `mercados.tsx` continua Server Component e apenas renderiza o carrossel abaixo do `SectionHeading`.

**Tech Stack:** Next.js 15 (App Router, `next/image`), React 19, TypeScript, Tailwind CSS v4, `embla-carousel-react` (novo), `sharp` (devDep, já instalado), `lucide-react`.

## Global Constraints

- Repositório **sem framework de testes unitários**. Validação por task: `npx tsc --noEmit` + `npx eslint <arquivos>` + (nas tasks visuais) `npm run build` + verificação visual no dev server (desktop e mobile ~375px). Se `npm run build` falhar com `EINVAL: readlink ... .next/...`, é artefato do OneDrive: `rm -rf .next` e repetir.
- **Nenhuma cor "hardcoded" fora de `theme/tokens.css`** — os literais dourados/gradientes do duotone (incl. a cor do texto dos segmentos) ficam em `theme/tokens.css`; o componente só usa classes `.setor-*` + utilitários Tailwind de `--color-*` (`text-gold`, `border-gold-dim`, `bg-panel`, etc.). `text-white` (utilitário Tailwind) é permitido para o nome.
- **`mercados.tsx` continua Server Component** (sem `"use client"`); apenas `setores-carousel.tsx` é `"use client"` (usa `useEmblaCarousel`).
- **Imagens locais**: servir de `public/setores/*.webp` (baixadas/otimizadas), **nunca** hotlink do Unsplash — assim não é preciso configurar domínios remotos no `next.config`.
- **Não remover** `GlowCard`/`IconBadge`/`SectionHeading` do projeto. `IconBadge` segue usado pelo Hero; `GlowCard` fica órfão após esta mudança — **manter o arquivo** (primitivo reutilizável), não deletar.
- `tsconfig.json` tem `noUncheckedIndexedAccess: true` — ao indexar arrays por índice, usar `?? fallback`.
- `embla-carousel-react` **sem autoplay** nesta entrega (loop + arrasto + setas).
- Rodar comandos a partir da raiz do worktree: `C:\Users\mathe\OneDrive\Documentos\Versak\versak-landing\.worktrees\hero-visual-redesign`.

---

### Task 1: Baixar e otimizar as 9 imagens + campo `imagem` em `content/home.ts`

**Files:**
- Create: `scripts/fetch-setores.mjs`
- Create: `public/setores/*.webp` (9 arquivos, gerados)
- Modify: `package.json` (script `setores:fetch`)
- Modify: `content/home.ts` (adicionar `imagem` a cada `mercados.grupos`)

**Interfaces:**
- Produces: 9 arquivos `public/setores/<slug>.webp`; cada `mercados.grupos[i]` ganha `imagem: "/setores/<slug>.webp"`. Consumidos pela Task 3.

- [ ] **Step 1: Criar `scripts/fetch-setores.mjs`**

```js
import { mkdir, writeFile } from "node:fs/promises"
import sharp from "sharp"

const BASE = "https://images.unsplash.com"
const QUERY = "?w=640&h=960&fit=crop&q=72"

// slug -> [id principal, id fallback] (todos verificados HTTP 200 em 2026-07-10)
const SETORES = [
  ["industria", "photo-1565043666747-69f6646db940", "photo-1504328345606-18bbc8c9d7d1"],
  ["engenharia", "photo-1581092160562-40aa08e78837", "photo-1581092160562-40aa08e78837"],
  ["agronegocio", "photo-1500937386664-56d1dfef3854", "photo-1625246333195-78d9c38ad449"],
  ["construcao", "photo-1541888946425-d81bb19240f5", "photo-1503387762-592deb58ef4e"],
  ["logistica", "photo-1601584115197-04ecc0da31d7", "photo-1553413077-190dd305871c"],
  ["comercio", "photo-1441986300917-64674bd600d8", "photo-1556742049-0cfed4f6a45d"],
  ["saude", "photo-1519494026892-80bbd2d6fd0d", "photo-1538108149393-fbbd81895907"],
  ["servicos", "photo-1497215728101-856f4ea42174", "photo-1521737604893-d14cc237f11d"],
  ["tecnologia", "photo-1518770660439-4636190af475", "photo-1526374965328-7f61d4dc18c5"],
]

async function fetchBuffer(id) {
  const res = await fetch(`${BASE}/${id}${QUERY}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

await mkdir("public/setores", { recursive: true })
for (const [slug, id, fallback] of SETORES) {
  let buf
  try {
    buf = await fetchBuffer(id)
  } catch (e) {
    console.warn(`${slug}: principal falhou (${e.message}); tentando fallback`)
    buf = await fetchBuffer(fallback)
  }
  const out = await sharp(buf).resize(640, 960, { fit: "cover" }).webp({ quality: 72 }).toBuffer()
  await writeFile(`public/setores/${slug}.webp`, out)
  console.log(`${slug}.webp — ${(out.length / 1024).toFixed(0)} KB`)
}
console.log("OK: 9 imagens em public/setores/")
```

- [ ] **Step 2: Adicionar o script npm e rodar**

Em `package.json`, dentro de `"scripts"`, adicionar:

```json
"setores:fetch": "node scripts/fetch-setores.mjs"
```

Run: `npm run setores:fetch`
Expected: imprime as 9 linhas `<slug>.webp — NN KB` e "OK". Conferir que existem 9 arquivos: `ls public/setores` deve listar `industria.webp engenharia.webp agronegocio.webp construcao.webp logistica.webp comercio.webp saude.webp servicos.webp tecnologia.webp`. Se alguma imagem vier corrompida/muito pequena (< 5 KB), rodar de novo; se persistir, o `fetch` já cai no fallback automaticamente.

- [ ] **Step 3: Adicionar o campo `imagem` a cada grupo em `content/home.ts`**

No objeto `mercados`, acrescentar `imagem` a cada item de `grupos` (a ordem já bate com os slugs):

```ts
  grupos: [
    { nome: "Indústria de Manufatura Seriada", segmentos: "Autopeças, Metalurgia, Alimentos, Têxtil, Química", imagem: "/setores/industria.webp" },
    { nome: "Engenharia e Projetos", segmentos: "Máquinas Especiais, Automação, Empresas EPC", imagem: "/setores/engenharia.webp" },
    { nome: "Agronegócio", segmentos: "Produtores Rurais, Cooperativas, Agroindústrias", imagem: "/setores/agronegocio.webp" },
    { nome: "Construção Civil", segmentos: "Construtoras, Incorporadoras, Obras Industriais", imagem: "/setores/construcao.webp" },
    { nome: "Logística e Transporte", segmentos: "Transportadoras, Centros de Distribuição, Frotas", imagem: "/setores/logistica.webp" },
    { nome: "Comércio", segmentos: "Atacadistas, Distribuidores, Varejo", imagem: "/setores/comercio.webp" },
    { nome: "Saúde", segmentos: "Hospitais, Clínicas, Laboratórios", imagem: "/setores/saude.webp" },
    { nome: "Serviços", segmentos: "Facilities, Consultorias, Escritórios de Engenharia", imagem: "/setores/servicos.webp" },
    { nome: "Tecnologia", segmentos: "Software, SaaS, Infraestrutura de TI, IA", imagem: "/setores/tecnologia.webp" },
  ],
```

- [ ] **Step 4: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint content/home.ts scripts/fetch-setores.mjs`
Expected: PASS. (O campo novo ainda não é consumido; `mercados.tsx` usa `nome`/`segmentos` e não quebra com um campo a mais.)

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-setores.mjs package.json content/home.ts public/setores
git commit -m "feat: fetch+optimize sector images and add imagem field to mercados content"
```

---

### Task 2: Instalar embla + estilos duotone em `theme/tokens.css`

**Files:**
- Modify: `package.json` / `package-lock.json` (dependência `embla-carousel-react`)
- Modify: `theme/tokens.css` (classes `.setor-*`)

**Interfaces:**
- Produces: `embla-carousel-react` disponível; classes `.setor-card`, `.setor-img`, `.setor-gold`, `.setor-gold2`, `.setor-scrim`, `.setor-seg`. Consumidas pela Task 3.

- [ ] **Step 1: Instalar a dependência**

Run: `npm install embla-carousel-react`
Expected: instala `embla-carousel-react` (v8.x). Se aparecer aviso de peer dependency do React 19, é só aviso — segue.

- [ ] **Step 2: Acrescentar o bloco ao final de `theme/tokens.css`**

```css
/* ---- Setores: cards em duotone dourado ---- */
.setor-card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  height: 20rem;
  border-radius: 14px;
  border: 1px solid rgba(232, 169, 62, 0.18);
  transition: border-color 0.35s;
}
.setor-card:hover {
  border-color: rgba(232, 169, 62, 0.55);
}
.setor-img {
  filter: grayscale(1) contrast(1.06);
  transition: transform 0.5s ease;
}
.setor-card:hover .setor-img {
  transform: scale(1.07);
}
.setor-gold {
  position: absolute;
  inset: 0;
  background: #e8a93e;
  mix-blend-mode: color;
}
.setor-gold2 {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(232, 169, 62, 0.12), rgba(122, 92, 38, 0.22));
  mix-blend-mode: overlay;
}
.setor-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(9, 7, 4, 0.96), rgba(9, 7, 4, 0.35) 46%, rgba(9, 7, 4, 0.08) 72%, transparent);
}
.setor-seg {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  color: #e7d9bd;
  transition: all 0.4s ease;
}
.setor-card:hover .setor-seg {
  max-height: 60px;
  opacity: 1;
}
```

> `isolation: isolate` é importante: contém o `mix-blend-mode` dentro do card (mistura só com a imagem do próprio card, não com o fundo da página).

- [ ] **Step 3: Verificar tipos, lint e build**

Run: `npx tsc --noEmit && npx eslint . && npm run build`
Expected: os três limpos (classes ainda não usadas; embla instalado mas ainda não importado). Se `build` falhar com `EINVAL readlink .next/...`, rodar `rm -rf .next && npm run build`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json theme/tokens.css
git commit -m "feat: add embla-carousel-react and Setores duotone styles"
```

---

### Task 3: Componente `SetoresCarousel` + reescrever `mercados.tsx`

**Files:**
- Create: `components/ui/setores-carousel.tsx`
- Modify: `components/sections/mercados.tsx` (reescrita: remove grid/ícones, usa o carrossel)

**Interfaces:**
- Consumes: `embla-carousel-react` (Task 2); classes `.setor-*` (Task 2); `mercados.grupos` com `imagem` (Task 1); `next/image`, `lucide-react` (`ChevronLeft`/`ChevronRight`), `Container`, `SectionHeading`, `Reveal` (existentes).

- [ ] **Step 1: Criar `components/ui/setores-carousel.tsx`**

```tsx
"use client"

import { useCallback } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Grupo = { nome: string; segmentos: string; imagem: string }

export function SetoresCarousel({ grupos }: { grupos: readonly Grupo[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" })
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <div className="relative mt-12" role="region" aria-label="Setores que atendemos">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {grupos.map((grupo) => (
            <div key={grupo.nome} className="min-w-0 flex-[0_0_78%] sm:flex-[0_0_44%] lg:flex-[0_0_23%]">
              <article className="setor-card group">
                <Image
                  src={grupo.imagem}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 44vw, 23vw"
                  className="setor-img object-cover"
                />
                <span aria-hidden className="setor-gold" />
                <span aria-hidden className="setor-gold2" />
                <span aria-hidden className="setor-scrim" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-display text-base font-semibold leading-tight text-white">{grupo.nome}</p>
                  <p className="setor-seg text-xs leading-relaxed">{grupo.segmentos}</p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Anterior"
        className="absolute -left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold-dim bg-panel/85 text-gold backdrop-blur transition-colors hover:border-gold hover:bg-panel"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        aria-label="Próximo"
        className="absolute -right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold-dim bg-panel/85 text-gold backdrop-blur transition-colors hover:border-gold hover:bg-panel"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
```

Nota: `next/image` com `fill` exige um pai posicionado e com altura — o `.setor-card` fornece `position: relative` + `height: 20rem` (Task 2). As imagens são locais (`/setores/*.webp`), então não é preciso configurar domínios no `next.config`.

- [ ] **Step 2: Reescrever `components/sections/mercados.tsx`**

```tsx
import { Container } from "@/components/ui/container"
import { SectionHeading } from "@/components/ui/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { SetoresCarousel } from "@/components/ui/setores-carousel"
import { mercados } from "@/content/home"

export function Mercados() {
  return (
    <section id="mercados" className="border-t border-line py-24">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={mercados.eyebrow} titulo={mercados.titulo} subtitulo={mercados.subtitulo} />
        </Reveal>
        <SetoresCarousel grupos={mercados.grupos} />
      </Container>
    </section>
  )
}
```

Notas para o implementador:
- Isto remove os imports de `lucide-react` (o mapa `ICONES`), `GlowCard`, `IconBadge` da Mercados — não deve sobrar import/variável sem uso (eslint `no-unused-vars`).
- Não adicionar `"use client"` no `mercados.tsx` — só o `setores-carousel.tsx` é client.

- [ ] **Step 3: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/ui/setores-carousel.tsx components/sections/mercados.tsx`
Expected: PASS, zero erros/warnings.

- [ ] **Step 4: Build de produção**

Run: `npm run build`
Expected: sucesso. (Se `EINVAL readlink .next/...`, rodar `rm -rf .next && npm run build`.)

- [ ] **Step 5: Verificação visual (dev server)**

Com `npm run dev`, abrir `http://localhost:3000` e rolar até "Mercados de atuação". Confirmar:
- Carrossel com os 9 setores; cada card mostra a foto em **duotone dourado** (não nas cores originais) com o **nome sobreposto** embaixo.
- **Arrastar** (mouse/touch) move os cards; **setas** ‹ › navegam; o **loop** dá a volta ao passar do último.
- **Hover** num card: leve zoom na imagem, borda dourada, e os **segmentos** aparecem.
- Em mobile (~375px): ~1 card e "pedacinho" do próximo; **sem scroll horizontal na página** (o overflow é interno do carrossel).
- As imagens carregam de `/setores/*.webp` (rede: sem chamada ao unsplash em runtime).
- Rolar as outras seções e confirmar que nada regrediu.

- [ ] **Step 6: Commit**

```bash
git add components/ui/setores-carousel.tsx components/sections/mercados.tsx
git commit -m "feat: replace Mercados grid with duotone sector carousel (embla)"
```

---

## Resumo de arquivos tocados

**Novos:**
- `scripts/fetch-setores.mjs`
- `public/setores/*.webp` (9)
- `components/ui/setores-carousel.tsx`

**Modificados:**
- `content/home.ts` (campo `imagem` em `mercados.grupos`)
- `package.json` / `package-lock.json` (dep `embla-carousel-react`, script `setores:fetch`)
- `theme/tokens.css` (classes `.setor-*`)
- `components/sections/mercados.tsx` (reescrita: carrossel no lugar do grid)

**Inalterados (confirmar):**
- `components/ui/glow-card.tsx` (fica órfão, mas mantido), `icon-badge.tsx` (ainda usado pelo Hero), `section-heading.tsx`
