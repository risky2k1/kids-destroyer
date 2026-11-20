-- RBAC: roles with permission sets replace the admin/parent enum. See docs/superpowers/specs/2026-11-20-rbac-design.md.
-- super_admin bypasses every check; permission keys are declared in module manifests (TS) as '<area>.<action>'.

create table public.roles (
  id text primary key check (id ~ '^[a-z][a-z0-9_]{1,30}$'),
  name text not null unique check (char_length(name) between 1 and 50),
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id text not null references public.roles (id) on delete cascade,
  permission text not null check (permission ~ '^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$'),
  primary key (role_id, permission)
);

insert into public.roles (id, name, is_system) values
  ('super_admin', 'Quản trị tối cao', true),
  ('admin', 'Quản trị viên', false),
  ('parent', 'Phụ huynh', true);

insert into public.role_permissions (role_id, permission)
select 'admin', p from unnest(array[
  'admin.access', 'access.manage', 'settings.manage', 'catalog.manage', 'questions.manage',
  'quizzes.manage', 'families.manage', 'assignments.manage', 'plugins.manage'
]) as p;

-- profiles.role (enum) -> profiles.role_id (fk). Existing admins become super admins.
alter table public.profiles add column role_id text references public.roles (id) on delete restrict;
update public.profiles set role_id = case role when 'admin' then 'super_admin' else 'parent' end;
alter table public.profiles alter column role_id set not null, alter column role_id set default 'parent';
alter table public.profiles drop constraint parent_has_family;
alter table public.profiles add constraint parent_has_family check (role_id <> 'parent' or family_id is not null);

-- Helpers. security definer so policies can read profiles/role_permissions without recursion.
create function public.is_super_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role_id = 'super_admin');
$$;

create function public.has_permission(p text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles pr
    where pr.id = (select auth.uid())
      and (pr.role_id = 'super_admin'
           or exists (select 1 from public.role_permissions rp where rp.role_id = pr.role_id and rp.permission = p))
  );
$$;

revoke execute on function public.is_super_admin, public.has_permission from anon, public;
grant execute on function public.is_super_admin, public.has_permission to authenticated;

-- Replace every is_admin() policy with the matching permission.
drop policy admin_all on public.subjects;
drop policy admin_all on public.grades;
drop policy admin_all on public.topics;
drop policy admin_all on public.plugins;
drop policy admin_all on public.settings;
drop policy read_own on public.families;
drop policy admin_all on public.families;
drop policy read_own on public.profiles;
drop policy admin_all on public.profiles;
drop policy family_read on public.kids;
drop policy family_update on public.kids;
drop policy admin_insert on public.kids;
drop policy admin_delete on public.kids;
drop policy author_update on public.questions;
drop policy author_delete on public.questions;
drop policy author_update on public.quizzes;
drop policy author_delete on public.quizzes;
drop policy author_write on public.quiz_questions;
drop policy family_all on public.assignments;
drop policy family_all on public.attempts;
drop policy family_all on public.responses;
drop policy voice_family on storage.objects;

create policy catalog_write on public.subjects for all to authenticated
  using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));
create policy catalog_write on public.grades for all to authenticated
  using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));
create policy catalog_write on public.topics for all to authenticated
  using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));
create policy plugins_write on public.plugins for all to authenticated
  using (public.has_permission('plugins.manage')) with check (public.has_permission('plugins.manage'));
create policy settings_write on public.settings for all to authenticated
  using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));

create policy read_own on public.families for select to authenticated
  using (id = public.my_family_id() or public.has_permission('families.manage')
         or public.has_permission('assignments.manage'));
create policy families_write on public.families for all to authenticated
  using (public.has_permission('families.manage')) with check (public.has_permission('families.manage'));

create policy read_own on public.profiles for select to authenticated
  using (id = (select auth.uid()) or family_id = public.my_family_id()
         or public.has_permission('families.manage') or public.has_permission('access.manage'));
-- Role changes are further limited by the guard_profile_role trigger below.
create policy staff_write on public.profiles for all to authenticated
  using (public.has_permission('families.manage') or public.has_permission('access.manage'))
  with check (public.has_permission('families.manage') or public.has_permission('access.manage'));

create policy family_read on public.kids for select to authenticated
  using (family_id = public.my_family_id() or public.has_permission('families.manage')
         or public.has_permission('assignments.manage'));
create policy family_update on public.kids for update to authenticated
  using (family_id = public.my_family_id() or public.has_permission('families.manage'))
  with check (family_id = public.my_family_id() or public.has_permission('families.manage'));
create policy staff_insert on public.kids for insert to authenticated
  with check (public.has_permission('families.manage'));
create policy staff_delete on public.kids for delete to authenticated
  using (public.has_permission('families.manage'));

create policy author_update on public.questions for update to authenticated
  using (public.has_permission('questions.manage') or created_by = (select auth.uid()))
  with check (public.has_permission('questions.manage') or created_by = (select auth.uid()));
create policy author_delete on public.questions for delete to authenticated
  using (public.has_permission('questions.manage') or created_by = (select auth.uid()));

create policy author_update on public.quizzes for update to authenticated
  using (public.has_permission('quizzes.manage') or created_by = (select auth.uid()))
  with check (public.has_permission('quizzes.manage') or created_by = (select auth.uid()));
create policy author_delete on public.quizzes for delete to authenticated
  using (public.has_permission('quizzes.manage') or created_by = (select auth.uid()));
create policy author_write on public.quiz_questions for all to authenticated
  using (exists (select 1 from public.quizzes q where q.id = quiz_id
                 and (public.has_permission('quizzes.manage') or q.created_by = (select auth.uid()))))
  with check (exists (select 1 from public.quizzes q where q.id = quiz_id
                      and (public.has_permission('quizzes.manage') or q.created_by = (select auth.uid()))));

create policy family_all on public.assignments for all to authenticated
  using (public.has_permission('assignments.manage') or public.kid_in_my_family(kid_id))
  with check (public.has_permission('assignments.manage') or public.kid_in_my_family(kid_id));
create policy family_all on public.attempts for all to authenticated
  using (public.has_permission('assignments.manage') or exists (select 1 from public.assignments a
         where a.id = assignment_id and public.kid_in_my_family(a.kid_id)))
  with check (public.has_permission('assignments.manage') or exists (select 1 from public.assignments a
         where a.id = assignment_id and public.kid_in_my_family(a.kid_id)));
create policy family_all on public.responses for all to authenticated
  using (public.has_permission('assignments.manage') or exists (select 1 from public.attempts t
         join public.assignments a on a.id = t.assignment_id
         where t.id = attempt_id and public.kid_in_my_family(a.kid_id)))
  with check (public.has_permission('assignments.manage') or exists (select 1 from public.attempts t
         join public.assignments a on a.id = t.assignment_id
         where t.id = attempt_id and public.kid_in_my_family(a.kid_id)));

create policy voice_family on storage.objects for all to authenticated
  using (bucket_id = 'voice' and (public.has_permission('assignments.manage')
         or (storage.foldername(name))[1] = (select public.my_family_id())::text))
  with check (bucket_id = 'voice' and (public.has_permission('assignments.manage')
         or (storage.foldername(name))[1] = (select public.my_family_id())::text));

drop function public.is_admin();
alter table public.profiles drop column role;
drop type public.app_role;

-- Roles: everyone signed in reads (the app shows role names); access.manage writes.
-- System roles cannot be edited or deleted; super_admin's permission set is never stored.
-- You can only grant permissions you hold yourself.
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;

create policy read_all on public.roles for select to authenticated using (true);
create policy access_insert on public.roles for insert to authenticated
  with check (public.has_permission('access.manage') and not is_system);
create policy access_update on public.roles for update to authenticated
  using (public.has_permission('access.manage') and not is_system)
  with check (public.has_permission('access.manage') and not is_system);
create policy access_delete on public.roles for delete to authenticated
  using (public.has_permission('access.manage') and not is_system);

create policy read_all on public.role_permissions for select to authenticated using (true);
create policy access_insert on public.role_permissions for insert to authenticated
  with check (public.has_permission('access.manage') and role_id <> 'super_admin'
              and public.has_permission(permission));
create policy access_delete on public.role_permissions for delete to authenticated
  using (public.has_permission('access.manage') and role_id <> 'super_admin');

-- Who may set a role on a profile. Service role / migrations (auth.uid() is null) are trusted.
create function public.guard_profile_role() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then return coalesce(new, old); end if;
  if tg_op = 'DELETE' then
    if old.role_id = 'super_admin' and not public.is_super_admin() then
      raise exception 'Chỉ quản trị tối cao mới xoá được quản trị tối cao' using errcode = '42501';
    end if;
    return old;
  end if;
  if (tg_op = 'INSERT' and new.role_id <> 'parent')
     or (tg_op = 'UPDATE' and new.role_id is distinct from old.role_id) then
    if not public.has_permission('access.manage') then
      raise exception 'Không có quyền đổi vai trò' using errcode = '42501';
    end if;
    if (new.role_id = 'super_admin' or (tg_op = 'UPDATE' and old.role_id = 'super_admin'))
       and not public.is_super_admin() then
      raise exception 'Chỉ quản trị tối cao mới gán hoặc gỡ vai trò này' using errcode = '42501';
    end if;
    if exists (select 1 from public.role_permissions rp
               where rp.role_id = new.role_id and not public.has_permission(rp.permission)) then
      raise exception 'Không thể gán vai trò có quyền mà bạn không có' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

create trigger guard_profile_role before insert or update of role_id or delete on public.profiles
  for each row execute function public.guard_profile_role();

-- Applies to everyone, service role included: never leave the system without a super admin.
create function public.keep_a_super_admin() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.role_id = 'super_admin'
     and not exists (select 1 from public.profiles where role_id = 'super_admin') then
    raise exception 'Phải còn ít nhất một quản trị tối cao' using errcode = 'P0001';
  end if;
  return null;
end $$;

create trigger keep_a_super_admin after update of role_id or delete on public.profiles
  for each row execute function public.keep_a_super_admin();
