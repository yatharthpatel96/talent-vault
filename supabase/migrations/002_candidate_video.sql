-- Candidate video upload: add video_url column and candidate-videos storage bucket.
-- Run in Supabase SQL Editor after 001_schema.sql.

ALTER TABLE public.candidate_access_requests
  ADD COLUMN IF NOT EXISTS video_url text;

ALTER TABLE public.rejected_candidate_requests
  ADD COLUMN IF NOT EXISTS video_url text;

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS video_url text;

-- Storage bucket for candidate videos (60–90 seconds, max 30 MB, moderate quality).
INSERT INTO storage.buckets (id, name, public) VALUES ('candidate-videos', 'candidate-videos', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Allow anon upload candidate-videos" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'candidate-videos');
CREATE POLICY "Allow public read candidate-videos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'candidate-videos');
