-- supabase/migrations/05_create_decisions.sql
-- Step 5: Create public.decisions table for append-only decision audit logging

CREATE TABLE IF NOT EXISTS public.decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.game_runs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  node_id text NOT NULL,
  situation_text text NOT NULL,
  choice_id text NOT NULL,
  choice_label text NOT NULL,
  is_correct boolean NOT NULL,
  score_impact integer NOT NULL,
  time_bonus integer NOT NULL DEFAULT 0,
  remaining_seconds integer,
  consequence_text text NOT NULL,
  insight text NOT NULL,
  insight_source text NOT NULL,
  next_node_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_run_step_order UNIQUE (run_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_decisions_run_step ON public.decisions(run_id, step_order ASC);
CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON public.decisions(user_id);
