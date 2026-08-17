import { supabase } from '../supabase';
import { removeSyncItem, listSyncQueue, updateSyncItem } from './queue';
import type { ChecklistSyncPayload, FuelTractorSyncPayload, SyncQueueItem } from './types';

export class OfflineSyncError extends Error {
  itemId: string;

  constructor(message: string, itemId: string) {
    super(message);
    this.name = 'OfflineSyncError';
    this.itemId = itemId;
  }
}

const syncFuelTractor = async (payload: FuelTractorSyncPayload) => {
  const { error } = await supabase.rpc('fuel_tractor', {
    p_tanque_id: payload.tanque_id,
    p_trator_id: payload.trator_id,
    p_operador_id: payload.operador_id ?? null,
    p_litros: payload.litros,
    p_horimetro_inicial: payload.horimetro_inicial ?? null,
    p_horimetro_final: payload.horimetro_final ?? null,
    p_data_abastecimento: payload.data_abastecimento ?? new Date().toISOString(),
    p_observacoes: payload.observacoes ?? null,
  });
  if (error) throw error;
};

const syncChecklist = async (payload: ChecklistSyncPayload) => {
  const { error } = await supabase.from('checklists').insert({
    trator_id: payload.trator_id,
    operador_id: payload.operador_id ?? null,
    data_checklist: payload.data_checklist,
    score: payload.score ?? null,
    status: payload.status,
    observacoes: payload.observacoes ?? null,
    assinatura: payload.assinatura ?? null,
  });
  if (error) throw error;
};

const syncItem = async (item: SyncQueueItem) => {
  if (item.type === 'fuel_tractor') {
    await syncFuelTractor(item.payload as FuelTractorSyncPayload);
    return;
  }
  if (item.type === 'checklist') {
    await syncChecklist(item.payload as ChecklistSyncPayload);
    return;
  }
  throw new Error(`Tipo de sincronização desconhecido: ${item.type}`);
};

export interface SyncResult {
  synced: number;
  failed: number;
  errors: { id: string; message: string }[];
}

export const processSyncQueue = async (): Promise<SyncResult> => {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0, errors: [] };
  }

  const items = await listSyncQueue();
  const result: SyncResult = { synced: 0, failed: 0, errors: [] };

  for (const item of items) {
    try {
      await syncItem(item);
      await removeSyncItem(item.id);
      result.synced += 1;
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Erro ao sincronizar';
      result.failed += 1;
      result.errors.push({ id: item.id, message });
      await updateSyncItem({
        ...item,
        retries: item.retries + 1,
        lastError: message,
      });
    }
  }

  return result;
};

export const isOnline = () =>
  typeof navigator !== 'undefined' ? navigator.onLine : true;
