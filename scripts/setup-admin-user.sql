-- First, let's check if the admin user exists and what the password looks like
SELECT username, email, password_hash, role FROM users WHERE username = 'admin';

-- If the admin user doesn't exist or has issues, let's recreate it
DELETE FROM users WHERE username = 'admin';

-- Insert the admin user with plain text password for development
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@transferglobal.com', 'Admin123!', 'admin');

-- Verify the user was created
SELECT username, email, role, created_at FROM users WHERE username = 'admin';
