import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DealFile {
  id: string;
  deal_id: string;
  name: string;
  file_url: string;
  file_type?: string;
  created_at: string;
}

export const useDealFiles = (dealId: string) => {
  return useQuery({
    queryKey: ['deal-files', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_files')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DealFile[];
    },
    enabled: !!dealId,
  });
};

export const useCreateDealFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: { deal_id: string; name: string; file_url: string; file_type?: string }) => {
      const { data, error } = await supabase
        .from('deal_files')
        .insert(file)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-files', variables.deal_id] });
      toast({ title: 'تم إضافة الملف' });
    },
    onError: () => {
      toast({ title: 'حصل مشكلة', variant: 'destructive' });
    },
  });
};

export const useDeleteDealFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, deal_id }: { id: string; deal_id: string }) => {
      const { error } = await supabase
        .from('deal_files')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-files', variables.deal_id] });
      toast({ title: 'تم حذف الملف' });
    },
  });
};
