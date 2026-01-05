import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Job[];
    },
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert([job])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة الشغلانة بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: 'حصل مشكلة في الإضافة',
        variant: 'destructive',
      });
      console.error('Error creating job:', error);
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Job> & { id: string }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث الشغلانة بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: 'حصل مشكلة في التحديث',
        variant: 'destructive',
      });
      console.error('Error updating job:', error);
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الشغلانة',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: 'حصل مشكلة في الحذف',
        variant: 'destructive',
      });
      console.error('Error deleting job:', error);
    },
  });
};
