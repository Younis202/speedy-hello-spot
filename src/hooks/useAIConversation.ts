import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Message, AIConversation } from '@/types';

export const useAIConversations = () => {
  return useQuery({
    queryKey: ['ai-conversations'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ai_conversations')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map((conv: any) => ({
        ...conv,
        messages: (conv.messages || []) as Message[]
      })) as AIConversation[];
    },
  });
};

export const useCreateAIConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ai_conversations')
        .insert([{ messages: [] }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });
};

export const useUpdateAIConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, messages }: { id: string; messages: Message[] }) => {
      const { data, error } = await (supabase as any)
        .from('ai_conversations')
        .update({ messages })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });
};

export const useDeleteAIConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('ai_conversations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });
};
