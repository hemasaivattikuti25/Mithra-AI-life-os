-- 1. VERIFY RLS IS ENABLED FOR ALL KEY TABLES --
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('tasks', 'habits', 'journal_entries', 'focus_sessions', 'profiles');

-- 2. VERIFY MATCH_JOURNAL_ENTRIES RPC EXISTS --
SELECT routine_name
FROM information_schema.routines
WHERE routine_type = 'FUNCTION'
AND routine_schema = 'public'
AND routine_name = 'match_journal_entries';

-- 3. CHECK VECTOR EXTENSION --
SELECT * FROM pg_extension WHERE extname = 'vector';

-- 4. CREATE UPDATED_AT TRIGGER FUNCTION (Idempotent) --
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. APPLY TRIGGERS (Drop first to avoid errors if re-running) --

-- Profiles Trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Tasks Trigger
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Habits Trigger (Optional but good practice)
DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at
BEFORE UPDATE ON habits
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
