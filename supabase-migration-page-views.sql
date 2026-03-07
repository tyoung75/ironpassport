-- Page views tracking table for analytics
create table if not exists page_views (
  id bigint generated always as identity primary key,
  path text not null,
  referrer text,
  user_agent text,
  session_id text,
  screen_width int,
  created_at timestamptz default now()
);

-- Indexes for common query patterns
create index idx_page_views_created_at on page_views (created_at);
create index idx_page_views_path on page_views (path);
create index idx_page_views_session_id on page_views (session_id);

-- RLS: append-only for anon (insert + select, no update/delete)
alter table page_views enable row level security;

create policy "Allow anon insert" on page_views
  for insert to anon with check (true);

create policy "Allow anon select" on page_views
  for select to anon using (true);
