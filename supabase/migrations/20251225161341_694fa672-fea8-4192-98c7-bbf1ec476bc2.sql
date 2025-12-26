-- جدول المصالح (Deals)
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'وساطة',
  description TEXT,
  expected_value DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'EGP',
  stage TEXT DEFAULT 'جديد',
  priority TEXT DEFAULT 'متوسط',
  next_action TEXT,
  next_action_date DATE,
  contacts JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول الأحداث والتاريخ لكل مصلحة
CREATE TABLE public.deal_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'ملاحظة',
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول الديون
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creditor_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'EGP',
  monthly_payment DECIMAL(15,2) DEFAULT 0,
  remaining_amount DECIMAL(15,2),
  due_date DATE,
  pressure_level TEXT DEFAULT 'متوسط',
  notes TEXT,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول المكالمات
CREATE TABLE public.calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  contact_name TEXT NOT NULL,
  phone_number TEXT,
  call_type TEXT DEFAULT 'صادر',
  result TEXT,
  notes TEXT,
  follow_up_date DATE,
  call_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول المهام اليومية (الـ 3 حركات)
CREATE TABLE public.daily_moves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  move_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول محادثات الـ AI
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policies for public access (since this is a personal app)
CREATE POLICY "Allow all operations on deals" ON public.deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on deal_events" ON public.deal_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on debts" ON public.debts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on calls" ON public.calls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on daily_moves" ON public.daily_moves FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ai_conversations" ON public.ai_conversations FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();