import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DailyMove } from '@/types';
import { toast } from 'sonner';
import { 
  cacheData, 
  getCachedData, 
  addToSyncQueue, 
  updateLocalCache,
  deleteFromLocalCache
} from '@/lib/offlineDB';

const today = new Date().toISOString().split('T')[0];

export const useDailyMoves = () => {
  return useQuery({
    queryKey: ['daily-moves', today],
    queryFn: async () => {
      if (navigator.onLine) {
        try {
          const { data, error } = await supabase
            .from('daily_moves')
            .select('*')
            .eq('move_date', today)
            .order('priority', { ascending: true });
          
          if (error) throw error;
          
          // Cache the data
          await cacheData('daily_moves', data as DailyMove[]);
          
          return data as DailyMove[];
        } catch (error) {
          console.error('Failed to fetch moves, using cache:', error);
          const cached = await getCachedData<DailyMove>('daily_moves');
          return cached.filter(m => m.move_date === today);
        }
      } else {
        const cached = await getCachedData<DailyMove>('daily_moves');
        return cached.filter(m => m.move_date === today);
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateDailyMove = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (move: Partial<DailyMove>) => {
      const newMove = {
        id: crypto.randomUUID(),
        title: move.title || '',
        deal_id: move.deal_id,
        priority: move.priority || 1,
        move_date: today,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (navigator.onLine) {
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
        
        await updateLocalCache('daily_moves', data.id, data as DailyMove, true);
        return data;
      } else {
        await updateLocalCache('daily_moves', newMove.id, newMove as DailyMove, false);
        await addToSyncQueue('daily_moves', 'create', {
          title: move.title,
          deal_id: move.deal_id,
          priority: move.priority || 1,
          move_date: today,
        });
        
        toast.info('محفوظ محلياً - هيتزامن لما النت يرجع');
        return newMove;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-moves'] });
      if (navigator.onLine) {
        toast.success('تم إضافة الحركة');
      }
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
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('daily_moves')
          .update({ is_completed })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        await updateLocalCache('daily_moves', id, data as DailyMove, true);
        return data;
      } else {
        const cached = await getCachedData<DailyMove>('daily_moves');
        const existing = cached.find(m => m.id === id);
        const updated = { ...existing, is_completed, id, updated_at: new Date().toISOString() };
        
        await updateLocalCache('daily_moves', id, updated as DailyMove, false);
        await addToSyncQueue('daily_moves', 'update', { id, is_completed });
        
        return updated;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['daily-moves'] });
      if (variables.is_completed && navigator.onLine) {
        toast.success('برافو عليك! 💪');
      }
    },
  });
};

export const useDeleteDailyMove = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (navigator.onLine) {
        const { error } = await supabase
          .from('daily_moves')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } else {
        await addToSyncQueue('daily_moves', 'delete', { id });
      }
      
      await deleteFromLocalCache('daily_moves', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-moves'] });
    },
  });
};
