
-- 🔒 SUPABASE RLS HARDENING 🔒
-- Run this SQL in your Supabase SQL Editor.

-- 1. TASKS TABLE --
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  details text,
  list_id text default 'default',
  priority text default 'medium',
  completed boolean default false,
  starred boolean default false,
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tasks enable row level security;

create policy "Users can view their own tasks" 
on tasks for select 
using (auth.uid() = user_id);

create policy "Users can insert their own tasks" 
on tasks for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own tasks" 
on tasks for update 
using (auth.uid() = user_id)
with check (auth.uid() = user_id); -- Important! Prevents changing ownership

create policy "Users can delete their own tasks" 
on tasks for delete 
using (auth.uid() = user_id);

-- 2. JOURNAL ENTRIES --
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  content text not null,
  mood text,
  tags text,
  mood_score int,
  embedding vector(768), -- For RAG
  date date default CURRENT_DATE,
  created_at timestamptz default now()
);

alter table journal_entries enable row level security;

create policy "Users can private journal entries" 
on journal_entries for all 
using (auth.uid() = user_id);

-- 3. HABITS (Implied requirement) --
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  target_count int default 1,
  current_streak int default 0,
  frequency text default 'daily',
  created_at timestamptz default now()
);

alter table habits enable row level security;

create policy "Users can manage habits" 
on habits for all 
using (auth.uid() = user_id);

-- 4. FOCUS SESSIONS (Implied requirement) --
create table if not exists focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  duration int not null, -- minutes
  mode text default 'pomodoro',
  started_at timestamptz default now(),
  completed boolean default false
);

alter table focus_sessions enable row level security;

create policy "Users can log focus sessions" 
on focus_sessions for all 
using (auth.uid() = user_id);

-- 5. FUNCTION for RAG (Fixing RPC security) --
create or replace function match_journal_entries (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_user_id uuid DEFAULT auth.uid()
)
returns table (
  id uuid,
  content text,
  mood_score int,
  similarity float
)
language plpgsql
security result -- Or security definer, but be careful
as $$
begin
  return query
  select
    journal_entries.id,
    journal_entries.content,
    journal_entries.mood_score,
    1 - (journal_entries.embedding <=> query_embedding) as similarity
  from journal_entries
  where 1 - (journal_entries.embedding <=> query_embedding) > match_threshold
  and journal_entries.user_id = filter_user_id -- STRICTLY enforce user scoping here
  order by journal_entries.embedding <=> query_embedding
  limit match_count;
end;
$$;
