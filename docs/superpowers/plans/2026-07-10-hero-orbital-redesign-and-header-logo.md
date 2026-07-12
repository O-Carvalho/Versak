# Hero orbital 3D + backdrop de dados, e Header com logo vetorizada — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernizar o hero (núcleo orbital 3D em CSS, fundo aurora quente, malha de pontos que se interligam, cards de vidro flutuando fluido, título sem vírgula, sem eyebrow, ícones novos, scroll cue) e inserir a logo da marca vetorizada (PNG→SVG) no header.

**Architecture:** O visual pesado do hero é CSS/SVG faux-3D: classes e keyframes ficam em `theme/tokens.css`; dois componentes de apresentação puros (`OrbitalCore`, `HeroBackdrop`) sem `"use client"` consomem essas classes e são montados pelo `hero.tsx` (client). A logo é vetorizada por um script one-time (`potrace` + `sharp`, devDeps) que gera `components/ui/logo.tsx` (SVG inline com `fill="currentColor"`), consumido pelo `header.tsx`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, `motion` (Framer Motion) v11, `lucide-react`; devDeps de build: `potrace`, `sharp`.

## Global Constraints

- Repositório **sem framework de testes unitários**. Validação por task: `npx tsc --noEmit` + `npx eslint <arquivos>` + (quando houver mudança visual) `npm run build` + verificação visual no dev server (desktop e mobile ~375px). Não criar framework de testes (YAGNI).
- **Nenhuma cor "hardcoded" fora de `theme/tokens.css`** — literais dourados/gradientes/sombras deste hero ficam em `theme/tokens.css`; componentes só referenciam classes `.hero-*`/utilitários Tailwind de `--color-*`.
- **Componentes de apresentação (`orbital-core.tsx`, `hero-backdrop.tsx`, `logo.tsx`) NÃO levam `"use client"`** — são só markup + CSS/SVG, sem hooks. São renderizados dentro de `hero.tsx`/`header.tsx` (que já são client).
- **Não remover** `AmbientRing`, `IconBadge`, `GlowCard` do projeto (usados por outras seções). O hero apenas **deixa de usar** `AmbientRing`.
- `tsconfig.json` tem `noUncheckedIndexedAccess: true` — ao indexar arrays por variável de loop, usar `?? fallback` (padrão já usado no projeto).
- Reduced motion: a regra global `@media (prefers-reduced-motion: reduce)` em `theme/tokens.css` já zera animações CSS; para os pulsos SMIL da malha, adicionar uma regra que os oculta (incluída na Task 1).
- `potrace`/`sharp` são **devDependencies** (não entram no bundle de cliente); o deliverable versionado é `components/ui/logo.tsx`.
- Rodar todos os comandos a partir da raiz do worktree: `C:\Users\mathe\OneDrive\Documentos\Versak\versak-landing\.worktrees\hero-visual-redesign`.
- **Pré-requisito da Task 4**: o PNG da logo precisa estar na raiz do projeto como `logo-versak.png`. Se ainda não estiver, a Task 4 fica bloqueada até o arquivo ser colocado.

---

### Task 1: Estilos do hero em `theme/tokens.css`

**Files:**
- Modify: `theme/tokens.css` (acrescentar ao final: keyframes + classes `.hero-*`)

**Interfaces:**
- Consumes: nada.
- Produces: classes `.hero-aurora-bg`, `.hero-blob`(+`-1`/`-2`), `.hero-net`(+`-link`/`-link-delayed`/`-node`/`-pulse`), `.hero-stage`, `.hero-sys`, `.hero-ring`(+`-1`/`-2`/`-3`), `.hero-core`, `.hero-halo`, `.hero-glass`, `.hero-float-1`/`-2`/`-3`, e os keyframes `hero-spin-a/b/c`, `hero-halo`, `hero-blob-1`, `hero-blob-2`, `hero-float`, `hero-fade-in`, `hero-net-link`, `hero-net-node`. Consumidos pelas Tasks 2 e 3.

- [ ] **Step 1: Acrescentar o bloco ao final de `theme/tokens.css`**

Adicionar após a última regra existente do arquivo:

```css
/* ---- Hero: núcleo orbital 3D, aurora e malha de dados ---- */
@keyframes hero-spin-a {
  from {
    transform: rotateX(68deg) rotateZ(0);
  }
  to {
    transform: rotateX(68deg) rotateZ(360deg);
  }
}
@keyframes hero-spin-b {
  from {
    transform: rotateY(66deg) rotateZ(0);
  }
  to {
    transform: rotateY(66deg) rotateZ(-360deg);
  }
}
@keyframes hero-spin-c {
  from {
    transform: rotateX(28deg) rotateY(42deg) rotateZ(0);
  }
  to {
    transform: rotateX(28deg) rotateY(42deg) rotateZ(360deg);
  }
}
@keyframes hero-halo {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.08);
  }
}
@keyframes hero-blob-1 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-16px, 14px) scale(1.1);
  }
}
@keyframes hero-blob-2 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(14px, -12px) scale(1.08);
  }
}
@keyframes hero-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-9px);
  }
}
@keyframes hero-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes hero-net-link {
  0%,
  100% {
    opacity: 0.15;
  }
  50% {
    opacity: 0.8;
  }
}
@keyframes hero-net-node {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 1;
  }
}

.hero-aurora-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(120% 90% at 72% 34%, rgba(232, 169, 62, 0.2), rgba(140, 96, 30, 0.08) 38%, transparent 66%),
    radial-gradient(80% 70% at 10% 90%, rgba(232, 169, 62, 0.07), transparent 60%);
}
.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(46px);
}
.hero-blob-1 {
  width: 220px;
  height: 220px;
  right: 14%;
  top: 8%;
  background: rgba(232, 169, 62, 0.16);
  animation: hero-blob-1 12s ease-in-out infinite;
}
.hero-blob-2 {
  width: 180px;
  height: 180px;
  left: 6%;
  bottom: 2%;
  background: rgba(201, 139, 44, 0.12);
  animation: hero-blob-2 15s ease-in-out infinite;
}

.hero-net {
  position: absolute;
  inset: 0;
  opacity: 0.55;
}
.hero-net line {
  stroke: rgba(232, 169, 62, 0.3);
  stroke-width: 1;
}
.hero-net-link {
  animation: hero-net-link 6s ease-in-out infinite;
}
.hero-net-link-delayed {
  animation: hero-net-link 6s ease-in-out infinite 3s;
}
.hero-net circle {
  fill: #e8a93e;
}
.hero-net-node {
  animation: hero-net-node 4s ease-in-out infinite;
}
.hero-net-pulse {
  fill: #f5cc81;
}

.hero-stage {
  position: relative;
  width: 100%;
  max-width: 360px;
  aspect-ratio: 1;
  margin-inline: auto;
  perspective: 900px;
}
.hero-sys {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 70%;
  aspect-ratio: 1;
  transform-style: preserve-3d;
}
.hero-ring {
  position: absolute;
  inset: 0;
  margin: auto;
  border-radius: 50%;
  border: 1.5px solid rgba(232, 169, 62, 0.32);
}
.hero-ring::after {
  content: "";
  position: absolute;
  top: -4px;
  left: 50%;
  width: 7px;
  height: 7px;
  margin-left: -3px;
  border-radius: 50%;
  background: #f5cc81;
  box-shadow: 0 0 12px 2px rgba(232, 169, 62, 0.8);
}
.hero-ring-1 {
  animation: hero-spin-a 16s linear infinite;
}
.hero-ring-2 {
  width: 74%;
  height: 74%;
  inset: 13%;
  border-color: rgba(232, 169, 62, 0.24);
  animation: hero-spin-b 24s linear infinite;
}
.hero-ring-3 {
  width: 48%;
  height: 48%;
  inset: 26%;
  border-color: rgba(232, 169, 62, 0.4);
  animation: hero-spin-c 12s linear infinite;
}
.hero-core {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  background: radial-gradient(circle at 36% 30%, #fdeecb, #e8a93e 46%, #9a6a1c 82%);
  box-shadow:
    0 0 46px 10px rgba(232, 169, 62, 0.5),
    inset -6px -8px 14px rgba(90, 60, 15, 0.7);
}
.hero-halo {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232, 169, 62, 0.35), transparent 68%);
  filter: blur(6px);
  animation: hero-halo 4s ease-in-out infinite;
}

.hero-glass {
  border: 1px solid rgba(232, 169, 62, 0.22);
  background: linear-gradient(150deg, rgba(43, 34, 18, 0.82), rgba(18, 14, 8, 0.66));
  backdrop-filter: blur(9px);
  -webkit-backdrop-filter: blur(9px);
  box-shadow: 0 16px 34px -14px rgba(0, 0, 0, 0.75);
  border-radius: 12px;
}
.hero-float-1 {
  animation:
    hero-fade-in 0.6s ease-out both,
    hero-float 5s ease-in-out infinite;
}
.hero-float-2 {
  animation:
    hero-fade-in 0.6s ease-out both,
    hero-float 6.2s ease-in-out infinite;
}
.hero-float-3 {
  animation:
    hero-fade-in 0.6s ease-out both,
    hero-float 5.6s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .hero-net-pulse {
    display: none;
  }
}
```

- [ ] **Step 2: Verificar tipos, lint e build**

Run: `npx tsc --noEmit && npx eslint . && npm run build`
Expected: os três limpos (as classes ainda não são usadas, mas devem compilar). CSS não é alvo do eslint; o objetivo é confirmar que nada quebrou.

- [ ] **Step 3: Commit**

```bash
git add theme/tokens.css
git commit -m "feat: add hero orbital core, aurora and data-mesh styles to theme"
```

---

### Task 2: Componentes `OrbitalCore` e `HeroBackdrop`

**Files:**
- Create: `components/ui/orbital-core.tsx`
- Create: `components/ui/hero-backdrop.tsx`

**Interfaces:**
- Consumes: classes `.hero-*` (Task 1).
- Produces: `OrbitalCore({ className?: string })` e `HeroBackdrop({ className?: string })` — componentes de apresentação (sem `"use client"`). Consumidos pela Task 3.

- [ ] **Step 1: Criar `components/ui/orbital-core.tsx`**

```tsx
export function OrbitalCore({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`hero-stage ${className}`}>
      <div className="hero-halo" />
      <div className="hero-sys">
        <div className="hero-ring hero-ring-1" />
        <div className="hero-ring hero-ring-2" />
        <div className="hero-ring hero-ring-3" />
      </div>
      <div className="hero-core" />
    </div>
  )
}
```

- [ ] **Step 2: Criar `components/ui/hero-backdrop.tsx`**

```tsx
export function HeroBackdrop({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="hero-aurora-bg" />
      <span className="hero-blob hero-blob-1" />
      <span className="hero-blob hero-blob-2" />
      <svg className="hero-net" viewBox="0 0 680 380" preserveAspectRatio="xMidYMid slice">
        <line className="hero-net-link" x1="90" y1="70" x2="230" y2="120" />
        <line className="hero-net-link-delayed" x1="230" y1="120" x2="150" y2="250" />
        <line className="hero-net-link" x1="500" y1="60" x2="600" y2="150" />
        <line className="hero-net-link-delayed" x1="560" y1="280" x2="620" y2="200" />
        <line x1="90" y1="70" x2="150" y2="250" />
        <circle className="hero-net-node" cx="90" cy="70" r="3.5" />
        <circle className="hero-net-node" cx="230" cy="120" r="4.5" />
        <circle className="hero-net-node" cx="150" cy="250" r="3.5" />
        <circle className="hero-net-node" cx="500" cy="60" r="3.5" />
        <circle className="hero-net-node" cx="600" cy="150" r="4" />
        <circle className="hero-net-node" cx="620" cy="200" r="3.5" />
        <circle className="hero-net-node" cx="560" cy="280" r="4" />
        <circle className="hero-net-pulse" r="3">
          <animateMotion dur="4s" repeatCount="indefinite" path="M90,70 L230,120 L150,250" />
        </circle>
        <circle className="hero-net-pulse" r="3">
          <animateMotion dur="5s" repeatCount="indefinite" begin="1s" path="M500,60 L600,150 L620,200" />
        </circle>
      </svg>
    </div>
  )
}
```

- [ ] **Step 3: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/ui/orbital-core.tsx components/ui/hero-backdrop.tsx`
Expected: PASS. (A verificação visual acontece na Task 3, quando os componentes são montados no hero.)

- [ ] **Step 4: Commit**

```bash
git add components/ui/orbital-core.tsx components/ui/hero-backdrop.tsx
git commit -m "feat: add OrbitalCore and HeroBackdrop presentational components"
```

---

### Task 3: Reescrever `hero.tsx` e ajustar `content/home.ts`

**Files:**
- Modify: `content/home.ts` (objeto `hero`: remover `eyebrow`, tirar a vírgula do título)
- Modify: `components/sections/hero.tsx` (reescrita)

**Interfaces:**
- Consumes: `OrbitalCore`, `HeroBackdrop` (Task 2); `IconBadge` (existente); `hero.titulo`/`descricao`/`estatisticas`/`cartoes` (sem `eyebrow`); classes `.hero-glass`/`.hero-float-*` (Task 1).
- Produces: nada — folha da árvore.

- [ ] **Step 1: Ajustar o objeto `hero` em `content/home.ts`**

Remover a linha `eyebrow: "Diagnóstico 360º",` e trocar a parte do título com vírgula. O objeto `hero` (linhas 1-22) fica:

```ts
export const hero = {
  titulo: [
    { texto: "Sua empresa ", destaque: false },
    { texto: "lucrando mais", destaque: true },
    { texto: " com processos ", destaque: false },
    { texto: "mais eficientes", destaque: true },
    { texto: ".", destaque: false },
  ],
  descricao:
    "Estruturamos a gestão e os processos do seu negócio com estratégias sob medida para alcançar mais margem, menos retrabalho e decisões guiadas por dados.",
  estatisticas: [
    { valor: "30+", rotulo: "Projetos entregues" },
    { valor: "2x", rotulo: "ROI mínimo" },
    { valor: "+R$15MM", rotulo: "Em lucro entregue" },
  ],
  cartoes: [
    { titulo: "Retorno garantido", texto: "ROI mínimo de 2x o investimento." },
    { titulo: "Processos inteligentes", texto: "Gestão eficiente livre de retrabalhos." },
    { titulo: "Decisões por dados", texto: "Planejamento estratégico sem achismos." },
  ],
}
```

- [ ] **Step 2: Confirmar o ícone de "dados" do lucide-react**

O terceiro card usa um ícone de dados. Verificar qual nome existe na versão instalada:

Run: `ls node_modules/lucide-react/dist/esm/icons | grep -Ei "chart-column|bar-chart|database" | head`
Escolher, nesta ordem de preferência, o primeiro que existir: `ChartColumn`, `BarChart3`, `Database`. Usar o nome PascalCase correspondente ao arquivo (ex.: arquivo `chart-column.mjs` → import `ChartColumn`). No Step 3, ajustar o import e o array `cardIcons` para o nome confirmado. O exemplo abaixo assume `ChartColumn`; se o que existir for outro, trocar as duas ocorrências.

- [ ] **Step 3: Reescrever `components/sections/hero.tsx`**

```tsx
"use client"

import { motion } from "motion/react"
import { CheckCircle2, ChartColumn, TrendingUp } from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { HeroBackdrop } from "@/components/ui/hero-backdrop"
import { OrbitalCore } from "@/components/ui/orbital-core"
import { IconBadge } from "@/components/ui/icon-badge"
import { hero } from "@/content/home"
import { linkWhatsapp } from "@/content/site"

const cardIcons = [TrendingUp, CheckCircle2, ChartColumn]
const cardPos = [
  "lg:right-0 lg:top-6",
  "lg:left-0 lg:top-1/2 lg:-translate-y-1/2",
  "lg:bottom-4 lg:right-8",
]
const cardFloat = ["hero-float-1", "hero-float-2", "hero-float-3"]

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-20 sm:pt-28">
      <HeroBackdrop />

      <Container className="relative grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-4xl font-bold leading-[1.1] text-text sm:text-5xl lg:text-[3.4rem]"
          >
            {hero.titulo.map((parte, i) => (
              <span key={i} className={parte.destaque ? "text-gold" : undefined}>
                {parte.texto}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-text-muted"
          >
            {hero.descricao}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button href={linkWhatsapp()} external>
              Quero escalar minha empresa
            </Button>
            <Button href="#solucoes" variant="ghost">
              Ver como funciona
            </Button>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-14 grid grid-cols-3 gap-6 border-t border-line pt-8"
          >
            {hero.estatisticas.map((stat) => (
              <div key={stat.rotulo}>
                <dt className="sr-only">{stat.rotulo}</dt>
                <dd className="font-display text-2xl font-bold text-gold sm:text-3xl">{stat.valor}</dd>
                <p className="mt-1 text-xs uppercase tracking-wide text-text-dim">{stat.rotulo}</p>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="relative flex flex-col items-center gap-6 lg:block">
          <OrbitalCore />
          <div className="grid w-full gap-4 lg:contents">
            {hero.cartoes.map((cartao, i) => {
              const Icon = cardIcons[i] ?? TrendingUp
              const pos = cardPos[i] ?? ""
              const float = cardFloat[i] ?? "hero-float-1"
              return (
                <div
                  key={cartao.titulo}
                  className={`hero-glass ${float} flex items-start gap-3 p-4 lg:absolute lg:w-56 ${pos}`}
                >
                  <IconBadge icon={Icon} />
                  <div>
                    <p className="font-display text-sm font-semibold text-text">{cartao.titulo}</p>
                    <p className="mt-1 text-sm text-text-muted">{cartao.texto}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Container>

      <div className="relative mt-14 flex flex-col items-center gap-2">
        <span className="font-display text-[10px] uppercase tracking-[0.24em] text-text-dim">Scroll</span>
        <span className="h-4 w-px bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  )
}
```

Notas para o implementador:
- Se o ícone de dados confirmado no Step 2 não for `ChartColumn`, trocar o import e o array `cardIcons` para o nome correto.
- Isto remove o uso de `AmbientRing` e `ShieldCheck` no hero, e remove o eyebrow. Não deve sobrar import/variável sem uso (eslint `no-unused-vars` falha).

- [ ] **Step 4: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint content/home.ts components/sections/hero.tsx`
Expected: PASS, zero erros/warnings.

- [ ] **Step 5: Build de produção**

Run: `npm run build`
Expected: build conclui com sucesso.

- [ ] **Step 6: Verificação visual (dev server)**

Com `npm run dev`, abrir `http://localhost:3000`. Confirmar no hero:
- Título "Sua empresa lucrando mais com processos mais eficientes." **sem vírgula**; **sem** o eyebrow "Diagnóstico 360º".
- Núcleo orbital 3D girando fluido (anéis em eixos diferentes, núcleo dourado brilhando, halo pulsando); fundo com aurora quente + malha de pontos com linhas pulsando e 2 pulsos viajando.
- 3 cards de vidro (blur/gradiente/sombra) com ícones seta-de-crescimento / check / dados, **flutuando de forma contínua e suave desde o load (sem stall)**.
- Indicador "SCROLL" no rodapé do hero.
- Em mobile (~375px): coluna única — texto, núcleo centralizado, e os 3 cards empilhados abaixo; **sem scroll horizontal**.
- Rolar para as outras seções e confirmar que ROI Banner / Fundador / CTA Final ainda mostram o `AmbientRing` normalmente.

- [ ] **Step 7: Commit**

```bash
git add content/home.ts components/sections/hero.tsx
git commit -m "feat: redesign hero with orbital 3D core, data backdrop, glass cards; drop eyebrow and title comma"
```

---

### Task 4: Vetorizar o PNG da logo para `components/ui/logo.tsx`

**Pré-requisito:** o arquivo `logo-versak.png` (emblema dourado sobre transparente) deve estar na raiz do projeto. Se não estiver, reportar BLOCKED pedindo o arquivo.

**Files:**
- Modify: `package.json` (devDeps `potrace`, `sharp`; script `trace:logo`)
- Create: `scripts/trace-logo.mjs`
- Create: `components/ui/logo.tsx`
- (gerado intermediário, não versionar: `scripts/logo-traced.svg`)

**Interfaces:**
- Consumes: `logo-versak.png` (raiz).
- Produces: `Logo({ className?: string })` — SVG inline com `fill="currentColor"`. Consumido pela Task 5.

- [ ] **Step 1: Instalar dependências de build**

Run: `npm install -D potrace sharp`
Expected: instala sem erro. (`sharp` pode já estar presente como dep transitiva do Next; instalar como devDep explícito é ok.)

- [ ] **Step 2: Criar `scripts/trace-logo.mjs`**

```js
import { writeFileSync } from "node:fs"
import sharp from "sharp"
import { trace } from "potrace"

const src = process.argv[2] ?? "logo-versak.png"

// Achata o alpha sobre branco (transparente -> branco) para o potrace binarizar corretamente.
const png = await sharp(src).flatten({ background: "#ffffff" }).png().toBuffer()

const svg = await new Promise((resolve, reject) => {
  trace(png, { turdSize: 40, optTolerance: 0.4, threshold: 170, color: "#000000", background: "transparent" }, (err, out) => {
    if (err) reject(err)
    else resolve(out)
  })
})

writeFileSync("scripts/logo-traced.svg", svg)
console.log("Traçado gravado em scripts/logo-traced.svg")
```

- [ ] **Step 3: Adicionar o script npm e rodar o traçado**

Em `package.json`, dentro de `"scripts"`, adicionar:

```json
"trace:logo": "node scripts/trace-logo.mjs"
```

Run: `npm run trace:logo`
Expected: gera `scripts/logo-traced.svg`. Abrir o SVG (ex.: no navegador ou lendo o arquivo) e conferir visualmente que o traçado reproduz o emblema. Se houver ruído/pontinhos, aumentar `turdSize` (ex.: 60/80); se detalhes finos sumirem, reduzir `threshold` ou `turdSize` e rodar de novo.

- [ ] **Step 4: Criar `components/ui/logo.tsx` a partir do traçado**

Abrir `scripts/logo-traced.svg`, copiar o valor de `viewBox` (ou `width`/`height`) e o(s) `<path d="…">`. Criar o componente substituindo `VIEWBOX` e `PATH_D` pelos valores reais gerados (o `fill` do path vem de `currentColor` no `<svg>`):

```tsx
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="VIEWBOX" className={className} fill="currentColor" role="img" aria-label="Versak">
      <path d="PATH_D" />
    </svg>
  )
}
```

Se o traçado gerar mais de um `<path>`, incluir todos dentro do `<svg>` (todos herdam `fill="currentColor"`). Remover quaisquer atributos de cor/fill próprios que o potrace tenha colocado nos paths (para o `currentColor` valer).

- [ ] **Step 5: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/ui/logo.tsx scripts/trace-logo.mjs`
Expected: PASS.

- [ ] **Step 6: Verificação visual isolada**

Editar temporariamente `app/page.tsx` para renderizar `<Logo className="h-16 w-auto text-gold" />` em algum lugar visível, rodar `npm run dev`, confirmar no navegador que o emblema aparece nítido e dourado, idêntico ao PNG. Reverter a edição temporária de `app/page.tsx` (confirmar `git status` sem mudanças em `app/page.tsx` antes de commitar).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json scripts/trace-logo.mjs components/ui/logo.tsx
git commit -m "feat: vectorize brand logo (PNG->SVG via potrace) into Logo component"
```

> Nota: `scripts/logo-traced.svg` e `logo-versak.png` são intermediários — não é necessário versioná-los (podem ficar fora do commit; se preferir manter a fonte, versionar `logo-versak.png` é aceitável).

---

### Task 5: Inserir a logo no header

**Files:**
- Modify: `components/sections/header.tsx`

**Interfaces:**
- Consumes: `Logo` (Task 4); `site.nome` (existente).

- [ ] **Step 1: Trocar o wordmark do header pela logo + texto**

Em `components/sections/header.tsx`, adicionar o import:

```tsx
import { Logo } from "@/components/ui/logo"
```

E substituir o bloco atual:

```tsx
<span className="font-display text-lg font-bold tracking-[0.15em] text-gold">
  {site.nome.toUpperCase()}
</span>
```

por:

```tsx
<a href="#" className="flex items-center gap-2.5 text-gold">
  <Logo className="h-9 w-auto" />
  <span className="font-display text-lg font-bold tracking-[0.15em]">{site.nome.toUpperCase()}</span>
</a>
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/sections/header.tsx`
Expected: PASS.

- [ ] **Step 3: Build + verificação visual**

Run: `npm run build`
Expected: sucesso.

Com `npm run dev`, confirmar no header: o emblema vetorizado (nítido, dourado) à esquerda + "VERSAK" ao lado, clicável (vai para o topo); nav, sublinhado animado, efeito de scroll, botão WhatsApp e menu mobile inalterados. Conferir em mobile que o header não estoura largura.

- [ ] **Step 4: Commit**

```bash
git add components/sections/header.tsx
git commit -m "feat: add vectorized brand logo to header"
```

---

## Resumo de arquivos tocados

**Novos:**
- `components/ui/orbital-core.tsx`
- `components/ui/hero-backdrop.tsx`
- `components/ui/logo.tsx`
- `scripts/trace-logo.mjs`

**Modificados:**
- `theme/tokens.css` (estilos `.hero-*` + keyframes)
- `content/home.ts` (hero: remove eyebrow, tira vírgula do título)
- `components/sections/hero.tsx` (reescrita)
- `components/sections/header.tsx` (logo + wordmark)
- `package.json` / `package-lock.json` (devDeps `potrace`, `sharp`; script `trace:logo`)

**Inalterados (confirmar):**
- `components/ui/ambient-ring.tsx`, `icon-badge.tsx`, `glow-card.tsx` (usados por outras seções)
