-- جدول المهام الخاصة بكل مصلحة
CREATE TABLE public.deal_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deal_tasks ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (no auth)
CREATE POLICY "Allow all on deal_tasks" ON public.deal_tasks FOR ALL USING (true) WITH CHECK (true);

-- جدول الملفات الخاصة بكل مصلحة (نخزن URL بس)
CREATE TABLE public.deal_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deal_files ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (no auth)
CREATE POLICY "Allow all on deal_files" ON public.deal_files FOR ALL USING (true) WITH CHECK (true);