import { useAuth } from '../contexts/AuthContext';
import { isAdministrador } from '../utils/permissions';

/** Escopo de fazenda: administrador vê tudo; gestor/colaborador só a fazenda vinculada */
export const useFazendaScope = () => {
  const { user } = useAuth();
  const perfil = user?.perfil;
  const fazendaId = user?.fazenda_id;
  const scopedFazendaId = isAdministrador(perfil) ? undefined : fazendaId;

  const belongsToScope = (entityFazendaId?: string | null): boolean => {
    if (isAdministrador(perfil)) return true;
    if (!scopedFazendaId) return false;
    return entityFazendaId === scopedFazendaId;
  };

  const filterByFazenda = <T extends { fazenda_id?: string | null }>(items: T[]): T[] => {
    if (!scopedFazendaId) return items;
    return items.filter((item) => item.fazenda_id === scopedFazendaId);
  };

  return {
    perfil,
    fazendaId,
    scopedFazendaId,
    isScoped: !!scopedFazendaId,
    belongsToScope,
    filterByFazenda,
  };
};
