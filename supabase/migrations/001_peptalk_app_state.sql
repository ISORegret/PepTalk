-- PepTalk: one JSONB row per user for full app backup (weights, injections, vials, etc.)
-- Run in Supabase SQL Editor or via CLI after linking the project.

create table if not exists public.peptalk_app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists peptalk_app_state_updated_at on public.peptalk_app_state (updated_at desc);

alter table public.peptalk_app_state enable row level security;

create policy "peptalk_select_own"
  on public.peptalk_app_state for select
  using (auth.uid() = user_id);

create policy "peptalk_insert_own"
  on public.peptalk_app_state for insert
  with check (auth.uid() = user_id);

create policy "peptalk_update_own"
  on public.peptalk_app_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "peptalk_delete_own"
  on public.peptalk_app_state for delete
  using (auth.uid() = user_id);
