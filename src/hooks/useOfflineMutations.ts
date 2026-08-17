import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { adjustCachedTankSaldo } from '../services/offline/cache';
import { addToQueue } from '../services/offlineQueue';
import type { Checklist, FuelTractorInput } from '../types';
import { isBrowserOnline } from '../utils/network';

export type OfflineSaveResult =
  | { mode: 'online'; id?: string }
  | { mode: 'offline'; queueId: string };

export const useOfflineFuelTractor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: FuelTractorInput): Promise<OfflineSaveResult> => {
      const payload: Record<string, unknown> = {
        tanque_id: input.tanque_id,
        trator_id: input.trator_id,
        operador_id: input.operador_id,
        litros: input.litros,
        horimetro_inicial: input.horimetro_inicial,
        horimetro_final: input.horimetro_final,
        data_abastecimento: input.data_abastecimento?.toISOString() ?? new Date().toISOString(),
        observacoes: input.observacoes,
      };

      if (!isBrowserOnline()) {
        const item = addToQueue('abastecimento', payload);
        await adjustCachedTankSaldo(input.tanque_id, input.litros);
        return { mode: 'offline', queueId: item.id };
      }

      try {
        const { data, error } = await supabase.rpc('fuel_tractor', {
          p_tanque_id: input.tanque_id,
          p_trator_id: input.trator_id,
          p_operador_id: input.operador_id ?? null,
          p_litros: input.litros,
          p_horimetro_inicial: input.horimetro_inicial ?? null,
          p_horimetro_final: input.horimetro_final ?? null,
          p_data_abastecimento: payload.data_abastecimento as string,
          p_observacoes: input.observacoes ?? null,
        });
        if (error) throw error;
        return { mode: 'online', id: data as string };
      } catch (err) {
        if (!navigator.onLine) {
          const item = addToQueue('abastecimento', payload);
          await adjustCachedTankSaldo(input.tanque_id, input.litros);
          return { mode: 'offline', queueId: item.id };
        }
        throw err;
      }
    },
    onSuccess: (result) => {
      if (result.mode === 'online') {
        queryClient.invalidateQueries({ queryKey: ['tanques'] });
        queryClient.invalidateQueries({ queryKey: ['abastecimentos'] });
        queryClient.invalidateQueries({ queryKey: ['tratores'] });
      }
    },
  });
};

export const useOfflineCreateChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      checklist: Omit<Checklist, 'id' | 'created_at' | 'trator' | 'operador'>,
    ): Promise<OfflineSaveResult> => {
      const payload: Record<string, unknown> = {
        trator_id: checklist.trator_id,
        operador_id: checklist.operador_id,
        data_checklist: new Date(checklist.data_checklist).toISOString(),
        score: checklist.score,
        status: checklist.status,
        observacoes: checklist.observacoes,
        assinatura: checklist.assinatura,
      };

      if (!isBrowserOnline()) {
        const item = addToQueue('checklist', payload);
        return { mode: 'offline', queueId: item.id };
      }

      try {
        const { data, error } = await supabase
          .from('checklists')
          .insert({
            trator_id: payload.trator_id,
            operador_id: payload.operador_id ?? null,
            data_checklist: payload.data_checklist,
            score: payload.score ?? null,
            status: payload.status,
            observacoes: payload.observacoes ?? null,
            assinatura: payload.assinatura ?? null,
          })
          .select('id')
          .single();
        if (error) throw error;
        return { mode: 'online', id: data.id as string };
      } catch (err) {
        if (!navigator.onLine) {
          const item = addToQueue('checklist', payload);
          return { mode: 'offline', queueId: item.id };
        }
        throw err;
      }
    },
    onSuccess: (result) => {
      if (result.mode === 'online') {
        queryClient.invalidateQueries({ queryKey: ['checklists'] });
      }
    },
  });
};
