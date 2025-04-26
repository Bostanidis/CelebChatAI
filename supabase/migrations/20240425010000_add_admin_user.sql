-- Add admin tier to subscription_tier check constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_subscription_tier_check 
CHECK (subscription_tier IN ('FREE', 'PRO', 'ULTRA', 'ADMIN'));

-- Update your profile to ADMIN tier
UPDATE profiles 
SET subscription_tier = 'ADMIN' 
WHERE email = 'alexandrosbostanidis09@gmail.com';

-- Update message limits for admin
DO $$ 
BEGIN
  -- Add comment to document admin privileges
  COMMENT ON TABLE profiles IS 'User profiles with subscription tiers. ADMIN tier has unlimited access and special privileges.';
END $$; 