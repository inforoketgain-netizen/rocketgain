-- Create secure admin function to process transactions atomically
CREATE OR REPLACE FUNCTION public.admin_process_transaction(
  p_transaction_id uuid,
  p_new_status text
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction record;
  v_caller_id uuid;
  v_current_balance numeric;
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
  
  -- Validate new status
  IF p_new_status NOT IN ('completed', 'rejected') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid status. Must be completed or rejected');
  END IF;
  
  -- Lock and verify transaction state
  SELECT * INTO v_transaction 
  FROM transactions
  WHERE id = p_transaction_id AND status = 'pending'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Transaction not found or already processed');
  END IF;
  
  -- Update transaction status
  UPDATE transactions 
  SET status = p_new_status
  WHERE id = p_transaction_id;
  
  -- If approving a deposit, add balance
  IF p_new_status = 'completed' AND v_transaction.type = 'deposit' THEN
    -- Lock user profile row
    SELECT balance INTO v_current_balance
    FROM profiles
    WHERE user_id = v_transaction.user_id
    FOR UPDATE;
    
    IF v_current_balance IS NULL THEN
      -- Rollback transaction status
      UPDATE transactions SET status = 'pending' WHERE id = p_transaction_id;
      RETURN json_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    v_new_balance := COALESCE(v_current_balance, 0) + v_transaction.amount;
    
    UPDATE profiles
    SET balance = v_new_balance, updated_at = now()
    WHERE user_id = v_transaction.user_id;
    
    RETURN json_build_object(
      'success', true, 
      'transaction_id', p_transaction_id,
      'new_balance', v_new_balance,
      'amount', v_transaction.amount,
      'type', v_transaction.type
    );
  END IF;
  
  -- If rejecting a withdrawal, refund the balance (it was already deducted)
  IF p_new_status = 'rejected' AND v_transaction.type = 'withdrawal' THEN
    SELECT balance INTO v_current_balance
    FROM profiles
    WHERE user_id = v_transaction.user_id
    FOR UPDATE;
    
    IF v_current_balance IS NULL THEN
      UPDATE transactions SET status = 'pending' WHERE id = p_transaction_id;
      RETURN json_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    v_new_balance := COALESCE(v_current_balance, 0) + v_transaction.amount;
    
    UPDATE profiles
    SET balance = v_new_balance, updated_at = now()
    WHERE user_id = v_transaction.user_id;
    
    RETURN json_build_object(
      'success', true, 
      'transaction_id', p_transaction_id,
      'refunded_amount', v_transaction.amount,
      'new_balance', v_new_balance,
      'type', v_transaction.type
    );
  END IF;
  
  -- For other cases (approved withdrawal, rejected deposit), just return success
  RETURN json_build_object(
    'success', true, 
    'transaction_id', p_transaction_id,
    'type', v_transaction.type
  );
END;
$$;