-- On/off state of feature plugins (ids match ModuleManifest.id). A missing row means enabled.
-- Disabling hides the plugin and blocks its routes in the app; its data and permissions stay untouched.
create table public.modules (
  id text primary key check (id ~ '^[a-z][a-z0-9-]{1,40}$'),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.modules enable row level security;
create policy read_all on public.modules for select to authenticated using (true);
create policy modules_write on public.modules for all to authenticated
  using (public.has_permission('modules.manage')) with check (public.has_permission('modules.manage'));

insert into public.role_permissions (role_id, permission) values ('admin', 'modules.manage');
