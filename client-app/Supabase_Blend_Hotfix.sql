-- ============================================================
-- BLEND HOTFIX — Run this in Supabase SQL Editor NOW
-- Adds missing RLS policies that were blocking workspace creation
-- ============================================================

-- Allow authenticated users to create workspaces
DROP POLICY IF EXISTS "Create workspaces" ON public.workspaces;
CREATE POLICY "Create workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow anyone to look up workspace by share_link_hash (for join flow)
DROP POLICY IF EXISTS "Lookup workspace by hash" ON public.workspaces;
CREATE POLICY "Lookup workspace by hash" ON public.workspaces
  FOR SELECT USING (true);

-- Allow owners to delete workspaces
DROP POLICY IF EXISTS "Delete workspaces if owner" ON public.workspaces;
CREATE POLICY "Delete workspaces if owner" ON public.workspaces
  FOR DELETE USING (created_by = auth.uid());

-- Allow members to leave (delete themselves from members)
DROP POLICY IF EXISTS "Delete workspace member" ON public.workspace_members;
CREATE POLICY "Delete workspace member" ON public.workspace_members
  FOR DELETE USING (user_id = auth.uid());

-- Done!
