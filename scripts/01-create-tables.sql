-- USERS --------------------------------------------------------------
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatically keep updated_at current
create or replace function public.touch_users_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_users_updated on public.users;
create trigger trg_touch_users_updated
before update on public.users
for each row execute function public.touch_users_updated_at();

-- USER_SESSIONS ------------------------------------------------------
DROP TABLE IF EXISTS public.user_sessions CASCADE;
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups.
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON public.user_sessions(session_token);
