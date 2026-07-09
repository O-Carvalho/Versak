# Redesign visual completo da landing page Versak

Data: 2026-07-09
Status: Aprovado pelo usuário (Matheus), copy do Hero aprovada por Victor (fundador) em reunião prévia.

## Contexto

O Hero atual foi aprovado pelo Victor com uma copy específica (capturada em print de reunião) que diverge do que está em `content/home.ts`. As demais seções (Quem Somos, Dores, Mercados, ROI Banner, Fundador, CTA Final, Header, Footer) usam grids planos, sem ícones, sem profundidade e com pouquíssima animação — precisam de um upgrade visual coerente com o motivo gráfico já aprovado no Hero (o anel dourado girando / "Diagnóstico 360º").

Pesquisa de mercado (B2B/consultoria premium, 2026): dark theme com glow dourado, bento grids com micro-interação em hover, contadores animados em estatísticas, stagger de entrada mais perceptível. Evitar o excesso "SaaS dashboard" — manter o tom "consultoria premium", não "produto de tech".

## Decisões já fechadas com o usuário

- Redesign cobre **todas** as seções abaixo do Hero, não só uma parte.
- Ícones via **lucide-react** (nova dependência).
- Nav do header **não** ganha item "Serviços" novo — mantém como está hoje (Quem somos, Soluções, Mercados, Fundador). O "Serviços" do print era só do mockup do Victor.
- Fundador usa a **foto real** do Victor (`saura.png`, já na raiz do projeto → mover para `public/fundador/victor-saura.jpg`), dentro da moldura de anel duplo dourado.
- O vídeo enviado (`WhatsApp Video 2026-06-30 at 17.11.43.mp4`) **não** entra nesse redesign — fica para uma etapa futura.

## 1. Hero (`components/sections/hero.tsx`, `content/home.ts`)

### Copy — trocar para o texto exato aprovado por Victor no print

```ts
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
```

`cartoes` (título/texto) já batem com o print — não mudam. `eyebrow` ("Diagnóstico 360º") também não muda (estava coberto no print pela janela da call, mas é consistente com o resto do site).

### Cards flutuantes — reescrever o bloco de cards

Hoje: 3 divs empilhadas verticalmente, `margin-left` alternado, só animação de entrada.

Novo comportamento:
- Cada card recebe um `IconBadge` (novo componente, ver seção 9) com ícone lucide:
  - Retorno Garantido → `TrendingUp`
  - Processos Inteligentes → `CheckCircle2`
  - Decisões por Dados → `ShieldCheck`
- Posicionamento escalonado horizontalmente (`translateX` alternando, não só `margin-left`), pra reproduzir o efeito "flutuando espalhado" do print, não uma coluna reta.
- Depois da animação de entrada (`initial`/`animate` atual), cada card entra em loop de flutuação contínua: `animate={{ y: [0, -6, 0] }}` com `duration` levemente diferente por card (ex: 4s, 4.6s, 5.2s) e `repeat: Infinity, ease: "easeInOut"` — evita sincronismo entre os 3.
- Hover: `border-color` dourado + `box-shadow` glow sutil (usar as mesmas classes de glow do `GlowCard`, seção 9).

`AmbientRing` não muda (é o elemento que já foi aprovado). Só validar `z-index` para os cards flutuantes ficarem visualmente por cima do anel sem cobri-lo por completo.

## 2. Header (`components/sections/header.tsx`)

- **Menu mobile**: hoje o `<nav>` é `hidden md:flex` — abaixo do breakpoint `md` não existe nenhum jeito de navegar. Adicionar botão hambúrguer (ícone `Menu`/`X` do lucide) visível só em mobile, que abre um painel/drawer com os mesmos links de `site.nav`, animado com `motion` (slide + fade).
- **Sublinhado ativo/hover**: cada link do nav ganha uma barra dourada animada (`layoutId` do Motion para transição suave entre estados) por baixo do texto, em vez de só mudar a cor.
- **Scroll effect**: usar `useScroll`/`useMotionValueEvent` do `motion` para aumentar levemente o blur e a opacidade do fundo do header (`backdrop-blur` + `bg-bg/80` → `bg-bg/95`) conforme o usuário rola a página.

## 3. Quem Somos (`components/sections/quem-somos.tsx`)

- Cada valor VERSAK ganha `IconBadge` com ícone temático, substituindo a letra grande solta:
  - Versatilidade → `Shuffle`
  - Estratégia → `Target`
  - Respeito → `Heart`
  - Sabedoria → `BookOpen`
  - Atitude → `Flame`
  - Key Factor → `KeyRound`
  (a letra continua aparecendo, menor, ao lado/abaixo do ícone — não perde a referência ao acróstico VERSAK)
- Grid deixa de ser uma tabela com bordas compartilhadas (`gap-px bg-line`) e passa a cards independentes com espaçamento (`gap-4`/`gap-5`), cada um com `GlowCard` (hover: leve `translateY(-4px)` + glow dourado na borda).
- Atrás do parágrafo introdutório, adicionar um watermark tipográfico: texto "VERSAK" grande (`text-[8rem]` ou similar), `opacity-[0.03]`, `position: absolute`, não interativo (`pointer-events-none`, `aria-hidden`).

## 4. Dores (`components/sections/dores.tsx`)

Reescrever de lista de bullets para grid bento de cards:
- Cada item ganha `IconBadge` com ícone `AlertTriangle` (tom do badge levemente mais quente/alerta dentro da paleta dourada existente — não introduzir vermelho fora da paleta, usar `gold`/`gold-dim` com opacidade maior).
- Grid bento: usar `sm:grid-cols-2 lg:grid-cols-3` com 2-3 cards ocupando `col-span-2` (os itens de texto mais longo, ex: "Dificuldade de controlar fluxo de caixa e variáveis financeiras") para quebrar a uniformidade.
- Fundo da seção ganha um radial gradient sutil (`radial-gradient` via CSS, cor `--color-gold-dim` em baixa opacidade) centralizado atrás do grid, puramente decorativo (`pointer-events-none`, `aria-hidden`).
- Stagger de entrada mais perceptível: aumentar o delay incremental do `Reveal` de `i * 0.04` para `i * 0.06` combinado com `y` maior (`y={20}`).

## 5. Mercados (`components/sections/mercados.tsx`)

- Ícone lucide por grupo:
  - Indústria de Manufatura Seriada → `Factory`
  - Engenharia e Projetos → `Wrench`
  - Agronegócio → `Wheat`
  - Construção Civil → `Building2`
  - Logística e Transporte → `Truck`
  - Comércio → `ShoppingCart`
  - Saúde → `HeartPulse`
  - Serviços → `Briefcase`
  - Tecnologia → `Cpu`
- Cards em `GlowCard`; no hover, além do glow de borda, o `IconBadge` do card faz `scale(1.08) rotate(-4deg)` e intensifica a cor de fundo (transição de `bg-gold/10` para `bg-gold/20`).
- Grid bento leve: 1-2 cards (ex: Tecnologia, Indústria) em `lg:col-span-2` pra variar o ritmo visual do grid de 9 itens uniformes.
- Entrada em scroll com stagger por linha (delay calculado por `Math.floor(i / colunas)` além do `i` individual), pra reforçar a cascata.

## 6. ROI Banner (`components/sections/roi-banner.tsx`)

- Atrás do texto centralizado, adicionar uma versão mais lenta/discreta do `AmbientRing` do Hero (reaproveitar o componente, com raios menores e `opacity` mais baixa, ex: `opacity-[0.15]`), centralizada na seção — é o "eco" do motivo assinatura.
- O número em destaque (`{roi.destaque}`, contém "o dobro") — como o conteúdo atual é texto livre e não um número isolado, extrair o "2x" para um elemento numérico próprio com **count-up** (novo componente `CountUp`, seção 9) que anima de 0 a 2 quando entra na viewport, seguido do resto do texto em destaque.
- Leve pulso de glow contínuo (`animate={{ opacity: [0.6, 1, 0.6] }}`, `repeat: Infinity`, duração ~3s) na cor de texto em destaque — sutil, não piscante.

## 7. Fundador (`components/sections/fundador.tsx`)

- Adicionar a foto real do Victor (`public/fundador/victor-saura.jpg`) dentro de um frame circular com anel duplo dourado girando devagar (reaproveitar visual do `AmbientRing`, versão simplificada com 2 raios só, rotação lenta ~90s), posicionado ao lado do nome/cargo (novo elemento na coluna esquerda do grid, que hoje só tem texto).
- Os 6 números (`fundador.numeros`) ganham **count-up animado** (`CountUp`) ao entrar na viewport, com delay escalonado (`i * 0.08`) entre eles — parseia o valor (`30+`, `250MM`) pra animar a parte numérica e manter o sufixo (`+`, `MM`) fixo.
- Cards de número ganham hover: borda inferior "acende" em dourado (`border-b-2 border-transparent hover:border-gold` com transição) + leve glow.

## 8. CTA Final + Footer

**CTA Final** (`components/sections/cta-final.tsx`):
- Mesmo `AmbientRing` reaproveitado (eco do motivo, terceira aparição), atrás do bloco central.
- Glow radial pulsante atrás do botão principal (`div` absolutamente posicionado atrás do `Button`, `blur-2xl`, `bg-gold/20`, `animate={{ opacity: [0.4, 0.7, 0.4] }}`).
- Botão ganha `whileHover={{ scale: 1.03 }}` além da troca de cor já existente.

**Footer** (`components/sections/footer.tsx`):
- Borda superior vira gradiente dourado sutil (`border-image` ou pseudo-elemento com `linear-gradient` horizontal, opacidade baixa nas pontas) em vez de `border-line` reta.
- Ícones lucide (`Mail`, `Linkedin`) ao lado dos links de e-mail/LinkedIn.

## 9. Novos componentes compartilhados (`components/ui/`)

- **`icon-badge.tsx`** — `IconBadge({ icon: LucideIcon, className? })`: quadrado arredondado (`rounded-md`), fundo `bg-gold/10`, ícone `text-gold`, tamanho consistente (ex: `h-10 w-10`, ícone `h-5 w-5`). Reutilizado em Hero, Quem Somos, Dores, Mercados.
- **`glow-card.tsx`** — `GlowCard({ children, className? })`: wrapper com `border border-line bg-panel rounded-md transition-all hover:border-gold-dim hover:shadow-[0_0_24px_-8px_rgba(232,169,62,0.35)] hover:-translate-y-1`. Substitui as divs de card repetidas em Quem Somos, Dores, Mercados, Fundador.
- **`count-up.tsx`** — `CountUp({ value: string, duration? })`: recebe string tipo `"30+"`, `"250MM"`, `"2x"`; extrai a parte numérica via regex, anima com `motion`'s `useMotionValue` + `animate()` disparado por `whileInView`/`useInView` (`once: true`), re-anexa o sufixo não-numérico ao final. Usado em Hero stats, ROI Banner, Fundador.
- **`mobile-nav.tsx`** — drawer mobile para o Header, usa `site.nav`.

## 10. Dependência nova

- `lucide-react` (`npm install lucide-react`) — biblioteca de ícones, tree-shakeable, sem custo relevante de bundle pros ícones usados.

## 11. Assets

- Mover `saura.png` (raiz do projeto) → `public/fundador/victor-saura.jpg` (ou manter `.png`, ajustar extensão na referência). Usar `next/image` com `priority={false}` (não é LCP da página).
- Vídeo do Victor: **não** processado nesse trabalho.

## Fora de escopo

- Seção "Serviços" nova (nav mantém como está).
- Uso do vídeo do fundador.
- Qualquer mudança de conteúdo textual fora do Hero (Dores, Mercados, Fundador, etc. mantêm o texto atual de `content/home.ts`, só ganham tratamento visual/ícone).
