-- supabase/migrations/02_create_player_stats.sql
-- Step 2: Create public.player_stats table for personal preparedness metrics

CREATE TABLE IF NOT EXISTS public.player_stats (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_runs integer NOT NULL DEFAULT 0,
  completed_runs integer NOT NULL DEFAULT 0,
  survived_runs integer NOT NULL DEFAULT 0,
  average_score numeric(5,2) NOT NULL DEFAULT 0.00,
  best_score integer NOT NULL DEFAULT 0,
  earthquake_runs integer NOT NULL DEFAULT 0,
  fire_runs integer NOT NULL DEFAULT 0,
  flood_runs integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_total_runs_non_negative CHECK (total_runs >= 0),
  CONSTRAINT chk_completed_runs_non_negative CHECK (completed_runs >= 0),
  CONSTRAINT chk_survived_runs_non_negative CHECK (survived_runs >= 0),
  CONSTRAINT chk_avg_score_range CHECK (average_score >= 0.00 AND average_score <= 100.00),
  CONSTRAINT chk_best_score_range CHECK (best_score >= 0 AND best_score <= 100),
  CONSTRAINT chk_disaster_counts_non_negative CHECK (
    earthquake_runs >= 0 AND fire_runs >= 0 AND flood_runs >= 0
  )
);
