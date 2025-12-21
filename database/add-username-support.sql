-- Add username and display name support to users table
-- This allows users to choose between showing their username or real name

-- Add username column (unique identifier users choose)
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add display_name column (real name or preferred display name)
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add preference toggle (true = show real name, false = show username)
ALTER TABLE users ADD COLUMN IF NOT EXISTS use_real_name BOOLEAN DEFAULT false;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Set default usernames for existing users (email prefix)
UPDATE users 
SET username = SPLIT_PART(email, '@', 1) 
WHERE username IS NULL AND email IS NOT NULL;

-- Set owner username
UPDATE users 
SET username = 'polotuspossumus', 
    display_name = 'polotuspossumus',
    use_real_name = false
WHERE email = 'polotuspossumus@gmail.com';

-- Verify
SELECT email, username, display_name, use_real_name 
FROM users 
WHERE email = 'polotuspossumus@gmail.com';
