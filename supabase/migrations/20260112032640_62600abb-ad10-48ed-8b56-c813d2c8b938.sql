-- Create payment_methods table to store configurable payment information
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL, -- 'bitcoin', 'paypal', 'bank'
  icon text NOT NULL DEFAULT 'CreditCard',
  color text NOT NULL DEFAULT 'bg-primary',
  is_active boolean NOT NULL DEFAULT true,
  -- Payment details (JSON for flexibility)
  details jsonb NOT NULL DEFAULT '{}',
  -- Fee configuration
  fee_percent numeric NOT NULL DEFAULT 0,
  fee_fixed numeric NOT NULL DEFAULT 0,
  -- Ordering
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Anyone can view active payment methods
CREATE POLICY "Anyone can view active payment methods"
ON public.payment_methods
FOR SELECT
USING (is_active = true);

-- Admins can manage all payment methods
CREATE POLICY "Admins can view all payment methods"
ON public.payment_methods
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert payment methods"
ON public.payment_methods
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payment methods"
ON public.payment_methods
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete payment methods"
ON public.payment_methods
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payment methods
INSERT INTO public.payment_methods (name, type, icon, color, details, fee_percent, sort_order) VALUES
('Bitcoin', 'bitcoin', 'Bitcoin', 'bg-orange-500', '{"address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", "network": "Bitcoin (BTC)"}', 0, 1),
('PayPal', 'paypal', 'CreditCard', 'bg-blue-500', '{"email": "cadjageres687@gmail.com", "note": "Envoyez en tant que \"Entre proche\" (Friends and Family)"}', 0, 2),
('Virement Bancaire', 'bank', 'Building2', 'bg-green-500', '{"iban": "FR76 XXXX XXXX XXXX XXXX XXXX XXX", "bic": "XXXXXXXX", "bankName": "Nom de la banque", "accountName": "Nom du titulaire"}', 0, 3);