-- Create investment_plans table
CREATE TABLE public.investment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT 'Zap',
  min_amount numeric NOT NULL,
  max_amount numeric NOT NULL,
  daily_rate numeric NOT NULL,
  duration_days integer NOT NULL,
  color text NOT NULL DEFAULT 'blue',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can view active plans
CREATE POLICY "Anyone can view active plans"
ON public.investment_plans
FOR SELECT
USING (is_active = true);

-- Admins can view all plans
CREATE POLICY "Admins can view all plans"
ON public.investment_plans
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert plans
CREATE POLICY "Admins can insert plans"
ON public.investment_plans
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update plans
CREATE POLICY "Admins can update plans"
ON public.investment_plans
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete plans
CREATE POLICY "Admins can delete plans"
ON public.investment_plans
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_investment_plans_updated_at
BEFORE UPDATE ON public.investment_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default plans
INSERT INTO public.investment_plans (name, icon, min_amount, max_amount, daily_rate, duration_days, color, sort_order) VALUES
('Starter', 'Zap', 50, 499, 2.5, 30, 'blue', 1),
('Growth', 'TrendingUp', 500, 2499, 3.5, 45, 'green', 2),
('Premium', 'Rocket', 2500, 9999, 4.5, 60, 'purple', 3),
('Elite', 'Crown', 10000, 50000, 5.5, 90, 'yellow', 4);