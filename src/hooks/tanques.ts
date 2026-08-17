import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useFazendaScope } from './useFazendaScope';
import { cacheTanques, getCachedTanques } from '../services/offline/cache';
import { isBrowserOnline } from '../utils/network';
import type { Tank, FuelPurchaseInput, FuelTractorInput } from '../types';

export interface TanqueFilters {
  fazenda_id?: string;
  setor_id?: string;
}

export const useTanques = (filters?: TanqueFilters) => {
  const { scopedFazendaId } = useFazendaScope();
  const effectiveFazendaId = filters?.fazenda_id ?? scopedFazendaId;

  return useQuery({
    queryKey: ['tanques', effectiveFazendaId, filters?.setor_id],
    queryFn: async () => {
      if (!isBrowserOnline()) {
        const cached = await getCachedTanques(effectiveFazendaId, filters?.setor_id);
        if (cached) return cached;
      }

      let query = supabase
        .from('tanques_combustivel')
        .select('*, fazenda:fazendas(*), setor:setores(*)')
        .eq('ativo', true)
        .order('nome');

      if (effectiveFazendaId) {
        query = query.eq('fazenda_id', effectiveFazendaId);
      }
      if (filters?.setor_id) {
        query = query.eq('setor_id', filters.setor_id);
      }

      const { data, error } = await query;
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          return [] as Tank[];
        }
        const cached = await getCachedTanques(effectiveFazendaId, filters?.setor_id);
        if (cached) return cached;
        throw error;
      }
      const rows = data as Tank[];
      await cacheTanques(rows, effectiveFazendaId, filters?.setor_id);
      return rows;
    },
  });
};

export const useCreateTank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tank: Omit<Tank, 'id' | 'created_at' | 'updated_at' | 'fazenda' | 'setor'>) => {
      const { data, error } = await supabase
        .from('tanques_combustivel')
        .insert({
          ...tank,
          saldo_atual: 0,
          custo_medio_atual: 0,
          custo_total_estoque: 0,
        })
        .select('*, fazenda:fazendas(*), setor:setores(*)')
        .single();
      if (error) throw error;
      return data as Tank;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tanques'] });
    },
  });
};

export const useRegisterFuelPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: FuelPurchaseInput) => {
      const { data, error } = await supabase.rpc('register_fuel_purchase', {
        p_tanque_id: input.tanque_id,
        p_litros: input.litros,
        p_preco_litro: input.preco_litro,
        p_observacoes: input.observacoes ?? null,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tanques'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes_tanque'] });
    },
  });
};

export const useFuelTractor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: FuelTractorInput) => {
      const { data, error } = await supabase.rpc('fuel_tractor', {
        p_tanque_id: input.tanque_id,
        p_trator_id: input.trator_id,
        p_operador_id: input.operador_id ?? null,
        p_litros: input.litros,
        p_horimetro_inicial: input.horimetro_inicial ?? null,
        p_horimetro_final: input.horimetro_final ?? null,
        p_data_abastecimento: input.data_abastecimento?.toISOString() ?? new Date().toISOString(),
        p_observacoes: input.observacoes ?? null,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tanques'] });
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] });
      queryClient.invalidateQueries({ queryKey: ['tratores'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes_tanque'] });
      queryClient.invalidateQueries({ queryKey: ['vw_eficiencia_tratores'] });
      queryClient.invalidateQueries({ queryKey: ['vw_consumo_frota'] });
      queryClient.invalidateQueries({ queryKey: ['vw_custos_frota'] });
    },
  });
};
