-- supabase/migrations/03_create_auth_trigger.sql
-- Step 3: Create hardened auth.users provisioning trigger function

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_raw_username text;
  v_username text;
  v_display_name text;
BEGIN
  -- Extract username from raw user metadata provided at signup
  v_raw_username := NEW.raw_user_meta_data->>'username';
  
  IF v_raw_username IS NULL THEN
    RAISE EXCEPTION 'Username is required for registration.';
  END IF;

  v_username := trim(v_raw_username);

  -- Validate username format
  IF NOT (v_username ~ '^[a-zA-Z0-9_]{3,24}$') THEN
    RAISE EXCEPTION 'Username must be 3-24 alphanumeric characters or underscores.';
  END IF;

  -- Extract display name (fallback to username if omitted)
  v_display_name := trim(COALESCE(NEW.raw_user_meta_data->>'display_name', v_username));

  -- Insert profile (unique constraint will catch duplicate usernames)
  INSERT INTO public.profiles (id, username, display_name, created_at, updated_at)
  VALUES (NEW.id, v_username, v_display_name, now(), now());

  -- Initialize personal player stats
  INSERT INTO public.player_stats (user_id, updated_at)
  VALUES (NEW.id, now());

  RETURN NEW;
END;
$$;

-- Restrict function execution permissions to supabase auth admin
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
