import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { AlertaManutencao, Tractor } from '../types';
import { buildAlertaManutencao } from '../utils/manutencaoAlerts';
import { useFazendaScope } from './useFazendaScope';

export const useManutencaoAlerts = () => {
  const { scopedFazendaId } = useFazendaScope();

  const { data: tratores, isLoading } = useQuery({
    queryKey: ['tratores', scopedFazendaId ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('tratores')
        .select('*, fazenda:fazendas(*)')
        .order('patrimonio');
      if (scopedFazendaId) {
        query = query.eq('fazenda_id', scopedFazendaId);
      }
      const { data, error } = await query;
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          return [] as Tractor[];
        }
        throw error;
      }
      return data as Tractor[];
    },
  });

  const alertas = useMemo<AlertaManutencao[]>(() => {
    if (!tratores) return [];
    return tratores
      .filter((t) => t.alerta_manutencao_ativo !== false && t.status === 'ativo')
      .map((trator) => buildAlertaManutencao(trator))
      .sort((a, b) => a.horas_restantes - b.horas_restantes);
  }, [tratores]);

  return {
    alertas,
    alertasCriticos: alertas.filter((a) => a.nivel === 'vermelho' || a.nivel === 'laranja'),
    alertasAtencao: alertas.filter((a) => a.nivel === 'amarelo'),
    isLoading,
  };
};
