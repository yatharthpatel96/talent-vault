-- Candidate request: remove required academic_institution, add terms_accepted.
-- Run in Supabase SQL Editor after 002_candidate_video.sql.

-- candidate_access_requests: make academic_institution nullable, add terms_accepted
ALTER TABLE public.candidate_access_requests
  ALTER COLUMN academic_institution DROP NOT NULL;
ALTER TABLE public.candidate_access_requests
  ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false NOT NULL;

-- rejected_candidate_requests: same
ALTER TABLE public.rejected_candidate_requests
  ALTER COLUMN academic_institution DROP NOT NULL;
ALTER TABLE public.rejected_candidate_requests
  ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false NOT NULL;

-- candidate_profiles: same (for approved profile copy)
ALTER TABLE public.candidate_profiles
  ALTER COLUMN academic_institution DROP NOT NULL;
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false NOT NULL;
