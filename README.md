# Talent Vault

Talent Vault is a role-based access platform for candidates, professors, and employers. Request access, get approved by an admin, set your password, and sign in to your role-specific dashboard.

## Tech stack

- **Frontend:** React (Vite), React Router, CSS
- **Backend:** Supabase (Postgres, Storage, Edge Functions)
- **Auth:** Custom logins table with JWT; password set via one-time link after approval

## Local setup

1. **Install and run**
   ```bash
   npm install
   npm run dev
   ```

2. **Environment variables**  
   Create `.env` in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Supabase setup

### 1. Create tables

In Supabase Dashboard → SQL Editor, run the contents of:

- `supabase/migrations/001_schema.sql`

This creates: `roles`, `candidate_access_requests`, `professor_access_requests`, `employer_access_requests`, `rejected_*` tables, `candidate_profiles`, `professor_profiles`, `employer_profiles`, `logins`, `password_setup_tokens`, RLS policies, and storage bucket + policies for `resumes`.

If the storage bucket already exists or the script fails on storage, create the bucket manually:

- Storage → New bucket → name: `resumes`, public: yes  
- Policies: allow INSERT for anon, SELECT for public on bucket `resumes`.

### 2. Create the first admin user

After running the migration, add one admin login (replace the hash with your own):

```bash
# Generate a bcrypt hash (Node): npm install -g bcryptjs-cli  OR  use an online bcrypt generator
# Example: hash of "YourSecurePassword" -> $2a$10$...
```

Then in SQL Editor:

```sql
INSERT INTO public.logins (email, password_hash, role_id)
SELECT 'admin@yourdomain.com', '$2a$10$YOUR_BCRYPT_HASH_HERE', id FROM public.roles WHERE name = 'admin' LIMIT 1;
```

### 3. Edge Functions secrets

In Supabase Dashboard → Edge Functions → Secrets, set:

- `SUPABASE_URL` — your project URL (often set automatically)
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (never expose in frontend)
- `JWT_SECRET` — a long random string for signing JWTs (e.g. `openssl rand -base64 32`)
- `SITE_URL` — frontend base URL (e.g. `http://localhost:5173` or your production URL)
- For invite emails (optional): `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

### 4. Deploy Edge Functions

From the project root:

```bash
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy login
supabase functions deploy create-password
supabase functions deploy get-profile
supabase functions deploy list-access-requests
supabase functions deploy approve-request
supabase functions deploy reject-request
```

If you don’t have Resend configured, approve still works; the admin can copy the set-password link from the function response (returned when email is not sent).

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Single login form; redirects by role (candidate → /candidate, etc.) |
| `/request-access` | Request access as candidate / professor / employer; resume upload for candidates |
| `/set-password` | Set password via one-time link (`?token=...`) after approval |
| `/admin` | Admin dashboard: tabs for pending requests, Approve / Reject |
| `/candidate`, `/professor`, `/employer` | Role-specific pages with profile info |

## Theme

- **Navy Blue** (`#0B1F3B`) — headers, primary text  
- **White** — backgrounds  
- **Sky Blue** (`#3B82F6`) — links, buttons, accents  
