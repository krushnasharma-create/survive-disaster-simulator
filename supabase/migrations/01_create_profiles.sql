-- supabase/migrations/01_create_profiles.sql
-- Step 1: Create public.profiles table linked 1:1 to auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,24}$')
);

-- Case-insensitive unique index for username
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles(lower(username));
