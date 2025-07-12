-- Drop all policies first to ensure a clean slate on re-run.
DROP POLICY IF EXISTS "Allow postgres user full access" ON public.users;
DROP POLICY IF EXISTS "Allow postgres user full access" ON public.user_sessions;

-- Enable RLS and force it for table owners. This is a security best practice.
-- It means even the table owner must abide by RLS policies.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions FORCE ROW LEVEL SECURITY;

-- Since all access will be through SECURITY DEFINER functions,
-- we only need to grant access to the 'postgres' user, which these functions run as.
-- This is a very secure setup as it denies all direct access attempts from the client.

CREATE POLICY "Allow postgres user full access"
ON public.users
FOR ALL
USING (current_user = 'postgres')
WITH CHECK (current_user = 'postgres');

CREATE POLICY "Allow postgres user full access"
ON public.user_sessions
FOR ALL
USING (current_user = 'postgres')
WITH CHECK (current_user = 'postgres');
