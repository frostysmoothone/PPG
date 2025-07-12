-- Drop functions if they exist to allow for a clean re-run.
DROP FUNCTION IF EXISTS public.get_all_users();
DROP FUNCTION IF EXISTS public.create_new_user(jsonb);
DROP FUNCTION IF EXISTS public.update_user_details(uuid, jsonb);
DROP FUNCTION IF EXISTS public.delete_user_by_id(uuid);

-- Function to get all users.
-- NOTE: In a real app, you'd add a check here to ensure only admins can call this.
-- For now, we assume client-side checks are sufficient for this demo.
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS SETOF public.users
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM public.users ORDER BY created_at DESC;
$$;

-- Function to create a new user.
CREATE OR REPLACE FUNCTION public.create_new_user(p_user_data jsonb)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_hashed_password TEXT;
    v_new_user public.users;
BEGIN
    -- Check for existing username or email
    IF EXISTS (
        SELECT 1 FROM public.users
        WHERE username = p_user_data->>'username' OR email = p_user_data->>'email'
    ) THEN
        RAISE EXCEPTION 'Username or email already exists.';
    END IF;

    v_hashed_password := crypt(p_user_data->>'password', gen_salt('bf'));

    INSERT INTO public.users (username, email, password_hash, role)
    VALUES (
        p_user_data->>'username',
        p_user_data->>'email',
        v_hashed_password,
        p_user_data->>'role'
    )
    RETURNING * INTO v_new_user;

    RETURN v_new_user;
END;
$$;

-- Function to update a user's details.
CREATE OR REPLACE FUNCTION public.update_user_details(p_user_id UUID, p_updates jsonb)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_user public.users;
    v_password_update TEXT;
BEGIN
    UPDATE public.users
    SET
        username = COALESCE(p_updates->>'username', username),
        email = COALESCE(p_updates->>'email', email),
        role = COALESCE(p_updates->>'role', role),
        is_active = COALESCE((p_updates->>'isActive')::boolean, is_active),
        password_hash = CASE
            WHEN p_updates->>'password' IS NOT NULL AND p_updates->>'password' != ''
            THEN crypt(p_updates->>'password', gen_salt('bf'))
            ELSE password_hash
        END,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING * INTO v_updated_user;

    RETURN v_updated_user;
END;
$$;

-- Function to delete a user.
CREATE OR REPLACE FUNCTION public.delete_user_by_id(p_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.users WHERE id = p_user_id;
    RETURN FOUND;
END;
$$;
