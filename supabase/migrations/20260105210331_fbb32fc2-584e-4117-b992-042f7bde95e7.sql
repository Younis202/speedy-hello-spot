-- Add realized_value column for actual revenue received from deals
ALTER TABLE public.deals 
ADD COLUMN realized_value numeric NOT NULL DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.deals.realized_value IS 'الدخل الفعلي اللي دخل من المصلحة';