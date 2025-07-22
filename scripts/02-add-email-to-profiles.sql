-- 1️⃣ Add an email column to profiles (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN email text NOT NULL DEFAULT '';
  END IF;
END
$$;

-- 2️⃣ Back-fill email for existing users from auth.users
UPDATE public.profiles p
SET    email = u.email
FROM   auth.users u
WHERE  p.id = u.id
  AND  (p.email = '' OR p.email IS NULL);
