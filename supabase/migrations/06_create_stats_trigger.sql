-- supabase/migrations/06_create_stats_trigger.sql
-- Step 6: Create trigger functions to maintain player_stats on run initiation and completion

-- 1. Trigger function to increment total_runs when a game run is initiated
CREATE OR REPLACE FUNCTION public.handle_run_initiation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Increment total initiated runs for the authenticated user
  UPDATE public.player_stats
  SET
    total_runs = total_runs + 1,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Restrict function execution from public and browser roles
REVOKE ALL ON FUNCTION public.handle_run_initiation() FROM PUBLIC;

-- Attach initiation trigger to public.game_runs
DROP TRIGGER IF EXISTS on_game_run_initiated ON public.game_runs;
CREATE TRIGGER on_game_run_initiated
  AFTER INSERT ON public.game_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_run_initiation();


-- 2. Trigger function to update performance stats when a game run reaches completed status
CREATE OR REPLACE FUNCTION public.handle_run_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_score integer;
BEGIN
  -- Only execute when status transitions to 'completed'
  IF (OLD.status = 'in_progress' AND NEW.status = 'completed') THEN
    v_score := COALESCE(NEW.score, 0);

    UPDATE public.player_stats
    SET
      completed_runs = completed_runs + 1,
      survived_runs = survived_runs + (CASE WHEN NEW.survived = true THEN 1 ELSE 0 END),
      best_score = GREATEST(best_score, v_score),
      average_score = ROUND(((average_score * completed_runs + v_score) / (completed_runs + 1)), 2),
      earthquake_runs = earthquake_runs + (CASE WHEN NEW.disaster_type = 'earthquake' THEN 1 ELSE 0 END),
      fire_runs = fire_runs + (CASE WHEN NEW.disaster_type = 'fire' THEN 1 ELSE 0 END),
      flood_runs = flood_runs + (CASE WHEN NEW.disaster_type = 'flood' THEN 1 ELSE 0 END),
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Restrict function execution from public and browser roles (runs strictly as table trigger)
REVOKE ALL ON FUNCTION public.handle_run_completion() FROM PUBLIC;

-- Attach completion trigger to public.game_runs
DROP TRIGGER IF EXISTS on_game_run_completed ON public.game_runs;
CREATE TRIGGER on_game_run_completed
  AFTER UPDATE OF status ON public.game_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_run_completion();
