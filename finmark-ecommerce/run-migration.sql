-- Manual Google OAuth Migration Script
-- Run this in your PostgreSQL database

-- Add Google OAuth columns to users table
ALTER TABLE user_schema.users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500),
ADD COLUMN IF NOT EXISTS name VARCHAR(200);

-- Create index for Google ID lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON user_schema.users(google_id);

-- Update existing users to have a name field based on first_name and last_name
UPDATE user_schema.users 
SET name = CONCAT(first_name, ' ', last_name) 
WHERE name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL);

-- Make password_hash nullable for OAuth users
ALTER TABLE user_schema.users 
ALTER COLUMN password_hash DROP NOT NULL;