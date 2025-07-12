-- Insert a default admin user with the username 'admin' and password 'Admin123!'.
-- The password is encrypted using the pgcrypto `crypt` and `gen_salt` functions.
-- ON CONFLICT prevents errors if the script is run more than once.
INSERT INTO public.users (username, email, password_hash, role, is_active)
SELECT 'admin', 'admin@transferglobal.com', crypt('Admin123!', gen_salt('bf')), 'admin', true
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'admin');
