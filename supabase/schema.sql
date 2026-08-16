-- DME 360 — envios do formulário público. Executar no SQL Editor do Supabase.
create table public.dme_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  empresa text not null,
  cargo text,
  email text not null,
  whatsapp text not null,
  consentimento boolean not null,
  respostas jsonb not null,
  pontuacao jsonb not null,
  ime numeric(4,2) not null,
  classificacao text not null,
  questionario_versao text not null,
  duracao_segundos integer,
  origem text not null default 'link',
  email_enviado boolean not null default false
);

alter table public.dme_submissions enable row level security;
-- Sem policies de propósito: anon/authenticated não leem nem escrevem.
-- Toda escrita/leitura passa pelo servidor com a service role key.

-- VBS — Versak Business Snapshot (ficha de contexto, sem pontuação).
create table public.vbs_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  empresa text not null,
  email text not null,
  whatsapp text not null,
  consentimento boolean not null,
  consentimento_anonimo boolean,
  consentimento_contato boolean,
  respostas jsonb not null,
  questionario_versao text not null,
  duracao_segundos integer,
  origem text not null default 'link',
  codigo_evento text,
  email_enviado boolean not null default false
);

alter table public.vbs_submissions enable row level security;
-- Sem policies de propósito: anon/authenticated não leem nem escrevem.
-- Toda escrita/leitura passa pelo servidor com a service role key.

-- Pulso — pesquisa de entrada/saída de um evento (uma pergunta, escala 0-10, anônima).
create table public.pulso_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tipo text not null check (tipo in ('entrada', 'saida')),
  nota integer not null check (nota >= 0 and nota <= 10),
  codigo_evento text,
  origem text not null default 'link'
);

alter table public.pulso_submissions enable row level security;
-- Sem policies de propósito: anon/authenticated não leem nem escrevem.
-- Toda escrita/leitura passa pelo servidor com a service role key.
