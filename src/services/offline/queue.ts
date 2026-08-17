import { getOfflineDb } from './db';
import type { SyncOperationType, SyncPayload, SyncQueueItem } from './types';

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `sync-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const enqueueSyncItem = async (
  type: SyncOperationType,
  payload: SyncPayload,
): Promise<SyncQueueItem> => {
  const item: SyncQueueItem = {
    id: createId(),
    type,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  };
  const db = await getOfflineDb();
  await db.put('sync_queue', item);
  window.dispatchEvent(new CustomEvent('pluma-sync-queue-changed'));
  return item;
};

export const listSyncQueue = async (): Promise<SyncQueueItem[]> => {
  const db = await getOfflineDb();
  const items = await db.getAllFromIndex('sync_queue', 'by-created');
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

export const getPendingSyncCount = async (): Promise<number> => {
  const db = await getOfflineDb();
  return db.count('sync_queue');
};

export const removeSyncItem = async (id: string) => {
  const db = await getOfflineDb();
  await db.delete('sync_queue', id);
  window.dispatchEvent(new CustomEvent('pluma-sync-queue-changed'));
};

export const updateSyncItem = async (item: SyncQueueItem) => {
  const db = await getOfflineDb();
  await db.put('sync_queue', item);
  window.dispatchEvent(new CustomEvent('pluma-sync-queue-changed'));
};
