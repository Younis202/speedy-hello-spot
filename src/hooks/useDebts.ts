import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Debt } from '@/types';
import { toast } from 'sonner';

export const useDebts = () => {
  return useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('debts')
        .select('*')
        .order('pressure_level', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Debt[];
    },
  });
};

export const useCreateDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (debt: Partial<Debt>) => {
      const { data, error } = await (supabase as any)
        .from('debts')
        .insert([{
          creditor_name: debt.creditor_name,
          amount: debt.amount,
          currency: debt.currency,
          monthly_payment: debt.monthly_payment,
          remaining_amount: debt.remaining_amount || debt.amount,
          due_date: debt.due_date,
          pressure_level: debt.pressure_level,
          notes: debt.notes,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('تم إضافة الدين');
    },
    onError: () => {
      toast.error('حصل مشكلة في الإضافة');
    },
  });
};

export const useUpdateDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...debt }: Partial<Debt> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('debts')
        .update({
          creditor_name: debt.creditor_name,
          amount: debt.amount,
          currency: debt.currency,
          monthly_payment: debt.monthly_payment,
          remaining_amount: debt.remaining_amount,
          due_date: debt.due_date,
          pressure_level: debt.pressure_level,
          notes: debt.notes,
          is_paid: debt.is_paid,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('تم التحديث');
    },
    onError: () => {
      toast.error('حصل مشكلة');
    },
  });
};

export const useDeleteDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('debts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('تم الحذف');
    },
    onError: () => {
      toast.error('حصل مشكلة');
    },
  });
};
