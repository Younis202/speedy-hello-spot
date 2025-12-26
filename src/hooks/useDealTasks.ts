import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DealTask {
  id: string;
  deal_id: string;
  title: string;
  is_completed: boolean;
  priority: number;
  due_date: string | null;
  created_at: string;
}

export const useDealTasks = (dealId: string) => {
  return useQuery({
    queryKey: ['deal-tasks', dealId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('deal_tasks')
        .select('*')
        .eq('deal_id', dealId)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return (data || []) as DealTask[];
    },
    enabled: !!dealId,
  });
};

export const useCreateDealTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: { deal_id: string; title: string; priority?: number; due_date?: string }) => {
      const { data, error } = await (supabase as any)
        .from('deal_tasks')
        .insert(task)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-tasks', variables.deal_id] });
      toast({ title: 'تم إضافة المهمة' });
    },
    onError: () => {
      toast({ title: 'حصل مشكلة', variant: 'destructive' });
    },
  });
};

export const useUpdateDealTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, deal_id, ...updates }: { id: string; deal_id: string } & Partial<DealTask>) => {
      const { data, error } = await (supabase as any)
        .from('deal_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-tasks', variables.deal_id] });
    },
  });
};

export const useDeleteDealTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, deal_id }: { id: string; deal_id: string }) => {
      const { error } = await (supabase as any)
        .from('deal_tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-tasks', variables.deal_id] });
      toast({ title: 'تم حذف المهمة' });
    },
  });
};
