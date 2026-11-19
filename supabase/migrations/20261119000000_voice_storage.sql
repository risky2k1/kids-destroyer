-- Private bucket for kids' voice answers. Path: <family_id>/<kid_id>/<uuid>.<ext>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('voice', 'voice', false, 2097152, array['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg']);

-- Admin: all voice files. Parent: only files under their own family folder.
create policy voice_family on storage.objects for all to authenticated
  using (bucket_id = 'voice' and (public.is_admin()
         or (storage.foldername(name))[1] = (select public.my_family_id())::text))
  with check (bucket_id = 'voice' and (public.is_admin()
         or (storage.foldername(name))[1] = (select public.my_family_id())::text));
