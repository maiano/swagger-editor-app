create table if not exists request_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint_id text,
  method text not null,
  path text not null,
  resolved_url text not null,
  status_code integer,
  duration_ms integer not null,
  request_size_bytes integer not null,
  response_size_bytes integer not null,
  error_details text,
  created_at timestamptz not null default now()
);

create index if not exists request_analytics_user_created_idx
  on request_analytics(user_id, created_at desc);

alter table request_analytics enable row level security;

drop policy if exists "users can read own analytics" on request_analytics;
create policy "users can read own analytics"
  on request_analytics for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own analytics" on request_analytics;
create policy "users can insert own analytics"
  on request_analytics for insert
  with check (auth.uid() = user_id);
