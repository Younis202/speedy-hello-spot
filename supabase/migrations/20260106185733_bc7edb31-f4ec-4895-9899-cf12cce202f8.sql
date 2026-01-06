-- Add owner field to deals table for distinguishing between personal deals and partner deals
ALTER TABLE public.deals ADD COLUMN owner TEXT DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.deals.owner IS 'Name of the partner/friend who owns this deal, NULL means it is your own deal';