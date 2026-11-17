-- Row level security. Admin: everything. Parent: own family's kids/assignments; shared catalog + question bank.

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

create function public.my_family_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select family_id from public.profiles where id = (select auth.uid());
$$;

create function public.kid_in_my_family(kid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.kids k
    where k.id = kid and k.family_id = (select public.my_family_id())
  );
$$;

revoke execute on function public.is_admin, public.my_family_id, public.kid_in_my_family from anon, public;
grant execute on function public.is_admin, public.my_family_id, public.kid_in_my_family to authenticated;

alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.grades enable row level security;
alter table public.topics enable row level security;
alter table public.kids enable row level security;
alter table public.plugins enable row level security;
alter table public.settings enable row level security;
alter table public.questions enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.assignments enable row level security;
alter table public.attempts enable row level security;
alter table public.responses enable row level security;

-- Catalog / config: everyone signed in reads, admin writes.
create policy read_all on public.subjects for select to authenticated using (true);
create policy admin_all on public.subjects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy read_all on public.grades for select to authenticated using (true);
create policy admin_all on public.grades for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy read_all on public.topics for select to authenticated using (true);
create policy admin_all on public.topics for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy read_all on public.plugins for select to authenticated using (true);
create policy admin_all on public.plugins for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy read_all on public.settings for select to authenticated using (true);
create policy admin_all on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Families & profiles: read own family; only admin writes (no self-escalation).
create policy read_own on public.families for select to authenticated
  using (public.is_admin() or id = public.my_family_id());
create policy admin_all on public.families for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy read_own on public.profiles for select to authenticated
  using (public.is_admin() or id = (select auth.uid()) or family_id = public.my_family_id());
create policy admin_all on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Kids: family reads/updates (PIN counters, grade); admin creates/deletes.
create policy family_read on public.kids for select to authenticated
  using (public.is_admin() or family_id = public.my_family_id());
create policy family_update on public.kids for update to authenticated
  using (public.is_admin() or family_id = public.my_family_id())
  with check (public.is_admin() or family_id = public.my_family_id());
create policy admin_insert on public.kids for insert to authenticated with check (public.is_admin());
create policy admin_delete on public.kids for delete to authenticated using (public.is_admin());

-- Shared question bank: all read; author or admin edits.
create policy read_all on public.questions for select to authenticated using (true);
create policy author_insert on public.questions for insert to authenticated
  with check (created_by = (select auth.uid()));
create policy author_update on public.questions for update to authenticated
  using (public.is_admin() or created_by = (select auth.uid()))
  with check (public.is_admin() or created_by = (select auth.uid()));
create policy author_delete on public.questions for delete to authenticated
  using (public.is_admin() or created_by = (select auth.uid()));

create policy read_all on public.quizzes for select to authenticated using (true);
create policy author_insert on public.quizzes for insert to authenticated
  with check (created_by = (select auth.uid()));
create policy author_update on public.quizzes for update to authenticated
  using (public.is_admin() or created_by = (select auth.uid()))
  with check (public.is_admin() or created_by = (select auth.uid()));
create policy author_delete on public.quizzes for delete to authenticated
  using (public.is_admin() or created_by = (select auth.uid()));

create policy read_all on public.quiz_questions for select to authenticated using (true);
create policy author_write on public.quiz_questions for all to authenticated
  using (exists (select 1 from public.quizzes q where q.id = quiz_id
                 and (public.is_admin() or q.created_by = (select auth.uid()))))
  with check (exists (select 1 from public.quizzes q where q.id = quiz_id
                      and (public.is_admin() or q.created_by = (select auth.uid()))));

-- Work of a kid: admin or the kid's family.
create policy family_all on public.assignments for all to authenticated
  using (public.is_admin() or public.kid_in_my_family(kid_id))
  with check (public.is_admin() or public.kid_in_my_family(kid_id));

create policy family_all on public.attempts for all to authenticated
  using (public.is_admin() or exists (select 1 from public.assignments a
         where a.id = assignment_id and public.kid_in_my_family(a.kid_id)))
  with check (public.is_admin() or exists (select 1 from public.assignments a
         where a.id = assignment_id and public.kid_in_my_family(a.kid_id)));

create policy family_all on public.responses for all to authenticated
  using (public.is_admin() or exists (select 1 from public.attempts t join public.assignments a on a.id = t.assignment_id
         where t.id = attempt_id and public.kid_in_my_family(a.kid_id)))
  with check (public.is_admin() or exists (select 1 from public.attempts t join public.assignments a on a.id = t.assignment_id
         where t.id = attempt_id and public.kid_in_my_family(a.kid_id)));
