import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { CachedTanquesEntry, CachedTratoresEntry, SyncQueueItem } from './types';

interface PlumaOfflineDB extends DBSchema {
  sync_queue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-created': string };
  };
  cache_tratores: {
    key: string;
    value: CachedTratoresEntry;
  };
  cache_tanques: {
    key: string;
    value: CachedTanquesEntry;
  };
}

const DB_NAME = 'pluma-offline';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PlumaOfflineDB>> | null = null;

export const getOfflineDb = () => {
  if (!dbPromise) {
    dbPromise = openDB<PlumaOfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const queue = db.createObjectStore('sync_queue', { keyPath: 'id' });
        queue.createIndex('by-created', 'createdAt');
        db.createObjectStore('cache_tratores', { keyPath: 'key' });
        db.createObjectStore('cache_tanques', { keyPath: 'key' });
      },
    });
  }
  return dbPromise;
};
