-- Plugin sword-x-staff: one JSON document per character. The game catalog (skills, companions, fantomons) is static
-- JSON in the plugin code, not in the DB. Tables are prefixed `sxs_` so plugins never collide.
-- Access: your own rows only, and only while your role holds `sxs.use`.

create table public.sxs_servers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  opened_on date not null,
  created_at timestamptz not null default now()
);

create table public.sxs_characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  server_id uuid references public.sxs_servers (id) on delete set null,
  name text not null check (char_length(name) between 1 and 50),
  -- Shape is validated by the plugin's zod schema; the DB only guards type and size.
  data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 262144),
  last_opened_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sxs_characters_user_opened_idx on public.sxs_characters (user_id, last_opened_at desc);
create index sxs_servers_user_idx on public.sxs_servers (user_id);

alter table public.sxs_servers enable row level security;
alter table public.sxs_characters enable row level security;

create policy own on public.sxs_servers for all to authenticated
  using (user_id = (select auth.uid()) and public.has_permission('sxs.use'))
  with check (user_id = (select auth.uid()) and public.has_permission('sxs.use'));

-- A character may only point at one of your own servers.
create policy own on public.sxs_characters for all to authenticated
  using (user_id = (select auth.uid()) and public.has_permission('sxs.use'))
  with check (
    user_id = (select auth.uid()) and public.has_permission('sxs.use')
    and (server_id is null or exists (
      select 1 from public.sxs_servers s where s.id = server_id and s.user_id = (select auth.uid())))
  );

insert into public.role_permissions (role_id, permission) values ('admin', 'sxs.use');
