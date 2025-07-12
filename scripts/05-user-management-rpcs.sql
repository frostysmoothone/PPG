-- Drop functions if they exist to allow for a clean re-run.
DROP FUNCTION IF EXISTS public.get_all_users();
DROP FUNCTION IF EXISTS public.create_new_user(jsonb);
DROP FUNCTION IF EXISTS public.update_user_details(uuid, jsonb);
DROP FUNCTION IF EXISTS public.delete_user_by_id(uuid);

-- Function to get all users, intended for admin use.
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS SETOF public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- This check ensures only an admin can call this function.
    IF (auth.jwt()->>'role') != 'admin' THEN
        RAISE EXCEPTION 'Permission denied: Admin role required';
    END IF;
    RETURN QUERY SELECT * FROM public.users ORDER BY created_at DESC;
END;
$$;

-- Function to create a new user.
CREATE OR REPLACE FUNCTION public.create_new_user(p_user_data jsonb)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_user public.users;
BEGIN
    IF (auth.jwt()->>'role') != 'admin' THEN
        RAISE EXCEPTION 'Permission denied: Admin role required';
    END IF;

    -- Check for existing username or email
    IF EXISTS (SELECT 1 FROM public.users WHERE username = p_user_data->>'username') THEN
        RAISE EXCEPTION 'Username already exists';
    END IF;
    IF EXISTS (SELECT 1 FROM public.users WHERE email = p_user_data->>'email') THEN
        RAISE EXCEPTION 'Email already exists';
    END IF;

    INSERT INTO public.users (username, email, password_hash, role)
    VALUES (
        p_user_data->>'username',
        p_user_data->>'email',
        crypt(p_user_data->>'password', gen_salt('bf')),
        p_user_data->>'role'
    ) RETURNING * INTO new_user;

    RETURN new_user;
END;
$$;

-- Function to update user details.
CREATE OR REPLACE FUNCTION public.update_user_details(p_user_id UUID, p_updates jsonb)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_user public.users;
BEGIN
    IF (auth.jwt()->>'role') != 'admin' THEN
        RAISE EXCEPTION 'Permission denied: Admin role required';
    END IF;

    UPDATE public.users
    SET
        username = COALESCE(p_updates->>'username', username),
        email = COALESCE(p_updates->>'email', email),
        role = COALESCE(p_updates->>'role', role),
        is_active = COALESCE((p_updates->>'isActive')::boolean, is_active),
        password_hash = COALESCE(crypt(p_updates->>'password', gen_salt('bf')), password_hash),
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING * INTO updated_user;

    RETURN updated_user;
END;
$$;

-- Function to delete a user.
CREATE OR REPLACE FUNCTION public.delete_user_by_id(p_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (auth.jwt()->>'role') != 'admin' THEN
        RAISE EXCEPTION 'Permission denied: Admin role required';
    END IF;

    IF auth.uid() = p_user_id THEN
        RAISE EXCEPTION 'Cannot delete your own account';
    END IF;

    DELETE FROM public.users WHERE id = p_user_id;
    RETURN FOUND;
END;
$$;
