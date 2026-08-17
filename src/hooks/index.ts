import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { hashPassword } from '../utils/password'
import { mapPerfilToFuncao, mapUsuarioRow, type UsuarioRow } from '../utils/usuario'
import type { Tractor, Abastecimento, Checklist, Manutencao, Pneu, Fazenda, Setor, User, VwEficienciaTratores, VwConsumoFrota, VwCustosFrota, VwChecklistsPendentes, VwManutencoesAbertas } from '../types'

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
        .select('id, nome_completo, email, funcao, foto_url, ativo, created_at')
        .order('nome_completo')
      if (error) throw error
      return (data as UsuarioRow[]).map(mapUsuarioRow)
    },
  })
}

// Setores
export const useSetores = () => {
  return useQuery({
    queryKey: ['setores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('setores')
        .select('*, fazenda:fazendas(*)')
        .order('nome')
      if (error) throw error
      return data as Setor[]
    },
  })
}

export const useCreateUsuario = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<User, 'id' | 'created_at' | 'updated_at'> & { senha: string }) => {
      const senhaHash = await hashPassword(input.senha)
      const payload = {
        nome_completo: input.nome.trim(),
        email: input.email.trim().toLowerCase(),
        senha: senhaHash,
        funcao: mapPerfilToFuncao(input.perfil),
        foto_url: input.foto_url || null,
        ativo: input.ativo ?? true,
      }
      const { data, error } = await supabase
        .from('usuarios')
        .insert(payload)
        .select('id, nome_completo, email, funcao, foto_url, ativo, created_at')
        .single()
      if (error) throw error
      return mapUsuarioRow(data as UsuarioRow)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })
}

export const useUpdateUsuario = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, senha, ...updates }: Partial<User> & { id: string; senha?: string }) => {
      const payload: Record<string, unknown> = {}
      if (updates.nome !== undefined) payload.nome_completo = updates.nome.trim()
      if (updates.email) payload.email = updates.email.trim().toLowerCase()
      if (updates.foto_url !== undefined) payload.foto_url = updates.foto_url
      if (updates.ativo !== undefined) payload.ativo = updates.ativo
      if (updates.perfil) payload.funcao = mapPerfilToFuncao(updates.perfil)
      if (senha) payload.senha = await hashPassword(senha)
      const { data, error } = await supabase
        .from('usuarios')
        .update(payload)
        .eq('id', id)
        .select('id, nome_completo, email, funcao, foto_url, ativo, created_at')
        .single()
      if (error) throw error
      return mapUsuarioRow(data as UsuarioRow)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })
}

export const useCreateFazenda = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (fazenda: Omit<Fazenda, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('fazendas')
        .insert(fazenda)
        .select()
        .single()
      if (error) throw error
      return data as Fazenda
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fazendas'] })
    },
  })
}

export const useCreateSetor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (setor: Omit<Setor, 'id' | 'created_at' | 'updated_at' | 'fazenda'>) => {
      const { data, error } = await supabase
        .from('setores')
        .insert(setor)
        .select('*, fazenda:fazendas(*)')
        .single()
      if (error) throw error
      return data as Setor
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setores'] })
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

export const useCreateTrator = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (trator: Omit<Tractor, 'id' | 'created_at' | 'updated_at' | 'fazenda'>) => {
      const { data, error } = await supabase
        .from('tratores')
        .insert(trator)
        .select('*, fazenda:fazendas(*)')
        .single()
      if (error) throw error
      return data as Tractor
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tratores'] })
      queryClient.invalidateQueries({ queryKey: ['vw_eficiencia_tratores'] })
    },
  })
}

export const useUpdateTrator = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...trator }: Partial<Tractor> & { id: string }) => {
      const { data, error } = await supabase
        .from('tratores')
        .update(trator)
        .eq('id', id)
        .select('*, fazenda:fazendas(*)')
        .single()
      if (error) throw error
      return data as Tractor
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tratores'] })
      queryClient.invalidateQueries({ queryKey: ['vw_eficiencia_tratores'] })
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

export const useCreateChecklist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (checklist: Omit<Checklist, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('checklists')
        .insert(checklist)
        .select('*, trator:tratores(*), operador:usuarios(*)')
        .single()
      if (error) throw error
      return data as Checklist
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] })
    },
  })
}
