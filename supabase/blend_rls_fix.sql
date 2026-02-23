-- NUCLEAR RLS RESET FOR BLEND
-- Run this in Supabase SQL Editor

ALTER TABLE public.workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies
    WHERE tablename IN ('workspaces', 'workspace_members')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.check_membership(uuid);

CREATE POLICY "workspaces_select" ON public.workspaces FOR SELECT USING (
  created_by = auth.uid() OR id IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);
CREATE POLICY "workspaces_insert" ON public.workspaces FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "workspaces_update" ON public.workspaces FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "workspaces_delete" ON public.workspaces FOR DELETE USING (created_by = auth.uid());

CREATE POLICY "members_select" ON public.workspace_members FOR SELECT USING (
  user_id = auth.uid() OR workspace_id IN (
    SELECT id FROM public.workspaces WHERE created_by = auth.uid()
  )
);
CREATE POLICY "members_insert" ON public.workspace_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "members_delete" ON public.workspace_members FOR DELETE USING (
  user_id = auth.uid() OR workspace_id IN (
    SELECT id FROM public.workspaces WHERE created_by = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_wm_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wm_workspace_id ON public.workspace_members(workspace_id);
