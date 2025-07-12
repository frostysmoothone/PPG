-- Enable the pgcrypto extension, which provides password hashing functions.
-- This is CRITICAL for the login function to work.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Enable the uuid-ossp extension for generating UUIDs, a common requirement.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
