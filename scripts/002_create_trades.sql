-- Create trades table for trade history
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('buy', 'sell')),
  coin text not null,
  amount numeric not null,
  price numeric not null,
  total numeric not null,
  status text not null default 'completed' check (status in ('completed', 'pending', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.trades enable row level security;

-- RLS policies
create policy "trades_select_own" on public.trades 
  for select using (auth.uid() = user_id);

create policy "trades_insert_own" on public.trades 
  for insert with check (auth.uid() = user_id);

create policy "trades_update_own" on public.trades 
  for update using (auth.uid() = user_id);

create policy "trades_delete_own" on public.trades 
  for delete using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists trades_user_id_idx on public.trades(user_id);
create index if not exists trades_created_at_idx on public.trades(created_at desc);
