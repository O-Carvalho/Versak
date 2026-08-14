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
  respostas jsonb not null,
  questionario_versao text not null,
  duracao_segundos integer,
  origem text not null default 'link',
  email_enviado boolean not null default false
);

alter table public.vbs_submissions enable row level security;
-- Sem policies de propósito: anon/authenticated não leem nem escrevem.
-- Toda escrita/leitura passa pelo servidor com a service role key.
