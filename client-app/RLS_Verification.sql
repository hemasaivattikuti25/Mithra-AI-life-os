-- VERIFICATION SQL --
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('tasks','habits','journal_entries','focus_sessions');

SELECT policyname, tablename, cmd, qual, with_check 
FROM pg_policies
WHERE tablename IN ('tasks','habits','journal_entries','focus_sessions');

-- HARDENING SQL (Run if verification returns false) --
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

-- Ensure policy strictly enforces auth.uid()
-- Example for Tasks (Repeat for others if missing)
-- CREATE POLICY "Users can only access their own tasks" ON tasks 
-- FOR ALL USING (auth.uid()::text = user_id);
