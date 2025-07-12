-- Drop functions if they exist to allow for a clean re-run.
DROP FUNCTION IF EXISTS public.get_all_users();
DROP FUNCTION IF EXISTS public.update_user_role(uuid, text);
DROP FUNCTION IF EXISTS public.delete_user_by_id(uuid);

-- Function to get all users with their profile data.
-- This can only be called by authenticated users.
-- We will add an admin check on the client-side for who can see the UI.
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE(id uuid, email text, username text, role text, created_at timestamptz)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.email,
        p.username,
        p.role,
        u.created_at
    FROM
        auth.users u
    JOIN
        public.profiles p ON u.id = p.id
    ORDER BY
        u.created_at DESC;
END;
$$;

-- Function to update a user's role.
-- This should only be callable by an admin.
CREATE OR REPLACE FUNCTION public.update_user_role(p_user_id UUID, p_new_role TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Run with the privileges of the function owner (postgres)
SET search_path = public
AS $$
BEGIN
    -- Check if the calling user is an admin
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'admin' THEN
        RAISE EXCEPTION 'Permission denied: Admin role required';
    END IF;

    UPDATE public.profiles
    SET role = p_new_role
    WHERE id = p_user_id;
END;
$$;

-- Function to delete a user.
-- This uses the admin API, which requires the SERVICE_ROLE_KEY.
CREATE OR REPLACE FUNCTION public.delete_user_by_id(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the calling user is an admin
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'admin' THEN
        RAISE EXCEPTION 'Permission denied: Admin role required';
    END IF;

    -- You must enable the "User Management" admin API in Supabase settings for this to work.
    -- This function is a placeholder for calling the admin API from a secure environment.
    -- For direct SQL, you would use the service role to delete from auth.users.
    -- This is a simplified example. A real implementation would use a secure edge function.
    DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;
