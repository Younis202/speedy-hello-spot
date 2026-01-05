-- Create jobs table for recurring income (salaries, freelance work)
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  description TEXT,
  salary_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  pay_frequency TEXT NOT NULL DEFAULT 'monthly', -- weekly, biweekly, monthly, yearly
  hours_per_day NUMERIC DEFAULT 8,
  start_date DATE,
  next_pay_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since app has no auth yet)
CREATE POLICY "Allow public access to jobs" 
ON public.jobs 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add deal structure improvements: contract_type, commission_percentage, success_fee
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'one-time',
ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_fee NUMERIC DEFAULT 0;