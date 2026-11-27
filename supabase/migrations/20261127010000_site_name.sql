-- Rename the old default display name. A name the admin already changed is left alone.
update public.settings
set value = '"T-CMS"'::jsonb
where key = 'site_name'
  and value = '"Kids CMS"'::jsonb;
