-- Migração: adiciona nome/e-mail e controle de envio de e-mail ao Pulso.
-- Rodar no SQL Editor do Supabase, uma vez.

alter table public.pulso_submissions
  add column if not exists nome text,
  add column if not exists email text,
  add column if not exists email_enviado boolean not null default false;
