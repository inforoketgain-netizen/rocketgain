-- Fix PUBLIC_DATA_EXPOSURE: Require authentication to view payment methods
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view active payment methods" ON public.payment_methods;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can view active payment methods" 
ON public.payment_methods 
FOR SELECT 
USING (is_active = true AND auth.uid() IS NOT NULL);