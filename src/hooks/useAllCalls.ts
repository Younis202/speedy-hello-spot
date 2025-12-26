import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Call } from '@/types';

export interface CallWithDeal extends Call {
  deals?: {
    id: string;
    name: string;
  } | null;
}

export const useAllCalls = () => {
  return useQuery({
    queryKey: ['all-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          deals (
            id,
            name
          )
        `)
        .order('call_date', { ascending: false });
      
      if (error) throw error;
      return data as CallWithDeal[];
    },
  });
};

export const useTodayFollowUps = () => {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['today-followups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          deals (
            id,
            name
          )
        `)
        .eq('follow_up_date', today)
        .order('call_date', { ascending: false });
      
      if (error) throw error;
      return data as CallWithDeal[];
    },
  });
};

export const useCreateCall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (call: {
      deal_id?: string;
      contact_name: string;
      phone_number?: string;
      call_type?: string;
      result?: string;
      notes?: string;
      follow_up_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('calls')
        .insert(call)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-calls'] });
      queryClient.invalidateQueries({ queryKey: ['today-followups'] });
      if (variables.deal_id) {
        queryClient.invalidateQueries({ queryKey: ['deal-calls', variables.deal_id] });
      }
      toast({ title: 'تم تسجيل المكالمة بنجاح' });
    },
    onError: () => {
      toast({ title: 'حصل مشكلة في تسجيل المكالمة', variant: 'destructive' });
    },
  });
};

export const useDeleteCall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, deal_id }: { id: string; deal_id?: string }) => {
      const { error } = await supabase
        .from('calls')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, deal_id };
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-calls'] });
      queryClient.invalidateQueries({ queryKey: ['today-followups'] });
      if (variables.deal_id) {
        queryClient.invalidateQueries({ queryKey: ['deal-calls', variables.deal_id] });
      }
      toast({ title: 'تم حذف المكالمة' });
    },
    onError: () => {
      toast({ title: 'حصل مشكلة في الحذف', variant: 'destructive' });
    },
  });
};
