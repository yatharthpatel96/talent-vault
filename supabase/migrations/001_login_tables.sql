-- Login database: candidates, employers, professors (login info only)
-- Run this in Supabase Dashboard → SQL Editor
-- RLS enabled, no policies — users have no read/write permission from the app.

-- Candidates (login info only)
CREATE TABLE IF NOT EXISTS public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Employers (login info only)
CREATE TABLE IF NOT EXISTS public.employers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

-- Professors (login info only)
CREATE TABLE IF NOT EXISTS public.professors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;
