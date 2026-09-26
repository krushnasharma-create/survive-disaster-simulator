-- supabase/migrations/07_enable_rls_and_policies.sql
-- Step 7: Enable RLS and define granular, private-only policies on all tables

-- 1. Enable Row Level Security on all application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

-- 2. Granular RLS Policies for public.profiles
-- Authenticated users can only read, create, or update their own profile.
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Granular RLS Policies for public.player_stats
-- Authenticated users can only read their own stats. Updates/inserts are strictly trigger-driven.
CREATE POLICY "player_stats_select_own"
  ON public.player_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Granular RLS Policies for public.game_runs
-- Authenticated users can only read their own runs, create new in_progress runs,
-- and update their own runs while still in_progress.
CREATE POLICY "game_runs_select_own"
  ON public.game_runs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "game_runs_insert_own_active"
  ON public.game_runs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'in_progress');

CREATE POLICY "game_runs_update_own_active"
  ON public.game_runs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'in_progress')
  WITH CHECK (auth.uid() = user_id);

-- 5. Granular RLS Policies for public.decisions
-- Authenticated users can only read their own decisions and insert decisions
-- into their own active in_progress runs. Updates and deletes are prohibited.
CREATE POLICY "decisions_select_own"
  ON public.decisions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "decisions_insert_own_active_run"
  ON public.decisions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.game_runs
      WHERE id = decisions.run_id
        AND user_id = auth.uid()
        AND status = 'in_progress'
    )
  );
