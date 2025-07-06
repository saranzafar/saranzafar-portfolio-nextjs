-- Allow the anon role (clients without a signed-in user) to upload objects
-- to the public “blog-assets” bucket.  Read-access was already public.

alter table storage.objects enable row level security;

create policy "Anon can upload blog assets"
on storage.objects
for insert
with check (bucket_id = 'blog-assets');      -- limit scope to this bucket
