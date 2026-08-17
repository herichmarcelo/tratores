import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Manutencao, ManutencaoTipo, Tractor } from '../types';

export interface CreateManutencaoInput {
  trator_id: string;
  tipo: ManutencaoTipo;
  data_manutencao?: Date | string;
  horimetro_no_momento: number;
  valor?: number;
  descricao?: string;
  observacoes?: string;
  responsavel_id?: string;
}

export interface RegisterManutencaoPreventivaInput {
  trator_id: string;
  data_manutencao?: Date;
  horimetro_no_momento: number;
  valor?: number;
  descricao?: string;
  observacoes?: string;
  responsavel_id?: string;
}

export const useCreateManutencao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateManutencaoInput) => {
      const dataManutencao = input.data_manutencao instanceof Date
        ? input.data_manutencao.toISOString()
        : input.data_manutencao ?? new Date().toISOString();

      const { data, error } = await supabase
        .from('manutencoes')
        .insert({
          trator_id: input.trator_id,
          tipo: input.tipo,
          data_manutencao: dataManutencao,
          horimetro_no_momento: input.horimetro_no_momento,
          valor: input.valor ?? null,
          descricao: input.descricao ?? null,
          observacoes: input.observacoes ?? null,
          responsavel_id: input.responsavel_id ?? null,
          status: 'concluida',
        })
        .select('*, trator:tratores(*)')
        .single();

      if (error) throw error;
      return data as Manutencao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      queryClient.invalidateQueries({ queryKey: ['vw_manutencoes_abertas'] });
      queryClient.invalidateQueries({ queryKey: ['vw_custos_frota'] });
    },
  });
};

export const useRegisterManutencaoPreventiva = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterManutencaoPreventivaInput) => {
      const { data: manutencao, error: insertError } = await supabase
        .from('manutencoes')
        .insert({
          trator_id: input.trator_id,
          tipo: 'preventiva',
          data_manutencao: input.data_manutencao?.toISOString() ?? new Date().toISOString(),
          horimetro_no_momento: input.horimetro_no_momento,
          valor: input.valor ?? null,
          descricao: input.descricao ?? 'Manutenção preventiva',
          observacoes: input.observacoes ?? null,
          responsavel_id: input.responsavel_id ?? null,
          status: 'concluida',
        })
        .select('*, trator:tratores(*)')
        .single();

      if (insertError) throw insertError;

      const { data: trator, error: updateError } = await supabase
        .from('tratores')
        .update({
          horimetro_ultima_manutencao: input.horimetro_no_momento,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.trator_id)
        .select('*, fazenda:fazendas(*)')
        .single();

      if (updateError) throw updateError;

      return { manutencao: manutencao as Manutencao, trator: trator as Tractor };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      queryClient.invalidateQueries({ queryKey: ['tratores'] });
      queryClient.invalidateQueries({ queryKey: ['vw_manutencoes_abertas'] });
      queryClient.invalidateQueries({ queryKey: ['vw_custos_frota'] });
    },
  });
};

export const useUpdateTratorManutencaoConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      intervalo_manutencao_horas,
      alerta_manutencao_ativo,
    }: Pick<Tractor, 'id'> & Partial<Pick<Tractor, 'intervalo_manutencao_horas' | 'alerta_manutencao_ativo'>>) => {
      const { data, error } = await supabase
        .from('tratores')
        .update({
          intervalo_manutencao_horas,
          alerta_manutencao_ativo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, fazenda:fazendas(*)')
        .single();

      if (error) throw error;
      return data as Tractor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tratores'] });
    },
  });
};
