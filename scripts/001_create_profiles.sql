-- Create profiles table for user data
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  portfolio_balance numeric default 15000,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- RLS policies
create policy "profiles_select_own" on public.profiles 
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles 
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles 
  for update using (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles 
  for delete using (auth.uid() = id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, portfolio_balance)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    15000
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
