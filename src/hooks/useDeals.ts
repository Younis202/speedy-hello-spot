import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Deal, Contact } from '@/types';
import { toast } from 'sonner';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

const parseContacts = (contacts: Json | null): Contact[] => {
  if (!contacts) return [];
  if (Array.isArray(contacts)) {
    return contacts as unknown as Contact[];
  }
  return [];
};

export const useDeals = () => {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('deals')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map((deal: any) => ({
        ...deal,
        contacts: parseContacts(deal.contacts)
      })) as Deal[];
    },
  });
};

export const useDeal = (id: string) => {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('deals')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        contacts: parseContacts(data.contacts)
      } as Deal;
    },
    enabled: !!id,
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deal: Partial<Deal>) => {
      const { data, error } = await (supabase as any)
        .from('deals')
        .insert([{
          name: deal.name,
          type: deal.type,
          description: deal.description,
          expected_value: deal.expected_value,
          currency: deal.currency,
          stage: deal.stage,
          priority: deal.priority,
          next_action: deal.next_action,
          next_action_date: deal.next_action_date,
          contacts: (deal.contacts || []) as unknown as Json,
          notes: deal.notes,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('تم إضافة المصلحة بنجاح');
    },
    onError: () => {
      toast.error('حصل مشكلة في إضافة المصلحة');
    },
  });
};

export const useUpdateDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...deal }: Partial<Deal> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('deals')
        .update({
          name: deal.name,
          type: deal.type,
          description: deal.description,
          expected_value: deal.expected_value,
          currency: deal.currency,
          stage: deal.stage,
          priority: deal.priority,
          next_action: deal.next_action,
          next_action_date: deal.next_action_date,
          contacts: (deal.contacts || []) as unknown as Json,
          notes: deal.notes,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', variables.id] });
      toast.success('تم تحديث المصلحة');
    },
    onError: () => {
      toast.error('حصل مشكلة في التحديث');
    },
  });
};

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('deals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('تم حذف المصلحة');
    },
    onError: () => {
      toast.error('حصل مشكلة في الحذف');
    },
  });
};