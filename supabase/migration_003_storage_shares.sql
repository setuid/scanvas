-- ============================================================
-- Story Canvas — Storage Policies for "shares" bucket
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Create the "shares" bucket (public so anyone with the link can read)
insert into storage.buckets (id, name, public)
values ('shares', 'shares', true)
on conflict (id) do update set public = true;

-- 2. Allow authenticated users to upload share snapshots
create policy "Authenticated users can upload shares"
on storage.objects for insert
to authenticated
with check (bucket_id = 'shares');

-- 3. Allow anyone to read shared snapshots (public links)
create policy "Anyone can read shares"
on storage.objects for select
to public
using (bucket_id = 'shares');
