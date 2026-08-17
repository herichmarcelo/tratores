import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getPendingCount,
  syncPendingItems,
  OFFLINE_QUEUE_EVENT,
} from '../services/offlineQueue';
import { useOnlineStatusListener } from './useOnlineStatus';

export const useOfflineSync = () => {
  const queryClient = useQueryClient();
  const [pendingCount, setPendingCount] = useState(getPendingCount());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  const refreshPendingCount = useCallback(() => {
    setPendingCount(getPendingCount());
  }, []);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return { synced: 0, failed: 0, errors: [] };
    setIsSyncing(true);
    setLastSyncError(null);
    try {
      const result = await syncPendingItems();
      refreshPendingCount();
      if (result.synced > 0) {
        queryClient.invalidateQueries({ queryKey: ['abastecimentos'] });
        queryClient.invalidateQueries({ queryKey: ['checklists'] });
        queryClient.invalidateQueries({ queryKey: ['tanques'] });
        queryClient.invalidateQueries({ queryKey: ['tratores'] });
      }
      if (result.failed > 0) {
        setLastSyncError(result.errors[0]?.message ?? 'Falha ao sincronizar alguns itens');
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, queryClient, refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();
    const onQueueChange = () => refreshPendingCount();
    window.addEventListener(OFFLINE_QUEUE_EVENT, onQueueChange);
    return () => window.removeEventListener(OFFLINE_QUEUE_EVENT, onQueueChange);
  }, [refreshPendingCount]);

  useOnlineStatusListener((online) => {
    if (online) void syncNow();
  });

  return {
    pendingCount,
    isSyncing,
    lastSyncError,
    syncNow,
    refreshPendingCount,
  };
};
