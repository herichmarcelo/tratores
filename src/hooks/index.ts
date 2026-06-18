import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import type { Tractor, Abastecimento, Checklist, Manutencao, Pneu, Fazenda, User, VwEficienciaTratores, VwConsumoFrota, VwCustosFrota, VwChecklistsPendentes, VwManutencoesAbertas } from '../types'

// Tratores
export const useTratores = () => {
  return useQuery({
    queryKey: ['tratores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tratores')
        .select('*, fazenda:fazendas(*)')
        .order('patrimonio')
      if (error) throw error
      return data as Tractor[]
    },
  })
}

export const useTrator = (id: string) => {
  return useQuery({
    queryKey: ['tratores', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tratores')
        .select('*, fazenda:fazendas(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Tractor
    },
    enabled: !!id,
  })
}

// Abastecimentos
export const useAbastecimentos = () => {
  return useQuery({
    queryKey: ['abastecimentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('abastecimentos')
        .select('*, trator:tratores(*), operador:usuarios(*)')
        .order('data_abastecimento', { ascending: false })
      if (error) throw error
      return data as Abastecimento[]
    },
  })
}

// Checklists
export const useChecklists = () => {
  return useQuery({
    queryKey: ['checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select('*, trator:tratores(*), operador:usuarios(*)')
        .order('data_checklist', { ascending: false })
      if (error) throw error
      return data as Checklist[]
    },
  })
}

// Manutenções
export const useManutencoes = () => {
  return useQuery({
    queryKey: ['manutencoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manutencoes')
        .select('*, trator:tratores(*)')
        .order('data_manutencao', { ascending: false })
      if (error) throw error
      return data as Manutencao[]
    },
  })
}

// Pneus
export const usePneus = () => {
  return useQuery({
    queryKey: ['pneus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pneus')
        .select('*, trator:tratores(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Pneu[]
    },
  })
}

// Fazendas
export const useFazendas = () => {
  return useQuery({
    queryKey: ['fazendas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fazendas')
        .select('*')
        .order('nome')
      if (error) throw error
      return data as Fazenda[]
    },
  })
}

// Usuários
export const useUsuarios = () => {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome')
      if (error) throw error
      return data as User[]
    },
  })
}

// Views - Analytics
export const useVwEficienciaTratores = () => {
  return useQuery({
    queryKey: ['vw_eficiencia_tratores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_eficiencia_tratores')
        .select('*')
      if (error) throw error
      return data as VwEficienciaTratores[]
    },
  })
}

export const useVwConsumoFrota = () => {
  return useQuery({
    queryKey: ['vw_consumo_frota'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_consumo_frota')
        .select('*')
      if (error) throw error
      return data as VwConsumoFrota[]
    },
  })
}

export const useVwCustosFrota = () => {
  return useQuery({
    queryKey: ['vw_custos_frota'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_custos_frota')
        .select('*')
      if (error) throw error
      return data as VwCustosFrota[]
    },
  })
}

export const useVwChecklistsPendentes = () => {
  return useQuery({
    queryKey: ['vw_checklists_pendentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_checklists_pendentes')
        .select('*')
      if (error) throw error
      return data as VwChecklistsPendentes[]
    },
  })
}

export const useVwManutencoesAbertas = () => {
  return useQuery({
    queryKey: ['vw_manutencoes_abertas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_manutencoes_abertas')
        .select('*')
      if (error) throw error
      return data as VwManutencoesAbertas[]
    },
  })
}

// Mutations (exemplo)
export const useCreateAbastecimento = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (abastecimento: Omit<Abastecimento, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('abastecimentos')
        .insert(abastecimento)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] })
    },
  })
}
