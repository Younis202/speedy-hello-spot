import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Call } from '@/types';

export const useDealCalls = (dealId: string) => {
  return useQuery({
    queryKey: ['deal-calls', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('deal_id', dealId)
        .order('call_date', { ascending: false });
      
      if (error) throw error;
      return data as Call[];
    },
    enabled: !!dealId,
  });
};

export const useCreateDealCall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (call: {
      deal_id: string;
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
      queryClient.invalidateQueries({ queryKey: ['deal-calls', variables.deal_id] });
      toast({ title: 'تم تسجيل المكالمة' });
    },
    onError: () => {
      toast({ title: 'حصل مشكلة', variant: 'destructive' });
    },
  });
};