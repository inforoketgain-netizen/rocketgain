-- Create atomic balance deduction function to prevent race conditions
CREATE OR REPLACE FUNCTION public.deduct_balance(
  p_user_id uuid,
  p_amount numeric
) RETURNS TABLE(success boolean, new_balance numeric, error_message text) AS $$
DECLARE
  v_current_balance numeric;
  v_new_balance numeric;
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric) TO authenticated;