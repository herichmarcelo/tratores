import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wifi,
  WifiOff,
  CloudOff,
  Loader2,
  RefreshCw,
  Fuel,
  ClipboardList,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { getPendingItems } from '../services/offlineQueue';
import { useEffect, useState } from 'react';
import { OFFLINE_QUEUE_EVENT, type QueuedItem } from '../services/offlineQueue';

export const OfflineStatus: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { isSyncing, syncNow, lastSyncError } = useOfflineSync();
  const [items, setItems] = useState<QueuedItem[]>(getPendingItems());

  useEffect(() => {
    const refresh = () => setItems(getPendingItems());
    refresh();
    window.addEventListener(OFFLINE_QUEUE_EVENT, refresh);
    return () => window.removeEventListener(OFFLINE_QUEUE_EVENT, refresh);
  }, []);

  const handleSync = async () => {
    await syncNow();
    setItems(getPendingItems());
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0A0A0A] p-4 lg:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CloudOff className="w-7 h-7 text-ff-yellow" />
            Status Offline
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#B3B3B3] mt-1">
            Gerencie itens salvos localmente aguardando sincronização
          </p>
        </div>

        <Card className="border-none shadow-sm dark:bg-[#14141A]">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-ff-green-active" />
              ) : (
                <WifiOff className="w-5 h-5 text-ff-yellow" />
              )}
              Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={
                isOnline
                  ? 'bg-ff-green-active/20 text-ff-green-active border-ff-green-active/30'
                  : 'bg-ff-yellow/20 text-ff-yellow border-ff-yellow/30'
              }
            >
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            {lastSyncError && (
              <p className="mt-3 text-sm text-red-500">{lastSyncError}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-[#14141A]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-gray-900 dark:text-white">
              Fila de sincronização ({items.length})
            </CardTitle>
            <Button
              type="button"
              className="bg-ff-yellow text-black hover:brightness-110"
              disabled={!isOnline || isSyncing || items.length === 0}
              onClick={() => void handleSync()}
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Sincronizar agora
            </Button>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-[#B3B3B3] py-8">
                Nenhum item pendente
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                {items.map((item) => (
                  <li key={item.id} className="py-3 flex items-center gap-3">
                    {item.type === 'abastecimento' ? (
                      <Fuel className="w-5 h-5 text-ff-yellow shrink-0" />
                    ) : (
                      <ClipboardList className="w-5 h-5 text-ff-yellow shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {item.type}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">
                        {new Date(item.timestamp).toLocaleString('pt-BR')}
                      </p>
                      {item.lastError && (
                        <p className="text-xs text-red-500 mt-1">{item.lastError}</p>
                      )}
                    </div>
                    <Badge
                      className={
                        item.status === 'failed'
                          ? 'bg-red-600/20 text-red-400 border-red-600/30'
                          : 'bg-ff-yellow/20 text-ff-yellow border-ff-yellow/30'
                      }
                    >
                      {item.status === 'failed' ? 'Falhou' : 'Pendente'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Link
          to="/dashboard"
          className="block text-center text-sm text-ff-yellow hover:underline"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
};
