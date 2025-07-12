-- Drop functions if they exist to allow for a clean re-run.
DROP FUNCTION IF EXISTS public.handle_login(text, text);
DROP FUNCTION IF EXISTS public.handle_logout(text);
DROP FUNCTION IF EXISTS public.verify_session(text);

-- Function to handle user login.
CREATE OR REPLACE FUNCTION public.handle_login(p_username_or_email TEXT, p_password TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user public.users;
    v_session_token TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    SELECT * INTO v_user
    FROM public.users
    WHERE (username = p_username_or_email OR email = p_username_or_email) AND is_active = true;

    IF NOT FOUND OR v_user.password_hash != crypt(p_password, v_user.password_hash) THEN
        RETURN NULL; -- Return null for invalid credentials
    END IF;

    v_session_token := extensions.uuid_generate_v4()::text;
    v_expires_at := NOW() + INTERVAL '8 hours';

    INSERT INTO public.user_sessions (user_id, session_token, expires_at)
    VALUES (v_user.id, v_session_token, v_expires_at);

    RETURN json_build_object(
        'user', json_strip_nulls(json_build_object(
            'id', v_user.id,
            'username', v_user.username,
            'email', v_user.email,
            'role', v_user.role,
            'isActive', v_user.is_active,
            'createdAt', v_user.created_at,
            'updatedAt', v_user.updated_at
        )),
        'session_token', v_session_token
    );
END;
$$;

-- Function to handle user logout.
CREATE OR REPLACE FUNCTION public.handle_logout(p_session_token TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.user_sessions WHERE session_token = p_session_token;
END;
$$;

-- Function to verify a session token is valid.
CREATE OR REPLACE FUNCTION public.verify_session(p_session_token TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session public.user_sessions;
    v_user public.users;
BEGIN
    SELECT * INTO v_session FROM public.user_sessions
    WHERE session_token = p_session_token AND expires_at > NOW();

    IF NOT FOUND THEN
        DELETE FROM public.user_sessions WHERE session_token = p_session_token; -- Clean up expired
        RETURN NULL;
    END IF;

    SELECT * INTO v_user FROM public.users WHERE id = v_session.user_id;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    RETURN json_strip_nulls(json_build_object(
        'id', v_user.id,
        'username', v_user.username,
        'email', v_user.email,
        'role', v_user.role,
        'isActive', v_user.is_active,
        'createdAt', v_user.created_at,
        'updatedAt', v_user.updated_at
    ));
END;
$$;
