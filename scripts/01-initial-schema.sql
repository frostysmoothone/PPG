-- Drop existing objects to ensure a clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_default_admin();
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP TABLE IF EXISTS public.profiles;


-- 1. Create the profiles table to store public user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'user',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS Policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can see and update their own profile
CREATE POLICY "Users can manage their own profile"
ON public.profiles FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can see and update all profiles
CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);


-- 3. Function to create a profile for a new user
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, role)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'username',
        COALESCE(new.raw_user_meta_data->>'role', 'user')
    );
    RETURN new;
END;
$$;

-- 4. Trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- No more automatic admin creation. This will be done manually.
