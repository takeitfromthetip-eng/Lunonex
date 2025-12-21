-- Update owner display name to Jacob Morris
UPDATE users 
SET display_name = 'Jacob Morris'
WHERE email = 'polotuspossumus@gmail.com';

-- Verify the update
SELECT email, username, display_name, use_real_name 
FROM users 
WHERE email = 'polotuspossumus@gmail.com';
