# Dores — cards de vidro com número metálico 3D e malha de conexão — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restilizar a seção "Principais dores que atuamos" com cards de vidro iguais, um número metálico 3D por dor (01–10) e uma malha de conexão dourada sutil no fundo, na mesma identidade do Hero e de Quem Somos.

**Architecture:** O estilo pesado (número metálico + cor da malha) fica em `theme/tokens.css`; `components/sections/dores.tsx` é reescrito para consumir a classe de vidro já existente (`.hero-glass`) + hover em Tailwind, renderizar o número metálico via `.dores-num`, desenhar a malha em SVG inline (`.dores-net`) e usar um cabeçalho próprio (eyebrow sem o ponto) em vez de `SectionHeading`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, `motion` (Reveal), `theme/tokens.css`.

## Global Constraints

- Repositório **sem framework de testes unitários**. Validação por task: `npx tsc --noEmit` + `npx eslint <arquivos>` + (na task visual) `npm run build` + verificação visual no dev server (desktop e mobile ~375px). Não criar framework de testes (YAGNI).
- **Nenhuma cor "hardcoded" fora de `theme/tokens.css`** — literais dourados/gradientes/sombras deste trabalho ficam em `theme/tokens.css`; o componente só referencia classes (`.hero-glass`, `.dores-num`, `.dores-net`) e utilitários Tailwind de `--color-*` / o token `--shadow-gold-glow`.
- **`dores.tsx` continua Server Component** (sem `"use client"`) — o hover é 100% CSS; o `Reveal` (client) já envolve cada item como hoje.
- **Manter as 10 dores como estão** — nenhuma mudança em `content/home.ts` (`dores.eyebrow`/`dores.titulo`/`dores.lista`).
- **Não remover** `GlowCard`, `IconBadge`, `SectionHeading` do projeto (usados por Mercados/Quem Somos). A Dores apenas deixa de usá-los.
- Reutilizar a classe de vidro **existente** `.hero-glass` (do Hero) para o card — não criar outra variante de vidro.
- `tsconfig.json` tem `noUncheckedIndexedAccess: true` — ao indexar arrays por variável de loop, usar `?? fallback`.
- Rodar todos os comandos a partir da raiz do worktree: `C:\Users\mathe\OneDrive\Documentos\Versak\versak-landing\.worktrees\hero-visual-redesign`.

---

### Task 1: Estilos da Dores em `theme/tokens.css`

**Files:**
- Modify: `theme/tokens.css` (acrescentar ao final: `.dores-num` e `.dores-net`)

**Interfaces:**
- Consumes: `var(--font-display)` (já definido no bloco `@theme`).
- Produces: classes `.dores-num`, `.dores-net`, `.dores-net line`, `.dores-net circle`. Consumidas pela Task 2.

- [ ] **Step 1: Acrescentar o bloco ao final de `theme/tokens.css`**

Adicionar após a última regra existente do arquivo:

```css
/* ---- Dores: número metálico 3D + malha de conexão ---- */
.dores-num {
  flex: 0 0 auto;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 46px;
  line-height: 1;
  background: linear-gradient(
    172deg,
    #6b4a1a,
    #d9a852 16%,
    #e8a93e 34%,
    #a3741f 50%,
    #d9a852 66%,
    #b9822b 82%,
    #5c3f15
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(1px 1px 0 #5e4418) drop-shadow(2px 2px 0 #4f3a13) drop-shadow(3px 4px 0 #33240b)
    drop-shadow(5px 6px 6px rgba(0, 0, 0, 0.55));
}

.dores-net {
  opacity: 0.5;
}
.dores-net line {
  stroke: rgba(232, 169, 62, 0.22);
  stroke-width: 1;
}
.dores-net circle {
  fill: #e8a93e;
}
```

- [ ] **Step 2: Verificar tipos, lint e build**

Run: `npx tsc --noEmit && npx eslint . && npm run build`
Expected: os três limpos (as classes ainda não são usadas, mas devem compilar). CSS não é alvo do eslint; o objetivo é confirmar que nada quebrou.

> Nota: se o `build` falhar com `EINVAL: readlink ... .next/...`, é um artefato de sincronização do OneDrive, não do código — rode `rm -rf .next` e repita `npm run build`.

- [ ] **Step 3: Commit**

```bash
git add theme/tokens.css
git commit -m "feat: add Dores metallic number and connection-mesh styles to theme"
```

---

### Task 2: Reescrever `components/sections/dores.tsx`

**Files:**
- Modify: `components/sections/dores.tsx` (reescrita completa)

**Interfaces:**
- Consumes: classes `.dores-num`/`.dores-net` (Task 1); classe `.hero-glass` (existente, do Hero); token `--shadow-gold-glow` (existente); `Container`, `Reveal` (existentes); `dores` de `@/content/home` (`{ eyebrow, titulo, lista }`, inalterado).
- Produces: nada — folha da árvore.

- [ ] **Step 1: Substituir todo o conteúdo de `components/sections/dores.tsx`**

```tsx
import { Container } from "@/components/ui/container"
import { Reveal } from "@/components/ui/reveal"
import { dores } from "@/content/home"

export function Dores() {
  return (
    <section id="solucoes" className="relative overflow-hidden border-t border-line bg-panel/40 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, var(--color-gold-dim) 0%, transparent 70%)" }}
      />

      <svg
        aria-hidden
        className="dores-net pointer-events-none absolute inset-0"
        viewBox="0 0 760 460"
        preserveAspectRatio="xMidYMid slice"
      >
        <line x1="120" y1="70" x2="360" y2="180" />
        <line x1="360" y1="180" x2="620" y2="120" />
        <line x1="360" y1="180" x2="300" y2="360" />
        <line x1="300" y1="360" x2="640" y2="400" />
        <circle cx="120" cy="70" r="3.5" />
        <circle cx="360" cy="180" r="4.5" />
        <circle cx="620" cy="120" r="3.5" />
        <circle cx="300" cy="360" r="4" />
        <circle cx="640" cy="400" r="3.5" />
      </svg>

      <Container className="relative">
        <Reveal>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              {dores.eyebrow}
            </span>
            <h2 className="font-display text-3xl font-semibold text-text sm:text-4xl">{dores.titulo}</h2>
          </div>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
          {dores.lista.map((item, i) => (
            <Reveal key={item} delay={i * 0.05} y={20}>
              <div className="hero-glass flex h-full min-h-[5.25rem] items-center gap-4 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-gold-dim hover:shadow-[var(--shadow-gold-glow)]">
                <span className="dores-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm font-medium leading-snug text-text-muted">{item}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
```

Notas para o implementador:
- Isto remove os imports de `lucide-react` (`AlertTriangle`), `GlowCard`, `IconBadge` e `SectionHeading` — não deve sobrar import sem uso (o eslint do projeto falha em `no-unused-vars`).
- O eyebrow é renderizado **sem** o `<span>` do ponto dourado (essa é a mudança pedida). Não usar `SectionHeading` aqui.
- Não adicionar `"use client"` — o arquivo é Server Component; só o `Reveal` (já client) envolve cada item.
- O comentário antigo sobre `nth-child`/bento sai junto (não há mais `col-span`).

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/sections/dores.tsx`
Expected: PASS, zero erros e zero warnings (sem imports não usados).

- [ ] **Step 3: Build de produção**

Run: `npm run build`
Expected: build conclui com sucesso. (Se falhar com `EINVAL readlink .next/...`, rodar `rm -rf .next && npm run build` — artefato do OneDrive, não do código.)

- [ ] **Step 4: Verificação visual (dev server)**

Com o dev server rodando (`npm run dev`), abrir `http://localhost:3000` e rolar até "Principais dores que atuamos". Confirmar:
- 10 cards de vidro **iguais** (mesmo tamanho), cada um com um **número metálico 3D** (01–10) à esquerda e o rótulo da dor à direita.
- **Sem** ícone de alerta; **sem** cards em tamanhos diferentes (sem bento/span).
- **Malha de conexão** dourada sutil (linhas + nós) atrás do grid, além do brilho radial.
- Eyebrow "Diagnóstico honesto" **sem** o ponto dourado antes dele.
- Hover num card: leve elevação + brilho na borda dourada.
- Em mobile (~375px): 1 coluna, cards iguais, **sem** scroll horizontal.
- Rolar até "Mercados" e confirmar que os cards com `GlowCard`/`IconBadge` de lá continuam normais (não afetados).

- [ ] **Step 5: Commit**

```bash
git add components/sections/dores.tsx
git commit -m "feat: redesign Dores with equal glass cards, metallic numbers and connection mesh"
```

---

## Resumo de arquivos tocados

**Modificados:**
- `theme/tokens.css` (classes `.dores-num`, `.dores-net`)
- `components/sections/dores.tsx` (reescrita: cards de vidro iguais, número metálico, malha, eyebrow sem ponto; remove ícone/GlowCard/bento)

**Inalterados (confirmar):**
- `content/home.ts`
- `components/ui/glow-card.tsx`, `icon-badge.tsx`, `section-heading.tsx` (continuam em uso por outras seções)
