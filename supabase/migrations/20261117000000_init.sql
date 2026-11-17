-- Schema for kids-destroyer. See docs/superpowers/specs/2026-11-17-kids-destroyer-design.md §6.

create type public.app_role as enum ('admin', 'parent');
create type public.assignment_status as enum ('assigned', 'submitted', 'reviewed');
create type public.question_lang as enum ('vi', 'en');

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 50),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'parent',
  family_id uuid references public.families (id) on delete restrict,
  display_name text not null check (char_length(display_name) between 1 and 50),
  created_at timestamptz not null default now(),
  constraint parent_has_family check (role = 'admin' or family_id is not null)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 50),
  sort int not null default 0 check (sort >= 0)
);

create table public.grades (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 50),
  sort int not null default 0 check (sort >= 0)
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete restrict,
  grade_id uuid not null references public.grades (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 80),
  unique (subject_id, grade_id, name)
);

create table public.kids (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete restrict,
  display_name text not null check (char_length(display_name) between 1 and 30),
  avatar text not null,
  grade_id uuid not null references public.grades (id) on delete restrict,
  pin_hash text not null,
  pin_failed_count int not null default 0,
  pin_locked_until timestamptz,
  created_at timestamptz not null default now()
);
create index kids_family_idx on public.kids (family_id);

create table public.plugins (
  id text primary key,
  enabled boolean not null default true,
  settings jsonb not null default '{}'
);

create table public.settings (
  key text primary key,
  value jsonb not null
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  subject_id uuid not null references public.subjects (id) on delete restrict,
  grade_id uuid not null references public.grades (id) on delete restrict,
  topic_id uuid references public.topics (id) on delete restrict,
  lang public.question_lang not null default 'vi',
  prompt text not null,
  content jsonb not null default '{}',
  answer jsonb not null default '{}',
  created_by uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);
create index questions_subject_grade_idx on public.questions (subject_id, grade_id);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  subject_id uuid not null references public.subjects (id) on delete restrict,
  grade_id uuid not null references public.grades (id) on delete restrict,
  created_by uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.quiz_questions (
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete restrict,
  position int not null,
  points numeric not null default 1 check (points > 0),
  primary key (quiz_id, question_id)
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete restrict,
  kid_id uuid not null references public.kids (id) on delete restrict,
  assigned_by uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  due_at timestamptz,
  status public.assignment_status not null default 'assigned',
  parent_comment text,
  created_at timestamptz not null default now()
);
create index assignments_kid_idx on public.assignments (kid_id);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  round smallint not null check (round in (1, 2)),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score numeric,
  unique (assignment_id, round)
);

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete restrict,
  response jsonb,
  auto_score numeric check (auto_score between 0 and 1),
  manual_score numeric check (manual_score between 0 and 1),
  feedback text,
  media_path text,
  unique (attempt_id, question_id)
);
