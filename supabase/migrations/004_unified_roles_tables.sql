-- Unified roles: employer/professor access + approved + profiles + signup_invites.
-- Tables only; no RLS or policies (add permissions later).
-- Run in Supabase Dashboard → SQL Editor.

-- Access request tables (pending)
CREATE TABLE IF NOT EXISTS public.employer_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company text NOT NULL,
  terms_accepted boolean NOT NULL DEFAULT true,
  pending boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.professor_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  university text NOT NULL,
  terms_accepted boolean NOT NULL DEFAULT true,
  pending boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Approved request tables
CREATE TABLE IF NOT EXISTS public.employer_approved_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_request_id uuid UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company text NOT NULL,
  terms_accepted boolean NOT NULL DEFAULT true,
  approved_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.professor_approved_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_request_id uuid UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  university text NOT NULL,
  terms_accepted boolean NOT NULL DEFAULT true,
  approved_at timestamptz NOT NULL DEFAULT now()
);

-- Profile tables (linked to auth user after signup)
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  email text,
  phone text,
  message text,
  usa_citizen boolean,
  university text,
  courses text[] DEFAULT '{}',
  resume_url text,
  terms_accepted boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  email text,
  phone text,
  company text,
  terms_accepted boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.professor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  email text,
  phone text,
  university text,
  terms_accepted boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- One-time create-account invite link
CREATE TABLE IF NOT EXISTS public.signup_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  approved_request_id uuid,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz
);
