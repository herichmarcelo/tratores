import React from 'react';
import { CloudOff, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Link } from 'react-router-dom';

export const PendingSyncIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { pendingCount, isSyncing, syncNow, lastSyncError } = useOfflineSync();

  if (pendingCount === 0 && isOnline && !lastSyncError) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-ff-yellow/30 bg-ff-yellow/10 px-3 py-1.5 text-xs font-medium text-ff-yellow">
      {isSyncing ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
      ) : (
        <CloudOff className="h-3.5 w-3.5 shrink-0" />
      )}
      <span>
        {pendingCount > 0
          ? `${pendingCount} ${pendingCount === 1 ? 'item pendente' : 'itens pendentes'}`
          : lastSyncError
            ? 'Erro na sincronização'
            : 'Sincronizado'}
      </span>
      {isOnline && pendingCount > 0 && !isSyncing && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-ff-yellow hover:bg-ff-yellow/20"
          onClick={() => void syncNow()}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Sync
        </Button>
      )}
      {pendingCount > 0 && (
        <Link to="/offline" className="text-ff-yellow underline hover:no-underline">
          Ver
        </Link>
      )}
    </div>
  );
};
