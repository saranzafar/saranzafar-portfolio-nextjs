-- Allow anonymous visitors (role = anon) to insert blog posts.
-- ⚠️ Suitable for local preview or small personal sites.  
--    For production, use Supabase Auth or a Server Action instead.

alter table public.blogs enable row level security;

create policy "Anon can create blogs"
on public.blogs
for insert
with check (true);
