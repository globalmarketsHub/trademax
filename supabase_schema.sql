create extension if not exists "uuid-ossp";
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  name text, wechat text, whatsapp text, email text,
  registered text, account_type text, interest text, source_page text,
  notes text, status text default '新客户',
  ip_address text, user_agent text, language text, screen_size text, timezone text
);
create table if not exists page_views (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  page text, full_url text, referrer text, ip_address text,
  user_agent text, language text, screen_size text, timezone text
);
alter table leads enable row level security;
alter table page_views enable row level security;
drop policy if exists "public insert leads" on leads;
drop policy if exists "public read leads" on leads;
drop policy if exists "public update leads" on leads;
drop policy if exists "public insert page_views" on page_views;
drop policy if exists "public read page_views" on page_views;
create policy "public insert leads" on leads for insert with check (true);
create policy "public read leads" on leads for select using (true);
create policy "public update leads" on leads for update using (true);
create policy "public insert page_views" on page_views for insert with check (true);
create policy "public read page_views" on page_views for select using (true);
