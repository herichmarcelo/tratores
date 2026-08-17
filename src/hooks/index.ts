import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { hashPassword } from '../utils/password'
import { mapPerfilToFuncao, mapUsuarioRow, type UsuarioRow } from '../utils/usuario'
import { useFazendaScope } from './useFazendaScope'
import { cacheTratores, getCachedTratores } from '../services/offline/cache'
import { isBrowserOnline } from '../utils/network'
import type { Tractor, Abastecimento, Checklist, Manutencao, Pneu, Fazenda, Setor, User, VwEficienciaTratores, VwConsumoFrota, VwCustosFrota, VwChecklistsPendentes, VwManutencoesAbertas } from '../types'

// Tratores
export const useTratores = () => {
  const { scopedFazendaId } = useFazendaScope()
  return useQuery({
    queryKey: ['tratores', scopedFazendaId ?? 'all'],
    queryFn: async () => {
      if (!isBrowserOnline()) {
        const cached = await getCachedTratores(scopedFazendaId)
        if (cached) return cached
      }

      let query = supabase
        .from('tratores')
        .select('*, fazenda:fazendas(*)')
        .order('patrimonio')
      if (scopedFazendaId) {
        query = query.eq('fazenda_id', scopedFazendaId)
      }
      const { data, error } = await query
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          return [] as Tractor[]
        }
        const cached = await getCachedTratores(scopedFazendaId)
        if (cached) return cached
        throw error
      }
      const rows = data as Tractor[]
      await cacheTratores(rows, scopedFazendaId)
      return rows
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
  const { scopedFazendaId } = useFazendaScope()
  return useQuery({
    queryKey: ['abastecimentos', scopedFazendaId ?? 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('abastecimentos')
        .select('*, trator:tratores(*), operador:usuarios(*)')
        .order('data_abastecimento', { ascending: false })
      if (error) throw error
      const rows = data as Abastecimento[]
      if (!scopedFazendaId) return rows
      return rows.filter((a) => a.trator?.fazenda_id === scopedFazendaId)
    },
  })
}

// Checklists
export const useChecklists = () => {
  const { scopedFazendaId } = useFazendaScope()
  return useQuery({
    queryKey: ['checklists', scopedFazendaId ?? 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select('*, trator:tratores(*), operador:usuarios(*)')
        .order('data_checklist', { ascending: false })
      if (error) throw error
      const rows = data as Checklist[]
      if (!scopedFazendaId) return rows
      return rows.filter((c) => c.trator?.fazenda_id === scopedFazendaId)
    },
  })
}

// Manutenções
export const useManutencoes = () => {
  const { scopedFazendaId } = useFazendaScope()
  return useQuery({
    queryKey: ['manutencoes', scopedFazendaId ?? 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manutencoes')
        .select('*, trator:tratores(*)')
        .order('data_manutencao', { ascending: false })
      if (error) throw error
      const rows = data as Manutencao[]
      if (!scopedFazendaId) return rows
      return rows.filter((m) => m.trator?.fazenda_id === scopedFazendaId)
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
  const { scopedFazendaId } = useFazendaScope()
  return useQuery({
    queryKey: ['fazendas', scopedFazendaId ?? 'all'],
    queryFn: async () => {
      let query = supabase.from('fazendas').select('*').order('nome')
      if (scopedFazendaId) {
        query = query.eq('id', scopedFazendaId)
      }
      const { data, error } = await query
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          return [] as Fazenda[]
        }
        throw error
      }
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
        .select('id, nome_completo, email, funcao, foto_url, ativo, fazenda_id, created_at')
        .order('nome_completo')
      if (error) throw error
      return (data as UsuarioRow[]).map(mapUsuarioRow)
    },
  })
}

// Setores
export const useSetores = () => {
  const { scopedFazendaId } = useFazendaScope()
  return useQuery({
    queryKey: ['setores', scopedFazendaId ?? 'all'],
    queryFn: async () => {
      let query = supabase.from('setores').select('*, fazenda:fazendas(*)').order('nome')
      if (scopedFazendaId) {
        query = query.eq('fazenda_id', scopedFazendaId)
      }
      const { data, error } = await query
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          return [] as Setor[]
        }
        throw error
      }
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
        fazenda_id: input.fazenda_id || null,
      }
      const { data, error } = await supabase
        .from('usuarios')
        .insert(payload)
        .select('id, nome_completo, email, funcao, foto_url, ativo, fazenda_id, created_at')
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
      if (updates.fazenda_id !== undefined) payload.fazenda_id = updates.fazenda_id || null
      if (senha) payload.senha = await hashPassword(senha)
      const { data, error } = await supabase
        .from('usuarios')
        .update(payload)
        .eq('id', id)
        .select('id, nome_completo, email, funcao, foto_url, ativo, fazenda_id, created_at')
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

export {
  useTanques,
  useCreateTank,
  useRegisterFuelPurchase,
  useFuelTractor,
} from './tanques'
export type { TanqueFilters } from './tanques'

export {
  useRegisterManutencaoPreventiva,
  useCreateManutencao,
  useUpdateTratorManutencaoConfig,
} from './manutencao'
export type { RegisterManutencaoPreventivaInput, CreateManutencaoInput } from './manutencao'

export { useManutencaoAlerts } from './useManutencaoAlerts'
export { useFazendaScope } from './useFazendaScope'
export { useOnlineStatus } from './useOnlineStatus'
export { useOfflineSync } from './useOfflineSync'
export { useInstallPrompt } from './useInstallPrompt'
export { useOfflineFuelTractor, useOfflineCreateChecklist } from './useOfflineMutations'
export type { OfflineSaveResult } from './useOfflineMutations'
