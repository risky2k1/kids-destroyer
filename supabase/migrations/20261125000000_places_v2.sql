-- Places v2: Lucide icon support on tags, opening hours on places, and per-visit history with average rating.

alter table public.plc_tags
  add column icon text check (char_length(icon) <= 40);

alter table public.plc_places
  alter column rating type numeric(3,2);

alter table public.plc_places
  add column open_hours jsonb not null default '[]'::jsonb
    check (jsonb_typeof(open_hours) = 'array');

create table public.plc_visits (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.plc_places (id) on delete cascade,
  visited_at timestamptz not null default now(),
  rating smallint check (rating between 1 and 5),
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null default now()
);

create index plc_visits_place_idx on public.plc_visits (place_id, visited_at desc);

alter table public.plc_visits enable row level security;

create policy read_all on public.plc_visits for select to anon, authenticated using (true);
create policy manage on public.plc_visits for all to authenticated
  using (public.has_permission('places.manage'))
  with check (public.has_permission('places.manage'));

-- Backfill existing visited places into plc_visits before installing the sync trigger.
insert into public.plc_visits (place_id, visited_at, rating, note)
select
  id,
  coalesce(((visited_on + time '12:00') at time zone 'Asia/Ho_Chi_Minh'), created_at),
  rating::smallint,
  null
from public.plc_places
where status = 'visited' and (visited_on is not null or rating is not null);

create or replace function public.plc_sync_place_from_visits() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  target_id uuid := coalesce(new.place_id, old.place_id);
begin
  update public.plc_places p
  set
    rating = sub.avg_rating,
    visited_on = sub.latest_date,
    updated_at = now()
  from (
    select
      round(avg(v.rating)::numeric, 2) as avg_rating,
      (max(v.visited_at) at time zone 'Asia/Ho_Chi_Minh')::date as latest_date
    from public.plc_visits v
    where v.place_id = target_id
  ) sub
  where p.id = target_id;

  return null;
end;
$$;

create trigger plc_visits_sync_place
  after insert or update or delete on public.plc_visits
  for each row execute function public.plc_sync_place_from_visits();
