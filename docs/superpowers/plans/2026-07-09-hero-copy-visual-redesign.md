# Redesign Visual Completo da Landing Page Versak — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Atualizar a copy do Hero para o texto aprovado por Victor e dar tratamento visual rico (ícones, glow, contadores animados, anel dourado ecoado) a todas as seções abaixo do Hero, hoje visualmente pobres.

**Architecture:** Quatro componentes novos e reutilizáveis em `components/ui/` (`IconBadge`, `GlowCard`, `CountUp`, `MobileNav`) somados à extração do `AmbientRing` (hoje só interno ao Hero) para um componente compartilhado. Cada seção existente em `components/sections/` é modificada para consumir esses primitivos — nenhuma seção nova é criada, nenhum arquivo de conteúdo perde sua forma geral (só ganham/ajustam campos pontuais).

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, `motion` (Framer Motion) v11, novo: `lucide-react`.

## Global Constraints

- Este repositório **não tem framework de testes unitários** (sem Jest/Vitest no `package.json`). A validação do projeto é `tsc --noEmit` + `next build` + `eslint .` (conforme `README.md`). Cada task deste plano substitui o ciclo "escrever teste → rodar → falhar → implementar → passar" por: **implementar → `npx tsc --noEmit` → `npx eslint <arquivos-tocados>` → verificação visual no navegador (dev server)**. Não crie um framework de testes novo só para este trabalho (YAGNI) — está fora de escopo.
- Nenhuma cor "hardcoded" fora de `theme/tokens.css` — todo componente novo usa as classes Tailwind geradas a partir de `--color-*` (`bg-gold`, `border-line`, etc.), nunca hex direto.
- Nenhum texto novo fora de `content/home.ts` / `content/site.ts` — se um componente precisa de um texto (ex: aria-label de botão), pode ser hardcoded só se for rótulo de acessibilidade/UI puro (não copy de marketing).
- `MotionConfig reducedMotion="user"` (em `app/layout.tsx`) já desliga toda animação para quem tem "reduzir movimento" ativado no SO — nenhuma animação nova precisa de tratamento adicional para isso, é automático.
- Manter o `AmbientRing` do Hero com a mesma aparência/comportamento visual exato de hoje após a extração (Task 3) — é o elemento que já foi aprovado, não pode mudar.
- Node/npm já instalados; rodar todos os comandos a partir da raiz `C:\Users\mathe\OneDrive\Documentos\Versak\versak-landing`.

---

### Task 1: Adicionar dependência `lucide-react`

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: pacote `lucide-react` disponível para import em qualquer componente (`import { IconName } from "lucide-react"`).

- [ ] **Step 1: Instalar o pacote**

Run: `npm install lucide-react`
Expected: `package.json` ganha `"lucide-react": "^..."` em `dependencies`, `package-lock.json` atualizado, comando termina sem erro.

- [ ] **Step 2: Verificar instalação**

Run: `npx tsc --noEmit`
Expected: PASS (nenhum erro novo — o pacote só foi instalado, ainda não usado em nenhum arquivo).

- [ ] **Step 3: Commit**

```bash
git init
git add package.json package-lock.json
git commit -m "chore: add lucide-react for section icons"
```

> Nota: este projeto ainda não é um repositório git (`git status` retorna "not a git repository"). Rode `git init` uma única vez nesta task; as tasks seguintes assumem que o repo já existe e usam só `git add`/`git commit`.

---

### Task 2: Criar `IconBadge` e `GlowCard`

**Files:**
- Create: `components/ui/icon-badge.tsx`
- Create: `components/ui/glow-card.tsx`

**Interfaces:**
- Consumes: nada (componentes puros, sem dependência de outras tasks).
- Produces:
  - `IconBadge({ icon: LucideIcon, className?: string })` — badge quadrado com ícone dourado.
  - `GlowCard({ children: ReactNode, className?: string })` — card com hover glow dourado.
  - Ambos exportados como named exports, usados pelas Tasks 7, 9, 10, 11, 13.

- [ ] **Step 1: Criar `IconBadge`**

```tsx
// components/ui/icon-badge.tsx
import type { LucideIcon } from "lucide-react"

export function IconBadge({ icon: Icon, className = "" }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gold/10 text-gold ${className}`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} />
    </span>
  )
}
```

- [ ] **Step 2: Adicionar a variável de glow em `theme/tokens.css`**

O box-shadow do glow dourado precisa de um valor de cor com opacidade (`rgba`), que as classes Tailwind geradas a partir de `--color-*` não expressam diretamente em `shadow-[...]`. Em vez de hardcodar o `rgba` dentro do componente (violaria a regra "nenhuma cor hardcoded fora de `theme/tokens.css`"), definir a sombra completa como variável no único arquivo que pode ter esse valor:

Em `theme/tokens.css`, dentro do bloco `@theme`, adicionar depois de `--color-gold-dim`:

```css
--shadow-gold-glow: 0 0 24px -8px rgba(232, 169, 62, 0.35);
```

- [ ] **Step 3: Criar `GlowCard`**

```tsx
// components/ui/glow-card.tsx
import type { ReactNode } from "react"

export function GlowCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-md border border-line bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-gold-dim hover:shadow-[var(--shadow-gold-glow)] ${className}`}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/ui/icon-badge.tsx components/ui/glow-card.tsx`
Expected: PASS, sem erros (arquivos ainda não são importados em lugar nenhum, mas devem compilar sozinhos).

- [ ] **Step 5: Commit**

```bash
git add components/ui/icon-badge.tsx components/ui/glow-card.tsx theme/tokens.css
git commit -m "feat: add IconBadge and GlowCard shared primitives"
```

---

### Task 3: Extrair `AmbientRing` para componente compartilhado

**Files:**
- Create: `components/ui/ambient-ring.tsx`
- Modify: `components/sections/hero.tsx:1-125` (remove a função `AmbientRing` local, importa a nova)

**Interfaces:**
- Consumes: nada.
- Produces: `AmbientRing({ className?: string, raios?: number[], baseDuration?: number })` — mesmo visual do anel atual do Hero por padrão; usado depois pelas Tasks 12, 13, 14.

- [ ] **Step 1: Criar o componente compartilhado**

Copiar o comportamento exato da função `AmbientRing` que hoje vive dentro de `hero.tsx`, parametrizando `className`, `raios` e `baseDuration` com os valores atuais como default (para o Hero continuar idêntico):

```tsx
// components/ui/ambient-ring.tsx
"use client"

import { motion } from "motion/react"

export function AmbientRing({
  className = "pointer-events-none absolute -right-40 -top-24 h-[520px] w-[520px] opacity-[0.35] sm:-right-20",
  raios = [90, 150, 210, 270],
  baseDuration = 60,
}: {
  className?: string
  raios?: number[]
  baseDuration?: number
}) {
  return (
    <div aria-hidden className={className}>
      {raios.map((r, i) => (
        <motion.span
          key={r}
          className="absolute rounded-full border border-gold-dim"
          style={{
            width: r * 2,
            height: r * 2,
            left: `calc(50% - ${r}px)`,
            top: `calc(50% - ${r}px)`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: baseDuration + i * 20, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-gold" />
        </motion.span>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Atualizar `hero.tsx` para usar o componente extraído**

Em `components/sections/hero.tsx`:
1. Adicionar `import { AmbientRing } from "@/components/ui/ambient-ring"` no topo.
2. Remover por completo a função `function AmbientRing() { ... }` (linhas 98-124 do arquivo atual).
3. O JSX `<AmbientRing />` dentro de `<section>` continua igual — não muda nada, só passa a vir de outro arquivo.

- [ ] **Step 3: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/ui/ambient-ring.tsx components/sections/hero.tsx`
Expected: PASS.

- [ ] **Step 4: Verificar visualmente que o Hero não mudou**

Run: `npm run dev` (deixar rodando em background), abrir `http://localhost:3000` no navegador.
Expected: o anel dourado girando no canto superior direito do Hero aparece idêntico ao que já existia antes desta task (mesma posição, tamanho, opacidade, velocidade).

- [ ] **Step 5: Commit**

```bash
git add components/ui/ambient-ring.tsx components/sections/hero.tsx
git commit -m "refactor: extract AmbientRing into shared component"
```

---

### Task 4: Criar `CountUp`

**Files:**
- Create: `components/ui/count-up.tsx`

**Interfaces:**
- Consumes: `motion/react` (`animate`, `useInView`, `useMotionValue`, `useMotionValueEvent`).
- Produces: `CountUp({ value: string, duration?: number })` — recebe uma string como `"30+"`, `"250MM"`, `"2x"`, `"+R$15MM"` e anima a parte numérica de 0 até o valor quando o elemento entra na viewport, mantendo prefixo/sufixo não numéricos fixos. Usado pelas Tasks 7, 12, 13.

- [ ] **Step 1: Implementar o componente**

```tsx
// components/ui/count-up.tsx
"use client"

import { useEffect, useRef } from "react"
import { animate, useInView, useMotionValue, useMotionValueEvent } from "motion/react"

export function CountUp({ value, duration = 1.4 }: { value: string; duration?: number }) {
  const match = value.match(/^([^\d]*)(\d+(?:[.,]\d+)?)(.*)$/)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const motionValue = useMotionValue(0)

  const prefix = match?.[1] ?? ""
  const rawNumber = match?.[2] ?? "0"
  const numeric = parseFloat(rawNumber.replace(",", "."))
  const suffix = match?.[3] ?? ""
  const decimals = rawNumber.includes(",") || rawNumber.includes(".") ? 1 : 0

  useEffect(() => {
    if (!isInView) return
    const controls = animate(motionValue, numeric, { duration, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [isInView, numeric, duration, motionValue])

  useMotionValueEvent(motionValue, "change", (latest) => {
    if (ref.current) {
      ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`
    }
  })

  if (!match) {
    return <span>{value}</span>
  }

  return (
    <span ref={ref}>
      {prefix}
      {(0).toFixed(decimals)}
      {suffix}
    </span>
  )
}
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/ui/count-up.tsx`
Expected: PASS.

- [ ] **Step 3: Verificação visual isolada**

Run: `npm run dev` (se não estiver rodando), editar temporariamente `app/page.tsx` adicionando `<CountUp value="42" />` em qualquer lugar visível, recarregar a página, confirmar no navegador que o número sobe de 0 até 42 ao carregar. Desfazer a edição temporária depois de confirmar (`git checkout -- app/page.tsx` ou reverter manualmente — não commitar essa alteração de teste).

Expected: número anima de 0 a 42 suavemente uma única vez.

- [ ] **Step 4: Commit**

```bash
git add components/ui/count-up.tsx
git commit -m "feat: add CountUp animated number component"
```

---

### Task 5: Criar `MobileNav`

**Files:**
- Create: `components/ui/mobile-nav.tsx`

**Interfaces:**
- Consumes: `site.nav` (formato `{ label: string; href: string }[]`, já existe em `content/site.ts:13-18`).
- Produces: `MobileNav({ nav: readonly { label: string; href: string }[] })` — botão hambúrguer + drawer, visível só abaixo do breakpoint `md`. Usado pela Task 8 (Header).

- [ ] **Step 1: Implementar o componente**

```tsx
// components/ui/mobile-nav.tsx
"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Menu, X } from "lucide-react"

export function MobileNav({ nav }: { nav: readonly { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center text-text-muted transition-colors hover:text-text"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-20 flex flex-col gap-1 border-b border-line bg-bg/95 px-6 py-4 backdrop-blur"
          >
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3 font-display text-sm font-medium uppercase tracking-wide text-text-muted transition-colors hover:text-text"
              >
                {item.label}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/ui/mobile-nav.tsx`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/ui/mobile-nav.tsx
git commit -m "feat: add MobileNav drawer component"
```

---

### Task 6: Atualizar copy do Hero e restruturar conteúdo do ROI em `content/home.ts`

**Files:**
- Modify: `content/home.ts:1-22` (bloco `hero`)
- Modify: `content/home.ts:73-77` (bloco `roi`)

**Interfaces:**
- Produces: `hero.titulo`, `hero.descricao`, `hero.estatisticas` com o texto exato aprovado por Victor. `roi` ganha os campos `destaquePrefixo: string`, `multiplicador: string`, `destaqueSufixo: string` no lugar de `destaque: string`. Consumido pela Task 7 (Hero, já consome `hero.*` sem mudança de shape) e Task 12 (ROI Banner, que passa a ler os três novos campos).

- [ ] **Step 1: Atualizar o bloco `hero`**

Em `content/home.ts`, substituir o objeto `hero` (linhas 1-22) por:

```ts
export const hero = {
  eyebrow: "Diagnóstico 360º",
  titulo: [
    { texto: "Sua empresa ", destaque: false },
    { texto: "lucrando mais", destaque: true },
    { texto: ", com processos ", destaque: false },
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

- [ ] **Step 2: Atualizar o bloco `roi`**

Substituir o objeto `roi` (linhas 73-77) por:

```ts
export const roi = {
  titulo: "Na Versak, o objetivo de entrega é balizado por ROI.",
  destaquePrefixo: "Com retorno mínimo sobre",
  multiplicador: "2x",
  destaqueSufixo: "o investimento.",
  nota: "Conforme escopo e premissas estabelecidas.",
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: FAIL — `components/sections/roi-banner.tsx` ainda referencia `roi.destaque`, que não existe mais. Esse erro é esperado nesta task; será corrigido na Task 12. Confirmar que o erro aponta exatamente para `roi-banner.tsx` e não para outro arquivo.

- [ ] **Step 4: Commit**

```bash
git add content/home.ts
git commit -m "content: update hero copy to Victor-approved text, restructure roi content"
```

> Nota: este commit deixa `npx tsc --noEmit` falhando intencionalmente até a Task 12 corrigir `roi-banner.tsx`. Isso é aceitável porque as tasks são executadas em sequência dentro do mesmo plano — não pule a Task 12.

---

### Task 7: Hero — cards flutuantes com ícones

**Files:**
- Modify: `components/sections/hero.tsx`

**Interfaces:**
- Consumes: `IconBadge` (Task 2), `hero.cartoes` (já existe, shape inalterado).
- Produces: nenhuma interface nova consumida por outras tasks — é uma folha da árvore.

- [ ] **Step 1: Reescrever o bloco de cards**

Em `components/sections/hero.tsx`, adicionar os imports:

```tsx
import { CheckCircle2, ShieldCheck, TrendingUp } from "lucide-react"
import { IconBadge } from "@/components/ui/icon-badge"
```

Substituir o `<div className="flex flex-col gap-4">...</div>` (o bloco que mapeia `hero.cartoes`) por:

```tsx
<div className="relative flex flex-col gap-4">
  {hero.cartoes.map((cartao, i) => {
    const Icon = [TrendingUp, CheckCircle2, ShieldCheck][i]
    const flutuacaoDuracao = [4, 4.6, 5.2][i]
    return (
      <motion.div
        key={cartao.titulo}
        initial={{ opacity: 0, x: 24 }}
        animate={{
          opacity: 1,
          x: i % 2 === 1 ? 32 : 0,
          y: [0, -6, 0],
        }}
        transition={{
          opacity: { duration: 0.6, delay: 0.3 + i * 0.12 },
          x: { duration: 0.6, delay: 0.3 + i * 0.12 },
          y: {
            duration: flutuacaoDuracao,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.9 + i * 0.12,
          },
        }}
        className="flex items-start gap-4 rounded-md border border-line bg-panel p-5 transition-colors hover:border-gold-dim hover:shadow-[var(--shadow-gold-glow)]"
      >
        <IconBadge icon={Icon} />
        <div>
          <p className="font-display text-sm font-semibold text-text">{cartao.titulo}</p>
          <p className="mt-1 text-sm text-text-muted">{cartao.texto}</p>
        </div>
      </motion.div>
    )
  })}
</div>
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/sections/hero.tsx`
Expected: PASS (o erro de `roi-banner.tsx` da Task 6 continua presente e é esperado até a Task 12 — ignore-o, mas confirme que não há erro novo em `hero.tsx`).

- [ ] **Step 3: Verificação visual**

Com `npm run dev` rodando, abrir `http://localhost:3000`. Confirmar:
- Título e descrição do Hero batem com o texto: "Sua empresa lucrando mais, com processos mais eficientes." e a nova descrição.
- Estatísticas mostram `30+`, `2x`, `+R$15MM`.
- Os 3 cards à direita têm ícone colorido, aparecem escalonados (não em coluna reta), e ficam se movendo sutilmente para cima e para baixo depois de aparecerem.
- Passar o mouse sobre um card mostra um brilho dourado na borda.

- [ ] **Step 4: Commit**

```bash
git add components/sections/hero.tsx
git commit -m "feat: redesign hero floating cards with icons and continuous float animation"
```

---

### Task 8: Header — menu mobile, scroll effect, sublinhado animado

**Files:**
- Modify: `components/sections/header.tsx`

**Interfaces:**
- Consumes: `MobileNav` (Task 5), `site.nav` (já existe).
- Produces: nenhuma interface nova consumida por outras tasks.

- [ ] **Step 1: Reescrever o componente**

Substituir todo o conteúdo de `components/sections/header.tsx` por:

```tsx
"use client"

import { useState } from "react"
import { motion, useMotionValueEvent, useScroll } from "motion/react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/ui/mobile-nav"
import { site, linkWhatsapp } from "@/content/site"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 8)
  })

  return (
    <header
      className={`sticky top-0 z-40 border-b border-line/60 backdrop-blur transition-colors duration-300 ${
        scrolled ? "bg-bg/95" : "bg-bg/80"
      }`}
    >
      <Container className="relative flex h-20 items-center justify-between">
        <span className="font-display text-lg font-bold tracking-[0.15em] text-gold">
          {site.nome.toUpperCase()}
        </span>

        <nav className="hidden items-center gap-8 md:flex" onMouseLeave={() => setHovered(null)}>
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHovered(item.href)}
              className="relative py-2 font-display text-xs font-medium uppercase tracking-wide text-text-muted transition-colors hover:text-text"
            >
              {item.label}
              {hovered === item.href && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gold"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button href={linkWhatsapp()} external variant="ghost">
            Falar no WhatsApp
          </Button>
          <MobileNav nav={site.nav} />
        </div>
      </Container>
    </header>
  )
}
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/sections/header.tsx`
Expected: PASS (ignorar o erro pré-existente de `roi-banner.tsx` da Task 6).

- [ ] **Step 3: Verificação visual**

Com `npm run dev` rodando:
- Redimensionar a janela do navegador para largura < 768px (ou usar o modo responsivo do DevTools). Confirmar que o menu de texto desaparece e um ícone de hambúrguer aparece; clicar nele abre um painel com os 4 links de navegação; clicar em um link fecha o painel.
- Em largura >= 768px, passar o mouse sobre os links do menu: uma barra dourada deve aparecer sob o link e se mover suavemente ao trocar de link.
- Rolar a página para baixo: o fundo do header deve ficar visivelmente mais opaco/nítido.

- [ ] **Step 4: Commit**

```bash
git add components/sections/header.tsx
git commit -m "feat: add mobile nav, scroll blur, and animated hover underline to header"
```

---

### Task 9: Quem Somos — ícones, cards com glow, watermark

**Files:**
- Modify: `components/sections/quem-somos.tsx`

**Interfaces:**
- Consumes: `IconBadge`, `GlowCard` (Task 2), `quemSomos.valores` (já existe, shape inalterado: `{ letra, nome, texto }[]`).

- [ ] **Step 1: Reescrever o componente**

```tsx
// components/sections/quem-somos.tsx
import { BookOpen, Flame, Heart, KeyRound, Shuffle, Target } from "lucide-react"
import { Container } from "@/components/ui/container"
import { SectionHeading } from "@/components/ui/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { GlowCard } from "@/components/ui/glow-card"
import { IconBadge } from "@/components/ui/icon-badge"
import { quemSomos } from "@/content/home"

const ICONES = {
  V: Shuffle,
  E: Target,
  R: Heart,
  S: BookOpen,
  A: Flame,
  K: KeyRound,
} as const

export function QuemSomos() {
  return (
    <section id="quem-somos" className="relative overflow-hidden border-t border-line py-24">
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 -z-10 -translate-x-1/2 select-none whitespace-nowrap font-display text-[10rem] font-bold text-text opacity-[0.03] sm:text-[14rem]"
      >
        VERSAK
      </span>

      <Container className="relative">
        <Reveal>
          <SectionHeading eyebrow={quemSomos.eyebrow} titulo={quemSomos.titulo} />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-text-muted">{quemSomos.texto}</p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quemSomos.valores.map((valor, i) => {
            const Icon = ICONES[valor.letra as keyof typeof ICONES]
            return (
              <Reveal key={valor.letra} delay={i * 0.06}>
                <GlowCard className="flex h-full flex-col gap-3 p-6">
                  <div className="flex items-center gap-3">
                    <IconBadge icon={Icon} />
                    <span className="font-display text-2xl font-bold text-gold">{valor.letra}</span>
                  </div>
                  <p className="font-display text-sm font-semibold text-text">{valor.nome}</p>
                  <p className="text-sm text-text-muted">{valor.texto}</p>
                </GlowCard>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/sections/quem-somos.tsx`
Expected: PASS (ignorar erro pré-existente de `roi-banner.tsx`).

- [ ] **Step 3: Verificação visual**

Com `npm run dev` rodando, rolar até a seção "Quem somos". Confirmar: 6 cards com espaçamento entre si (não mais colados), cada um com ícone dourado + letra, marca d'água "VERSAK" bem sutil atrás do texto, hover em um card levanta e ilumina a borda.

- [ ] **Step 4: Commit**

```bash
git add components/sections/quem-somos.tsx
git commit -m "feat: add icons, glow cards and watermark to Quem Somos section"
```

---

### Task 10: Dores — grid bento com ícones

**Files:**
- Modify: `components/sections/dores.tsx`

**Interfaces:**
- Consumes: `IconBadge`, `GlowCard` (Task 2), `dores.lista` (já existe, `string[]` de 10 itens, shape inalterado).

- [ ] **Step 1: Reescrever o componente**

```tsx
// components/sections/dores.tsx
import { AlertTriangle } from "lucide-react"
import { Container } from "@/components/ui/container"
import { SectionHeading } from "@/components/ui/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { GlowCard } from "@/components/ui/glow-card"
import { IconBadge } from "@/components/ui/icon-badge"
import { dores } from "@/content/home"

const DESTAQUE = new Set([3, 4])

export function Dores() {
  return (
    <section id="solucoes" className="relative overflow-hidden border-t border-line bg-panel/40 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, var(--color-gold-dim) 0%, transparent 70%)" }}
      />

      <Container className="relative">
        <Reveal>
          <SectionHeading eyebrow={dores.eyebrow} titulo={dores.titulo} align="center" />
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dores.lista.map((item, i) => (
            <Reveal key={item} delay={i * 0.06} y={20}>
              <GlowCard className={`flex h-full items-start gap-3 p-5 ${DESTAQUE.has(i) ? "lg:col-span-2" : ""}`}>
                <IconBadge icon={AlertTriangle} />
                <p className="pt-2 text-sm text-text-muted">{item}</p>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/sections/dores.tsx`
Expected: PASS (ignorar erro pré-existente de `roi-banner.tsx`).

- [ ] **Step 3: Verificação visual**

Com `npm run dev` rodando, rolar até "Principais dores que atuamos". Confirmar: cada dor é um card com ícone de alerta dourado, 2 dos 10 cards são visivelmente mais largos que os outros (em telas grandes), há um brilho radial sutil atrás do grid.

- [ ] **Step 4: Commit**

```bash
git add components/sections/dores.tsx
git commit -m "feat: redesign Dores section as bento icon grid"
```

---

### Task 11: Mercados — ícones por segmento e micro-interação de hover

**Files:**
- Modify: `components/sections/mercados.tsx`

**Interfaces:**
- Consumes: `IconBadge`, `GlowCard` (Task 2), `mercados.grupos` (já existe, `{ nome, segmentos }[]`, shape inalterado).

- [ ] **Step 1: Reescrever o componente**

```tsx
// components/sections/mercados.tsx
import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  Building2,
  Cpu,
  Factory,
  HeartPulse,
  ShoppingCart,
  Truck,
  Wheat,
  Wrench,
} from "lucide-react"
import { Container } from "@/components/ui/container"
import { SectionHeading } from "@/components/ui/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { GlowCard } from "@/components/ui/glow-card"
import { IconBadge } from "@/components/ui/icon-badge"
import { mercados } from "@/content/home"

const ICONES: Record<string, LucideIcon> = {
  "Indústria de Manufatura Seriada": Factory,
  "Engenharia e Projetos": Wrench,
  "Agronegócio": Wheat,
  "Construção Civil": Building2,
  "Logística e Transporte": Truck,
  "Comércio": ShoppingCart,
  "Saúde": HeartPulse,
  "Serviços": Briefcase,
  "Tecnologia": Cpu,
}

const DESTAQUE = new Set(["Indústria de Manufatura Seriada", "Tecnologia"])

export function Mercados() {
  return (
    <section id="mercados" className="border-t border-line py-24">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={mercados.eyebrow} titulo={mercados.titulo} subtitulo={mercados.subtitulo} />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mercados.grupos.map((grupo, i) => {
            const Icon = ICONES[grupo.nome]
            const linha = Math.floor(i / 3)
            return (
              <Reveal key={grupo.nome} delay={linha * 0.1 + (i % 3) * 0.05}>
                <GlowCard className={`group h-full p-5 ${DESTAQUE.has(grupo.nome) ? "lg:col-span-2" : ""}`}>
                  <IconBadge
                    icon={Icon}
                    className="transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-gold/20"
                  />
                  <p className="mt-4 font-display text-sm font-semibold text-text">{grupo.nome}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-dim">{grupo.segmentos}</p>
                </GlowCard>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/sections/mercados.tsx`
Expected: PASS (ignorar erro pré-existente de `roi-banner.tsx`).

- [ ] **Step 3: Verificação visual**

Com `npm run dev` rodando, rolar até "Mercados de atuação". Confirmar: cada um dos 9 cards tem um ícone diferente e relevante ao segmento, os cards "Indústria de Manufatura Seriada" e "Tecnologia" são mais largos, passar o mouse sobre um card gira/aumenta o ícone levemente além do glow de borda.

- [ ] **Step 4: Commit**

```bash
git add components/sections/mercados.tsx
git commit -m "feat: add themed icons and bento layout to Mercados section"
```

---

### Task 12: ROI Banner — anel dourado ecoado e contador animado

**Files:**
- Modify: `components/sections/roi-banner.tsx`

**Interfaces:**
- Consumes: `AmbientRing` (Task 3), `CountUp` (Task 4), `roi.destaquePrefixo` / `roi.multiplicador` / `roi.destaqueSufixo` (Task 6).

- [ ] **Step 1: Reescrever o componente**

```tsx
// components/sections/roi-banner.tsx
import { motion } from "motion/react"
import { Container } from "@/components/ui/container"
import { Reveal } from "@/components/ui/reveal"
import { AmbientRing } from "@/components/ui/ambient-ring"
import { CountUp } from "@/components/ui/count-up"
import { roi } from "@/content/home"

export function RoiBanner() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-panel py-20">
      <AmbientRing
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-[0.15]"
        raios={[70, 120, 170]}
        baseDuration={90}
      />

      <Container className="relative text-center">
        <Reveal>
          <p className="mx-auto max-w-3xl font-display text-2xl font-semibold leading-snug text-text sm:text-3xl">
            {roi.titulo}{" "}
            <motion.span
              className="text-gold"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {roi.destaquePrefixo} <CountUp value={roi.multiplicador} /> {roi.destaqueSufixo}
            </motion.span>
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 text-xs uppercase tracking-wide text-text-dim">{roi.nota}</p>
        </Reveal>
      </Container>
    </section>
  )
}
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/sections/roi-banner.tsx`
Expected: PASS — o erro pré-existente desde a Task 6 (`roi.destaque` não existe) desaparece aqui, porque este arquivo agora usa `roi.destaquePrefixo`/`roi.multiplicador`/`roi.destaqueSufixo`. Confirmar que `npx tsc --noEmit` roda **limpo, sem nenhum erro**, pela primeira vez desde a Task 6.

- [ ] **Step 3: Verificação visual**

Com `npm run dev` rodando, rolar até o banner "Na Versak, o objetivo de entrega é balizado por ROI.". Confirmar: anel dourado bem sutil girando atrás do texto, o texto "2x" conta de 0 até 2x quando a seção entra na tela, o texto em destaque tem um brilho pulsando lentamente.

- [ ] **Step 4: Commit**

```bash
git add components/sections/roi-banner.tsx
git commit -m "feat: add echoed ambient ring and count-up to ROI banner"
```

---

### Task 13: Fundador — foto real, moldura de anel, contadores animados

**Files:**
- Move: `saura.png` (raiz do projeto) → `public/fundador/victor-saura.jpg`
- Modify: `components/sections/fundador.tsx`

**Interfaces:**
- Consumes: `AmbientRing` (Task 3), `CountUp` (Task 4), `fundador.numeros` / `fundador.nome` / `fundador.eyebrow` / `fundador.cargo` (já existem, shape inalterado).

- [ ] **Step 1: Mover o asset**

```bash
mkdir -p public/fundador
mv saura.png "public/fundador/victor-saura.jpg"
```

> Nota: `mv` só troca a extensão no nome do arquivo, não reconverte o formato — o arquivo continua sendo um PNG com extensão `.jpg`. Isso é aceitável porque `next/image` detecta o formato real pelo conteúdo do arquivo, não pela extensão. Se preferir manter a extensão correta, use `public/fundador/victor-saura.png` e ajuste o `src` no Step 2 de acordo.

- [ ] **Step 2: Reescrever o componente**

```tsx
// components/sections/fundador.tsx
import Image from "next/image"
import { Container } from "@/components/ui/container"
import { Reveal } from "@/components/ui/reveal"
import { AmbientRing } from "@/components/ui/ambient-ring"
import { CountUp } from "@/components/ui/count-up"
import { fundador } from "@/content/home"

export function Fundador() {
  return (
    <section id="fundador" className="border-t border-line py-24">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <Reveal>
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
            <div className="relative h-56 w-56 flex-shrink-0">
              <AmbientRing
                className="pointer-events-none absolute inset-0 opacity-60"
                raios={[80, 108]}
                baseDuration={100}
              />
              <div className="absolute inset-11 overflow-hidden rounded-full border-2 border-gold-dim">
                <Image
                  src="/fundador/victor-saura.jpg"
                  alt={fundador.nome}
                  fill
                  sizes="224px"
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <span className="flex items-center justify-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-gold lg:justify-start">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {fundador.eyebrow}
              </span>
              <p className="mt-4 font-display text-3xl font-bold text-text">{fundador.nome}</p>
              <p className="mt-1 text-sm text-text-muted">{fundador.cargo}</p>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {fundador.numeros.map((n, i) => (
            <Reveal key={n.rotulo} delay={i * 0.08}>
              <div className="border-b-2 border-transparent pb-2 transition-colors duration-300 hover:border-gold">
                <p className="font-display text-2xl font-bold text-gold">
                  <CountUp value={n.valor} />
                </p>
                <p className="mt-1 text-xs leading-relaxed text-text-dim">{n.rotulo}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 3: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/sections/fundador.tsx`
Expected: PASS.

- [ ] **Step 4: Verificação visual**

Com `npm run dev` rodando, rolar até "Fundador". Confirmar: foto do Victor aparece dentro de uma moldura circular com dois anéis dourados girando bem devagar ao redor, os 6 números (30+, 15+, 250MM, 300+, 20+, 10+) contam de 0 até o valor final ao entrar na tela, passar o mouse sobre um número acende uma linha dourada embaixo dele.

- [ ] **Step 5: Commit**

```bash
git add components/sections/fundador.tsx public/fundador/victor-saura.jpg
git rm saura.png
git commit -m "feat: add founder photo with ring frame and animated stat counters"
```

---

### Task 14: CTA Final — anel ecoado, glow pulsante, hover no botão

**Files:**
- Modify: `components/sections/cta-final.tsx`

**Interfaces:**
- Consumes: `AmbientRing` (Task 3).

- [ ] **Step 1: Reescrever o componente**

```tsx
// components/sections/cta-final.tsx
import { motion } from "motion/react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/ui/reveal"
import { AmbientRing } from "@/components/ui/ambient-ring"
import { ctaFinal } from "@/content/home"
import { linkWhatsapp } from "@/content/site"

export function CtaFinal() {
  return (
    <section className="relative overflow-hidden border-t border-line py-24">
      <AmbientRing
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 opacity-[0.2]"
        raios={[80, 140, 200]}
        baseDuration={80}
      />

      <Container className="relative flex flex-col items-center gap-6 text-center">
        <Reveal>
          <h2 className="max-w-2xl font-display text-3xl font-bold text-text sm:text-4xl">{ctaFinal.titulo}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="font-display text-sm italic text-text-muted">&ldquo;{ctaFinal.citacao}&rdquo;</p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="relative">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gold/20 blur-2xl"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div whileHover={{ scale: 1.03 }} className="inline-block">
              <Button href={linkWhatsapp()} external>
                {ctaFinal.botao}
              </Button>
            </motion.div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/sections/cta-final.tsx`
Expected: PASS.

- [ ] **Step 3: Verificação visual**

Com `npm run dev` rodando, rolar até a seção final ("Nós mostramos o caminho..."). Confirmar: anel dourado sutil atrás do bloco, brilho pulsando atrás do botão, botão cresce levemente ao passar o mouse.

- [ ] **Step 4: Commit**

```bash
git add components/sections/cta-final.tsx
git commit -m "feat: add echoed ambient ring and pulsing glow to CTA final"
```

---

### Task 15: Footer — borda em gradiente e ícones

**Files:**
- Modify: `components/sections/footer.tsx`

**Interfaces:**
- Consumes: nada de outras tasks (usa só `lucide-react`, já instalado na Task 1).

- [ ] **Step 1: Reescrever o componente**

```tsx
// components/sections/footer.tsx
import { Linkedin, Mail } from "lucide-react"
import { Container } from "@/components/ui/container"
import { site } from "@/content/site"

export function Footer() {
  return (
    <footer className="relative border-t border-line py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, var(--color-gold-dim) 50%, transparent)" }}
      />
      <Container className="flex flex-col items-center justify-between gap-4 text-xs text-text-dim sm:flex-row">
        <p>
          © {new Date().getFullYear()} {site.nome} Serviços. Todos os direitos reservados.
        </p>
        <div className="flex gap-6">
          <a href={`mailto:${site.email}`} className="flex items-center gap-1.5 hover:text-text-muted">
            <Mail className="h-4 w-4" />
            {site.email}
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-text-muted"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </a>
        </div>
      </Container>
    </footer>
  )
}
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/sections/footer.tsx`
Expected: PASS.

- [ ] **Step 3: Verificação visual**

Com `npm run dev` rodando, rolar até o rodapé. Confirmar: linha superior com gradiente dourado sutil (mais forte no meio, desaparecendo nas pontas), ícones ao lado de e-mail e LinkedIn.

- [ ] **Step 4: Commit**

```bash
git add components/sections/footer.tsx
git commit -m "feat: add gradient border and icons to footer"
```

---

### Task 16: Atualizar README e verificação final completa

**Files:**
- Modify: `README.md:44` (lista de Client Components desatualizada)

**Interfaces:**
- Consumes: nada — task de fechamento, roda a suíte completa de verificação sobre todo o trabalho das Tasks 1-15.

- [ ] **Step 1: Atualizar a linha do README sobre Client Components**

Em `README.md`, trocar a linha 44:

```
- `motion` (Framer Motion) só onde adiciona valor: hero (entrada em sequência + anel ambiente girando, ecoando o "Diagnóstico 360º" que é a marca da Versak) e `Reveal` (fade-in ao rolar a página, usado em todas as seções abaixo do hero)
```

por:

```
- `motion` (Framer Motion) só onde adiciona valor: hero (entrada em sequência + cards flutuantes), `AmbientRing` (anel dourado giratório, reaproveitado no Hero, ROI Banner, Fundador e CTA Final como assinatura visual do "Diagnóstico 360º"), `CountUp` (contadores animados em estatísticas), `Header`/`MobileNav` (menu mobile e efeito de scroll) e `Reveal` (fade-in ao rolar a página, usado em todas as seções abaixo do hero)
```

- [ ] **Step 2: Rodar a verificação completa do projeto**

Run: `npx tsc --noEmit`
Expected: PASS, zero erros.

Run: `npx eslint .`
Expected: PASS, zero erros/warnings.

Run: `npm run build`
Expected: build de produção conclui com sucesso, prerender estático das rotas sem erro.

- [ ] **Step 3: Verificação visual final de ponta a ponta**

Com `npm run dev` rodando, abrir `http://localhost:3000` e rolar a página inteira do topo ao fim. Confirmar, seção por seção: Header (nav + mobile em viewport estreita) → Hero (copy + cards flutuantes) → Quem Somos (ícones + watermark) → Dores (grid bento) → Mercados (ícones + bento) → ROI Banner (anel + count-up) → Fundador (foto + anel + count-up) → CTA Final (anel + glow) → Footer (gradiente + ícones). Nenhuma seção deve parecer "quebrada", sobreposta incorretamente, ou sem estilo.

Testar também em viewport mobile (largura ~375px): nenhum elemento deve vazar horizontalmente (sem scroll lateral indevido).

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: update client components list after visual redesign"
```

---

## Resumo de arquivos tocados

**Novos:**
- `components/ui/icon-badge.tsx`
- `components/ui/glow-card.tsx`
- `components/ui/ambient-ring.tsx`
- `components/ui/count-up.tsx`
- `components/ui/mobile-nav.tsx`
- `public/fundador/victor-saura.jpg`

**Modificados:**
- `package.json` (dependência `lucide-react`)
- `content/home.ts` (copy do Hero, estrutura do `roi`)
- `components/sections/hero.tsx`
- `components/sections/header.tsx`
- `components/sections/quem-somos.tsx`
- `components/sections/dores.tsx`
- `components/sections/mercados.tsx`
- `components/sections/roi-banner.tsx`
- `components/sections/fundador.tsx`
- `components/sections/cta-final.tsx`
- `components/sections/footer.tsx`
- `README.md`

**Removidos:**
- `saura.png` (raiz — movido para `public/fundador/`)
