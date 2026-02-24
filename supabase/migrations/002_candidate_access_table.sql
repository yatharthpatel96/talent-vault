-- Candidate Access form submissions (/candidate/access)
-- Run this in Supabase Dashboard → SQL Editor
-- No RLS on this table: anyone can insert (and read/update/delete per Supabase defaults).
--
-- If you already enabled RLS on this table, run this in SQL Editor to turn it off:
--   ALTER TABLE public.candidate_access_requests DISABLE ROW LEVEL SECURITY;
--   DROP POLICY IF EXISTS "Allow insert for candidate access form" ON public.candidate_access_requests;

-- If you already created this table with usa_citizen as text, run this once then skip the CREATE TABLE below:
-- ALTER TABLE public.candidate_access_requests ALTER COLUMN usa_citizen TYPE boolean USING (usa_citizen = 'yes');

-- phone is text so we can store any format: +1 (555) 123-4567, spaces, dashes, etc.
-- resume_url stores the Supabase Storage URL after uploading the PDF/file (see Storage bucket below).
CREATE TABLE IF NOT EXISTS public.candidate_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at timestamptz DEFAULT now()
);

-- Resume files: create a Storage bucket and allow uploads.
-- PDFs are uploaded here; we save the public URL in resume_url.
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow anon upload to resumes bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Allow public read resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes');