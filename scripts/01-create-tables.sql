-- USERS --------------------------------------------------------------
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
  id             uuid primary key DEFAULT extensions.uuid_generate_v4(),
  username       text unique not null,
  email          text unique not null,
  password_hash  text not null,
  role           text not null default 'user',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
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
  id            uuid primary key default extensions.uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  session_token text unique not null,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);

-- Create an index on user_id for faster session lookups.
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
