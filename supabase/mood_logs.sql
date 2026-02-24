-- ──────────────────────────────────────────────────────────────────────────────
--  mood_logs — Stores user mood check-ins
--  Run this in Supabase SQL Editor → New Query
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.mood_logs (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_value  integer     NOT NULL CHECK (mood_value BETWEEN 1 AND 5),
  mood_label  text,
  note        text,
  logged_at   timestamptz DEFAULT now()
);

ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own mood logs
DROP POLICY IF EXISTS "mood_logs_own" ON public.mood_logs;
CREATE POLICY "mood_logs_own" ON public.mood_logs
  FOR ALL USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_mood_logs_user ON public.mood_logs(user_id, logged_at DESC);
