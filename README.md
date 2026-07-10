# Versak — Landing Page (Next.js)

Site institucional em Next.js 15 (App Router), desenhado para servir também como **template reutilizável** para os próximos sites de clientes (academia de BJJ, clínica, estética automotiva etc.).

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000`.

## Validado de ponta a ponta

`npm install`, `tsc --noEmit`, `next build` (com prerender estático das 6 rotas) e `eslint .` rodaram limpos antes da entrega. A única coisa que não pude confirmar neste ambiente sandboxed é o download das fontes do Google (`fonts.googleapis.com` está bloqueado aqui) — isso funciona normalmente no seu ambiente real (`npm run dev` ou deploy na Vercel), é uma limitação só deste sandbox de validação, não do código.

## Como reaproveitar para o próximo cliente

Só dois lugares mudam:

1. **`theme/tokens.css`** — cores e (se quiser) fontes. Troque os valores de `--color-*` pela identidade do novo cliente.
2. **`content/site.ts`** e **`content/home.ts`** — todo o texto, links de WhatsApp, e-mail, redes sociais.

Nenhum componente em `components/` deveria precisar mudar. Se mudar, é sinal de que alguma coisa ficou "hardcoded" que devia estar em `content/` ou `theme/` — vale corrigir ali antes de seguir pro próximo projeto, pra manter o template genérico de verdade.

## Estrutura

```
app/            → rotas finas (layout, page, sitemap.ts, robots.ts)
components/ui/  → primitives sem regra de negócio (Button, Container, SectionHeading, Reveal)
components/sections/  → blocos de marketing (Header, Hero, QuemSomos, Dores, Mercados, RoiBanner, Fundador, CtaFinal, Footer)
content/        → todo o texto e configuração da Versak — o que muda por cliente
theme/          → tokens de cor/fonte — o que muda por cliente
lib/seo.ts      → helper de metadata reaproveitável entre projetos
```

## SEO já configurado

- `generateMetadata`/`Metadata` da própria Next.js, sem lib extra
- `app/sitemap.ts` e `app/robots.ts` (convenções nativas do App Router)
- JSON-LD (`schema.org/ProfessionalService`) injetado no `layout.tsx`
- `next/font/google` self-hospeda Oswald e Inter — zero requisição externa em produção, zero layout shift
- Server Components por padrão — a maioria do HTML chega pronto do servidor; `Hero`, `Header`/`MobileNav`, `RoiBanner`, `CtaFinal`, `AmbientRing`, `CountUp` e `Reveal` são Client Components (por causa de animação, estado de interação ou scroll)

## Performance / animação

- `motion` (Framer Motion) só onde adiciona valor: hero (entrada em sequência + cards flutuantes), `AmbientRing` (anel dourado giratório, reaproveitado no Hero, ROI Banner, Fundador e CTA Final como assinatura visual do "Diagnóstico 360º"), `CountUp` (contadores animados em estatísticas), `Header`/`MobileNav` (menu mobile e efeito de scroll) e `Reveal` (fade-in ao rolar a página, usado em todas as seções abaixo do hero)
- `MotionConfig reducedMotion="user"` no layout — quem tem "reduzir movimento" ativado no sistema operacional recebe a página sem animação, automaticamente
- First Load JS da home: **161 kB** — leve para um site com esse nível de animação

## Próximos passos antes de colocar no ar

1. Trocar `content/site.ts` → `url` pelo domínio real, e confirmar o número de WhatsApp
2. Gerar e adicionar `app/opengraph-image.png` (imagem de compartilhamento em redes sociais — hoje não existe uma)
3. Registrar o domínio na Vercel e conectar (deploy é `git push`, sem configuração adicional)
4. Rodar o Lighthouse depois do primeiro deploy real para confirmar as métricas de Core Web Vitals em produção
