-- Add pending/approved to candidate_access_requests (if not already present).
-- New rows default to pending = true.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'candidate_access_requests' AND column_name = 'pending'
  ) THEN
    ALTER TABLE public.candidate_access_requests ADD COLUMN pending boolean DEFAULT true NOT NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'candidate_access_requests' AND column_name = 'approved'
  ) THEN
    ALTER TABLE public.candidate_access_requests ADD COLUMN approved boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Destination table when admin approves a request.
CREATE TABLE IF NOT EXISTS public.candidate_approved_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_request_id uuid UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text NOT NULL,
  usa_citizen boolean NOT NULL,
  university text NOT NULL,
  courses text[] NOT NULL DEFAULT '{}',
  terms_accepted boolean NOT NULL DEFAULT true,
  resume_url text,
  approved_at timestamptz NOT NULL DEFAULT now()
);

-- Optional: RLS for admin-only approve/remove.
-- Approve/remove must NOT be allowed for anon users. In production, restrict to authenticated admins
-- (e.g. a role or admin claim). If you have no auth/admin yet, perform approve/remove from a backend
-- using the Supabase service_role key so anon cannot delete or insert into candidate_approved_requests.
--
-- Example (enable after adding auth and an admin role):
-- ALTER TABLE public.candidate_access_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.candidate_approved_requests ENABLE ROW LEVEL SECURITY;
--
-- -- Only authenticated users can read pending requests (adjust for admin-only):
-- CREATE POLICY "Authenticated read candidate_access_requests"
--   ON public.candidate_access_requests FOR SELECT
--   TO authenticated USING (true);
-- -- Only admins can delete (example: use a custom claim or admin table):
-- CREATE POLICY "Admin delete candidate_access_requests"
--   ON public.candidate_access_requests FOR DELETE
--   TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
--
-- CREATE POLICY "Authenticated read candidate_approved_requests"
--   ON public.candidate_approved_requests FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "Admin insert candidate_approved_requests"
--   ON public.candidate_approved_requests FOR INSERT TO authenticated
--   WITH CHECK (auth.jwt() ->> 'role' = 'admin');
