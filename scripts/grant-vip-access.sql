-- Grant VIP Access to Atolbert66@gmail.com
-- Run this in your Supabase SQL Editor

-- Update user to LIFETIME_VIP tier
UPDATE users 
SET 
  tier = 'LIFETIME_VIP',
  "isOwner" = false
WHERE email = 'Atolbert66@gmail.com';

-- If user doesn't exist yet, they'll get VIP on signup
-- You can also create the user directly:
/*
INSERT INTO users (email, username, "displayName", "passwordHash", tier, "isOwner")
VALUES (
  'Atolbert66@gmail.com',
  'atolbert66',
  'Atolbert',
  '$2b$10$placeholder', -- They'll set password on first login
  'LIFETIME_VIP',
  false
)
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';
*/

-- Verify the change
SELECT id, email, username, tier, "isOwner" 
FROM users 
WHERE email = 'Atolbert66@gmail.com';
