-- =====================================================
-- FIX 1: Secure deduct_balance function
-- Add caller verification to prevent balance theft
-- =====================================================
CREATE OR REPLACE FUNCTION public.deduct_balance(p_user_id uuid, p_amount numeric)
RETURNS TABLE(success boolean, new_balance numeric, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance numeric;
  v_new_balance numeric;
  v_caller_id uuid;
BEGIN
  -- Get caller's user ID
  v_caller_id := auth.uid();
  
  -- CRITICAL: Verify caller is authenticated
  IF v_caller_id IS NULL THEN
    RETURN QUERY SELECT false, 0::numeric, 'Authentication required'::text;
    RETURN;
  END IF;
  
  -- CRITICAL: Only allow users to deduct from their own account
  IF v_caller_id != p_user_id THEN
    RETURN QUERY SELECT false, 0::numeric, 'Unauthorized: Can only deduct from own account'::text;
    RETURN;
  END IF;
  
  -- Lock the row for update to prevent race conditions
  SELECT balance INTO v_current_balance
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Check if user exists
  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT false, 0::numeric, 'User profile not found'::text;
    RETURN;
  END IF;
  
  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN QUERY SELECT false, v_current_balance, 'Insufficient balance'::text;
    RETURN;
  END IF;
  
  -- Check amount is positive
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT false, v_current_balance, 'Amount must be positive'::text;
    RETURN;
  END IF;
  
  -- Update atomically
  UPDATE public.profiles
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN QUERY SELECT true, v_new_balance, NULL::text;
END;
$$;

-- =====================================================
-- FIX 2: Create secure referral creation function
-- Replaces vulnerable direct INSERT policy
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_referral(p_referral_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id uuid;
  v_referred_id uuid;
  v_commission_rate numeric;
BEGIN
  v_referred_id := auth.uid();
  
  -- Validate user is authenticated
  IF v_referred_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Check if already referred
  IF EXISTS (SELECT 1 FROM referrals WHERE referred_id = v_referred_id) THEN
    RAISE EXCEPTION 'User already has a referrer';
  END IF;
  
  -- Look up referrer by code from profiles table
  SELECT user_id INTO v_referrer_id
  FROM profiles
  WHERE referral_code = p_referral_code;
  
  IF v_referrer_id IS NULL THEN
    RAISE EXCEPTION 'Invalid referral code';
  END IF;
  
  -- Prevent self-referral
  IF v_referrer_id = v_referred_id THEN
    RAISE EXCEPTION 'Cannot refer yourself';
  END IF;
  
  -- Use default commission rate (don't trust client)
  v_commission_rate := 5;
  
  INSERT INTO referrals (
    referrer_id,
    referred_id,
    referral_code,
    commission_rate,
    status
  ) VALUES (
    v_referrer_id,
    v_referred_id,
    p_referral_code,
    v_commission_rate,
    'active'
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_referral(text) TO authenticated;

-- Drop the vulnerable INSERT policy
DROP POLICY IF EXISTS "Allow insert referrals" ON public.referrals;