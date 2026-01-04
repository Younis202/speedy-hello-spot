import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Debt } from '@/types';
import { toast } from 'sonner';
import { 
  cacheData, 
  getCachedData, 
  addToSyncQueue, 
  updateLocalCache,
  deleteFromLocalCache
} from '@/lib/offlineDB';

export const useDebts = () => {
  return useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      if (navigator.onLine) {
        try {
          const { data, error } = await supabase
            .from('debts')
            .select('*')
            .order('pressure_level', { ascending: false });
          
          if (error) throw error;
          
          // Cache the data
          await cacheData('debts', data as Debt[]);
          
          return data as Debt[];
        } catch (error) {
          console.error('Failed to fetch debts, using cache:', error);
          return getCachedData<Debt>('debts');
        }
      } else {
        return getCachedData<Debt>('debts');
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (debt: Partial<Debt>) => {
      const newDebt = {
        id: crypto.randomUUID(),
        creditor_name: debt.creditor_name || '',
        amount: debt.amount || 0,
        currency: debt.currency || 'EGP',
        monthly_payment: debt.monthly_payment,
        remaining_amount: debt.remaining_amount || debt.amount,
        due_date: debt.due_date,
        pressure_level: debt.pressure_level || 'متوسط',
        notes: debt.notes,
        is_paid: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (navigator.onLine) {
        const { data, error } = await supabase
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
        
        await updateLocalCache('debts', data.id, data as Debt, true);
        return data;
      } else {
        await updateLocalCache('debts', newDebt.id, newDebt as Debt, false);
        await addToSyncQueue('debts', 'create', {
          creditor_name: debt.creditor_name,
          amount: debt.amount,
          currency: debt.currency,
          monthly_payment: debt.monthly_payment,
          remaining_amount: debt.remaining_amount || debt.amount,
          due_date: debt.due_date,
          pressure_level: debt.pressure_level,
          notes: debt.notes,
        });
        
        toast.info('محفوظ محلياً - هيتزامن لما النت يرجع');
        return newDebt;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      if (navigator.onLine) {
        toast.success('تم إضافة الدين');
      }
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
      if (navigator.onLine) {
        const { data, error } = await supabase
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
        
        await updateLocalCache('debts', id, data as Debt, true);
        return data;
      } else {
        const cached = await getCachedData<Debt>('debts');
        const existing = cached.find(d => d.id === id);
        const updated = { ...existing, ...debt, id, updated_at: new Date().toISOString() };
        
        await updateLocalCache('debts', id, updated as Debt, false);
        await addToSyncQueue('debts', 'update', { id, ...debt });
        
        toast.info('محفوظ محلياً - هيتزامن لما النت يرجع');
        return updated;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      if (navigator.onLine) {
        toast.success('تم التحديث');
      }
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
      if (navigator.onLine) {
        const { error } = await supabase
          .from('debts')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } else {
        await addToSyncQueue('debts', 'delete', { id });
        toast.info('محفوظ محلياً - هيتزامن لما النت يرجع');
      }
      
      await deleteFromLocalCache('debts', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      if (navigator.onLine) {
        toast.success('تم الحذف');
      }
    },
    onError: () => {
      toast.error('حصل مشكلة');
    },
  });
};
