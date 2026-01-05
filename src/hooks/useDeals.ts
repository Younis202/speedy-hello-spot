import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Deal, Contact } from '@/types';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';
import { 
  cacheData, 
  getCachedData, 
  addToSyncQueue, 
  updateLocalCache,
  deleteFromLocalCache
} from '@/lib/offlineDB';

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
      // Try to fetch from Supabase
      if (navigator.onLine) {
        try {
          const { data, error } = await supabase
            .from('deals')
            .select('*')
            .order('updated_at', { ascending: false });
          
          if (error) throw error;
          
          const deals = data.map(deal => ({
            ...deal,
            contacts: parseContacts(deal.contacts)
          })) as Deal[];
          
          // Cache the data for offline use
          await cacheData('deals', deals);
          
          return deals;
        } catch (error) {
          console.error('Failed to fetch from Supabase, using cache:', error);
          // Fall back to cached data
          return getCachedData<Deal>('deals');
        }
      } else {
        // Offline - use cached data
        return getCachedData<Deal>('deals');
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDeal = (id: string) => {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      if (navigator.onLine) {
        const { data, error } = await supabase
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
      } else {
        // Get from cache
        const cached = await getCachedData<Deal>('deals');
        return cached.find(d => d.id === id) || null;
      }
    },
    enabled: !!id,
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deal: Partial<Deal>) => {
      const newDeal = {
        id: crypto.randomUUID(),
        name: deal.name || '',
        type: deal.type || '',
        description: deal.description,
        expected_value: deal.expected_value,
        realized_value: deal.realized_value || 0,
        currency: deal.currency || 'EGP',
        stage: deal.stage || 'جديد',
        priority: deal.priority || 'متوسط',
        next_action: deal.next_action,
        next_action_date: deal.next_action_date,
        contacts: deal.contacts || [],
        notes: deal.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('deals')
          .insert([{
            name: deal.name,
            type: deal.type,
            description: deal.description,
            expected_value: deal.expected_value,
            realized_value: deal.realized_value || 0,
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
        
        // Cache the new deal
        await updateLocalCache('deals', data.id, {
          ...data,
          contacts: parseContacts(data.contacts)
        }, true);
        
        return data;
      } else {
        // Offline mode - save locally and queue for sync
        await updateLocalCache('deals', newDeal.id, newDeal as Deal, false);
        await addToSyncQueue('deals', 'create', {
          name: deal.name,
          type: deal.type,
          description: deal.description,
          expected_value: deal.expected_value,
          realized_value: deal.realized_value || 0,
          currency: deal.currency,
          stage: deal.stage,
          priority: deal.priority,
          next_action: deal.next_action,
          next_action_date: deal.next_action_date,
          contacts: deal.contacts || [],
          notes: deal.notes,
        });
        
        toast.info('محفوظ محلياً - هيتزامن لما النت يرجع');
        return newDeal;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      if (navigator.onLine) {
        toast.success('تم إضافة المصلحة بنجاح');
      }
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
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('deals')
          .update({
            name: deal.name,
            type: deal.type,
            description: deal.description,
            expected_value: deal.expected_value,
            realized_value: deal.realized_value,
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
        
        // Update cache
        await updateLocalCache('deals', id, {
          ...data,
          contacts: parseContacts(data.contacts)
        }, true);
        
        return data;
      } else {
        // Offline - update locally and queue
        const cached = await getCachedData<Deal>('deals');
        const existing = cached.find(d => d.id === id);
        const updated = { ...existing, ...deal, id, updated_at: new Date().toISOString() };
        
        await updateLocalCache('deals', id, updated as Deal, false);
        await addToSyncQueue('deals', 'update', { id, ...deal });
        
        toast.info('محفوظ محلياً - هيتزامن لما النت يرجع');
        return updated;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', variables.id] });
      if (navigator.onLine) {
        toast.success('تم تحديث المصلحة');
      }
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
      if (navigator.onLine) {
        const { error } = await supabase
          .from('deals')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } else {
        await addToSyncQueue('deals', 'delete', { id });
        toast.info('محفوظ محلياً - هيتزامن لما النت يرجع');
      }
      
      await deleteFromLocalCache('deals', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      if (navigator.onLine) {
        toast.success('تم حذف المصلحة');
      }
    },
    onError: () => {
      toast.error('حصل مشكلة في الحذف');
    },
  });
};
