-- Create referrals table to track referrals and commissions
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  commission_rate NUMERIC NOT NULL DEFAULT 5,
  total_commission NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view referrals where they are the referrer
CREATE POLICY "Users can view own referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id);

-- Users can view if they were referred
CREATE POLICY "Users can view their referral status"
ON public.referrals
FOR SELECT
USING (auth.uid() = referred_id);

-- Insert policy for new referrals (when someone signs up with a referral code)
CREATE POLICY "Allow insert referrals"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() = referred_id);

-- Add referral_code column to profiles for easier lookup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Create function to generate referral code from user_id
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.referral_code := UPPER(SUBSTRING(REPLACE(NEW.user_id::text, '-', ''), 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-generate referral code on profile creation
CREATE TRIGGER set_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_referral_code();