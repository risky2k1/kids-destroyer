-- Plugin places ("Đi đâu"): a log of places visited / wanted, with tags (category, vibe, area) and photos.
-- Access: anyone (anon included) reads; only `places.manage` writes. Tables are prefixed `plc_`.

create table public.plc_tags (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('category', 'vibe', 'area')),
  name text not null check (char_length(name) between 1 and 40),
  emoji text check (char_length(emoji) <= 8),
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create unique index plc_tags_kind_name_idx on public.plc_tags (kind, lower(name));

create table public.plc_places (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  status text not null default 'visited' check (status in ('visited', 'wishlist')),
  rating smallint check (rating between 1 and 5),
  price_level smallint check (price_level between 1 and 3),
  dishes text check (char_length(dishes) <= 1000),
  note text check (char_length(note) <= 2000),
  maps_url text check (maps_url ~ '^https://'),
  photos text[] not null default '{}' check (cardinality(photos) <= 5),
  visited_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plc_place_tags (
  place_id uuid not null references public.plc_places (id) on delete cascade,
  tag_id uuid not null references public.plc_tags (id) on delete cascade,
  primary key (place_id, tag_id)
);

create index plc_place_tags_tag_idx on public.plc_place_tags (tag_id);

alter table public.plc_tags enable row level security;
alter table public.plc_places enable row level security;
alter table public.plc_place_tags enable row level security;

create policy read_all on public.plc_tags for select to anon, authenticated using (true);
create policy read_all on public.plc_places for select to anon, authenticated using (true);
create policy read_all on public.plc_place_tags for select to anon, authenticated using (true);

create policy manage on public.plc_tags for all to authenticated
  using (public.has_permission('places.manage')) with check (public.has_permission('places.manage'));
create policy manage on public.plc_places for all to authenticated
  using (public.has_permission('places.manage')) with check (public.has_permission('places.manage'));
create policy manage on public.plc_place_tags for all to authenticated
  using (public.has_permission('places.manage')) with check (public.has_permission('places.manage'));

-- The public /di-dau page runs requireModule() as anon; the table only holds module ids and on/off flags.
create policy read_anon on public.modules for select to anon using (true);

-- Public bucket for place photos. Raster images only (no SVG: it can carry script). 2 MB max.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('places', 'places', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy places_write on storage.objects for all to authenticated
  using (bucket_id = 'places' and public.has_permission('places.manage'))
  with check (bucket_id = 'places' and public.has_permission('places.manage'));

insert into public.role_permissions (role_id, permission) values ('admin', 'places.manage');

insert into public.plc_tags (kind, emoji, name, sort) values
  ('category', '🍽️', 'Nhà hàng', 0),
  ('category', '🥢', 'Quán ăn', 1),
  ('category', '☕', 'Cà phê', 2),
  ('category', '🔥', 'Nướng', 3),
  ('category', '🍲', 'Lẩu', 4),
  ('category', '🍚', 'Cơm', 5),
  ('category', '🍜', 'Bún/Phở/Mỳ', 6),
  ('vibe', null, 'Hiện đại', 0),
  ('vibe', null, 'Xưa/cổ', 1),
  ('vibe', null, 'Sạch sẽ', 2),
  ('vibe', null, 'Yên tĩnh', 3),
  ('vibe', null, 'Đông vui', 4),
  ('vibe', null, 'View đẹp', 5);
