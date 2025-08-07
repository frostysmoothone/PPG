-- Check current admin user
SELECT username, email, password_hash, role, created_at FROM users WHERE username = 'admin';

-- If there are issues, let's recreate the admin user
-- First delete any existing admin user
DELETE FROM users WHERE username = 'admin' OR email = 'admin@transferglobal.com';

-- Create fresh admin user
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@transferglobal.com', 'Admin123!', 'admin');

-- Verify the user was created correctly
SELECT username, email, password_hash, role, created_at FROM users WHERE username = 'admin';
