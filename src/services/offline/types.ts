import type { FuelTractorInput } from '../../types';

export type SyncOperationType = 'fuel_tractor' | 'checklist';

export interface ChecklistSyncPayload {
  trator_id: string;
  operador_id?: string;
  data_checklist: string;
  score?: number;
  status: string;
  observacoes?: string;
  assinatura?: string;
}

export interface FuelTractorSyncPayload extends Omit<FuelTractorInput, 'data_abastecimento'> {
  data_abastecimento?: string;
}

export type SyncPayload = FuelTractorSyncPayload | ChecklistSyncPayload;

export interface SyncQueueItem {
  id: string;
  type: SyncOperationType;
  payload: SyncPayload;
  createdAt: string;
  retries: number;
  lastError?: string;
}

export interface CachedTratoresEntry {
  key: string;
  data: unknown[];
  updatedAt: string;
}

export interface CachedTanquesEntry {
  key: string;
  data: unknown[];
  updatedAt: string;
}
