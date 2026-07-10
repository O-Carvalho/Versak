# Quem Somos — cartões com letra 3D metálica e brilho no hover — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir os cartões atuais da seção Quem Somos (ícone + letra pequena + texto em `GlowCard`) por cartões onde a letra do valor (V/E/R/S/A/K) é o herói visual — grande, em ouro metálico 3D — com um brilho de gradiente dourado que sobe do rodapé no hover.

**Architecture:** Toda a estilização pesada (gradiente metálico, extrusão, bloom/rim/scrim, keyframe de animação) vive em `theme/tokens.css` (camada de tema, único lugar autorizado a ter literais de cor). O componente `components/sections/quem-somos.tsx` continua Server Component (o hover é 100% CSS, sem JS) e apenas consome as classes `.qs-*`, mantendo `Container`/`SectionHeading`/parágrafo introdutório/`Reveal`/stagger.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, `theme/tokens.css`.

## Global Constraints

- Este repositório **não tem framework de testes unitários**. Validação = `npx tsc --noEmit` + `npx eslint .` + `npm run build` limpos + verificação visual no dev server (desktop e mobile ~375px). Não criar framework de testes (YAGNI).
- **Nenhuma cor "hardcoded" fora de `theme/tokens.css`** — todos os literais dourados/gradientes/sombras deste trabalho ficam em `theme/tokens.css`; o componente só referencia classes `.qs-*` e utilitários Tailwind gerados de `--color-*`.
- **`components/sections/quem-somos.tsx` continua Server Component** (sem `"use client"`) — o efeito de hover é puramente CSS (`:hover` + `@keyframes`).
- O `@media (prefers-reduced-motion: reduce)` global já existente em `theme/tokens.css` zera a animação para quem prefere menos movimento — nenhum tratamento extra necessário.
- **Não alterar `content/home.ts`** — `quemSomos.valores` já é `{ letra, nome, texto }[]`.
- Manter `SectionHeading`, o parágrafo introdutório, o wrapper `Reveal` e o stagger por índice (`delay={i * 0.06}`).
- Remover: a marca d'água "VERSAK" da seção, os ícones lucide, `IconBadge`, o uso de `GlowCard` e o mapa `ICONES`. `GlowCard`/`IconBadge` continuam existindo no projeto (usados por outras seções) — não removê-los.
- Rodar todos os comandos a partir da raiz do worktree: `C:\Users\mathe\OneDrive\Documentos\Versak\versak-landing\.worktrees\hero-visual-redesign`.

---

### Task 1: Adicionar estilos dos cartões Quem Somos em `theme/tokens.css`

**Files:**
- Modify: `theme/tokens.css` (acrescentar ao final: keyframe `qs-flow` + classes `.qs-*`)

**Interfaces:**
- Consumes: tokens já existentes `--color-line`, `--color-panel`, `--color-gold`, `--color-gold-dim`, `--font-display` (todos definidos no bloco `@theme` de `theme/tokens.css`).
- Produces: classes CSS `.qs-card`, `.qs-bloom`, `.qs-rim`, `.qs-letter`, `.qs-scrim`, `.qs-body`, `.qs-nome`, `.qs-desc` e o keyframe `@keyframes qs-flow`, consumidos pela Task 2.

- [ ] **Step 1: Acrescentar o bloco de estilos ao final de `theme/tokens.css`**

Adicionar, ao final do arquivo `theme/tokens.css` (depois da regra `@media (prefers-reduced-motion: reduce)` existente):

```css
/* ---- Quem Somos: cartões com letra 3D metálica e brilho no hover ---- */
@keyframes qs-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.qs-card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  min-height: 15.75rem;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: var(--color-panel);
  transition:
    border-color 0.5s,
    box-shadow 0.5s,
    transform 0.5s;
}
.qs-card:hover {
  transform: translateY(-3px);
  border-color: var(--color-gold-dim);
  box-shadow: 0 24px 60px -24px rgba(232, 169, 62, 0.55);
}

.qs-bloom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 70%;
  z-index: 1;
  opacity: 0;
  background: linear-gradient(100deg, #6b4e1c, #e8a93e 42%, #f7d79a 55%, #e8a93e 70%, #6b4e1c);
  background-size: 230% 100%;
  filter: blur(30px);
  -webkit-mask-image: linear-gradient(to top, #000 18%, transparent 92%);
  mask-image: linear-gradient(to top, #000 18%, transparent 92%);
  transition: opacity 0.55s ease;
}
.qs-card:hover .qs-bloom {
  opacity: 0.9;
  animation: qs-flow 3.2s ease-in-out infinite;
}

.qs-rim {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: -4px;
  height: 6px;
  z-index: 1;
  opacity: 0;
  background: linear-gradient(100deg, #9a6f22, #f7d79a 50%, #9a6f22);
  background-size: 230% 100%;
  filter: blur(7px);
  transition: opacity 0.55s ease;
}
.qs-card:hover .qs-rim {
  opacity: 1;
  animation: qs-flow 3.2s ease-in-out infinite;
}

.qs-letter {
  position: absolute;
  top: -26px;
  right: 0;
  z-index: 2;
  font-family: var(--font-display);
  font-weight: 700;
  line-height: 1;
  font-size: clamp(9rem, 22vw, 11.5rem);
  color: var(--color-gold);
  background: linear-gradient(
    172deg,
    #8a6526 0%,
    #f8e6b4 15%,
    #e8a93e 32%,
    #b9822b 47%,
    #fbeec6 63%,
    #d29a34 79%,
    #7a5620 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(1px 1px 0 #6b4e1c) drop-shadow(2px 2px 0 #5e4418) drop-shadow(3px 3px 0 #4f3a13)
    drop-shadow(5px 5px 0 #3d2c0e) drop-shadow(7px 8px 0 #291d07) drop-shadow(10px 13px 12px rgba(0, 0, 0, 0.6));
  transition: filter 0.5s;
}
.qs-card:hover .qs-letter {
  filter: drop-shadow(1px 1px 0 #7a5a22) drop-shadow(3px 3px 0 #5e4418) drop-shadow(5px 5px 0 #48340f)
    drop-shadow(8px 9px 0 #2b1e08) drop-shadow(12px 15px 16px rgba(0, 0, 0, 0.68));
}

.qs-scrim {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60%;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(to top, rgba(9, 7, 4, 0.88), rgba(9, 7, 4, 0.5) 45%, transparent);
}

.qs-body {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  padding: 20px;
}
.qs-nome {
  margin: 0 0 7px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 20px;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.75);
}
.qs-desc {
  margin: 0;
  max-width: 18ch;
  font-size: 13px;
  line-height: 1.5;
  color: #efe6d3;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.85);
  transition: color 0.4s;
}
.qs-card:hover .qs-desc {
  color: #fff;
}
```

- [ ] **Step 2: Verificar tipos, lint e build**

Run: `npx tsc --noEmit && npx eslint . && npm run build`
Expected: os três passam limpos. O `build` compila o CSS sem erro (as classes `.qs-*` ainda não são usadas por nenhum componente, mas devem compilar). Nenhum erro novo de tsc/eslint (CSS não é alvo do eslint; o objetivo é confirmar que nada quebrou).

- [ ] **Step 3: Commit**

```bash
git add theme/tokens.css
git commit -m "feat: add Quem Somos 3D metallic letter card styles to theme"
```

---

### Task 2: Reescrever `components/sections/quem-somos.tsx` para usar os novos cartões

**Files:**
- Modify: `components/sections/quem-somos.tsx` (reescrita completa)

**Interfaces:**
- Consumes: classes `.qs-card`/`.qs-bloom`/`.qs-rim`/`.qs-letter`/`.qs-scrim`/`.qs-body`/`.qs-nome`/`.qs-desc` (Task 1); `quemSomos` de `@/content/home` (shape `{ eyebrow, titulo, texto, valores: { letra, nome, texto }[] }`, inalterado); `Container`, `SectionHeading`, `Reveal` (componentes existentes, inalterados).
- Produces: nada consumido por outras tasks — folha da árvore.

- [ ] **Step 1: Substituir todo o conteúdo de `components/sections/quem-somos.tsx`**

```tsx
import { Container } from "@/components/ui/container"
import { SectionHeading } from "@/components/ui/section-heading"
import { Reveal } from "@/components/ui/reveal"
import { quemSomos } from "@/content/home"

export function QuemSomos() {
  return (
    <section id="quem-somos" className="relative overflow-hidden border-t border-line py-24">
      <Container className="relative">
        <Reveal>
          <SectionHeading eyebrow={quemSomos.eyebrow} titulo={quemSomos.titulo} />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-text-muted">{quemSomos.texto}</p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quemSomos.valores.map((valor, i) => (
            <Reveal key={valor.letra} delay={i * 0.06}>
              <article className="qs-card h-full">
                <span aria-hidden className="qs-bloom" />
                <span aria-hidden className="qs-rim" />
                <span aria-hidden className="qs-letter">
                  {valor.letra}
                </span>
                <span aria-hidden className="qs-scrim" />
                <div className="qs-body">
                  <p className="qs-nome">{valor.nome}</p>
                  <p className="qs-desc">{valor.texto}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
```

Notas para o implementador:
- Isto remove os imports de `lucide-react`, `GlowCard`, `IconBadge` e o mapa `ICONES` (não devem sobrar imports ou variáveis sem uso — o eslint do projeto falha em `no-unused-vars`).
- Isto remove o `<span>` da marca d'água "VERSAK" que existia logo após a abertura da `<section>`.
- Não adicionar `"use client"` — o arquivo é Server Component e assim deve permanecer.

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint components/sections/quem-somos.tsx`
Expected: PASS, zero erros e zero warnings (sem imports/variáveis não usados).

- [ ] **Step 3: Build de produção**

Run: `npm run build`
Expected: build conclui com sucesso, prerender estático das rotas sem erro.

- [ ] **Step 4: Verificação visual (dev server)**

Com o dev server rodando (`npm run dev`), abrir `http://localhost:3000` e rolar até "Quem somos". Confirmar:
- Os 6 cartões (V, E, R, S, A, K) mostram a letra grande em ouro metálico 3D no canto superior direito, com nome e descrição legíveis embaixo à esquerda.
- **Em repouso os cartões estão totalmente estáticos** (nenhuma animação).
- **No hover**: um brilho dourado desfocado sobe do rodapé (até ~70% da altura, some antes do topo), com o gradiente fluindo de um lado ao outro continuamente; há um "rim" de brilho na borda inferior e um leve glow externo; o cartão sobe 3px.
- **Não há mais** ícones nos cartões nem a marca d'água gigante "VERSAK" no fundo da seção.
- Em viewport mobile (~375px): os cartões empilham, a letra é recortada pelos cantos sem causar scroll horizontal na página, e o texto continua legível.

- [ ] **Step 5: Commit**

```bash
git add components/sections/quem-somos.tsx
git commit -m "feat: redesign Quem Somos cards with 3D metallic letters and hover bloom"
```

---

## Resumo de arquivos tocados

**Modificados:**
- `theme/tokens.css` (keyframe `qs-flow` + classes `.qs-*`)
- `components/sections/quem-somos.tsx` (reescrita: remove ícones/`IconBadge`/`GlowCard`/`ICONES`/marca d'água; novos cartões)

**Inalterados (confirmar que não foram tocados):**
- `content/home.ts`
- `components/ui/glow-card.tsx`, `components/ui/icon-badge.tsx` (continuam em uso por outras seções)
