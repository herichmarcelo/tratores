import type { UserProfile } from '../types';

export type AppRole = 'administrador' | 'gestor' | 'colaborador';

export const isAdministrador = (perfil?: UserProfile | string) => perfil === 'administrador';
export const isGestor = (perfil?: UserProfile | string) => perfil === 'gestor';
export const isColaborador = (perfil?: UserProfile | string) => perfil === 'colaborador';

/** Admin + Gestor — acesso operacional à frota */
export const canAccessGestao = (perfil?: UserProfile | string) =>
  isAdministrador(perfil) || isGestor(perfil);

/** Rotas exclusivas do administrador global */
export const ADMIN_ONLY_PATHS = ['/configuracoes', '/usuarios'] as const;

/** Rotas para admin + gestor (filtradas por fazenda no gestor) */
export const GESTAO_PATHS = [
  '/dashboard',
  '/tratores',
  '/manutencao',
  '/compra-combustivel',
  '/relatorios',
] as const;

/** Colaborador: abastecimento, checklists e status offline */
export const COLABORADOR_PATHS = ['/abastecimento', '/checklists', '/offline'] as const;

export const canAccessPath = (perfil: UserProfile | undefined, path: string): boolean => {
  if (!perfil) return false;
  if (isAdministrador(perfil)) return true;
  if (isGestor(perfil)) {
    return !ADMIN_ONLY_PATHS.some((p) => path.startsWith(p));
  }
  if (isColaborador(perfil)) {
    return COLABORADOR_PATHS.some((p) => path.startsWith(p));
  }
  return false;
};

export const getDefaultPathForPerfil = (perfil: UserProfile): string => {
  if (isColaborador(perfil)) return '/abastecimento';
  return '/dashboard';
};

export const perfilLabels: Record<UserProfile, string> = {
  administrador: 'Administrador',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
};
