-- TradeMax Final CRM Schema
-- Supabase SQL Editor 运行本文件。重复运行也安全。

create extension if not exists "uuid-ossp";

create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  visitor_id text,
  name text,
  wechat text,
  whatsapp text,
  email text,
  registered text,
  account_type text,
  interest text,
  source_page text,
  notes text,
  status text default '新客户',
  lead_score int default 0,
  visit_count int default 0,
  question_count int default 0,
  ip_address text,
  country text,
  country_code text,
  city text,
  region text,
  user_agent text,
  language text,
  screen_size text,
  timezone text
);

create table if not exists page_views (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  visitor_id text,
  page text,
  full_url text,
  referrer text,
  ip_address text,
  country text,
  country_code text,
  city text,
  region text,
  user_agent text,
  language text,
  screen_size text,
  timezone text
);

create table if not exists chat_logs (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  visitor_id text,
  page text,
  question text,
  answer text,
  ip_address text,
  country text,
  country_code text,
  city text,
  region text,
  user_agent text,
  language text
);

-- If you already created old tables, add missing columns safely
alter table leads add column if not exists visitor_id text;
alter table leads add column if not exists country text;
alter table leads add column if not exists country_code text;
alter table leads add column if not exists city text;
alter table leads add column if not exists region text;
alter table leads add column if not exists lead_score int default 0;
alter table leads add column if not exists visit_count int default 0;
alter table leads add column if not exists question_count int default 0;

alter table page_views add column if not exists visitor_id text;
alter table page_views add column if not exists country text;
alter table page_views add column if not exists country_code text;
alter table page_views add column if not exists city text;
alter table page_views add column if not exists region text;

alter table leads enable row level security;
alter table page_views enable row level security;
alter table chat_logs enable row level security;

drop policy if exists "public insert leads" on leads;
drop policy if exists "public read leads" on leads;
drop policy if exists "public update leads" on leads;
drop policy if exists "public insert page_views" on page_views;
drop policy if exists "public read page_views" on page_views;
drop policy if exists "public insert chat_logs" on chat_logs;
drop policy if exists "public read chat_logs" on chat_logs;

create policy "public insert leads" on leads for insert with check (true);
create policy "public read leads" on leads for select using (true);
create policy "public update leads" on leads for update using (true);

create policy "public insert page_views" on page_views for insert with check (true);
create policy "public read page_views" on page_views for select using (true);

create policy "public insert chat_logs" on chat_logs for insert with check (true);
create policy "public read chat_logs" on chat_logs for select using (true);
