-- Public bucket for the site logo and favicon. Raster images only (no SVG: it can carry script). 1 MB max.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('branding', 'branding', true, 1048576,
        array['image/png', 'image/jpeg', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon']);

-- Public bucket: anyone can read through the public URL. Only settings.manage writes.
create policy branding_write on storage.objects for all to authenticated
  using (bucket_id = 'branding' and public.has_permission('settings.manage'))
  with check (bucket_id = 'branding' and public.has_permission('settings.manage'));
