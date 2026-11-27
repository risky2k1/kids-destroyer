-- Community suggestions stay hidden until a manager approves them.
-- Anon SELECT hides pending rows, so a policy EXISTS cannot see an open suggestion.
-- plc_suggestion_is_open is security definer for that check only.

alter table public.plc_places
  add column origin text not null default 'admin'
    check (origin in ('admin', 'community')),
  add column review_status text not null default 'approved'
    check (review_status in ('pending', 'approved'));

drop policy read_all on public.plc_places;
drop policy read_all on public.plc_place_tags;

create function public.plc_suggestion_is_open(place_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.plc_places p
    where p.id = place_id
      and p.origin = 'community'
      and p.review_status = 'pending'
  );
$$;

revoke all on function public.plc_suggestion_is_open(uuid) from public;
grant execute on function public.plc_suggestion_is_open(uuid) to anon, authenticated;

create policy read_approved on public.plc_places for select to anon, authenticated
  using (review_status = 'approved');

create policy read_approved on public.plc_place_tags for select to anon, authenticated
  using (
    exists (
      select 1
      from public.plc_places p
      where p.id = place_id
        and p.review_status = 'approved'
    )
  );

create policy suggest_place on public.plc_places for insert to anon, authenticated
  with check (
    origin = 'community'
    and review_status = 'pending'
    and status = 'wishlist'
    and rating is null
    and price_level is null
    and dishes is null
    and visited_on is null
    and photos = '{}'
  );

create policy suggest_place_tag on public.plc_place_tags for insert to anon, authenticated
  with check (
    public.plc_suggestion_is_open(place_id)
    and exists (
      select 1
      from public.plc_tags t
      where t.id = tag_id
        and t.kind in ('category', 'vibe')
    )
  );
