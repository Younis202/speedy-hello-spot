-- Create deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'أخرى',
  description TEXT,
  expected_value NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EGP',
  stage TEXT NOT NULL DEFAULT 'جديد',
  priority TEXT NOT NULL DEFAULT 'متوسط',
  next_action TEXT,
  next_action_date TIMESTAMPTZ,
  contacts JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create debts table
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creditor_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EGP',
  monthly_payment NUMERIC NOT NULL DEFAULT 0,
  remaining_amount NUMERIC,
  due_date DATE,
  pressure_level TEXT NOT NULL DEFAULT 'متوسط',
  notes TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create daily_moves table
CREATE TABLE public.daily_moves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 1,
  move_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create calls table
CREATE TABLE public.calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  phone_number TEXT,
  call_type TEXT NOT NULL DEFAULT 'صادر',
  result TEXT,
  notes TEXT,
  follow_up_date TIMESTAMPTZ,
  call_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create deal_events table
CREATE TABLE public.deal_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'ملاحظة',
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create deal_files table
CREATE TABLE public.deal_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create deal_tasks table
CREATE TABLE public.deal_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 1,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ai_conversations table
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Create public access policies (for now without auth)
CREATE POLICY "Allow public access to deals" ON public.deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to debts" ON public.debts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to daily_moves" ON public.daily_moves FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to calls" ON public.calls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to deal_events" ON public.deal_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to deal_files" ON public.deal_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to deal_tasks" ON public.deal_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to ai_conversations" ON public.ai_conversations FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();