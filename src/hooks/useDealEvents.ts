import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DealEvent } from '@/types';
import { toast } from 'sonner';

export const useDealEvents = (dealId: string) => {
  return useQuery({
    queryKey: ['deal-events', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_events')
        .select('*')
        .eq('deal_id', dealId)
        .order('event_date', { ascending: false });
      
      if (error) throw error;
      return data as DealEvent[];
    },
    enabled: !!dealId,
  });
};

export const useCreateDealEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (event: Partial<DealEvent>) => {
      const { data, error } = await supabase
        .from('deal_events')
        .insert([{
          deal_id: event.deal_id,
          event_type: event.event_type || 'ملاحظة',
          title: event.title,
          description: event.description,
          event_date: event.event_date || new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-events', variables.deal_id] });
      toast.success('تم إضافة الحدث');
    },
    onError: () => {
      toast.error('حصل مشكلة');
    },
  });
};