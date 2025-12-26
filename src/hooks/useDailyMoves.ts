import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DailyMove } from '@/types';
import { toast } from 'sonner';

const today = new Date().toISOString().split('T')[0];

export const useDailyMoves = () => {
  return useQuery({
    queryKey: ['daily-moves', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_moves')
        .select('*')
        .eq('move_date', today)
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data as DailyMove[];
    },
  });
};

export const useCreateDailyMove = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (move: Partial<DailyMove>) => {
      const { data, error } = await supabase
        .from('daily_moves')
        .insert([{
          title: move.title,
          deal_id: move.deal_id,
          priority: move.priority || 1,
          move_date: today,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-moves'] });
      toast.success('تم إضافة الحركة');
    },
    onError: () => {
      toast.error('حصل مشكلة');
    },
  });
};

export const useToggleDailyMove = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { data, error } = await supabase
        .from('daily_moves')
        .update({ is_completed })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['daily-moves'] });
      if (variables.is_completed) {
        toast.success('برافو عليك! 💪');
      }
    },
  });
};

export const useDeleteDailyMove = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('daily_moves')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-moves'] });
    },
  });
};