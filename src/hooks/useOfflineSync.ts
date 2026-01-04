import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSyncQueue, removeFromSyncQueue } from '@/lib/offlineDB';
import { toast } from 'sonner';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastOnline };
};

export const useSyncManager = () => {
  const { isOnline } = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Check pending changes count
  const checkPendingChanges = useCallback(async () => {
    const queue = await getSyncQueue();
    setPendingChanges(queue.length);
  }, []);

  // Sync all pending changes
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    const queue = await getSyncQueue();
    
    if (queue.length === 0) {
      setIsSyncing(false);
      return;
    }

    let syncedCount = 0;
    let errorCount = 0;

    for (const item of queue) {
      try {
        if (item.action === 'create') {
          const { error } = await supabase
            .from(item.table)
            .insert([item.data]);
          if (error) throw error;
        } else if (item.action === 'update') {
          const { id, ...data } = item.data;
          const { error } = await supabase
            .from(item.table)
            .update(data)
            .eq('id', id);
          if (error) throw error;
        } else if (item.action === 'delete') {
          const { error } = await supabase
            .from(item.table)
            .delete()
            .eq('id', item.data.id);
          if (error) throw error;
        }
        
        await removeFromSyncQueue(item.id);
        syncedCount++;
      } catch (error) {
        console.error('Sync error:', error);
        errorCount++;
      }
    }

    setIsSyncing(false);
    await checkPendingChanges();

    if (syncedCount > 0) {
      toast.success(`تم مزامنة ${syncedCount} تغيير`);
    }
    if (errorCount > 0) {
      toast.error(`فشل مزامنة ${errorCount} تغيير`);
    }
  }, [isOnline, isSyncing, checkPendingChanges]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline) {
      syncPendingChanges();
    }
  }, [isOnline, syncPendingChanges]);

  // Check pending changes on mount
  useEffect(() => {
    checkPendingChanges();
  }, [checkPendingChanges]);

  return {
    isOnline,
    isSyncing,
    pendingChanges,
    syncPendingChanges,
    checkPendingChanges,
  };
};
