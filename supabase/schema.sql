-- Schema minimale per la versione Supabase futura.
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  city text not null,
  category text default 'Altro',
  wants text not null,
  telegram_username text not null,
  image_url text,
  status text not null default 'available' check (status in ('available','reserved','traded')),
  created_at timestamptz not null default now()
);

alter table public.items enable row level security;

create policy "Anyone can read available items" on public.items
for select using (status = 'available');
