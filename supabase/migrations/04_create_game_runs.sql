-- supabase/migrations/04_create_game_runs.sql
-- Step 4: Create public.game_runs table for simulation session records

CREATE TABLE IF NOT EXISTS public.game_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  disaster_type text NOT NULL,
  scenario_id text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  survived boolean,
  score integer,
  raw_total integer,
  max_possible integer,
  score_band text,
  optimal_count integer NOT NULL DEFAULT 0,
  suboptimal_count integer NOT NULL DEFAULT 0,
  total_decisions integer NOT NULL DEFAULT 0,
  duration_seconds integer,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT chk_disaster_type CHECK (disaster_type IN ('earthquake', 'fire', 'flood')),
  CONSTRAINT chk_status CHECK (status IN ('in_progress', 'completed', 'failed', 'abandoned')),
  CONSTRAINT chk_score_range CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  CONSTRAINT chk_score_band CHECK (
    score_band IS NULL OR
    score_band IN ('Ready to Respond', 'Good Awareness', 'Needs Preparation', 'Critically Unprepared')
  ),
  CONSTRAINT chk_duration_non_negative CHECK (duration_seconds IS NULL OR duration_seconds >= 0)
);

CREATE INDEX IF NOT EXISTS idx_game_runs_user_id ON public.game_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_game_runs_started ON public.game_runs(user_id, started_at DESC);
