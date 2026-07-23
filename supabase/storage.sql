-- Run this after schema.sql if you want real audio files from Supabase Storage.
-- Default bucket name matches VITE_SUPABASE_AUDIO_BUCKET=audio

insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do update
set public = true;

create policy "Public audio read"
on storage.objects
for select
to public
using (bucket_id = 'audio');

create policy "Public audio upload"
on storage.objects
for insert
to public
with check (bucket_id = 'audio');

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do update
set public = true;

create policy "Public cover read"
on storage.objects
for select
to public
using (bucket_id = 'covers');

create policy "Public cover upload"
on storage.objects
for insert
to public
with check (bucket_id = 'covers');

create policy "Public cover update"
on storage.objects
for update
to public
using (bucket_id = 'covers')
with check (bucket_id = 'covers');

create policy "Public audio update"
on storage.objects
for update
to public
using (bucket_id = 'audio')
with check (bucket_id = 'audio');
