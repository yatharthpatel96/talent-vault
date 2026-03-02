-- Talent Vault: full schema (roles, access requests, rejected, profiles, logins, tokens)
-- Run in Supabase SQL Editor. Then enable Storage bucket "resumes" in Dashboard.

-- 1) roles
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);
INSERT INTO public.roles (name) VALUES ('admin'), ('professor'), ('candidate'), ('employer')
ON CONFLICT (name) DO NOTHING;

-- 2) candidate_access_requests
CREATE TABLE IF NOT EXISTS public.candidate_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  resume_url text,
  academic_institution text NOT NULL,
  pending boolean DEFAULT true NOT NULL,
  approved boolean DEFAULT false NOT NULL,
  rejected boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_candidate_access_requests_pending_email_role
  ON public.candidate_access_requests (email, role_id) WHERE pending = true;

-- 3) professor_access_requests
CREATE TABLE IF NOT EXISTS public.professor_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  academic_institution text NOT NULL,
  specialty text NOT NULL,
  pending boolean DEFAULT true NOT NULL,
  approved boolean DEFAULT false NOT NULL,
  rejected boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_professor_access_requests_pending_email_role
  ON public.professor_access_requests (email, role_id) WHERE pending = true;

-- 4) employer_access_requests
CREATE TABLE IF NOT EXISTS public.employer_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  organization text NOT NULL,
  job_title text NOT NULL,
  pending boolean DEFAULT true NOT NULL,
  approved boolean DEFAULT false NOT NULL,
  rejected boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_employer_access_requests_pending_email_role
  ON public.employer_access_requests (email, role_id) WHERE pending = true;

-- 5) rejected_* (copy structure + rejected_at)
CREATE TABLE IF NOT EXISTS public.rejected_candidate_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES public.roles(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  resume_url text,
  academic_institution text NOT NULL,
  pending boolean DEFAULT false NOT NULL,
  approved boolean DEFAULT false NOT NULL,
  rejected boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  rejected_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.rejected_professor_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES public.roles(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  academic_institution text NOT NULL,
  specialty text NOT NULL,
  pending boolean DEFAULT false NOT NULL,
  approved boolean DEFAULT false NOT NULL,
  rejected boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  rejected_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.rejected_employer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES public.roles(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  organization text NOT NULL,
  job_title text NOT NULL,
  pending boolean DEFAULT false NOT NULL,
  approved boolean DEFAULT false NOT NULL,
  rejected boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  rejected_at timestamptz DEFAULT now() NOT NULL
);

-- 6) candidate_profiles
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  resume_url text,
  academic_institution text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 7) professor_profiles
CREATE TABLE IF NOT EXISTS public.professor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  academic_institution text NOT NULL,
  specialty text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 8) employer_profiles
CREATE TABLE IF NOT EXISTS public.employer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  organization text NOT NULL,
  job_title text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 9) logins
CREATE TABLE IF NOT EXISTS public.logins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role_id uuid NOT NULL REFERENCES public.roles(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 10) password_setup_tokens
CREATE TABLE IF NOT EXISTS public.password_setup_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role_id uuid NOT NULL REFERENCES public.roles(id),
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS: roles readable by all (for request form dropdown)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read roles" ON public.roles FOR SELECT TO anon USING (true);

-- RLS: allow anon insert into access_requests only
ALTER TABLE public.candidate_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert candidate_access_requests"
  ON public.candidate_access_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon insert professor_access_requests"
  ON public.professor_access_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon insert employer_access_requests"
  ON public.employer_access_requests FOR INSERT TO anon WITH CHECK (true);

-- Sensitive tables: RLS enabled, no anon policies (Edge Functions use service role only)
ALTER TABLE public.logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_setup_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rejected_candidate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rejected_professor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rejected_employer_requests ENABLE ROW LEVEL SECURITY;

-- Storage bucket for resumes (run in SQL Editor; bucket creation may require Dashboard)
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Allow anon upload resumes" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Allow public read resumes" ON storage.objects FOR SELECT TO public USING (bucket_id = 'resumes');
