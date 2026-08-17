import { supabase } from './supabase';
import type { FuelTractorInput } from '../types';

export interface QueuedItem {
  id: string;
  type: 'abastecimento' | 'checklist';
  data: Record<string, unknown>;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  lastError?: string;
}

const STORAGE_KEY = 'franco_forte_offline_queue';

export const OFFLINE_QUEUE_EVENT = 'pluma-offline-queue-changed';

const notifyQueueChanged = () => {
  window.dispatchEvent(new CustomEvent(OFFLINE_QUEUE_EVENT));
};

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const readQueue = (): QueuedItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeQueue = (items: QueuedItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notifyQueueChanged();
};

export const addToQueue = (
  type: QueuedItem['type'],
  data: Record<string, unknown>,
): QueuedItem => {
  const item: QueuedItem = {
    id: createId(),
    type,
    data,
    timestamp: Date.now(),
    status: 'pending',
  };
  const queue = readQueue();
  queue.push(item);
  writeQueue(queue);
  return item;
};

export const getPendingItems = (): QueuedItem[] =>
  readQueue().filter((item) => item.status === 'pending' || item.status === 'failed');

export const getPendingCount = (): number => getPendingItems().length;

export const removeFromQueue = (id: string) => {
  writeQueue(readQueue().filter((item) => item.id !== id));
};

const updateItem = (id: string, patch: Partial<QueuedItem>) => {
  writeQueue(
    readQueue().map((item) => (item.id === id ? { ...item, ...patch } : item)),
  );
};

const syncAbastecimento = async (data: Record<string, unknown>) => {
  const input = data as unknown as FuelTractorInput & { data_abastecimento?: string };
  const { error } = await supabase.rpc('fuel_tractor', {
    p_tanque_id: input.tanque_id,
    p_trator_id: input.trator_id,
    p_operador_id: input.operador_id ?? null,
    p_litros: input.litros,
    p_horimetro_inicial: input.horimetro_inicial ?? null,
    p_horimetro_final: input.horimetro_final ?? null,
    p_data_abastecimento:
      input.data_abastecimento ?? new Date().toISOString(),
    p_observacoes: input.observacoes ?? null,
  });
  if (error) throw error;
};

const syncChecklist = async (data: Record<string, unknown>) => {
  const { error } = await supabase.from('checklists').insert({
    trator_id: data.trator_id,
    operador_id: data.operador_id ?? null,
    data_checklist: data.data_checklist,
    score: data.score ?? null,
    status: data.status,
    observacoes: data.observacoes ?? null,
    assinatura: data.assinatura ?? null,
  });
  if (error) throw error;
};

export interface SyncResult {
  synced: number;
  failed: number;
  errors: { id: string; message: string }[];
}

export const syncPendingItems = async (): Promise<SyncResult> => {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0, errors: [] };
  }

  const pending = getPendingItems();
  const result: SyncResult = { synced: 0, failed: 0, errors: [] };

  for (const item of pending) {
    try {
      if (item.type === 'abastecimento') {
        await syncAbastecimento(item.data);
      } else if (item.type === 'checklist') {
        await syncChecklist(item.data);
      }
      updateItem(item.id, { status: 'synced', lastError: undefined });
      removeFromQueue(item.id);
      result.synced += 1;
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Erro ao sincronizar';
      updateItem(item.id, { status: 'failed', lastError: message });
      result.failed += 1;
      result.errors.push({ id: item.id, message });
    }
  }

  notifyQueueChanged();
  return result;
};

/** Auto-sync quando a conexão voltar */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void syncPendingItems();
  });
}
