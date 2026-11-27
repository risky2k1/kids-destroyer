-- Parent-authored quizzes: origin, optional question image, AI quota log, cross-family edit locks.

alter table public.quizzes
  add column origin text not null default 'system' check (origin in ('system', 'parent'));

alter table public.questions
  add column origin text not null default 'system' check (origin in ('system', 'parent')),
  add column image_path text;

-- Client-supplied origin is ignored. Parents always author as 'parent'.
create function public.set_origin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.origin := case
    when exists (select 1 from profiles where id = auth.uid() and role_id = 'parent') then 'parent'
    else 'system'
  end;
  return new;
end $$;

create trigger quizzes_set_origin before insert on public.quizzes
  for each row execute function public.set_origin();

create trigger questions_set_origin before insert on public.questions
  for each row execute function public.set_origin();

create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index ai_generations_user_created_idx on public.ai_generations (user_id, created_at desc);

alter table public.ai_generations enable row level security;

create policy ai_generations_select on public.ai_generations for select to authenticated
  using (user_id = (select auth.uid()));
create policy ai_generations_insert on public.ai_generations for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Sees assignments in every family. Callers cannot read those rows directly.
create function public.quiz_in_use(p_quiz_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from assignments where quiz_id = p_quiz_id);
$$;

create function public.question_in_use(p_question_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from quiz_questions qq
    join quizzes q on q.id = qq.quiz_id
    where qq.question_id = p_question_id
      and (
        exists (select 1 from assignments a where a.quiz_id = q.id)
        or q.created_by <> auth.uid()
      )
  );
$$;

revoke execute on function public.quiz_in_use, public.question_in_use from anon, public;
grant execute on function public.quiz_in_use, public.question_in_use to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  (
    'question-images',
    'question-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  );

create policy question_images_own on storage.objects for all to authenticated
  using (
    bucket_id = 'question-images'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.has_permission('questions.manage')
    )
  )
  with check (
    bucket_id = 'question-images'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.has_permission('questions.manage')
    )
  );

insert into public.role_permissions (role_id, permission) values ('parent', 'quizzes.author');
