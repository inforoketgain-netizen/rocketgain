-- Create admin-only atomic balance increment function to prevent race conditions
CREATE OR REPLACE FUNCTION public.admin_credit_balance(
  p_user_id uuid,
  p_amount numeric
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
  v_new_balance numeric;
BEGIN
  -- Verify caller is authenticated
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Authentication required');
  END IF;
  
  -- Verify admin role
  IF NOT has_role(v_caller_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Admin access required');
  END IF;
  
  -- Validate amount is positive
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  -- Atomic increment with row lock
  UPDATE profiles
  SET balance = COALESCE(balance, 0) + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  IF v_new_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User profile not found');
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'credited_amount', p_amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_credit_balance(uuid, numeric) TO authenticated;