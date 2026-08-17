import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getPendingCount, OFFLINE_QUEUE_EVENT } from '../services/offlineQueue';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(getPendingCount());

  useEffect(() => {
    const refresh = () => setPendingCount(getPendingCount());
    refresh();
    window.addEventListener(OFFLINE_QUEUE_EVENT, refresh);
    return () => window.removeEventListener(OFFLINE_QUEUE_EVENT, refresh);
  }, []);

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      role="status"
      className={`sticky top-0 z-[60] px-4 py-2.5 shadow-md animate-slideDownToast ${
        isOnline
          ? 'bg-ff-yellow text-black'
          : 'bg-ff-yellow text-black'
      }`}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4 shrink-0" />
        <div className="text-center">
          {!isOnline && (
            <p>
              Você está offline. Os dados serão salvos e sincronizados automaticamente.
            </p>
          )}
          {pendingCount > 0 && (
            <p className={!isOnline ? 'mt-0.5 text-xs opacity-90' : ''}>
              {pendingCount}{' '}
              {pendingCount === 1 ? 'item aguardando sincronização' : 'itens aguardando sincronização'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
