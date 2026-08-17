import type { Tank, Tractor } from '../../types';
import { getOfflineDb } from './db';

const tratoresKey = (scopedFazendaId?: string) => scopedFazendaId ?? 'all';
const tanquesKey = (fazendaId?: string, setorId?: string) =>
  `${fazendaId ?? 'all'}:${setorId ?? 'all'}`;

export const cacheTratores = async (data: Tractor[], scopedFazendaId?: string) => {
  const db = await getOfflineDb();
  await db.put('cache_tratores', {
    key: tratoresKey(scopedFazendaId),
    data,
    updatedAt: new Date().toISOString(),
  });
};

export const getCachedTratores = async (scopedFazendaId?: string): Promise<Tractor[] | null> => {
  const db = await getOfflineDb();
  const entry = await db.get('cache_tratores', tratoresKey(scopedFazendaId));
  return (entry?.data as Tractor[] | undefined) ?? null;
};

export const cacheTanques = async (
  data: Tank[],
  fazendaId?: string,
  setorId?: string,
) => {
  const db = await getOfflineDb();
  await db.put('cache_tanques', {
    key: tanquesKey(fazendaId, setorId),
    data,
    updatedAt: new Date().toISOString(),
  });
};

export const getCachedTanques = async (
  fazendaId?: string,
  setorId?: string,
): Promise<Tank[] | null> => {
  const db = await getOfflineDb();
  const entry = await db.get('cache_tanques', tanquesKey(fazendaId, setorId));
  return (entry?.data as Tank[] | undefined) ?? null;
};

/** Atualiza saldo local do tanque após abastecimento offline (estimativa) */
export const adjustCachedTankSaldo = async (
  tanqueId: string,
  litros: number,
  fazendaId?: string,
  setorId?: string,
) => {
  const cached = await getCachedTanques(fazendaId, setorId);
  if (!cached) return;
  const updated = cached.map((t) =>
    t.id === tanqueId
      ? { ...t, saldo_atual: Math.max(0, (t.saldo_atual ?? 0) - litros) }
      : t,
  );
  await cacheTanques(updated, fazendaId, setorId);
};
