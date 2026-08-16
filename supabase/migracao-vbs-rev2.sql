-- Migração: VBS Rev. 2.0 (novos consentimentos + código do evento) e tabela de Pulso.
-- Rodar no SQL Editor do Supabase, uma vez.

alter table public.vbs_submissions
  add column if not exists consentimento_anonimo boolean,
  add column if not exists consentimento_contato boolean,
  add column if not exists codigo_evento text;

create table if not exists public.pulso_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tipo text not null check (tipo in ('entrada', 'saida')),
  nota integer not null check (nota >= 0 and nota <= 10),
  codigo_evento text,
  origem text not null default 'link'
);

alter table public.pulso_submissions enable row level security;
