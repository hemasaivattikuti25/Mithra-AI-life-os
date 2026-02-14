-- 1. Check if RLS is enabled for key tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('tasks', 'habits', 'journal_entries', 'focus_sessions');

-- 2. Verify policies exist enforcing auth.uid()
SELECT policyname, tablename, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public'
  AND (qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%');

-- 3. Confirm permission structure (optional deeper check)
-- This is a manual confirmation that no public roles have access inappropriately
