-- Package media: shared file & document library with isolated public/private folder trees,
-- storage-driver-agnostic metadata, and RBAC (`media.view`, `media.manage`).

create table public.media_folders (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid,
  name text not null check (char_length(name) between 1 and 80),
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_folders_id_visibility_key unique (id, visibility),
  constraint media_folders_parent_fkey
    foreign key (parent_id, visibility) references public.media_folders (id, visibility) on delete restrict
);

create unique index media_folders_parent_name_idx
  on public.media_folders (visibility, coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));

create table public.media_files (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid,
  visibility text not null check (visibility in ('public', 'private')),
  driver text not null default 'supabase' check (char_length(driver) between 1 and 32),
  storage_key text not null check (char_length(storage_key) between 1 and 300),
  name text not null check (char_length(name) between 1 and 160),
  alt text check (char_length(alt) <= 300),
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  width int check (width is null or width > 0),
  height int check (height is null or height > 0),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_files_folder_fkey
    foreign key (folder_id, visibility) references public.media_folders (id, visibility) on delete restrict
);

create unique index media_files_driver_key_idx
  on public.media_files (driver, visibility, storage_key);

create index media_files_folder_idx on public.media_files (folder_id);
create index media_files_visibility_created_idx on public.media_files (visibility, created_at desc);

alter table public.media_folders enable row level security;
alter table public.media_files enable row level security;

create policy media_folders_read on public.media_folders for select to authenticated
  using (public.has_permission('media.view') or public.has_permission('media.manage'));
create policy media_folders_manage on public.media_folders for all to authenticated
  using (public.has_permission('media.manage'))
  with check (public.has_permission('media.manage'));

create policy media_files_read_public on public.media_files for select to anon, authenticated
  using (visibility = 'public');
create policy media_files_read_private on public.media_files for select to authenticated
  using (
    visibility = 'private'
    and (public.has_permission('media.view') or public.has_permission('media.manage'))
  );
create policy media_files_manage on public.media_files for all to authenticated
  using (public.has_permission('media.manage'))
  with check (public.has_permission('media.manage'));

-- Two separate buckets: public CDN assets and private authenticated documents.
-- SVG is excluded to prevent stored XSS. 10 MB max per file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  (
    'media-public',
    'media-public',
    true,
    10485760,
    array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf', 'text/plain', 'text/markdown',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip', 'application/x-zip-compressed'
    ]
  ),
  (
    'media-private',
    'media-private',
    false,
    10485760,
    array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf', 'text/plain', 'text/markdown',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip', 'application/x-zip-compressed'
    ]
  );

create policy media_public_manage on storage.objects for all to authenticated
  using (bucket_id = 'media-public' and public.has_permission('media.manage'))
  with check (bucket_id = 'media-public' and public.has_permission('media.manage'));

create policy media_private_read on storage.objects for select to authenticated
  using (
    bucket_id = 'media-private'
    and (public.has_permission('media.view') or public.has_permission('media.manage'))
  );

create policy media_private_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media-private' and public.has_permission('media.manage'));
create policy media_private_update on storage.objects for update to authenticated
  using (bucket_id = 'media-private' and public.has_permission('media.manage'))
  with check (bucket_id = 'media-private' and public.has_permission('media.manage'));
create policy media_private_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media-private' and public.has_permission('media.manage'));

insert into public.role_permissions (role_id, permission) values
  ('admin', 'media.view'),
  ('admin', 'media.manage');
