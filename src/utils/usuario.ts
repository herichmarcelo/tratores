import type { User, UserProfile } from '../types';
import { verifyPassword } from './password';

export type UsuarioRow = {
  id: string;
  nome_completo?: string | null;
  nome?: string | null;
  email: string;
  senha?: string | null;
  senha_hash?: string | null;
  funcao?: string | null;
  perfil?: UserProfile | null;
  cargo?: string | null;
  foto_url?: string | null;
  ativo?: boolean | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
};

export const mapFuncaoToPerfil = (funcao?: string | null): UserProfile => {
  const value = (funcao || '').toLowerCase();
  if (value === 'colaborador' || value === 'operador' || value === 'collaborator') return 'colaborador';
  if (value === 'gestor') return 'gestor';
  return 'administrador';
};

export const mapPerfilToFuncao = (perfil: UserProfile): string => {
  if (perfil === 'colaborador') return 'colaborador';
  if (perfil === 'gestor') return 'gestor';
  return 'admin';
};

export const mapUsuarioRow = (row: UsuarioRow): User => ({
  id: row.id,
  nome: row.nome_completo || row.nome || '',
  email: row.email,
  cargo: row.cargo || undefined,
  perfil: row.perfil || mapFuncaoToPerfil(row.funcao),
  foto_url: row.foto_url || undefined,
  ativo: row.ativo ?? true,
  created_at: (row.created_at || new Date()) as Date,
  updated_at: row.updated_at as Date | undefined,
});

export const verifyStoredPassword = async (password: string, stored?: string | null): Promise<boolean> => {
  if (!stored) return false;
  if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
    return verifyPassword(password, stored);
  }
  return password === stored;
};
