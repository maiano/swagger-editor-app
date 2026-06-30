create table if not exists saved_schemas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  content text not null,
  format text not null check (format in ('json', 'yaml')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table saved_schemas enable row level security;

drop policy if exists "users can read own saved schema" on saved_schemas;
create policy "users can read own saved schema"
  on saved_schemas for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own saved schema" on saved_schemas;
create policy "users can insert own saved schema"
  on saved_schemas for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own saved schema" on saved_schemas;
create policy "users can update own saved schema"
  on saved_schemas for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
