-- This script helps you create an admin user for authentication
-- Run this in your Supabase SQL editor or use the Supabase dashboard

-- Note: You should create the admin user through the Supabase Dashboard instead
-- Go to Authentication > Users and click "Add user"
-- Use these credentials:
-- Email: admin@example.com  
-- Password: admin123 (or your preferred secure password)

-- Alternatively, you can use this SQL to check if users exist:
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC;

-- If you need to update a user's email confirmation status:
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email = 'admin@example.com';
