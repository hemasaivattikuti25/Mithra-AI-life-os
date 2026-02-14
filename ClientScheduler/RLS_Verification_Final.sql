-- RLS VERIFICATION QUERY --
SELECT
    tablename,
    rowsecurity
FROM
    pg_tables
WHERE
    schemaname = 'public'
    AND tablename IN ('profiles', 'tasks', 'habits', 'journal_entries');

-- POLICY VERIFICATION QUERY --
SELECT
    *
FROM
    pg_policies
WHERE
    tablename IN ('profiles', 'tasks', 'habits', 'journal_entries');
